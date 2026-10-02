/**
 * Adaptador do Asaas (spec 49 D49-08, T-49.3.1): API REST v3 por `fetch`, sem SDK (como a Foca IA e a Resend).
 * Checkout hospedado: o cartão e os dados do pagador (nome, CPF, endereço) ficam no Asaas, nunca no Foca (DV49-03).
 *
 * Nunca registra em log a chave, o corpo das respostas nem dado do pagador: só o status HTTP e o caminho.
 */
import { PRODUTOS, type ProdutoAssinatura } from "@/lib/planos";
import { log } from "../http";
import type { AssinaturaExterna, CheckoutExterno, CobrancaExterna, EventoDePagamento, PedidoDeCheckout, Provedor, StatusCobranca } from "./tipos";

const NOME_DO_ITEM: Record<string, { nome: string; descricao: string }> = {
  basic_mensal: { nome: "Foca Basic mensal", descricao: "Plano Basic do Foca, renovação mensal" },
  basic_anual: { nome: "Foca Basic anual", descricao: "Plano Basic do Foca, 12 meses" },
  pro_mensal: { nome: "Foca Pro mensal", descricao: "Plano Pro do Foca, renovação mensal" },
  pro_anual: { nome: "Foca Pro anual", descricao: "Plano Pro do Foca, 12 meses" },
  protetor_1: { nome: "1 protetor de sequência", descricao: "Protetor de sequência do Foca" },
  protetor_3: { nome: "3 protetores de sequência", descricao: "Pacote de protetores de sequência do Foca" },
  protetor_7: { nome: "7 protetores de sequência", descricao: "Pacote de protetores de sequência do Foca" },
};

/** Status de cobrança do Asaas → estado interno. Desconhecido conta como pendente (nada é liberado por engano). */
export function statusDaCobranca(s: string | undefined): StatusCobranca {
  switch (s) {
    case "CONFIRMED":
    case "RECEIVED":
    case "RECEIVED_IN_CASH":
      return "paga";
    case "OVERDUE":
      return "atrasada";
    case "REFUNDED":
    case "REFUND_REQUESTED":
    case "REFUND_IN_PROGRESS":
      return "reembolsada";
    case "CHARGEBACK_REQUESTED":
    case "CHARGEBACK_DISPUTE":
    case "AWAITING_CHARGEBACK_REVERSAL":
      return "estornada";
    case "DELETED":
      return "cancelada";
    default:
      return "pendente";
  }
}

function metodo(billingType: string | undefined): CobrancaExterna["metodo"] {
  if (billingType === "CREDIT_CARD" || billingType === "DEBIT_CARD") return "cartao";
  if (billingType === "PIX") return "pix";
  if (billingType === "BOLETO") return "boleto";
  return null;
}

function texto(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 && v.length < 200 ? v : null;
}

/** Normaliza o corpo de um webhook do Asaas: só ids e tipo. */
export function eventoDoAsaas(corpo: unknown): EventoDePagamento | null {
  if (!corpo || typeof corpo !== "object") return null;
  const c = corpo as Record<string, unknown>;
  const id = texto(c.id);
  const tipo = texto(c.event);
  if (!id || !tipo) return null;
  const idDe = (o: unknown) => (o && typeof o === "object" ? texto((o as Record<string, unknown>).id) : null);
  return { id, tipo, cobrancaId: idDe(c.payment), assinaturaId: idDe(c.subscription), checkoutId: idDe(c.checkout) };
}

function dataDe(v: unknown): Date | null {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T12:00:00Z` : v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function criarAsaas(apiUrl: string, chave: string, fetcher: typeof fetch = fetch): Provedor {
  const base = apiUrl.replace(/\/+$/, "");

  async function chamar(metodoHttp: string, caminho: string, corpo?: unknown): Promise<{ status: number; json: Record<string, unknown> | null }> {
    const r = await fetcher(`${base}${caminho}`, {
      method: metodoHttp,
      headers: { access_token: chave, "content-type": "application/json", "user-agent": "foca-app" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: AbortSignal.timeout(15_000),
    });
    let json: Record<string, unknown> | null = null;
    try {
      json = (await r.json()) as Record<string, unknown>;
    } catch {
      json = null;
    }
    if (!r.ok && r.status !== 404) log("aviso", "pagamentos.asaas_erro", { status: r.status, caminho: caminho.split("/").slice(0, 2).join("/") });
    return { status: r.status, json };
  }

  return {
    nome: "asaas",

    async criarCheckout(p: PedidoDeCheckout) {
      const produto = PRODUTOS[p.produto];
      const item = NOME_DO_ITEM[p.produto];
      const corpo: Record<string, unknown> = {
        billingTypes: [p.metodo === "pix" ? "PIX" : "CREDIT_CARD"],
        minutesToExpire: 60,
        callback: { successUrl: p.urls.sucesso, cancelUrl: p.urls.cancelado, expiredUrl: p.urls.expirado },
        items: [{ name: item.nome, description: item.descricao, quantity: 1, value: produto.centavos / 100 }],
        externalReference: p.compraId,
      };
      const recorrente = produto.tipo === "assinatura" && p.metodo === "cartao";
      if (recorrente) {
        const amanha = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
        corpo.chargeTypes = ["RECURRENT"];
        corpo.subscription = { cycle: (produto as ProdutoAssinatura).periodo === "anual" ? "YEARLY" : "MONTHLY", nextDueDate: `${amanha} 00:00:00` };
      } else {
        corpo.chargeTypes = ["DETACHED"];
      }
      const r = await chamar("POST", "/checkouts", corpo);
      const id = texto(r.json?.id);
      const link = texto(r.json?.link);
      if (r.status !== 200 || !id || !link) throw new Error(`[asaas] checkout recusado (HTTP ${r.status})`);
      return { checkoutId: id, link };
    },

    async buscarCobranca(id: string): Promise<CobrancaExterna | null> {
      const r = await chamar("GET", `/payments/${encodeURIComponent(id)}`);
      if (r.status === 404 || !r.json) return null;
      if (r.status !== 200) throw new Error(`[asaas] cobrança indisponível (HTTP ${r.status})`);
      const j = r.json;
      const valor = typeof j.value === "number" ? Math.round(j.value * 100) : 0;
      return {
        id: texto(j.id) ?? id,
        status: statusDaCobranca(texto(j.status) ?? undefined),
        valorCentavos: valor,
        metodo: metodo(texto(j.billingType) ?? undefined),
        vencimento: texto(j.dueDate),
        pagaEm: dataDe(j.confirmedDate) ?? dataDe(j.paymentDate) ?? dataDe(j.clientPaymentDate),
        assinaturaId: texto(j.subscription),
        referencia: texto(j.externalReference),
        checkoutId: texto(j.checkoutSession),
      };
    },

    async buscarAssinatura(id: string): Promise<AssinaturaExterna | null> {
      const r = await chamar("GET", `/subscriptions/${encodeURIComponent(id)}`);
      if (r.status === 404 || !r.json) return null;
      if (r.status !== 200) throw new Error(`[asaas] assinatura indisponível (HTTP ${r.status})`);
      const j = r.json;
      return {
        id: texto(j.id) ?? id,
        ativa: j.status === "ACTIVE" && j.deleted !== true,
        referencia: texto(j.externalReference),
        checkoutId: texto(j.checkoutSession),
      };
    },

    async buscarCheckout(id: string): Promise<CheckoutExterno | null> {
      const r = await chamar("GET", `/checkouts/${encodeURIComponent(id)}`);
      if (r.status === 404 || !r.json) return null;
      if (r.status !== 200) throw new Error(`[asaas] checkout indisponível (HTTP ${r.status})`);
      const s = texto(r.json.status);
      return {
        id,
        referencia: texto(r.json.externalReference),
        status: s === "PAID" ? "pago" : s === "EXPIRED" ? "expirado" : s === "CANCELED" ? "cancelado" : "aberto",
      };
    },

    async cancelarAssinatura(id: string) {
      const r = await chamar("DELETE", `/subscriptions/${encodeURIComponent(id)}`);
      if (r.status !== 200 && r.status !== 404) throw new Error(`[asaas] cancelamento recusado (HTTP ${r.status})`);
    },

    async reembolsarCobranca(id: string) {
      const r = await chamar("POST", `/payments/${encodeURIComponent(id)}/refund`, {});
      if (r.status !== 200) throw new Error(`[asaas] reembolso recusado (HTTP ${r.status})`);
    },
  };
}

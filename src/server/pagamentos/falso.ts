/**
 * Provedor de pagamento falso (spec 49 T-49.3.1): desenvolvimento local e testes. Nunca é usado num ambiente
 * implantado (`provedor.ts` recusa). Guarda tudo em memória do processo e permite simular o pagamento de uma compra,
 * do mesmo jeito que o Asaas faria (cobrança paga, assinatura criada).
 */
import { randomUUID } from "node:crypto";
import { PRODUTOS, type CodigoProduto } from "@/lib/planos";
import type { AssinaturaExterna, CheckoutExterno, CobrancaExterna, PedidoDeCheckout, Provedor } from "./tipos";

interface CheckoutFalso {
  id: string;
  compraId: string;
  produto: CodigoProduto;
  metodo: "cartao" | "pix";
  status: CheckoutExterno["status"];
}

const checkouts = new Map<string, CheckoutFalso>();
const cobrancas = new Map<string, CobrancaExterna>();
const assinaturas = new Map<string, AssinaturaExterna>();

export const provedorFalso: Provedor = {
  nome: "teste",
  async criarCheckout(p: PedidoDeCheckout) {
    const id = `chk_teste_${randomUUID()}`;
    checkouts.set(id, { id, compraId: p.compraId, produto: p.produto, metodo: p.metodo, status: "aberto" });
    return { checkoutId: id, link: `/planos/retorno?compra=${encodeURIComponent(p.compraId)}&teste=1` };
  },
  async buscarCobranca(id) {
    return cobrancas.get(id) ?? null;
  },
  async buscarAssinatura(id) {
    return assinaturas.get(id) ?? null;
  },
  async buscarCheckout(id) {
    const c = checkouts.get(id);
    return c ? { id: c.id, referencia: c.compraId, status: c.status } : null;
  },
  async cancelarAssinatura(id) {
    const a = assinaturas.get(id);
    if (a) a.ativa = false;
  },
  async reembolsarCobranca(id) {
    const c = cobrancas.get(id);
    if (c) c.status = "reembolsada";
  },
};

/**
 * Simula o pagamento do checkout de uma compra (só testes e desenvolvimento local): cria a cobrança (paga ou
 * recusada) e, para assinatura no cartão, a assinatura recorrente. Devolve os ids, como o Asaas mandaria no webhook.
 */
export function simularPagamento(
  compraId: string,
  resultado: "aprovado" | "recusado",
  agora = new Date(),
): { cobrancaId: string; assinaturaId: string | null; checkoutId: string } | null {
  const c = [...checkouts.values()].find((x) => x.compraId === compraId);
  if (!c) return null;
  const produto = PRODUTOS[c.produto];
  const recorrente = produto.tipo === "assinatura" && c.metodo === "cartao";
  const assinaturaId = recorrente ? `sub_teste_${randomUUID()}` : null;
  if (assinaturaId) assinaturas.set(assinaturaId, { id: assinaturaId, ativa: resultado === "aprovado", referencia: compraId, checkoutId: c.id });
  const cobrancaId = `pay_teste_${randomUUID()}`;
  cobrancas.set(cobrancaId, {
    id: cobrancaId,
    status: resultado === "aprovado" ? "paga" : "pendente",
    valorCentavos: produto.centavos,
    metodo: c.metodo,
    vencimento: agora.toISOString().slice(0, 10),
    pagaEm: resultado === "aprovado" ? agora : null,
    assinaturaId,
    referencia: compraId,
    checkoutId: c.id,
  });
  if (resultado === "aprovado") c.status = "pago";
  return { cobrancaId, assinaturaId, checkoutId: c.id };
}

/** Só testes: muda o estado de uma cobrança falsa (atraso, estorno) ou cria a próxima mensalidade. */
export function alterarCobrancaFalsa(id: string, mudanca: Partial<CobrancaExterna>): void {
  const c = cobrancas.get(id);
  if (c) Object.assign(c, mudanca);
}

export function novaCobrancaFalsa(base: CobrancaExterna): string {
  const id = `pay_teste_${randomUUID()}`;
  cobrancas.set(id, { ...base, id });
  return id;
}

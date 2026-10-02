/**
 * Funções de servidor dos planos (spec 49 T-49.3.2, T-49.3.4, T-49.3.5). O `userId` vem só da sessão; o cliente manda
 * no máximo o código do produto e o método — preço e plano vêm do catálogo e das assinaturas no servidor (RF-1).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CODIGOS_DE_PRODUTO, type CodigoProduto, type Plano } from "@/lib/planos";
import { banco } from "@/server/db/client";
import { env } from "@/server/env";
import { checarOrigem, ErroApp, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import {
  cancelarAssinatura as cancelar,
  estadoDaCompra as estado,
  iniciarCheckout as iniciar,
  meuPlano as plano,
  pedirReembolso as reembolsar,
  type MeuPlano,
} from "@/server/pagamentos/acoes";
import { provedorDePagamento, vendaLigada, ehLocal } from "@/server/pagamentos/provedor";

type Erro = { ok: false; codigo: string };

function provedorOuErro() {
  const p = provedorDePagamento();
  if (!p) throw new ErroApp(503, "VENDA_DESLIGADA");
  return p;
}

export const meuPlano = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true; vendaLigada: boolean } & MeuPlano) | Erro> => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    return { ok: true, vendaLigada: vendaLigada(env()), ...(await plano(db, s.userId, new Date())) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

const pedidoCheckout = z.object({
  produto: z.enum(CODIGOS_DE_PRODUTO as [CodigoProduto, ...CodigoProduto[]]),
  metodo: z.enum(["cartao", "pix"]),
  /** D49-09: quem paga declara ser maior de 18 (e responsável, se o aluno for menor). Sem isso, não segue. */
  declaroMaioridade: z.literal(true),
});

export const iniciarCheckout = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoCheckout.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; link: string; compraId: string } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      if (!vendaLigada(env())) throw new ErroApp(503, "VENDA_DESLIGADA");
      const db = await banco();
      await limitar(db, `checkout:${s.userId}`, 600, 10);
      const r = await iniciar(db, provedorOuErro(), s.userId, { produto: data.produto, metodo: data.metodo }, env().BETTER_AUTH_URL, new Date());
      return { ok: true, ...r };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const estadoDaCompra = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ compraId: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true; estado: string; plano: Plano } | Erro> => {
    try {
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `compra-estado:${s.userId}`, 60, 60);
      return { ok: true, ...(await estado(db, s.userId, data.compraId, new Date())) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const cancelarAssinatura = createServerFn({ method: "POST" }).handler(async (): Promise<{ ok: true; validoAte: string | null } | Erro> => {
  try {
    checarOrigem();
    const s = await exigirSessao();
    const db = await banco();
    await limitar(db, `cancelar:${s.userId}`, 600, 5);
    return { ok: true, ...(await cancelar(db, provedorOuErro(), s.userId, env().BETTER_AUTH_URL, new Date())) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

export const pedirReembolso = createServerFn({ method: "POST" }).handler(async (): Promise<{ ok: true } | Erro> => {
  try {
    checarOrigem();
    const s = await exigirSessao();
    const db = await banco();
    await limitar(db, `reembolso:${s.userId}`, 3600, 3);
    await reembolsar(db, provedorOuErro(), s.userId, env().BETTER_AUTH_URL, new Date());
    return { ok: true };
  } catch (e) {
    return respostaDeErro(e);
  }
});

/**
 * Só desenvolvimento local e E2E (provedor falso): simula o pagamento de uma compra do próprio aluno e processa como
 * se o webhook tivesse chegado. Em qualquer ambiente implantado responde 404.
 */
export const simularPagamentoLocal = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ compraId: z.string().uuid(), resultado: z.enum(["aprovado", "recusado"]) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      if (!ehLocal(env())) throw new ErroApp(404, "INEXISTENTE");
      const s = await exigirSessao();
      const db = await banco();
      await estado(db, s.userId, data.compraId, new Date()); // a compra precisa ser deste aluno
      const { simularPagamento, provedorFalso } = await import("@/server/pagamentos/falso");
      const { registrarEProcessar } = await import("@/server/pagamentos/webhook");
      const sim = simularPagamento(data.compraId, data.resultado);
      if (sim && data.resultado === "aprovado") {
        await registrarEProcessar(db, provedorFalso, { id: `evt_local_${sim.cobrancaId}`, tipo: "PAYMENT_CONFIRMED", cobrancaId: sim.cobrancaId, assinaturaId: null, checkoutId: null }, new Date());
      }
      return { ok: true };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

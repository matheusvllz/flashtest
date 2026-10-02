/**
 * Ações do aluno sobre a própria assinatura (spec 49 T-49.3.2, T-49.3.5; RF-1, RF-2, RF-4). Sempre com o `userId` da
 * sessão (quem chama é a função de servidor); nada aqui aceita id de aluno, plano ou preço vindos do cliente.
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { NOME_DO_PRODUTO, PRODUTOS, formatarReais, type CodigoProduto, type Plano } from "@/lib/planos";
import type { Banco } from "../db/client";
import { assinatura, cobranca, compra, user } from "../db/schema";
import { enviarEmail } from "../email";
import { emailCancelamento, emailReembolso } from "../email/modelos";
import { ErroApp } from "../http";
import { planoDoAluno, sincronizarPlanoNoPerfil } from "../planos/plano";
import type { Provedor } from "./tipos";

const DIA_MS = 86_400_000;
/** Reembolso automático: uma vez por plano a cada 90 dias; depois, pelo suporte (abuso de "compra e reembolsa"). */
const JANELA_REEMBOLSO_DIAS = 90;
const ESTADOS_QUE_VALEM = ["ativa", "atrasada", "cancelada"];

export interface ResumoDaAssinatura {
  produto: CodigoProduto;
  estado: string;
  validoAte: string | null;
  renova: boolean;
  reembolsavel: boolean;
}

export interface MeuPlano {
  plano: Plano;
  assinatura: ResumoDaAssinatura | null;
}

/** A assinatura que vale agora (a de maior plano e fim mais distante). */
async function assinaturaVigente(db: Banco, userId: string, agora: Date) {
  const lista = await db
    .select()
    .from(assinatura)
    .where(and(eq(assinatura.userId, userId), inArray(assinatura.estado, ESTADOS_QUE_VALEM), gt(assinatura.validoAte, agora)))
    .orderBy(desc(assinatura.validoAte));
  return lista.sort((a, b) => (a.plano === b.plano ? 0 : a.plano === "pro" ? -1 : 1))[0] ?? null;
}

export async function meuPlano(db: Banco, userId: string, agora: Date): Promise<MeuPlano> {
  const plano = await planoDoAluno(db, userId, agora);
  const a = await assinaturaVigente(db, userId, agora);
  return {
    plano,
    assinatura: a
      ? {
          produto: a.produto as CodigoProduto,
          estado: a.estado,
          validoAte: a.validoAte?.toISOString() ?? null,
          renova: a.estado !== "cancelada" && !!a.idExterno && !a.idExterno.startsWith("cobranca:"),
          reembolsavel: !!a.reembolsavelAte && a.reembolsavelAte.getTime() > agora.getTime(),
        }
      : null,
  };
}

export async function iniciarCheckout(
  db: Banco,
  p: Provedor,
  userId: string,
  pedido: { produto: CodigoProduto; metodo: "cartao" | "pix" },
  baseUrl: string,
  agora: Date,
): Promise<{ compraId: string; link: string }> {
  const produto = PRODUTOS[pedido.produto];
  // Protetores avulsos entram na F7 (T-49.7.3), junto com o crédito no estoque.
  if (produto.tipo !== "assinatura") throw new ErroApp(400, "PRODUTO_INDISPONIVEL");
  // Pix só no anual (pagamento único); o mensal no Pix exigiria Pix Automático (PJ) ou cobrança manual todo mês.
  if (pedido.metodo === "pix" && produto.periodo !== "anual") throw new ErroApp(400, "METODO_INDISPONIVEL");
  const atual = await planoDoAluno(db, userId, agora);
  if (atual === produto.plano || atual === "pro") throw new ErroApp(409, "JA_ASSINANTE");

  const compraId = randomUUID();
  await db.insert(compra).values({ id: compraId, userId, produto: pedido.produto, provedor: p.nome, declarouMaioridadeEm: agora });
  const volta = (r: string) => `${baseUrl}/planos/retorno?compra=${encodeURIComponent(compraId)}&r=${r}`;
  const { checkoutId, link } = await p.criarCheckout({
    compraId,
    produto: pedido.produto,
    metodo: pedido.metodo,
    urls: { sucesso: volta("ok"), cancelado: volta("cancelado"), expirado: volta("expirado") },
  });
  await db.update(compra).set({ checkoutId }).where(eq(compra.id, compraId));
  return { compraId, link };
}

/** Estado de uma compra do PRÓPRIO aluno (para a tela de retorno do checkout). */
export async function estadoDaCompra(db: Banco, userId: string, compraId: string, agora: Date): Promise<{ estado: string; plano: Plano }> {
  const [c] = await db.select({ estado: compra.estado }).from(compra).where(and(eq(compra.id, compraId), eq(compra.userId, userId))).limit(1);
  if (!c) throw new ErroApp(404, "COMPRA_INEXISTENTE");
  return { estado: c.estado, plano: await planoDoAluno(db, userId, agora) };
}

async function emailDoAluno(db: Banco, userId: string): Promise<string | null> {
  const [u] = await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1);
  return u?.email ?? null;
}

/** Cancela a renovação. O plano vale até o fim do período pago; nada do estudo é apagado. */
export async function cancelarAssinatura(db: Banco, p: Provedor, userId: string, baseUrl: string, agora: Date): Promise<{ validoAte: string | null }> {
  const a = await assinaturaVigente(db, userId, agora);
  if (!a || a.estado === "cancelada") throw new ErroApp(409, "SEM_ASSINATURA_ATIVA");
  if (!a.idExterno || a.idExterno.startsWith("cobranca:")) throw new ErroApp(409, "SEM_RENOVACAO");
  await p.cancelarAssinatura(a.idExterno);
  await db.update(assinatura).set({ estado: "cancelada", canceladaEm: agora, atualizadaEm: agora }).where(eq(assinatura.id, a.id));
  await sincronizarPlanoNoPerfil(db, userId, agora);
  const email = await emailDoAluno(db, userId);
  if (email) {
    await enviarEmail(
      emailCancelamento({ para: email, produto: NOME_DO_PRODUTO[a.produto as CodigoProduto] ?? "plano", validoAte: a.validoAte, urlConta: `${baseUrl}/profile` }),
    ).catch(() => undefined);
  }
  return { validoAte: a.validoAte?.toISOString() ?? null };
}

/** Arrependimento de 7 dias (CDC art. 49): reembolso integral automático, uma vez por plano a cada 90 dias. */
export async function pedirReembolso(db: Banco, p: Provedor, userId: string, baseUrl: string, agora: Date): Promise<void> {
  const a = await assinaturaVigente(db, userId, agora);
  if (!a || !a.reembolsavelAte || a.reembolsavelAte.getTime() <= agora.getTime()) throw new ErroApp(409, "FORA_DO_PRAZO");
  const recentes = await db
    .select({ id: assinatura.id })
    .from(assinatura)
    .where(
      and(
        eq(assinatura.userId, userId),
        eq(assinatura.plano, a.plano),
        eq(assinatura.estado, "reembolsada"),
        gt(assinatura.atualizadaEm, new Date(agora.getTime() - JANELA_REEMBOLSO_DIAS * DIA_MS)),
      ),
    );
  if (recentes.length > 0) throw new ErroApp(409, "REEMBOLSO_PELO_SUPORTE");

  const compras = await db.select({ id: compra.id }).from(compra).where(and(eq(compra.userId, userId), eq(compra.assinaturaId, a.id)));
  const ids = compras.map((c) => c.id);
  const [cob] = ids.length
    ? await db
        .select()
        .from(cobranca)
        .where(and(eq(cobranca.userId, userId), inArray(cobranca.compraId, ids), eq(cobranca.estado, "paga")))
        .orderBy(desc(cobranca.pagaEm))
        .limit(1)
    : [];
  if (!cob) throw new ErroApp(409, "SEM_COBRANCA_PAGA");

  await p.reembolsarCobranca(cob.idExterno);
  if (a.idExterno && !a.idExterno.startsWith("cobranca:") && a.estado !== "cancelada") {
    await p.cancelarAssinatura(a.idExterno).catch(() => undefined); // o reembolso já foi; o webhook confirma o resto
  }
  await db.update(cobranca).set({ estado: "reembolsada", reembolsadaEm: agora }).where(eq(cobranca.id, cob.id));
  await db.update(assinatura).set({ estado: "reembolsada", atualizadaEm: agora }).where(eq(assinatura.id, a.id));
  await db.update(compra).set({ estado: "reembolsada" }).where(inArray(compra.id, ids));
  await sincronizarPlanoNoPerfil(db, userId, agora);
  const email = await emailDoAluno(db, userId);
  if (email) {
    await enviarEmail(
      emailReembolso({ para: email, produto: NOME_DO_PRODUTO[a.produto as CodigoProduto] ?? "plano", valor: formatarReais(cob.valorCentavos), urlConta: `${baseUrl}/profile` }),
    ).catch(() => undefined);
  }
}

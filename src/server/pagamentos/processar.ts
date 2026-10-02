/**
 * Máquina de estados de compras, cobranças e assinaturas (spec 49 T-49.3.3; segurança L3).
 *
 * Princípios:
 * - Age só pelo que o provedor CONFIRMA na API (`buscarCobranca`/`buscarAssinatura`), nunca pelo corpo do webhook.
 * - Idempotente: repetir um evento, ou recebê-los fora de ordem, chega ao mesmo estado (os estados finais vencem:
 *   reembolso e estorno não voltam a "ativa"; `valido_ate` só cresce).
 * - Liga o pagamento ao aluno pela COMPRA que o servidor criou (`externalReference` = `compra.id`), pelo checkout de
 *   origem ou pela assinatura já conhecida. Sem compra conhecida, nada é liberado.
 * - Preço conferido: cobrança com valor abaixo do produto da compra não libera nada.
 */
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NOME_DO_PRODUTO, PRODUTOS, ehCodigoDeProduto, formatarReais, type ProdutoAssinatura } from "@/lib/planos";
import type { Banco } from "../db/client";
import { assinatura, cobranca, compra, user } from "../db/schema";
import { enviarEmail } from "../email";
import { emailRecibo } from "../email/modelos";
import { env } from "../env";
import { log } from "../http";
import { sincronizarPlanoNoPerfil } from "../planos/plano";
import type { CobrancaExterna, EventoDePagamento, Provedor } from "./tipos";

const DIA_MS = 86_400_000;
/** Folga depois do fim do período: a renovação pode cair um ou dois dias depois do vencimento. */
const TOLERANCIA_DIAS = 2;
/** Arrependimento (CDC art. 49): 7 dias a partir do primeiro pagamento. */
const ARREPENDIMENTO_DIAS = 7;

export type ResultadoDoEvento =
  | "processado"
  | "sem-compra"
  | "valor-divergente"
  | "cobranca-inexistente"
  | "assinatura-inexistente"
  | "ignorado";

type Compra = typeof compra.$inferSelect;
type Assinatura = typeof assinatura.$inferSelect;

function fimDoPeriodo(base: Date, periodo: "mensal" | "anual"): Date {
  const d = new Date(base.getTime());
  if (periodo === "anual") d.setUTCFullYear(d.getUTCFullYear() + 1);
  else d.setUTCMonth(d.getUTCMonth() + 1);
  return new Date(d.getTime() + TOLERANCIA_DIAS * DIA_MS);
}

async function compraPorId(db: Banco, id: string | null): Promise<Compra | null> {
  if (!id) return null;
  const [c] = await db.select().from(compra).where(eq(compra.id, id)).limit(1);
  return c ?? null;
}

async function compraPorCheckout(db: Banco, provedor: string, checkoutId: string | null): Promise<Compra | null> {
  if (!checkoutId) return null;
  const [c] = await db.select().from(compra).where(and(eq(compra.provedor, provedor), eq(compra.checkoutId, checkoutId))).limit(1);
  return c ?? null;
}

async function assinaturaPorExterno(db: Banco, provedor: string, idExterno: string | null): Promise<Assinatura | null> {
  if (!idExterno) return null;
  const [a] = await db.select().from(assinatura).where(and(eq(assinatura.provedor, provedor), eq(assinatura.idExterno, idExterno))).limit(1);
  return a ?? null;
}

/** A compra de uma cobrança: pela referência, pelo checkout, pela assinatura local ou pela assinatura no provedor. */
async function acharCompra(db: Banco, p: Provedor, cob: CobrancaExterna): Promise<Compra | null> {
  const direta = (await compraPorId(db, cob.referencia)) ?? (await compraPorCheckout(db, p.nome, cob.checkoutId));
  if (direta) return direta;
  const local = await assinaturaPorExterno(db, p.nome, cob.assinaturaId);
  if (local) {
    const [c] = await db.select().from(compra).where(eq(compra.assinaturaId, local.id)).limit(1);
    if (c) return c;
  }
  if (cob.assinaturaId) {
    const externa = await p.buscarAssinatura(cob.assinaturaId);
    if (externa) return (await compraPorId(db, externa.referencia)) ?? (await compraPorCheckout(db, p.nome, externa.checkoutId));
  }
  return null;
}

export async function processarCobranca(db: Banco, p: Provedor, cob: CobrancaExterna, agora: Date): Promise<ResultadoDoEvento> {
  const c = await acharCompra(db, p, cob);
  if (!c || !ehCodigoDeProduto(c.produto)) {
    log("aviso", "pagamentos.sem_compra", { provedor: p.nome });
    return "sem-compra";
  }
  const produto = PRODUTOS[c.produto];
  if (cob.status === "paga" && cob.valorCentavos < produto.centavos) {
    log("aviso", "pagamentos.valor_divergente", { provedor: p.nome, esperado: produto.centavos, recebido: cob.valorCentavos });
    return "valor-divergente";
  }

  const [antes] = await db
    .select({ estado: cobranca.estado })
    .from(cobranca)
    .where(and(eq(cobranca.provedor, p.nome), eq(cobranca.idExterno, cob.id)))
    .limit(1);

  // Cobrança (upsert pelo id no provedor).
  await db
    .insert(cobranca)
    .values({
      id: randomUUID(),
      userId: c.userId,
      provedor: p.nome,
      idExterno: cob.id,
      compraId: c.id,
      valorCentavos: cob.valorCentavos,
      metodo: cob.metodo,
      estado: cob.status,
      pagaEm: cob.pagaEm,
      reembolsadaEm: cob.status === "reembolsada" || cob.status === "estornada" ? agora : null,
    })
    .onConflictDoUpdate({
      target: [cobranca.provedor, cobranca.idExterno],
      set: {
        estado: cob.status,
        metodo: cob.metodo,
        pagaEm: cob.pagaEm,
        ...(cob.status === "reembolsada" || cob.status === "estornada" ? { reembolsadaEm: agora } : {}),
      },
    });

  if (produto.tipo === "assinatura") {
    await aplicarNaAssinatura(db, p, c, produto, cob, agora);
  } else if (cob.status === "paga" && c.estado === "aberta") {
    // Protetores: o crédito entra na F7 (T-49.7.3); aqui a compra só fica registrada como paga.
    await db.update(compra).set({ estado: "paga", pagaEm: cob.pagaEm ?? agora }).where(eq(compra.id, c.id));
  } else if (cob.status === "reembolsada" || cob.status === "estornada") {
    await db.update(compra).set({ estado: "reembolsada" }).where(eq(compra.id, c.id));
  }

  await sincronizarPlanoNoPerfil(db, c.userId, agora);
  if (cob.status === "paga" && antes?.estado !== "paga") await mandarRecibo(db, p, c, cob).catch(() => undefined);
  return "processado";
}

/** Recibo na primeira vez que a cobrança aparece paga (renovação manda outro recibo; repetição, não). */
async function mandarRecibo(db: Banco, p: Provedor, c: Compra, cob: CobrancaExterna) {
  if (!ehCodigoDeProduto(c.produto)) return;
  const [u] = await db.select({ email: user.email }).from(user).where(eq(user.id, c.userId)).limit(1);
  if (!u) return;
  const produto = PRODUTOS[c.produto];
  const a = produto.tipo === "assinatura" ? await assinaturaPorExterno(db, p.nome, cob.assinaturaId ?? `cobranca:${cob.id}`) : null;
  await enviarEmail(
    emailRecibo({
      para: u.email,
      produto: NOME_DO_PRODUTO[c.produto],
      valor: formatarReais(cob.valorCentavos),
      validoAte: a?.validoAte ?? null,
      renova: !!cob.assinaturaId,
      urlConta: `${env().BETTER_AUTH_URL}/profile`,
    }),
  );
}

async function aplicarNaAssinatura(db: Banco, p: Provedor, c: Compra, produto: ProdutoAssinatura, cob: CobrancaExterna, agora: Date) {
  // Pix anual é um pagamento único (sem assinatura no provedor): a "assinatura" local usa o id da cobrança.
  const idExterno = cob.assinaturaId ?? `cobranca:${cob.id}`;
  let a = (await assinaturaPorExterno(db, p.nome, idExterno)) ?? (c.assinaturaId ? (await db.select().from(assinatura).where(eq(assinatura.id, c.assinaturaId)).limit(1))[0] ?? null : null);
  if (!a) {
    const [novo] = await db
      .insert(assinatura)
      .values({ id: randomUUID(), userId: c.userId, provedor: p.nome, origem: "web", idExterno, produto: c.produto, plano: produto.plano, estado: "pendente" })
      .onConflictDoNothing()
      .returning();
    a = novo ?? (await assinaturaPorExterno(db, p.nome, idExterno));
    if (!a) return;
  }
  if (c.assinaturaId !== a.id) await db.update(compra).set({ assinaturaId: a.id }).where(eq(compra.id, c.id));

  const finais = new Set(["reembolsada"]);
  if (cob.status === "paga") {
    if (finais.has(a.estado)) return; // reembolso não volta atrás com um evento atrasado
    const pagaEm = cob.pagaEm ?? agora;
    const base = cob.vencimento ? new Date(`${cob.vencimento}T12:00:00Z`) : pagaEm;
    const novoFim = fimDoPeriodo(base.getTime() < pagaEm.getTime() - 40 * DIA_MS ? pagaEm : base, produto.periodo);
    const validoAte = a.validoAte && a.validoAte.getTime() > novoFim.getTime() ? a.validoAte : novoFim;
    await db
      .update(assinatura)
      .set({
        estado: a.estado === "cancelada" ? "cancelada" : "ativa",
        inicio: a.inicio ?? pagaEm,
        validoAte,
        reembolsavelAte: a.reembolsavelAte ?? new Date(pagaEm.getTime() + ARREPENDIMENTO_DIAS * DIA_MS),
        atualizadaEm: agora,
      })
      .where(eq(assinatura.id, a.id));
    if (c.estado === "aberta") await db.update(compra).set({ estado: "paga", pagaEm }).where(eq(compra.id, c.id));
    return;
  }
  if (cob.status === "atrasada") {
    if (a.estado === "ativa") await db.update(assinatura).set({ estado: "atrasada", atualizadaEm: agora }).where(eq(assinatura.id, a.id));
    return;
  }
  if (cob.status === "reembolsada" || cob.status === "estornada") {
    await db.update(assinatura).set({ estado: "reembolsada", atualizadaEm: agora }).where(eq(assinatura.id, a.id));
    await db.update(compra).set({ estado: "reembolsada" }).where(eq(compra.id, c.id));
  }
}

/** Assinatura cancelada ou encerrada no provedor: vale até o fim do período pago. */
export async function processarAssinatura(db: Banco, p: Provedor, assinaturaId: string, agora: Date): Promise<ResultadoDoEvento> {
  const externa = await p.buscarAssinatura(assinaturaId);
  if (!externa) return "assinatura-inexistente";
  const a = await assinaturaPorExterno(db, p.nome, externa.id);
  if (!a) return "ignorado"; // ainda não houve pagamento: nada a liberar nem a cancelar aqui
  if (!externa.ativa && (a.estado === "ativa" || a.estado === "atrasada" || a.estado === "pendente")) {
    const vale = a.validoAte && a.validoAte.getTime() > agora.getTime();
    await db
      .update(assinatura)
      .set({ estado: vale ? "cancelada" : "expirada", canceladaEm: a.canceladaEm ?? agora, atualizadaEm: agora })
      .where(eq(assinatura.id, a.id));
    await sincronizarPlanoNoPerfil(db, a.userId, agora);
  }
  return "processado";
}

/** Um evento de webhook já autenticado e registrado. */
export async function processarEvento(db: Banco, p: Provedor, ev: EventoDePagamento, agora: Date): Promise<ResultadoDoEvento> {
  if (ev.tipo.startsWith("CHECKOUT_") && ev.checkoutId) {
    const checkout = await p.buscarCheckout(ev.checkoutId);
    const c = (await compraPorId(db, checkout?.referencia ?? null)) ?? (await compraPorCheckout(db, p.nome, ev.checkoutId));
    if (!c) return "sem-compra";
    if (c.estado === "aberta" && checkout && (checkout.status === "expirado" || checkout.status === "cancelado")) {
      await db.update(compra).set({ estado: checkout.status === "expirado" ? "expirada" : "cancelada" }).where(eq(compra.id, c.id));
    }
    // CHECKOUT_PAID: a liberação vem pela cobrança (PAYMENT_CONFIRMED/RECEIVED), que tem valor e período.
    return "processado";
  }
  if (ev.cobrancaId) {
    const cob = await p.buscarCobranca(ev.cobrancaId);
    if (!cob) return "cobranca-inexistente";
    return processarCobranca(db, p, cob, agora);
  }
  if (ev.assinaturaId) return processarAssinatura(db, p, ev.assinaturaId, agora);
  return "ignorado";
}

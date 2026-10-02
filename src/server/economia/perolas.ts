/**
 * Livro-razão das Pérolas (spec 50 §5.3.4). Toda concessão e todo gasto passam por aqui, sempre dentro de uma
 * transação que já travou o perfil do aluno (`FOR UPDATE`), então dois aparelhos ficam em série.
 * - Ganho: `creditar` com uma chave única por fato; repetir a chave não paga de novo (idempotência).
 * - Gasto: movimento negativo com `compra:<pedidoId>`; o saldo é conferido antes, na mesma transação.
 */
import { and, count, desc, eq, gte, sql, sum } from "drizzle-orm";
import type { Banco } from "../db/client";
import { perolaMovimento } from "../db/schema";
import type { MotivoDePerola } from "@/lib/perolas";
import type { Tx } from "../estudo/sincronizar";

type Leitor = Banco | Tx;

/** Credita (ou debita, com quantidade negativa) uma vez por chave. Devolve `true` se o movimento é novo. */
export async function creditar(
  tx: Tx,
  userId: string,
  chave: string,
  quantidade: number,
  motivo: MotivoDePerola,
  localDate: string,
  ref?: string,
): Promise<boolean> {
  if (!Number.isInteger(quantidade) || quantidade === 0) return false;
  const r = await tx
    .insert(perolaMovimento)
    .values({ userId, chave: chave.slice(0, 200), quantidade, motivo, localDate, ref: ref?.slice(0, 120) ?? null })
    .onConflictDoNothing()
    .returning({ id: perolaMovimento.id });
  return r.length > 0;
}

export async function saldoDePerolas(db: Leitor, userId: string): Promise<number> {
  const [r] = await db.select({ s: sum(perolaMovimento.quantidade) }).from(perolaMovimento).where(eq(perolaMovimento.userId, userId));
  return Number(r?.s ?? 0);
}

/** Quantos movimentos de um motivo o aluno já recebeu num dia (para os tetos diários). */
export async function movimentosNoDia(db: Leitor, userId: string, motivo: MotivoDePerola, localDate: string): Promise<number> {
  const [r] = await db
    .select({ n: count() })
    .from(perolaMovimento)
    .where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.motivo, motivo), eq(perolaMovimento.localDate, localDate), sql`${perolaMovimento.quantidade} > 0`));
  return Number(r?.n ?? 0);
}

export async function existeMovimento(db: Leitor, userId: string, chave: string): Promise<boolean> {
  const r = await db
    .select({ id: perolaMovimento.id })
    .from(perolaMovimento)
    .where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.chave, chave)))
    .limit(1);
  return r.length > 0;
}

export interface MovimentoVisivel {
  quantidade: number;
  motivo: MotivoDePerola;
  ref: string | null;
  dia: string;
  em: string;
}

/** Histórico dos últimos `dias` (padrão 90), mais recente primeiro, no máximo 200 linhas. */
export async function historicoDePerolas(db: Leitor, userId: string, agora: Date, dias = 90): Promise<MovimentoVisivel[]> {
  const desde = new Date(agora.getTime() - dias * 86_400_000);
  const linhas = await db
    .select({ quantidade: perolaMovimento.quantidade, motivo: perolaMovimento.motivo, ref: perolaMovimento.ref, dia: perolaMovimento.localDate, em: perolaMovimento.criadoEm })
    .from(perolaMovimento)
    .where(and(eq(perolaMovimento.userId, userId), gte(perolaMovimento.criadoEm, desde)))
    .orderBy(desc(perolaMovimento.criadoEm))
    .limit(200);
  return linhas.map((l) => ({ quantidade: l.quantidade, motivo: l.motivo as MotivoDePerola, ref: l.ref, dia: l.dia, em: l.em.toISOString() }));
}

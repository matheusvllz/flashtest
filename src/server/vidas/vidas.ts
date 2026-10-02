/**
 * Vidas do Free no servidor (spec 49 T-49.5.1; regra dura 5). O servidor é a fonte da verdade: cada resposta errada
 * de aluno do Free com vidas ligadas baixa uma vida no dia LOCAL da resposta; o saldo volta no agregado.
 *
 * Quem tem vidas: plano Free e `VIDAS_HABILITADO` (ou, só no ambiente local, contas de teste cujo e-mail começa com
 * `e2e-vidas`, para os E2E das vidas não ligarem vidas nos outros testes).
 */
import { and, eq, sql } from "drizzle-orm";
import { saldoDeVidas, type VidasDoDia } from "@/lib/vidas";
import type { Banco } from "../db/client";
import { user, vidasDia } from "../db/schema";
import { env } from "../env";
import { ehLocal } from "../pagamentos/provedor";
import { planoDoAluno } from "../planos/plano";

type Executor = Pick<Banco, "select" | "insert" | "update">;

/** Ligado para o aluno? (flag do ambiente; local: prefixo de teste). Não olha o plano. */
export async function vidasLigadasPara(db: Pick<Banco, "select">, userId: string): Promise<boolean> {
  const e = env();
  if (e.VIDAS_HABILITADO === true) return true;
  if (!ehLocal(e)) return false;
  const [u] = await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1);
  return !!u?.email.startsWith("e2e-vidas");
}

/** O aluno tem vidas hoje? Plano Free e vidas ligadas. */
export async function alunoTemVidas(db: Banco, userId: string, agora: Date): Promise<boolean> {
  if ((await planoDoAluno(db, userId, agora)) !== "gratis") return false;
  return vidasLigadasPara(db, userId);
}

export async function perderVida(tx: Executor, userId: string, dia: string): Promise<void> {
  await tx
    .insert(vidasDia)
    .values({ userId, localDate: dia, perdidas: 1 })
    .onConflictDoUpdate({
      target: [vidasDia.userId, vidasDia.localDate],
      set: { perdidas: sql`${vidasDia.perdidas} + 1`, atualizadoEm: new Date() },
    });
}

export async function vidasDoDia(db: Pick<Banco, "select">, userId: string, dia: string): Promise<VidasDoDia> {
  const [v] = await db
    .select({ perdidas: vidasDia.perdidas, ganhas: vidasDia.ganhasAnuncio })
    .from(vidasDia)
    .where(and(eq(vidasDia.userId, userId), eq(vidasDia.localDate, dia)))
    .limit(1);
  return { dia, restantes: saldoDeVidas(v?.perdidas ?? 0, v?.ganhas ?? 0), anuncioUsado: (v?.ganhas ?? 0) >= 1 };
}

/**
 * +1 vida pelo anúncio recompensado, no máximo uma vez por dia (D49-04). Na web não há verificação de servidor do
 * Google (SSV só no AdMob): o limite diário é a proteção (exceção declarada à regra dura 5, D49-04).
 */
export async function ganharVidaPorAnuncio(db: Banco, userId: string, dia: string): Promise<{ ok: boolean; vidas: VidasDoDia }> {
  const r = await db
    .insert(vidasDia)
    .values({ userId, localDate: dia, ganhasAnuncio: 1 })
    .onConflictDoUpdate({
      target: [vidasDia.userId, vidasDia.localDate],
      set: { ganhasAnuncio: 1, atualizadoEm: new Date() },
      where: sql`${vidasDia.ganhasAnuncio} = 0`,
    })
    .returning({ ganhas: vidasDia.ganhasAnuncio });
  return { ok: r.length > 0, vidas: await vidasDoDia(db, userId, dia) };
}

/** Limpeza da retenção: linhas com mais de 30 dias (spec 49 §9). */
export async function limparVidasAntigas(db: Banco, limite: string): Promise<number> {
  const r = await db.delete(vidasDia).where(sql`${vidasDia.localDate} < ${limite}`).returning({ u: vidasDia.userId });
  return r.length;
}

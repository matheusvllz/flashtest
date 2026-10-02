/**
 * Cronograma até o ENEM (spec 49 §5.9 item 3, T-49.9.2): o servidor guarda só as escolhas do aluno (dias por semana,
 * minutos por dia, data da prova). O plano da semana é calculado no app a partir dessas escolhas e do modelo do aluno
 * (`src/lib/cronograma.ts`), então se reorganiza sozinho quando ele falta ou adianta.
 */
import { eq } from "drizzle-orm";
import type { Banco } from "../db/client";
import { cronograma } from "../db/schema";

export interface CronogramaSalvo {
  diasSemana: number;
  minutosDia: number;
  dataProva: string;
}

export async function lerCronograma(db: Banco, userId: string): Promise<CronogramaSalvo | null> {
  const [c] = await db
    .select({ diasSemana: cronograma.diasSemana, minutosDia: cronograma.minutosDia, dataProva: cronograma.dataProva })
    .from(cronograma)
    .where(eq(cronograma.userId, userId))
    .limit(1);
  return c ?? null;
}

export async function salvarCronograma(db: Banco, userId: string, c: CronogramaSalvo, agora: Date): Promise<CronogramaSalvo> {
  await db
    .insert(cronograma)
    .values({ userId, ...c, geradoEm: agora })
    .onConflictDoUpdate({ target: cronograma.userId, set: { ...c, geradoEm: agora } });
  return c;
}

/**
 * Combo no servidor (spec 50 §5.1.1, §5.1.3): a mesma regra pura do aparelho (`src/lib/combo.ts`), aplicada às
 * respostas na ordem em que chegam, sob a trava do perfil. É a única fonte das recompensas do combo:
 * - vida de volta em 5 e 10 seguidas (Free com vidas), até 2 por dia, nunca acima de 5;
 * - o combo de cada resposta fica na tentativa (`attempt.combo`), para o bônus fixo de XP na conclusão.
 */
import { and, eq, sql } from "drizzle-orm";
import { aplicarAoCombo, VIDAS_DE_COMBO_POR_DIA, type ResultadoDaResposta, type ResultadoDoCombo } from "@/lib/combo";
import { VIDAS_POR_DIA } from "@/lib/planos";
import { comboDia, vidasDia } from "../db/schema";
import type { Tx } from "../estudo/sincronizar";
import { vidasDoDia } from "../vidas/vidas";

/** Fontes em que o combo conta (lição, prática da trilha, aula rápida, redação fechada). Checagem, nivelamento, flashcard e simulado não contam nem zeram. */
export const FONTES_DO_COMBO: ReadonlySet<string> = new Set(["licao", "atividade", "questao-geral", "redacao"]);

export async function aplicarComboNoServidor(
  tx: Tx,
  userId: string,
  r: { dataLocal: string; ocorreuEm: Date; resultado: ResultadoDaResposta; conta: boolean; assistida: boolean },
): Promise<ResultadoDoCombo> {
  const [linha] = await tx
    .select()
    .from(comboDia)
    .where(and(eq(comboDia.userId, userId), eq(comboDia.localDate, r.dataLocal)))
    .limit(1);
  const anterior = linha
    ? { dia: r.dataLocal, atual: linha.atual, maximo: linha.maximo, ultimaEm: linha.ultimaRespostaEm?.getTime() ?? null }
    : null;
  const res = aplicarAoCombo(anterior, {
    resultado: r.resultado,
    dia: r.dataLocal,
    em: r.ocorreuEm.getTime(),
    conta: r.conta,
    assistida: r.assistida,
  });
  if (r.conta) {
    await tx
      .insert(comboDia)
      .values({
        userId,
        localDate: r.dataLocal,
        atual: res.estado.atual,
        maximo: res.estado.maximo,
        ultimaRespostaEm: res.estado.ultimaEm ? new Date(res.estado.ultimaEm) : null,
      })
      .onConflictDoUpdate({
        target: [comboDia.userId, comboDia.localDate],
        set: {
          atual: res.estado.atual,
          maximo: res.estado.maximo,
          ultimaRespostaEm: res.estado.ultimaEm ? new Date(res.estado.ultimaEm) : null,
        },
      });
  }
  return res;
}

/** +1 vida pelo combo, se couber (teto diário e nunca acima de 5). Devolve `true` se concedeu. */
export async function concederVidaDoCombo(tx: Tx, userId: string, dia: string): Promise<boolean> {
  const atual = await vidasDoDia(tx, userId, dia);
  if (atual.restantes >= VIDAS_POR_DIA) return false;
  await tx.insert(vidasDia).values({ userId, localDate: dia }).onConflictDoNothing();
  const r = await tx
    .update(vidasDia)
    .set({ ganhasCombo: sql`${vidasDia.ganhasCombo} + 1`, atualizadoEm: new Date() })
    .where(and(eq(vidasDia.userId, userId), eq(vidasDia.localDate, dia), sql`${vidasDia.ganhasCombo} < ${VIDAS_DE_COMBO_POR_DIA}`))
    .returning({ g: vidasDia.ganhasCombo });
  return r.length > 0;
}

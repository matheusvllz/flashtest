/**
 * Aplica os eventos de estudo de um aluno (docs/specs/46-producao §E.4, T-06.2/T-06.3).
 *
 * Tudo numa transação, com o perfil do aluno travado (`FOR UPDATE`) para serializar os envios do
 * mesmo aluno (dois aparelhos ao mesmo tempo não pagam XP duas vezes). Para cada evento:
 *   - repetido (mesmo id) → aceito sem efeito (idempotência);
 *   - resposta → correção recalculada pelo gabarito (`checkAnswer`), nunca pelo cliente;
 *   - conclusão → XP pelas regras de `src/lib/recompensas.ts`, com teto por chave no livro de XP;
 *   - todo evento de conclusão marca o dia como estudado (base da sequência).
 * Datas: `dataLocal` precisa estar entre 7 dias atrás e amanhã no fuso do aluno (estudo offline
 * sincronizado depois ainda conta; datas inventadas longe de hoje, não).
 */
import { and, count, eq, sql, sum } from "drizzle-orm";
import { checkAnswer } from "@/lib/lessons/define";
import {
  XP_BONUS_ENTRADA,
  XP_POR_ESTRELAS,
  estrelasPorPct,
  pctDe,
  sequenciaDosDias,
  xpAlvoDaAtividade,
  xpAlvoDaQuestaoGeral,
} from "@/lib/recompensas";
import type { Agregado, EventoEstudo, MotivoRejeicao, RespostaEnvio } from "@/lib/sync/contrato";
import type { Banco } from "../db/client";
import { attempt, completion, profile, studyDay, xpLedger } from "../db/schema";
import { exercicioDoItem, licaoExiste } from "./conteudo";

/** Teto diário de atividades da trilha que pagam XP (a chave de atividade é por tentativa, sem teto natural). */
export const ATIVIDADES_PAGAS_POR_DIA = 60;
const JANELA_DIAS_ATRAS = 7;

/** Data `AAAA-MM-DD` de `quando` no fuso `tz`. */
export function dataNoFuso(quando: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(quando);
}

function diaValido(dataLocal: string, hoje: string): boolean {
  const d = Date.parse(`${dataLocal}T00:00:00Z`);
  const h = Date.parse(`${hoje}T00:00:00Z`);
  const diff = Math.round((h - d) / 86_400_000);
  return diff >= -1 && diff <= JANELA_DIAS_ATRAS;
}

type Tx = Parameters<Parameters<Banco["transaction"]>[0]>[0];

async function pagarXp(tx: Tx, userId: string, chave: string, alvo: number, motivo: string, dataLocal: string) {
  await tx
    .insert(xpLedger)
    .values({ userId, key: chave, xp: alvo, reason: motivo, localDate: dataLocal })
    .onConflictDoUpdate({
      target: [xpLedger.userId, xpLedger.key],
      set: { xp: sql`greatest(${xpLedger.xp}, excluded.xp)`, updatedAt: sql`now()` },
    });
}

async function marcarDia(tx: Tx, userId: string, dataLocal: string) {
  await tx
    .insert(studyDay)
    .values({ userId, localDate: dataLocal, blocks: 1 })
    .onConflictDoUpdate({ target: [studyDay.userId, studyDay.localDate], set: { blocks: sql`${studyDay.blocks} + 1` } });
}

async function jaConcluido(tx: Tx, userId: string, chave: string): Promise<boolean> {
  const r = await tx.select({ k: completion.key }).from(completion).where(and(eq(completion.userId, userId), eq(completion.key, chave))).limit(1);
  return r.length > 0;
}

/** Aplica um lote de eventos já validados pelo contrato. */
export async function aplicarEventos(
  db: Banco,
  userId: string,
  eventos: EventoEstudo[],
  agora: Date = new Date(),
): Promise<RespostaEnvio> {
  const aplicados: string[] = [];
  const rejeitados: Array<{ id: string; motivo: MotivoRejeicao }> = [];

  await db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    const [perfil] = await tx.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).for("update");
    const hoje = dataNoFuso(agora, perfil?.tz ?? "America/Sao_Paulo");

    for (const ev of eventos) {
      if (!diaValido(ev.dataLocal, hoje) || Date.parse(ev.ocorreuEm) > agora.getTime() + 5 * 60_000) {
        rejeitados.push({ id: ev.id, motivo: "DATA_FORA_DA_JANELA" });
        continue;
      }
      switch (ev.tipo) {
        case "resposta": {
          const existente = await tx
            .select({ id: attempt.id })
            .from(attempt)
            .where(and(eq(attempt.userId, userId), eq(attempt.id, ev.id)))
            .limit(1);
          if (existente.length) {
            aplicados.push(ev.id);
            break;
          }
          const exercicio = await exercicioDoItem(ev.itemId);
          if (!exercicio) {
            rejeitados.push({ id: ev.id, motivo: "ITEM_DESCONHECIDO" });
            break;
          }
          const correta = ev.resposta === null ? false : checkAnswer(exercicio, ev.resposta, ev.exibidos);
          await tx.insert(attempt).values({
            userId,
            id: ev.id,
            itemId: ev.itemId,
            answer: JSON.stringify(ev.resposta),
            correct: correta,
            source: ev.fonte,
            durationMs: ev.duracaoMs,
            answeredAt: new Date(ev.ocorreuEm),
            localDate: ev.dataLocal,
            activityAttemptKey: ev.attemptKey,
          });
          if (ev.fonte === "questao-geral") {
            await pagarXp(tx, userId, `questao-geral:${ev.itemId}`, xpAlvoDaQuestaoGeral(correta), "questao-geral", ev.dataLocal);
          }
          aplicados.push(ev.id);
          break;
        }
        case "licao-concluida": {
          if (!(await licaoExiste(ev.licaoId, ev.tipoLicao))) {
            rejeitados.push({ id: ev.id, motivo: "LICAO_DESCONHECIDA" });
            break;
          }
          // A pontuação da lição vem do cliente; o teto por lição limita o ganho ao máximo legítimo
          // (risco aceito, docs/seguranca/modelo-de-ameacas.md T7).
          const acertos = Math.min(ev.acertos, ev.total);
          const pct = pctDe(acertos, ev.total);
          const chave = `licao:${ev.tipoLicao}:${ev.licaoId}`;
          const r = await tx
            .insert(completion)
            .values({ userId, key: `${chave}#${ev.id}`, kind: `licao-${ev.tipoLicao}`, scorePct: pct, completedAt: new Date(ev.ocorreuEm) })
            .onConflictDoNothing()
            .returning({ k: completion.key });
          if (r.length) {
            await pagarXp(tx, userId, chave, XP_POR_ESTRELAS[estrelasPorPct(pct)], `licao-${ev.tipoLicao}`, ev.dataLocal);
            await marcarDia(tx, userId, ev.dataLocal);
          }
          aplicados.push(ev.id);
          break;
        }
        case "atividade-concluida": {
          const chave = `atividade:${ev.attemptKey}`;
          if (await jaConcluido(tx, userId, chave)) {
            aplicados.push(ev.id);
            break;
          }
          const [placar] = await tx
            .select({ total: count(), acertos: sum(sql<number>`case when ${attempt.correct} then 1 else 0 end`) })
            .from(attempt)
            .where(and(eq(attempt.userId, userId), eq(attempt.activityAttemptKey, ev.attemptKey)));
          const total = Number(placar?.total ?? 0);
          const acertos = Number(placar?.acertos ?? 0);
          if (total === 0) {
            rejeitados.push({ id: ev.id, motivo: "ATIVIDADE_SEM_RESPOSTAS" });
            break;
          }
          const [pagasHoje] = await tx
            .select({ n: count() })
            .from(xpLedger)
            .where(and(eq(xpLedger.userId, userId), eq(xpLedger.localDate, ev.dataLocal), sql`${xpLedger.key} like 'atividade:%'`));
          await tx.insert(completion).values({
            userId,
            key: chave,
            kind: ev.kind,
            scorePct: pctDe(acertos, total),
            completedAt: new Date(ev.ocorreuEm),
          });
          if (Number(pagasHoje?.n ?? 0) < ATIVIDADES_PAGAS_POR_DIA) {
            await pagarXp(tx, userId, chave, xpAlvoDaAtividade(ev.kind, acertos, total), `atividade-${ev.kind}`, ev.dataLocal);
          }
          await marcarDia(tx, userId, ev.dataLocal);
          aplicados.push(ev.id);
          break;
        }
        case "bloco-concluido": {
          const r = await tx
            .insert(completion)
            .values({ userId, key: `bloco:${ev.id}`, kind: ev.bloco, completedAt: new Date(ev.ocorreuEm) })
            .onConflictDoNothing()
            .returning({ k: completion.key });
          if (r.length) await marcarDia(tx, userId, ev.dataLocal);
          aplicados.push(ev.id);
          break;
        }
        case "entrada": {
          await pagarXp(tx, userId, "onboarding:bonus", XP_BONUS_ENTRADA, "entrada", ev.dataLocal);
          aplicados.push(ev.id);
          break;
        }
      }
    }
  });

  return { ok: true, aplicados, rejeitados, agregado: await agregadoDoAluno(db, userId) };
}

/** XP, sequência e dias — a verdade do servidor sobre recompensas. */
export async function agregadoDoAluno(db: Banco, userId: string): Promise<Agregado> {
  const [x] = await db.select({ xp: sum(xpLedger.xp) }).from(xpLedger).where(eq(xpLedger.userId, userId));
  const dias = await db.select({ d: studyDay.localDate }).from(studyDay).where(eq(studyDay.userId, userId));
  const s = sequenciaDosDias(dias.map((r) => r.d));
  return {
    xp: Number(x?.xp ?? 0),
    sequencia: s.sequencia,
    melhorSequencia: s.melhorSequencia,
    congelamentos: s.congelamentos,
    ultimoDia: s.ultimoDia,
    diasComAtividade: dias.length,
  };
}

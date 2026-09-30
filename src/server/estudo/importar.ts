/**
 * Importação do progresso local para a conta (docs/specs/46-producao §G, T-07.1).
 *
 * - Uma transação só: falha no meio = nada gravado (o aparelho tenta de novo).
 * - Idempotente por `importId`: repetir devolve o mesmo resumo, sem aplicar de novo.
 * - Correção recalculada pelo gabarito; XP recalculado pelas regras vigentes, com teto no XP que o aparelho
 *   mostrava (`xpNoAparelho`) — um `localStorage` editado não vira recompensa (modelo de ameaças T7).
 * - Datas: não antes de 2026-01-01 (o app não existia) nem no futuro.
 */
import { and, count, eq, sql, sum } from "drizzle-orm";
import { checkAnswer } from "@/lib/lessons/define";
import { XP_BONUS_ENTRADA, XP_POR_ESTRELAS, estrelasPorPct, xpAlvoDaAtividade, xpAlvoDaQuestaoGeral } from "@/lib/recompensas";
import type { PedidoImportacao, ResumoImportacao } from "@/lib/sync/importacao";
import type { Banco } from "../db/client";
import { attempt, completion, dataImport, profile, studyDay, xpLedger } from "../db/schema";
import { exercicioDoItem, licaoExiste } from "./conteudo";
import { agregadoDoAluno } from "./sincronizar";
import type { Agregado } from "@/lib/sync/contrato";

const INICIO_DO_APP = Date.parse("2026-01-01T00:00:00Z");

function dataAceitavel(iso: string, agora: Date): boolean {
  const t = Date.parse(iso);
  return Number.isFinite(t) && t >= INICIO_DO_APP && t <= agora.getTime() + 5 * 60_000;
}

function diaDe(iso: string): string {
  return iso.slice(0, 10);
}

export async function importarEstado(
  db: Banco,
  userId: string,
  p: PedidoImportacao,
  agora: Date = new Date(),
): Promise<{ resumo: ResumoImportacao; agregado: Agregado }> {
  let resumo: ResumoImportacao = { respostas: 0, licoes: 0, atividades: 0, dias: 0, xp: 0, repetida: false };

  await db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    await tx.select({ u: profile.userId }).from(profile).where(eq(profile.userId, userId)).for("update");

    const [feita] = await tx
      .select({ summary: dataImport.summary })
      .from(dataImport)
      .where(and(eq(dataImport.userId, userId), eq(dataImport.id, p.importId)))
      .limit(1);
    if (feita) {
      resumo = { ...(feita.summary as unknown as ResumoImportacao), repetida: true };
      return;
    }

    // Teto de XP desta importação: o que o aparelho mostrava.
    let restante = p.xpNoAparelho;
    const pagar = async (chave: string, alvo: number, motivo: string, dia: string) => {
      if (restante <= 0 || alvo <= 0) return;
      const [atual] = await tx.select({ xp: xpLedger.xp }).from(xpLedger).where(and(eq(xpLedger.userId, userId), eq(xpLedger.key, chave)));
      const jaPago = atual?.xp ?? 0;
      const incremento = Math.min(Math.max(0, alvo - jaPago), restante);
      if (incremento <= 0) return;
      restante -= incremento;
      resumo.xp += incremento;
      await tx
        .insert(xpLedger)
        .values({ userId, key: chave, xp: jaPago + incremento, reason: `import:${motivo}`, localDate: dia })
        .onConflictDoUpdate({
          target: [xpLedger.userId, xpLedger.key],
          set: { xp: sql`greatest(${xpLedger.xp}, excluded.xp)`, updatedAt: sql`now()` },
        });
    };
    const marcarDia = (dia: string) =>
      tx.insert(studyDay).values({ userId, localDate: dia, blocks: 1 }).onConflictDoNothing();

    if (p.bonusDeEntrada) await pagar("onboarding:bonus", XP_BONUS_ENTRADA, "entrada", diaDe(agora.toISOString()));

    for (const r of p.respostas) {
      if (!dataAceitavel(r.ocorreuEm, agora)) continue;
      const exercicio = await exercicioDoItem(r.itemId);
      if (!exercicio) continue;
      const correta = r.resposta === null ? false : checkAnswer(exercicio, r.resposta, r.exibidos);
      const ins = await tx
        .insert(attempt)
        .values({
          userId,
          id: r.id,
          itemId: r.itemId,
          answer: JSON.stringify(r.resposta),
          correct: correta,
          source: r.fonte,
          answeredAt: new Date(r.ocorreuEm),
          localDate: r.dataLocal,
          activityAttemptKey: r.attemptKey,
          origin: "import",
        })
        .onConflictDoNothing()
        .returning({ id: attempt.id });
      if (!ins.length) continue;
      resumo.respostas += 1;
      if (r.fonte === "questao-geral") await pagar(`questao-geral:${r.itemId}`, xpAlvoDaQuestaoGeral(correta), "questao-geral", r.dataLocal);
    }

    for (const l of p.licoes) {
      if (!dataAceitavel(l.concluidaEm, agora) || !(await licaoExiste(l.licaoId, l.tipoLicao))) continue;
      const chave = `licao:${l.tipoLicao}:${l.licaoId}`;
      await tx
        .insert(completion)
        .values({ userId, key: `${chave}#import`, kind: `licao-${l.tipoLicao}`, scorePct: l.pct, completedAt: new Date(l.concluidaEm), origin: "import" })
        .onConflictDoNothing();
      resumo.licoes += 1;
      await pagar(chave, XP_POR_ESTRELAS[estrelasPorPct(l.pct)], `licao-${l.tipoLicao}`, diaDe(l.concluidaEm));
    }

    for (const a of p.atividades) {
      if (!dataAceitavel(a.concluidaEm, agora)) continue;
      const chave = `atividade:${a.attemptKey}`;
      const ins = await tx
        .insert(completion)
        .values({ userId, key: chave, kind: a.kind, scorePct: a.pct, completedAt: new Date(a.concluidaEm), origin: "import" })
        .onConflictDoNothing()
        .returning({ k: completion.key });
      if (!ins.length) continue;
      resumo.atividades += 1;
      // Com as respostas da tentativa importadas, o placar sai delas; sem elas, do histórico (com o teto de XP acima).
      const [placar] = await tx
        .select({ total: count(), acertos: sum(sql<number>`case when ${attempt.correct} then 1 else 0 end`) })
        .from(attempt)
        .where(and(eq(attempt.userId, userId), eq(attempt.activityAttemptKey, a.attemptKey)));
      const total = Number(placar?.total ?? 0);
      const alvo = total > 0 ? xpAlvoDaAtividade(a.kind, Number(placar?.acertos ?? 0), total) : xpAlvoDaAtividade(a.kind, a.pct ?? 0, 100);
      await pagar(chave, alvo, `atividade-${a.kind}`, diaDe(a.concluidaEm));
    }

    const hoje = agora.getTime();
    for (const d of new Set(p.diasComAtividade)) {
      const t = Date.parse(`${d}T12:00:00Z`);
      if (!Number.isFinite(t) || t < INICIO_DO_APP || t > hoje + 86_400_000) continue;
      await marcarDia(d);
      resumo.dias += 1;
    }

    await tx.insert(dataImport).values({
      userId,
      id: p.importId,
      deviceIdHash: await hash(p.aparelhoId),
      status: "concluida",
      summary: resumo as unknown as Record<string, number | boolean>,
    });
  });

  return { resumo, agregado: await agregadoDoAluno(db, userId) };
}

async function hash(valor: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(valor));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

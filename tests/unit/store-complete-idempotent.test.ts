import { beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  atividadeHoje,
  completeLesson,
  completeMicroLesson,
  conclusaoJaContada,
  getState,
  reset,
  setState,
} from "@/lib/store";

/**
 * docs/36 G-3 (achado do spec-verifier sobre `completeMicroLesson`/`completeLesson`):
 * chamar a conclusão de novo para a MESMA tentativa (fechar/recarregar entre a
 * gravação da conclusão e a limpeza da sessão ativa; 2 abas na tela de resultado)
 * não duplica o bloco do dia, a contagem de lições, a sequência nem o XP.
 *
 * Sem `sessionStartedAt` (chamador que não sabe qual é a tentativa) o
 * comportamento de sempre continua valendo: replay é atividade nova e conta
 * como bloco (mas nunca paga XP integral de novo).
 */

const INICIO = "2020-01-01T00:00:00.000Z"; // bem antes de qualquer `agora`: a conclusão real é sempre posterior

function foto() {
  const s = getState();
  const hoje = atividadeHoje(s);
  return {
    xp: s.progress.xp,
    streak: s.progress.streak,
    blocos: hoje.completedBlockIds.length,
    licoesHoje: hoje.lessons,
    redacaoHoje: hoje.redacao,
    diasAtivos: s.progress.activityDays.length,
  };
}

describe("completeMicroLesson — idempotente por tentativa (G-3)", () => {
  beforeEach(() => reset());

  test("SEM sessionStartedAt: a 2ª chamada não paga XP nem mexe na sequência, mas soma bloco e lição do dia (replay = atividade)", () => {
    completeMicroLesson("aula-x", 1, 4, 4);
    const um = foto();
    const r2 = completeMicroLesson("aula-x", 1, 4, 4);
    const dois = foto();
    expect(r2.alreadyCompleted).toBe(true);
    expect(r2.xpAwarded).toBe(0);
    expect(dois.xp).toBe(um.xp);
    expect(dois.streak).toBe(um.streak);
    expect(dois.diasAtivos).toBe(um.diasAtivos);
    // O que a guarda por tentativa existe para evitar quando é a MESMA tentativa:
    expect(dois.blocos).toBe(um.blocos + 1);
    expect(dois.licoesHoje).toBe(um.licoesHoje + 1);
  });

  test("COM sessionStartedAt: a 2ª chamada da mesma tentativa não muda NADA (bloco, lição do dia, XP, sequência, dias)", () => {
    // a tentativa começou ANTES da conclusão (o `completedAt` é `agora`, depois de INICIO)
    const r1 = completeMicroLesson("aula-x", 1, 4, 4, { sessionStartedAt: INICIO });
    expect(r1.alreadyCompleted).toBe(false);
    expect(r1.xpAwarded).toBeGreaterThan(0);
    const um = foto();
    const registro = getState().learning.completedLessons["aula-x"];

    const r2 = completeMicroLesson("aula-x", 1, 4, 4, { sessionStartedAt: INICIO });
    expect(r2).toEqual({ xpAwarded: 0, alreadyCompleted: true, stars: r1.stars });
    expect(foto()).toEqual(um);
    expect(getState().learning.completedLessons["aula-x"]).toEqual(registro); // nem o completedAt é reescrito

    for (let i = 0; i < 5; i++) completeMicroLesson("aula-x", 1, 4, 4, { sessionStartedAt: INICIO });
    expect(foto()).toEqual(um);
  });

  test("uma tentativa NOVA (começou depois da conclusão anterior) conta de novo, como 'Refazer lição'", () => {
    completeMicroLesson("aula-x", 1, 2, 4, { sessionStartedAt: INICIO }); // 50% -> 1 estrela
    const um = foto();
    // o registro anterior é de 10:30; a nova tentativa começou às 11:00
    setState((s) => {
      s.learning.completedLessons["aula-x"].completedAt = "2026-09-28T10:30:00.000Z";
      return s;
    });
    const r = completeMicroLesson("aula-x", 1, 4, 4, { sessionStartedAt: "2026-09-28T11:00:00.000Z" });
    expect(r.alreadyCompleted).toBe(true); // já tinha sido concluída antes
    expect(r.stars).toBe(3); // a faixa melhorou: paga só a diferença
    expect(r.xpAwarded).toBeGreaterThan(0);
    expect(foto().blocos).toBe(um.blocos + 1);
    expect(foto().licoesHoje).toBe(um.licoesHoje + 1);
  });

  test("conclusaoJaContada: só com os dois valores e completedAt >= início", () => {
    expect(conclusaoJaContada("2026-09-28T10:30:00.000Z", "2026-09-28T10:00:00.000Z")).toBe(true);
    expect(conclusaoJaContada("2026-09-28T10:00:00.000Z", "2026-09-28T10:00:00.000Z")).toBe(true);
    expect(conclusaoJaContada("2026-09-28T09:59:59.999Z", "2026-09-28T10:00:00.000Z")).toBe(false);
    expect(conclusaoJaContada(undefined, "2026-09-28T10:00:00.000Z")).toBe(false);
    expect(conclusaoJaContada("2026-09-28T10:30:00.000Z", undefined)).toBe(false);
  });
});

describe("completeLesson (redação legada) — idempotente por tentativa (G-3)", () => {
  beforeEach(() => reset());

  test("SEM sessionStartedAt: 2ª chamada = replay (0 XP, mas soma bloco e redação do dia)", () => {
    const r1 = completeLesson("crase-01-a-regra-de-ouro", 8, 8);
    const um = foto();
    const r2 = completeLesson("crase-01-a-regra-de-ouro", 8, 8);
    expect(r1.first).toBe(true);
    expect(r2.first).toBe(false);
    expect(r2.xpAwarded).toBe(0);
    expect(foto().xp).toBe(um.xp);
    expect(foto().streak).toBe(um.streak);
    expect(foto().blocos).toBe(um.blocos + 1);
    expect(foto().redacaoHoje).toBe(um.redacaoHoje + 1);
  });

  test("COM sessionStartedAt: a 2ª chamada da mesma tentativa não muda NADA e devolve o progresso já gravado", () => {
    const r1 = completeLesson("crase-01-a-regra-de-ouro", 8, 8, { sessionStartedAt: INICIO });
    expect(r1.first).toBe(true);
    const um = foto();
    const gravado = getState().progress.lessons["crase-01-a-regra-de-ouro"];

    const r2 = completeLesson("crase-01-a-regra-de-ouro", 8, 8, { sessionStartedAt: INICIO });
    expect(r2.xpAwarded).toBe(0);
    expect(r2.first).toBe(false);
    expect(r2.improved).toBe(false);
    expect(r2.progress).toEqual(gravado);
    expect(foto()).toEqual(um);
    expect(getState().progress.lessons["crase-01-a-regra-de-ouro"]).toEqual(gravado);
  });

  test("uma tentativa NOVA (replay depois da conclusão) conta de novo e paga só a diferença de faixa", () => {
    completeLesson("crase-01-a-regra-de-ouro", 5, 8, { sessionStartedAt: INICIO }); // 63% -> 1 estrela
    setState((s) => {
      s.progress.lessons["crase-01-a-regra-de-ouro"].completedAt = "2026-09-28T10:30:00.000Z";
      return s;
    });
    const um = foto();
    const r = completeLesson("crase-01-a-regra-de-ouro", 8, 8, { sessionStartedAt: "2026-09-28T11:00:00.000Z" });
    expect(r.improved).toBe(true);
    expect(r.progress.stars).toBe(3);
    expect(r.xpAwarded).toBeGreaterThan(0);
    expect(foto().blocos).toBe(um.blocos + 1);
  });
});

describe("os chamadores passam o início da tentativa (guarda estática)", () => {
  test("useLearningSession (aula/microlição) passa o startedAt da sessão persistida", () => {
    const fonte = readFileSync("src/hooks/useLearningSession.ts", "utf-8");
    expect(fonte).toMatch(/completeMicroLesson\([^)]*\{ sessionStartedAt: startedAt(, attemptKey: sessionId)? \}\)/);
  });
  test("LessonPlayer (redação legada) passa o início da tentativa e o renova em 'Refazer'", () => {
    const fonte = readFileSync("src/components/lessons/LessonPlayer.tsx", "utf-8");
    expect(fonte).toMatch(/sessionStartedAt: tentativaIniciadaEm\.current/);
    expect(fonte).toMatch(/tentativaIniciadaEm\.current = new Date\(\)\.toISOString\(\);\s*setReplayKey/);
  });
});

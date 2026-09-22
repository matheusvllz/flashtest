import { describe, expect, test } from "bun:test";
import {
  isReviewDue,
  proximoIntervalo,
  recordAttemptForSkill,
  scheduleReview,
  skillEvidenceState,
  updateSkillEvidence,
} from "@/lib/learning/review";

describe("proximoIntervalo — escada 1/3/7/14, erro reinicia (docs/20 §13)", () => {
  test("primeira vez, acerto -> 1 dia", () => {
    expect(proximoIntervalo(undefined, true)).toBe(1);
  });
  test("1 -> 3 -> 7 -> 14 em acertos sucessivos", () => {
    expect(proximoIntervalo(1, true)).toBe(3);
    expect(proximoIntervalo(3, true)).toBe(7);
    expect(proximoIntervalo(7, true)).toBe(14);
  });
  test("14 continua 14 (teto da escada)", () => {
    expect(proximoIntervalo(14, true)).toBe(14);
  });
  test("erro em qualquer intervalo reinicia pra 1 dia", () => {
    expect(proximoIntervalo(14, false)).toBe(1);
    expect(proximoIntervalo(7, false)).toBe(1);
  });
});

describe("scheduleReview / isReviewDue", () => {
  test("agenda a próxima data corretamente a partir de hoje", () => {
    const entry = scheduleReview(undefined, "mat:porcentagem", true, "2026-09-21");
    expect(entry.dueDate).toBe("2026-09-22");
    expect(entry.intervalDays).toBe(1);
  });

  test("isReviewDue: data passada ou igual a hoje está devida; futura não", () => {
    expect(isReviewDue({ skillId: "x", intervalDays: 1, dueDate: "2026-09-20", lastResult: null }, "2026-09-21")).toBe(true);
    expect(isReviewDue({ skillId: "x", intervalDays: 1, dueDate: "2026-09-21", lastResult: null }, "2026-09-21")).toBe(true);
    expect(isReviewDue({ skillId: "x", intervalDays: 1, dueDate: "2026-09-22", lastResult: null }, "2026-09-21")).toBe(false);
  });
});

describe("updateSkillEvidence / skillEvidenceState — critério A10", () => {
  const skillId = "mat:porcentagem-valor";

  test("checkpoint nunca conta como evidência — nem materializa entrada vazia", () => {
    const evidencia = updateSkillEvidence(undefined, skillId, {
      exerciseId: "ex1",
      correct: true,
      localDate: "2026-09-21",
      role: "checkpoint",
      assisted: false,
      isReviewRecovery: false,
    });
    expect(evidencia).toBeUndefined();
  });

  test("tentativa assistida (dica/tutor) não conta como evidência independente — nem materializa entrada vazia", () => {
    const evidencia = updateSkillEvidence(undefined, skillId, {
      exerciseId: "ex1",
      correct: true,
      localDate: "2026-09-21",
      role: "pratica",
      assisted: true,
      isReviewRecovery: false,
    });
    expect(evidencia).toBeUndefined();
  });

  test("1 acerto em 1 item não é suficiente (não 'consistente')", () => {
    const evidencia = updateSkillEvidence(undefined, skillId, {
      exerciseId: "ex1",
      correct: true,
      localDate: "2026-09-21",
      role: "pratica",
      assisted: false,
      isReviewRecovery: false,
    });
    expect(skillEvidenceState(evidencia)).toBe("em-pratica");
  });

  test("5 exercícios distintos na MESMA data ainda não bastam (falta 2ª data)", () => {
    let evidencia = undefined as ReturnType<typeof updateSkillEvidence> | undefined;
    for (let i = 1; i <= 5; i++) {
      evidencia = updateSkillEvidence(evidencia, skillId, {
        exerciseId: `ex${i}`,
        correct: true,
        localDate: "2026-09-21",
        role: "pratica",
        assisted: false,
        isReviewRecovery: false,
      });
    }
    expect(skillEvidenceState(evidencia)).toBe("em-pratica");
  });

  test("5 distintos + 2 datas + 4/5 corretos + revisão 24h -> consistente", () => {
    let evidencia = undefined as ReturnType<typeof updateSkillEvidence> | undefined;
    const resultados = [
      { id: "ex1", data: "2026-09-19", correct: true },
      { id: "ex2", data: "2026-09-19", correct: false },
      { id: "ex3", data: "2026-09-20", correct: true },
      { id: "ex4", data: "2026-09-20", correct: true },
      { id: "ex5", data: "2026-09-21", correct: true },
    ];
    for (const r of resultados) {
      evidencia = updateSkillEvidence(evidencia, skillId, {
        exerciseId: r.id,
        correct: r.correct,
        localDate: r.data,
        role: "pratica",
        assisted: false,
        isReviewRecovery: false,
      });
    }
    // 4 dos últimos 5 corretos (só ex2 errou) — falta só a revisão de 24h.
    expect(skillEvidenceState(evidencia)).toBe("em-pratica");

    evidencia = updateSkillEvidence(evidencia, skillId, {
      exerciseId: "ex1", // repetir item já visto ainda conta pro histórico de acerto
      correct: true,
      localDate: "2026-09-22",
      role: "revisao",
      assisted: false,
      isReviewRecovery: true,
    });
    expect(skillEvidenceState(evidencia)).toBe("consistente");
  });

  test("conclusão da lição permanece mesmo com revisão devida — evidência é outra dimensão", () => {
    // Não há acoplamento estrutural entre `completedLessons` e evidência: a
    // função de evidência não sabe nem precisa saber se a lição foi concluída.
    const evidencia = updateSkillEvidence(undefined, skillId, {
      exerciseId: "ex1",
      correct: true,
      localDate: "2026-09-21",
      role: "pratica",
      assisted: false,
      isReviewRecovery: false,
    });
    expect(evidencia).toBeDefined(); // não lança, não depende de estado de conclusão
  });
});

describe("recordAttemptForSkill — composição (assistência + recuperação 24h)", () => {
  test("resposta com dica não vira recuperação de revisão mesmo em role 'revisao'", () => {
    const { evidence } = recordAttemptForSkill({
      skillId: "por:crase",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: {
        exerciseId: "ex1",
        correct: true,
        localDate: "2026-09-21",
        role: "revisao",
        hintUsed: true,
        tutorUsed: false,
      },
      horasDesdeUltimaExposicao: 48,
      hojeISO: "2026-09-21",
    });
    expect(evidence).toBeUndefined();
  });

  test("explicação imediata (revisão com <24h desde a exposição) não conta como recuperação", () => {
    const { evidence } = recordAttemptForSkill({
      skillId: "por:crase",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: {
        exerciseId: "ex1",
        correct: true,
        localDate: "2026-09-21",
        role: "revisao",
        hintUsed: false,
        tutorUsed: false,
      },
      horasDesdeUltimaExposicao: 2,
      hojeISO: "2026-09-21",
    });
    expect(evidence.hasReviewCorrectAfter24h).toBe(false);
  });

  test("role 'pratica' não reagenda revisão; role 'revisao' reagenda", () => {
    const pratica = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: { exerciseId: "e1", correct: true, localDate: "2026-09-21", role: "pratica", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: 100,
      hojeISO: "2026-09-21",
    });
    expect(pratica.schedule).toBeUndefined();

    const revisao = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: { exerciseId: "e1", correct: true, localDate: "2026-09-21", role: "revisao", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: 100,
      hojeISO: "2026-09-21",
    });
    expect(revisao.schedule?.dueDate).toBe("2026-09-22");
  });
});

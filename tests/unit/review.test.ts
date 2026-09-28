import { describe, expect, test } from "bun:test";
import {
  isReviewDue,
  proximoIntervalo,
  recordAttemptForSkill,
  scheduleReview,
  skillEvidenceState,
  updateSkillEvidence,
} from "@/lib/learning/review";

describe("proximoIntervalo — escada 1/3/7/14/30/60, erro reinicia (docs/20 §13, estendida no docs/30 §9.3)", () => {
  test("primeira vez, acerto -> 1 dia", () => {
    expect(proximoIntervalo(undefined, true)).toBe(1);
  });
  test("1 -> 3 -> 7 -> 14 -> 30 -> 60 em acertos sucessivos", () => {
    expect(proximoIntervalo(1, true)).toBe(3);
    expect(proximoIntervalo(3, true)).toBe(7);
    expect(proximoIntervalo(7, true)).toBe(14);
    expect(proximoIntervalo(14, true)).toBe(30);
    expect(proximoIntervalo(30, true)).toBe(60);
  });
  test("60 continua 60 (teto da escada estendida)", () => {
    expect(proximoIntervalo(60, true)).toBe(60);
  });
  test("erro em qualquer intervalo reinicia pra 1 dia", () => {
    expect(proximoIntervalo(60, false)).toBe(1);
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

  test("role 'pratica' CRIA agenda no 1º acerto independente (docs/30 §9.4/§11.2, Fase 5); role 'revisao' sempre reagenda", () => {
    // Antes da Fase 5, só "revisao" mexia na agenda — mudança de comportamento
    // intencional e documentada, não regressão (ver o bloco de testes dedicado
    // "recordAttemptForSkill — agenda criada/reiniciada..." logo abaixo).
    const pratica = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: { exerciseId: "e1", correct: true, localDate: "2026-09-21", role: "pratica", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: 100,
      hojeISO: "2026-09-21",
    });
    expect(pratica.schedule?.dueDate).toBe("2026-09-22");

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

describe("limite de itens/datas distintos na evidência (docs/30 §9.3, schema v6, Fase 4)", () => {
  test("60 exercícios distintos: guarda só os últimos 50, mas 'consistente' continua igual (>=5 já bastava)", () => {
    let entry = undefined as ReturnType<typeof updateSkillEvidence>;
    for (let i = 0; i < 60; i++) {
      entry = updateSkillEvidence(entry, "x", {
        exerciseId: `e${i}`,
        correct: true,
        localDate: "2026-09-21",
        role: "pratica",
        assisted: false,
        isReviewRecovery: false,
      });
    }
    expect(entry?.distinctExerciseIds.length).toBe(50);
    // Os mais RECENTES ficam — o 59º (índice base 0) tem que estar; o 0º já saiu.
    expect(entry?.distinctExerciseIds).toContain("e59");
    expect(entry?.distinctExerciseIds).not.toContain("e0");
  });

  test("25 datas distintas: guarda só as últimas 20", () => {
    let entry = undefined as ReturnType<typeof updateSkillEvidence>;
    for (let i = 0; i < 25; i++) {
      const dia = String(i + 1).padStart(2, "0");
      entry = updateSkillEvidence(entry, "x", {
        exerciseId: "mesmo-exercicio",
        correct: true,
        localDate: `2026-01-${dia}`,
        role: "pratica",
        assisted: false,
        isReviewRecovery: false,
      });
    }
    expect(entry?.distinctLocalDates.length).toBe(20);
  });
});

describe("recordAttemptForSkill — agenda criada/reiniciada por prática/desafio/diagnóstico (docs/30 §9.4/§11.2, Fase 5)", () => {
  test("1º acerto independente em prática CRIA agenda (intervalo 1) — não existia antes", () => {
    const { schedule } = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: { exerciseId: "e1", correct: true, localDate: "2026-09-21", role: "pratica", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: Infinity,
      hojeISO: "2026-09-21",
    });
    expect(schedule?.intervalDays).toBe(1);
    expect(schedule?.dueDate).toBe("2026-09-22");
  });

  test("acerto ASSISTIDO em prática NÃO cria agenda", () => {
    const { schedule } = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: { exerciseId: "e1", correct: true, localDate: "2026-09-21", role: "pratica", hintUsed: true, tutorUsed: false },
      horasDesdeUltimaExposicao: Infinity,
      hojeISO: "2026-09-21",
    });
    expect(schedule).toBeUndefined();
  });

  test("2º acerto em prática NÃO recria a agenda (só o 1º cria) — mantém o que já existia", () => {
    const primeira = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: { exerciseId: "e1", correct: true, localDate: "2026-09-21", role: "pratica", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: Infinity,
      hojeISO: "2026-09-21",
    });
    const segunda = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: primeira.evidence,
      scheduleAtual: primeira.schedule,
      attempt: { exerciseId: "e2", correct: true, localDate: "2026-09-21", role: "pratica", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: Infinity,
      hojeISO: "2026-09-21",
    });
    expect(segunda.schedule?.dueDate).toBe(primeira.schedule?.dueDate);
  });

  test("erro em desafio/diagnóstico com agenda existente REINICIA pra 1 dia", () => {
    const comAgenda = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: { exerciseId: "e1", correct: true, localDate: "2026-09-01", role: "desafio", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: Infinity,
      hojeISO: "2026-09-01",
    });
    expect(comAgenda.schedule?.intervalDays).toBe(1);

    const depoisDoErro = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: comAgenda.evidence,
      scheduleAtual: comAgenda.schedule,
      attempt: { exerciseId: "e2", correct: false, localDate: "2026-09-10", role: "diagnostico", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: Infinity,
      hojeISO: "2026-09-10",
    });
    expect(depoisDoErro.schedule?.intervalDays).toBe(1);
    expect(depoisDoErro.schedule?.dueDate).toBe("2026-09-11");
  });

  test("erro na CHECAGEM de aula (role checkpoint) nunca reinicia agenda existente", () => {
    const comAgenda = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: { exerciseId: "e1", correct: true, localDate: "2026-09-01", role: "pratica", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: Infinity,
      hojeISO: "2026-09-01",
    });
    const depoisDoErroCheckpoint = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: comAgenda.evidence,
      scheduleAtual: comAgenda.schedule,
      attempt: { exerciseId: "e2", correct: false, localDate: "2026-09-02", role: "checkpoint", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: Infinity,
      hojeISO: "2026-09-02",
    });
    expect(depoisDoErroCheckpoint.schedule).toEqual(comAgenda.schedule); // intocada
  });

  test("erro em prática sem agenda existente NÃO cria uma (só acerto cria)", () => {
    const { schedule } = recordAttemptForSkill({
      skillId: "x",
      evidenceAtual: undefined,
      scheduleAtual: undefined,
      attempt: { exerciseId: "e1", correct: false, localDate: "2026-09-21", role: "pratica", hintUsed: false, tutorUsed: false },
      horasDesdeUltimaExposicao: Infinity,
      hojeISO: "2026-09-21",
    });
    expect(schedule).toBeUndefined();
  });
});

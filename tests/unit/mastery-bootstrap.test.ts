import { describe, expect, test } from "bun:test";
import { bootstrapModel, priorPorMateria, replayAttempts } from "@/lib/adaptive/bootstrap";
import { ALGO_VERSION } from "@/lib/adaptive/constants";
import type { Attempt, SkillModelEntry } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

/**
 * Bootstrap/replay (docs/30 §9.6/§24.2/§24.3, Fase 5 T-5.6/T-5.7).
 */

function attempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: "at-1",
    sessionId: "ls-1",
    exerciseId: "mc:porcentagem-valor:checkpoint",
    exerciseVersion: 1,
    skillIds: ["mat:porcentagem-conceito"],
    role: "pratica",
    answer: 1,
    correct: true,
    hintUsed: false,
    tutorUsed: false,
    firstSubmission: true,
    submittedAt: "2026-09-21T10:00:00.000Z",
    localDate: "2026-09-21",
    durationMs: 3000,
    ...overrides,
  };
}

describe("replayAttempts", () => {
  test("reconstrói o modelo a partir de uma lista de tentativas reais", () => {
    const model = replayAttempts([attempt(), attempt({ id: "at-2", localDate: "2026-09-22" })]);
    expect(model["mat:porcentagem-conceito"]).toBeDefined();
    expect(model["mat:porcentagem-conceito"].nEff).toBeGreaterThan(0);
  });

  test("id de exercício que não existe mais é ignorado, sem lançar", () => {
    expect(() =>
      replayAttempts([attempt({ exerciseId: "id-que-nao-existe-em-lugar-nenhum" })]),
    ).not.toThrow();
    const model = replayAttempts([attempt({ exerciseId: "id-que-nao-existe-em-lugar-nenhum" })]);
    expect(Object.keys(model)).toHaveLength(0);
  });

  test("tentativa sem skillIds é ignorada", () => {
    const model = replayAttempts([attempt({ skillIds: [] })]);
    expect(Object.keys(model)).toHaveLength(0);
  });

  test("é determinístico — mesma entrada, mesmo resultado (inclusive `updatedAt`, com `now` fixo)", () => {
    const attempts = [attempt(), attempt({ id: "at-2", correct: false, localDate: "2026-09-22" })];
    const a = replayAttempts(attempts, "2026-09-24T00:00:00.000Z");
    const b = replayAttempts(attempts, "2026-09-24T00:00:00.000Z");
    expect(a).toEqual(b);
  });

  test("respeita a ordem — não é o mesmo resultado de errar antes de acertar vs. o contrário", () => {
    const ordemA = replayAttempts([
      attempt({ id: "1", correct: true, localDate: "2026-09-20" }),
      attempt({ id: "2", correct: false, localDate: "2026-09-21" }),
    ]);
    const ordemB = replayAttempts([
      attempt({ id: "2", correct: false, localDate: "2026-09-20" }),
      attempt({ id: "1", correct: true, localDate: "2026-09-21" }),
    ]);
    expect(ordemA["mat:porcentagem-conceito"].theta).not.toBeCloseTo(
      ordemB["mat:porcentagem-conceito"].theta,
      5,
    );
  });
});

describe("priorPorMateria (docs/30 §24.3)", () => {
  test("matéria com 10 respondidas, 7 certas: theta positivo, sigma 1,0, nEff 0, source prior-materia", () => {
    const priors = priorPorMateria({ mat: { answered: 10, correct: 7 } }, new Set(), "2026-09-21T00:00:00.000Z");
    const chave = Object.keys(priors).find((k) => k.startsWith("mat:"));
    expect(chave).toBeDefined();
    const entry = priors[chave!];
    expect(entry.source).toBe("prior-materia");
    expect(entry.nEff).toBe(0);
    expect(entry.sigma).toBeCloseTo(1.0, 5);
    // taxa Laplace = (7+1)/(10+2) = 0,667 -> logit(0,667)-0,3 = 0,693-0,3 ≈ 0,393 (positivo)
    expect(entry.theta).toBeGreaterThan(0);
  });

  test("habilidades JÁ populadas pelo replay não são sobrescritas", () => {
    const priors = priorPorMateria(
      { mat: { answered: 10, correct: 7 } },
      new Set(["mat:porcentagem-conceito"]),
      "2026-09-21T00:00:00.000Z",
    );
    expect(priors["mat:porcentagem-conceito"]).toBeUndefined();
  });

  test("matéria sem nenhuma resposta não gera prior", () => {
    const priors = priorPorMateria({ mat: { answered: 0, correct: 0 } }, new Set(), "2026-09-21T00:00:00.000Z");
    expect(Object.keys(priors)).toHaveLength(0);
  });

  test("theta do prior fica sempre entre -2 e 2 (clamp)", () => {
    const priors = priorPorMateria({ mat: { answered: 100, correct: 100 } }, new Set(), "x");
    for (const entry of Object.values(priors)) {
      expect(entry.theta).toBeLessThanOrEqual(2);
      expect(entry.theta).toBeGreaterThanOrEqual(-2);
    }
  });
});

describe("bootstrapModel (docs/30 §9.6)", () => {
  function estadoBase(overrides: Partial<AppState["learning"]> = {}): Pick<AppState, "progress" | "learning"> {
    return {
      progress: { bySubject: { mat: { answered: 5, correct: 4 } } } as AppState["progress"],
      learning: { recentAttempts: [], modelMeta: { algoVersion: 0, bootstrappedAt: null }, ...overrides } as AppState["learning"],
    };
  }

  test("combina replay + prior de matéria (replay tem prioridade)", () => {
    const estado = estadoBase({ recentAttempts: [attempt()] });
    const model = bootstrapModel(estado, "2026-09-21T00:00:00.000Z");
    // A habilidade que tem tentativa real vem do REPLAY (nEff>0), não do prior (nEff sempre 0).
    expect(model["mat:porcentagem-conceito"].nEff).toBeGreaterThan(0);
    expect(model["mat:porcentagem-conceito"].source).toBe("evidencia");
    // Outras habilidades ativas de "mat" sem tentativa ganham o prior de matéria.
    const outraDeMat = Object.entries(model).find(([id, e]) => id.startsWith("mat:") && e.source === "prior-materia");
    expect(outraDeMat).toBeDefined();
  });

  test("é idempotente — rodar 2x com o mesmo estado dá o mesmo resultado", () => {
    const estado = estadoBase({ recentAttempts: [attempt(), attempt({ id: "at-2", localDate: "2026-09-22" })] });
    const a = bootstrapModel(estado, "2026-09-21T00:00:00.000Z");
    const b = bootstrapModel(estado, "2026-09-21T00:00:00.000Z");
    expect(a).toEqual(b);
  });

  // docs/36 T-04.1 (RP-5): o bootstrap não pode apagar o efeito do nivelamento.
  function entrada(skillId: string, source: SkillModelEntry["source"], theta = -1.2): SkillModelEntry {
    return {
      skillId, theta, sigma: 0.9, nEff: source === "evidencia" ? 3 : 0, difficultiesSeen: [], recent: [],
      independentShare: 0, lastEvidenceDate: null, lapses: 0, dontKnowRecent: 0, helpHeavyRecent: 0,
      source, algoVersion: 1, updatedAt: "2026-09-20T00:00:00.000Z",
    };
  }

  test("prior-nivelamento existente + replay vazio -> entrada mantida (não é recalculada)", () => {
    const prior = entrada("mat:razao-proporcao", "prior-nivelamento");
    const estado = estadoBase({ recentAttempts: [], skillModel: { "mat:razao-proporcao": prior } });
    const model = bootstrapModel(estado, "2026-09-21T00:00:00.000Z");
    expect(model["mat:razao-proporcao"]).toBe(prior);
    // e o prior de matéria não passa por cima dele
    expect(model["mat:razao-proporcao"].source).toBe("prior-nivelamento");
  });

  test("evidencia existente que o replay não cobre (saiu do anel de tentativas) -> mantida", () => {
    const ev = entrada("mat:razao-proporcao", "evidencia", 0.4);
    const model = bootstrapModel(estadoBase({ recentAttempts: [], skillModel: { "mat:razao-proporcao": ev } }), "2026-09-21T00:00:00.000Z");
    expect(model["mat:razao-proporcao"]).toBe(ev);
  });

  test("prior-materia existente é recalculado (não é mantido como estava)", () => {
    const velho = entrada("mat:razao-proporcao", "prior-materia", 1.9);
    const model = bootstrapModel(estadoBase({ recentAttempts: [], skillModel: { "mat:razao-proporcao": velho } }), "2026-09-21T00:00:00.000Z");
    expect(model["mat:razao-proporcao"]).not.toBe(velho);
    expect(model["mat:razao-proporcao"].source).toBe("prior-materia");
    expect(model["mat:razao-proporcao"].theta).not.toBeCloseTo(1.9, 3);
  });

  test("habilidade que o replay tocou vem do replay, mesmo com prior-nivelamento anterior", () => {
    const prior = entrada("mat:porcentagem-conceito", "prior-nivelamento");
    const model = bootstrapModel(
      estadoBase({ recentAttempts: [attempt()], skillModel: { "mat:porcentagem-conceito": prior } }),
      "2026-09-21T00:00:00.000Z",
    );
    expect(model["mat:porcentagem-conceito"].source).toBe("evidencia");
    expect(model["mat:porcentagem-conceito"].nEff).toBeGreaterThan(0);
  });

  test("com mescla continua idempotente: rodar sobre a própria saída não muda nada", () => {
    const prior = entrada("mat:razao-proporcao", "prior-nivelamento");
    const base = estadoBase({ recentAttempts: [attempt()], skillModel: { "mat:razao-proporcao": prior } });
    const a = bootstrapModel(base, "2026-09-21T00:00:00.000Z");
    const b = bootstrapModel({ ...base, learning: { ...base.learning, skillModel: a } }, "2026-09-21T00:00:00.000Z");
    expect(b).toEqual(a);
  });

  test("roda em menos de 10ms com 500 tentativas (docs/30 §9.6)", () => {
    const muitas: Attempt[] = Array.from({ length: 500 }, (_, i) =>
      attempt({ id: `at-${i}`, correct: i % 2 === 0, localDate: "2026-09-21" }),
    );
    const estado = estadoBase({ recentAttempts: muitas });
    const inicio = performance.now();
    bootstrapModel(estado, "2026-09-21T00:00:00.000Z");
    expect(performance.now() - inicio).toBeLessThan(10);
  });
});

describe("ALGO_VERSION", () => {
  test("é 1 nesta entrega (referência pro teste de migração/replay não ficar solta)", () => {
    expect(ALGO_VERSION).toBe(1);
  });
});

describe("atalho sem nada a reprocessar (spec 48 T-48.9.2)", () => {
  test("estado vazio: o bootstrap daria {}; o atalho reconhece o caso e não precisa baixar conteúdo", async () => {
    const { bootstrapModel } = await import("@/lib/adaptive/bootstrap");
    const { semNadaParaReprocessar } = await import("@/lib/store");
    const { learningStateVazio } = await import("@/lib/learning/types");
    const vazio = { learning: learningStateVazio(), progress: { bySubject: {} } } as never;
    expect(bootstrapModel(vazio)).toEqual({});
    expect(semNadaParaReprocessar(vazio)).toBe(true);
    const comAcerto = { learning: learningStateVazio(), progress: { bySubject: { mat: { answered: 2, correct: 1 } } } } as never;
    expect(semNadaParaReprocessar(comAcerto)).toBe(false);
  });
});

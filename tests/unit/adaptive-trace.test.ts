import { beforeEach, describe, expect, test } from "bun:test";
import { _resetTraceForTests, formatTrace, getTrace, recordTrace } from "@/lib/adaptive/trace";
import { planNext } from "@/lib/adaptive/planner";
import { learningStateVazio } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

/**
 * Trace de decisão (docs/30 §27, Fase 8 F8.8).
 */

beforeEach(() => _resetTraceForTests());

function entradaTrace() {
  return {
    activity: {
      id: "atv-1",
      kind: "pratica" as const,
      skillIds: ["mat:porcentagem-conceito"],
      subjectId: "mat",
      estimatedMinutes: 5,
      reasons: ["consolidar" as const],
      score: 0.82,
      scoreBreakdown: {},
    },
    skillName: "Entender porcentagem como fração de 100",
    mastery: 64,
    confidence: 41,
    breakdown: { necessidade: 0.7, objetivo: 0.85, urgencia: 0, ordem: 0, equilibrio: 0.9, variedade: 1 },
    targetP: 0.7,
  };
}

describe("recordTrace/getTrace", () => {
  test("anel guarda até 20, descarta o mais antigo", () => {
    for (let i = 0; i < 25; i++) recordTrace(entradaTrace());
    expect(getTrace()).toHaveLength(20);
  });

  test("getTrace devolve cópia — mutar o retorno não afeta o anel interno", () => {
    recordTrace(entradaTrace());
    const t = getTrace();
    t.pop();
    expect(getTrace()).toHaveLength(1);
  });
});

describe("formatTrace", () => {
  test("formata habilidade, motivo e decomposição de score no formato do docs/30 §27", () => {
    const linha = formatTrace(entradaTrace());
    expect(linha).toContain("Entender porcentagem como fração de 100");
    expect(linha).toContain("consolidar");
    expect(linha).toContain("Mastery 64");
    expect(linha).toContain("Confidence 41");
  });
});

describe("planNext com gravarTrace", () => {
  test("gravarTrace:true popula o anel; sem a opção, não grava nada", () => {
    const s: Pick<AppState, "prefs" | "learning" | "progress"> = {
      prefs: {
        difficultSubjects: [],
        easySubjects: [],
        studyFocus: { mode: "todas", subjectIds: [], areas: [] },
      } as unknown as AppState["prefs"],
      learning: learningStateVazio(),
      progress: { bySubject: {} } as unknown as AppState["progress"],
    };

    planNext(s, "2026-09-24", "seed-1", { n: 3 });
    expect(getTrace()).toHaveLength(0);

    planNext(s, "2026-09-24", "seed-1", { n: 3, gravarTrace: true });
    expect(getTrace().length).toBeGreaterThan(0);
  });
});

import { describe, expect, test } from "bun:test";
import { scoreCandidate, type ScoreInput } from "@/lib/adaptive/scoring";
import { updateSkill } from "@/lib/adaptive/model";
import { SKILL_MAP, activeSkills } from "@/content/taxonomy";

/**
 * Pontuação (docs/30 §11.4, Fase 8 F8.4) — cada fator isolado + monotonicidade.
 */

const skill = SKILL_MAP["mat:porcentagem-conceito"]; // incidence 3, core
const skillsMat = activeSkills().filter((s) => s.subjectId === "mat");

function baseInput(overrides: Partial<ScoreInput> = {}): ScoreInput {
  return {
    skill,
    allSkillsOfSubject: skillsMat,
    state: "EM_APRENDIZADO",
    entry: undefined,
    evidence: undefined,
    today: "2026-09-24",
    diasAtraso: 0,
    pesoMateria: "normal",
    areasRecentes: [],
    fatiaAlvoArea: 0.25,
    materiaAnterior: null,
    materiaPenultima: null,
    ...overrides,
  };
}

describe("scoreCandidate — necessidade", () => {
  test("NOVA sempre 0,8, independente de Mastery/Confidence", () => {
    const r = scoreCandidate(baseInput({ state: "NOVA" }));
    expect(r.breakdown.necessidade).toBeCloseTo(0.8, 5);
  });

  test("mais Mastery -> menos necessidade (monotonicidade)", () => {
    let baixaEntry = undefined;
    let altaEntry = undefined;
    for (let i = 0; i < 6; i++) {
      baixaEntry = updateSkill(
        baixaEntry,
        skill.id,
        { role: "pratica", correct: false },
        { a: 1, b: 0, c: 0.2, source: "estimado" },
        `2026-09-1${i}`,
        { difficulty: 2, now: `2026-09-1${i}T10:00:00.000Z` },
      );
      altaEntry = updateSkill(
        altaEntry,
        skill.id,
        { role: "pratica", correct: true },
        { a: 1, b: 0, c: 0.2, source: "estimado" },
        `2026-09-1${i}`,
        { difficulty: 2, now: `2026-09-1${i}T10:00:00.000Z` },
      );
    }
    const baixa = scoreCandidate(baseInput({ entry: baixaEntry }));
    const alta = scoreCandidate(baseInput({ entry: altaEntry }));
    expect(alta.breakdown.necessidade).toBeLessThan(baixa.breakdown.necessidade);
  });
});

describe("scoreCandidate — objetivo", () => {
  test("matéria prioritária > normal > vai bem, mesma incidência", () => {
    const prio = scoreCandidate(baseInput({ pesoMateria: "prioritaria" })).breakdown.objetivo;
    const normal = scoreCandidate(baseInput({ pesoMateria: "normal" })).breakdown.objetivo;
    const vaiBem = scoreCandidate(baseInput({ pesoMateria: "vaiBem" })).breakdown.objetivo;
    expect(prio).toBeGreaterThan(normal);
    expect(normal).toBeGreaterThan(vaiBem);
  });

  test("objetivo fica em [0,1]", () => {
    const r = scoreCandidate(baseInput({ pesoMateria: "prioritaria" }));
    expect(r.breakdown.objetivo).toBeLessThanOrEqual(1);
    expect(r.breakdown.objetivo).toBeGreaterThanOrEqual(0);
  });
});

describe("scoreCandidate — urgenciaRevisao", () => {
  test("0 se não DEVIDA", () => {
    const r = scoreCandidate(baseInput({ state: "EM_APRENDIZADO", diasAtraso: 5 }));
    expect(r.breakdown.urgencia).toBe(0);
  });

  test("DEVIDA sem atraso = 0,5; mais atraso = mais urgência, até o teto 1", () => {
    const semAtraso = scoreCandidate(baseInput({ state: "DEVIDA", diasAtraso: 0 })).breakdown.urgencia;
    const comAtraso = scoreCandidate(baseInput({ state: "DEVIDA", diasAtraso: 3 })).breakdown.urgencia;
    const muitoAtraso = scoreCandidate(baseInput({ state: "DEVIDA", diasAtraso: 100 })).breakdown.urgencia;
    expect(semAtraso).toBeCloseTo(0.5, 5);
    expect(comAtraso).toBeGreaterThan(semAtraso);
    expect(muitoAtraso).toBeLessThanOrEqual(1);
  });
});

describe("scoreCandidate — ordemCurricular", () => {
  test("0 se não NOVA", () => {
    const r = scoreCandidate(baseInput({ state: "EM_APRENDIZADO" }));
    expect(r.breakdown.ordem).toBe(0);
  });

  test("NOVA: habilidade mais cedo na ordem topológica pontua mais", () => {
    const raiz = skillsMat.find((s) => s.prerequisites.length === 0)!;
    const folha = skillsMat.find((s) => s.prerequisites.length > 0)!;
    const rRaiz = scoreCandidate(baseInput({ skill: raiz, state: "NOVA" })).breakdown.ordem;
    const rFolha = scoreCandidate(baseInput({ skill: folha, state: "NOVA" })).breakdown.ordem;
    expect(rRaiz).toBeGreaterThanOrEqual(rFolha);
  });
});

describe("scoreCandidate — equilibrio", () => {
  test("0 sem janela recente", () => {
    const r = scoreCandidate(baseInput({ areasRecentes: [] }));
    expect(r.breakdown.equilibrio).toBe(0);
  });

  test("área ausente da janela recente (déficit total) pontua mais que área supersaturada", () => {
    const ausente = scoreCandidate(
      baseInput({ areasRecentes: ["LC", "LC", "LC", "CH"], fatiaAlvoArea: 0.25 }),
    ).breakdown.equilibrio; // skill é MT, não aparece na janela
    const saturada = scoreCandidate(
      baseInput({ areasRecentes: ["MT", "MT", "MT", "MT"], fatiaAlvoArea: 0.25 }),
    ).breakdown.equilibrio;
    expect(ausente).toBeGreaterThan(saturada);
    expect(saturada).toBe(0);
  });
});

describe("scoreCandidate — variedade", () => {
  test("sem atividade anterior -> 1 (nada a variar)", () => {
    const r = scoreCandidate(baseInput({ materiaAnterior: null }));
    expect(r.breakdown.variedade).toBe(1);
  });

  test("mesma matéria da anterior -> 0", () => {
    const r = scoreCandidate(baseInput({ materiaAnterior: "mat" }));
    expect(r.breakdown.variedade).toBe(0);
  });

  test("mesma matéria da penúltima (não da anterior) -> 0,5", () => {
    const r = scoreCandidate(baseInput({ materiaAnterior: "por", materiaPenultima: "mat" }));
    expect(r.breakdown.variedade).toBe(0.5);
  });

  test("matéria diferente das duas últimas -> 1", () => {
    const r = scoreCandidate(baseInput({ materiaAnterior: "por", materiaPenultima: "fis" }));
    expect(r.breakdown.variedade).toBe(1);
  });
});

describe("scoreCandidate — score final", () => {
  test("é a soma ponderada dos 6 fatores (0,30/0,20/0,15/0,15/0,10/0,10)", () => {
    const input = baseInput({ state: "DEVIDA", diasAtraso: 2, pesoMateria: "prioritaria", materiaAnterior: "por" });
    const r = scoreCandidate(input);
    const esperado =
      0.3 * r.breakdown.necessidade +
      0.2 * r.breakdown.objetivo +
      0.15 * r.breakdown.urgencia +
      0.15 * r.breakdown.ordem +
      0.1 * r.breakdown.equilibrio +
      0.1 * r.breakdown.variedade;
    expect(r.score).toBeCloseTo(esperado, 10);
  });
});

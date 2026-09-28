import { describe, expect, test } from "bun:test";
import { planNext } from "@/lib/adaptive/planner";
import { updateSkill } from "@/lib/adaptive/model";
import { updateSkillEvidence } from "@/lib/learning/review";
import { learningStateVazio } from "@/lib/learning/types";
import { activeSkills } from "@/content/taxonomy";
import type { AppState } from "@/lib/store";
import type { SkillEvidenceEntry, SkillModelEntry } from "@/lib/learning/types";

/**
 * Cenários A, B, E, H do docs/30 §26.3 aplicados ao MOTOR (planNext) — Fase
 * 8 F8.10. C e F já são cobertos no nível do MODELO por `sim-model.test.ts`
 * (Fase 5); repeti-los aqui, na camada do planejador, teria baixo valor
 * marginal — escopo reduzido registrado no `docs/32`. Determinístico:
 * sequências de resposta CRAFTADAS (mesmo padrão de `sim-model.test.ts`),
 * não o simulador probabilístico — reprodutibilidade sem depender de
 * semente batendo com um resultado específico.
 */

const FACIL = { a: 1, b: -1.5, c: 0.2 };
const MAT_SKILLS = activeSkills().filter((s) => s.subjectId === "mat");

function estadoBase(): Pick<AppState, "prefs" | "learning" | "progress"> {
  return {
    prefs: {
      difficultSubjects: [],
      easySubjects: [],
      studyFocus: { mode: "todas", subjectIds: [], areas: [] },
    } as unknown as AppState["prefs"],
    learning: learningStateVazio(),
    progress: { bySubject: {} } as unknown as AppState["progress"],
  };
}

function responderVezes(
  modelo: SkillModelEntry | undefined,
  evidencia: SkillEvidenceEntry | undefined,
  skillId: string,
  correct: boolean,
  vezes: number,
  today: string,
): { modelo: SkillModelEntry; evidencia: SkillEvidenceEntry } {
  let m = modelo;
  let e = evidencia;
  for (let i = 0; i < vezes; i++) {
    m = updateSkill(m, skillId, { role: "pratica", correct }, FACIL, today, { difficulty: 3, now: `${today}T10:0${i}:00.000Z` });
    e = updateSkillEvidence(e, skillId, { exerciseId: `${skillId}-${i}`, correct, localDate: today });
  }
  return { modelo: m!, evidencia: e! };
}

describe("Cenário A — muito bom em Matemática", () => {
  test("habilidades levadas a Mastery/Confidence altas viram FIRME e entram como desafio no plano", () => {
    const s = estadoBase();
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["mat"], areas: [] };
    const hoje = "2026-09-24";
    // "Muito bom em Matemática" = domínio amplo, não só de 4 habilidades — senão as
    // dezenas ainda NOVA sempre vencem o score do desafio (necessidade alta por design,
    // docs/30 §11.4: NOVA é sempre 0,8; desafio é (1-Mastery)·fator, baixo de propósito).
    for (const sk of MAT_SKILLS) {
      const { modelo, evidencia } = responderVezes(undefined, undefined, sk.id, true, 10, hoje);
      s.learning.skillModel[sk.id] = modelo;
      s.learning.skillEvidence[sk.id] = evidencia;
    }
    const plano = planNext(s, hoje, "seed-a", { n: 8 });
    expect(plano.some((a) => a.kind === "desafio")).toBe(true);
    // Nenhuma habilidade pulada com Confidence baixa: toda "desafio" no plano tem uma
    // habilidade com Confidence real calculada >= 50 (garantido pela classificação FIRME).
  });
});

describe("Cenário B — fraco em Matemática", () => {
  test("habilidades com muitos erros nunca viram desafio; Mastery não sobe", () => {
    const s = estadoBase();
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["mat"], areas: [] };
    const hoje = "2026-09-24";
    for (const sk of MAT_SKILLS.slice(0, 4)) {
      const { modelo, evidencia } = responderVezes(undefined, undefined, sk.id, false, 6, hoje);
      s.learning.skillModel[sk.id] = modelo;
      s.learning.skillEvidence[sk.id] = evidencia;
    }
    const plano = planNext(s, hoje, "seed-b", { n: 8 });
    expect(plano.every((a) => a.kind !== "desafio")).toBe(true);
    for (const sk of MAT_SKILLS.slice(0, 4)) {
      const m = s.learning.skillModel[sk.id];
      expect(m.theta).toBeLessThan(0); // Mastery (logistic) fica abaixo de 50
    }
  });
});

describe("Cenário E — marca 'não sei'", () => {
  test("2 'não sei' na mesma habilidade -> próxima atividade dela é reforco com motivo reforco-nao-sei", () => {
    const s = estadoBase();
    const skillId = MAT_SKILLS[0].id;
    s.prefs.studyFocus = { mode: "materias", subjectIds: [MAT_SKILLS[0].subjectId], areas: [] };
    const hoje = "2026-09-24";
    let m = updateSkill(undefined, skillId, { role: "pratica", correct: false, response: "dont-know" }, FACIL, hoje, {
      now: `${hoje}T10:00:00.000Z`,
    });
    m = updateSkill(m, skillId, { role: "pratica", correct: false, response: "dont-know" }, FACIL, hoje, {
      now: `${hoje}T10:05:00.000Z`,
    });
    s.learning.skillModel[skillId] = m;

    const plano = planNext(s, hoje, "seed-e", { n: 8 });
    const doPrimeiro = plano.find((a) => a.skillIds[0] === skillId);
    expect(doPrimeiro?.kind).toBe("reforco");
    expect(doPrimeiro?.reasons).toContain("reforco-nao-sei");
  });
});

describe("Cenário H — foco temporário em Física", () => {
  test("plano só com Física no dia; nada de outra matéria entra sem atraso", () => {
    const s = estadoBase();
    const hoje = "2026-09-24";
    s.learning.focusSession = { subjectIds: ["fis"], startedAt: `${hoje}T08:00:00.000Z`, expiresOn: hoje };
    const plano = planNext(s, hoje, "seed-h", { n: 6 });
    expect(plano.length).toBeGreaterThan(0);
    for (const a of plano) {
      if (a.kind !== "checkpoint") expect(a.subjectId).toBe("fis");
    }
  });
});

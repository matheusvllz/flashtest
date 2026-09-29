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

/* -------------------------------------------------------------------------
 * Mix — cota mínima de revisão e teto de desafio (docs/36 T-04.3, G4, RP-3,
 * G-8). Sem cota, a revisão perdia para NOVA sempre que o atraso era pequeno
 * ([sim] do 36 §C6: 0–1 revisão por janela com 6 devidas atrasadas 2 dias;
 * 0 com 1 ou 3 devidas). Janela = 10 posições consecutivas do plano.
 * ---------------------------------------------------------------------- */

const HOJE_MIX = "2026-09-28";
const N_MIX = 24;

function estadoMix(): Pick<AppState, "prefs" | "learning" | "progress"> {
  return {
    prefs: {
      difficultSubjects: [],
      easySubjects: [],
      dailyMinutes: 10,
      studyFocus: { mode: "todas", subjectIds: [], areas: [] },
      examTargets: [],
    } as unknown as AppState["prefs"],
    learning: learningStateVazio(),
    progress: { bySubject: {}, lessons: {}, today: { date: HOJE_MIX, completedBlockIds: [] } } as unknown as AppState["progress"],
  };
}

/** Primeira habilidade sem pré-requisito de cada matéria, em ordem — evita BLOQUEADA e garante matérias distintas. */
function habilidadesLivres(n: number): string[] {
  const vistas = new Set<string>();
  const out: string[] = [];
  for (const sk of activeSkills()) {
    if (vistas.has(sk.subjectId) || sk.prerequisites.length > 0) continue;
    vistas.add(sk.subjectId);
    out.push(sk.id);
    if (out.length >= n) break;
  }
  return out;
}

function diasAtras(dias: number): string {
  return new Date(Date.UTC(2026, 8, 28 - dias)).toISOString().slice(0, 10);
}

/** Habilidades com evidência (3 respostas: certa, errada, certa) e revisão vencida há `atrasoDias`. */
function comRevisoesDevidas(s: ReturnType<typeof estadoMix>, skillIds: string[], atrasoDias: number): void {
  for (const id of skillIds) {
    const r = responderVezes(undefined, undefined, id, true, 2, "2026-09-10");
    const m = updateSkill(r.modelo, id, { role: "pratica", correct: false }, FACIL, "2026-09-10", { difficulty: 3, now: "2026-09-10T10:09:00.000Z" });
    s.learning.skillModel[id] = m;
    s.learning.skillEvidence[id] = r.evidencia;
    s.learning.reviewSchedule[id] = { skillId: id, intervalDays: 3, dueDate: diasAtras(atrasoDias), lastResult: "correct" };
  }
}

function janelas10(kinds: string[], alvo: string): number[] {
  const out: number[] = [];
  for (let i = 0; i + 10 <= kinds.length; i++) out.push(kinds.slice(i, i + 10).filter((k) => k === alvo).length);
  return out;
}

describe("Mix — cota de revisão e teto de desafio (docs/36 T-04.3, RP-3, G-8)", () => {
  test("(1) iniciante, sem nenhuma revisão devida: 100 % 'atual' em 20 posições (esperado e documentado)", () => {
    const plano = planNext(estadoMix(), HOJE_MIX, "seed-mix", { n: 20 });
    expect(plano).toHaveLength(20);
    expect(plano.every((a) => a.kind === "aula" || a.kind === "pratica" || a.kind === "legado")).toBe(true);
  });

  test("(2) backlog: 6 devidas (2 dias de atraso) -> toda janela de 10 tem 2 a 4 revisões, todas das habilidades devidas", () => {
    const s = estadoMix();
    const devidas = habilidadesLivres(6);
    expect(devidas).toHaveLength(6);
    comRevisoesDevidas(s, devidas, 2);
    const plano = planNext(s, HOJE_MIX, "seed-mix", { n: N_MIX });
    const kinds = plano.map((a) => a.kind);
    for (const c of janelas10(kinds, "revisao")) {
      expect(c).toBeGreaterThanOrEqual(2);
      expect(c).toBeLessThanOrEqual(4);
    }
    for (const a of plano.filter((x) => x.kind === "revisao")) expect(devidas).toContain(a.skillIds[0]);
    // nunca 2 revisões forçadas seguidas da MESMA habilidade (restrição dura preservada)
    for (let i = 1; i < plano.length; i++) {
      if (plano[i].skillIds[0] === plano[i - 1].skillIds[0]) {
        expect(plano[i - 1].kind).toBe("aula");
        expect(plano[i].kind).toBe("pratica");
      }
    }
  });

  test("(2b) mesmo com UMA única revisão devida (atraso pequeno), a janela recebe ≥ 2 (antes: 0)", () => {
    const s = estadoMix();
    comRevisoesDevidas(s, habilidadesLivres(1), 2);
    const kinds = planNext(s, HOJE_MIX, "seed-mix", { n: N_MIX }).map((a) => a.kind);
    for (const c of janelas10(kinds, "revisao")) expect(c).toBeGreaterThanOrEqual(2);
  });

  test("(3) estabelecido com revisões atrasadas > 3 dias -> toda janela tem ≥ 3 revisões e ≤ 35 %", () => {
    const s = estadoMix();
    comRevisoesDevidas(s, habilidadesLivres(8), 10);
    const kinds = planNext(s, HOJE_MIX, "seed-mix", { n: N_MIX }).map((a) => a.kind);
    for (const c of janelas10(kinds, "revisao")) {
      expect(c).toBeGreaterThanOrEqual(3);
      expect(c / 10).toBeLessThanOrEqual(0.35);
    }
  });

  test("(4a) alto Mastery e baixa Confidence NÃO vira desafio (desafio exige C ≥ 50)", () => {
    const s = estadoMix();
    const skills = MAT_SKILLS.slice(0, 6);
    for (const sk of skills) {
      // θ alto, mas só 1,5 de evidência efetiva: Mastery ≥ 75 e Confidence baixa.
      const entry: SkillModelEntry = {
        skillId: sk.id, theta: 2, sigma: 0.6, nEff: 1.5, difficultiesSeen: [3], recent: [1, 1],
        independentShare: 1, lastEvidenceDate: HOJE_MIX, lapses: 0, dontKnowRecent: 0, helpHeavyRecent: 0,
        source: "evidencia", algoVersion: 1, updatedAt: `${HOJE_MIX}T09:00:00.000Z`,
      };
      s.learning.skillModel[sk.id] = entry;
      s.learning.skillEvidence[sk.id] = updateSkillEvidence(undefined, sk.id, { exerciseId: `${sk.id}-0`, correct: true, localDate: HOJE_MIX });
    }
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["mat"], areas: [] };
    const plano = planNext(s, HOJE_MIX, "seed-mix", { n: N_MIX });
    expect(plano.some((a) => a.kind === "desafio")).toBe(false);
  });

  test("(4b) com muitas habilidades FIRMES, desafio aparece mas nunca passa de 2 por janela de 10", () => {
    const s = estadoMix();
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["mat"], areas: [] };
    for (const sk of MAT_SKILLS) {
      const { modelo, evidencia } = responderVezes(undefined, undefined, sk.id, true, 10, "2026-09-24");
      s.learning.skillModel[sk.id] = modelo;
      s.learning.skillEvidence[sk.id] = evidencia;
    }
    const kinds = planNext(s, HOJE_MIX, "seed-mix", { n: N_MIX }).map((a) => a.kind);
    expect(kinds.includes("desafio")).toBe(true);
    for (const c of janelas10(kinds, "desafio")) expect(c).toBeLessThanOrEqual(2);
  });

  test("(5) revisão devida + desafio disponível: as duas regras convivem (≥ 2 revisões e ≤ 2 desafios por janela)", () => {
    const s = estadoMix();
    for (const sk of MAT_SKILLS) {
      const { modelo, evidencia } = responderVezes(undefined, undefined, sk.id, true, 10, "2026-09-24");
      s.learning.skillModel[sk.id] = modelo;
      s.learning.skillEvidence[sk.id] = evidencia;
    }
    // 2 das habilidades de mat ficam com revisão vencida (viram DEVIDA em vez de FIRME)
    for (const sk of MAT_SKILLS.slice(0, 2)) s.learning.reviewSchedule[sk.id] = { skillId: sk.id, intervalDays: 3, dueDate: diasAtras(2), lastResult: "correct" };
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["mat"], areas: [] };
    const kinds = planNext(s, HOJE_MIX, "seed-mix", { n: N_MIX }).map((a) => a.kind);
    for (const c of janelas10(kinds, "revisao")) expect(c).toBeGreaterThanOrEqual(2);
    for (const c of janelas10(kinds, "desafio")) expect(c).toBeLessThanOrEqual(2);
  });
});

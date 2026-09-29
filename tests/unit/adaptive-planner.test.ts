import { describe, expect, test } from "bun:test";
import { planNext } from "@/lib/adaptive/planner";
import { aulaConcluidaDaHabilidade, lessonIdsForSkill } from "@/lib/adaptive/candidates";
import { prerequisiteSatisfied } from "@/lib/adaptive/classify";
import { AULAS_GERADAS } from "@/content/banco/aulas-geradas";
import { SKILL_MAP } from "@/content/taxonomy";
import { learningStateVazio } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

/**
 * Planejador (docs/30 §11.5, Fase 8 F8.5) — restrições, proporção,
 * determinismo. Estado mínimo: foco "todas" (padrão), sem nenhuma
 * evidência — a maioria das habilidades ativas entra como NOVA.
 */

function estadoBase(): Pick<AppState, "prefs" | "learning" | "progress"> {
  return {
    prefs: {
      name: "Ana",
      level: "",
      targetInstitution: "",
      targetCourse: "",
      difficultSubjects: [],
      easySubjects: [],
      dailyMinutes: 10,
      studyFocus: { mode: "todas", subjectIds: [], areas: [] },
      examTargets: [],
    } as unknown as AppState["prefs"],
    learning: learningStateVazio(),
    progress: { bySubject: {}, lessons: {}, today: { date: "2026-09-24", completedBlockIds: [] } } as unknown as AppState["progress"],
  };
}

describe("planNext", () => {
  test("é determinístico — mesma entrada e semente dão o mesmo plano", () => {
    const s = estadoBase();
    const a = planNext(s, "2026-09-24", "seed-1", { n: 8 });
    const b = planNext(s, "2026-09-24", "seed-1", { n: 8 });
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
    expect(a.map((x) => x.skillIds[0])).toEqual(b.map((x) => x.skillIds[0]));
  });

  test("sementes diferentes podem produzir planos diferentes (não é sempre a mesma ordem fixa)", () => {
    const s = estadoBase();
    const a = planNext(s, "2026-09-24", "seed-1", { n: 8 });
    const b = planNext(s, "2026-09-24", "seed-2", { n: 8 });
    // Não afirmamos que SÃO diferentes (podem empatar por matéria/skillId em estado vazio),
    // só que a função aceita sementes diferentes sem lançar e devolve planos válidos.
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
  });

  test("gera até n atividades", () => {
    const s = estadoBase();
    const plano = planNext(s, "2026-09-24", "seed-1", { n: 8 });
    expect(plano.length).toBeLessThanOrEqual(8);
    expect(plano.length).toBeGreaterThan(0);
  });

  test("restrição: nunca a mesma habilidade duas vezes seguidas, exceto aula→prática", () => {
    const s = estadoBase();
    const plano = planNext(s, "2026-09-24", "seed-1", { n: 8 });
    for (let i = 1; i < plano.length; i++) {
      const anterior = plano[i - 1];
      const atual = plano[i];
      if (anterior.skillIds[0] === atual.skillIds[0] && anterior.skillIds[0]) {
        expect(anterior.kind).toBe("aula");
        expect(atual.kind).toBe("pratica");
      }
    }
  });

  test("restrição: no máximo 2 atividades seguidas da mesma matéria", () => {
    const s = estadoBase();
    const plano = planNext(s, "2026-09-24", "seed-1", { n: 8 });
    for (let i = 2; i < plano.length; i++) {
      const tresSeguidas = [plano[i - 2], plano[i - 1], plano[i]].every(
        (a) => a.subjectId === plano[i].subjectId && a.kind !== "checkpoint",
      );
      expect(tresSeguidas).toBe(false);
    }
  });

  test("com foco em 'materias', só gera atividades dessas matérias", () => {
    const s = estadoBase();
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["mat"], areas: [] };
    const plano = planNext(s, "2026-09-24", "seed-1", { n: 8 });
    expect(plano.length).toBeGreaterThan(0);
    for (const a of plano) {
      if (a.kind !== "checkpoint") expect(a.subjectId).toBe("mat");
    }
  });

  test("checkpointsHabilitado false (padrão da Fase 8) nunca insere checkpoint", () => {
    const s = estadoBase();
    const plano = planNext(s, "2026-09-24", "seed-1", { n: 8 });
    expect(plano.every((a) => a.kind !== "checkpoint")).toBe(true);
  });

  test("cada atividade tem reasons não vazio e scoreBreakdown", () => {
    const s = estadoBase();
    const plano = planNext(s, "2026-09-24", "seed-1", { n: 5 });
    for (const a of plano) {
      expect(a.reasons.length).toBeGreaterThan(0);
      expect(a.id).toMatch(/^atv-2026-09-24-/);
    }
  });
});

/**
 * docs/36 RF-5 (C4b, T-02.4): aula GERADA concluída conta no planner — antes só a
 * autoral contava (`lessonForSkill`), e a mesma aula voltava pra habilidade com nEff 0.
 */
describe("planNext — conclusão de aula gerada (docs/36 RF-5, C4b)", () => {
  const AULA_GERADA = "aula-bio-ecologia-relacoes-ecossistema";
  const concluida = { version: 1, completedAt: "2026-09-28T10:00:00.000Z", stars: 3 as const, bestPct: 100 };

  test("lessonIdsForSkill enxerga a aula gerada; aulaConcluidaDaHabilidade reconhece a conclusão", () => {
    expect(lessonIdsForSkill("bio:ecologia-relacoes-ecossistema")).toEqual([AULA_GERADA]);
    expect(aulaConcluidaDaHabilidade("bio:ecologia-relacoes-ecossistema", {})).toBe(false);
    expect(aulaConcluidaDaHabilidade("bio:ecologia-relacoes-ecossistema", { [AULA_GERADA]: concluida })).toBe(true);
  });

  test("controle: sem concluir nada, o plano de bio propõe 'aula' (habilidades só com aula gerada)", () => {
    const s = estadoBase();
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["bio"], areas: [] };
    const plano = planNext(s, "2026-09-28", "seed-1", { n: 10 });
    expect(plano.some((a) => a.kind === "aula")).toBe(true);
  });

  test("aulas geradas de bio concluídas (nEff 0) -> o plano não repõe essas aulas; a habilidade vira prática", () => {
    const s = estadoBase();
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["bio"], areas: [] };
    const geradas = AULAS_GERADAS.filter((x) => x.subjectId === "bio");
    for (const r of geradas) s.learning.completedLessons[r.lessonId] = concluida;
    const plano = planNext(s, "2026-09-28", "seed-1", { n: 20 });
    expect(plano.length).toBeGreaterThan(0);
    // (habilidades com aula AUTORAL ainda não concluída, como bio:membrana-estrutura, seguem com "aula" — correto)
    expect(plano.some((a) => a.kind === "aula" && geradas.some((r) => r.lessonId === a.lessonId))).toBe(false);
    expect(plano.some((a) => a.skillIds[0] === "bio:ecologia-relacoes-ecossistema" && a.kind === "pratica")).toBe(true);
  });

  test("pré-requisito só com aula gerada: concluída satisfaz o pré-requisito da dependente; sem concluir, não", () => {
    // mat:volume-solidos-geometricos exige mat:area-perimetro-figuras-planas (só aula gerada).
    const prereq = SKILL_MAP["mat:area-perimetro-figuras-planas"];
    const AULA_PREREQ = "aula-mat-area-perimetro-figuras-planas";
    const learningSem = { skillModel: {}, skillEvidence: {}, completedLessons: {} };
    const learningCom = { skillModel: {}, skillEvidence: {}, completedLessons: { [AULA_PREREQ]: concluida } };
    expect(lessonIdsForSkill(prereq.id)).toEqual([AULA_PREREQ]);
    expect(prerequisiteSatisfied(prereq, learningSem, lessonIdsForSkill(prereq.id), "2026-09-28")).toBe(false);
    expect(prerequisiteSatisfied(prereq, learningCom, lessonIdsForSkill(prereq.id), "2026-09-28")).toBe(true);
  });
});

/** docs/36 RF-7 (C4e, T-02.6): o id entra com o contador monotônico da jornada — nunca colide com atividade já concluída. */
describe("planNext — id de atividade sem colisão (docs/36 RF-7, C4e)", () => {
  test("depois de concluir uma atividade (seq+1) o replano no mesmo dia gera ids diferentes na mesma posição", () => {
    const s = estadoBase();
    const antes = planNext(s, "2026-09-28", "2026-09-28", { n: 3 });
    s.learning.journey.seq = 1; // uma conclusão aconteceu
    const depois = planNext(s, "2026-09-28", "2026-09-28", { n: 3 });
    expect(depois[0].id).not.toBe(antes[0].id);
  });

  test("dois planos seguidos SEM conclusão/descarte têm os mesmos ids (estável entre renders)", () => {
    const s = estadoBase();
    s.learning.journey.seq = 4;
    const a = planNext(s, "2026-09-28", "2026-09-28", { n: 5 });
    const b = planNext(s, "2026-09-28", "2026-09-28", { n: 5 });
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });

  test("sem seq gravado o default é history.length (conta antiga não muda de id à toa)", () => {
    const s = estadoBase();
    const semSeq = planNext(s, "2026-09-28", "2026-09-28", { n: 3 });
    s.learning.journey.seq = 0;
    const comSeq0 = planNext(s, "2026-09-28", "2026-09-28", { n: 3 });
    expect(semSeq.map((x) => x.id)).toEqual(comSeq0.map((x) => x.id));
  });
});

describe("planNext — sinal de desafio do checkpoint (docs/36 T-04.4, RP-4)", () => {
  test("com vários sinais válidos, o plano traz NO MÁXIMO 1 desafio vindo do sinal", () => {
    const s = estadoBase();
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["mat"], areas: [] };
    const skills = ["mat:operacoes-fundamentais", "mat:razao-proporcao", "mat:porcentagem-conceito", "mat:equacao-primeiro-grau"];
    const sinais: Record<string, string> = {};
    for (const id of skills) {
      s.learning.skillModel[id] = {
        skillId: id, theta: 0.8, sigma: 0.7, nEff: 3, difficultiesSeen: [2, 3], recent: [1, 1, 1],
        independentShare: 1, lastEvidenceDate: "2026-09-24", lapses: 0, dontKnowRecent: 0, helpHeavyRecent: 0,
        source: "evidencia", algoVersion: 1, updatedAt: "2026-09-24T10:00:00.000Z",
      };
      sinais[id] = "2026-09-30";
    }
    s.learning.journey.challengeEligible = sinais;
    const plano = planNext(s, "2026-09-24", "seed-sinal", { n: 8 });
    const desafios = plano.filter((a) => a.kind === "desafio");
    expect(desafios).toHaveLength(1); // sinal aparece (1) e não passa do limite (não 2+)
    for (const d of desafios) expect(skills).toContain(d.skillIds[0]);
  });
});

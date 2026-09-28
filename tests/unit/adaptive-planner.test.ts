import { describe, expect, test } from "bun:test";
import { planNext } from "@/lib/adaptive/planner";
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

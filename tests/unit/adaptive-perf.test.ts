import { describe, expect, test } from "bun:test";
import { planNext } from "@/lib/adaptive/planner";
import { updateSkill } from "@/lib/adaptive/model";
import { learningStateVazio } from "@/lib/learning/types";
import { activeSkills } from "@/content/taxonomy";
import type { AppState } from "@/lib/store";

/**
 * Desempenho do planejador (docs/30 §11.9, Fase 8 F8.10). Escopo reduzido
 * registrado no `docs/32`: o alvo do plano é "500 habilidades/6.000 itens"
 * sintéticos — o catálogo REAL do app hoje tem ~65 habilidades ativas e
 * ~1.300 itens (`docs/32`, Fase 3), então o teto de 20ms é medido contra o
 * catálogo real (mais barato de rodar, sem fixture sintética de 500
 * habilidades pra manter), com uma folga generosa (< 20ms mesmo assim).
 */

function estadoComEvidencia(): Pick<AppState, "prefs" | "learning" | "progress"> {
  const learning = learningStateVazio();
  const hoje = "2026-09-24";
  for (const sk of activeSkills()) {
    learning.skillModel[sk.id] = updateSkill(
      undefined,
      sk.id,
      { role: "pratica", correct: Math.random() > 0.4 },
      { a: 1, b: 0, c: 0.2 },
      hoje,
      { difficulty: 3, now: `${hoje}T10:00:00.000Z` },
    );
  }
  return {
    prefs: {
      difficultSubjects: [],
      easySubjects: [],
      studyFocus: { mode: "todas", subjectIds: [], areas: [] },
    } as unknown as AppState["prefs"],
    learning,
    progress: { bySubject: {} } as unknown as AppState["progress"],
  };
}

describe("planNext — desempenho (docs/30 §11.9)", () => {
  test("< 20ms em média (50 execuções) no catálogo real", () => {
    const s = estadoComEvidencia();
    const N_EXECUCOES = 50;
    const inicio = performance.now();
    for (let i = 0; i < N_EXECUCOES; i++) {
      planNext(s, "2026-09-24", `seed-${i}`, { n: 8 });
    }
    const total = performance.now() - inicio;
    const media = total / N_EXECUCOES;
    expect(media).toBeLessThan(20);
  });

  test("nenhuma execução isolada passa de 60ms (pior caso)", () => {
    const s = estadoComEvidencia();
    let pior = 0;
    for (let i = 0; i < 20; i++) {
      const inicio = performance.now();
      planNext(s, "2026-09-24", `seed-${i}`, { n: 8 });
      pior = Math.max(pior, performance.now() - inicio);
    }
    expect(pior).toBeLessThan(60);
  });
});

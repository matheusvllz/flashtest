import { describe, expect, test } from "bun:test";
import { bAlvo, selectItems } from "@/lib/adaptive/select-items";
import { itemMetaOf } from "@/content/items";
import type { Attempt, LearningState } from "@/lib/learning/types";

/**
 * Seleção de itens (docs/30 §11.7, Fase 8 F8.6).
 */

describe("bAlvo", () => {
  test("θ=0, p-alvo=0,7, item de 5 alternativas (c=0,2 nominal) → b-alvo ≈ -0,85 ± 0,1 (critério F8.6)", () => {
    const b = bAlvo(0, 0.7);
    expect(b).toBeGreaterThanOrEqual(-0.95);
    expect(b).toBeLessThanOrEqual(-0.75);
  });

  test("p-alvo maior → b-alvo menor (item mais fácil precisa ficar mais fácil, b menor)", () => {
    const facil = bAlvo(0, 0.85);
    const dificil = bAlvo(0, 0.5);
    expect(facil).toBeLessThan(dificil);
  });

  test("θ maior desloca b-alvo pra cima (mesma probabilidade exige item mais difícil)", () => {
    const baixo = bAlvo(-1, 0.7);
    const alto = bAlvo(1, 0.7);
    expect(alto).toBeGreaterThan(baixo);
  });
});

describe("selectItems", () => {
  const learningVazio: Pick<LearningState, "recentAttempts"> = { recentAttempts: [] };

  test("devolve itens da habilidade, sem nunca incluir item visto HOJE", () => {
    const skillId = "mat:porcentagem-conceito";
    const r1 = selectItems(skillId, 3, 0.7, 0, learningVazio, "2026-09-24", "seed-1", "pratica");
    expect(r1.itemIds.length).toBeGreaterThan(0);

    const vistoHoje: Attempt = {
      id: "a1",
      sessionId: null,
      exerciseId: r1.itemIds[0],
      exerciseVersion: 1,
      skillIds: [skillId],
      role: "pratica",
      answer: 0,
      correct: true,
      hintUsed: false,
      tutorUsed: false,
      firstSubmission: true,
      submittedAt: "2026-09-24T10:00:00.000Z",
      localDate: "2026-09-24",
      durationMs: 3000,
    };
    const r2 = selectItems(skillId, 3, 0.7, 0, { recentAttempts: [vistoHoje] }, "2026-09-24", "seed-1", "pratica");
    expect(r2.itemIds).not.toContain(r1.itemIds[0]);
  });

  test("ordem de apresentação final é dificuldade crescente", () => {
    const r = selectItems("mat:porcentagem-conceito", 4, 0.7, 0, learningVazio, "2026-09-24", "seed-1", "pratica");
    const dificuldades = r.itemIds.map((id) => itemMetaOf(id).difficulty);
    for (let i = 1; i < dificuldades.length; i++) {
      expect(dificuldades[i]).toBeGreaterThanOrEqual(dificuldades[i - 1]);
    }
  });

  test("é determinístico — mesma semente, mesmo resultado", () => {
    const a = selectItems("mat:porcentagem-conceito", 3, 0.7, 0, learningVazio, "2026-09-24", "seed-x", "pratica");
    const b = selectItems("mat:porcentagem-conceito", 3, 0.7, 0, learningVazio, "2026-09-24", "seed-x", "pratica");
    expect(a.itemIds).toEqual(b.itemIds);
  });

  test("sementes diferentes podem escolher itens diferentes dentro do pool próximo", () => {
    const a = selectItems("mat:porcentagem-conceito", 2, 0.7, 0, learningVazio, "2026-09-24", "seed-a", "pratica");
    const b = selectItems("mat:porcentagem-conceito", 2, 0.7, 0, learningVazio, "2026-09-24", "seed-b", "pratica");
    expect(a.itemIds.length).toBeGreaterThan(0);
    expect(b.itemIds.length).toBeGreaterThan(0);
  });

  test("habilidade sem pool nenhum (inexistente) → poolCurto true, itemIds reduzido", () => {
    const r = selectItems("mat:habilidade-que-nao-existe", 5, 0.7, 0, learningVazio, "2026-09-24", "seed-1", "pratica");
    expect(r.poolCurto).toBe(true);
    expect(r.itemIds.length).toBeLessThan(5);
  });

  test("respeita minDifficulty quando informado — nunca devolve item abaixo do mínimo", () => {
    const r = selectItems(
      "mat:porcentagem-conceito",
      3,
      0.5,
      0,
      learningVazio,
      "2026-09-24",
      "seed-1",
      "desafio",
      3,
      undefined,
    );
    for (const id of r.itemIds) {
      expect(itemMetaOf(id).difficulty).toBeGreaterThanOrEqual(3);
    }
  });

  test("respeita maxDifficulty quando informado — nunca devolve item acima do máximo", () => {
    const r = selectItems(
      "mat:porcentagem-valor",
      3,
      0.8,
      0,
      learningVazio,
      "2026-09-24",
      "seed-1",
      "pratica",
      undefined,
      2,
    );
    for (const id of r.itemIds) {
      expect(itemMetaOf(id).difficulty).toBeLessThanOrEqual(2);
    }
  });
});

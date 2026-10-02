import { describe, expect, test } from "bun:test";
import { estadoDaSequencia } from "@/lib/sequencia";
import type { AppState } from "@/lib/store";

/** Estado mostrado pelo indicador de sequência (spec 48 T-48.6.1, RF-15): a fonte dos números é dita com honestidade. */
const HOJE = "2026-09-30";
function s(progress: Partial<AppState["progress"]>, account?: Partial<NonNullable<AppState["account"]>>): AppState {
  return {
    progress: {
      streak: 4,
      bestStreak: 4,
      streakFreezes: 1,
      activityDays: [HOJE],
      lastStudyDate: null,
      today: { date: HOJE, lessons: 0, flashcards: 0, redacao: 0, completedBlockIds: [] },
      ...progress,
    },
    account: account ? { userId: "u1", outbox: [], ...account } : undefined,
  } as unknown as AppState;
}

describe("estadoDaSequencia", () => {
  test("sem conta: contado neste aparelho", () => {
    expect(estadoDaSequencia(s({}), HOJE).conta).toBe("aparelho");
  });

  test("com conta e fila pendente: atualizando (não afirma que está na conta)", () => {
    expect(estadoDaSequencia(s({ sequenciaConfirmadaEm: "2026-09-30T10:00:00Z" }, { outbox: [{} as never] }), HOJE).conta).toBe("atualizando");
  });

  test("com conta, fila vazia e confirmação do servidor: confirmada", () => {
    expect(estadoDaSequencia(s({ sequenciaConfirmadaEm: "2026-09-30T10:00:00Z" }, {}), HOJE).conta).toBe("confirmada");
  });

  test("com conta mas nunca confirmada: atualizando", () => {
    expect(estadoDaSequencia(s({}, {}), HOJE).conta).toBe("atualizando");
  });

  test("proteção usada nos últimos 7 dias aparece; mais antiga, não", () => {
    expect(estadoDaSequencia(s({ diaProtegido: "2026-09-27" }), HOJE).protecaoRecente).toBe("2026-09-27");
    expect(estadoDaSequencia(s({ diaProtegido: "2026-09-01" }), HOJE).protecaoRecente).toBeNull();
  });

  test("volta depois de pausa: recorde como meta; estoque mostrado como está e o teto vem do plano (spec 49 D49-05)", () => {
    const e = estadoDaSequencia(s({ streak: 1, bestStreak: 9, streakFreezes: 5 }), HOJE);
    expect(e.voltando).toBe(true);
    // Estoque de um plano anterior (ou comprado) aparece inteiro; sem conta, o teto é o do Free (2).
    expect(e.protecoes).toBe(5);
    expect(e.protecoesMax).toBe(2);
    expect(estadoDaSequencia(s({ streakFreezes: -1 }), HOJE).protecoes).toBe(0);
    expect(estadoDaSequencia(s({ activityDays: [] }), HOJE).estudouHoje).toBe(false);
  });
});

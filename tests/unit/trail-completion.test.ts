import { describe, expect, test } from "bun:test";
import { chapterById } from "@/content/curriculum-tree";
import type { CurriculumSection } from "@/content/curriculum-tree";
import { isChapterCompleted, isSectionCompleted } from "@/lib/learning/trail";
import type { AppState } from "@/lib/store";

/**
 * T-09 (docs/25-plano-evolucao-aprendizagem-v2.md) — `isChapterCompleted`/
 * `isSectionCompleted` com estados sintéticos, cobrindo os dois formatos de
 * capítulo que a árvore mistura (docs/25 §6.6): "micro" (lições avulsas,
 * completude em `learning.completedLessons`) e "legado" (capítulo derivado
 * de uma trilha de redação existente, completude em `progress.lessons`).
 *
 * Usa capítulos REAIS de `curriculum-tree.ts` (não inventa ids) pra não
 * divergir da árvore de verdade: `mat-porcentagem` (micro, 2 lições) e
 * `crase` (legado, capítulo derivado de `TRILHAS` via `buildLegacyChapter`,
 * id = trilhaId = "crase").
 */

function state(overrides: {
  completedLessons?: AppState["learning"]["completedLessons"];
  lessons?: AppState["progress"]["lessons"];
} = {}): AppState {
  return {
    learning: {
      activeSession: null,
      completedLessons: overrides.completedLessons ?? {},
      skillEvidence: {},
      reviewSchedule: {},
      recentAttempts: [],
      rewardLedger: {},
      tipHistory: [],
    },
    progress: {
      lessons: overrides.lessons ?? {},
    },
  } as unknown as AppState;
}

const microChapter = chapterById("mat-porcentagem");
const legacyChapter = chapterById("crase");

if (!microChapter) throw new Error("fixture: capítulo micro 'mat-porcentagem' não existe mais em curriculum-tree.ts");
if (!legacyChapter) throw new Error("fixture: capítulo legado 'crase' não existe mais em curriculum-tree.ts");

describe("isChapterCompleted — capítulo micro (docs/25 §6.6)", () => {
  test("0/2 lições em learning.completedLessons -> false", () => {
    expect(isChapterCompleted(microChapter, state())).toBe(false);
  });

  test("1/2 lições (parcial) -> false", () => {
    const s = state({
      completedLessons: {
        [microChapter.lessonIds[0]]: { version: 1, completedAt: "2026-09-01" },
      },
    });
    expect(isChapterCompleted(microChapter, s)).toBe(false);
  });

  test("2/2 lições -> true", () => {
    const s = state({
      completedLessons: Object.fromEntries(
        microChapter.lessonIds.map((id) => [id, { version: 1, completedAt: "2026-09-01" }]),
      ),
    });
    expect(isChapterCompleted(microChapter, s)).toBe(true);
  });
});

describe("isChapterCompleted — capítulo legado (docs/25 §6.6)", () => {
  test("nenhuma lição em progress.lessons -> false", () => {
    expect(isChapterCompleted(legacyChapter, state())).toBe(false);
  });

  test("só parte das lições em progress.lessons -> false", () => {
    const metade = legacyChapter.lessonIds.slice(0, Math.ceil(legacyChapter.lessonIds.length / 2));
    const s = state({
      lessons: Object.fromEntries(
        metade.map((id) => [id, { lessonId: id, stars: 3, bestPct: 100, completedAt: "2026-09-01" }]),
      ),
    });
    expect(isChapterCompleted(legacyChapter, s)).toBe(false);
  });

  test("todas as lições da trilha em progress.lessons -> true", () => {
    const s = state({
      lessons: Object.fromEntries(
        legacyChapter.lessonIds.map((id) => [
          id,
          { lessonId: id, stars: 3, bestPct: 100, completedAt: "2026-09-01" },
        ]),
      ),
    });
    expect(isChapterCompleted(legacyChapter, s)).toBe(true);
  });
});

describe("isSectionCompleted — todos os capítulos concluídos (docs/25 §6.6)", () => {
  const secao: CurriculumSection = {
    id: "secao-teste-mista",
    title: "Seção sintética (micro + legado)",
    chapters: [microChapter, legacyChapter],
  };

  test("1 capítulo concluído, 1 não -> false", () => {
    const s = state({
      completedLessons: Object.fromEntries(
        microChapter.lessonIds.map((id) => [id, { version: 1, completedAt: "2026-09-01" }]),
      ),
      // legado sem nenhuma lição em progress.lessons.
    });
    expect(isSectionCompleted(secao, s)).toBe(false);
  });

  test("os dois capítulos concluídos -> true", () => {
    const s = state({
      completedLessons: Object.fromEntries(
        microChapter.lessonIds.map((id) => [id, { version: 1, completedAt: "2026-09-01" }]),
      ),
      lessons: Object.fromEntries(
        legacyChapter.lessonIds.map((id) => [
          id,
          { lessonId: id, stars: 3, bestPct: 100, completedAt: "2026-09-01" },
        ]),
      ),
    });
    expect(isSectionCompleted(secao, s)).toBe(true);
  });

  // Seção sem capítulos: `chapters: []` é estruturalmente válida (o tipo
  // `CurriculumSection` não exige `chapters` não-vazio, e a árvore real não
  // tem nenhuma hoje) — não é um caso a "pular por ser inválido". O
  // resultado é vacuamente `true` por `Array.prototype.every` em array
  // vazio: documentamos o comportamento em vez de forçar um assert que
  // finja incerteza sobre algo que a linguagem já define.
  test("seção sem capítulos -> true (vacuamente, Array.prototype.every em [])", () => {
    const secaoVazia: CurriculumSection = { id: "secao-vazia", title: "x", chapters: [] };
    expect(isSectionCompleted(secaoVazia, state())).toBe(true);
  });
});

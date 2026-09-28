import { describe, expect, test } from "bun:test";
import { pickQuestionsAdaptive } from "@/routes/study";
import { learningStateVazio } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

/**
 * "Praticar" pelo motor adaptativo (docs/30 §11.10, Fase 12 F12.7) —
 * `pickQuestionsAdaptive` reaproveita `planWithFallback`/
 * `selectItemsForActivity` (não reimplementa classificação/pontuação aqui).
 *
 * Achado real ao escrever este teste (corrigido na hora, não é bug do código
 * novo): a maioria das ~65 habilidades ativas NÃO tem microlição própria
 * (só 8 têm, `docs/32` Fase 2/3) — pra essas, `candidateForSkill` (Fase 8,
 * `candidates.ts`) já gera "pratica" direto quando a habilidade está NOVA
 * (não "aula", porque não existe aula pra oferecer). Isso significa que um
 * estado totalmente vazio NÃO cai em `pickQuestions` legado — quase sempre
 * já existe alguma prática real disponível. A premissa original deste
 * arquivo ("estado vazio → null") estava errada; corrigida abaixo pra testar
 * o `null` de um jeito que É garantido (foco numa matéria inexistente, pool
 * de candidatos vazio de propósito) em vez de um cenário que por acaso deu
 * null nesta rodada mas dependeria da ordem/pontuação entre ~65 habilidades.
 */

function estadoBase(
  overrides: { studyFocus?: AppState["prefs"]["studyFocus"] } = {},
): Pick<AppState, "prefs" | "learning" | "progress"> {
  return {
    prefs: {
      studyFocus: overrides.studyFocus ?? { mode: "todas", subjectIds: [], areas: [] },
      easySubjects: [],
      difficultSubjects: [],
    } as unknown as AppState["prefs"],
    learning: learningStateVazio(),
    progress: {
      bySubject: {},
      lessons: {},
      today: { date: "2026-09-24", completedBlockIds: [] },
    } as unknown as AppState["progress"],
  };
}

describe("pickQuestionsAdaptive", () => {
  test("estado vazio: habilidades sem microlição própria já entram em prática — 2 questões reais do banco geral, mesma habilidade", () => {
    const perguntas = pickQuestionsAdaptive(estadoBase());
    expect(perguntas).not.toBeNull();
    expect(perguntas).toHaveLength(2);
    // As duas vêm da MESMA atividade (uma habilidade só) — mesma matéria.
    expect(perguntas?.[0].subject).toBe(perguntas?.[1].subject);
  });

  test("foco restrito a uma matéria sem habilidade nenhuma → nenhum candidato → null (cai no pickQuestions de sempre)", () => {
    const s = estadoBase({
      studyFocus: { mode: "materias", subjectIds: ["materia-inexistente"], areas: [] },
    });
    expect(pickQuestionsAdaptive(s)).toBeNull();
  });
});

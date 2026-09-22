import { describe, expect, test } from "bun:test";
import { MICROLICOES, microLessonById, resolveExercise } from "@/content/microlicoes";
import { checkAnswer } from "@/lib/lessons/define";
import { questionSteps, stepsOf } from "@/lib/learning/steps";

/**
 * Critério A7 (docs/20 §20, Fase 6) + docs/25 §18 T-13/T-14: cada uma das
 * seis lições publicadas possui objetivo, fonte/revisão, ensino, checkpoint,
 * questões de prática/desafio e recap; percurso não exige IA; drafts não
 * aparecem; estimativas distinguem ensino e prática. Desde T-13 as 6 lições
 * são v2 (4-8 questões intercaladas com ensino, dificuldade progressiva) em
 * vez do formato antigo (checkpoint + 2 práticas fixas) — os testes abaixo
 * usam `stepsOf`/`questionSteps` (que normalizam v1/v2) em vez de acessar
 * `blocks`/`checkpointExerciseId`/`practiceExerciseIds` direto, que não
 * existem mais em v2. O import acima já executa a validação de carga
 * (`assertContentValid` + `validateMicroLessons`) — se o conteúdo estivesse
 * quebrado, o teste nem chegaria a rodar.
 */
describe("microlições — catálogo piloto (A7)", () => {
  test("exatamente seis lições publicadas, todas 'reviewed' ou 'published' (nunca draft)", () => {
    expect(MICROLICOES.length).toBe(6);
    for (const l of MICROLICOES) {
      expect(l.status).not.toBe("draft");
    }
  });

  test("toda lição tem objetivo, fonte e data de revisão", () => {
    for (const l of MICROLICOES) {
      expect(l.objective.length).toBeGreaterThan(10);
      expect(l.sources.length).toBeGreaterThan(0);
      expect(l.reviewedAt).not.toBeNull();
    }
  });

  test("toda lição tem pelo menos dois passos de ensino e um recap não vazio", () => {
    for (const l of MICROLICOES) {
      const teachCount = stepsOf(l).filter((s) => s.kind === "teach").length;
      expect(teachCount).toBeGreaterThanOrEqual(2);
      expect(l.recap.length).toBeGreaterThan(5);
    }
  });

  test("estimativas de ensino (30-90s) e prática distintas, nenhuma zerada", () => {
    for (const l of MICROLICOES) {
      expect(l.estimatedTeachingSeconds).toBeGreaterThanOrEqual(30);
      expect(l.estimatedTeachingSeconds).toBeLessThanOrEqual(90);
      expect(l.estimatedPracticeSeconds).toBeGreaterThan(0);
    }
  });

  /**
   * docs/25 §18 T-14: substitui a antiga contagem fixa de "checkpoint + 2
   * práticas + 2 revisões = 5 posições" (regra de v1) pela faixa v2 de 4-8
   * questões por lição (`validateLessonSteps`, código `steps-questoes-quantidade`).
   * O total de 30 é uma consequência do piloto (6 lições × 5 questões cada,
   * não um mínimo/máximo imposto por regra) — comentado aqui pra não virar
   * número mágico.
   */
  test("cada lição tem de 4 a 8 questões (docs/25 T-04); total das 6 lições do piloto é 30 (6 × 5)", () => {
    let total = 0;
    for (const l of MICROLICOES) {
      const qs = questionSteps(stepsOf(l));
      expect(qs.length).toBeGreaterThanOrEqual(4);
      expect(qs.length).toBeLessThanOrEqual(8);
      expect(l.reviewExerciseIds.length).toBe(2);
      total += qs.length;
    }
    expect(total).toBe(30);
  });

  test("toda referência de exercício (questões da lição + revisão) resolve pra um Exercise correto e verificável", () => {
    for (const l of MICROLICOES) {
      const ids = [
        ...questionSteps(stepsOf(l)).map(({ step }) => step.exerciseId),
        ...l.reviewExerciseIds,
      ];
      for (const id of ids) {
        const exercicio = resolveExercise(id);
        expect(exercicio).toBeDefined();
        // Checkpoint/prática/desafio/revisão do piloto são múltipla-escolha,
        // verdadeiro-falso ou complete-lacuna — a correção pura já validada
        // por `define.ts`.
        if (exercicio.type === "multipla-escolha" || exercicio.type === "complete-lacuna") {
          expect(checkAnswer(exercicio, exercicio.correta)).toBe(true);
        } else if (exercicio.type === "verdadeiro-falso") {
          expect(checkAnswer(exercicio, exercicio.verdadeiro ? 1 : 0)).toBe(true);
        }
      }
    }
  });

  test("microLessonById encontra cada lição do catálogo pelo próprio id", () => {
    for (const l of MICROLICOES) {
      expect(microLessonById(l.id)?.id).toBe(l.id);
    }
  });

  test("resolveExercise lança para um id inexistente, em vez de devolver algo errado", () => {
    expect(() => resolveExercise("nao-existe-em-lugar-nenhum")).toThrow();
  });

  /**
   * T-03 (docs/25 §18): `resolveExercise` ganha um terceiro fallback pra
   * ids de trilha legada (`${lessonId}:${index}`), pra reaproveitar os 1.204
   * exercícios de redação dentro de uma lição v2 futura.
   */
  test("resolveExercise resolve um id de trilha legada (lessonId:index)", () => {
    const exercicio = resolveExercise("crase-01-a-regra-de-ouro:0");
    expect(exercicio).toBeDefined();
    expect(exercicio.type).toBe("multipla-escolha");
    if (exercicio.type === "multipla-escolha") {
      expect(exercicio.pergunta).toBe("O que é crase?");
    }
  });

  test("resolveExercise lança para um id de trilha legada com lição inexistente", () => {
    expect(() => resolveExercise("licao-que-nao-existe:0")).toThrow();
  });

  test("resolveExercise lança para um id de trilha legada com índice fora do array", () => {
    expect(() => resolveExercise("crase-01-a-regra-de-ouro:9999")).toThrow();
  });

  test("cada matéria piloto (bio/mat/por) tem exatamente duas lições", () => {
    const porMateria = new Map<string, number>();
    for (const l of MICROLICOES) {
      porMateria.set(l.subjectId, (porMateria.get(l.subjectId) ?? 0) + 1);
    }
    expect(porMateria.get("bio")).toBe(2);
    expect(porMateria.get("mat")).toBe(2);
    expect(porMateria.get("por")).toBe(2);
  });
});

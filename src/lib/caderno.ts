/**
 * Revisão do caderno de erros (spec 49 §5.9 item 2, T-49.9.1): as questões do dia viram uma sessão curta no mesmo
 * player das lições. Não paga XP (é revisão do que já foi respondido); cada resposta entra na sincronização como
 * resposta de lição e o servidor avança ou reinicia o intervalo do item.
 */
import { itemMetaOf } from "@/content/items";
import { resolveExercise } from "@/content/microlicoes";
import { SKILL_MAP } from "@/content/taxonomy";
import { COPY } from "@/lib/copy";
import type { LessonStep, MicroLessonV2, QuestionStep } from "@/lib/learning/types";

/** Uma sessão do caderno tem o tamanho de uma lição (4–8 questões; spec 49 §0). */
export const MAX_POR_REVISAO = 8;

/** Só itens que o app consegue mostrar agora (pacote carregado, item não retirado). */
export function itensRevisaveis(ids: string[]): string[] {
  return ids.filter((id) => {
    try {
      resolveExercise(id);
      return true;
    } catch {
      return false;
    }
  });
}

export function licaoDoCaderno(ids: string[], dia: string): MicroLessonV2 {
  const itens = itensRevisaveis(ids).slice(0, MAX_POR_REVISAO);
  if (itens.length === 0) throw new Error("[caderno] nenhuma questão disponível para revisar");
  const perguntas: QuestionStep[] = itens.map((id) => ({ kind: "question", exerciseId: id, role: "revisao", difficulty: 2 }));
  const skillIds = [...new Set(itens.flatMap((id) => itemMetaOf(id).skillIds.slice(0, 1)))];
  const subjectId = SKILL_MAP[skillIds[0] ?? ""]?.subjectId ?? "caderno";
  const steps: LessonStep[] = [
    { kind: "intro", title: COPY.caderno.revisaoTitulo, body: COPY.caderno.revisaoIntro },
    ...perguntas,
    { kind: "recap", body: COPY.caderno.revisaoRecap },
  ];
  return {
    id: `caderno--${dia}`,
    version: 1,
    format: 2,
    subjectId,
    topicId: subjectId,
    chapterId: `caderno--${subjectId}`,
    title: COPY.caderno.revisaoTitulo,
    objective: COPY.caderno.revisaoTitulo,
    skillIds,
    prerequisiteLessonIds: [],
    examProfileIds: [],
    status: "published",
    estimatedTeachingSeconds: 0,
    estimatedPracticeSeconds: itens.length * 60,
    reviewExerciseIds: [],
    recap: COPY.caderno.revisaoRecap,
    sources: [],
    reviewedAt: null,
    steps,
  };
}

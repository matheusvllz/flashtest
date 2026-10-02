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
  return licaoDeRevisao(ids, {
    id: `caderno--${dia}`,
    titulo: COPY.caderno.revisaoTitulo,
    intro: COPY.caderno.revisaoIntro,
    recap: COPY.caderno.revisaoRecap,
  });
}

/**
 * Sessão de revisão com questões já respondidas (caderno, erros recentes do Praticar — spec 50 §5.7.2). Mesmo
 * formato de lição; quem chama decide se paga XP e se a resposta conta como revisão.
 */
export function licaoDeRevisao(ids: string[], o: { id: string; titulo: string; intro: string; recap: string }): MicroLessonV2 {
  const itens = itensRevisaveis(ids).slice(0, MAX_POR_REVISAO);
  if (itens.length === 0) throw new Error("[revisão] nenhuma questão disponível para revisar");
  const perguntas: QuestionStep[] = itens.map((id) => ({ kind: "question", exerciseId: id, role: "revisao", difficulty: 2 }));
  const skillIds = [...new Set(itens.flatMap((id) => itemMetaOf(id).skillIds.slice(0, 1)))];
  const subjectId = SKILL_MAP[skillIds[0] ?? ""]?.subjectId ?? "caderno";
  const steps: LessonStep[] = [
    { kind: "intro", title: o.titulo, body: o.intro },
    ...perguntas,
    { kind: "recap", body: o.recap },
  ];
  return {
    id: o.id,
    version: 1,
    format: 2,
    subjectId,
    topicId: subjectId,
    chapterId: `${o.id.split("--")[0]}--${subjectId}`,
    title: o.titulo,
    objective: o.titulo,
    skillIds,
    prerequisiteLessonIds: [],
    examProfileIds: [],
    status: "published",
    estimatedTeachingSeconds: 0,
    estimatedPracticeSeconds: itens.length * 60,
    reviewExerciseIds: [],
    recap: o.recap,
    sources: [],
    reviewedAt: null,
    steps,
  };
}

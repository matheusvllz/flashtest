import type { Question } from "@/data/questions";
import type { Exercise, MultipleChoiceExercise } from "@/lib/lessons/types";
import { lessonById } from "@/content/trilhas";

/**
 * Ponte banco geral ↔ motor de exercícios (docs/20 §14.1, Fase 5, item 3) —
 * "adaptar banco geral e motor sem editar os 1.204 exercícios em massa". Uma
 * `Question` (formato do `/study`) vira um `Exercise` de múltipla escolha
 * (formato do motor de lições/registry), sem duplicar as 59 questões: o
 * adapter lê `Question`, nunca copia o conteúdo pra outro arquivo.
 *
 * Não usado pelo `/study` hoje (que continua no seu próprio formato — Fase 1
 * não mudou isso). É a base pra uma fase futura tratar os dois bancos de
 * forma uniforme sem reescrever `src/data/questions.ts`.
 */
export function questionToExercise(q: Question): MultipleChoiceExercise {
  const correta = q.alternatives.findIndex((a) => a.key === q.correct);
  if (correta < 0) {
    throw new Error(
      `[learning] questão "${q.id}" tem gabarito "${q.correct}" que não bate com nenhuma alternativa`,
    );
  }
  return {
    type: "multipla-escolha",
    pergunta: q.statement,
    opcoes: q.alternatives.map((a) => a.text),
    correta,
    explicacao: q.explanation,
  };
}

/**
 * Resolve um id de exercício de trilha legada (`${lessonId}:${index}`,
 * `src/content/exercise-ids.ts`) pra reaproveitar os 1.204 exercícios das 15
 * trilhas de redação dentro de uma lição v2 (docs/25 §7.1/§10 item 2). Não
 * lança — `undefined` quando o id não casa o formato, a lição não existe, ou
 * o índice está fora do array; quem chama decide se isso é erro de conteúdo
 * (`resolveExercise` em `content/microlicoes/index.ts` lança) ou só "não achei
 * aqui, tenta o próximo".
 */
export function trilhaExerciseById(id: string): Exercise | undefined {
  const match = /^(.+):(\d+)$/.exec(id);
  if (!match) return undefined;
  const [, licaoId, indiceStr] = match;
  const encontrado = lessonById(licaoId);
  if (!encontrado) return undefined;
  const indice = Number(indiceStr);
  return encontrado.lesson.exercicios[indice];
}

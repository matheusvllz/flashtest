/**
 * Contexto pedagógico pro balão do tutor (docs/30 §17, Fase 7 do docs/31,
 * F7.3) — o que a Foca IA sabe sobre a habilidade em jogo ANTES de
 * responder: Mastery/Confidence atuais, erros recentes na mesma habilidade,
 * pré-requisitos fracos, quanta explicação o aluno já viu.
 *
 * Import de conteúdo (taxonomia/itens) é intencional aqui — mas este módulo
 * NUNCA é importado por `store.ts` nem por `TutorBubble.tsx` (que mora no
 * `AppShell`, presente em toda rota). Quem chama `buildPedagogicalContext`
 * são as telas que já pagam o custo do import de conteúdo (`study.tsx`,
 * `MicroLessonPlayer.tsx`, `LessonPlayer.tsx`) — o resultado, um objeto de
 * dados puro, é o que entra em `s.tutor.pedagogy` (ver `store.ts`). Repetir
 * esse import em `store.ts` reintroduz o bug de bundle da Fase 5
 * (`store-bundle-boundary.test.ts`).
 */
import { itemMetaOf } from "@/content/items";
import { resolveExercise } from "@/content/microlicoes";
import { SKILL_MAP } from "@/content/taxonomy";
import { SUBJECT_MAP } from "@/data/subjects";
import { EXAM_MAP } from "@/data/exams";
import { confidence } from "@/lib/adaptive/confidence";
import type { ConfidenceLabel } from "@/lib/adaptive/display";
import { skillDisplay } from "@/lib/adaptive/display";
import { mastery } from "@/lib/adaptive/model";
import { focusFromExercise } from "@/lib/lessons/tutor-focus";
import type { ExerciseAnswer } from "@/lib/lessons/types";
import type { Attempt, LearningState } from "@/lib/learning/types";

const LIMITE_ERROS_RECENTES = 2;
const LIMITE_PREREQUISITOS_FRACOS = 3;
const CORTE_ENUNCIADO = 240;
const MASTERY_PREREQUISITO_FRACO = 60;
const CONFIDENCE_PREREQUISITO_FRACA = 30;

export interface PedagogicalContextErro {
  statement: string;
  chosen: string | null;
  correct: string;
}

export interface PedagogicalContext {
  /** Id da habilidade na taxonomia — pro store correlacionar com `skillModel`/eventos (docs/30 §21.4), não pro prompt (que usa `skillName`). */
  skillId: string;
  skillName: string;
  subjectName: string;
  topicName: string;
  mastery: number | null;
  confidenceLabel: ConfidenceLabel;
  recentErrors: PedagogicalContextErro[];
  dontKnowRecent: number;
  explanationSeen: "nenhuma" | "curta" | "detalhada";
  weakPrerequisites: string[];
  examName: string | null;
  mode: "ensinar-do-zero" | "duvida";
}

function erroRecenteDe(attempt: Attempt): PedagogicalContextErro | null {
  try {
    const ex = resolveExercise(attempt.exerciseId);
    const focus = focusFromExercise(
      ex,
      (attempt.answer as ExerciseAnswer | null) ?? null,
      "",
      "",
      "",
      0,
      attempt.presentedOrder,
      attempt.correct,
    );
    return {
      statement: focus.statement.slice(0, CORTE_ENUNCIADO),
      chosen: focus.chosen,
      correct: focus.correct,
    };
  } catch {
    return null; // conteúdo removido/mudou de formato desde a tentativa — não trava o contexto.
  }
}

function explicacaoJaVista(attempt: Attempt | undefined): "nenhuma" | "curta" | "detalhada" {
  const nivel = attempt?.helpLevel ?? 0;
  if (nivel >= 2) return "detalhada";
  if (nivel >= 1) return "curta";
  return "nenhuma";
}

/**
 * Constrói o contexto pedagógico pra uma habilidade a partir do id de
 * exercício em foco. Retorna `null` quando o item não resolve pra uma
 * habilidade da taxonomia (item legado ainda não classificado, por exemplo)
 * — o balão cai pro contexto genérico de sempre (docs/20).
 */
export function buildPedagogicalContext(
  learning: Pick<LearningState, "skillModel" | "skillEvidence" | "reviewSchedule" | "recentAttempts">,
  examTargets: { examId: string }[],
  exerciseId: string,
  mode: "ensinar-do-zero" | "duvida",
  today: string,
): PedagogicalContext | null {
  let meta;
  try {
    meta = itemMetaOf(exerciseId);
  } catch {
    return null;
  }
  const skillId = meta.skillIds[0];
  const skill = skillId ? SKILL_MAP[skillId] : undefined;
  if (!skill) return null;

  const entry = learning.skillModel[skill.id];
  const evidence = learning.skillEvidence[skill.id];
  const schedule = learning.reviewSchedule[skill.id];
  const display = skillDisplay(entry, evidence, schedule, today);

  const recentErrors = learning.recentAttempts
    .filter((a) => a.exerciseId !== exerciseId && !a.correct && a.skillIds.includes(skill.id))
    .slice(-LIMITE_ERROS_RECENTES)
    .map(erroRecenteDe)
    .filter((erro): erro is PedagogicalContextErro => erro !== null);

  const weakPrerequisites = skill.prerequisites
    .map((id) => SKILL_MAP[id])
    .filter((pre): pre is NonNullable<typeof pre> => {
      if (!pre) return false;
      const preConf = confidence(learning.skillModel[pre.id], learning.skillEvidence[pre.id], today);
      return mastery(learning.skillModel[pre.id]) < MASTERY_PREREQUISITO_FRACO || preConf.value < CONFIDENCE_PREREQUISITO_FRACA;
    })
    .slice(0, LIMITE_PREREQUISITOS_FRACOS)
    .map((pre) => pre.name);

  const subject = SUBJECT_MAP[skill.subjectId];
  const topicName = subject?.topics.find((t: { id: string }) => t.id === skill.topicId)?.name ?? skill.topicId;
  const examId = examTargets[0]?.examId;
  const examName = examId ? (EXAM_MAP[examId]?.name ?? null) : null;

  const ultimaTentativaDoItem = [...learning.recentAttempts].reverse().find((a) => a.exerciseId === exerciseId);

  return {
    skillId: skill.id,
    skillName: skill.name,
    subjectName: subject?.name ?? skill.subjectId,
    topicName,
    mastery: display.mastery,
    confidenceLabel: display.label,
    recentErrors,
    dontKnowRecent: entry?.dontKnowRecent ?? 0,
    explanationSeen: explicacaoJaVista(ultimaTentativaDoItem),
    weakPrerequisites,
    examName,
    mode,
  };
}

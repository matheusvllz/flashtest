import { useEffect, useMemo, useRef, useState } from "react";
import { chapterById, sectionOfChapter } from "@/content/curriculum-tree";
import { stableExerciseId } from "@/content/exercise-ids";
import { resolveExercise } from "@/content/microlicoes";
import { itemMetaOf } from "@/content/items";
import { createFeedback } from "@/lib/feedback/create-feedback";
import { dispatchAnswerFeedback, dispatchClosingFeedback } from "@/lib/feedback/dispatch-feedback";
import type { SoundEvent } from "@/lib/feedback/dispatch-feedback";
import type { AnswerFeedback } from "@/lib/feedback/types";
import { checkAnswer } from "@/lib/lessons/define";
import type { ExerciseAnswer } from "@/lib/lessons/types";
import { buildAttempt } from "@/lib/learning/attempt-builder";
import { isAnswerComplete, nextStepIndex, presentedOrderFor, scoreOf } from "@/lib/learning/session-logic";
import { questionSteps, scoredQuestionSteps, stageOfStep, stepsOf } from "@/lib/learning/steps";
import { isChapterCompleted, isSectionCompleted } from "@/lib/learning/trail";
import type { LessonStep, MicroLesson, QuestionStep } from "@/lib/learning/types";
import {
  atividadeHoje,
  completeMicroLesson,
  getState,
  hojeISO,
  hydrate,
  isStreakMilestone,
  nivelDeXp,
  recordLearningAttempt,
  setActiveLearningSession,
} from "@/lib/store";

function novaTentativaId(): string {
  return `at-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function novoSessionId(): string {
  return `ls-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export interface LearningCompletion {
  chapterCompleted: boolean;
  sectionCompleted: boolean;
}

export interface CompleteStrategyResult {
  xpAwarded: number;
  stars: 1 | 2 | 3 | null;
}

export interface UseLearningSessionOptions {
  /**
   * Estratégia de conclusão alternativa (docs/30 §14.4, Fase 12) — quando
   * ausente, o padrão de sempre (`completeMicroLesson`, grava em
   * `completedLessons`). Uma atividade da jornada (prática/revisão/desafio
   * sintéticos) passa `completeJourneyActivity` aqui: paga XP pelo ledger
   * `atividade:<id>`, NUNCA grava em `completedLessons` — é sessão, não
   * lição de conteúdo.
   */
  onComplete?: (correct: number, total: number) => CompleteStrategyResult;
  /** Repassado pra quem renderiza (docs/30 §14.4) — não muda a lógica desta hook. */
  mode?: "licao" | "atividade" | "checkpoint";
}

/**
 * Motor único da lição, orientado a PASSOS (docs/20 §8.1 + docs/25 §9/§18
 * T-08 — substitui a máquina antiga `teaching -> checkpoint -> practice ->
 * recap -> completed` por `stepsOf(lesson)`, que já normaliza v1 e v2).
 * Percorre `intro/teach/tip/question/recap`, aceita os 7 formatos de
 * exercício do motor (`checkAnswer`), persiste ordem apresentada
 * (`presentedOrders`) e retoma sem duplicar (critério A8).
 *
 * checkpoint/prática não concedem XP por resposta (docs/20 §8.1); só
 * `complete()` paga, uma vez, via `completeMicroLesson` — ou via
 * `opts.onComplete`, quando informado (Fase 12).
 */
export function useLearningSession(lesson: MicroLesson, opts: UseLearningSessionOptions = {}) {
  const steps = useMemo(() => stepsOf(lesson), [lesson]);
  const perguntas = useMemo(() => questionSteps(steps), [steps]);
  const perguntasPontuadas = useMemo(() => scoredQuestionSteps(steps), [steps]);

  const persistedInicial = useMemo(() => {
    // `getState()` sozinho não carrega o storage num reload de verdade — ver
    // a mesma nota histórica que já existia aqui antes do T-08.
    const active = hydrate().learning.activeSession;
    if (
      active &&
      active.kind === "microlicao" &&
      active.contentId === lesson.id &&
      active.contentVersion === lesson.version &&
      active.completedAt === null &&
      typeof active.stepIndex === "number" &&
      active.stepIndex < steps.length
    ) {
      return active;
    }
    return null;
  }, [lesson.id, lesson.version, steps.length]);

  const sessionId = useRef(persistedInicial?.id ?? novoSessionId()).current;
  const startedAt = useRef(persistedInicial?.startedAt ?? new Date().toISOString()).current;

  const [stepIndex, setStepIndex] = useState(persistedInicial?.stepIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, AnswerFeedback>>(
    (persistedInicial?.answers as Record<string, AnswerFeedback> | undefined) ?? {},
  );
  const [presentedOrders, setPresentedOrders] = useState<Record<string, string[]>>(
    persistedInicial?.presentedOrders ?? {},
  );
  // Resposta em edição do passo atual — nunca restaurada de uma sessão
  // persistida (mesmo comportamento do motor anterior): num reload em cima
  // de feedback já dado, o que reaparece é o FEEDBACK, não a seleção crua.
  const [answer, setAnswer] = useState<ExerciseAnswer | null>(null);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [stars, setStars] = useState<1 | 2 | 3 | null>(null);
  const [completion, setCompletion] = useState<LearningCompletion | null>(null);
  // Acertos/total entre as questões PONTUADAS (docs/25 §18 T-12) — mesma
  // fonte que `complete()` já usa pra pagar XP; exposto pra tela de conclusão
  // não precisar recalcular a partir de `answers` (que o hook não expõe).
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const submittingRef = useRef(false);
  const advancingRef = useRef(false);
  const completingRef = useRef(false);
  // Quando o passo-questão atual APARECEU — só pra calcular `durationMs`
  // (docs/30 §21.1, Fase 6). Não é tempo crítico: um efeito depois do
  // render já basta, ninguém decide nada com isso além da telemetria.
  const questionShownAtRef = useRef(Date.now());

  const step: LessonStep = steps[stepIndex];
  const feedback = step.kind === "question" ? (answers[String(stepIndex)] ?? null) : null;
  const presentedOrder = step.kind === "question" ? presentedOrders[String(stepIndex)] : undefined;

  useEffect(() => {
    if (step.kind === "question") questionShownAtRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const questionTotal = perguntas.length;
  const questionNumber =
    step.kind === "question" ? perguntas.findIndex((q) => q.stepIndex === stepIndex) + 1 : 0;
  const isLastScoredQuestion =
    step.kind === "question" &&
    perguntasPontuadas.length > 0 &&
    perguntasPontuadas[perguntasPontuadas.length - 1].stepIndex === stepIndex;

  const canVerify =
    step.kind === "question" && feedback === null && isAnswerComplete(resolveExercise(step.exerciseId), answer);

  /** Gera (e memoriza) a ordem apresentada de um passo-questão, se ainda não existir — nunca sobrescreve uma já gravada (retomada fiel, docs/25 §9). */
  function gerarOrdemSeNecessario(
    index: number,
    base: Record<string, string[]>,
  ): Record<string, string[]> {
    const alvo = steps[index];
    if (alvo.kind !== "question") return base;
    const chave = String(index);
    if (base[chave]) return base;
    const ordem = presentedOrderFor(resolveExercise(alvo.exerciseId));
    if (!ordem) return base;
    return { ...base, [chave]: ordem };
  }

  function salvar(next: {
    stepIndex: number;
    answers: Record<string, AnswerFeedback>;
    presentedOrders: Record<string, string[]>;
  }) {
    const novoStep = steps[next.stepIndex];
    const perguntasAtual = questionSteps(steps);
    const exerciseIndexAtual =
      novoStep.kind === "question" ? perguntasAtual.findIndex((q) => q.stepIndex === next.stepIndex) : -1;
    setActiveLearningSession({
      id: sessionId,
      contentId: lesson.id,
      contentVersion: lesson.version,
      kind: "microlicao",
      // Só compatibilidade de leitura (docs/25 §7.1) — quem decide o passo é `stepIndex`.
      stage: stageOfStep(novoStep),
      blockIndex: 0,
      stepIndex: next.stepIndex,
      exerciseIndex: exerciseIndexAtual,
      exerciseIds: perguntasAtual.map((q) => q.step.exerciseId),
      answers: next.answers,
      presentedOrders: next.presentedOrders,
      startedAt,
      updatedAt: new Date().toISOString(),
      completedAt: null,
    });
  }

  /** Sai de intro/teach/tip pro próximo passo — não há resposta nem XP aqui. */
  function next() {
    if (advancingRef.current) return;
    if (step.kind !== "intro" && step.kind !== "teach" && step.kind !== "tip") return;
    advancingRef.current = true;
    const novoIndex = nextStepIndex(steps, stepIndex);
    if (novoIndex === null) {
      advancingRef.current = false;
      return;
    }
    const novasOrdens = gerarOrdemSeNecessario(novoIndex, presentedOrders);
    setStepIndex(novoIndex);
    if (novasOrdens !== presentedOrders) setPresentedOrders(novasOrdens);
    salvar({ stepIndex: novoIndex, answers, presentedOrders: novasOrdens });
    advancingRef.current = false;
  }

  /**
   * Monta e grava a tentativa (docs/30 §21.1, Fase 6) — compartilhado por
   * `submit`/`dontKnow`. Habilidade por ITEM quando `itemMetaOf` já tem uma
   * classificação própria (Fase 3, corrige P3); cai pra habilidade da lição
   * inteira só se o item ainda não foi classificado. O metadado (`irt`/
   * `difficulty`) é passado pra `store.ts` explicitamente — não é
   * `store.ts` quem resolve (comentário completo em `aplicarModeloAdaptativo`,
   * `src/lib/store.ts`, achado de bundle da Fase 5).
   */
  function registrarTentativa(
    questionStep: QuestionStep,
    resposta: ExerciseAnswer | null,
    response: "answered" | "dont-know",
    correct: boolean,
    ordem: string[] | undefined,
  ) {
    const meta = itemMetaOf(questionStep.exerciseId);
    const attempt = buildAttempt({
      id: novaTentativaId(),
      sessionId,
      exerciseId: questionStep.exerciseId,
      exerciseVersion: stableExerciseId(questionStep.exerciseId)?.version ?? 1,
      subjectId: lesson.subjectId,
      topicId: lesson.topicId,
      skillIds: meta.skillIds.length > 0 ? meta.skillIds : lesson.skillIds,
      role: questionStep.role,
      answer: resposta,
      presentedOrder: ordem,
      correct,
      response,
      firstSubmission: true,
      startedAtMs: questionShownAtRef.current,
      localDate: hojeISO(),
      itemDifficulty: meta.difficulty,
      source: "microlicao",
    });
    recordLearningAttempt(attempt, { irt: meta.irt, difficulty: meta.difficulty });
  }

  function submit(a: ExerciseAnswer) {
    if (submittingRef.current) return;
    if (step.kind !== "question" || feedback !== null) return;
    submittingRef.current = true;

    const exercise = resolveExercise(step.exerciseId);
    const ordem = presentedOrders[String(stepIndex)];
    const correct = checkAnswer(exercise, a, ordem);
    const fb = createFeedback({ exerciseId: step.exerciseId, correct, explanation: exercise.explicacao });
    dispatchAnswerFeedback(fb);

    // Só roda em resposta NOVA: retomada nunca reexecuta `submit` (docs/20 §14.1 + docs/25 §18 T-08).
    registrarTentativa(step, a, "answered", correct, ordem);

    const novasRespostas = { ...answers, [String(stepIndex)]: fb };
    setAnswers(novasRespostas);
    setAnswer(a);
    salvar({ stepIndex, answers: novasRespostas, presentedOrders });
  }

  /** Botão "Não sei" (docs/30 §16.1, Fase 6) — nem acerto nem erro; `answer` fica `null`, feedback neutro. */
  function dontKnow() {
    if (submittingRef.current) return;
    if (step.kind !== "question" || feedback !== null) return;
    submittingRef.current = true;

    const exercise = resolveExercise(step.exerciseId);
    const fb = createFeedback({
      exerciseId: step.exerciseId,
      correct: false,
      explanation: exercise.explicacao,
      dontKnow: true,
    });
    dispatchAnswerFeedback(fb); // no-op pra "dont-know" — sem som/vibração (docs/30 §16.1).

    registrarTentativa(step, null, "dont-know", false, presentedOrders[String(stepIndex)]);

    const novasRespostas = { ...answers, [String(stepIndex)]: fb };
    setAnswers(novasRespostas);
    salvar({ stepIndex, answers: novasRespostas, presentedOrders });
  }

  function advance() {
    if (advancingRef.current) return;
    if (step.kind !== "question" || feedback === null) return;
    advancingRef.current = true;
    const novoIndex = nextStepIndex(steps, stepIndex);
    if (novoIndex === null) {
      advancingRef.current = false;
      return;
    }
    const novasOrdens = gerarOrdemSeNecessario(novoIndex, presentedOrders);
    setStepIndex(novoIndex);
    if (novasOrdens !== presentedOrders) setPresentedOrders(novasOrdens);
    setAnswer(null);
    submittingRef.current = false;
    salvar({ stepIndex: novoIndex, answers, presentedOrders: novasOrdens });
    advancingRef.current = false;
  }

  /**
   * Fecha a lição — recompensa por faixa uma vez (docs/20 §12), detecta
   * capítulo/seção recém-concluídos (docs/25 §6.6/§18 T-09) e escolhe os
   * eventos de som/háptico de fechamento na mesma prioridade que `study.tsx`/
   * `LessonPlayer.tsx` já usam.
   */
  function complete() {
    if (completingRef.current) return;
    if (step.kind !== "recap") return;
    completingRef.current = true;

    const antes = getState();
    const { correct, total } = scoreOf(steps, answers);
    const result = opts.onComplete ? opts.onComplete(correct, total) : completeMicroLesson(lesson.id, lesson.version, correct, total);
    const depois = getState();

    const nivelSubiu = nivelDeXp(depois.progress.xp).nivel > nivelDeXp(antes.progress.xp).nivel;
    const streakMudou = depois.progress.streak !== antes.progress.streak;
    const metaFechada =
      atividadeHoje(antes).lessons < depois.prefs.dailyLessons &&
      atividadeHoje(depois).lessons >= depois.prefs.dailyLessons;

    const eventos: SoundEvent[] = [];
    if (nivelSubiu) eventos.push("level-up");
    if (streakMudou && isStreakMilestone(depois.progress.streak)) eventos.push("marco-streak");
    if (metaFechada) eventos.push("meta-diaria");
    if (streakMudou) eventos.push("streak-diario");

    const chapter = chapterById(lesson.chapterId);
    const chapterCompleted = chapter
      ? !isChapterCompleted(chapter, antes) && isChapterCompleted(chapter, depois)
      : false;
    if (chapterCompleted) eventos.push("capitulo-desbloqueado");

    const sectionCompleted = chapter
      ? (() => {
          const so = sectionOfChapter(chapter.id);
          return so ? !isSectionCompleted(so.section, antes) && isSectionCompleted(so.section, depois) : false;
        })()
      : false;
    if (sectionCompleted) eventos.push("recompensa-especial");

    dispatchClosingFeedback(eventos);
    // A sessão ativa é limpa inteira na conclusão (docs/25 §9) — não há mais
    // "stage completed" persistido; `completion !== null` é o sinal de que a
    // lição terminou.
    setActiveLearningSession(null);
    setXpAwarded(result.xpAwarded);
    setStars(result.stars);
    setCompletion({ chapterCompleted, sectionCompleted });
    setScore({ correct, total });
  }

  return {
    steps,
    stepIndex,
    step,
    questionNumber,
    questionTotal,
    answer,
    setAnswer,
    feedback,
    presentedOrder,
    canVerify,
    next,
    submit,
    dontKnow,
    advance,
    complete,
    xpAwarded,
    stars,
    completion,
    score,
    isLastScoredQuestion,
  };
}


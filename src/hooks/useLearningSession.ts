import { useEffect, useMemo, useRef, useState } from "react";
import { chapterById, sectionOfChapter } from "@/content/curriculum-tree";
import { stableExerciseId } from "@/content/exercise-ids";
import { resolveExercise } from "@/content/microlicoes";
import { itemMetaOf } from "@/content/items";
import { createFeedback } from "@/lib/feedback/create-feedback";
import { dispatchAnswerFeedback, dispatchClosingFeedback } from "@/lib/feedback/dispatch-feedback";
import type { AnswerFeedback } from "@/lib/feedback/types";
import { checkAnswer } from "@/lib/lessons/define";
import type { ExerciseAnswer } from "@/lib/lessons/types";
import { buildAttempt } from "@/lib/learning/attempt-builder";
import { isAnswerComplete, nextStepIndex, presentedOrderFor, scoreOf } from "@/lib/learning/session-logic";
import { questionSteps, scoredQuestionSteps, stageOfStep, stepsOf } from "@/lib/learning/steps";
import { isChapterCompleted, isSectionCompleted } from "@/lib/learning/trail";
import type { LessonStep, MicroLesson, QuestionStep } from "@/lib/learning/types";
import type { MarcoDoCombo } from "@/lib/combo";
import { escolherCelebracao, momentoDoMarco, type Celebracao, type Momento } from "@/lib/celebracao";
import { FEATURES } from "@/lib/features";
import {
  atividadeHoje,
  completeMicroLesson,
  getState,
  hojeISO,
  hydrate,
  isStreakMilestone,
  nivelDeXp,
  recordLearningAttempt,
  registrarComboLocal,
  registrarRevisaoDeErro,
  setActiveLearningSession,
} from "@/lib/store";

function novaTentativaId(): string {
  return `at-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function novoSessionId(): string {
  return `ls-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Revisão de erros no fim (spec 50 §5.1.4): no máximo 3 questões, as últimas erradas. */
export const MAX_REVISAO_DE_ERROS = 3;
/** Intervalo com o app em segundo plano acima disto não conta no tempo da lição (§5.1.7). */
const PAUSA_QUE_NAO_CONTA_MS = 2 * 60_000;

export interface LearningCompletion {
  chapterCompleted: boolean;
  sectionCompleted: boolean;
}

export interface CompleteStrategyResult {
  xpAwarded: number;
  stars: 1 | 2 | 3 | null;
}

/** Combo mostrado na folha de feedback de uma resposta (spec 50 §5.1.2). */
export interface ComboDaResposta {
  n: number;
  marco: MarcoDoCombo | null;
  /** O combo devolveu uma vida (Free com vidas; o servidor confirma). */
  vida?: boolean;
}

export type FaseDaRevisao = "oferta" | "revendo" | "feita" | "pulada";

export interface RevisaoDeErros {
  fase: FaseDaRevisao;
  /** `stepIndex` das questões a rever, na ordem. */
  itens: number[];
  indice: number;
  feedbacks: Record<number, AnswerFeedback>;
  acertos: number;
}

/** Resumo do fim da lição para os cartões e o momento principal (spec 50 §5.1.6–5.1.7, §5.12.3). */
export interface ResumoDaLicao {
  deprimeira: number;
  pontuadas: number;
  perfeita: boolean;
  tempoMs: number;
  maiorCombo: number;
  celebracao: Celebracao;
  revisao: { feitas: number; acertos: number } | null;
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
  /**
   * Repassado pra quem renderiza (docs/30 §14.4). "revisaoLivre" (spec 50 §5.7.2, "Rever erros recentes"): as
   * respostas vão como revisão — sem vida, sem combo, sem XP, sem mexer no domínio (R-PED-2).
   */
  mode?: "licao" | "atividade" | "checkpoint" | "revisaoLivre";
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
 *
 * Spec 50: combo de primeira tentativa (o servidor decide as recompensas), ajuda antes de responder (`marcarAjuda`),
 * revisão de erros antes do resultado (sem vida, sem XP, sem domínio), tempo ativo e o momento principal do fim.
 */
export function useLearningSession(lesson: MicroLesson, opts: UseLearningSessionOptions = {}) {
  const steps = useMemo(() => stepsOf(lesson), [lesson]);
  const perguntas = useMemo(() => questionSteps(steps), [steps]);
  const perguntasPontuadas = useMemo(() => scoredQuestionSteps(steps), [steps]);
  const ehChecagem = opts.mode === "checkpoint";

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
  /** Combo mostrado em cada resposta desta sessão (spec 50 §5.1.2). */
  const [combos, setCombos] = useState<Record<string, ComboDaResposta>>({});
  const [maiorCombo, setMaiorCombo] = useState(0);
  /** Questões em que a Foca IA foi aberta ANTES de responder (não contam para combo nem lição perfeita). */
  const [ajudadas, setAjudadas] = useState<Record<string, true>>({});
  const [revisao, setRevisao] = useState<RevisaoDeErros | null>(null);
  const [respostaRevisao, setRespostaRevisao] = useState<ExerciseAnswer | null>(null);
  const [resumo, setResumo] = useState<ResumoDaLicao | null>(null);

  const submittingRef = useRef(false);
  const advancingRef = useRef(false);
  const completingRef = useRef(false);
  const revisandoRef = useRef(false);
  // Quando o passo-questão atual APARECEU — só pra calcular `durationMs`
  // (docs/30 §21.1, Fase 6). Não é tempo crítico: um efeito depois do
  // render já basta, ninguém decide nada com isso além da telemetria.
  const questionShownAtRef = useRef(Date.now());

  // Tempo ativo da lição (spec 50 §5.1.7): soma os trechos com a aba visível; um intervalo longo em segundo plano
  // (> 2 min) não conta. Só informativo — nunca premiado (Decreto 12.880 art. 9º, III).
  const tempoRef = useRef({ acumulado: 0, desde: Date.now(), saiuEm: 0 });
  useEffect(() => {
    if (typeof document === "undefined") return;
    const aoMudar = () => {
      const t = tempoRef.current;
      const agora = Date.now();
      if (document.hidden) {
        if (!Number.isNaN(t.desde)) t.acumulado += agora - t.desde;
        t.desde = Number.NaN;
        t.saiuEm = agora;
      } else {
        // Pausa curta conta como estudo (o aluno pensou com o app de lado); longa, não.
        if (t.saiuEm && agora - t.saiuEm <= PAUSA_QUE_NAO_CONTA_MS) t.acumulado += agora - t.saiuEm;
        t.saiuEm = 0;
        t.desde = agora;
      }
    };
    document.addEventListener("visibilitychange", aoMudar);
    return () => document.removeEventListener("visibilitychange", aoMudar);
  }, []);
  function tempoAtivoMs(): number {
    const t = tempoRef.current;
    return t.acumulado + (Number.isNaN(t.desde) ? 0 : Date.now() - t.desde);
  }

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
  /** Questões pontuadas já respondidas (barra de progresso por questão, spec 50 §5.1.5). */
  const pontuadasRespondidas = perguntasPontuadas.filter((q) => answers[String(q.stepIndex)]).length;

  const canVerify =
    step.kind === "question" && feedback === null && isAnswerComplete(resolveExercise(step.exerciseId), answer);

  /** Questões pontuadas erradas (ou "Não sei") para a revisão do fim: as últimas, até o máximo. */
  const errosParaRever = useMemo(
    () =>
      perguntasPontuadas
        .filter((q) => {
          const fb = answers[String(q.stepIndex)];
          return fb && (!fb.correct || fb.kind === "dont-know");
        })
        .map((q) => q.stepIndex)
        .slice(-MAX_REVISAO_DE_ERROS),
    [perguntasPontuadas, answers],
  );

  // Ao chegar ao resumo com erros, oferece a revisão (uma vez). Nunca na checagem.
  useEffect(() => {
    if (step.kind !== "recap" || revisao !== null || ehChecagem || opts.mode === "revisaoLivre" || !FEATURES.revisaoDeErros) return;
    if (errosParaRever.length === 0) return;
    setRevisao({ fase: "oferta", itens: errosParaRever, indice: 0, feedbacks: {}, acertos: 0 });
  }, [step.kind, revisao, ehChecagem, errosParaRever, opts.mode]);

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

  /** A Foca IA foi aberta com a questão ainda sem resposta (spec 50 §5.1.1): a tentativa vira assistida. */
  function marcarAjuda() {
    if (step.kind !== "question" || feedback !== null) return;
    setAjudadas((a) => (a[String(stepIndex)] ? a : { ...a, [String(stepIndex)]: true }));
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
  function montarTentativa(
    questionStep: QuestionStep,
    resposta: ExerciseAnswer | null,
    response: "answered" | "dont-know",
    correct: boolean,
    ordem: string[] | undefined,
    revisaoDeErro: boolean,
    idx: number,
  ) {
    const meta = itemMetaOf(questionStep.exerciseId);
    return buildAttempt({
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
      tutorUsed: !revisaoDeErro && Boolean(ajudadas[String(idx)]),
      // Spec 50 §5.1.4: a revisão do fim é a segunda vez na mesma questão.
      firstSubmission: !revisaoDeErro,
      startedAtMs: questionShownAtRef.current,
      localDate: hojeISO(),
      itemDifficulty: meta.difficulty,
      // A atividade da trilha precisa se identificar: o servidor paga a atividade pelas respostas DELA (docs/specs/46-producao §E.4).
      source: opts.mode === "atividade" ? "atividade" : opts.mode === "checkpoint" ? "checkpoint" : "microlicao",
    });
  }

  function registrarTentativa(
    questionStep: QuestionStep,
    resposta: ExerciseAnswer | null,
    response: "answered" | "dont-know",
    correct: boolean,
    ordem: string[] | undefined,
  ) {
    const meta = itemMetaOf(questionStep.exerciseId);
    if (opts.mode === "revisaoLivre") {
      registrarRevisaoDeErro(montarTentativa(questionStep, resposta, response, correct, ordem, true, stepIndex));
      return;
    }
    const attempt = montarTentativa(questionStep, resposta, response, correct, ordem, false, stepIndex);
    recordLearningAttempt(attempt, { irt: meta.irt, difficulty: meta.difficulty });
  }

  /** Combo desta resposta (spec 50 §5.1.1): checagem e questões não pontuadas não contam nem zeram. */
  function contarCombo(questionStep: QuestionStep, resultado: "certa" | "errada" | "nao-sei"): ComboDaResposta | null {
    const conta = !ehChecagem && opts.mode !== "revisaoLivre" && questionStep.role !== "checkpoint";
    const r = registrarComboLocal({ resultado, conta, assistida: Boolean(ajudadas[String(stepIndex)]) });
    if (!conta || !FEATURES.comboNaLicao) return null;
    if (r.estado.atual > maiorCombo) setMaiorCombo(r.estado.atual);
    return { n: r.estado.atual, marco: r.marco, vida: r.vidaDeVolta };
  }

  function submit(a: ExerciseAnswer) {
    if (submittingRef.current) return;
    if (step.kind !== "question" || feedback !== null) return;
    submittingRef.current = true;

    const exercise = resolveExercise(step.exerciseId);
    const ordem = presentedOrders[String(stepIndex)];
    const correct = checkAnswer(exercise, a, ordem);
    const fb = createFeedback({ exerciseId: step.exerciseId, correct, explanation: exercise.explicacao });
    const combo = contarCombo(step, correct ? "certa" : "errada");
    dispatchAnswerFeedback(fb, { marcoDoCombo: combo?.marco ?? null });

    // Só roda em resposta NOVA: retomada nunca reexecuta `submit` (docs/20 §14.1 + docs/25 §18 T-08).
    registrarTentativa(step, a, "answered", correct, ordem);

    const novasRespostas = { ...answers, [String(stepIndex)]: fb };
    setAnswers(novasRespostas);
    if (combo) setCombos((c) => ({ ...c, [String(stepIndex)]: combo }));
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
    contarCombo(step, "nao-sei"); // zera em silêncio (spec 50 §5.1.1)

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

  /* ------------------------------------------------- revisão de erros (§5.1.4) --- */

  const passoDaRevisao: QuestionStep | null =
    revisao?.fase === "revendo" ? ((steps[revisao.itens[revisao.indice]] as QuestionStep | undefined) ?? null) : null;
  const feedbackDaRevisao = revisao && passoDaRevisao ? (revisao.feedbacks[revisao.indice] ?? null) : null;
  const ordemDaRevisao = passoDaRevisao && revisao ? presentedOrders[String(revisao.itens[revisao.indice])] : undefined;

  function iniciarRevisao() {
    if (!revisao || revisao.fase !== "oferta") return;
    setRespostaRevisao(null);
    questionShownAtRef.current = Date.now();
    setRevisao({ ...revisao, fase: "revendo", indice: 0 });
  }

  function pularRevisao() {
    if (!revisao || revisao.fase !== "oferta") return;
    setRevisao({ ...revisao, fase: "pulada" });
  }

  function responderRevisao(a: ExerciseAnswer) {
    if (revisandoRef.current || !revisao || !passoDaRevisao || feedbackDaRevisao) return;
    revisandoRef.current = true;
    const exercise = resolveExercise(passoDaRevisao.exerciseId);
    const correct = checkAnswer(exercise, a, ordemDaRevisao);
    const fb = createFeedback({ exerciseId: passoDaRevisao.exerciseId, correct, explanation: exercise.explicacao });
    dispatchAnswerFeedback(fb);
    // Vai ao servidor marcada como revisão: sem vida, sem caderno, sem domínio, sem combo, sem XP.
    registrarRevisaoDeErro(montarTentativa(passoDaRevisao, a, "answered", correct, ordemDaRevisao, true, revisao.itens[revisao.indice]));
    setRespostaRevisao(a);
    setRevisao({
      ...revisao,
      feedbacks: { ...revisao.feedbacks, [revisao.indice]: fb },
      acertos: revisao.acertos + (correct ? 1 : 0),
    });
  }

  function avancarRevisao() {
    if (!revisao || revisao.fase !== "revendo" || !feedbackDaRevisao) return;
    revisandoRef.current = false;
    setRespostaRevisao(null);
    questionShownAtRef.current = Date.now();
    const proximo = revisao.indice + 1;
    setRevisao(proximo >= revisao.itens.length ? { ...revisao, fase: "feita" } : { ...revisao, indice: proximo });
  }

  /* ---------------------------------------------------------------- conclusão --- */

  /**
   * Fecha a lição — recompensa por faixa uma vez (docs/20 §12), detecta
   * capítulo/seção recém-concluídos (docs/25 §6.6/§18 T-09) e escolhe UM
   * momento principal com o som dele (spec 50 §5.12.3).
   */
  function complete() {
    if (completingRef.current) return;
    if (step.kind !== "recap") return;
    completingRef.current = true;

    const antes = getState();
    const { correct, total } = scoreOf(steps, answers);
    const result = opts.onComplete
      ? opts.onComplete(correct, total)
      : // `startedAt` da sessão: uma conclusão já gravada DEPOIS dela não é contada de novo (docs/36 G-3).
        completeMicroLesson(lesson.id, lesson.version, correct, total, { sessionStartedAt: startedAt, attemptKey: sessionId });
    const depois = getState();

    const nivelSubiu = nivelDeXp(depois.progress.xp).nivel > nivelDeXp(antes.progress.xp).nivel;
    const streakMudou = depois.progress.streak !== antes.progress.streak;
    const metaFechada =
      atividadeHoje(antes).lessons < depois.prefs.dailyLessons &&
      atividadeHoje(depois).lessons >= depois.prefs.dailyLessons;

    const chapter = chapterById(lesson.chapterId);
    const chapterCompleted = chapter
      ? !isChapterCompleted(chapter, antes) && isChapterCompleted(chapter, depois)
      : false;
    const sectionCompleted = chapter
      ? (() => {
          const so = sectionOfChapter(chapter.id);
          return so ? !isSectionCompleted(so.section, antes) && isSectionCompleted(so.section, depois) : false;
        })()
      : false;

    // Lição perfeita (§5.1.6): todas as pontuadas certas de primeira, sem "Não sei", sem ajuda antes, mínimo de 4.
    const pontuadas = perguntasPontuadas.map((q) => q.stepIndex);
    const deprimeira = pontuadas.filter((i) => answers[String(i)]?.correct).length;
    const perfeita =
      !ehChecagem &&
      pontuadas.length >= 4 &&
      pontuadas.every((i) => answers[String(i)]?.correct && answers[String(i)]?.kind !== "dont-know" && !ajudadas[String(i)]);

    const momentos: Momento[] = [];
    if (sectionCompleted) momentos.push("especial");
    if (streakMudou && isStreakMilestone(depois.progress.streak)) momentos.push(momentoDoMarco(depois.progress.streak));
    if (nivelSubiu) momentos.push("nivel");
    if (perfeita) momentos.push("perfeita");
    if (chapterCompleted) momentos.push("capitulo");
    if (metaFechada) momentos.push("meta-dia");
    if (streakMudou) momentos.push("ofensiva-acesa");
    const celebracao = escolherCelebracao(momentos);

    dispatchClosingFeedback([celebracao.som], { marco: celebracao.principal === "marco" || celebracao.principal === "nivel" || celebracao.principal === "especial" });
    // A sessão ativa é limpa inteira na conclusão (docs/25 §9) — não há mais
    // "stage completed" persistido; `completion !== null` é o sinal de que a
    // lição terminou.
    setActiveLearningSession(null);
    setXpAwarded(result.xpAwarded);
    setStars(result.stars);
    setCompletion({ chapterCompleted, sectionCompleted });
    setScore({ correct, total });
    setResumo({
      deprimeira,
      pontuadas: pontuadas.length,
      perfeita,
      tempoMs: tempoAtivoMs(),
      maiorCombo,
      celebracao,
      revisao: revisao && (revisao.fase === "feita" || revisao.fase === "revendo") ? { feitas: Object.keys(revisao.feedbacks).length, acertos: revisao.acertos } : null,
    });
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
    // Spec 50
    marcarAjuda,
    comboAtual: step.kind === "question" ? (combos[String(stepIndex)] ?? null) : null,
    pontuadasRespondidas,
    pontuadasTotal: perguntasPontuadas.length,
    revisao,
    passoDaRevisao,
    feedbackDaRevisao,
    ordemDaRevisao,
    respostaRevisao,
    setRespostaRevisao,
    iniciarRevisao,
    pularRevisao,
    responderRevisao,
    avancarRevisao,
    resumo,
  };
}

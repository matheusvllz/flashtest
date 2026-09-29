import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { TutorBubble } from "@/components/TutorBubble";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { CelebracaoAula } from "@/components/lessons/CelebracaoAula";
import { IntroStepView } from "@/components/learning/steps/IntroStepView";
import { TeachStepView } from "@/components/learning/steps/TeachStepView";
import { TipStepView } from "@/components/learning/steps/TipStepView";
import { QuestionStepView } from "@/components/learning/steps/QuestionStepView";
import { RecapStepView } from "@/components/learning/steps/RecapStepView";
import { LessonHeader } from "@/components/learning/LessonHeader";
import { SUBJECT_MAP } from "@/data/subjects";
import { chapterById } from "@/content/curriculum-tree";
import { resolveExercise } from "@/content/microlicoes";
import { atribuicaoOficial, itemMetaOf } from "@/content/items";
import { focusFromExercise } from "@/lib/lessons/tutor-focus";
import { buildPedagogicalContext } from "@/lib/tutor-context";
import { useLearningSession } from "@/hooks/useLearningSession";
import type { CompleteStrategyResult, UseLearningSessionOptions } from "@/hooks/useLearningSession";
import { COPY, textoSePersistiu } from "@/lib/copy";
import { FEATURES } from "@/lib/features";
import type { MicroLesson } from "@/lib/learning/types";
import {
  getState,
  hojeISO,
  nivelDeXp,
  openTutorWithContext,
  setActiveLearningSession,
  usePersistStatus,
} from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Player de microlição, passo a passo (docs/20 §8.1 + docs/25 §9/§12.2/§18
 * T-11) — percorre `stepsOf(lesson)` via `useLearningSession`, um passo por
 * vez, cada um com sua própria view (T-10). Substitui a versão de transição
 * que ainda agrupava intro/teach/tip numa única tela ("Testar o que
 * aprendi") — essa tela some daqui pra frente.
 *
 * Wrapper fino só pra viabilizar "Refazer lição" (docs/25 §12.3/§18 T-12):
 * `useLearningSession` deriva seu estado inicial de `lesson` via
 * `useState`/`useRef` na PRIMEIRA montagem — não há um `reset()` nele (T-11/
 * T-12 não estão na lista de arquivos que tocam o hook). Remontar
 * `MicroLessonPlayerInner` inteiro via bump de `key` é a forma mais simples e
 * correta de zerar sessionId/stepIndex/answers/refs juntos, sem duplicar a
 * lógica de inicialização do hook aqui.
 */
export function MicroLessonPlayer({
  lesson,
  mode,
  onComplete,
}: {
  lesson: MicroLesson;
  /** Repassado a `useLearningSession` (docs/30 §14.4, Fase 12) — ausente = lição de conteúdo, comportamento de sempre. */
  mode?: UseLearningSessionOptions["mode"];
  onComplete?: (correct: number, total: number) => CompleteStrategyResult;
}) {
  const [playKey, setPlayKey] = useState(0);
  return (
    <MicroLessonPlayerInner
      key={playKey}
      lesson={lesson}
      mode={mode}
      onComplete={onComplete}
      onReplay={() => setPlayKey((k) => k + 1)}
    />
  );
}

function MicroLessonPlayerInner({
  lesson,
  mode,
  onComplete,
  onReplay,
}: {
  lesson: MicroLesson;
  mode?: UseLearningSessionOptions["mode"];
  onComplete?: (correct: number, total: number) => CompleteStrategyResult;
  onReplay: () => void;
}) {
  const navigate = useNavigate();
  const session = useLearningSession(lesson, { mode, onComplete });
  const [confirmExit, setConfirmExit] = useState(false);
  // Sem promessa de "salvo" quando a gravação local não está ok (docs/36 RF-14).
  const persist = usePersistStatus();
  // Streak/nível ANTES do fechamento — capturados no player bem antes de
  // chamar `session.complete()`, a mesma tática que `LessonPlayer.tsx` usa
  // pro par antes/depois de `completeLesson`.
  const [antesFechamento, setAntesFechamento] = useState<{ streak: number; nivel: number } | null>(null);

  const chapter = chapterById(lesson.chapterId);
  const breadcrumb = chapter ? `${chapter.title} › ${lesson.title}` : lesson.title;

  function sair() {
    navigate({ to: "/trilha" });
  }

  function completar() {
    setAntesFechamento({
      streak: getState().progress.streak,
      nivel: nivelDeXp(getState().progress.xp).nivel,
    });
    session.complete();
  }

  function replay() {
    setActiveLearningSession(null);
    onReplay();
  }

  /**
   * `ensinarDoZero` (docs/30 §17.2, Fase 7): true quando vem do CTA de nível
   * 3 pós-feedback ("Explicar melhor" depois de errar) — a IA ensina o
   * conceito do zero e a mensagem já sai enviada. `false` (padrão, "Pedir
   * dica"/dúvida livre): o aluno digita, sem auto-envio.
   */
  function askTutor(ensinarDoZero = false) {
    if (session.step.kind !== "question") return;
    const exercise = resolveExercise(session.step.exerciseId);
    const chapterTitle = chapter?.title ?? lesson.title;
    const focus = focusFromExercise(
      exercise,
      session.answer,
      lesson.id,
      lesson.title,
      chapterTitle,
      session.stepIndex,
      session.presentedOrder,
      session.feedback?.correct ?? false,
    );
    const nivel3 = ensinarDoZero && FEATURES.explicacaoEmCamadas;
    const mode = nivel3 ? "ensinar-do-zero" : "duvida";
    const pedagogy = FEATURES.contextoPedagogicoIA
      ? buildPedagogicalContext(getState().learning, getState().prefs.examTargets, session.step.exerciseId, mode, hojeISO())
      : null;
    openTutorWithContext(
      {
        ...focus,
        subjectName: SUBJECT_MAP[lesson.subjectId].name,
        topic: chapter ? `${chapter.title} · ${lesson.title}` : lesson.title,
        questionId: session.step.exerciseId,
      },
      { pedagogy, autoSend: nivel3 ? COPY.tutor.ensinarDoZero : null },
    );
  }

  if (session.completion) {
    const depois = getState();
    const nivelAtual = nivelDeXp(depois.progress.xp).nivel;
    const streakAtual = depois.progress.streak;
    // Atividade/checkpoint da jornada (docs/30 §14.4) são sessão, não nó da
    // trilha por matéria — `?concluida=`/`?capitulo=` não fazem sentido pra
    // uma lição sintética (`lesson.id` começa com "atividade--"), então o
    // CTA volta pra `/trilha` sem parâmetro nenhum.
    const search: Record<string, string> = mode === "atividade" || mode === "checkpoint" ? {} : { concluida: lesson.id };
    if (session.completion.chapterCompleted && search.concluida) search.capitulo = lesson.chapterId;

    return (
      <PhoneFrame variant="reading">
        <CelebracaoAula
          acertos={session.score?.correct ?? 0}
          total={session.score?.total ?? 0}
          estrelas={session.stars ?? undefined}
          xpGanho={session.xpAwarded}
          streakAtual={streakAtual}
          streakMudou={antesFechamento !== null && streakAtual !== antesFechamento.streak}
          nivelSubiu={antesFechamento !== null && nivelAtual > antesFechamento.nivel}
          nivelAtual={nivelAtual}
          aprendizado={lesson.objective}
          primario={{ label: "Continuar", to: "/trilha", search }}
          secundario={{ label: COPY.licao.refazer, onClick: replay }}
        />
      </PhoneFrame>
    );
  }

  const { step } = session;
  const isWrongFeedback = step.kind === "question" && session.feedback !== null && !session.feedback.correct;
  const counter =
    step.kind === "question" ? `${session.questionNumber}/${session.questionTotal}` : undefined;

  return (
    <PhoneFrame variant="reading">
      <div className="flex min-h-screen flex-col bg-neve">
        <LessonHeader
          onExit={() => setConfirmExit(true)}
          value={session.stepIndex}
          max={Math.max(1, session.steps.length - 1)}
          counter={counter}
          breadcrumb={breadcrumb}
        />

        <div
          key={session.stepIndex}
          className={cn("flex-1 px-5 py-6", isWrongFeedback ? "anim-shake" : "anim-slide-up")}
        >
          {step.kind === "intro" && <IntroStepView step={step} onNext={session.next} />}
          {step.kind === "teach" && <TeachStepView step={step} onNext={session.next} />}
          {step.kind === "tip" && <TipStepView step={step} onNext={session.next} />}
          {step.kind === "question" && (
            <QuestionStepView
              step={step}
              exercise={resolveExercise(step.exerciseId)}
              answer={session.answer}
              onAnswer={session.setAnswer}
              presentedOrder={session.presentedOrder}
              feedback={session.feedback}
              canVerify={session.canVerify}
              onVerify={() => session.answer !== null && session.submit(session.answer)}
              onContinue={session.advance}
              onAskTutor={() => askTutor(true)}
              onDontKnow={
                FEATURES.botaoNaoSei && itemMetaOf(step.exerciseId).dontKnowAllowed !== false
                  ? session.dontKnow
                  : undefined
              }
              isLast={session.isLastScoredQuestion}
              questionNumber={session.questionNumber}
              questionTotal={session.questionTotal}
              explanationLayers={itemMetaOf(step.exerciseId).explanationLayers}
              fonteOficial={atribuicaoOficial(itemMetaOf(step.exerciseId).source)}
              silent={mode === "checkpoint"}
            />
          )}
          {step.kind === "recap" && <RecapStepView lesson={lesson} onComplete={completar} />}
        </div>
      </div>

      {/* PhoneFrame não inclui o balão do tutor (só o AppShell, montado nas
          telas pós-quiz que usam bottom nav) — a lição roda em modo foco, sem
          AppShell, então precisa montar o balão aqui (mesmo padrão de
          `LessonPlayer.tsx`). Checkpoint é sem tutor de propósito (docs/30
          §13.3) — nem o botão flutuante fica disponível durante ele. */}
      {mode !== "checkpoint" && <TutorBubble />}

      <BottomSheet
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title={COPY.licao.sairTitulo}
        icon={<FocaMark expression="desapontada" size={56} decorative />}
      >
        <p className="mt-1.5 text-sm text-abismo">
          {textoSePersistiu(persist, COPY.licao.sairCorpo, COPY.licao.sairCorpoSemSalvo)}
        </p>
        <div className="mt-4 space-y-2">
          <button type="button" onClick={() => setConfirmExit(false)} className="btn-primary w-full">
            {COPY.licao.sairFicar}
          </button>
          <button type="button" onClick={sair} className="btn-ghost w-full">
            {COPY.licao.sairMesmo}
          </button>
        </div>
      </BottomSheet>
    </PhoneFrame>
  );
}

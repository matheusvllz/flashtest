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
import { focusFromExercise } from "@/lib/lessons/tutor-focus";
import { useLearningSession } from "@/hooks/useLearningSession";
import { COPY } from "@/lib/copy";
import type { MicroLesson } from "@/lib/learning/types";
import { getState, nivelDeXp, openTutorWithContext, setActiveLearningSession } from "@/lib/store";
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
export function MicroLessonPlayer({ lesson }: { lesson: MicroLesson }) {
  const [playKey, setPlayKey] = useState(0);
  return (
    <MicroLessonPlayerInner
      key={playKey}
      lesson={lesson}
      onReplay={() => setPlayKey((k) => k + 1)}
    />
  );
}

function MicroLessonPlayerInner({
  lesson,
  onReplay,
}: {
  lesson: MicroLesson;
  onReplay: () => void;
}) {
  const navigate = useNavigate();
  const session = useLearningSession(lesson);
  const [confirmExit, setConfirmExit] = useState(false);
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

  function askTutor() {
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
    openTutorWithContext({
      ...focus,
      subjectName: SUBJECT_MAP[lesson.subjectId].name,
      topic: chapter ? `${chapter.title} · ${lesson.title}` : lesson.title,
      questionId: session.step.exerciseId,
    });
  }

  if (session.completion) {
    const depois = getState();
    const nivelAtual = nivelDeXp(depois.progress.xp).nivel;
    const streakAtual = depois.progress.streak;
    const search: Record<string, string> = { concluida: lesson.id };
    if (session.completion.chapterCompleted) search.capitulo = lesson.chapterId;

    return (
      <PhoneFrame>
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
    <PhoneFrame>
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
              onAskTutor={askTutor}
              isLast={session.isLastScoredQuestion}
              questionNumber={session.questionNumber}
              questionTotal={session.questionTotal}
            />
          )}
          {step.kind === "recap" && <RecapStepView lesson={lesson} onComplete={completar} />}
        </div>
      </div>

      {/* PhoneFrame não inclui o balão do tutor (só o AppShell, montado nas
          telas pós-quiz que usam bottom nav) — a lição roda em modo foco, sem
          AppShell, então precisa montar o balão aqui (mesmo padrão de
          `LessonPlayer.tsx`). */}
      <TutorBubble />

      <BottomSheet
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title={COPY.licao.sairTitulo}
        icon={<FocaMark expression="desapontada" size={56} decorative />}
      >
        <p className="mt-1.5 text-sm text-abismo">{COPY.licao.sairCorpo}</p>
        <div className="mt-4 space-y-2">
          <button onClick={() => setConfirmExit(false)} className="btn-primary w-full">
            {COPY.licao.sairFicar}
          </button>
          <button onClick={sair} className="btn-ghost w-full">
            {COPY.licao.sairMesmo}
          </button>
        </div>
      </BottomSheet>
    </PhoneFrame>
  );
}

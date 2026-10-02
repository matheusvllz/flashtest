import { useEffect, useMemo, useRef, useState } from "react";
import { useAtalhosDeQuestao } from "@/hooks/useAtalhosDeQuestao";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { TutorBubble } from "@/components/TutorBubble";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { DontKnowButton } from "@/components/learning/DontKnowButton";
import { ExplanationLayers, hasExplanationLayers } from "@/components/learning/ExplanationLayers";
import { FiguraDaQuestao } from "@/components/questao/FiguraDaQuestao";
import { CelebracaoAula } from "./CelebracaoAula";
import { FeedbackSheet } from "./FeedbackSheet";
import { useExerciseSession } from "@/hooks/useExerciseSession";
import { chapterById } from "@/content/curriculum-tree";
import { trilhaExerciseId } from "@/content/exercise-ids";
import { itemMetaOf } from "@/content/items";
import { dispatchClosingFeedback } from "@/lib/feedback/dispatch-feedback";
import { buildAttempt } from "@/lib/learning/attempt-builder";
import { isChapterCompleted } from "@/lib/learning/trail";
import { checkAnswer, shuffled } from "@/lib/lessons/define";
import { exerciseViewFor } from "@/lib/lessons/registry";
import { focusFromExercise } from "@/lib/lessons/tutor-focus";
import { buildPedagogicalContext } from "@/lib/tutor-context";
import { COPY, textoSePersistiu } from "@/lib/copy";
import type { ExerciseAnswer, Lesson, Trilha } from "@/lib/lessons/types";
import type { SoundEvent } from "@/lib/feedback/dispatch-feedback";
import { FEATURES } from "@/lib/features";
import {
  completeLesson,
  getState,
  hojeISO,
  isStreakMilestone,
  nivelDeXp,
  openTutorWithContext,
  recordLearningAttempt,
  registrarComboLocal,
  useAppState,
  usePersistStatus,
  type CompleteLessonResult,
} from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * O tocador universal da trilha de redação: recebe QUALQUER lição declarada
 * com `defineLesson()` e cuida de tudo — progresso no topo, render do
 * exercício via registry, correção algorítmica (zero IA, custo zero), folha
 * de feedback e tela final com estrelas + XP.
 *
 * A lição roda em tela cheia (sem bottom nav): é modo de foco, o mesmo
 * princípio da aula de 60s. Sair exige confirmação.
 */
export function LessonPlayer({ trilha, lesson }: { trilha: Trilha; lesson: Lesson }) {
  // Desktop: 1–5 / A–E escolhem, Enter confirma (docs/44 §5).
  useAtalhosDeQuestao();
  const navigate = useNavigate();
  const s = useAppState();
  const persist = usePersistStatus();
  const total = lesson.exercicios.length;
  const [idx, setIdx] = useState(0);
  /** Combo da resposta atual (spec 50 §5.1.1–5.1.2): a trilha de redação também conta. */
  const [comboDaResposta, setComboDaResposta] = useState<{ n: number; marco: 3 | 5 | 10 | null } | null>(null);
  const [answer, setAnswer] = useState<ExerciseAnswer | null>(null);
  // Máquina de resposta compartilhada com a aula de 60s (docs/20 §5, Fase 2).
  const session = useExerciseSession();
  const checked = session.phase !== "answering";
  const [correctCount, setCorrectCount] = useState(0);
  // O que o aluno errou: vira o "anota pra melhorar" da tela final.
  const [wrongNotes, setWrongNotes] = useState<string[]>([]);
  const [result, setResult] = useState<CompleteLessonResult | null>(null);
  const [antesFechamento, setAntesFechamento] = useState<{
    streak: number;
    nivel: number;
  } | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  // Início desta tentativa: a conclusão já gravada depois dele não é contada de novo (docs/36 G-3).
  const tentativaIniciadaEm = useRef(new Date().toISOString());
  const [confirmExit, setConfirmExit] = useState(false);
  // Se ESTA conclusão fechou o capítulo — decide se "Voltar à trilha" abre a
  // folha de celebração (docs/25 §12.3/§18 T-19).
  const [capituloFechou, setCapituloFechou] = useState(false);

  // Embaralha 'ordenar' (blocos) e 'parear' (coluna B) UMA vez por sessão da
  // lição. Reembaralha até 3x se por sorte sair já na ordem correta.
  const shownBlocksByIdx = useMemo(
    () =>
      lesson.exercicios.map((ex) => {
        const original =
          ex.type === "ordenar"
            ? ex.blocos
            : ex.type === "parear"
              ? ex.pares.map((p) => p.b)
              : null;
        if (!original) return undefined;
        let mix = shuffled(original);
        for (let tries = 0; tries < 3 && mix.every((b, i) => b === original[i]); tries++) {
          mix = shuffled(original);
        }
        return mix;
      }),
    [lesson, replayKey],
  );

  const exercise = lesson.exercicios[idx];
  const View = exerciseViewFor(exercise.type);
  /** Nível 2 da explicação em camadas (docs/30 §17.1, Fase 7 F7.2). */
  const explanationLayers = itemMetaOf(trilhaExerciseId(lesson.id, idx)).explanationLayers;

  // Sinais ampliados (docs/30 §7.3/§21.1, Fase 6) — mesma ideia de `/study`:
  // duração da questão atual; sem hint/tutor pré-resposta aqui (a lição
  // legada só tem "Explicar melhor" DEPOIS de responder), então `assisted`
  // fica sempre falso nesta superfície.
  const questionShownAtRef = useRef(Date.now());
  useEffect(() => {
    questionShownAtRef.current = Date.now();
  }, [idx, replayKey]);

  function registrarSinal(response: "answered" | "dont-know", correct: boolean, resposta: ExerciseAnswer | null) {
    if (!FEATURES.sinaisAmpliados) return;
    const exerciseId = trilhaExerciseId(lesson.id, idx);
    const meta = itemMetaOf(exerciseId);
    const attempt = buildAttempt({
      id: `at-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      sessionId: null,
      exerciseId,
      exerciseVersion: 1,
      skillIds: meta.skillIds,
      role: "pratica",
      answer: resposta,
      correct,
      response,
      firstSubmission: true,
      startedAtMs: questionShownAtRef.current,
      localDate: hojeISO(),
      itemDifficulty: meta.difficulty,
      source: "legado",
    });
    recordLearningAttempt(attempt, { irt: meta.irt, difficulty: meta.difficulty });
  }

  function verify() {
    if (answer === null) return;
    session.submit(() => {
      const correct = checkAnswer(exercise, answer, shownBlocksByIdx[idx]);
      if (correct) {
        setCorrectCount((c) => c + 1);
      } else {
        setWrongNotes((w) => (w.includes(exercise.explicacao) ? w : [...w, exercise.explicacao]));
      }
      registrarSinal("answered", correct, answer);
      const combo = registrarComboLocal({ resultado: correct ? "certa" : "errada", conta: true });
      setComboDaResposta(FEATURES.comboNaLicao && combo.estado.atual >= 3 ? { n: combo.estado.atual, marco: combo.marco } : null);
      return {
        exerciseId: `${lesson.id}:${idx}`,
        correct,
        explanation: exercise.explicacao,
        marcoDoCombo: FEATURES.comboNaLicao ? combo.marco : null,
      };
    });
  }

  /** Botão "Não sei" (docs/30 §16.1, Fase 6) — conta como não acerto no resultado da lição, sem entrar em `wrongNotes` (não é um erro de conteúdo, é ausência de resposta). */
  function dontKnowClick() {
    session.submit(() => {
      registrarSinal("dont-know", false, null);
      registrarComboLocal({ resultado: "nao-sei", conta: true });
      setComboDaResposta(null);
      return { exerciseId: `${lesson.id}:${idx}`, correct: false, explanation: exercise.explicacao, dontKnow: true };
    });
  }

  /**
   * "Explicar melhor" só ABRE o balão com o contexto fixado — nunca envia
   * mensagem sozinho (docs/20 §4.2): o aluno decide se e o que perguntar.
   */
  /** `ensinarDoZero` (docs/30 §17.2, Fase 7): nível 3 pós-feedback — ver o mesmo padrão em `MicroLessonPlayer.tsx`. */
  function askTutor(ensinarDoZero = false) {
    const exerciseId = trilhaExerciseId(lesson.id, idx);
    const nivel3 = ensinarDoZero && FEATURES.explicacaoEmCamadas;
    const mode = nivel3 ? "ensinar-do-zero" : "duvida";
    const pedagogy = FEATURES.contextoPedagogicoIA
      ? buildPedagogicalContext(getState().learning, getState().prefs.examTargets, exerciseId, mode, hojeISO())
      : null;
    openTutorWithContext(
      {
        ...focusFromExercise(
          exercise,
          answer,
          lesson.id,
          lesson.titulo,
          trilha.nome,
          idx,
          shownBlocksByIdx[idx],
          session.feedback?.correct ?? false,
        ),
        itemId: exerciseId,
      },
      { pedagogy, autoSend: nivel3 ? COPY.tutor.ensinarDoZero : null },
    );
  }

  function next() {
    session.advance(() => {
      if (idx + 1 >= total) {
        const antes = getState();
        const lessonResult = completeLesson(lesson.id, correctCount, total, {
          sessionStartedAt: tentativaIniciadaEm.current,
        });
        const depois = getState();
        setAntesFechamento({
          streak: antes.progress.streak,
          nivel: nivelDeXp(antes.progress.xp).nivel,
        });
        // Mesmo princípio do estudo geral: som de fechamento despachado uma
        // vez, no evento de domínio, não no mount da tela (docs/20 §5, Fase 2).
        const nivelSubiu = nivelDeXp(depois.progress.xp).nivel > nivelDeXp(antes.progress.xp).nivel;
        const streakMudou = depois.progress.streak !== antes.progress.streak;
        // Capítulo (legado) fechado por ESTA conclusão — leva a folha de
        // celebração da trilha a abrir sozinha ao voltar (docs/25 §12.3/§18 T-19).
        const chapter = chapterById(trilha.id);
        const capituloFechou = Boolean(
          chapter && !isChapterCompleted(chapter, antes) && isChapterCompleted(chapter, depois),
        );
        const eventos: SoundEvent[] = [];
        if (nivelSubiu) eventos.push("level-up");
        if (streakMudou && isStreakMilestone(depois.progress.streak)) eventos.push("marco-streak");
        if (streakMudou) eventos.push("streak-diario");
        if (capituloFechou) eventos.push("capitulo-desbloqueado");
        dispatchClosingFeedback(eventos);
        setResult(lessonResult);
        setCapituloFechou(capituloFechou);
        return;
      }
      setIdx(idx + 1);
      setAnswer(null);
      session.reset();
    });
  }

  function replay() {
    session.reset();
    setIdx(0);
    setAnswer(null);
    setCorrectCount(0);
    setWrongNotes([]);
    setResult(null);
    setAntesFechamento(null);
    setCapituloFechou(false);
    tentativaIniciadaEm.current = new Date().toISOString();
    setReplayKey((k) => k + 1);
  }

  /* ------------------------------------------------------------ resultado */
  if (result && antesFechamento) {
    const nivelAtual = nivelDeXp(s.progress.xp).nivel;
    return (
      <PhoneFrame variant="reading">
        <CelebracaoAula
          acertos={correctCount}
          total={total}
          estrelas={result.progress.stars}
          xpGanho={result.xpAwarded}
          streakAtual={s.progress.streak}
          streakMudou={s.progress.streak !== antesFechamento.streak}
          nivelSubiu={nivelAtual > antesFechamento.nivel}
          nivelAtual={nivelAtual}
          notas={wrongNotes}
          primario={{
            label: "Voltar à trilha",
            to: "/trilha",
            search: { concluida: lesson.id, ...(capituloFechou ? { capitulo: trilha.id } : {}) },
          }}
          secundario={{ label: "Refazer lição", onClick: replay }}
        />
      </PhoneFrame>
    );
  }

  /* --------------------------------------------------------------- jogando */
  return (
    <PhoneFrame variant="reading">
      <div className="flex min-h-screen flex-col bg-neve px-5 pb-5 pt-4">
        {/* Topo: sair + progresso */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            aria-label="Sair da lição"
            className="grid h-11 w-11 shrink-0 place-items-center text-nevoa"
          >
            <X size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <ProgressBar
              value={idx}
              max={total}
              tone="caneta"
              size="md"
              label="Progresso da lição"
            />
          </div>
          <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-nevoa">
            {idx + 1}/{total}
          </span>
        </div>

        {/* Exercício atual */}
        <div
          key={`${replayKey}-${idx}`}
          className={cn(
            "flex-1 py-6",
            checked && !session.feedback?.correct ? "anim-shake" : "anim-slide-up",
          )}
        >
          {exercise.imagem && <FiguraDaQuestao imagem={exercise.imagem} className="mb-5" />}
          <View
            exercise={exercise}
            answer={answer}
            onAnswer={setAnswer}
            checked={checked}
            shownBlocks={shownBlocksByIdx[idx]}
          />
        </div>

        {/* Rodapé: verificar ou feedback */}
        {checked && session.feedback ? (
          <FeedbackSheet
            feedback={session.feedback}
            isLast={idx + 1 >= total}
            onContinue={next}
            onAskTutor={() => askTutor(true)}
            combo={comboDaResposta}
          >
            {hasExplanationLayers(explanationLayers) ? <ExplanationLayers layers={explanationLayers} /> : undefined}
          </FeedbackSheet>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              className={cn("btn-primary w-full", answer === null && "opacity-40")}
              disabled={answer === null}
              onClick={verify}
              data-acao-principal
            >
              Verificar
            </button>
            {FEATURES.botaoNaoSei && itemMetaOf(trilhaExerciseId(lesson.id, idx)).dontKnowAllowed !== false && (
              <DontKnowButton onClick={dontKnowClick} />
            )}
          </div>
        )}
      </div>

      {/* A lição não usa AppShell (modo foco, sem bottom nav), então o balão
          do tutor é montado aqui — o "Explicar melhor" precisa dele em tela. */}
      <TutorBubble />

      {/* Confirmação de saída: o progresso da lição não salva pela metade. */}
      <BottomSheet
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title="Sair da lição?"
        icon={<FocaMark expression="neutra" size={56} decorative />} /* sair não é falha: sem cara de decepção (docs/44 I-5) */
      >
        <p className="mt-1.5 text-sm text-abismo">
          {textoSePersistiu(persist, COPY.licao.sairCorpoLegado, COPY.licao.sairCorpoLegadoSemSalvo)}
        </p>
        <div className="mt-4 space-y-2">
          <button type="button" onClick={() => setConfirmExit(false)} className="btn-primary w-full">
            Continuar estudando
          </button>
          <button type="button" onClick={() => navigate({ to: "/trilha" })} className="btn-ghost w-full">
            Sair mesmo assim
          </button>
        </div>
      </BottomSheet>
    </PhoneFrame>
  );
}

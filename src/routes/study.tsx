import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CelebracaoAula } from "@/components/lessons/CelebracaoAula";
import { FeedbackSheet } from "@/components/lessons/FeedbackSheet";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { marcadorClasses, choiceClasses } from "@/components/lessons/exercises/shared";
import { QUESTIONS, type Question } from "@/data/questions";
import { useExerciseSession } from "@/hooks/useExerciseSession";
import { unlockAudioFromGesture, setAudioEnabled } from "@/lib/audio/engine";
import { dispatchClosingFeedback } from "@/lib/feedback/dispatch-feedback";
import type { SoundEvent } from "@/lib/feedback/dispatch-feedback";
import {
  atividadeHoje,
  getState,
  isStreakMilestone,
  nivelDeXp,
  openTutorWithContext,
  registrarAulaConcluida,
  registrarResposta,
  setPrefs,
  setState,
  setTutorFocus,
  useAppState,
  type Gap,
} from "@/lib/store";
import type { TutorFocus } from "@/lib/tutor-prompt";
import { Sparkles, Lightbulb, PlayCircle, Layers, X, Timer, Volume2, VolumeX } from "lucide-react";
import { HOME_ROUTE } from "@/lib/features";

export const Route = createFileRoute("/study")({ component: Study, ssr: false });

/** Uma aula tem 2 questões — é a unidade de 60 segundos decidida no SDD 12. */
const LESSON_SIZE = 2;

/**
 * Monta a aula de 60s. A ordem de prioridade é: lacunas do diagnóstico primeiro,
 * depois matérias declaradas difíceis, depois o resto do banco. Questões já
 * respondidas saem da fila até o banco acabar.
 */
function pickQuestions(gaps: Gap[], difficultSubjects: string[], completed: string[]): Question[] {
  const remaining = QUESTIONS.filter((q) => !completed.includes(q.id));
  const pool = remaining.length ? remaining : QUESTIONS;
  const gapTopics = gaps.map((g) => g.topic);

  const rank = (q: Question) =>
    gapTopics.includes(q.topic) ? 0 : difficultSubjects.includes(q.subjectName) ? 1 : 2;

  return [...pool].sort((a, b) => rank(a) - rank(b)).slice(0, LESSON_SIZE);
}

function Study() {
  const nav = useNavigate();
  const s = useAppState();
  const [questions] = useState<Question[]>(() =>
    pickQuestions(s.quiz.gaps, s.prefs.difficultSubjects, s.progress.completedQuestions),
  );
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lessonDone, setLessonDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  // Máquina de resposta compartilhada com o player de redação (docs/20 §5,
  // Fase 2) — guardas de envio/avanço e snapshot de feedback moram aqui.
  const session = useExerciseSession();
  const [acertosAula, setAcertosAula] = useState(0);
  const [xpInicio] = useState(() => s.progress.xp);
  const [antesFechamento, setAntesFechamento] = useState<{
    streak: number;
    nivel: number;
  } | null>(null);
  const q = questions[idx];
  const answered = session.phase !== "answering";
  const elapsed = useLessonClock(lessonDone);

  /** Snapshot do foco atual, em texto — usado tanto pelo efeito reativo quanto pelos dois CTAs do tutor. */
  function focusFromCurrent(): TutorFocus {
    return {
      questionId: q.id,
      subjectName: q.subjectName,
      topic: q.topic,
      statement: q.statement,
      alternatives: q.alternatives,
      correct: q.correct,
      chosen: answered ? selected : null,
      answered,
      wasCorrect: session.feedback?.correct ?? false,
      explanation: q.explanation,
      hint: q.hint,
    };
  }

  // Mantém o balão global apontado para a questão da vez: é isso que faz a IA
  // explicar O erro DELE em vez do erro médio. Sair da aula desfoca.
  useEffect(() => {
    if (!q || lessonDone) {
      setTutorFocus(null);
      return;
    }
    setTutorFocus(focusFromCurrent());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, session.phase, selected, lessonDone]);

  useEffect(() => () => setTutorFocus(null), []);

  function submit() {
    if (!selected) return;
    session.submit(() => {
      const correct = selected === q.correct;
      // XP real pós-teto (docs/20 §12, Fase 11) — não mais um 15/5 fixo
      // assumido aqui: `registrarResposta` devolve o que foi de fato pago.
      const xpAwarded = registrarResposta(q, correct);
      if (correct) setAcertosAula((n) => n + 1);
      setShowHint(false);
      return { exerciseId: q.id, correct, explanation: q.explanation, xpAwarded };
      // O tutor NÃO abre sozinho ao errar (docs/20 §3 B2, §4.2): só o CTA
      // explícito "Explicar melhor" abre o balão, e só o envio abre a API.
    });
  }

  function nextQ() {
    session.advance(() => {
      setSelected(null);
      setShowHint(false);
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        session.reset();
      } else {
        const antes = getState();
        registrarAulaConcluida();
        const depois = getState();
        setAntesFechamento({
          streak: antes.progress.streak,
          nivel: nivelDeXp(antes.progress.xp).nivel,
        });
        // Som de fechamento despachado UMA vez, aqui — no evento de domínio
        // real, não num efeito de montagem da tela de celebração (docs/20 §5,
        // Fase 2, item 6), que tocaria de novo numa remontagem.
        const nivelSubiu = nivelDeXp(depois.progress.xp).nivel > nivelDeXp(antes.progress.xp).nivel;
        const streakMudou = depois.progress.streak !== antes.progress.streak;
        const metaFechada =
          atividadeHoje(antes).lessons < depois.prefs.dailyLessons &&
          atividadeHoje(depois).lessons >= depois.prefs.dailyLessons;
        // Empilha todo evento que aconteceu; a prioridade entre eles é
        // resolvida uma única vez dentro do motor (`selectHighestPrioritySound`),
        // não duplicada aqui.
        const eventos: SoundEvent[] = [];
        if (nivelSubiu) eventos.push("level-up");
        if (streakMudou && isStreakMilestone(depois.progress.streak)) eventos.push("marco-streak");
        if (metaFechada) eventos.push("meta-diaria");
        if (streakMudou) eventos.push("streak-diario");
        dispatchClosingFeedback(eventos);
        setLessonDone(true);
      }
    });
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-neve pb-24">
        <header className="sticky top-0 z-10 border-b-2 border-gelo bg-neve/95 px-3 pt-3 pb-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav({ to: HOME_ROUTE })}
              aria-label="Sair da aula"
              className="grid h-11 w-11 shrink-0 place-items-center text-nevoa"
            >
              <X size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <ProgressBar
                value={idx + (answered ? 1 : 0)}
                max={questions.length}
                tone="caneta"
                label="Progresso da aula"
              />
            </div>
            <span className="shrink-0 font-mono text-xs font-bold text-nevoa">
              {formatClock(elapsed)}
            </span>
            <button
              onClick={() => {
                const ligar = !s.prefs.sound;
                setPrefs({ sound: ligar });
                // Gesto real do usuário: desbloqueia o contexto se for ligar,
                // e cessa qualquer som em andamento em até 50ms se for desligar
                // (docs/20 §6.4, critério A6) — não espera o próximo render.
                setAudioEnabled(ligar);
                if (ligar) unlockAudioFromGesture();
              }}
              aria-label={s.prefs.sound ? "Desligar som" : "Ligar som"}
              className="grid h-11 w-11 shrink-0 place-items-center text-nevoa"
            >
              {s.prefs.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </header>

        {lessonDone && antesFechamento ? (
          <CelebracaoAula
            acertos={acertosAula}
            total={questions.length}
            segundos={elapsed}
            xpGanho={s.progress.xp - xpInicio}
            streakAtual={s.progress.streak}
            streakMudou={s.progress.streak !== antesFechamento.streak}
            metaFechada={atividadeHoje(s).lessons >= s.prefs.dailyLessons}
            nivelSubiu={nivelDeXp(s.progress.xp).nivel > antesFechamento.nivel}
            nivelAtual={nivelDeXp(s.progress.xp).nivel}
            primario={{ label: "Fechar por hoje", to: HOME_ROUTE }}
            secundario={{ label: "Ver meu progresso", to: "/progress" }}
          />
        ) : (
          <div className="px-5 pt-5">
            <p className="text-xs font-semibold text-nevoa">
              {q.topic} · Nível {q.difficulty} · ~{q.estimatedSeconds}s
            </p>
            <p className="mt-2 text-[17px] font-medium leading-relaxed text-abismo">
              {q.statement}
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {q.alternatives.map((a) => {
                const isSel = selected === a.key;
                const isCorrect = answered && a.key === q.correct;
                const isWrong = answered && isSel && a.key !== q.correct;
                return (
                  <button
                    key={a.key}
                    disabled={answered}
                    onClick={() => setSelected(a.key)}
                    className={`flex items-start gap-3 ${choiceClasses({
                      selected: isSel,
                      checked: answered,
                      isCorrect,
                      isWrongPick: isWrong,
                    })} ${isWrong ? "anim-shake" : ""}`}
                  >
                    <span
                      className={marcadorClasses({
                        selected: isSel,
                        checked: answered,
                        isCorrect,
                        isWrongPick: isWrong,
                      })}
                    >
                      {a.key}
                    </span>
                    <span className="text-abismo">{a.text}</span>
                  </button>
                );
              })}
            </div>

            {!answered ? (
              <div className="mt-5 flex flex-col gap-2">
                {showHint && (
                  <div className="relative rounded-lg border-2 border-gelo bg-cards p-4 text-sm text-abismo">
                    <div className="flex items-start gap-2">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mar/12">
                        <Lightbulb size={16} className="text-mar-fundo" />
                      </div>
                      <div className="flex-1">
                        <p className="ds-label">Dica</p>
                        <p className="mt-1">{q.hint}</p>
                      </div>
                      <button
                        onClick={() => setShowHint(false)}
                        aria-label="Fechar dica"
                        className="text-nevoa"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={submit}
                  disabled={!selected}
                  className="btn-primary w-full disabled:opacity-40"
                >
                  Responder
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShowHint(true)} className="btn-outline">
                    <Lightbulb size={16} /> Pedir dica
                  </button>
                  <button
                    onClick={() => openTutorWithContext(focusFromCurrent())}
                    className="btn-outline"
                  >
                    <Sparkles size={16} /> Perguntar à Foca
                  </button>
                </div>
              </div>
            ) : session.feedback ? (
              <FeedbackSheet
                feedback={session.feedback}
                isLast={idx + 1 >= questions.length}
                onContinue={nextQ}
                onAskTutor={
                  !session.feedback.correct
                    ? () => openTutorWithContext(focusFromCurrent())
                    : undefined
                }
              >
                <div className="card-soft space-y-3 p-4">
                  <div>
                    <p className="ds-label">Resolução passo a passo</p>
                    <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-sm text-abismo">
                      {q.stepByStep.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <SalvarFlashcard questionId={q.id} />
                    <Link
                      to="/video/$id"
                      params={{ id: q.videoSuggestion.id }}
                      className="btn-outline"
                    >
                      <PlayCircle size={16} /> Videoaula
                    </Link>
                  </div>
                </div>
              </FeedbackSheet>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SalvarFlashcard({ questionId }: { questionId: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={() => {
        setState((st) => {
          if (!st.progress.savedFlashcards.includes(questionId))
            st.progress.savedFlashcards.push(questionId);
          return st;
        });
        setSaved(true);
      }}
      className="btn-outline"
    >
      <Layers size={16} /> {saved ? "Salvo!" : "Salvar flashcard"}
    </button>
  );
}

/** Relógio da aula. Marca o tempo real gasto — não corta o aluno, só dá o ritmo de 60s. */
function useLessonClock(stopped: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (stopped) return;
    const t = setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [stopped]);
  return seconds;
}

function formatClock(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

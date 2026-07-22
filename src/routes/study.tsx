import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Bolt } from "@/components/AppShell";
import { QUESTIONS, type Question } from "@/data/questions";
import {
  askTutorAutomatically,
  openTutor,
  setState,
  setTutorFocus,
  useAppState,
  type Gap,
} from "@/lib/store";
import { Sparkles, Lightbulb, PlayCircle, Layers, ArrowRight, X } from "lucide-react";

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
  const [phase, setPhase] = useState<"answer" | "result" | "done">("answer");
  const [showHint, setShowHint] = useState(false);
  const q = questions[idx];
  const elapsed = useLessonClock(phase === "done");

  // Mantém o balão global apontado para a questão da vez: é isso que faz a IA
  // explicar O erro DELE em vez do erro médio. Sair da aula desfoca.
  useEffect(() => {
    if (!q || phase === "done") {
      setTutorFocus(null);
      return;
    }
    setTutorFocus({
      questionId: q.id,
      subjectName: q.subjectName,
      topic: q.topic,
      statement: q.statement,
      alternatives: q.alternatives,
      correct: q.correct,
      chosen: phase === "result" ? selected : null,
      explanation: q.explanation,
      hint: q.hint,
    });
  }, [q, phase, selected]);

  useEffect(() => () => setTutorFocus(null), []);

  function submit() {
    if (!selected) return;
    const correct = selected === q.correct;
    setShowHint(false);
    setState((st) => {
      st.progress.answered += 1;
      if (!st.progress.completedQuestions.includes(q.id)) st.progress.completedQuestions.push(q.id);
      if (correct) st.progress.correct += 1;
      st.progress.bySubject[q.subject] ??= { answered: 0, correct: 0 };
      st.progress.bySubject[q.subject].answered += 1;
      if (correct) st.progress.bySubject[q.subject].correct += 1;
      st.progress.byTopic[q.topic] ??= { answered: 0, correct: 0 };
      st.progress.byTopic[q.topic].answered += 1;
      if (correct) st.progress.byTopic[q.topic].correct += 1;
      st.progress.xp += correct ? 15 : 5;
      const today = new Date().toDateString();
      if (st.progress.lastStudyDate !== today) {
        st.progress.streak += 1;
        st.progress.lastStudyDate = today;
      }
      return st;
    });
    setPhase("result");

    // Errou? O tutor entra sozinho explicando o erro DELE — não espera ser
    // chamado. É o momento de IA que a demo destaca (SDD 12, D2).
    if (!correct) {
      askTutorAutomatically(
        {
          questionId: q.id,
          subjectName: q.subjectName,
          topic: q.topic,
          statement: q.statement,
          alternatives: q.alternatives,
          correct: q.correct,
          chosen: selected,
          explanation: q.explanation,
          hint: q.hint,
        },
        `Marquei ${selected} e errei. Onde meu raciocínio desandou?`,
      );
    }
  }

  function nextQ() {
    setSelected(null);
    setShowHint(false);
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPhase("answer");
    } else {
      setState((st) => {
        st.progress.lessonsCompleted += 1;
        return st;
      });
      setPhase("done");
    }
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-white pb-24">
        <header className="sticky top-0 z-10 bg-white px-5 pt-4 pb-3 border-b border-mist">
          <div className="flex items-center justify-between text-xs font-semibold text-navy-2">
            <span className="inline-flex items-center gap-1.5">
              <Bolt size={13} /> Aula de 60s · {idx + 1}/{questions.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="chip uppercase">
                {q.subjectName} · {formatClock(elapsed)}
              </span>
              <button
                onClick={() => nav({ to: "/dashboard" })}
                className="text-sm font-bold text-error"
              >
                Sair
              </button>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((idx + (phase === "answer" ? 0 : 1)) / questions.length) * 100}%`,
                background: "#FEB803",
              }}
            />
          </div>
        </header>

        {phase === "done" ? (
          <LessonDone
            total={questions.length}
            seconds={elapsed}
            onFinish={() => nav({ to: "/dashboard" })}
          />
        ) : (
          <div className="px-5 pt-5">
            <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
              <span className="chip">{q.topic}</span>
              <span className="chip">Nível {q.difficulty}</span>
              <span className="chip">~{q.estimatedSeconds}s</span>
            </div>
            <p className="font-display text-lg font-semibold leading-snug text-navy">
              {q.statement}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {q.alternatives.map((a) => {
                const isSel = selected === a.key;
                const isCorrect = phase === "result" && a.key === q.correct;
                const isWrong = phase === "result" && isSel && a.key !== q.correct;
                return (
                  <button
                    key={a.key}
                    disabled={phase === "result"}
                    onClick={() => setSelected(a.key)}
                    className={`flex items-start gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-left text-sm font-medium transition
                      ${isCorrect ? "border-success bg-success/10" : isWrong ? "border-error bg-error/10" : isSel ? "border-yellow bg-[#FFFAF0] border-2" : "border-[#E6E5EE] bg-white"}`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-md font-display text-xs font-bold ${isSel || isCorrect ? "bg-navy text-white" : "bg-mist text-slate"}`}
                    >
                      {a.key}
                    </span>
                    <span className="text-navy">{a.text}</span>
                  </button>
                );
              })}
            </div>

            {phase === "answer" ? (
              <div className="mt-5 flex flex-col gap-2">
                {showHint && (
                  <div className="relative rounded-xl border border-[#FFD466] bg-[#FFFAF0] p-4 text-sm text-navy">
                    <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-l border-t border-[#FFD466] bg-[#FFFAF0]" />
                    <div className="flex items-start gap-2">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#FFD466]">
                        <Lightbulb size={16} className="text-navy" />
                      </div>
                      <div className="flex-1">
                        <p className="ds-label">Dica</p>
                        <p className="mt-1">{q.hint}</p>
                      </div>
                      <button
                        onClick={() => setShowHint(false)}
                        aria-label="Fechar dica"
                        className="text-navy-2"
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
                  <button onClick={() => openTutor()} className="btn-outline">
                    <Sparkles size={16} /> Perguntar à IA
                  </button>
                </div>
              </div>
            ) : (
              <ResultBlock
                q={q}
                correct={selected === q.correct}
                onSaveFlash={() =>
                  setState((st) => {
                    if (!st.progress.savedFlashcards.includes(q.id))
                      st.progress.savedFlashcards.push(q.id);
                    return st;
                  })
                }
                onAI={() => openTutor()}
                onNext={nextQ}
              />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ResultBlock({ q, correct, onSaveFlash, onAI, onNext }: any) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="mt-6 space-y-4">
      <div
        className="rounded-xl p-4"
        style={
          correct
            ? { background: "#EEF6F0", color: "#0AA35A" }
            : { background: "#FBECEA", color: "#C0392B" }
        }
      >
        <p className="font-display font-bold">{correct ? "Acertou!" : "Resposta incorreta"}</p>
        <p className="mt-1 text-sm text-slate">
          Alternativa correta: <strong>{q.correct}</strong>
        </p>
      </div>
      <div className="card-soft p-4">
        <p className="ds-label">Explicação</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate">{q.explanation}</p>
        <p className="ds-label mt-4 block">Resolução passo a passo</p>
        <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-sm text-slate">
          {q.stepByStep.map((s: string, i: number) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            onSaveFlash();
            setSaved(true);
          }}
          className="btn-outline"
        >
          <Layers size={16} /> {saved ? "Salvo!" : "Salvar como flashcard"}
        </button>
        <Link to="/video/$id" params={{ id: q.videoSuggestion.id }} className="btn-outline">
          <PlayCircle size={16} /> Videoaula
        </Link>
      </div>
      <button onClick={onAI} className="btn-outline w-full">
        <Sparkles size={16} /> Perguntar à IA
      </button>
      <button onClick={onNext} className="btn-primary w-full">
        Continuar <ArrowRight size={16} />
      </button>
    </div>
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

function LessonDone({
  total,
  seconds,
  onFinish,
}: {
  total: number;
  seconds: number;
  onFinish: () => void;
}) {
  const s = useAppState();
  const acc = s.progress.answered
    ? Math.round((s.progress.correct / s.progress.answered) * 100)
    : 0;
  return (
    <div className="px-6 pt-10 text-center">
      <div
        className="mx-auto grid h-24 w-24 place-items-center rounded-full"
        style={{ background: "#FEB803" }}
      >
        <Bolt size={48} color="#02104E" />
      </div>
      <h2 className="mt-5 font-display text-[28px] font-bold text-navy">Aula concluída!</h2>
      <p className="mt-1.5 text-sm text-navy-2">
        {total} questões em {formatClock(seconds)}. Sequência viva — volta amanhã.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-2.5">
        <Tile label="Acertos" value={`${acc}%`} />
        <Tile label="Sequência" value={`${s.progress.streak}d`} />
        <Tile label="Aulas" value={`${s.progress.lessonsCompleted}`} />
      </div>
      <Link to="/progress" className="btn-navy mt-6 w-full">
        Ver meu progresso
      </Link>
      <button onClick={onFinish} className="btn-ghost mt-2 w-full">
        Voltar ao início
      </button>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft px-2 py-3">
      <p className="text-[11px] font-semibold text-navy-2">{label}</p>
      <p className="font-display text-xl font-bold text-navy">{value}</p>
    </div>
  );
}

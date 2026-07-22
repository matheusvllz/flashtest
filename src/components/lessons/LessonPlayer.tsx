import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { RotateCcw, Star, X } from "lucide-react";
import { Bolt, PhoneFrame } from "@/components/AppShell";
import { TutorBubble } from "@/components/TutorBubble";
import { FeedbackBar } from "./FeedbackBar";
import { checkAnswer, shuffled } from "@/lib/lessons/define";
import { exerciseViewFor } from "@/lib/lessons/registry";
import { focusFromExercise } from "@/lib/lessons/tutor-focus";
import type { ExerciseAnswer, Lesson, Trilha } from "@/lib/lessons/types";
import { askTutorAutomatically, completeLesson, type CompleteLessonResult } from "@/lib/store";
import { cn } from "@/lib/utils";

const RESULT_LINE: Record<1 | 2 | 3, string> = {
  3: "Impecável. Esse assunto já é seu.",
  2: "Mandou bem. Revisa os que errou e volta pra fechar as três estrelas.",
  1: "Concluiu, e isso conta. Refaz com calma que isso vira reflexo.",
};

/**
 * O tocador universal da trilha de redação: recebe QUALQUER lição declarada
 * com `defineLesson()` e cuida de tudo — progresso no topo, render do
 * exercício via registry, correção algorítmica (zero IA, custo zero), barra de
 * feedback e tela final com estrelas + XP.
 *
 * A lição roda em tela cheia (sem bottom nav): é modo de foco, o mesmo
 * princípio da aula de 60s. Sair exige confirmação.
 */
export function LessonPlayer({ trilha, lesson }: { trilha: Trilha; lesson: Lesson }) {
  const navigate = useNavigate();
  const total = lesson.exercicios.length;
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<ExerciseAnswer | null>(null);
  const [checked, setChecked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  // O que o aluno errou: vira o "anota pra melhorar" da tela final.
  const [wrongNotes, setWrongNotes] = useState<string[]>([]);
  const [result, setResult] = useState<CompleteLessonResult | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);

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

  function verify() {
    if (answer === null) return;
    const correct = checkAnswer(exercise, answer, shownBlocksByIdx[idx]);
    setChecked(true);
    setWasCorrect(correct);
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongNotes((w) => (w.includes(exercise.explicacao) ? w : [...w, exercise.explicacao]));
    }
  }

  /** Erro + "Explicar melhor" = o mesmo tutor de IA que explica a aula de 60s. */
  function askTutor() {
    askTutorAutomatically(
      focusFromExercise(exercise, answer, lesson.titulo, trilha.nome, idx),
      "Errei esse exercício de redação. Me explica onde eu me perdi, em 2 frases, e me dá uma dica pra não repetir.",
    );
  }

  function next() {
    if (idx + 1 >= total) {
      setResult(completeLesson(lesson.id, correctCount, total));
      return;
    }
    setIdx(idx + 1);
    setAnswer(null);
    setChecked(false);
    setWasCorrect(false);
  }

  function replay() {
    setIdx(0);
    setAnswer(null);
    setChecked(false);
    setWasCorrect(false);
    setCorrectCount(0);
    setWrongNotes([]);
    setResult(null);
    setReplayKey((k) => k + 1);
  }

  /* ------------------------------------------------------------ resultado */
  if (result) {
    const stars = result.progress.stars;
    return (
      <PhoneFrame>
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-navy px-6 py-10 text-center text-white">
          <div className="flex gap-2" aria-label={`${stars} de 3 estrelas`}>
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                size={44}
                // As estrelas ganhas entram em cascata; as não ganhas ficam paradas.
                className={cn(n <= stars ? "anim-pop-in fill-yellow text-yellow" : "text-white/25")}
                style={n <= stars ? { animationDelay: `${n * 130}ms` } : undefined}
              />
            ))}
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold">Lição concluída!</h2>
            <p className="mt-1 text-sm text-navy-mist">
              Você acertou {correctCount} de {total}.
            </p>
          </div>

          {result.xpAwarded > 0 && (
            <p
              className="anim-xp flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 font-display text-lg font-bold text-yellow"
              style={{ animationDelay: "420ms" }}
            >
              <Bolt size={18} /> +{result.xpAwarded} XP
            </p>
          )}

          <p className="max-w-xs text-sm leading-relaxed text-navy-mist">{RESULT_LINE[stars]}</p>

          {wrongNotes.length > 0 && (
            <div className="w-full rounded-2xl border border-white/15 bg-white/[0.06] p-4 text-left">
              <p className="ds-label" style={{ color: "#FEB803" }}>
                Anota pra melhorar
              </p>
              <ul className="mt-2 space-y-2">
                {wrongNotes.slice(0, 3).map((nota) => (
                  <li key={nota} className="text-[13px] leading-snug text-white/85">
                    {nota}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-2 w-full space-y-2">
            <Link to="/redacao" className="btn-primary w-full">
              Voltar à trilha
            </Link>
            <button onClick={replay} className="btn-ghost w-full">
              <RotateCcw size={16} /> Refazer lição
            </button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  /* --------------------------------------------------------------- jogando */
  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col bg-white px-5 pb-5 pt-4">
        {/* Topo: sair + progresso */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfirmExit(true)}
            aria-label="Sair da lição"
            className="shrink-0 text-navy-2"
          >
            <X size={22} />
          </button>
          <div
            className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist"
            role="progressbar"
            aria-valuenow={idx}
            aria-valuemax={total}
            aria-label="Progresso da lição"
          >
            <div
              className="h-full rounded-full bg-yellow transition-all duration-500"
              style={{ width: `${(idx / total) * 100}%` }}
            />
          </div>
          <span className="shrink-0 font-display text-[13px] font-bold tabular-nums text-navy-2">
            {idx + 1}/{total}
          </span>
        </div>

        {/* Exercício atual */}
        <div
          key={`${replayKey}-${idx}`}
          className={cn("flex-1 py-6", checked && !wasCorrect ? "anim-shake" : "anim-slide-up")}
        >
          {exercise.imagem && (
            <figure className="mb-5">
              <img
                src={exercise.imagem.url}
                alt={exercise.imagem.alt}
                loading="lazy"
                className="mx-auto max-h-64 w-auto rounded-xl border border-mist bg-white"
              />
              {exercise.imagem.credito && (
                <figcaption className="mt-1.5 text-center text-[11px] text-navy-2">
                  {exercise.imagem.credito}
                </figcaption>
              )}
            </figure>
          )}
          <View
            exercise={exercise}
            answer={answer}
            onAnswer={setAnswer}
            checked={checked}
            shownBlocks={shownBlocksByIdx[idx]}
          />
        </div>

        {/* Rodapé: verificar ou feedback */}
        {checked ? (
          <FeedbackBar
            correct={wasCorrect}
            explanation={exercise.explicacao}
            isLast={idx + 1 >= total}
            onContinue={next}
            onAskTutor={askTutor}
          />
        ) : (
          <button
            className={cn("btn-primary w-full", answer === null && "opacity-40")}
            disabled={answer === null}
            onClick={verify}
          >
            Verificar
          </button>
        )}
      </div>

      {/* A lição não usa AppShell (modo foco, sem bottom nav), então o balão
          do tutor é montado aqui — o "Explicar melhor" precisa dele em tela. */}
      <TutorBubble />

      {/* Confirmação de saída: o progresso da lição não salva pela metade. */}
      {confirmExit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 px-6">
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-5">
            <h3 className="font-display text-lg font-bold text-navy">Sair da lição?</h3>
            <p className="mt-1.5 text-sm text-slate">
              O progresso desta lição não fica salvo pela metade — você recomeça do zero na próxima
              vez.
            </p>
            <div className="mt-4 space-y-2">
              <button onClick={() => setConfirmExit(false)} className="btn-primary w-full">
                Continuar estudando
              </button>
              <button onClick={() => navigate({ to: "/redacao" })} className="btn-ghost w-full">
                Sair mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}

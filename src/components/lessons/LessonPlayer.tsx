import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { TutorBubble } from "@/components/TutorBubble";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { CelebracaoAula } from "./CelebracaoAula";
import { FeedbackSheet } from "./FeedbackSheet";
import { checkAnswer, shuffled } from "@/lib/lessons/define";
import { exerciseViewFor } from "@/lib/lessons/registry";
import { focusFromExercise } from "@/lib/lessons/tutor-focus";
import type { ExerciseAnswer, Lesson, Trilha } from "@/lib/lessons/types";
import {
  askTutorAutomatically,
  completeLesson,
  getState,
  nivelDeXp,
  useAppState,
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
  const navigate = useNavigate();
  const s = useAppState();
  const total = lesson.exercicios.length;
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<ExerciseAnswer | null>(null);
  const [checked, setChecked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  // O que o aluno errou: vira o "anota pra melhorar" da tela final.
  const [wrongNotes, setWrongNotes] = useState<string[]>([]);
  const [result, setResult] = useState<CompleteLessonResult | null>(null);
  const [antesFechamento, setAntesFechamento] = useState<{
    streak: number;
    nivel: number;
  } | null>(null);
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
      const antes = getState();
      setAntesFechamento({
        streak: antes.progress.streak,
        nivel: nivelDeXp(antes.progress.xp).nivel,
      });
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
    setAntesFechamento(null);
    setReplayKey((k) => k + 1);
  }

  /* ------------------------------------------------------------ resultado */
  if (result && antesFechamento) {
    const nivelAtual = nivelDeXp(s.progress.xp).nivel;
    return (
      <PhoneFrame>
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
          primario={{ label: "Voltar à trilha", to: "/redacao" }}
          secundario={{ label: "Refazer lição", onClick: replay }}
        />
      </PhoneFrame>
    );
  }

  /* --------------------------------------------------------------- jogando */
  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col bg-neve px-5 pb-5 pt-4">
        {/* Topo: sair + progresso */}
        <div className="flex items-center gap-3">
          <button
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
          className={cn("flex-1 py-6", checked && !wasCorrect ? "anim-shake" : "anim-slide-up")}
        >
          {exercise.imagem && (
            <figure className="mb-5">
              <img
                src={exercise.imagem.url}
                alt={exercise.imagem.alt}
                loading="lazy"
                className="mx-auto max-h-64 w-auto rounded-xl border-2 border-gelo bg-cards"
              />
              {exercise.imagem.credito && (
                <figcaption className="mt-1.5 text-center text-[11px] text-nevoa">
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
          <FeedbackSheet
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
      <BottomSheet
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title="Sair da lição?"
        icon={<FocaMark expression="desapontada" size={56} decorative />}
      >
        <p className="mt-1.5 text-sm text-abismo">
          O progresso desta lição não fica salvo pela metade — você recomeça do zero na próxima vez.
        </p>
        <div className="mt-4 space-y-2">
          <button onClick={() => setConfirmExit(false)} className="btn-primary w-full">
            Continuar estudando
          </button>
          <button onClick={() => navigate({ to: "/redacao" })} className="btn-ghost w-full">
            Sair mesmo assim
          </button>
        </div>
      </BottomSheet>
    </PhoneFrame>
  );
}

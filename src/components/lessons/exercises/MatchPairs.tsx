import { useState } from "react";
import { Hand } from "lucide-react";
import type { MatchPairsExercise } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";
import type { ExerciseViewProps } from "./shared";

/**
 * Parear colunas por toque: instrução de uso sempre visível, seleção da
 * esquerda bem marcada, e cada par formado ganha um NÚMERO igual dos dois
 * lados, casando visualmente as metades. O estado parcial vive aqui; o player
 * só recebe a resposta quando todos os pares fecham.
 */
export function MatchPairsView({
  exercise,
  onAnswer,
  checked,
  shownBlocks,
}: ExerciseViewProps<MatchPairsExercise>) {
  const right = shownBlocks ?? exercise.pares.map((p) => p.b);
  const [pairs, setPairs] = useState<number[]>(() => exercise.pares.map(() => -1));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  function commit(next: number[]) {
    setPairs(next);
    onAnswer(next.every((v) => v >= 0) ? next : null);
  }

  function tapLeft(i: number) {
    if (checked) return;
    if (pairs[i] >= 0) {
      const next = [...pairs];
      next[i] = -1;
      commit(next);
      setSelectedLeft(i);
      return;
    }
    setSelectedLeft(selectedLeft === i ? null : i);
  }

  function tapRight(j: number) {
    if (checked) return;
    const takenBy = pairs.findIndex((v) => v === j);
    if (takenBy >= 0) {
      const next = [...pairs];
      next[takenBy] = -1;
      commit(next);
      return;
    }
    if (selectedLeft === null) return;
    const next = [...pairs];
    next[selectedLeft] = j;
    setSelectedLeft(null);
    commit(next);
  }

  function pairIsCorrect(i: number): boolean {
    return pairs[i] >= 0 && right[pairs[i]] === exercise.pares[i].b;
  }

  /** Número do par (1, 2, 3...) na ordem em que foram formados. */
  const pairOrder = pairs
    .map((j, i) => ({ i, j }))
    .filter((p) => p.j >= 0)
    .map((p, ordem) => ({ ...p, n: ordem + 1 }));
  const numeroDoEsquerdo = (i: number) => pairOrder.find((p) => p.i === i)?.n;
  const numeroDoDireito = (j: number) => pairOrder.find((p) => p.j === j)?.n;

  function badge(n: number | undefined, correct?: boolean) {
    if (!n) return null;
    return (
      <span
        className={cn(
          "absolute -left-2 -top-2 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold shadow-sm",
          checked
            ? correct
              ? "bg-success text-white"
              : "bg-error text-white"
            : "bg-mar text-white",
        )}
        aria-hidden
      >
        {n}
      </span>
    );
  }

  const cellBase =
    "relative flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 px-2 py-2 text-center text-[13px] font-semibold leading-snug shadow-[0_2px_0_var(--color-gelo)] transition-all duration-150";

  return (
    <div className="space-y-3">
      <p className="font-display text-lg font-bold leading-snug text-abismo">
        {exercise.instrucao ?? "Combine as duas colunas"}
      </p>
      <p className="flex items-center gap-1.5 rounded-lg bg-neve px-3 py-2 text-[11px] font-semibold text-nevoa">
        <Hand size={14} className="shrink-0 text-mar-fundo" aria-hidden />
        Toque numa opção da esquerda e depois no par dela na direita.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {/* Coluna A (ordem fixa) */}
        <div className="space-y-2.5" aria-label="Coluna da esquerda">
          {exercise.pares.map((par, i) => {
            const n = numeroDoEsquerdo(i);
            return (
              <button
                key={i}
                disabled={checked}
                onClick={() => tapLeft(i)}
                className={cn(
                  cellBase,
                  !checked && "active:scale-95",
                  !checked &&
                    selectedLeft === i &&
                    "scale-[1.03] border-mar bg-mar/8 text-abismo ring-2 ring-mar/40",
                  !checked &&
                    selectedLeft !== i &&
                    pairs[i] < 0 &&
                    "border-gelo bg-cards text-abismo",
                  !checked && pairs[i] >= 0 && "border-mar/50 bg-mar/[0.06] text-abismo",
                  checked && pairIsCorrect(i) && "border-success bg-success/10 text-abismo",
                  checked && !pairIsCorrect(i) && "border-error bg-error/10 text-abismo",
                  checked && "cursor-default",
                )}
              >
                {badge(n, pairIsCorrect(i))}
                {par.a}
              </button>
            );
          })}
        </div>
        {/* Coluna B (embaralhada pelo player) */}
        <div className="space-y-2.5" aria-label="Coluna da direita">
          {right.map((b, j) => {
            const pairedWith = pairs.findIndex((v) => v === j);
            const correct = pairedWith >= 0 && exercise.pares[pairedWith].b === b;
            const n = numeroDoDireito(j);
            return (
              <button
                key={j}
                disabled={checked}
                onClick={() => tapRight(j)}
                className={cn(
                  cellBase,
                  !checked && "active:scale-95",
                  // Com um item da esquerda selecionado, a direita "chama" o toque.
                  !checked &&
                    selectedLeft !== null &&
                    pairedWith < 0 &&
                    "border-mar/40 bg-mar/[0.03] text-abismo",
                  !checked &&
                    selectedLeft === null &&
                    pairedWith < 0 &&
                    "border-gelo bg-cards text-abismo",
                  !checked && pairedWith >= 0 && "border-mar/50 bg-mar/[0.06] text-abismo",
                  checked &&
                    pairedWith >= 0 &&
                    correct &&
                    "border-success bg-success/10 text-abismo",
                  checked && pairedWith >= 0 && !correct && "border-error bg-error/10 text-abismo",
                  checked && pairedWith < 0 && "border-gelo bg-cards text-abismo",
                  checked && "cursor-default",
                )}
              >
                {badge(n, correct)}
                {b}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { X } from "lucide-react";
import { ProgressBar } from "@/components/ds/ProgressBar";

/**
 * Cabeçalho fixo do player de lição (docs/25 §12.2/§18 T-11) — sair, barra de
 * progresso da lição inteira (em passos, não em questões), contador de
 * questão (só quando o passo atual é `question`) e o "onde estou" (capítulo ›
 * lição). Substitui o cabeçalho que vivia inline em `MicroLessonPlayer`.
 */
export function LessonHeader({
  onExit,
  value,
  max,
  counter,
  breadcrumb,
}: {
  onExit: () => void;
  value: number;
  max: number;
  /** "{n}/{total}" — só passado quando o passo atual é uma questão (docs/25 §12.2). */
  counter?: string;
  breadcrumb: string;
}) {
  return (
    <div className="sticky top-0 z-10 border-b-2 border-gelo bg-neve/95 px-5 pt-4 pb-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onExit}
          aria-label="Sair da lição"
          className="grid h-11 w-11 shrink-0 place-items-center text-nevoa"
        >
          <X size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <ProgressBar value={value} max={max} tone="caneta" size="md" label="Progresso da lição" />
        </div>
        {counter && (
          <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-nevoa">{counter}</span>
        )}
      </div>
      <p className="ds-label mt-1.5 truncate">{breadcrumb}</p>
    </div>
  );
}

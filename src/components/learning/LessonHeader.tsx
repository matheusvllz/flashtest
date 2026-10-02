import type { ReactNode } from "react";
import { X } from "lucide-react";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { RaioDoCombo } from "@/components/learning/RaioDoCombo";
import type { MarcoDoCombo } from "@/lib/combo";
import { cn } from "@/lib/utils";

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
  extra,
  combo,
  raio,
}: {
  onExit: () => void;
  value: number;
  max: number;
  /** "{n}/{total}" — só passado quando o passo atual é uma questão (docs/25 §12.2). */
  counter?: string;
  breadcrumb: string;
  /** Ao lado do contador (ex.: as vidas do Free, spec 49 D49-03). */
  extra?: ReactNode;
  /** Combo atual (spec 50 §5.1.2): ≥ 3 acende a borda da barra. */
  combo?: number;
  /** Marco do combo da última resposta, com uma chave para redesenhar o raio a cada marco. */
  raio?: { marco: MarcoDoCombo; chave: string | number } | null;
}) {
  return (
    <div className="sticky top-0 z-10 border-b-2 border-gelo bg-neve/95 px-5 pt-4 pb-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Sair da lição"
          className="grid h-11 w-11 shrink-0 place-items-center text-nevoa"
        >
          <X size={20} />
        </button>
        <div
          className={cn(
            "relative min-w-0 flex-1 rounded-full transition-shadow",
            (combo ?? 0) >= 3 && "shadow-[0_0_0_2px_var(--alert)]",
          )}
          data-combo={combo ?? 0}
        >
          <ProgressBar value={value} max={max} tone="caneta" size="md" label="Progresso da lição" />
          {raio && <RaioDoCombo marco={raio.marco} chave={raio.chave} />}
        </div>
        {counter && (
          <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-nevoa">{counter}</span>
        )}
        {extra}
      </div>
      <p className="ds-label mt-1.5 truncate">{breadcrumb}</p>
    </div>
  );
}

import { Check } from "lucide-react";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { COPY } from "@/lib/copy";
import type { TrailSection } from "@/lib/learning/trail";

/**
 * Cabeçalho de seção da trilha (docs/25 §12.1, §18 T-16). O `Check` verde
 * (`text-success`) só aparece quando a seção está de fato concluída — verde é
 * reservado a conclusão real, não decoração (docs/18 §6.1).
 */
export function SectionHeader({ section }: { section: TrailSection }) {
  return (
    <div className="pt-2">
      <p className="ds-label">{COPY.trilha.secao(section.index)}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-abismo">{section.title}</h2>
        <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] font-bold text-nevoa">
          {section.status === "completed" && <Check size={14} className="text-success" aria-hidden />}
          {section.completedCount}/{section.totalCount}
        </span>
      </div>
      <ProgressBar
        value={section.completedCount}
        max={section.totalCount}
        tone="caneta"
        size="sm"
        label={`Progresso em ${section.title}`}
        className="mt-2"
      />
    </div>
  );
}

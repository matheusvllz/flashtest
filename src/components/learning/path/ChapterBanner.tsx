import { ChevronDown, Lock, Stamp } from "lucide-react";
import { COPY } from "@/lib/copy";
import type { TrailChapter } from "@/lib/learning/trail";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho de capítulo, sticky dentro do próprio segmento (RF-7, docs/28
 * T-11) — botão de expandir/recolher quando não está bloqueado. Sticky é só
 * CSS (`top: var(--trail-sticky-top)`), sem JS.
 */
export function ChapterBanner({
  chapter,
  sectionIndex,
  chapterNumber,
  expanded,
  onToggle,
  listId,
}: {
  chapter: TrailChapter;
  sectionIndex: number;
  chapterNumber: number;
  expanded: boolean;
  onToggle: () => void;
  /** id do <ol> controlado (aria-controls). */
  listId: string;
}) {
  const titleId = `cap-${chapter.id}`;
  const locked = chapter.status === "locked";
  const done = chapter.status === "completed";
  const body = (
    <>
      <span className="min-w-0 flex-1 text-left">
        <span className="ds-label block">{COPY.trilha.capituloRotulo(sectionIndex, chapterNumber)}</span>
        <span id={titleId} className="mt-0.5 block font-display text-base font-bold leading-tight text-abismo">
          {chapter.title}
        </span>
        {locked && (
          <span className="mt-1 flex items-center gap-1.5 text-xs text-nevoa">
            <Lock size={12} aria-hidden="true" /> {COPY.trilha.capituloBloqueado}
          </span>
        )}
      </span>
      {done && (
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-abismo bg-recompensa text-abismo"
          aria-hidden="true"
        >
          <Stamp size={14} />
        </span>
      )}
      <span className="shrink-0 font-mono text-xs font-bold text-nevoa">
        {chapter.completedCount}/{chapter.totalCount}
      </span>
      {!locked && (
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn("shrink-0 text-nevoa transition-transform duration-200", expanded && "rotate-180")}
        />
      )}
    </>
  );
  return (
    <div
      className="sticky z-[5] -mx-1 bg-neve/95 px-1 py-2 backdrop-blur"
      style={{ top: "var(--trail-sticky-top)" }}
    >
      {locked ? (
        <div className="card-soft flex min-h-14 w-full items-center gap-3 px-4 py-3">{body}</div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={listId}
          className="card-press flex min-h-14 w-full items-center gap-3 px-4 py-3"
        >
          {body}
        </button>
      )}
    </div>
  );
}

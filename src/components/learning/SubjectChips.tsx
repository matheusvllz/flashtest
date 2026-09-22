import type { TrailSubject } from "@/lib/learning/trail";
import { cn } from "@/lib/utils";

/**
 * Chips de matéria da trilha (docs/25 §12.1, §18 T-17) — sticky, rolagem
 * horizontal com scroll-snap quando não cabe na largura. Ordem = a ordem que
 * `model.subjects` já vem (que é `CURRICULUM_TREE.subjects`, docs/25 §7.5).
 */
export function SubjectChips({
  subjects,
  selectedId,
  onSelect,
}: {
  subjects: TrailSubject[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="sticky top-0 z-10 flex gap-2 overflow-x-auto bg-neve/95 px-5 py-3 backdrop-blur"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {subjects.map((subject) => (
        <button
          key={subject.id}
          type="button"
          onClick={() => onSelect(subject.id)}
          aria-pressed={subject.id === selectedId}
          className={cn("chip shrink-0", subject.id === selectedId && "chip-on")}
          style={{ scrollSnapAlign: "start" }}
        >
          {subject.name}
          <span className="font-mono text-[11px]">
            {subject.completedCount}/{subject.totalCount}
          </span>
        </button>
      ))}
    </div>
  );
}

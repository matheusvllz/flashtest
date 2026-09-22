import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import { LessonNode } from "./LessonNode";
import { COPY } from "@/lib/copy";
import type { TrailChapter } from "@/lib/learning/trail";
import { cn } from "@/lib/utils";

/**
 * Capítulo colapsável da trilha (docs/25 §12.1, §18 T-16). `locked` mostra
 * só o cabeçalho — sem corpo, sem `aria-expanded` (não há nada pra expandir:
 * o capítulo inteiro está fora de alcance, não é um acordeão vazio).
 */
export function ChapterCard({
  chapter,
  defaultOpen,
  highlightId,
}: {
  chapter: TrailChapter;
  defaultOpen: boolean;
  highlightId?: string;
}) {
  const [aberto, setAberto] = useState(defaultOpen);
  const locked = chapter.status === "locked";

  // Destaque do avanço (docs/25 §12.1/§18 T-24): além do nó em `highlightId`
  // (ex.: a lição que acabou de ser concluída, via `?concluida=`), o nó
  // SEGUINTE dele no capítulo também pisca — mas só se o aluno já pode segui-lo
  // (`current`/`available`; um `locked` logo depois não anima, não tem o que
  // "desbloqueio visível" mostrar). Com 200ms de atraso em relação ao
  // primeiro, pra ler como uma sequência (concluiu → desbloqueou o próximo),
  // não como dois pops simultâneos.
  const highlightIndex = highlightId ? chapter.nodes.findIndex((n) => n.id === highlightId) : -1;
  const nextNode = highlightIndex >= 0 ? chapter.nodes[highlightIndex + 1] : undefined;
  const secondaryHighlightId =
    nextNode && (nextNode.status === "current" || nextNode.status === "available")
      ? nextNode.id
      : undefined;

  if (locked) {
    return (
      <section className="card-soft overflow-hidden">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1 text-left">
            <p className="font-display text-sm font-bold text-abismo">{chapter.title}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-nevoa">
              <Lock size={12} /> {COPY.trilha.capituloBloqueado}
            </p>
          </div>
          <span className="shrink-0 font-mono text-xs font-bold text-nevoa">
            {chapter.completedCount}/{chapter.totalCount}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="card-soft overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5"
        aria-expanded={aberto}
      >
        <div className="min-w-0 flex-1 text-left">
          <p className="font-display text-sm font-bold text-abismo">{chapter.title}</p>
        </div>
        <span className="shrink-0 font-mono text-xs font-bold text-nevoa">
          {chapter.completedCount}/{chapter.totalCount}
        </span>
        <ChevronDown
          size={18}
          className={cn("shrink-0 text-nevoa transition-transform", aberto && "rotate-180")}
        />
      </button>
      {aberto && (
        <div className="border-t-2 border-gelo px-4 py-3">
          {/* "Rabisco na Margem": linha vertical à esquerda dos nós, dentro do capítulo (docs/25 §8). */}
          <div className="ml-5 space-y-1 border-l-2 border-mar/40 pl-4">
            {chapter.nodes.map((node) => (
              <LessonNode
                key={node.id}
                node={node}
                highlight={node.id === highlightId || node.id === secondaryHighlightId}
                highlightDelayMs={node.id === secondaryHighlightId ? 200 : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

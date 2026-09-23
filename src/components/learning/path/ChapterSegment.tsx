import { useMemo } from "react";
import { ChapterBanner } from "./ChapterBanner";
import { ChapterMilestone } from "./ChapterMilestone";
import { FocusCallout } from "./FocusCallout";
import { MarginDoodle } from "./MarginDoodle";
import { PathConnector } from "./PathConnector";
import { PathNode, rowStyle } from "./PathNode";
import type { FocaExpression } from "@/components/brand/FocaMark";
import { buildChapterRows, highlightPlan, type PathFocus } from "@/lib/learning/path-layout";
import type { ContinueTarget, TrailChapter } from "@/lib/learning/trail";
import type { VozSlot } from "@/lib/voz";

/**
 * Um capítulo do caminho: banner sticky + `<ol>` de linhas geradas por
 * `buildChapterRows` (docs/27 §11.3, docs/28 T-12). O callout do foco fica
 * dentro do `<li>` do nó foco — nó + callout formam o "bloco" que a rolagem
 * de `usePathFocusScroll` mira.
 */
export function ChapterSegment({
  chapter,
  sectionIndex,
  chapterNumber,
  chapterIndex,
  subjectId,
  expanded,
  onToggle,
  focus,
  focusTarget,
  greeting,
  highlightId,
}: {
  chapter: TrailChapter;
  sectionIndex: number;
  /** 1-based dentro da seção (rótulo). */
  chapterNumber: number;
  /** 0-based na matéria inteira (rabiscos). */
  chapterIndex: number;
  subjectId: string;
  expanded: boolean;
  onToggle: () => void;
  focus: PathFocus | null;
  focusTarget: ContinueTarget | null;
  greeting: { slot: VozSlot; expression: FocaExpression };
  highlightId?: string;
}) {
  const focusId = focus?.nodeId ?? null;
  const rows = useMemo(
    () => buildChapterRows(chapter, focusId, subjectId, chapterIndex),
    [chapter, focusId, subjectId, chapterIndex],
  );
  const { primaryId, secondaryId } = highlightPlan(chapter, highlightId);
  const listId = `lista-${chapter.id}`;

  return (
    <section aria-labelledby={`cap-${chapter.id}`} className="relative mt-3">
      <ChapterBanner
        chapter={chapter}
        sectionIndex={sectionIndex}
        chapterNumber={chapterNumber}
        expanded={expanded}
        onToggle={onToggle}
        listId={listId}
      />
      {expanded ? (
        <ol id={listId} className="path-list" aria-label={chapter.title}>
          {rows.map((row) =>
            row.type === "node" ? (
              <li
                key={row.key}
                className="path-row"
                data-path-row={row.node.id}
                style={rowStyle(row.k, row.isFocus)}
              >
                <div className="path-row-node">
                  {row.connector ? <PathConnector {...row.connector} draw={row.node.id === secondaryId} /> : null}
                  {row.doodle ? <MarginDoodle glyph={row.doodle} /> : null}
                  <PathNode
                    node={row.node}
                    k={row.k}
                    isFocus={row.isFocus}
                    highlight={row.node.id === primaryId || row.node.id === secondaryId}
                    highlightDelayMs={row.node.id === secondaryId ? 200 : undefined}
                  />
                </div>
                {row.isFocus && focus && focusTarget ? (
                  <FocusCallout target={focusTarget} focus={focus} pointerK={row.k} greeting={greeting} />
                ) : null}
              </li>
            ) : (
              <li key={row.key} className="path-row" style={rowStyle(0, false)}>
                <div className="path-row-node">
                  {row.connector ? <PathConnector {...row.connector} /> : null}
                  <ChapterMilestone m={row.milestone} />
                </div>
              </li>
            ),
          )}
        </ol>
      ) : null}
    </section>
  );
}

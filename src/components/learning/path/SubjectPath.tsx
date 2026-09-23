import { Fragment, useState } from "react";
import { ChapterSegment } from "./ChapterSegment";
import { JumpToFocusButton } from "./JumpToFocusButton";
import { SubjectPathEnd } from "./SubjectPathEnd";
import { SectionHeader } from "@/components/learning/SectionHeader";
import type { FocaExpression } from "@/components/brand/FocaMark";
import { usePathFocusScroll } from "@/hooks/usePathFocusScroll";
import { chapterDefaultExpanded, type PathFocus } from "@/lib/learning/path-layout";
import type { ContinueTarget, TrailChapter, TrailSubject } from "@/lib/learning/trail";
import type { VozSlot } from "@/lib/voz";

function findChapterOfNode(subject: TrailSubject, nodeId: string): TrailChapter | undefined {
  for (const section of subject.sections) {
    for (const chapter of section.chapters) {
      if (chapter.nodes.some((n) => n.id === nodeId)) return chapter;
    }
  }
  return undefined;
}

/**
 * Corpo da trilha visual de UMA matéria (docs/27 §11.3, docs/28 T-14) —
 * substitui a lista de acordeões por seções → capítulos → caminho. Só os
 * toques do usuário (expandir/recolher) ficam em estado; o padrão de aberto
 * é sempre derivado (RF-8), então trocar de foco (ex.: concluir uma lição)
 * não precisa de sincronização por efeito.
 */
export function SubjectPath({
  subject,
  focus,
  focusTarget,
  greeting,
  highlightId,
}: {
  subject: TrailSubject;
  focus: PathFocus | null;
  focusTarget: ContinueTarget | null;
  greeting: { slot: VozSlot; expression: FocaExpression };
  highlightId?: string;
}) {
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isExpanded = (c: TrailChapter) =>
    toggled[c.id] ?? chapterDefaultExpanded(c, focus?.nodeId ?? null, highlightId);

  const focusChapter = focus ? findChapterOfNode(subject, focus.nodeId) : undefined;
  const focusRendered = focusChapter ? isExpanded(focusChapter) : false;
  const { focusOffscreen, focusAbove, scrollToFocus } = usePathFocusScroll({
    subjectId: subject.id,
    focusId: focus?.nodeId ?? null,
    highlightId,
    focusRendered,
  });

  function jump() {
    if (focusChapter && !focusRendered) {
      setToggled((t) => ({ ...t, [focusChapter.id]: true }));
      requestAnimationFrame(() => requestAnimationFrame(scrollToFocus)); // espera o <li> existir
      return;
    }
    scrollToFocus();
  }

  let chapterIndex = 0;
  return (
    <div className="path-margin">
      {subject.sections.map((section) => (
        <Fragment key={section.id}>
          <div className="mt-6 first:mt-2">
            <SectionHeader section={section} />
          </div>
          {section.chapters.map((chapter, i) => (
            <ChapterSegment
              key={chapter.id}
              chapter={chapter}
              sectionIndex={section.index}
              chapterNumber={i + 1}
              chapterIndex={chapterIndex++}
              subjectId={subject.id}
              expanded={isExpanded(chapter)}
              onToggle={() => setToggled((t) => ({ ...t, [chapter.id]: !isExpanded(chapter) }))}
              focus={focus}
              focusTarget={focusTarget}
              greeting={greeting}
              highlightId={highlightId}
            />
          ))}
        </Fragment>
      ))}
      {focus ? null : <SubjectPathEnd subjectName={subject.name} greeting={greeting} />}
      {focus && focusOffscreen ? <JumpToFocusButton above={focusAbove} onJump={jump} /> : null}
    </div>
  );
}

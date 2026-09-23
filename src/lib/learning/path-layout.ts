import type {
  ContinueTarget,
  TrailChapter,
  TrailModel,
  TrailNode,
  TrailSection,
  TrailSubject,
} from "./trail";

/**
 * Geometria e foco da trilha visual (docs/27 §11.2). Tudo puro: nada de DOM,
 * nada de store — os componentes de `components/learning/path/` só renderizam
 * o que sai daqui.
 */

/** Deslocamento X em múltiplos da amplitude, reiniciando a cada capítulo (RF-1). */
export const PATH_PATTERN = [0, -0.5, -1, -0.5, 0, 0.5, 1, 0.5] as const;
/** Amplitude em % da largura do <ol> (cqi). Igual ao `--amp: 16cqi` de styles.css. */
export const PATH_AMP_CQI = 16;
/** Altura de cada linha do caminho. Igual ao `.path-row-node { height: 96px }`. */
export const ROW_HEIGHT_PX = 96;

export function pathK(index: number): number {
  const i = ((Math.trunc(index) % PATH_PATTERN.length) + PATH_PATTERN.length) % PATH_PATTERN.length;
  return PATH_PATTERN[i];
}

/** Lado da legenda: oposto ao deslocamento; centro fica à direita. */
export function captionSide(k: number): "left" | "right" {
  return k > 0 ? "left" : "right";
}

function xOf(k: number): number {
  return 50 + PATH_AMP_CQI * k;
}

/** `d` do SVG do conector (viewBox 0 0 100 96, preserveAspectRatio none). */
export function connectorPathD(fromK: number, toK: number): string {
  const a = xOf(fromK);
  const b = xOf(toK);
  return `M ${a} 0 C ${a} 48, ${b} 48, ${b} 96`;
}

export interface PathFocus {
  nodeId: string;
  /** "global" = é o `currentLessonId` da recomendação; "subject" = próximo desta matéria. */
  scope: "global" | "subject";
}

function* nodesOf(
  subject: TrailSubject,
): Generator<{ node: TrailNode; chapter: TrailChapter; section: TrailSection }> {
  for (const section of subject.sections) {
    for (const chapter of section.chapters) {
      for (const node of chapter.nodes) yield { node, chapter, section };
    }
  }
}

/** RF-2 — ver docs/27 §11.2 para a ordem das regras. */
export function pathFocus(model: TrailModel, subjectId: string): PathFocus | null {
  const subject = model.subjects.find((s) => s.id === subjectId);
  if (!subject) return null;
  const current = model.currentLessonId;
  if (current) {
    for (const { node } of nodesOf(subject)) {
      if (node.id === current) return { nodeId: current, scope: "global" };
    }
  }
  for (const { node } of nodesOf(subject)) {
    if (node.kind !== "revisao" && (node.status === "in-progress" || node.status === "available")) {
      return { nodeId: node.id, scope: "subject" };
    }
  }
  for (const { node } of nodesOf(subject)) {
    if (node.kind === "revisao" && node.status === "available") return { nodeId: node.id, scope: "subject" };
  }
  return null;
}

/** Alvo do callout: o `continueTarget` global, ou um alvo montado do próprio nó (foco "subject"). */
export function resolveFocusTarget(
  model: TrailModel,
  subject: TrailSubject,
  focus: PathFocus | null,
): ContinueTarget | null {
  if (!focus) return null;
  if (focus.scope === "global" && model.continueTarget?.lessonId === focus.nodeId) {
    return model.continueTarget;
  }
  for (const { node, chapter, section } of nodesOf(subject)) {
    if (node.id !== focus.nodeId) continue;
    return {
      lessonId: node.id,
      source: node.source,
      title: node.title,
      chapterTitle: chapter.title,
      sectionTitle: section.title,
      subjectId: subject.id,
      href: node.href,
      reason: "legacy-next",
      explanation: "",
      firstTime: false,
    };
  }
  return null;
}

/** RF-8. */
export function chapterDefaultExpanded(
  chapter: TrailChapter,
  focusId: string | null,
  highlightId?: string,
): boolean {
  if (chapter.status === "locked") return false;
  if (chapter.status === "in-progress") return true;
  return chapter.nodes.some((n) => n.id === focusId || (highlightId !== undefined && n.id === highlightId));
}

export interface ChapterMilestoneData {
  done: boolean;
  completed: number;
  total: number;
  stars: number;
  maxStars: number;
}

/** RF-6 — revisão não conta (docs/25 §7.5). */
export function chapterMilestone(chapter: TrailChapter): ChapterMilestoneData {
  const core = chapter.nodes.filter((n) => n.kind !== "revisao");
  const stars = core.reduce((sum, n) => sum + (n.status === "completed" ? (n.stars ?? 0) : 0), 0);
  return {
    done: chapter.status === "completed",
    completed: chapter.completedCount,
    total: chapter.totalCount,
    stars,
    maxStars: core.length * 3,
  };
}

export const RABISCOS: Record<string, readonly string[]> = {
  mat: ["%", "x²", "π", "÷"],
  por: ["à", "“ ”", "ç", "?!"],
  red: ["¶", "§", "C5", "…"],
  bio: ["DNA", "ATP", "O₂", "2n"],
  default: ["*", "~", "✓"],
};

/** Um rabisco a cada 8 linhas, na linha de índice 4 do ciclo (k = 0, margem esquerda livre). */
export function doodleFor(subjectId: string, chapterIndex: number, rowIndex: number): string | null {
  if (rowIndex % PATH_PATTERN.length !== 4) return null;
  const glifos = RABISCOS[subjectId] ?? RABISCOS.default;
  return glifos[(chapterIndex + Math.floor(rowIndex / PATH_PATTERN.length)) % glifos.length];
}

/** RF-14 — mesma regra que `ChapterCard` já usava: o nó destacado e o seguinte, se liberado. */
export function highlightPlan(
  chapter: TrailChapter,
  highlightId?: string,
): { primaryId?: string; secondaryId?: string } {
  if (!highlightId) return {};
  const i = chapter.nodes.findIndex((n) => n.id === highlightId);
  if (i < 0) return {};
  const next = chapter.nodes[i + 1];
  const secondaryId = next && (next.status === "current" || next.status === "available") ? next.id : undefined;
  return { primaryId: highlightId, secondaryId };
}

export interface PathConnectorData {
  fromK: number;
  toK: number;
  traced: boolean;
}

export type PathRow =
  | {
      type: "node";
      key: string;
      node: TrailNode;
      index: number;
      k: number;
      isFocus: boolean;
      connector: PathConnectorData | null;
      doodle: string | null;
    }
  | {
      type: "milestone";
      key: string;
      k: 0;
      connector: PathConnectorData | null;
      milestone: ChapterMilestoneData;
    };

export function buildChapterRows(
  chapter: TrailChapter,
  focusId: string | null,
  subjectId: string,
  chapterIndex: number,
): PathRow[] {
  const rows: PathRow[] = [];
  chapter.nodes.forEach((node, index) => {
    const k = pathK(index);
    const prev = index > 0 ? chapter.nodes[index - 1] : undefined;
    const prevIsFocus = prev !== undefined && prev.id === focusId;
    rows.push({
      type: "node",
      key: node.id,
      node,
      index,
      k,
      isFocus: node.id === focusId,
      connector:
        prev && !prevIsFocus ? { fromK: pathK(index - 1), toK: k, traced: prev.status === "completed" } : null,
      doodle: doodleFor(subjectId, chapterIndex, index),
    });
  });
  const last = chapter.nodes[chapter.nodes.length - 1];
  const lastIsFocus = last !== undefined && last.id === focusId;
  rows.push({
    type: "milestone",
    key: `${chapter.id}::carimbo`,
    k: 0,
    connector:
      last && !lastIsFocus
        ? { fromK: pathK(chapter.nodes.length - 1), toK: 0, traced: last.status === "completed" }
        : null,
    milestone: chapterMilestone(chapter),
  });
  return rows;
}

/* ---------------------------------------------------- rolagem (usado por usePathFocusScroll) */

/** RF-9: rola só uma vez por chave; sem destaque, respeita posição restaurada pelo router. */
export function shouldAutoScroll(p: {
  scrollY: number;
  hasHighlight: boolean;
  doneKey: string | null;
  key: string;
}): boolean {
  if (p.doneKey === p.key) return false;
  if (!p.hasHighlight && p.scrollY > 4) return false;
  return true;
}

/** Bloco inteiro visível entre o topo fixo (chips + banner) e a bottom nav. */
export function isComfortablyVisible(
  rect: { top: number; bottom: number },
  viewport: { height: number; topInset: number; bottomInset: number },
): boolean {
  return rect.top >= viewport.topInset && rect.bottom <= viewport.height - viewport.bottomInset;
}

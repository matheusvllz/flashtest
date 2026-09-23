import { memo, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Check, Lock, PenLine, RotateCcw, Star } from "lucide-react";
import { COPY } from "@/lib/copy";
import { captionSide } from "@/lib/learning/path-layout";
import type { TrailNode } from "@/lib/learning/trail";
import { cn } from "@/lib/utils";

const KIND_ICON = { aula: BookOpen, pratica: PenLine, revisao: RotateCcw } as const;

/** Mesmo texto de estado do LessonNode (contrato dos E2E: "Disponível", "Bloqueada", "Continuar daqui"…). */
export function estadoLabel(node: TrailNode): string {
  if (node.status === "locked") return COPY.trilha.estados.locked;
  if (node.status === "completed") {
    return node.reviewDue ? COPY.trilha.estados["completed-review"] : COPY.trilha.estados.completed;
  }
  if (node.status === "in-progress") return COPY.trilha.estados["in-progress"];
  if (node.status === "current") return COPY.trilha.estados.current;
  return COPY.trilha.estados.available;
}

/** Estilo da linha do caminho: --k (deslocamento), --k-abs e --node-half (para a largura da legenda). */
export function rowStyle(k: number, isFocus: boolean): CSSProperties {
  return { "--k": k, "--k-abs": Math.abs(k), "--node-half": isFocus ? "38px" : "32px" } as CSSProperties;
}

interface PathNodeProps {
  node: TrailNode;
  k: number;
  isFocus: boolean;
  highlight?: boolean;
  highlightDelayMs?: number;
}

/**
 * Nó circular da trilha visual (docs/27 §6.4, docs/28 T-07) — versão em
 * caminho do `LessonNode` (que continua existindo para o rollback visual).
 * Estado nunca depende só de cor: ícone + legenda textual + `aria-label` +
 * borda (sólida/tracejada) mudam juntos (docs/27 §8).
 */
function PathNodeImpl({ node, k, isFocus, highlight = false, highlightDelayMs }: PathNodeProps) {
  const estado = estadoLabel(node);
  const locked = node.status === "locked";
  const Icon = locked
    ? Lock
    : node.status === "completed"
      ? node.reviewDue
        ? RotateCcw
        : Check
      : KIND_ICON[node.kind];
  const side = captionSide(k);
  const ariaLabel = `${node.title} — ${estado}`;

  const circle = (
    <span
      className={cn("path-node", highlight && "anim-pop-in")}
      style={highlight && highlightDelayMs ? { animationDelay: `${highlightDelayMs}ms` } : undefined}
      aria-hidden="true"
    >
      {isFocus && <span className="path-halo anim-halo" />}
      <Icon size={isFocus ? 30 : 26} strokeWidth={2.4} />
    </span>
  );

  const caption = (
    <span className="path-caption" data-side={side}>
      {!isFocus && (
        <span
          className={cn(
            "block font-display text-sm font-bold leading-tight line-clamp-2",
            locked ? "text-nevoa" : "text-abismo",
          )}
        >
          {node.title}
        </span>
      )}
      <span className={cn("mt-0.5 block text-xs font-semibold", isFocus ? "text-mar-fundo" : "text-nevoa")}>
        {estado}
      </span>
      {node.status === "completed" && node.stars !== undefined && (
        <span className={cn("mt-1 flex gap-0.5", side === "left" && "justify-end")} aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              size={12}
              className={n <= (node.stars ?? 0) ? "fill-recompensa text-recompensa" : "text-gelo"}
            />
          ))}
        </span>
      )}
    </span>
  );

  const common = {
    className: "path-node-anchor",
    "data-path-node": node.id,
    "data-status": node.status,
    "data-focus": isFocus ? "true" : "false",
    "data-kind": node.kind,
    "aria-label": ariaLabel,
  } as const;

  if (locked) {
    return (
      <div {...common} aria-disabled="true">
        {circle}
        {caption}
      </div>
    );
  }
  return (
    <Link {...node.href} {...common}>
      {circle}
      {caption}
    </Link>
  );
}

/** memo com comparador: buildTrail recria objetos a cada mudança do store (docs/27 §7). */
export const PathNode = memo(
  PathNodeImpl,
  (a, b) =>
    a.k === b.k &&
    a.isFocus === b.isFocus &&
    a.highlight === b.highlight &&
    a.highlightDelayMs === b.highlightDelayMs &&
    a.node.id === b.node.id &&
    a.node.status === b.node.status &&
    a.node.stars === b.node.stars &&
    a.node.reviewDue === b.node.reviewDue &&
    a.node.title === b.node.title,
);

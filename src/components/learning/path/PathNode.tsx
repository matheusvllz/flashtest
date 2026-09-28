import { memo, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Check, Flame, LifeBuoy, Lock, PenLine, RotateCcw, Stamp, Star } from "lucide-react";
import { COPY } from "@/lib/copy";
import { captionSide } from "@/lib/learning/path-layout";
import { cn } from "@/lib/utils";

/**
 * Kind/status/href genéricos (docs/30 §14.1, Fase 12 F12.4) — `TrailNode`
 * (matéria única) é um subconjunto estrutural: seus `kind`/`status`/`href`
 * são uniões mais estreitas, então todo `TrailNode` já satisfaz
 * `PathNodeData` sem mudança nos chamadores existentes (`SubjectPath` etc.).
 * `JourneyPath` (caminho misturado da jornada) é quem usa os kinds/hrefs
 * novos.
 */
export type PathNodeKind = "aula" | "pratica" | "revisao" | "desafio" | "checkpoint" | "reforco" | "legado";
export type PathNodeStatus = "completed" | "in-progress" | "current" | "available" | "locked";
export type PathNodeHref =
  | { to: "/learn/$lessonId"; params: { lessonId: string } }
  | { to: "/redacao/$licaoId"; params: { licaoId: string } }
  | { to: "/atividade/$activityId"; params: { activityId: string } };

export interface PathNodeData {
  id: string;
  kind: PathNodeKind;
  status: PathNodeStatus;
  title: string;
  stars?: 1 | 2 | 3;
  reviewDue?: boolean;
  href: PathNodeHref;
}

const KIND_ICON: Record<PathNodeKind, typeof BookOpen> = {
  aula: BookOpen,
  pratica: PenLine,
  revisao: RotateCcw,
  desafio: Flame,
  // Reaproveita o motivo visual do carimbo de capítulo (docs/30 §14.1: "checkpoint vira um marco, reaproveita o carimbo ChapterMilestone") — mesmo ícone, sem forçar o formato "x/y" do carimbo de capítulo (que é de outra unidade de dado).
  checkpoint: Stamp,
  reforco: LifeBuoy,
  legado: PenLine,
};

/** Mesmo texto de estado do LessonNode (contrato dos E2E: "Disponível", "Bloqueada", "Continuar daqui"…). */
export function estadoLabel(node: Pick<PathNodeData, "status" | "reviewDue">): string {
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
  node: PathNodeData;
  k: number;
  isFocus: boolean;
  highlight?: boolean;
  highlightDelayMs?: number;
  /** Rótulo de matéria em TEXTO (docs/30 §14.1 — jornada mistura matérias, e a paleta só tem um accent; nunca cor). */
  subjectLabel?: string;
  /** Comprometida além da primeira, ou "a seguir" (docs/30 §14.1) — não é `locked` (o ícone continua o do tipo, não cadeado), só o traço fica mais leve e não é `Link`. */
  planned?: boolean;
  /** Sobrescreve o texto de estado computado (ex.: "Atual"/"A seguir" da jornada, em vez de "Continuar daqui"/"Disponível" — docs/31 F12.4, critério de acessibilidade "Atual"/"Concluída"/"A seguir"). */
  stateLabelOverride?: string;
  /** `false` força renderização não-interativa mesmo com status `completed` (docs/30 §14.1) — histórico da jornada é só registro, não tem sessão pra retomar (os itens já foram descartados). Padrão `true` (comportamento de sempre). */
  interactive?: boolean;
  /** Disparado ao clicar num nó navegável, ANTES da navegação (docs/32 F15.3) — `JourneyPath` usa isto pro nó "atual" marcar `setActiveActivity` antes de ir pra `/learn`/`/redacao`, senão `syncJourneyWithCompletions` nunca sabe qual comprometida virou a lição concluída. */
  onClick?: () => void;
}

/**
 * Nó circular da trilha visual (docs/27 §6.4, docs/28 T-07) — versão em
 * caminho do `LessonNode` (que continua existindo para o rollback visual).
 * Estado nunca depende só de cor: ícone + legenda textual + `aria-label` +
 * borda (sólida/tracejada) mudam juntos (docs/27 §8). Reaproveitado por
 * `JourneyPath` (docs/30 §14.1, Fase 12) com `k=0` (linha reta, sem
 * zigue-zague — a jornada mistura matérias, o zigue-zague é só da trilha por
 * matéria) e os props `subjectLabel`/`planned`/`stateLabelOverride` novos.
 */
function PathNodeImpl({
  node,
  k,
  isFocus,
  highlight = false,
  highlightDelayMs,
  subjectLabel,
  planned = false,
  stateLabelOverride,
  interactive = true,
  onClick,
}: PathNodeProps) {
  const estado = stateLabelOverride ?? estadoLabel(node);
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
      {subjectLabel && (
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-nevoa">{subjectLabel}</span>
      )}
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
    "data-planned": planned ? "true" : "false",
    "aria-label": ariaLabel,
  } as const;

  if (locked || planned || !interactive) {
    return (
      <div {...common} aria-disabled="true">
        {circle}
        {caption}
      </div>
    );
  }
  return (
    <Link {...node.href} {...common} onClick={onClick}>
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
    a.node.title === b.node.title &&
    a.subjectLabel === b.subjectLabel &&
    a.planned === b.planned &&
    a.stateLabelOverride === b.stateLabelOverride &&
    a.interactive === b.interactive &&
    a.onClick === b.onClick,
);

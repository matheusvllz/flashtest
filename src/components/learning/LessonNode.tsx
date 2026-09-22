import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Check, Lock, PenLine, RotateCcw, Star } from "lucide-react";
import { COPY } from "@/lib/copy";
import type { TrailNode } from "@/lib/learning/trail";
import { cn } from "@/lib/utils";

/** Ícone por `TrailNodeKind` (docs/25 §6.4). */
const KIND_ICON = { aula: BookOpen, pratica: PenLine, revisao: RotateCcw } as const;

function estadoLabel(node: TrailNode): string {
  if (node.status === "locked") return COPY.trilha.estados.locked;
  if (node.status === "completed") {
    return node.reviewDue ? COPY.trilha.estados["completed-review"] : COPY.trilha.estados.completed;
  }
  if (node.status === "in-progress") return COPY.trilha.estados["in-progress"];
  if (node.status === "current") return COPY.trilha.estados.current;
  return COPY.trilha.estados.available;
}

/**
 * Nó de lição na trilha (docs/25 §12.1, §18 T-16) — a tabela de 5 estados é
 * literal: marcador + texto de estado + interação mudam juntos, e o rótulo
 * textual (não só ícone/cor) é quem carrega o significado pro leitor de tela
 * (mesmo princípio de `nodeStateLabel` na versão anterior, docs/20 §11).
 * Bloqueado é `div aria-disabled`, nunca um `Link` — não dá pra "clicar sem
 * poder entrar".
 */
export const LessonNode = memo(function LessonNode({
  node,
  highlight = false,
  highlightDelayMs,
}: {
  node: TrailNode;
  highlight?: boolean;
  /**
   * Atraso (ms) do `anim-pop-in` do marcador — usado pelo nó que desbloqueou
   * logo APÓS o destacado, pra deixar o desbloqueio visível em sequência
   * (docs/25 §12.1/§18 T-24). Sem efeito se `highlight` for `false`; e sem
   * necessidade de guard de `prefers-reduced-motion` aqui — o bloco global em
   * `styles.css` já zera `animation-duration`, então um atraso sozinho não
   * produz movimento perceptível.
   */
  highlightDelayMs?: number;
}) {
  const estado = estadoLabel(node);
  const KindIcon = KIND_ICON[node.kind];
  const bloqueada = node.status === "locked";

  const marker = (
    <span
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-full",
        highlight && "anim-pop-in",
        node.status === "completed" && "bg-mar text-white",
        node.status === "in-progress" && "border-2 border-mar bg-mar/12 text-mar-fundo",
        node.status === "current" && "border-[3px] border-mar bg-cards text-mar-fundo anim-breathe",
        node.status === "available" && "border-2 border-abismo bg-cards text-abismo",
        node.status === "locked" && "bg-gelo text-nevoa",
      )}
      style={highlight && highlightDelayMs ? { animationDelay: `${highlightDelayMs}ms` } : undefined}
      aria-hidden
    >
      {node.status === "locked" ? (
        <Lock size={16} />
      ) : node.status === "completed" ? (
        node.reviewDue ? (
          <RotateCcw size={16} />
        ) : (
          <Check size={16} />
        )
      ) : (
        <KindIcon size={16} />
      )}
    </span>
  );

  const conteudo = (
    <>
      {marker}
      <span className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            "block font-display text-sm font-bold",
            bloqueada ? "text-nevoa" : "text-abismo",
          )}
        >
          {node.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-nevoa">
          <span>
            {COPY.trilha.kinds[node.kind]} · {COPY.trilha.questoes(node.questionCount)} · {estado}
          </span>
          {node.status === "completed" && node.stars !== undefined && (
            <span className="inline-flex gap-0.5" aria-hidden>
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  size={14}
                  className={n <= (node.stars ?? 0) ? "fill-recompensa text-recompensa" : "text-gelo"}
                />
              ))}
            </span>
          )}
        </span>
      </span>
    </>
  );

  const className = cn(
    "flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
    bloqueada ? "cursor-not-allowed" : "hover:bg-cards active:scale-[0.99]",
  );

  if (bloqueada) {
    return (
      <div className={className} aria-disabled="true" aria-label={`${node.title} — ${estado}`}>
        {conteudo}
      </div>
    );
  }

  return (
    <Link {...node.href} className={className} aria-label={`${node.title} — ${estado}`}>
      {conteudo}
    </Link>
  );
});

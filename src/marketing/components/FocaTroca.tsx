import type { CSSProperties } from "react";
import { focaExpressionSrc, type FocaExpression } from "@/lib/brand/foca-expressions";

/**
 * A Foca que muda de expressão num momento da página (docs/44 §6): as duas artes empilhadas; a troca é o "piscar"
 * da marca (achata no eixo Y, a arte troca no fundo do movimento, volta com a mola), nunca crossfade.
 * Quem dispara: CSS (`.lp-troca--revelar` dentro de um bloco que ganha `.is-in`) ou a timeline do GSAP
 * (`data-troca`, motion/scroll.ts). Sem movimento (sem JS ou reduzido) aparece só a expressão final, parada.
 * Sempre decorativa: o texto ao lado já diz o que ela diz.
 */
export function FocaTroca({
  de,
  para,
  size,
  className,
  gatilho = "timeline",
}: {
  de: FocaExpression;
  para: FocaExpression;
  size: number;
  className?: string;
  /** "revelar": troca por CSS quando o ancestral ganha `.is-in`. "timeline": o GSAP controla. */
  gatilho?: "revelar" | "timeline";
}) {
  const img = (e: FocaExpression, cls: string) => (
    <img src={focaExpressionSrc(e, size).webp} alt="" width={size} height={size} decoding="async" loading="lazy" draggable={false} className={cls} />
  );
  return (
    <span
      aria-hidden="true"
      data-troca
      className={["lp-troca", gatilho === "revelar" ? "lp-troca--revelar" : "", className ?? ""].join(" ").trim()}
      style={{ ["--s" as string]: `${size}px` } as CSSProperties}
    >
      {img(de, "lp-troca__de")}
      {img(para, "lp-troca__para")}
    </span>
  );
}

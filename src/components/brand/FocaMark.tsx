/**
 * A cabeça da Foca: logo e mascote da marca (docs/09 §2, docs/17 §3, docs/18 §8.2; sistema oficial em docs/44 §6).
 * Único ponto do app que renderiza a Foca. Sempre quadrada, nunca esticada, nunca rotacionada.
 *
 * - sem `expression` → a LOGO OFICIAL (Foca de frente colorida): marca, cabeçalho, entrada.
 * - com `expression` → uma das 8 expressões oficiais (`src/lib/brand/foca-expressions.ts`), escolhida pelo
 *   significado do momento. Valor desconhecido cai em `neutra` (nunca quebra).
 * - `line-light` / `line-dark` → contorno para marca d'água (≥ 120 px), um por tema (docs/36 §G.8).
 *
 * Arte servida em WebP com PNG de reserva (`<picture>`). Se a imagem falhar, a `<img>` fica `visibility: hidden`
 * e mantém a caixa: o layout não pula e não aparece ícone quebrado (docs/36 T-08.6).
 *
 * Troca de expressão com a Foca na tela: "piscar" (achata no eixo Y, troca a arte no fundo do piscar, volta com
 * `--ease-bounce`). Sem movimento reduzido; com ele, a troca é direta. Nunca crossfade entre duas cabeças.
 */
import { useEffect, useRef, useState } from "react";
import {
  focaExpression,
  focaExpressionSrc,
  focaLogoSrc,
  type FocaExpression,
} from "@/lib/brand/foca-expressions";

export type { FocaExpression } from "@/lib/brand/foca-expressions";
export type FocaVariant = "color" | "line-light" | "line-dark";

const LINHA: Record<"line-light" | "line-dark", string> = {
  "line-light": "/branding/foca/foca-line-light-720.png",
  "line-dark": "/branding/foca/foca-line-dark-720.png",
};

/** Movimento de entrada — nunca rotação (docs/09 §2). "none" é o default fora de transições. */
export type FocaMotion = "pop" | "float" | "breathe" | "none";

const MOTION_CLASS: Record<FocaMotion, string> = {
  pop: "anim-pop-in",
  float: "anim-float-in",
  breathe: "anim-breathe",
  none: "",
};

/** Metade do piscar (ms): a arte troca no fundo do movimento. */
const MEIO_PISCAR = 90;

function querMenosMovimento() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Guarda a expressão exibida e anima a troca ("piscar") quando a pedida muda com o componente montado. */
function useExpressaoComPiscar(pedida: FocaExpression | undefined) {
  const [exibida, setExibida] = useState(pedida);
  const [piscando, setPiscando] = useState(false);
  useEffect(() => {
    if (pedida === exibida) return;
    if (querMenosMovimento()) {
      setExibida(pedida);
      return;
    }
    setPiscando(true);
    const t1 = setTimeout(() => setExibida(pedida), MEIO_PISCAR);
    const t2 = setTimeout(() => setPiscando(false), MEIO_PISCAR * 2 + 40);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // `exibida` fora das dependências de propósito: o efeito reage só à expressão PEDIDA.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedida]);
  return { exibida, piscando };
}

export function FocaMark({
  size = 32,
  variant = "color",
  expression,
  motion = "none",
  decorative = false,
  className,
}: {
  size?: number;
  variant?: FocaVariant;
  /** Só tem efeito com `variant="color"`. Sem ela, a logo oficial. */
  expression?: FocaExpression;
  motion?: FocaMotion;
  /** true = puramente visual (ao lado de texto que já diz o que ela diz): sai da árvore de acessibilidade. */
  decorative?: boolean;
  className?: string;
}) {
  const { exibida, piscando } = useExpressaoComPiscar(expression === undefined ? undefined : focaExpression(expression));
  const fonte =
    variant === "color"
      ? exibida === undefined
        ? focaLogoSrc(size)
        : focaExpressionSrc(exibida, size)
      : { webp: null, png: LINHA[variant] };
  const src = fonte.png;
  const motionClass = MOTION_CLASS[motion];
  // Guarda QUAL src falhou (não um booleano): se a variante/expressão muda, tenta de novo.
  const [srcQueFalhou, setSrcQueFalhou] = useState<string | null>(null);
  const falhou = srcQueFalhou === src;
  const imgRef = useRef<HTMLImageElement>(null);
  // O `error` pode disparar ANTES da hidratação (SSR): o React não vê esse evento. Confere depois de montar.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setSrcQueFalhou(src);
  }, [src]);

  const img = (
    <img
      src={src}
      ref={imgRef}
      onError={() => setSrcQueFalhou(src)}
      alt={decorative ? "" : "Foca"}
      aria-hidden={decorative ? true : undefined}
      width={size}
      height={size}
      draggable={false}
      decoding="async"
      className={[className, motionClass, piscando ? "foca-piscar" : ""].filter(Boolean).join(" ") || undefined}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
        visibility: falhou ? "hidden" : undefined,
      }}
    />
  );
  if (!fonte.webp) return img;
  return (
    <picture style={{ display: "contents" }}>
      <source srcSet={fonte.webp} type="image/webp" />
      {img}
    </picture>
  );
}

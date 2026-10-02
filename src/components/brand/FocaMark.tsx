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
 *
 * `forma="corpo"` (spec 50 §5.8.2): a Foca de corpo inteiro, vetorial, com `pose` e `roupa`. O módulo do corpo
 * é carregado sob demanda (`import()`, chunk próprio), com reserva do mesmo tamanho enquanto chega (o layout
 * não pula). A cabeça (padrão) não muda e nunca recebe roupa. No corpo, `desapontada`, `cobrando` e
 * `entediada` viram `neutra` (o corpo não tem essas expressões).
 */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  focaExpression,
  focaExpressionSrc,
  focaLogoSrc,
  type FocaExpression,
} from "@/lib/brand/foca-expressions";
import { focaCorpoExpressao, type FocaPose, type FocaRoupaId } from "@/lib/brand/foca-corpo";

export type { FocaExpression } from "@/lib/brand/foca-expressions";
export type { FocaPose, FocaRoupaId } from "@/lib/brand/foca-corpo";
export type FocaVariant = "color" | "line-light" | "line-dark";
export type FocaForma = "cabeca" | "corpo";

/** O corpo só baixa quando alguém pede `forma="corpo"` (nunca na landing nem no caminho da questão). */
const FocaCorpoSobDemanda = lazy(() =>
  import("./FocaCorpo").then((m) => ({ default: m.FocaCorpo })),
);

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
  return (
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
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

export interface FocaMarkProps {
  size?: number;
  /** Só na cabeça. */
  variant?: FocaVariant;
  /** Na cabeça, só tem efeito com `variant="color"`; sem ela, a logo oficial. No corpo, sem ela, `neutra`. */
  expression?: FocaExpression;
  motion?: FocaMotion;
  /** true = puramente visual (ao lado de texto que já diz o que ela diz): sai da árvore de acessibilidade. */
  decorative?: boolean;
  className?: string;
  /** `cabeca` (padrão): a logo e as 8 expressões. `corpo`: a Foca de corpo inteiro (spec 50 §5.8). */
  forma?: FocaForma;
  /** Só no corpo (§5.8.3). */
  pose?: FocaPose;
  /** Só no corpo; a cabeça nunca recebe roupa (§5.8.2). */
  roupa?: FocaRoupaId;
}

export function FocaMark({ forma = "cabeca", pose, roupa, ...props }: FocaMarkProps) {
  if (forma === "corpo") return <FocaMarkCorpo {...props} pose={pose} roupa={roupa} />;
  return <FocaMarkCabeca {...props} />;
}

/** Corpo inteiro: módulo sob demanda, reserva do mesmo tamanho enquanto chega. */
function FocaMarkCorpo({
  size = 32,
  expression,
  motion = "none",
  decorative = false,
  className,
  pose,
  roupa,
}: Omit<FocaMarkProps, "forma" | "variant">) {
  const classe = [className, MOTION_CLASS[motion]].filter(Boolean).join(" ") || undefined;
  const reserva = (
    <span
      className={classe}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Foca"}
      aria-hidden={decorative ? true : undefined}
      style={{ display: "inline-block", width: size, height: size, flexShrink: 0 }}
    />
  );
  return (
    <Suspense fallback={reserva}>
      <FocaCorpoSobDemanda
        size={size}
        expressao={focaCorpoExpressao(expression)}
        pose={pose}
        roupa={roupa}
        decorative={decorative}
        className={classe}
      />
    </Suspense>
  );
}

/** A cabeça: comportamento de sempre (logo, 8 expressões, contorno). */
function FocaMarkCabeca({
  size = 32,
  variant = "color",
  expression,
  motion = "none",
  decorative = false,
  className,
}: Omit<FocaMarkProps, "forma" | "pose" | "roupa">) {
  const { exibida, piscando } = useExpressaoComPiscar(
    expression === undefined ? undefined : focaExpression(expression),
  );
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
      className={
        [className, motionClass, piscando ? "foca-piscar" : ""].filter(Boolean).join(" ") ||
        undefined
      }
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

// Rabiscos de assinatura (docs/40 §12.5): traços de lápis em grafite, desenhados à mão (curvas irregulares
// de propósito), animáveis por stroke-dashoffset (pathLength normalizado em 1). São marca, não ícones.
import type { ReactNode } from "react";

type StrokeProps = {
  /** "load" desenha ao carregar; "scroll" desenha quando o ancestral (ou o próprio) ganha .is-in. */
  draw?: "load" | "scroll" | "none";
  delay?: string;
  className?: string;
};

function Svg({ viewBox, children, className, label }: { viewBox: string; children: ReactNode; className?: string; label?: string }) {
  return (
    <svg viewBox={viewBox} className={className} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label} focusable="false" overflow="visible">
      {children}
    </svg>
  );
}

const style = (delay?: string) => (delay ? ({ ["--lp-draw-delay" as string]: delay } as React.CSSProperties) : undefined);

/** Seta curva de lápis: da anotação até o ponto de interesse. */
export function PencilArrow({ draw = "load", delay = "0.7s", className }: StrokeProps) {
  return (
    <Svg viewBox="0 0 90 130" className={className}>
      <path className="lp-stroke" data-draw={draw} pathLength={1} style={style(delay)} d="M8 6 C 6 50, 26 100, 74 116" />
      <path className="lp-stroke" data-draw={draw} pathLength={1} style={style(delay)} d="M60 101 L76 117 L56 124" />
    </Svg>
  );
}

/** Check de lápis, irregular. */
export function PencilCheck({ draw = "scroll", delay = "0s", className }: StrokeProps) {
  return (
    <Svg viewBox="0 0 32 28" className={className}>
      <path className="lp-stroke" data-draw={draw} pathLength={1} style={style(delay)} d="M3 15.5 C 7.5 17, 10.5 20.5, 12.5 25 C 16.5 15.5, 22 8, 29 3.5" />
    </Svg>
  );
}

/** Meio check: começou e não terminou (o "metade" da terça). */
export function PencilHalfCheck({ draw = "scroll", delay = "0s", className }: StrokeProps) {
  return (
    <Svg viewBox="0 0 32 28" className={className}>
      <path className="lp-stroke" data-draw={draw} pathLength={1} style={style(delay)} d="M3 15.5 C 7.5 17, 10.5 20.5, 12.5 25 C 14 21.5, 16 18, 18.5 15" />
    </Svg>
  );
}

/** Risco de lápis sobre um texto/ícone. */
export function PencilStrike({ draw = "scroll", delay = "0s", className }: StrokeProps) {
  return (
    <Svg viewBox="0 0 64 12" className={className}>
      <path className="lp-stroke" data-draw={draw} pathLength={1} style={style(delay)} d="M2 7.5 C 16 3.5, 34 9.5, 62 4.5" />
    </Svg>
  );
}

/** Marca-texto atrás de uma palavra (M-3). Texto sempre com tinta escura (token on-alert), nos dois temas. */
export function HighlightStroke({ children, delay, gatilho = "load" }: { children: ReactNode; delay?: string; gatilho?: "load" | "reveal" }) {
  return (
    <span className={gatilho === "reveal" ? "lp-hl lp-hl--reveal" : "lp-hl"} style={delay ? ({ ["--lp-hl-delay" as string]: delay } as React.CSSProperties) : undefined}>
      <span className="lp-hl__bg" aria-hidden="true" />
      <span className="lp-hl__txt">{children}</span>
    </span>
  );
}

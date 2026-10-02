/**
 * Ícone e logotipo das Pérolas, a moeda da loja (spec 50 §5.3.6; T-50.4.5). SVG inline, sem PNG.
 *
 * Desenho: uma pérola com brilho, no traço do sistema rabisco (contorno de grafite `--abismo`, como os ícones
 * do app). Legível em 16, 20, 24, 32 e 48 px: abaixo de 24 px some o brilho secundário e a faísca, que viram
 * ruído nesse tamanho. Cores só por token: `--perola` (corpo, ≥ 3:1 sobre `--neve` e sobre o fundo escuro) e
 * `--perola-brilho`.
 */
import type { CSSProperties } from "react";

export interface IconePerolaProps {
  /** Lado em px. */
  size?: number;
  /** Nome acessível (padrão "Pérolas"). Ignorado com `decorative`. */
  title?: string;
  /** true = ao lado de texto que já diz "Pérolas": sai da árvore de acessibilidade. */
  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function IconePerola({
  size = 20,
  title,
  decorative = false,
  className,
  style,
}: IconePerolaProps) {
  const detalhado = size >= 24;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0, display: "inline-block", verticalAlign: "middle", ...style }}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : (title ?? "Pérolas")}
      focusable="false"
    >
      {decorative ? null : <title>{title ?? "Pérolas"}</title>}
      <circle cx="11.5" cy="12.75" r="8.25" style={{ fill: "var(--perola)" }} />
      {/* Brilho principal: meia-lua em cima à esquerda. */}
      <path
        d="M 6.4 11.6 A 5.4 5.4 0 0 1 10.6 7.3"
        style={{
          fill: "none",
          stroke: "var(--perola-brilho)",
          strokeWidth: 2.1,
          strokeLinecap: "round",
        }}
      />
      {detalhado ? (
        <circle
          cx="14.9"
          cy="16.1"
          r="1.25"
          style={{ fill: "var(--perola-brilho)", fillOpacity: 0.7 }}
        />
      ) : null}
      <circle
        cx="11.5"
        cy="12.75"
        r="8.25"
        style={{ fill: "none", stroke: "var(--abismo)", strokeWidth: 1.6 }}
      />
      {detalhado ? (
        <path
          d="M 20 1.8 L 20.7 3.6 L 22.5 4.3 L 20.7 5 L 20 6.8 L 19.3 5 L 17.5 4.3 L 19.3 3.6 Z"
          style={{ fill: "var(--perola)" }}
        />
      ) : null}
    </svg>
  );
}

/** Logotipo: ícone + "Pérolas" (loja e folha de Pérolas). O texto acompanha a cor de texto do tema. */
export function LogoPerolas({
  size = 24,
  rotulo = "Pérolas",
  className,
}: {
  /** Lado do ícone em px; o texto acompanha (≈ 0,75 do ícone). */
  size?: number;
  rotulo?: string;
  className?: string;
}) {
  return (
    <span
      className={["inline-flex items-center font-display font-bold text-abismo", className]
        .filter(Boolean)
        .join(" ")}
      style={{ gap: Math.round(size * 0.3), fontSize: Math.round(size * 0.75), lineHeight: 1 }}
    >
      <IconePerola size={size} decorative />
      <span>{rotulo}</span>
    </span>
  );
}

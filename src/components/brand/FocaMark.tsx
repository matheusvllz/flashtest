/**
 * A cabeça da Foca — logo e mascote da marca (docs/09-branding.md §2, docs/17 §3,
 * docs/18-plano-reestilizacao-rabisco.md §8.2). Único ponto do app que renderiza
 * a logo. Sempre quadrada, nunca esticada, nunca rotacionada.
 *
 * - `color`      → arte colorida, funciona sobre claro e escuro. Padrão.
 * - `line-light` → contorno branco, só para marca d'água sobre fundo escuro (≥ 120px).
 * - `line-dark`  → contorno preto, só para marca d'água sobre fundo claro (≥ 120px).
 *
 * `expression` só se aplica à variante `color` — as 8 expressões de
 * docs/15-mascote-e-voz.md §5. Enquanto a arte final não chega, todas caem no
 * fallback interino (arte neutra) gerado por `scripts/gerar-logos-foca.ps1`
 * (docs/18 D5) — ver `src/assets/branding/foca/README.md`.
 */
export type FocaVariant = "color" | "line-light" | "line-dark";
export type FocaExpression =
  | "neutra"
  | "cobrando"
  | "orgulhosa"
  | "empolgada"
  | "desapontada"
  | "surpresa"
  | "entediada"
  | "acolhedora";

const SRC: Record<FocaVariant, { small: string; large: string }> = {
  color: {
    small: "/branding/foca/foca-color-96.png",
    large: "/branding/foca/foca-color-320.png",
  },
  "line-light": {
    small: "/branding/foca/foca-line-light-720.png",
    large: "/branding/foca/foca-line-light-720.png",
  },
  "line-dark": {
    small: "/branding/foca/foca-line-dark-720.png",
    large: "/branding/foca/foca-line-dark-720.png",
  },
};

const EXPRESSAO_SRC: Record<FocaExpression, { small: string; large: string }> = Object.fromEntries(
  (
    [
      "neutra",
      "cobrando",
      "orgulhosa",
      "empolgada",
      "desapontada",
      "surpresa",
      "entediada",
      "acolhedora",
    ] as const
  ).map((expr) => [
    expr,
    {
      small: `/branding/foca/expressoes/${expr}-96.png`,
      large: `/branding/foca/expressoes/${expr}-320.png`,
    },
  ]),
) as Record<FocaExpression, { small: string; large: string }>;

/** Movimento de entrada — nunca rotação (docs/09 §2). "none" é o default fora de transições. */
export type FocaMotion = "pop" | "float" | "breathe" | "none";

const MOTION_CLASS: Record<FocaMotion, string> = {
  pop: "anim-pop-in",
  float: "anim-float-in",
  breathe: "anim-breathe",
  none: "",
};

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
  /** Só tem efeito com `variant="color"`. Default "neutra". */
  expression?: FocaExpression;
  motion?: FocaMotion;
  /** true = puramente visual (marca d'água, ícone ao lado de texto): sai da árvore de acessibilidade. */
  decorative?: boolean;
  className?: string;
}) {
  const table = variant === "color" ? EXPRESSAO_SRC[expression ?? "neutra"] : SRC[variant];
  const src = size <= 48 ? table.small : table.large;
  const motionClass = MOTION_CLASS[motion];
  return (
    <img
      src={src}
      alt={decorative ? "" : "Foca"}
      aria-hidden={decorative ? true : undefined}
      width={size}
      height={size}
      draggable={false}
      className={[className, motionClass].filter(Boolean).join(" ") || undefined}
      style={{ width: size, height: size, objectFit: "contain", display: "block", flexShrink: 0 }}
    />
  );
}

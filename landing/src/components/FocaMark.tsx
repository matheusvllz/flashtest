// A cabeça da Foca (docs/40 §15.4): reimplementação mínima do FocaMark do app, sem store nem roteador.
// Nunca esticada nem rotacionada. As 8 expressões ainda não têm arte final, então só há duas poses:
// cor e contorno (o contorno troca de cor com o tema do sistema).
type Props = {
  size?: number;
  /** "color" = cabeça colorida. "line" = contorno que segue o tema (escuro no papel, claro no escuro). */
  variant?: "color" | "line";
  decorative?: boolean;
  className?: string;
  motion?: "pop" | "none";
  eager?: boolean;
};

export function FocaMark({ size = 48, variant = "color", decorative = true, className, motion = "none", eager = false }: Props) {
  const alt = decorative ? "" : "Foca";
  const common = {
    width: size,
    height: size,
    alt,
    decoding: "async" as const,
    loading: eager ? ("eager" as const) : ("lazy" as const),
    draggable: false,
    "aria-hidden": decorative ? (true as const) : undefined,
    className: [motion === "pop" ? "lp-enter-pop" : "", className ?? ""].join(" ").trim() || undefined,
    style: { width: size, height: size, objectFit: "contain" as const },
  };

  if (variant === "line") {
    return (
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet={`/lp/brand/foca-line-light-${size <= 48 ? 96 : 192}.png`} />
        <img src={`/lp/brand/foca-line-dark-${size <= 48 ? 96 : 192}.png`} {...common} />
      </picture>
    );
  }
  const src = size <= 48 ? "/lp/brand/foca-color-96.png" : "/lp/brand/foca-color-240.webp";
  return <img src={src} {...common} />;
}

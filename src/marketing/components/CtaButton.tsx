import { Link } from "@tanstack/react-router";
import { NAV } from "../content/copy";
import { APP_DESTINOS, useContaNoAparelho } from "../lib/app-url";
import type { TrackName } from "../lib/track";

// Uma ação principal em toda a página: "Começar grátis" → /quiz (docs/42 §4, docs/44 §3). Link do roteador:
// a transição para o produto acontece dentro do mesmo app, com prefetch quando o ponteiro chega no botão.
// Quem já tem conta neste aparelho vê "Continuar estudando" → /app (sem redirecionar a landing).
type Props = {
  label: string;
  evento: TrackName;
  cta: string;
  /** compact = 44 px (navbar). block = largura total (mobile). padrão = 52 px do design system. */
  size?: "default" | "compact";
  block?: boolean;
  className?: string;
  id?: string;
};

export function CtaButton({ label, evento, cta, size = "default", block = false, className, id }: Props) {
  const temConta = useContaNoAparelho();
  const cls = [
    "btn-primary whitespace-nowrap",
    size === "compact" ? "!min-h-11 !px-4 !text-[0.9375rem]" : "",
    block ? "w-full" : "",
    className ?? "",
  ]
    .join(" ")
    .trim();
  return (
    <Link
      id={id}
      to={temConta ? APP_DESTINOS.continuar : APP_DESTINOS.comecar}
      preload="intent"
      className={cls}
      data-cta={cta}
      data-track={evento}
    >
      {temConta ? NAV.ctaComConta : label}
    </Link>
  );
}

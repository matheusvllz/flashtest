import { Link } from "@tanstack/react-router";
import { APP_DESTINOS } from "../lib/app-url";
import type { TrackName } from "../lib/track";

// Uma ação principal em toda a página: "Começar grátis" → /quiz (docs/42 §4, docs/44 §3). Link do roteador:
// a transição para o produto acontece dentro do mesmo app, com prefetch quando o ponteiro chega no botão.
// D-20 do 46: começar sempre abre o quiz, mesmo com flags antigas salvas no aparelho.
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
      to={APP_DESTINOS.comecar}
      preload="intent"
      className={cls}
      data-cta={cta}
      data-track={evento}
    >
      {label}
    </Link>
  );
}

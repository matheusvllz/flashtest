import { APP_DESTINOS, appUrl } from "../lib/app-url";
import type { TrackName } from "../lib/track";

// Uma ação principal em toda a página: "Começar agora" -> {APP_URL}/quiz (docs/40 §11, mapa de CTA).
// O texto vem sempre de copy.ts (mesmo rótulo em todo lugar: uma intenção, um rótulo).
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
    <a id={id} href={appUrl(APP_DESTINOS.comecar)} className={cls} data-cta={cta} data-track={evento}>
      {label}
    </a>
  );
}

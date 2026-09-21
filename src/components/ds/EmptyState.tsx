import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { FocaMark } from "@/components/brand/FocaMark";
import { fala } from "@/lib/voz";

/**
 * Estado vazio com a Foca (docs/18 §7.14, §15 §4/§7). Borda tracejada = "ainda
 * não rabiscado" (docs/18 §5) — o mesmo sinal usado em matérias não medidas.
 *
 * A fala é sempre do slot "vazio" (docs/lib/voz.ts) — `text` sobrescreve só
 * quando a tela precisa de uma mensagem mais específica que a genérica.
 */
export function EmptyState({
  text,
  cta,
}: {
  text?: string;
  cta?: { label: string; to: string };
}): ReactNode {
  return (
    <div className="card-soft border-dashed p-6 text-center">
      <FocaMark expression="entediada" size={72} decorative className="mx-auto" />
      <p className="mt-3 text-sm leading-relaxed text-nevoa">{text ?? fala("vazio")}</p>
      {cta && (
        <Link to={cta.to} className="btn-outline mt-4 inline-flex">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

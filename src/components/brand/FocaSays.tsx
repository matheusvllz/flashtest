import { useState } from "react";
import { FocaMark, type FocaExpression, type FocaMotion } from "@/components/brand/FocaMark";
import { fala, type VozSlot } from "@/lib/voz";

/**
 * Foca + balão de fala (docs/18-plano-reestilizacao-rabisco.md §8.4). A frase
 * vem de `src/lib/voz.ts` pelo `slot` — nunca hardcoded aqui, pra toda tela
 * herdar a mesma biblioteca e a mesma regra de não-repetição. `text` (docs/25
 * §18 T-10) sobrescreve isso quando a fala vem do CONTEÚDO (ex.: objetivo/dica
 * de uma lição) em vez da personalidade sorteada — nesse caso `slot` nem
 * precisa ser passado.
 */
export function FocaSays({
  slot,
  text,
  expression = "neutra",
  size = 56,
  motion = "pop",
  compact = false,
  className = "",
}: {
  slot?: VozSlot;
  text?: string;
  expression?: FocaExpression;
  size?: number;
  motion?: FocaMotion;
  compact?: boolean;
  className?: string;
}) {
  // Uma vez por montagem, não a cada render (docs/20 §3 B1, §4.1) — `slot`/
  // `text` são constantes ao longo da vida deste componente em toda tela que
  // o usa hoje. Chamador sem `text` continua idêntico (byte a byte): ainda
  // chama `fala(slot)` aqui dentro.
  const [texto] = useState(() => (text !== undefined ? text : fala(slot as VozSlot)));

  if (compact) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <FocaMark expression={expression} motion={motion} size={40} decorative />
        <p className="text-[13px] font-semibold leading-snug text-abismo">{texto}</p>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <FocaMark expression={expression} motion={motion} size={size} decorative />
      <div className="relative rounded-lg border-2 border-gelo bg-cards px-3.5 py-2.5">
        <span
          aria-hidden
          className="absolute -left-1.5 top-4 h-3 w-3 -rotate-45 border-b-2 border-l-2 border-gelo bg-cards"
        />
        <p className="text-sm font-semibold leading-snug text-abismo">{texto}</p>
      </div>
    </div>
  );
}

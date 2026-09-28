import { COPY } from "@/lib/copy";

/**
 * Botão "Não sei" (docs/30 §16.1, Fase 6) — sinal próprio, distinto de errar
 * ou de chutar. Fica abaixo das alternativas, texto secundário (nunca
 * compete com o CTA primário "Verificar"/"Responder"). Alvo ≥ 44px (docs/18
 * §3, mesma régua dos outros controles).
 */
export function DontKnowButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={COPY.questao.naoSeiAria}
      className="min-h-11 w-full text-center text-sm font-semibold text-nevoa underline-offset-4 hover:underline disabled:opacity-40"
    >
      {COPY.questao.naoSei}
    </button>
  );
}

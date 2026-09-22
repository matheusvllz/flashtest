import { FocaSays } from "@/components/brand/FocaSays";
import { COPY } from "@/lib/copy";
import type { TipStep } from "@/lib/learning/types";

/**
 * Passo `tip` (docs/25 §12.2/§18 T-10) — Foca compacta (40px) com uma dica
 * pontual embutida no fluxo da lição. Sem lógica de estado — só props.
 */
export function TipStepView({ step, onNext }: { step: TipStep; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <p className="ds-label">{step.title ?? COPY.licao.dica}</p>
      <FocaSays text={step.body} size={40} compact />
      <button onClick={onNext} className="btn-primary w-full">
        {COPY.licao.continuar}
      </button>
    </div>
  );
}

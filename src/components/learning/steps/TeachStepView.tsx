import { LearningBlockView } from "@/components/learning/LearningBlock";
import { COPY } from "@/lib/copy";
import type { TeachStep } from "@/lib/learning/types";

/**
 * Passo `teach` (docs/25 §12.2/§18 T-10) — um bloco de ensino por vez (nunca
 * a Foca aqui, docs/15 §4). Sem lógica de estado — só props.
 */
export function TeachStepView({ step, onNext }: { step: TeachStep; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <LearningBlockView block={step.block} />
      <button onClick={onNext} className="btn-primary w-full">
        {COPY.licao.continuar}
      </button>
    </div>
  );
}

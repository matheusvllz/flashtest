import { FocaSays } from "@/components/brand/FocaSays";
import { COPY } from "@/lib/copy";
import type { IntroStep } from "@/lib/learning/types";

/**
 * Passo `intro` (docs/25 §12.2/§18 T-10) — abre a lição com objetivo em texto
 * de personagem (`FocaSays text=`, não `slot`: a frase vem do CONTEÚDO da
 * lição, não é sorteada). Sem lógica de estado — só props.
 */
export function IntroStepView({ step, onNext }: { step: IntroStep; onNext: () => void }) {
  return (
    <div className="space-y-5">
      <FocaSays text={step.body} expression="neutra" size={56} />
      <h2 className="font-display text-xl font-bold text-abismo">{step.title}</h2>
      <button onClick={onNext} className="btn-primary w-full">
        {COPY.licao.comecar}
      </button>
    </div>
  );
}

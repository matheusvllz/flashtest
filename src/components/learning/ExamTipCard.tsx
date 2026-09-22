import { Lightbulb, X } from "lucide-react";
import type { ExamTip } from "@/lib/learning/types";

/**
 * Dica de vestibular — só aparece inline no recap, nunca modal/timer (docs/20
 * §10, regra 1/3). Dispensar não mexe em XP/progresso (crítério A11): o botão
 * só chama `onDismiss`, que no chamador apenas marca o histórico.
 */
export function ExamTipCard({ tip, onDismiss }: { tip: ExamTip; onDismiss: () => void }) {
  return (
    <div className="card-soft flex items-start gap-3 p-4">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mar/12">
        <Lightbulb size={16} className="text-mar-fundo" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="ds-label">Dica de prova</p>
        <p className="mt-1 text-[13px] leading-relaxed text-abismo">{tip.text}</p>
      </div>
      <button onClick={onDismiss} aria-label="Dispensar dica" className="shrink-0 text-nevoa">
        <X size={16} />
      </button>
    </div>
  );
}

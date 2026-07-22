import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Barra de feedback pós-verificação: sobe do rodapé, verde no acerto e
 * vermelha no erro. Verde/vermelho aqui são legítimos — é exatamente o
 * feedback de resposta certa/errada que o design system reserva para eles.
 *
 * A explicação é estática (vem da lição, custo zero). O botão "Explicar melhor"
 * é a porta para o tutor de IA: aparece só no erro, que é quando ela vale.
 */
export function FeedbackBar({
  correct,
  explanation,
  isLast,
  onContinue,
  onAskTutor,
}: {
  correct: boolean;
  explanation: string;
  isLast: boolean;
  onContinue: () => void;
  onAskTutor?: () => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        "anim-slide-up sticky bottom-0 -mx-5 rounded-t-2xl border-t-2 px-5 pb-5 pt-4",
        correct ? "border-success bg-success/10" : "border-error bg-error/10",
      )}
    >
      <div className="flex items-start gap-3">
        {correct ? (
          <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success" aria-hidden />
        ) : (
          <XCircle size={22} className="mt-0.5 shrink-0 text-error" aria-hidden />
        )}
        <div className="min-w-0">
          <p className="font-display text-base font-bold text-navy">
            {correct ? "Muito bem!" : "Não foi dessa vez"}
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-slate">{explanation}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {!correct && onAskTutor && (
          <button onClick={onAskTutor} className="btn-outline shrink-0 px-3 text-[13px]">
            <Sparkles size={15} /> Explicar melhor
          </button>
        )}
        <button onClick={onContinue} className="btn-primary flex-1">
          {isLast ? "Ver resultado" : "Continuar"}
        </button>
      </div>
    </div>
  );
}

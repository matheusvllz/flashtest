import { useState, type ReactNode } from "react";
import { CheckCircle2, ChevronDown, Sparkles, XCircle } from "lucide-react";
import { FocaMark } from "@/components/brand/FocaMark";
import { XpChip } from "@/components/ds/XpChip";
import { fala } from "@/lib/voz";
import { cn } from "@/lib/utils";

/**
 * Folha de feedback pós-resposta (docs/18-plano-reestilizacao-rabisco.md §7.9,
 * §13.6). Usada pelos dois pilares — aula de 60s e lição de redação — pra
 * falar a mesma língua. Verde/vermelho aqui são legítimos: é exatamente o
 * feedback de resposta certa/errada que o design system reserva para eles.
 * Nenhum azul de marca dentro da folha, exceto o próprio CTA de avançar.
 *
 * A explicação principal é estática (vem da questão/lição, custo zero); o
 * `children`, se vier, é a resolução detalhada — nasce colapsada, então a
 * folha começa curta. "Explicar melhor" é a porta para o tutor de IA: só
 * aparece no erro, que é quando ela vale.
 */
export function FeedbackSheet({
  correct,
  explanation,
  children,
  isLast,
  onContinue,
  onAskTutor,
  xp,
}: {
  correct: boolean;
  explanation: string;
  /** Resolução detalhada, colapsável — passo a passo, salvar flashcard, videoaula. */
  children?: ReactNode;
  isLast: boolean;
  onContinue: () => void;
  onAskTutor?: () => void;
  /** XP concedido por esta resposta. Aparece só DEPOIS de continuar (docs/18 princípio 3). */
  xp?: number;
}) {
  const [aberto, setAberto] = useState(false);
  const [mostrarXp, setMostrarXp] = useState(false);
  const titulo = fala(correct ? "acertou" : "errou");

  function continuar() {
    if (xp && !mostrarXp) {
      setMostrarXp(true);
      window.setTimeout(onContinue, 700);
      return;
    }
    onContinue();
  }

  return (
    <div
      role="status"
      className={cn(
        "sheet anim-slide-up sticky bottom-0 -mx-5 px-5 pb-5 pt-4",
        correct ? "bg-success/10" : "bg-error/10",
      )}
    >
      <div className="flex items-start gap-3">
        <FocaMark size={40} decorative expression={correct ? "orgulhosa" : "neutra"} motion="pop" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-display text-base font-bold text-abismo">
            {correct ? (
              <CheckCircle2 size={18} className="shrink-0 text-success" aria-hidden />
            ) : (
              <XCircle size={18} className="shrink-0 text-error" aria-hidden />
            )}
            {titulo}
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-abismo">{explanation}</p>
        </div>
      </div>

      {children && (
        <div className="mt-3">
          <button
            onClick={() => setAberto((v) => !v)}
            className="flex items-center gap-1 text-xs font-bold text-nevoa"
          >
            {aberto ? "Ocultar resolução" : "Ver resolução"}
            <ChevronDown size={14} className={cn("transition-transform", aberto && "rotate-180")} />
          </button>
          {aberto && <div className="mt-2.5">{children}</div>}
        </div>
      )}

      {mostrarXp && xp !== undefined && (
        <div className="mt-3 flex justify-center">
          <XpChip amount={xp} animate />
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!correct && onAskTutor && (
          <button onClick={onAskTutor} className="btn-outline shrink-0 px-3 text-[13px]">
            <Sparkles size={15} /> Explicar melhor
          </button>
        )}
        <button onClick={continuar} className="btn-primary flex-1">
          {isLast ? "Ver resultado" : "Continuar"}
        </button>
      </div>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { CheckCircle2, ChevronDown, Sparkles, XCircle } from "lucide-react";
import { FocaMark } from "@/components/brand/FocaMark";
import { XpChip } from "@/components/ds/XpChip";
import { COPY } from "@/lib/copy";
import type { AnswerFeedback } from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

/**
 * Folha de feedback pós-resposta (docs/18-plano-reestilizacao-rabisco.md §7.9,
 * §13.6; docs/20 §5, Fase 2). Usada pelos dois pilares — aula de 60s e lição
 * de redação — pra falar a mesma língua. Verde/vermelho aqui são legítimos: é
 * exatamente o feedback de resposta certa/errada que o design system reserva
 * para eles. Nenhum azul de marca dentro da folha, exceto o próprio CTA.
 *
 * Puramente apresentacional: só renderiza o snapshot que `useExerciseSession`
 * já criou. Não sorteia frase, não decide concessão de XP, não guarda estado
 * de avanço — isso é responsabilidade do hook (camada de coordenação).
 *
 * A explicação principal é estática (vem da questão/lição, custo zero); o
 * `children`, se vier, é a resolução detalhada — nasce colapsada, então a
 * folha começa curta. "Explicar melhor" é a porta para o tutor de IA: só
 * aparece no erro, que é quando ela vale.
 */
export function FeedbackSheet({
  feedback,
  children,
  isLast,
  onContinue,
  onAskTutor,
}: {
  feedback: AnswerFeedback;
  /** Resolução detalhada, colapsável — passo a passo, salvar flashcard, videoaula. */
  children?: ReactNode;
  isLast: boolean;
  /** Chamado ao clicar "Continuar" — o guard contra clique duplo mora em `useExerciseSession().advance`, não aqui. */
  onContinue: () => void;
  onAskTutor?: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const { correct, messageText, explanation, xpAwarded } = feedback;

  return (
    <div
      role="status"
      className="sheet anim-slide-up sticky bottom-0 -mx-5 px-5 pb-5 pt-4"
      // Fundo composto opaco, calculado a partir de `--color-cards`: evitar
      // duas classes de background (`sheet` + `bg-success/10`) competindo na
      // mesma camada de utilitários, o que deixava o resultado dependente da
      // ordem de geração do CSS (docs/20 §4.4).
      style={{
        backgroundColor: `color-mix(in srgb, var(--color-${correct ? "success" : "error"}) 10%, var(--color-cards))`,
      }}
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
            {messageText}
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
            {aberto ? COPY.feedback.ocultarResolucao : COPY.feedback.verResolucao}
            <ChevronDown size={14} className={cn("transition-transform", aberto && "rotate-180")} />
          </button>
          {aberto && <div className="mt-2.5">{children}</div>}
        </div>
      )}

      {xpAwarded !== undefined && xpAwarded > 0 && (
        <div className="mt-3 flex justify-center">
          <XpChip amount={xpAwarded} animate />
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!correct && onAskTutor && (
          <button onClick={onAskTutor} className="btn-outline shrink-0 px-3 text-[13px]">
            <Sparkles size={15} /> {COPY.feedback.explicarMelhor}
          </button>
        )}
        <button onClick={onContinue} className="btn-primary flex-1">
          {isLast ? COPY.feedback.verResultado : COPY.feedback.continuar}
        </button>
      </div>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { CheckCircle2, ChevronDown, HelpCircle, Sparkles, XCircle } from "lucide-react";
import { FocaMark } from "@/components/brand/FocaMark";
import { XpChip } from "@/components/ds/XpChip";
import { COPY } from "@/lib/copy";
import type { AnswerFeedback } from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

/**
 * Folha de feedback pós-resposta (docs/design/sistema-rabisco.md §7.9,
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
 * aparece no erro (e no "não sei", que também não conta como acerto), que é
 * quando ela vale.
 *
 * "Não sei" (docs/30 §16.1, Fase 6) é uma TERCEIRA variante — `feedback.kind
 * === "dont-know"` — neutra: sem verde nem vermelho, sem ícone de certo/
 * errado, sem julgamento no tom (`voz.ts`, slot `naosei`).
 */
export type ModoOutroJeito = "passo" | "exemplo" | "pedido";
const MODOS_OUTRO_JEITO: readonly ModoOutroJeito[] = ["passo", "exemplo", "pedido"];

export function FeedbackSheet({
  feedback,
  children,
  isLast,
  onContinue,
  onAskTutor,
  onOutroJeito,
  fonte,
  acimaDaNav = false,
}: {
  feedback: AnswerFeedback;
  /** Resolução detalhada, colapsável — passo a passo, salvar flashcard, videoaula. */
  children?: ReactNode;
  isLast: boolean;
  /** Chamado ao clicar "Continuar" — o guard contra clique duplo mora em `useExerciseSession().advance`, não aqui. */
  onContinue: () => void;
  onAskTutor?: () => void;
  /** "Explica de outro jeito" (spec 49 §5.9 item 4, Pro): ausente = não mostra. Só abre a Foca IA no toque (regra dura 7). */
  onOutroJeito?: (modo: ModoOutroJeito) => void;
  /**
   * Atribuição de item OFICIAL ("ENEM 2023"; docs/34, docs/36 RP-10) — vem de `atribuicaoOficial(meta.source)`,
   * nunca de texto de apoio (`exercise.fonte` também guarda a fonte de um texto de interpretação).
   * Ausente = item não oficial: nada é desenhado.
   */
  fonte?: string;
  /**
   * true nas telas com `BottomNav` fixa (`/study`, dentro do `AppShell`): a folha gruda ACIMA da nav
   * (`--bottom-nav-h`), não no fim da janela — senão, com a resolução expandida, a nav cobre o "Continuar"
   * (achado do docs/36 T-08.10, B1). A nav some em ≥ 1024 px (vira NavRail), então lá volta a colar em 0.
   */
  acimaDaNav?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const { correct, kind, messageText, explanation, xpAwarded } = feedback;
  const dontKnow = kind === "dont-know";

  return (
    <div
      role="status"
      data-resultado={dontKnow ? "nao-sei" : correct ? "acerto" : "erro"}
      className={cn(
        "sheet anim-slide-up sticky -mx-5 px-5 pb-5 pt-4",
        acimaDaNav ? "bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] lg:bottom-0" : "bottom-0",
      )}
      // Fundo composto opaco, calculado a partir de `--color-cards`: evitar
      // duas classes de background (`sheet` + `bg-success/10`) competindo na
      // mesma camada de utilitários, o que deixava o resultado dependente da
      // ordem de geração do CSS (docs/20 §4.4). "Não sei" fica neutro — sem
      // mistura de cor nenhuma, só o cinza de cards (docs/30 §16.1).
      style={
        dontKnow
          ? undefined
          : {
              // `--color-success`/`--color-error` (o alias `@theme inline`) não
              // sobrevivem ao tree-shaking de custom properties da Lightning CSS
              // quando só são consumidos via classe utilitária gerada (`text-success`
              // etc.) — nenhuma referência `var()` escrita à mão os mantém no CSS
              // compilado, então `color-mix()` fica inválido em tempo de valor
              // computado e o fundo vira transparente (achado de teste em
              // dispositivo físico, docs/32 F15.3). Os tokens BASE (`--success`,
              // `--error`, `--cards`) são `:root`/`.dark` de verdade — sempre presentes.
              backgroundColor: `color-mix(in srgb, var(--${correct ? "success" : "error"}) 10%, var(--cards))`,
            }
      }
    >
      <div className="flex items-start gap-3">
        <FocaMark
          size={40}
          decorative
          expression={correct ? "orgulhosa" : dontKnow ? "neutra" : "acolhedora"} /* errar nunca é decepção (docs/44 I-5) */
          motion="pop"
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-display text-base font-bold text-abismo">
            {dontKnow ? (
              <HelpCircle size={18} className="shrink-0 text-nevoa" aria-hidden />
            ) : correct ? (
              <CheckCircle2 size={18} className="shrink-0 text-success" aria-hidden />
            ) : (
              <XCircle size={18} className="shrink-0 text-error" aria-hidden />
            )}
            {messageText}
          </p>
          {fonte && <p className="mt-0.5 text-[11px] text-nevoa">{COPY.feedback.fonteOficial(fonte)}</p>}
          <p className="mt-0.5 text-[13px] leading-relaxed text-abismo">{explanation}</p>
        </div>
      </div>

      {children && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="tap-area flex items-center gap-1 text-xs font-bold text-nevoa"
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

      {onOutroJeito && (
        <div className="mt-3" data-testid="outro-jeito">
          <p className="text-xs font-bold text-nevoa">{COPY.feedback.outroJeito.titulo}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {MODOS_OUTRO_JEITO.map((m) => (
              <button key={m} type="button" onClick={() => onOutroJeito(m)} className="chip tap-area">
                {COPY.feedback.outroJeito[m]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!correct && onAskTutor && (
          <button type="button" onClick={onAskTutor} className="btn-outline shrink-0 px-3 text-[13px]">
            <Sparkles size={15} /> {COPY.feedback.explicarMelhor}
          </button>
        )}
        <button type="button" onClick={onContinue} className="btn-primary flex-1" data-acao-principal>
          {isLast ? COPY.feedback.verResultado : COPY.feedback.continuar}
        </button>
      </div>
    </div>
  );
}

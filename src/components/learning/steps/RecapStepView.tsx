import { useEffect, useState } from "react";
import { FocaMark } from "@/components/brand/FocaMark";
import { ExamTipCard } from "@/components/learning/ExamTipCard";
import { EXAM_TIPS } from "@/content/exam-tips";
import { COPY } from "@/lib/copy";
import { pickTip } from "@/lib/learning/tips";
import type { ExamTip, MicroLesson } from "@/lib/learning/types";
import { dismissTip, hojeISO, recordTipShown, useAppState } from "@/lib/store";

/**
 * Passo `recap` (docs/25 §12.2/§18 T-10) — Foca orgulhosa 72px + resumo +
 * dica de prova (quando elegível). Relocado de `MicroLessonPlayer.tsx`
 * (`RecapStage`) sem mudança de lógica: só o nome e o arquivo mudam.
 */
export function RecapStepView({ lesson, onComplete }: { lesson: MicroLesson; onComplete: () => void }) {
  const s = useAppState();
  // Escolhida uma vez, na montagem — não a cada render (docs/20 §3 B1, §4.1:
  // "registrar exposição uma vez por evento, não por render"). Só aparece
  // aqui, inline no recap: nunca modal, nunca timer (regra 1/3).
  const [tip] = useState<ExamTip | null>(() =>
    s.prefs.showExamTips
      ? pickTip({
          tips: EXAM_TIPS,
          examTargets: s.prefs.examTargets,
          tipHistory: s.learning.tipHistory,
          skillIds: lesson.skillIds,
          hojeISO: hojeISO(),
          requested: false,
        })
      : null,
  );
  const [dispensada, setDispensada] = useState(false);

  useEffect(() => {
    if (tip) recordTipShown(tip.id, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <FocaMark size={72} decorative expression="orgulhosa" className="mx-auto" />
      <div className="card-soft p-4 text-center">
        <p className="ds-label">Recap</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-abismo">{lesson.recap}</p>
      </div>
      {tip && !dispensada && (
        <ExamTipCard
          tip={tip}
          onDismiss={() => {
            dismissTip(tip.id);
            setDispensada(true);
          }}
        />
      )}
      <button onClick={onComplete} className="btn-primary w-full">
        {COPY.licao.concluir}
      </button>
    </div>
  );
}

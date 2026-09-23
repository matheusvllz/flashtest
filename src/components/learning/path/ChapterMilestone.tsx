import { Stamp } from "lucide-react";
import { COPY } from "@/lib/copy";
import type { ChapterMilestoneData } from "@/lib/learning/path-layout";

/** Carimbo do capítulo (RF-6). Marco determinístico — nunca baú, nunca sorteio (docs/16 §9). */
export function ChapterMilestone({ m }: { m: ChapterMilestoneData }) {
  const label = m.done
    ? `${COPY.trilha.carimboConcluido}, ${COPY.trilha.estrelas(m.stars, m.maxStars)}`
    : COPY.trilha.carimboPendente(m.completed, m.total);
  return (
    <>
      <span className="path-milestone" data-done={m.done ? "true" : "false"} role="img" aria-label={label}>
        <Stamp size={28} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="path-caption" data-side="right" style={{ left: "calc(50% + 48px)" }} aria-hidden="true">
        <span className="block font-display text-sm font-bold text-abismo">
          {m.done ? COPY.trilha.carimboConcluido : COPY.trilha.carimboPendente(m.completed, m.total)}
        </span>
        {m.done && (
          <span className="mt-0.5 block font-mono text-xs font-bold text-nevoa">
            ★ {m.stars}/{m.maxStars}
          </span>
        )}
      </span>
    </>
  );
}

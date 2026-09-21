import { useEffect, useRef, useState } from "react";

export type ProgressTone = "caneta" | "recompensa" | "success";

const TONE_BG: Record<ProgressTone, string> = {
  caneta: "bg-mar",
  recompensa: "bg-recompensa",
  success: "bg-success",
};

/**
 * Barra de progresso única do design system (docs/18 §7.7). Substitui as ~6
 * implementações inline espalhadas por dashboard/study/quiz/redação/progress/plano.
 * Dá um pequeno "bump" quando o valor sobe — é a materialização visual do avanço.
 */
export function ProgressBar({
  value,
  max = 100,
  tone = "caneta",
  size = "sm",
  label,
  className = "",
}: {
  value: number;
  max?: number;
  tone?: ProgressTone;
  size?: "sm" | "md";
  label: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100));
  const prevValue = useRef(value);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (value > prevValue.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 220);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
    prevValue.current = value;
  }, [value]);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={`w-full overflow-hidden rounded-full bg-gelo ${size === "md" ? "h-3" : "h-2"} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${TONE_BG[tone]} ${bump ? "anim-bump" : ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

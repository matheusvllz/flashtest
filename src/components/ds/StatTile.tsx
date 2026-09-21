import type { ReactNode } from "react";

/**
 * Tile de estatística único do design system (docs/18 §7.16). Substitui as
 * três implementações locais (`Stat` em dashboard, `HeroStat` em progress,
 * `Tile` em study) por um só componente.
 */
export function StatTile({
  icon,
  label,
  value,
  className = "",
  style,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`card-soft flex items-center gap-3 p-3 ${className}`} style={style}>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gelo text-abismo">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-nevoa">{label}</p>
        <p className="font-mono text-lg font-bold text-abismo tabular-nums">{value}</p>
      </div>
    </div>
  );
}

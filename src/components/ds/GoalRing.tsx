/**
 * Anel de meta diária (docs/18 §7.8, §9). Substitui a barra linear "0/3 aulas
 * de hoje" por um anel que fecha e vira marca-texto quando a meta bate —
 * a sensação de "fechar o dia" que o Duolingo faz bem, sem copiar o traço.
 */
export function GoalRing({ value, max, size = 72 }: { value: number; max: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, max > 0 ? value / max : 0);
  const done = value >= max && max > 0;
  const offset = circumference * (1 - pct);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label="Meta diária"
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-gelo)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={done ? "var(--color-recompensa)" : "var(--color-mar)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms var(--ease-out), stroke 300ms" }}
        />
      </svg>
      <span className="absolute font-mono text-sm font-bold text-abismo tabular-nums">
        {value}/{max}
      </span>
    </div>
  );
}

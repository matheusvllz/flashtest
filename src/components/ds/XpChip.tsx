/**
 * Chip de XP em marca-texto (docs/18 §7.16, D1 §14). Sem ícone — a Foca não
 * vira bullet de 14px (docs/18 §8.5) — só o número em mono sobre o accent
 * de recompensa, com texto grafite (nunca amarelo como cor de texto).
 */
export function XpChip({ amount, animate = false }: { amount: number; animate?: boolean }) {
  return (
    <span
      aria-live="polite"
      className={`inline-flex rounded-full bg-recompensa px-3 py-1 font-mono text-sm font-bold text-abismo ${animate ? "anim-xp" : ""}`}
    >
      +{amount} XP
    </span>
  );
}

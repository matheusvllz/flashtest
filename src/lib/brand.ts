/**
 * Paleta Rabisco na Margem da Foca (docs/brand/foca-rabisco-branding.md,
 * docs/18-plano-reestilizacao-rabisco.md §6.1) para os poucos lugares que
 * precisam do hex em JavaScript (meta theme-color, cores calculadas com alpha).
 * Em JSX use as classes Tailwind (`bg-abismo`) ou `var(--color-…)` — este
 * objeto NÃO é para estilizar componentes. Fonte única de verdade: styles.css.
 */
export const PALETTE = {
  abismo: "#3A3A3C",
  mar: "#2E6BFF",
  marFundo: "#1E4FCC",
  gelo: "#E1DFDA",
  neve: "#F6F5F1",
  neveDark: "#1C1B18",
  cards: "#FFFFFF",
  coralClaro: "#8FB0FF",
  pelo: "#D6D6D4",
  peloSombra: "#737075",
  nevoa: "#737075",
  white: "#FFFFFF",
  success: "#2E9E5B",
  successTexto: "#1F7A45",
  alert: "#D9A017",
  recompensa: "#D9A017",
  error: "#C23B3B",
} as const;

export const BRAND = {
  name: "Foca",
  tagline: "Foca 60 segundos.",
  description:
    "Preparação para o ENEM em aulas de 60 segundos. Uma foca que aprende suas lacunas e te cobra todo dia.",
} as const;

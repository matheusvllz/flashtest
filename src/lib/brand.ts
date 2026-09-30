/**
 * Paleta Rabisco na Margem da Foca (docs/design/brand/foca-rabisco-branding.md,
 * docs/design/sistema-rabisco.md §6.1) para os poucos lugares que
 * precisam do hex em JavaScript (meta theme-color, cores calculadas com alpha).
 * Em JSX use as classes Tailwind (`bg-abismo`) ou, em `style`/valor arbitrário, a
 * variável BASE (`var(--mar)`, `var(--gelo)`, `var(--alert)`…), nunca o alias
 * `--color-*` do `@theme inline` (some do CSS compilado — docs/36 T-08.3) — este
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
  nevoa: "#6E6B71",
  white: "#FFFFFF",
  success: "#2E9E5B",
  successTexto: "#1F7A45",
  alert: "#D9A017",
  recompensa: "#D9A017",
  error: "#C23B3B",
} as const;

export const BRAND = {
  name: "Foca",
  tagline: "Estudo curto, todo dia.",
  description:
    "Preparação para o ENEM em aulas curtas. A Foca acompanha o que você já sabe e escolhe o próximo passo.",
} as const;

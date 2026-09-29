// AUTOGERADO por scripts/capture-product-shots.ts (bun run shots). Não edite à mão.
// Dimensões CSS de cada retrato real do app; arquivos em /lp/shots/<id>-<tema>-<largura>.<avif|webp>.
export interface ShotMeta {
  width: number;
  height: number;
  widths: number[];
}

export const SHOTS = {
  "atividade-consolidar": { width: 390, height: 380, widths: [360, 720] },
  "atividade-motivo": { width: 390, height: 380, widths: [360, 720] },
  "feedback-explicar": { width: 390, height: 745, widths: [360, 720] },
  "hero-atividade": { width: 390, height: 380, widths: [360, 720] },
  "nivelamento-resultado": { width: 390, height: 868, widths: [360, 720] },
  "quiz-prova": { width: 390, height: 432, widths: [360, 720] },
  "tutor-balao": { width: 390, height: 844, widths: [360, 720] },
} as const satisfies Record<string, ShotMeta>;

export type ShotId = keyof typeof SHOTS;

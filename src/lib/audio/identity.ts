/** Foca v2: WAVs approved on 2026-09-21. Scores: docs/design/audio/v2/manifest.json. */
export const SOUND_ASSETS = {
  "resposta-correta": "/sfx/v2/resposta-correta.wav",
  "resposta-incorreta": "/sfx/v2/resposta-incorreta.wav",
  "acerto-consecutivo": "/sfx/v2/acerto-consecutivo.wav",
  "conclusao-licao": "/sfx/v2/conclusao-licao.wav",
  "level-up": "/sfx/v2/level-up.wav",
  conquista: "/sfx/v2/conquista.wav",
  "streak-diario": "/sfx/v2/streak-diario.wav",
  "marco-streak": "/sfx/v2/marco-streak.wav",
  "capitulo-desbloqueado": "/sfx/v2/capitulo-desbloqueado.wav",
  "meta-diaria": "/sfx/v2/meta-diaria.wav",
  "abertura-importante": "/sfx/v2/abertura-importante.wav",
  "recompensa-especial": "/sfx/v2/recompensa-especial.wav",
} as const;
export type SoundEvent = keyof typeof SOUND_ASSETS;

/**
 * Ordem do som de fechamento (C-SOM-2): só o mais alto toca. Revista pela spec 50 §5.12.3: o marco de ofensiva sobe
 * para logo abaixo do especial (um marco de 30 dias vale mais que a meta do dia). A sequência diária continua acima
 * da conclusão simples.
 */
export const PRIORIDADE_FECHAMENTO: SoundEvent[] = [
  "recompensa-especial",
  "marco-streak",
  "level-up",
  "conquista",
  "capitulo-desbloqueado",
  "meta-diaria",
  "streak-diario",
  "conclusao-licao",
];

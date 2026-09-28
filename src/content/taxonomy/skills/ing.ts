import type { SkillDef } from "../types";

/** Inglês (docs/30 §8, Fase 2). Cobertura enxuta — leitura e vocabulário em contexto. */
export const SKILLS_ING: SkillDef[] = [
  {
    id: "ing:interpretacao-texto-curto",
    subjectId: "ing",
    topicId: "interp",
    area: "LC",
    name: "Interpretar um texto curto em inglês (anúncio, tira, notícia)",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "base",
    status: "ativo",
  },
  {
    id: "ing:vocabulario-contexto",
    subjectId: "ing",
    topicId: "voc",
    area: "LC",
    name: "Deduzir o sentido de uma palavra desconhecida pelo contexto",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "base",
    status: "ativo",
  },
];

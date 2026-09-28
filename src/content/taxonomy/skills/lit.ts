import type { SkillDef } from "../types";

/** Literatura (docs/30 §8, Fase 2). Cobertura enxuta — movimento literário e leitura de obra. */
export const SKILLS_LIT: SkillDef[] = [
  {
    id: "lit:caracteristicas-escolas-literarias",
    subjectId: "lit",
    topicId: "esc",
    area: "LC",
    name: "Reconhecer características de uma escola literária num trecho",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "base",
    status: "ativo",
  },
  {
    id: "lit:modernismo-fases-brasil",
    subjectId: "lit",
    topicId: "mod",
    area: "LC",
    name: "Diferenciar as fases do Modernismo brasileiro",
    prerequisites: ["lit:caracteristicas-escolas-literarias"],
    core: false,
    incidence: 2,
    level: "intermediario",
    status: "ativo",
  },
  {
    id: "lit:interpretacao-texto-literario",
    subjectId: "lit",
    topicId: "obr",
    area: "LC",
    name: "Interpretar um trecho de obra literária no contexto da prova",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "intermediario",
    status: "ativo",
  },
];

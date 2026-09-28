import type { SkillDef } from "../types";

/**
 * Redação (docs/30 §8, Fase 2). Área própria `RED` — o nivelamento (Fase 13)
 * não mede redação (texto livre). Uma habilidade por trilha legada de
 * redação (`redacao-estrutura`, `redacao-argumentacao`, `redacao-
 * competencias`), a mesma granularidade grosseira das demais matérias
 * legadas nesta fase.
 */
export const SKILLS_RED: SkillDef[] = [
  {
    id: "red:estrutura-dissertativo-argumentativa",
    subjectId: "red",
    topicId: "diss",
    area: "RED",
    name: "Estruturar um texto dissertativo-argumentativo nos moldes do ENEM",
    prerequisites: [],
    core: true,
    incidence: 3,
    level: "base",
    status: "ativo",
  },
  {
    id: "red:argumentacao-repertorio",
    subjectId: "red",
    topicId: "rep",
    area: "RED",
    name: "Construir argumento com repertório sociocultural pertinente",
    prerequisites: ["red:estrutura-dissertativo-argumentativa"],
    core: false,
    incidence: 3,
    level: "intermediario",
    status: "ativo",
  },
  {
    id: "red:competencias-avaliacao-enem",
    subjectId: "red",
    topicId: "comp",
    area: "RED",
    name: "Reconhecer o que cada competência do ENEM avalia numa redação",
    prerequisites: ["red:estrutura-dissertativo-argumentativa"],
    core: false,
    incidence: 3,
    level: "intermediario",
    status: "ativo",
  },
];

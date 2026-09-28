import type { SkillDef } from "../types";

/** Sociologia (docs/30 §8, Fase 2). */
export const SKILLS_SOC: SkillDef[] = [
  {
    id: "soc:desigualdade-social-estrutura",
    subjectId: "soc",
    topicId: "des",
    area: "CH",
    name: "Explicar uma forma de desigualdade social com conceito sociológico",
    prerequisites: [],
    core: true,
    incidence: 3,
    level: "base",
    status: "ativo",
  },
  {
    id: "soc:movimentos-sociais-cidadania",
    subjectId: "soc",
    topicId: "mov",
    area: "CH",
    name: "Relacionar um movimento social a uma pauta de cidadania",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "intermediario",
    status: "ativo",
  },
  {
    id: "soc:cultura-identidade-sociedade",
    subjectId: "soc",
    topicId: "cul",
    area: "CH",
    name: "Analisar um traço cultural como construção social, não natural",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "base",
    status: "ativo",
  },
];

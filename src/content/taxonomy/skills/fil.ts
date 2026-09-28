import type { SkillDef } from "../types";

/** Filosofia (docs/30 §8, Fase 2). */
export const SKILLS_FIL: SkillDef[] = [
  {
    id: "fil:etica-correntes-filosoficas",
    subjectId: "fil",
    topicId: "eti",
    area: "CH",
    name: "Distinguir correntes éticas (deontologia, consequencialismo) num dilema",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "intermediario",
    status: "ativo",
  },
  {
    id: "fil:politica-poder-estado",
    subjectId: "fil",
    topicId: "pol",
    area: "CH",
    name: "Relacionar um conceito de poder e Estado a um pensador da política",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "intermediario",
    status: "ativo",
  },
  {
    id: "fil:epistemologia-conhecimento",
    subjectId: "fil",
    topicId: "epis",
    area: "CH",
    name: "Diferenciar racionalismo e empirismo na origem do conhecimento",
    prerequisites: [],
    core: false,
    incidence: 1,
    level: "avancado",
    status: "ativo",
  },
];

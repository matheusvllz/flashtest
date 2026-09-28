import type { SkillDef } from "../types";

/** Física (docs/30 §8, Fase 2). `fis:cinematica-movimento-uniforme` depende de uma habilidade
 * de Matemática (função afim) — exemplo real de pré-requisito entre matérias (docs/30 §2.1). */
export const SKILLS_FIS: SkillDef[] = [
  {
    id: "fis:cinematica-movimento-uniforme",
    subjectId: "fis",
    topicId: "cin",
    area: "CN",
    name: "Resolver problema de movimento uniforme com a função horária",
    prerequisites: ["mat:funcao-afim-grafico"],
    core: true,
    incidence: 3,
    level: "base",
    status: "ativo",
  },
  {
    id: "fis:dinamica-leis-newton",
    subjectId: "fis",
    topicId: "din",
    area: "CN",
    name: "Aplicar as leis de Newton para achar força ou aceleração",
    prerequisites: ["fis:cinematica-movimento-uniforme"],
    core: true,
    incidence: 2,
    level: "intermediario",
    status: "ativo",
  },
  {
    id: "fis:energia-trabalho-conservacao",
    subjectId: "fis",
    topicId: "trab",
    area: "CN",
    name: "Aplicar a conservação de energia mecânica num problema",
    prerequisites: ["fis:dinamica-leis-newton"],
    core: false,
    incidence: 2,
    level: "intermediario",
    status: "ativo",
  },
  {
    id: "fis:eletricidade-circuitos-basicos",
    subjectId: "fis",
    topicId: "elet",
    area: "CN",
    name: "Calcular corrente, tensão e resistência num circuito simples",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "intermediario",
    status: "ativo",
  },
];

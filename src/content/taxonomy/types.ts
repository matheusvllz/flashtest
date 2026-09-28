/**
 * Taxonomia de habilidades (docs/30 §8, Fase 2 do docs/31). Área ENEM →
 * matéria → tema → habilidade Foca. A habilidade é a unidade do modelo
 * (Mastery/Confidence, docs/30 §9/§10) e do motor adaptativo (§11) — não
 * confundir com `topicId` de `src/data/subjects.ts` (tema, mais amplo) nem
 * com "competência" da Matriz do ENEM (não vira entidade própria aqui:
 * guardamos só a referência em `enemSkills`, docs/30 §8.1).
 */

export type EnemArea = "LC" | "MT" | "CN" | "CH" | "RED";

export type SkillLevel = "base" | "intermediario" | "avancado";
export type SkillStatus = "ativo" | "planejado";

export interface SkillDef {
  /** `<subjectId>:<slug>` — mesmo formato já usado nas microlições (docs/30 §8.1). */
  id: string;
  subjectId: string;
  /** Id de tópico existente em `SUBJECTS[subjectId].topics` (src/data/subjects.ts). */
  topicId: string;
  area: EnemArea;
  /** Curto, começa por verbo observável (ex.: "Calcular X% de um valor"). */
  name: string;
  description?: string;
  /** Ids de outras `SkillDef`; grafo validado acíclico (validate.ts). */
  prerequisites: string[];
  /** Referência à Matriz de Referência do Inep, ex. "MT:H16" — opcional, preenchida na F2.7. */
  enemSkills?: string[];
  /** Fundamento: nunca pulada sem confirmação (docs/30 §11.2/§13). */
  core: boolean;
  /** Relevância no ENEM — 3 = alta. */
  incidence: 1 | 2 | 3;
  level: SkillLevel;
  /** "planejado" = sem conteúdo ainda; o motor adaptativo ignora (classify.ts, Fase 8). */
  status: SkillStatus;
  tags?: string[];
}

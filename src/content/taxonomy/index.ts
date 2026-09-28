import { SKILLS_BIO } from "./skills/bio";
import { SKILLS_FIL } from "./skills/fil";
import { SKILLS_FIS } from "./skills/fis";
import { SKILLS_GEO } from "./skills/geo";
import { SKILLS_HIS } from "./skills/his";
import { SKILLS_ING } from "./skills/ing";
import { SKILLS_LIT } from "./skills/lit";
import { SKILLS_MAT } from "./skills/mat";
import { SKILLS_POR } from "./skills/por";
import { SKILLS_QUI } from "./skills/qui";
import { SKILLS_RED } from "./skills/red";
import { SKILLS_SOC } from "./skills/soc";
import type { SkillDef } from "./types";
import { topologicalOrder, validateTaxonomy } from "./validate";

export type { EnemArea, SkillDef, SkillLevel, SkillStatus } from "./types";
export { SUBJECT_AREA, AREA_NAMES, areaOfSubject } from "./areas";
export { validateTaxonomy, topologicalOrder } from "./validate";
export type { TaxonomyIssue, TaxonomyIssueCode } from "./validate";

/**
 * Taxonomia publicada (docs/30 §8, Fase 2 do docs/31) — 55–70 habilidades
 * ativas cobrindo LC/MT/CN/CH/RED, o resto marcado "planejado". Validada na
 * carga do módulo, mesma filosofia de `src/content/microlicoes/index.ts` e
 * `src/lib/lessons/define.ts`: conteúdo com referência quebrada nunca chega
 * silencioso ao aluno.
 */
export const SKILLS: SkillDef[] = [
  ...SKILLS_MAT,
  ...SKILLS_POR,
  ...SKILLS_LIT,
  ...SKILLS_ING,
  ...SKILLS_RED,
  ...SKILLS_FIS,
  ...SKILLS_QUI,
  ...SKILLS_BIO,
  ...SKILLS_HIS,
  ...SKILLS_GEO,
  ...SKILLS_FIL,
  ...SKILLS_SOC,
];

export const SKILL_MAP: Record<string, SkillDef> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export function skillsOfSubject(subjectId: string): SkillDef[] {
  return SKILLS.filter((s) => s.subjectId === subjectId);
}

export function activeSkills(): SkillDef[] {
  return SKILLS.filter((s) => s.status === "ativo");
}

/** Ordem topológica de TODA a taxonomia, matéria a matéria (ordem estável de `SKILLS`). */
export function topologicalOrderAll(): SkillDef[] {
  const subjectIds = [...new Set(SKILLS.map((s) => s.subjectId))];
  return subjectIds.flatMap((id) => topologicalOrder(SKILLS, id));
}

const issues = validateTaxonomy(SKILLS);
if (issues.length > 0) {
  const detalhe = issues.map((i) => `[${i.code}] ${i.message}`).join("; ");
  throw new Error(`[taxonomy] taxonomia inválida: ${detalhe}`);
}

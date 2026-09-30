import { SUBJECTS } from "@/data/subjects";
import { SUBJECT_AREA } from "./areas";
import type { SkillDef } from "./types";

export type TaxonomyIssueCode =
  | "id-duplicado"
  | "id-formato-invalido"
  | "prefixo-nao-bate-materia"
  | "materia-inexistente"
  | "topico-inexistente"
  | "area-nao-bate"
  | "pre-requisito-inexistente"
  | "ciclo"
  | "core-planejada-bloqueia-ativa";

export interface TaxonomyIssue {
  code: TaxonomyIssueCode;
  message: string;
  skillId?: string;
}

const ID_FORMAT = /^[a-z]{2,4}:[a-z0-9-]+$/;

/**
 * Valida a taxonomia inteira (docs/30 §8.3, Fase 2 T-2.2). Não lança —
 * devolve a lista de problemas; quem chama (`index.ts`) decide lançar,
 * mesma filosofia de `learning/validate.ts`.
 */
export function validateTaxonomy(skills: SkillDef[]): TaxonomyIssue[] {
  const issues: TaxonomyIssue[] = [];
  const byId = new Map<string, SkillDef>();
  const subjectMap = new Map(SUBJECTS.map((s) => [s.id, s]));

  for (const skill of skills) {
    if (byId.has(skill.id)) {
      issues.push({ code: "id-duplicado", message: `id duplicado: "${skill.id}"`, skillId: skill.id });
      continue;
    }
    byId.set(skill.id, skill);

    if (!ID_FORMAT.test(skill.id)) {
      issues.push({
        code: "id-formato-invalido",
        message: `"${skill.id}" não bate com <subjectId>:<slug>`,
        skillId: skill.id,
      });
    }
    const prefix = skill.id.split(":")[0];
    if (prefix !== skill.subjectId) {
      issues.push({
        code: "prefixo-nao-bate-materia",
        message: `"${skill.id}" tem prefixo "${prefix}" mas subjectId é "${skill.subjectId}"`,
        skillId: skill.id,
      });
    }

    const subject = subjectMap.get(skill.subjectId);
    if (!subject) {
      issues.push({
        code: "materia-inexistente",
        message: `"${skill.id}" referencia matéria inexistente "${skill.subjectId}"`,
        skillId: skill.id,
      });
    } else if (!subject.topics.some((t) => t.id === skill.topicId)) {
      issues.push({
        code: "topico-inexistente",
        message: `"${skill.id}" referencia tópico inexistente "${skill.topicId}" em "${skill.subjectId}"`,
        skillId: skill.id,
      });
    }

    const areaEsperada = SUBJECT_AREA[skill.subjectId];
    if (areaEsperada && skill.area !== areaEsperada) {
      issues.push({
        code: "area-nao-bate",
        message: `"${skill.id}" tem area "${skill.area}", esperado "${areaEsperada}" para "${skill.subjectId}"`,
        skillId: skill.id,
      });
    }
  }

  for (const skill of skills) {
    for (const preId of skill.prerequisites) {
      if (!byId.has(preId)) {
        issues.push({
          code: "pre-requisito-inexistente",
          message: `"${skill.id}" tem pré-requisito inexistente "${preId}"`,
          skillId: skill.id,
        });
      }
    }
  }

  // Ciclo: DFS com 3 cores (branco/cinza/preto).
  const color = new Map<string, 0 | 1 | 2>();
  const cycleSkills = new Set<string>();
  function visit(id: string, stack: string[]): void {
    const c = color.get(id) ?? 0;
    if (c === 1) {
      // Achou um vértice cinza na pilha: ciclo. Marca todos os vértices do ciclo.
      const idx = stack.indexOf(id);
      for (const s of stack.slice(idx === -1 ? 0 : idx)) cycleSkills.add(s);
      cycleSkills.add(id);
      return;
    }
    if (c === 2) return;
    color.set(id, 1);
    const skill = byId.get(id);
    if (skill) {
      for (const preId of skill.prerequisites) {
        if (byId.has(preId)) visit(preId, [...stack, id]);
      }
    }
    color.set(id, 2);
  }
  for (const skill of skills) visit(skill.id, []);
  if (cycleSkills.size > 0) {
    issues.push({
      code: "ciclo",
      message: `ciclo de pré-requisitos envolvendo: ${[...cycleSkills].sort().join(", ")}`,
    });
  }

  // Habilidade ativa nunca pode depender (direta ou indiretamente) de uma
  // habilidade "core" que esteja "planejada" — ficaria bloqueada para sempre
  // (docs/30 §8.3).
  function dependsOnPlannedCore(id: string, seen: Set<string>): string | null {
    if (seen.has(id)) return null;
    seen.add(id);
    const skill = byId.get(id);
    if (!skill) return null;
    for (const preId of skill.prerequisites) {
      const pre = byId.get(preId);
      if (!pre) continue;
      if (pre.core && pre.status === "planejado") return pre.id;
      const found = dependsOnPlannedCore(preId, seen);
      if (found) return found;
    }
    return null;
  }
  for (const skill of skills) {
    if (skill.status !== "ativo") continue;
    const blocker = dependsOnPlannedCore(skill.id, new Set());
    if (blocker) {
      issues.push({
        code: "core-planejada-bloqueia-ativa",
        message: `"${skill.id}" (ativa) depende de "${blocker}" (core, planejada) — ficaria bloqueada para sempre`,
        skillId: skill.id,
      });
    }
  }

  return issues;
}

/**
 * Ordem topológica (Kahn) das habilidades de UMA matéria, pré-requisitos
 * primeiro. Desempate: posição do `topicId` em `SUBJECTS[subjectId].topics`,
 * depois `id` (estável, docs/30 §8.3).
 */
export function topologicalOrder(skills: SkillDef[], subjectId: string): SkillDef[] {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const topicIndex = new Map((subject?.topics ?? []).map((t, i) => [t.id, i]));
  const ofSubject = skills.filter((s) => s.subjectId === subjectId);
  const byId = new Map(ofSubject.map((s) => [s.id, s]));

  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const s of ofSubject) {
    inDegree.set(s.id, 0);
    dependents.set(s.id, []);
  }
  for (const s of ofSubject) {
    for (const preId of s.prerequisites) {
      if (!byId.has(preId)) continue; // pré-requisito de outra matéria: não afeta a ordem local.
      inDegree.set(s.id, (inDegree.get(s.id) ?? 0) + 1);
      dependents.get(preId)!.push(s.id);
    }
  }

  const compare = (a: string, b: string) => {
    const ta = topicIndex.get(byId.get(a)!.topicId) ?? Number.MAX_SAFE_INTEGER;
    const tb = topicIndex.get(byId.get(b)!.topicId) ?? Number.MAX_SAFE_INTEGER;
    if (ta !== tb) return ta - tb;
    return a.localeCompare(b);
  };

  const ready = ofSubject.filter((s) => (inDegree.get(s.id) ?? 0) === 0).map((s) => s.id);
  ready.sort(compare);
  const result: SkillDef[] = [];
  while (ready.length > 0) {
    ready.sort(compare);
    const id = ready.shift()!;
    result.push(byId.get(id)!);
    for (const dep of dependents.get(id) ?? []) {
      inDegree.set(dep, (inDegree.get(dep) ?? 0) - 1);
      if (inDegree.get(dep) === 0) ready.push(dep);
    }
  }
  // Sobrou algo = ciclo (já reportado por validateTaxonomy); anexa no fim,
  // ordenado, para a função nunca devolver menos itens que a entrada.
  if (result.length < ofSubject.length) {
    const restantes = ofSubject.filter((s) => !result.includes(s)).sort((a, b) => compare(a.id, b.id));
    result.push(...restantes);
  }
  return result;
}

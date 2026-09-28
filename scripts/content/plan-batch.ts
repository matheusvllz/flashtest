#!/usr/bin/env bun
/**
 * Plano de lote (docs/30 §19.2 estágio 0 / §18.1, Fase 9 do docs/31 F9.4) —
 * a partir da cobertura (`coverage.ts`), decide o que falta gerar até a
 * meta da onda, limitado por `--max`. `planBatch` é pura/testável.
 */
import type { SkillCoverage, BatchPlan, BatchPlanEntry } from "./pipeline-types";

/**
 * Meta por habilidade da Onda 1 (docs/30 §18.1): 1 aula + 4 fáceis (dif. 1-2)
 * + 4 médios (dif. 3) + 4 difíceis (dif. 4-5) + 4 de revisão + 3 de
 * diagnóstico. `diagnostico` não está no `18.1` original — achado real ao
 * ligar `plan-batch.ts` no `run-stage.ts` (Fase 11): sem essa entrada, a
 * Onda 1 nunca geraria NENHUM item com papel `"diagnostico"`, e o pool que
 * o nivelamento/checkpoint precisam (`30` §12.3/§13.2, F11.6: "≥ 12 por
 * área, ≥ 5 habilidades") ficaria vazio pra sempre, mesmo depois da Onda 1
 * inteira rodar. 3 por habilidade × ~15 habilidades ativas por área (Onda 1
 * cobre ~60 no total) já passa folgado dos mínimos de F11.6 — a promoção
 * final a `revisada-humano` continua sendo o passo humano de F11.6, este
 * número só garante que existe MATÉRIA-PRIMA suficiente pra promover.
 */
export const META_ONDA_1 = {
  aula: 1,
  facil: 4, // dificuldade 1 ou 2, somadas
  medio: 4, // dificuldade 3
  dificil: 4, // dificuldade 4 ou 5, somadas
  revisao: 4,
  diagnostico: 3,
} as const;

function faltamNaFaixa(c: SkillCoverage, faixa: (1 | 2 | 3 | 4 | 5)[], meta: number): number {
  const existentes = faixa.reduce((soma, d) => soma + c.itemsByDifficulty[d], 0);
  return Math.max(0, meta - existentes);
}

/**
 * O que falta pra UMA habilidade chegar à meta (docs/30 §18.1). Devolve até
 * 4 entradas (aula/fácil/médio/difícil) + revisão — só as que têm déficit.
 * A dificuldade escolhida pra "gerar" numa faixa incompleta é o EXTREMO
 * mais barato de gerar dessa faixa (o menor número da faixa fácil/difícil),
 * decisão simples — o pipeline não precisa de uma distribuição fina agora.
 */
export function planEntriesForSkill(c: SkillCoverage): BatchPlanEntry[] {
  const entries: BatchPlanEntry[] = [];
  if (!c.hasLesson)
    entries.push({
      skillId: c.skillId,
      difficulty: 2,
      role: "pratica",
      kind: "aula",
      quantity: META_ONDA_1.aula,
    });

  const faltamFacil = faltamNaFaixa(c, [1, 2], META_ONDA_1.facil);
  if (faltamFacil > 0)
    entries.push({
      skillId: c.skillId,
      difficulty: 1,
      role: "pratica",
      kind: "item",
      quantity: faltamFacil,
    });

  const faltamMedio = faltamNaFaixa(c, [3], META_ONDA_1.medio);
  if (faltamMedio > 0)
    entries.push({
      skillId: c.skillId,
      difficulty: 3,
      role: "pratica",
      kind: "item",
      quantity: faltamMedio,
    });

  const faltamDificil = faltamNaFaixa(c, [4, 5], META_ONDA_1.dificil);
  if (faltamDificil > 0)
    entries.push({
      skillId: c.skillId,
      difficulty: 4,
      role: "desafio",
      kind: "item",
      quantity: faltamDificil,
    });

  const faltamRevisao = Math.max(0, META_ONDA_1.revisao - c.itemsByRole.revisao);
  if (faltamRevisao > 0)
    entries.push({
      skillId: c.skillId,
      difficulty: 2,
      role: "revisao",
      kind: "item",
      quantity: faltamRevisao,
    });

  const faltamDiagnostico = Math.max(0, META_ONDA_1.diagnostico - c.itemsByRole.diagnostico);
  if (faltamDiagnostico > 0)
    entries.push({
      skillId: c.skillId,
      difficulty: 3,
      role: "diagnostico",
      kind: "item",
      quantity: faltamDiagnostico,
    });

  return entries;
}

/** Plano de lote completo, limitado a `max` candidatos totais (a última entrada pode ser cortada, nunca as anteriores). */
export function planBatch(
  coverage: SkillCoverage[],
  loteId: string,
  now: string,
  max?: number,
): BatchPlan {
  const todasEntries = coverage.flatMap(planEntriesForSkill);
  let entries = todasEntries;
  if (max !== undefined) {
    entries = [];
    let restante = max;
    for (const entry of todasEntries) {
      if (restante <= 0) break;
      const quantidade = Math.min(entry.quantity, restante);
      entries.push({ ...entry, quantity: quantidade });
      restante -= quantidade;
    }
  }
  const totalCandidates = entries.reduce((soma, e) => soma + e.quantity, 0);
  return { loteId, createdAt: now, entries, totalCandidates };
}

async function main() {
  const args = process.argv.slice(2);
  const maxArg = args.find((a) => a.startsWith("--max="));
  const max = maxArg ? Number(maxArg.split("=")[1]) : undefined;
  const loteIdArg = args.find((a) => a.startsWith("--lote="));
  const loteId = loteIdArg ? loteIdArg.split("=")[1] : `lote-${Date.now()}`;

  const { activeSkills } = await import("@/content/taxonomy");
  const { itemIndex } = await import("@/content/items");
  const { lessonForSkill } = await import("@/lib/adaptive/candidates");
  const { computeCoverage, conteudoDoBanco } = await import("./coverage");

  const skills = activeSkills().map((s) => ({ id: s.id, status: s.status }));
  const banco = await conteudoDoBanco();
  const items = [
    ...itemIndex().flatMap((entry) =>
      entry.skills.map((skillId) => ({
        skillId,
        difficulty: entry.difficulty,
        roles: entry.roles,
        validationStatus: entry.status,
      })),
    ),
    ...banco.items,
  ];
  const lessonSkillIds = new Set([
    ...skills.map((s) => s.id).filter((id) => lessonForSkill(id)),
    ...banco.lessonSkillIds,
  ]);
  const coverage = computeCoverage(skills, items, lessonSkillIds);

  const plano = planBatch(coverage, loteId, new Date().toISOString(), max);
  console.log(JSON.stringify(plano, null, 2));
}

if (import.meta.main) {
  await main();
}

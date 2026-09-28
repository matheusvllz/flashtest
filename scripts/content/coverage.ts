#!/usr/bin/env bun
/**
 * Cobertura por habilidade (docs/30 §19.2 estágio 0, Fase 9 do docs/31
 * F9.4) — por habilidade ATIVA: tem aula? quantos itens por dificuldade e
 * por papel? quantos diagnósticos revisados? Gera um relatório markdown.
 *
 * `computeCoverage` é pura/testável (recebe listas prontas); a função
 * `main()` no fim resolve o catálogo real e só roda quando chamado como
 * script (`bun scripts/content/coverage.ts`), nunca ao importar o módulo —
 * é o que permite `tests/unit/pipeline-coverage.test.ts` importar
 * `computeCoverage` sem disparar leitura de arquivo nem I/O.
 */
import type { ItemRole } from "@/content/items/types";
import type { SkillCoverage } from "./pipeline-types";

export interface CoverageSkillInput {
  id: string;
  status: "ativo" | "planejado";
}

export interface CoverageItemInput {
  skillId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  roles: ItemRole[];
  validationStatus: string;
}

const DIFICULDADES = [1, 2, 3, 4, 5] as const;
const PAPEIS: ItemRole[] = ["pratica", "revisao", "desafio", "diagnostico"];

export function computeCoverage(skills: CoverageSkillInput[], items: CoverageItemInput[], lessonSkillIds: Set<string>): SkillCoverage[] {
  const itemsPorHabilidade = new Map<string, CoverageItemInput[]>();
  for (const item of items) {
    const lista = itemsPorHabilidade.get(item.skillId) ?? [];
    lista.push(item);
    itemsPorHabilidade.set(item.skillId, lista);
  }

  return skills
    .filter((s) => s.status === "ativo")
    .map((skill) => {
      const itensDaHabilidade = itemsPorHabilidade.get(skill.id) ?? [];
      const itemsByDifficulty = Object.fromEntries(DIFICULDADES.map((d) => [d, 0])) as Record<1 | 2 | 3 | 4 | 5, number>;
      const itemsByRole = Object.fromEntries(PAPEIS.map((p) => [p, 0])) as Record<ItemRole, number>;
      let diagnosticReviewed = 0;
      for (const item of itensDaHabilidade) {
        itemsByDifficulty[item.difficulty]++;
        for (const papel of item.roles) itemsByRole[papel]++;
        if (
          item.roles.includes("diagnostico") &&
          (item.validationStatus === "revisada-humano" || item.validationStatus === "oficial-conferida")
        ) {
          diagnosticReviewed++;
        }
      }
      return {
        skillId: skill.id,
        hasLesson: lessonSkillIds.has(skill.id),
        itemsByDifficulty,
        itemsByRole,
        diagnosticReviewed,
      };
    });
}

export function formatCoverageReport(coverage: SkillCoverage[]): string {
  const linhas = [
    "# Cobertura de conteúdo por habilidade",
    "",
    "| Habilidade | Aula | Itens (1-5) | Prática | Revisão | Desafio | Diagnóstico revisado |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const c of coverage) {
    const dif = DIFICULDADES.map((d) => c.itemsByDifficulty[d]).join("/");
    linhas.push(
      `| ${c.skillId} | ${c.hasLesson ? "sim" : "não"} | ${dif} | ${c.itemsByRole.pratica} | ${c.itemsByRole.revisao} | ${c.itemsByRole.desafio} | ${c.diagnosticReviewed} |`,
    );
  }
  const semNada = coverage.filter((c) => !c.hasLesson && Object.values(c.itemsByRole).every((n) => n === 0));
  linhas.push("", `**${semNada.length} habilidade(s) sem aula E sem nenhum item:** ${semNada.map((c) => c.skillId).join(", ") || "nenhuma"}`);
  return linhas.join("\n");
}

/**
 * Itens e aulas já publicados em `src/content/banco/` (pacotes). `itemIndex()`
 * só enxerga esse conteúdo com a flag `pacotesConteudo` ligada — achado real da
 * Onda 1 (27/09/2026): sem isto, a cobertura ignorava tudo que o pipeline já
 * publicou e a repescagem re-geraria o lote inteiro. Lê direto do disco.
 */
export async function conteudoDoBanco(): Promise<{ items: CoverageItemInput[]; lessonSkillIds: Set<string> }> {
  const { existsSync, readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");
  const arquivos: string[] = [];
  const varrer = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const nome of readdirSync(dir)) {
      const full = join(dir, nome);
      if (statSync(full).isDirectory()) varrer(full);
      else if (nome.endsWith(".json")) arquivos.push(full);
    }
  };
  varrer("src/content/banco");
  const items: CoverageItemInput[] = [];
  const lessonSkillIds = new Set<string>();
  for (const arquivo of arquivos) {
    const pkg = JSON.parse(readFileSync(arquivo, "utf-8")) as {
      items?: Array<{ meta: { skillIds: string[]; difficulty: 1 | 2 | 3 | 4 | 5; roles: ItemRole[]; validation: { status: string } } }>;
      lessons?: Array<{ skillIds: string[] }>;
    };
    for (const item of pkg.items ?? []) {
      for (const skillId of item.meta.skillIds) {
        items.push({ skillId, difficulty: item.meta.difficulty, roles: item.meta.roles, validationStatus: item.meta.validation.status });
      }
    }
    for (const lesson of pkg.lessons ?? []) for (const skillId of lesson.skillIds) lessonSkillIds.add(skillId);
  }
  return { items, lessonSkillIds };
}

async function main() {
  const { activeSkills } = await import("@/content/taxonomy");
  const { itemIndex } = await import("@/content/items");
  const { lessonForSkill } = await import("@/lib/adaptive/candidates");

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
  const relatorio = formatCoverageReport(coverage);
  console.log(relatorio);
}

if (import.meta.main) {
  await main();
}

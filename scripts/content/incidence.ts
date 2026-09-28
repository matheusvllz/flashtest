#!/usr/bin/env bun
/**
 * Incidência por (área, habilidade da Matriz) a partir dos parâmetros
 * importados (docs/30 §12.4, Fase 10 do docs/31 F10.3) — quantos itens não
 * abandonados apareceram nos anos importados, virando peso 1-3 (por
 * tercil). SÓ sugere: nunca altera `SkillDef.incidence` sozinho — quem
 * decide é uma pessoa lendo o relatório (docs/31 F10.3, critério).
 */
import type { InepItemParams } from "./import-inep-params";

export interface IncidenciaEntry {
  area: string;
  habilidade: number;
  contagem: number;
  peso: 1 | 2 | 3;
}

/** Peso por tercil da distribuição de contagens (docs/30 §12.4) — determinístico, sem limiar fixo arbitrário. */
export function computeIncidence(params: InepItemParams[]): IncidenciaEntry[] {
  const naoAbandonados = params.filter((p) => !p.abandonado);
  const contagens = new Map<string, { area: string; habilidade: number; contagem: number }>();
  for (const p of naoAbandonados) {
    const chave = `${p.area}:H${p.habilidade}`;
    const atual = contagens.get(chave);
    contagens.set(chave, {
      area: p.area,
      habilidade: p.habilidade,
      contagem: (atual?.contagem ?? 0) + 1,
    });
  }

  const entradas = [...contagens.values()];
  if (entradas.length === 0) return [];

  const ordenadas = [...entradas].map((e) => e.contagem).sort((a, b) => a - b);
  const tercil1 = ordenadas[Math.floor(ordenadas.length / 3)] ?? ordenadas[0];
  const tercil2 =
    ordenadas[Math.floor((ordenadas.length * 2) / 3)] ?? ordenadas[ordenadas.length - 1];

  return entradas
    .map((e) => ({
      ...e,
      peso: (e.contagem >= tercil2 ? 3 : e.contagem >= tercil1 ? 2 : 1) as 1 | 2 | 3,
    }))
    .sort((a, b) => a.area.localeCompare(b.area) || a.habilidade - b.habilidade);
}

export function formatIncidenceReport(entradas: IncidenciaEntry[]): string {
  const linhas = [
    "# Incidência sugerida por habilidade da Matriz (docs/30 §12.4)",
    "",
    "Sugestão a partir dos parâmetros do Inep já importados — NÃO aplicada à taxonomia automaticamente. Revisar e, se aprovado, ajustar `SkillDef.incidence` manualmente via `enemSkills`.",
    "",
    "| Área | Habilidade | Nº de itens (não abandonados) | Incidência sugerida |",
    "|---|---|---|---|",
    ...entradas.map((e) => `| ${e.area} | H${e.habilidade} | ${e.contagem} | ${e.peso} |`),
  ];
  return linhas.join("\n");
}

async function main() {
  const { existsSync, readFileSync, writeFileSync } = await import("node:fs");
  const origem = "src/content/oficial/inep-parametros.json";
  if (!existsSync(origem)) {
    console.error(
      `Nada pra fazer: ${origem} não existe ainda — rode import-inep-params.ts primeiro.`,
    );
    process.exit(1);
  }
  const params = JSON.parse(readFileSync(origem, "utf-8")) as InepItemParams[];
  const entradas = computeIncidence(params);
  const relatorio = formatIncidenceReport(entradas);
  writeFileSync("content-pipeline/relatorios/incidencia.md", `${relatorio}\n`, "utf-8");
  console.log(relatorio);
}

if (import.meta.main) {
  await main();
}

#!/usr/bin/env bun
/**
 * Recalibra o `irt` DEFAULT dos itens de pacote pela dificuldade editorial
 * (docs/36 T-04.2, §G.3, RP-2).
 *
 * Problema: todo item publicado saiu com `irt = { a:1, b:0, c:0.2, source:
 * "estimado" }` (default de `publish.ts`/`import-official-items.ts`). Com `b`
 * idêntico, a informação de Fisher é a mesma em todo item e a seleção "por
 * informação" do CAT/`selectItems` degenera. Aqui cada item com o default
 * (e SEM `calibratedFrom`) passa a ter `irtFromDifficulty(difficulty,
 * exercise)` — `b` ∈ {-1,6; -0,8; 0; 0,8; 1,6} pela dificuldade editorial,
 * `c = 1/nOpções`, `source` continua "estimado" (não é calibração por dados).
 *
 * Só toca `meta.irt`. Idempotente: depois de aplicado o item deixa de ser o
 * default (exceto se o mapa devolver exatamente o default — d3 com 5
 * alternativas —, caso em que o resultado é igual e nada muda). Preserva o
 * resto do arquivo byte a byte (JSON de 2 espaços + newline final; ordem de
 * chaves mantida). Itens oficiais recebem o mesmo tratamento (só `irt`, nunca
 * texto).
 *
 * Uso:
 *   bun scripts/content/recalibrar-irt-dificuldade.ts --check   # só relata; exit 1 se houver o que mudar
 *   bun scripts/content/recalibrar-irt-dificuldade.ts           # aplica
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Exercise } from "@/lib/lessons/types";
import type { ItemIrt } from "@/content/items/types";
import { irtFromDifficulty } from "@/content/items/irt";

const BANCO_DIR = "src/content/banco";

type Dificuldade = 1 | 2 | 3 | 4 | 5;

interface ItemJson {
  id: string;
  exercise: Exercise;
  meta: { difficulty: number; irt: ItemIrt & Record<string, unknown> } & Record<string, unknown>;
}

export interface RelatorioRecalibracao {
  /** Itens com o default (candidatos). */
  comDefault: number;
  /** Itens cujo `irt` de fato muda (default != resultado do mapa). */
  alterados: number;
  /** Contagem de itens alterados por dificuldade editorial. */
  porDificuldade: Record<number, number>;
  /** Itens ignorados (dificuldade fora de 1–5). */
  ignorados: string[];
}

/** O default de publicação, exatamente — qualquer outro campo (ex.: `calibratedFrom`) tira o item do escopo. */
export function ehIrtDefault(irt: unknown): boolean {
  if (!irt || typeof irt !== "object") return false;
  const o = irt as Record<string, unknown>;
  const chaves = Object.keys(o);
  return (
    chaves.length === 4 &&
    o.a === 1 &&
    o.b === 0 &&
    o.c === 0.2 &&
    o.source === "estimado" &&
    !("calibratedFrom" in o)
  );
}

/** Aplica a recalibração no objeto parseado (muta e devolve o relatório). Pura em relação ao disco. */
export function recalibrarPacote(json: { items?: ItemJson[] }): RelatorioRecalibracao {
  const rel: RelatorioRecalibracao = { comDefault: 0, alterados: 0, porDificuldade: {}, ignorados: [] };
  for (const item of json.items ?? []) {
    if (!ehIrtDefault(item.meta?.irt)) continue;
    rel.comDefault++;
    const d = item.meta.difficulty;
    if (![1, 2, 3, 4, 5].includes(d)) {
      rel.ignorados.push(item.id);
      continue;
    }
    const novo = irtFromDifficulty(d as Dificuldade, item.exercise);
    const igual = novo.a === 1 && novo.b === 0 && novo.c === 0.2 && novo.source === "estimado";
    if (igual) continue;
    item.meta.irt = { a: novo.a, b: novo.b, c: novo.c, source: novo.source };
    rel.alterados++;
    rel.porDificuldade[d] = (rel.porDificuldade[d] ?? 0) + 1;
  }
  return rel;
}

function achaJson(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const nome of readdirSync(dir)) {
    const full = join(dir, nome);
    if (statSync(full).isDirectory()) out.push(...achaJson(full));
    else if (nome.endsWith(".json")) out.push(full);
  }
  return out.sort();
}

/** Serialização canônica dos JSON do banco (verificada: todos os 72 arquivos já são idênticos a isto). */
export function serializar(json: unknown): string {
  return JSON.stringify(json, null, 2) + "\n";
}

async function main() {
  const check = process.argv.includes("--check");
  const total: RelatorioRecalibracao = { comDefault: 0, alterados: 0, porDificuldade: {}, ignorados: [] };
  let arquivosAlterados = 0;
  let arquivosNaoCanonicos = 0;

  for (const arquivo of achaJson(BANCO_DIR)) {
    const bruto = readFileSync(arquivo, "utf-8");
    const json = JSON.parse(bruto) as { items?: ItemJson[] };
    if (serializar(json) !== bruto) arquivosNaoCanonicos++;
    const rel = recalibrarPacote(json);
    total.comDefault += rel.comDefault;
    total.alterados += rel.alterados;
    total.ignorados.push(...rel.ignorados);
    for (const [d, n] of Object.entries(rel.porDificuldade)) {
      total.porDificuldade[Number(d)] = (total.porDificuldade[Number(d)] ?? 0) + n;
    }
    if (rel.alterados === 0) continue;
    arquivosAlterados++;
    if (!check) writeFileSync(arquivo, serializar(json), "utf-8");
  }

  console.log(`[recalibrar-irt] itens com irt default: ${total.comDefault}`);
  console.log(`[recalibrar-irt] itens ${check ? "a alterar" : "alterados"}: ${total.alterados} em ${arquivosAlterados} arquivo(s)`);
  for (const d of [1, 2, 3, 4, 5]) {
    if (total.porDificuldade[d]) console.log(`  dificuldade ${d}: ${total.porDificuldade[d]}`);
  }
  if (total.ignorados.length > 0) console.warn(`[recalibrar-irt] ignorados (dificuldade inválida): ${total.ignorados.join(", ")}`);
  if (arquivosNaoCanonicos > 0) {
    console.warn(
      `[recalibrar-irt] ${arquivosNaoCanonicos} arquivo(s) não estão na forma canônica (JSON 2 espaços + newline) — o diff deles vai além de "irt".`,
    );
  }
  if (check && total.alterados > 0) process.exit(1);
}

if (import.meta.main) {
  await main();
}

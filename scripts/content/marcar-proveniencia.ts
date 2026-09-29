#!/usr/bin/env bun
/**
 * Marca COMO cada item de pacote foi revisado (docs/36 T-07.5, §G.5, RP-9): acrescenta
 * `meta.validation.reviewKind` nos JSON de `src/content/banco/**`. Só metadado de proveniência —
 * NÃO muda `status` (o pool filtra por ele: renomear despublicaria itens), elegibilidade
 * diagnóstica, enunciado, alternativas, ordem, gabarito nem `version`.
 *
 * Regra (§G.5, decidida sobre o `reviewer` real):
 * - `status === "oficial-conferida"` → `"gabarito-oficial"`;
 * - `reviewer` contém "delegada" ou "amostra" → `"ia-delegada"` (revisão por modelo, por delegação
 *   do usuário — `32` L349 — completa ou por amostra);
 * - qualquer outro caso → não inventa: fica ausente ("desconhecido") e vai pro relatório.
 *
 * Idempotente: item que já tem `reviewKind` não é tocado (valor diferente do calculado vira
 * "conflito" no relatório, nunca é sobrescrito — pode ser uma decisão humana). Preserva o resto do
 * arquivo byte a byte (JSON de 2 espaços + newline; ordem de chaves mantida; `reviewKind` entra
 * logo depois de `reviewer`).
 *
 * Uso:
 *   bun scripts/content/marcar-proveniencia.ts --check   # só relata; exit 1 se houver o que marcar (ou conflito)
 *   bun scripts/content/marcar-proveniencia.ts           # aplica
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ItemReviewKind, ItemValidationStatus } from "@/content/items/types";

const BANCO_DIR = "src/content/banco";

/** `reviewKind` que a regra de §G.5 atribui, ou `undefined` (sem regra: não inventar). */
export function reviewKindDe(status: ItemValidationStatus | string, reviewer: string | undefined): ItemReviewKind | undefined {
  if (status === "oficial-conferida") return "gabarito-oficial";
  if (reviewer && /delegada|amostra/i.test(reviewer)) return "ia-delegada";
  return undefined;
}

interface ItemJson {
  id: string;
  meta: { validation: { status: string; reviewer?: string; reviewKind?: string } & Record<string, unknown> } & Record<string, unknown>;
}

export interface RelatorioProveniencia {
  /** Itens vistos. */
  total: number;
  /** Itens que ganham (ou ganhariam, em `--check`) o `reviewKind`. */
  marcados: number;
  /** Itens que já tinham o valor certo. */
  jaMarcados: number;
  /** Itens sem regra aplicável (ficam sem `reviewKind`). */
  semRegra: string[];
  /** Itens com `reviewKind` diferente do calculado (não sobrescritos). */
  conflitos: Array<{ id: string; atual: string; calculado: string }>;
  porKind: Record<string, number>;
}

export function relatorioVazio(): RelatorioProveniencia {
  return { total: 0, marcados: 0, jaMarcados: 0, semRegra: [], conflitos: [], porKind: {} };
}

/** Marca no objeto parseado (muta) e devolve o relatório do arquivo. Pura em relação ao disco. */
export function marcarPacote(json: { items?: ItemJson[] }): RelatorioProveniencia {
  const rel = relatorioVazio();
  for (const item of json.items ?? []) {
    rel.total++;
    const v = item.meta.validation;
    const calculado = reviewKindDe(v.status, typeof v.reviewer === "string" ? v.reviewer : undefined);
    if (v.reviewKind !== undefined) {
      if (calculado !== undefined && v.reviewKind !== calculado) {
        rel.conflitos.push({ id: item.id, atual: v.reviewKind, calculado });
      } else {
        rel.jaMarcados++;
        rel.porKind[v.reviewKind] = (rel.porKind[v.reviewKind] ?? 0) + 1;
      }
      continue;
    }
    if (calculado === undefined) {
      rel.semRegra.push(item.id);
      continue;
    }
    v.reviewKind = calculado;
    rel.marcados++;
    rel.porKind[calculado] = (rel.porKind[calculado] ?? 0) + 1;
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

/** Serialização canônica dos JSON do banco (a mesma de `recalibrar-irt-dificuldade.ts`). */
export function serializar(json: unknown): string {
  return JSON.stringify(json, null, 2) + "\n";
}

async function main() {
  const check = process.argv.includes("--check");
  const total = relatorioVazio();
  let arquivosAlterados = 0;
  let arquivosNaoCanonicos = 0;

  for (const arquivo of achaJson(BANCO_DIR)) {
    const bruto = readFileSync(arquivo, "utf-8");
    const json = JSON.parse(bruto) as { items?: ItemJson[] };
    if (serializar(json) !== bruto) arquivosNaoCanonicos++;
    const rel = marcarPacote(json);
    total.total += rel.total;
    total.marcados += rel.marcados;
    total.jaMarcados += rel.jaMarcados;
    total.semRegra.push(...rel.semRegra);
    total.conflitos.push(...rel.conflitos);
    for (const [k, n] of Object.entries(rel.porKind)) total.porKind[k] = (total.porKind[k] ?? 0) + n;
    if (rel.marcados === 0) continue;
    arquivosAlterados++;
    if (!check) writeFileSync(arquivo, serializar(json), "utf-8");
  }

  console.log(`[marcar-proveniencia] itens: ${total.total}`);
  console.log(`[marcar-proveniencia] ${check ? "a marcar" : "marcados"}: ${total.marcados} em ${arquivosAlterados} arquivo(s); já marcados: ${total.jaMarcados}`);
  for (const [k, n] of Object.entries(total.porKind).sort()) console.log(`  ${k}: ${n}`);
  if (total.semRegra.length > 0) console.warn(`[marcar-proveniencia] ${total.semRegra.length} item(ns) sem regra (ficam sem reviewKind): ${total.semRegra.slice(0, 5).join(", ")}${total.semRegra.length > 5 ? "…" : ""}`);
  for (const c of total.conflitos) console.warn(`[marcar-proveniencia] conflito em ${c.id}: atual "${c.atual}", regra diz "${c.calculado}" (não sobrescrito)`);
  if (arquivosNaoCanonicos > 0) {
    console.warn(`[marcar-proveniencia] ${arquivosNaoCanonicos} arquivo(s) fora da forma canônica — o diff deles vai além de "reviewKind".`);
  }
  if (check && (total.marcados > 0 || total.conflitos.length > 0)) process.exit(1);
}

if (import.meta.main) {
  await main();
}

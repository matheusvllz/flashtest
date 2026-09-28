#!/usr/bin/env bun
/**
 * Promoção ao pool diagnóstico (docs/31 F11.6, docs/30 §12.3/§13.2) — acrescenta o
 * papel `"diagnostico"` a itens JÁ revisados item a item (`revisada-humano`),
 * espalhados por faixa de dificuldade e habilidade, até a meta por área. Não
 * gera nada novo e não tira nenhum papel existente. Determinístico: mesma
 * entrada, mesma escolha. `escolherDiagnosticos` é pura/testável.
 *
 * Uso: bun scripts/content/promover-diagnostico.ts [--por-area=24] [--dry-run]
 */
import type { ItemMeta } from "@/content/items/types";

export interface CandidatoDiagnostico {
  id: string;
  skillId: string;
  area: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: ItemMeta["validation"]["status"];
  jaDiagnostico: boolean;
}

export type Faixa = "1-2" | "3" | "4-5";
export const faixaDe = (d: number): Faixa => (d <= 2 ? "1-2" : d === 3 ? "3" : "4-5");

/** Critério de F11.6 atingido numa área? */
export function criterioF116(itens: Pick<CandidatoDiagnostico, "skillId" | "difficulty">[]): {
  ok: boolean;
  total: number;
  porFaixa: Record<Faixa, number>;
  habilidades: number;
} {
  const porFaixa: Record<Faixa, number> = { "1-2": 0, "3": 0, "4-5": 0 };
  for (const it of itens) porFaixa[faixaDe(it.difficulty)]++;
  const habilidades = new Set(itens.map((i) => i.skillId)).size;
  const ok = itens.length >= 12 && Object.values(porFaixa).every((n) => n >= 3) && habilidades >= 5;
  return { ok, total: itens.length, porFaixa, habilidades };
}

/**
 * Escolhe até `porArea` itens por área: rodízio faixa × habilidade (round-robin),
 * pra espalhar o pool em vez de concentrar numa habilidade fácil. Itens que já
 * são diagnósticos contam na meta e não são reescolhidos.
 */
export function escolherDiagnosticos(candidatos: CandidatoDiagnostico[], porArea: number): Set<string> {
  const escolhidos = new Set<string>();
  const areas = [...new Set(candidatos.map((c) => c.area))].sort();
  for (const area of areas) {
    const daArea = candidatos
      .filter((c) => c.area === area && (c.status === "revisada-humano" || c.status === "oficial-conferida"))
      .sort((a, b) => a.id.localeCompare(b.id));
    const ja = daArea.filter((c) => c.jaDiagnostico);
    const uso = new Map<string, number>();
    for (const c of ja) uso.set(c.skillId, (uso.get(c.skillId) ?? 0) + 1);
    const noPool = (c: CandidatoDiagnostico) => c.jaDiagnostico || escolhidos.has(c.id);
    const contar = (f?: Faixa) => daArea.filter((c) => noPool(c) && (!f || faixaDe(c.difficulty) === f)).length;
    /** Pega 1 item livre da faixa, sempre da habilidade menos usada até agora (espalha o pool). */
    const pegar = (faixa: Faixa): boolean => {
      const livres = daArea
        .filter((c) => !noPool(c) && faixaDe(c.difficulty) === faixa)
        .sort((a, b) => (uso.get(a.skillId) ?? 0) - (uso.get(b.skillId) ?? 0) || a.id.localeCompare(b.id));
      const prox = livres[0];
      if (!prox) return false;
      escolhidos.add(prox.id);
      uso.set(prox.skillId, (uso.get(prox.skillId) ?? 0) + 1);
      return true;
    };
    const FAIXAS: Faixa[] = ["1-2", "3", "4-5"];
    // 1º o mínimo por faixa (achado real: os diagnósticos gerados nascem todos com dificuldade 3
    // — `plan-batch` — e sozinhos lotariam a cota numa faixa só); 2º completa a cota em rodízio.
    const MIN_POR_FAIXA = 4;
    for (const faixa of FAIXAS) while (contar(faixa) < MIN_POR_FAIXA && pegar(faixa));
    // Mínimo de habilidades distintas (F11.6 pede ≥5): puxa 1 item de cada habilidade ainda fora do pool.
    const MIN_HABILIDADES = 6;
    const habsNoPool = () => new Set(daArea.filter(noPool).map((c) => c.skillId)).size;
    for (const c of [...daArea].sort((a, b) => a.id.localeCompare(b.id))) {
      if (habsNoPool() >= MIN_HABILIDADES) break;
      if (!noPool(c) && (uso.get(c.skillId) ?? 0) === 0) {
        escolhidos.add(c.id);
        uso.set(c.skillId, 1);
      }
    }
    while (contar() < porArea) {
      let algum = false;
      for (const faixa of FAIXAS) if (contar() < porArea && pegar(faixa)) algum = true;
      if (!algum) break;
    }
  }
  return escolhidos;
}

async function main() {
  const args = process.argv.slice(2);
  const porArea = Number(args.find((a) => a.startsWith("--por-area="))?.split("=")[1] ?? "24");
  const dryRun = args.includes("--dry-run");
  const { readdirSync, readFileSync, statSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { areaOfSubject } = await import("@/content/taxonomy/areas");

  const arquivos: string[] = [];
  const varrer = (d: string) => {
    for (const n of readdirSync(d)) {
      const f = join(d, n);
      if (statSync(f).isDirectory()) varrer(f);
      else if (n.endsWith(".json")) arquivos.push(f);
    }
  };
  varrer("src/content/banco");

  type Item = { id: string; meta: ItemMeta };
  const pacotes = new Map<string, { subjectId: string; items: Item[] }>();
  const candidatos: CandidatoDiagnostico[] = [];
  for (const f of arquivos) {
    const pkg = JSON.parse(readFileSync(f, "utf-8")) as { subjectId: string; items?: Item[] };
    pacotes.set(f, { subjectId: pkg.subjectId, items: pkg.items ?? [] });
    for (const it of pkg.items ?? []) {
      const area = areaOfSubject(pkg.subjectId);
      if (!area || area === "RED") continue; // redação fica fora do nivelamento (docs/30 §12.3)
      candidatos.push({
        id: it.id,
        skillId: it.meta.skillIds[0],
        area,
        difficulty: it.meta.difficulty,
        status: it.meta.validation.status,
        jaDiagnostico: it.meta.roles.includes("diagnostico"),
      });
    }
  }

  const escolhidos = escolherDiagnosticos(candidatos, porArea);
  let promovidos = 0;
  for (const [f, pkg] of pacotes) {
    let mudou = false;
    for (const it of pkg.items) {
      if (escolhidos.has(it.id) && !it.meta.roles.includes("diagnostico")) {
        it.meta.roles = [...it.meta.roles, "diagnostico"];
        mudou = true;
        promovidos++;
      }
    }
    if (mudou && !dryRun) {
      const original = JSON.parse(readFileSync(f, "utf-8"));
      writeFileSync(f, `${JSON.stringify({ ...original, items: pkg.items }, null, 2)}\n`, "utf-8");
    }
  }

  console.log(`[promover-diagnostico] ${promovidos} item(ns) promovido(s)${dryRun ? " (dry-run)" : ""}`);
  const areas = [...new Set(candidatos.map((c) => c.area))].sort();
  for (const area of areas) {
    const pool = candidatos.filter(
      (c) =>
        c.area === area &&
        (c.jaDiagnostico || escolhidos.has(c.id)) &&
        (c.status === "revisada-humano" || c.status === "oficial-conferida"),
    );
    const r = criterioF116(pool);
    console.log(
      `  ${area}: ${r.total} itens, faixas 1-2/3/4-5 = ${r.porFaixa["1-2"]}/${r.porFaixa["3"]}/${r.porFaixa["4-5"]}, ${r.habilidades} habilidades — ${r.ok ? "OK" : "ABAIXO do mínimo de F11.6"}`,
    );
  }
}

if (import.meta.main) {
  await main();
}

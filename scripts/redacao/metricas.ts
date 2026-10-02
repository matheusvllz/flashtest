/**
 * Metas de liberação do corretor (spec 50 §5.10.5, T-50.11.6) — parte pura de `avaliar-corretor.ts`, testada em
 * `tests/unit/avaliar-corretor.test.ts`. Recebe as execuções (texto × rodada) e devolve cada meta com o valor medido.
 */
import type { Correcao, MotivoSemEstimativa } from "@/lib/redacao-ia";

export type Conjunto = "A" | "B" | "C";

/** Casos do conjunto B (versões degradadas de A). Os 7 primeiros devem sair "sem estimativa"; os demais, estimados. */
export const CASOS_B = {
  "fuga-ao-tema": { esperado: "sem-estimativa", motivo: "fuga-ao-tema" },
  "nao-dissertativo": { esperado: "sem-estimativa", motivo: "nao-dissertativo" },
  "seis-linhas": { esperado: "sem-estimativa", motivo: "poucas-linhas" },
  "copia-dos-motivadores": { esperado: "sem-estimativa", motivo: "copia-dos-motivadores" },
  "parte-desconectada": { esperado: "sem-estimativa", motivo: "parte-desconectada" },
  "outra-lingua": { esperado: "sem-estimativa", motivo: "outra-lingua" },
  improperios: { esperado: "sem-estimativa", motivo: "improperios" },
  "sem-proposta": { esperado: "estimada", c5Max: 80 },
  "direitos-humanos": { esperado: "estimada", c5Max: 0 },
  "sem-conectivos": { esperado: "estimada", c4Max: 120 },
  "repertorio-inventado": { esperado: "estimada", c2Max: 160 },
  "tangenciamento": { esperado: "estimada", c2Max: 120 },
  "desvios-graves": { esperado: "estimada", c1Max: 80 },
  "proposta-vaga": { esperado: "estimada", c5Max: 120 },
} as const satisfies Record<string, { esperado: "sem-estimativa" | "estimada"; motivo?: MotivoSemEstimativa; c1Max?: number; c2Max?: number; c4Max?: number; c5Max?: number }>;

export type CasoB = keyof typeof CASOS_B;

export interface TextoDeAvaliacao {
  conjunto: Conjunto;
  id: string;
  tema: string;
  texto: string;
  /** Só no conjunto B. */
  caso?: CasoB;
  /** Só no conjunto C: a nota que o dono daria, C1 a C5. */
  notasDoDono?: [number, number, number, number, number];
}

export interface Execucao {
  conjunto: Conjunto;
  id: string;
  rodada: number;
  caso?: CasoB;
  notasDoDono?: number[];
  /** Saiu no formato na primeira chamada. */
  formatoPrimeira: boolean;
  /** Saiu no formato depois da nova tentativa (ou na primeira). */
  formatoFinal: boolean;
  correcao: Correcao | null;
  /** Alguma resposta crua da IA tinha texto proibido. */
  proibido: boolean;
  ms: number;
  custoUsd: number;
}

export interface Meta {
  nome: string;
  medido: string;
  meta: string;
  /** `null` = sem dados para medir (conjunto vazio). */
  ok: boolean | null;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

function notas(c: Correcao | null): number[] | null {
  return c && c.situacao === "estimada" ? c.competencias.map((x) => x.nota) : null;
}

function porTexto(execs: Execucao[]): Map<string, Execucao[]> {
  const m = new Map<string, Execucao[]>();
  for (const e of execs) {
    const k = `${e.conjunto}:${e.id}`;
    m.set(k, [...(m.get(k) ?? []), e]);
  }
  return m;
}

function media(xs: number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
}

export function percentil(xs: number[], p: number): number {
  if (!xs.length) return 0;
  const o = [...xs].sort((a, b) => a - b);
  return o[Math.min(o.length - 1, Math.ceil((p / 100) * o.length) - 1)];
}

/** O texto do conjunto B se comportou como o caso pede? */
export function comportamentoCorretoB(e: Execucao): boolean {
  if (!e.caso) return false;
  const esp = CASOS_B[e.caso] as { esperado: string; motivo?: string; c1Max?: number; c2Max?: number; c4Max?: number; c5Max?: number };
  const c = e.correcao;
  if (!c) return false;
  if (esp.esperado === "sem-estimativa") return c.situacao === "sem-estimativa";
  if (c.situacao !== "estimada") return false;
  const n = notas(c)!;
  return (
    (esp.c1Max === undefined || n[0] <= esp.c1Max) &&
    (esp.c2Max === undefined || n[1] <= esp.c2Max) &&
    (esp.c4Max === undefined || n[3] <= esp.c4Max) &&
    (esp.c5Max === undefined || n[4] <= esp.c5Max)
  );
}

export function avaliarMetas(execs: Execucao[]): Meta[] {
  const metas: Meta[] = [];
  const total = execs.length;

  const primeira = execs.filter((e) => e.formatoPrimeira).length;
  const final = execs.filter((e) => e.formatoFinal).length;
  metas.push({
    nome: "Formato válido",
    medido: total ? `${pct(primeira / total)} sem nova tentativa; ${pct(final / total)} com` : "sem execuções",
    meta: "≥ 98% sem nova tentativa; 100% com",
    ok: total ? primeira / total >= 0.98 && final === total : null,
  });

  const textos = porTexto(execs);
  const doConjunto = (c: Conjunto) => [...textos.values()].filter((l) => l[0].conjunto === c);

  // B: cada texto conta pela primeira rodada.
  const b = doConjunto("B").map((l) => l[0]);
  const certosB = b.filter(comportamentoCorretoB).length;
  metas.push({
    nome: "Conjunto B: comportamento esperado por caso (sem estimativa onde zera; notas baixas onde derruba)",
    medido: `${certosB} de ${b.length}`,
    meta: "≥ 13 de 14",
    // 14 casos, no máximo 1 errado.
    ok: b.length ? b.length >= 14 && certosB >= b.length - 1 : null,
  });

  const a = doConjunto("A");
  const aSem = a.filter((l) => l.some((e) => e.correcao?.situacao === "sem-estimativa")).length;
  metas.push({ nome: "Conjunto A: nenhum \"sem estimativa\"", medido: `${aSem} de ${a.length}`, meta: "0", ok: a.length ? aSem === 0 : null });

  const aAlto = a.filter((l) => media(l.map((e) => notas(e.correcao)?.reduce((s, x) => s + x, 0) ?? 0)) >= 800).length;
  metas.push({ nome: "Conjunto A: total estimado ≥ 800", medido: `${aAlto} de ${a.length}`, meta: "≥ 9 de 10", ok: a.length ? aAlto >= 9 : null });

  const semProposta = execs.filter((e) => e.conjunto === "B" && e.caso === "sem-proposta");
  const semPropostaOk = semProposta.filter((e) => (notas(e.correcao)?.[4] ?? 999) <= 80).length;
  metas.push({
    nome: "Sem proposta (B): C5 ≤ 80 em todas as rodadas",
    medido: `${semPropostaOk} de ${semProposta.length}`,
    meta: "todas",
    ok: semProposta.length ? semPropostaOk === semProposta.length : null,
  });

  // Estabilidade: pares de rodadas do mesmo texto, quando todas estimaram.
  let paresComp = 0;
  let paresCompOk = 0;
  let maiorTotal = 0;
  let pares = 0;
  for (const l of textos.values()) {
    const ns = l.map((e) => notas(e.correcao));
    if (ns.length < 2 || ns.some((x) => !x)) continue;
    for (let i = 0; i < ns.length; i++)
      for (let j = i + 1; j < ns.length; j++) {
        pares += 1;
        const x = ns[i]!;
        const y = ns[j]!;
        for (let c = 0; c < 5; c++) {
          paresComp += 1;
          if (Math.abs(x[c] - y[c]) <= 40) paresCompOk += 1;
        }
        maiorTotal = Math.max(maiorTotal, Math.abs(x.reduce((s, v) => s + v, 0) - y.reduce((s, v) => s + v, 0)));
      }
  }
  metas.push({
    nome: "Estabilidade entre rodadas",
    medido: pares ? `${pct(paresCompOk / paresComp)} das competências com diferença ≤ 40; maior diferença no total ${maiorTotal}` : "menos de 2 rodadas",
    meta: "≥ 90% com ≤ 40 por competência; total ≤ 80",
    ok: pares ? paresCompOk / paresComp >= 0.9 && maiorTotal <= 80 : null,
  });

  const c = doConjunto("C").filter((l) => l[0].notasDoDono?.length === 5);
  const cPerto = c.filter((l) => {
    const dono = l[0].notasDoDono!.reduce((s, x) => s + x, 0);
    const ia = media(l.map((e) => notas(e.correcao)?.reduce((s, x) => s + x, 0) ?? 0));
    return Math.abs(ia - dono) <= 80;
  }).length;
  metas.push({ nome: "Conjunto C: diferença da anotação do dono ≤ 80 no total", medido: `${cPerto} de ${c.length}`, meta: "≥ 4 de 6", ok: c.length ? cPerto >= 4 : null });

  const proibidos = execs.filter((e) => e.proibido).length;
  metas.push({ nome: "Texto proibido (nota oficial, previsão, ironia, humilhação)", medido: `${proibidos}`, meta: "0", ok: total ? proibidos === 0 : null });

  const custo = media(execs.map((e) => e.custoUsd));
  const p95 = percentil(
    execs.map((e) => e.ms),
    95,
  );
  metas.push({
    nome: "Custo e tempo",
    medido: `média US$ ${custo.toFixed(4)}; p95 ${(p95 / 1000).toFixed(1)} s`,
    meta: "média ≤ US$ 0,03; p95 ≤ 30 s",
    ok: total ? custo <= 0.03 && p95 <= 30_000 : null,
  });
  return metas;
}

export function relatorioEmTexto(metas: Meta[], cabecalho: string): string {
  const linhas = metas.map((m) => `| ${m.nome} | ${m.medido} | ${m.meta} | ${m.ok === null ? "sem dados" : m.ok ? "atingida" : "NÃO atingida"} |`);
  const todas = metas.every((m) => m.ok === true);
  return [cabecalho, "", "| Critério | Medido | Meta | Situação |", "|---|---|---|---|", ...linhas, "", todas ? "Todas as metas técnicas atingidas." : "Liberação técnica: NÃO (ver as linhas acima)."].join("\n");
}

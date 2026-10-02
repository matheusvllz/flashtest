/**
 * Metas de liberação do corretor (spec 50 §5.10.5, T-50.11.6): a conta das métricas de `scripts/redacao/metricas.ts`.
 * A avaliação real exige a chave da OpenAI e roda à parte; aqui só a aritmética, com execuções inventadas.
 */
import { describe, expect, test } from "bun:test";
import type { Correcao } from "@/lib/redacao-ia";
import { avaliarMetas, CASOS_B, comportamentoCorretoB, percentil, type CasoB, type Execucao } from "../../scripts/redacao/metricas";

function estimada(n: number[]): Correcao {
  return {
    versao: 2,
    situacao: "estimada",
    motivo: null,
    competencias: n.map((nota, i) => ({ c: (i + 1) as 1, nota, justificativa: "j", trecho: null, paraSubir: "a" })),
    total: n.reduce((s, x) => s + x, 0),
    comentario: "",
    oQueMudar: null,
    direitosHumanosViolados: false,
  };
}
const sem: Correcao = { ...estimada([0, 0, 0, 0, 0]), situacao: "sem-estimativa", motivo: "fuga-ao-tema", competencias: [], total: null };

function ex(over: Partial<Execucao>): Execucao {
  return { conjunto: "A", id: "x", rodada: 1, formatoPrimeira: true, formatoFinal: true, correcao: estimada([200, 160, 160, 160, 160]), proibido: false, ms: 5000, custoUsd: 0.015, ...over };
}

const meta = (ms: ReturnType<typeof avaliarMetas>, nome: string) => ms.find((m) => m.nome.startsWith(nome))!;

describe("métricas do corretor", () => {
  test("cenário que passa em tudo", () => {
    const execs: Execucao[] = [];
    for (let r = 1; r <= 3; r++) {
      for (let i = 0; i < 10; i++) execs.push(ex({ id: `a${i}`, rodada: r }));
      (Object.keys(CASOS_B) as CasoB[]).forEach((caso, i) => {
        const espera = CASOS_B[caso].esperado;
        execs.push(ex({ conjunto: "B", id: `b${i}`, rodada: r, caso, correcao: espera === "sem-estimativa" ? sem : estimada([80, 80, 80, 80, 0]) }));
      });
      for (let i = 0; i < 6; i++) execs.push(ex({ conjunto: "C", id: `c${i}`, rodada: r, notasDoDono: [160, 160, 160, 160, 160], correcao: estimada([160, 160, 160, 120, 160]) }));
    }
    const ms = avaliarMetas(execs);
    expect(ms.filter((m) => m.ok !== true).map((m) => m.nome)).toEqual([]);
  });

  test("formato: 97% sem nova tentativa não passa; uma falha final também não", () => {
    const execs = Array.from({ length: 100 }, (_, i) => ex({ id: `a${i}`, formatoPrimeira: i >= 3 }));
    expect(meta(avaliarMetas(execs), "Formato").ok).toBe(false);
    execs[0] = ex({ id: "a0", formatoPrimeira: true, formatoFinal: false, correcao: null });
    expect(meta(avaliarMetas(execs.map((e) => ({ ...e, formatoPrimeira: true }))), "Formato").ok).toBe(false);
  });

  test("conjunto B: comportamento por caso; A com 'sem estimativa' reprova", () => {
    expect(comportamentoCorretoB(ex({ conjunto: "B", caso: "fuga-ao-tema", correcao: sem }))).toBe(true);
    expect(comportamentoCorretoB(ex({ conjunto: "B", caso: "fuga-ao-tema", correcao: estimada([80, 80, 80, 80, 80]) }))).toBe(false);
    expect(comportamentoCorretoB(ex({ conjunto: "B", caso: "sem-proposta", correcao: estimada([160, 160, 160, 160, 120]) }))).toBe(false);
    expect(comportamentoCorretoB(ex({ conjunto: "B", caso: "direitos-humanos", correcao: estimada([160, 160, 160, 160, 0]) }))).toBe(true);
    expect(meta(avaliarMetas([ex({ correcao: sem })]), "Conjunto A: nenhum").ok).toBe(false);
  });

  test("estabilidade: diferença de 80 no total entre rodadas passa; 120 não", () => {
    const ok = [ex({ rodada: 1, correcao: estimada([160, 160, 160, 160, 160]) }), ex({ rodada: 2, correcao: estimada([200, 200, 160, 160, 160]) })];
    expect(meta(avaliarMetas(ok), "Estabilidade").ok).toBe(true);
    const ruim = [ex({ rodada: 1, correcao: estimada([160, 160, 160, 160, 160]) }), ex({ rodada: 2, correcao: estimada([200, 200, 200, 160, 160]) })];
    expect(meta(avaliarMetas(ruim), "Estabilidade").ok).toBe(false);
  });

  test("custo, p95 e texto proibido", () => {
    expect(percentil([1, 2, 3, 4, 100], 95)).toBe(100);
    expect(meta(avaliarMetas([ex({ custoUsd: 0.05 })]), "Custo").ok).toBe(false);
    expect(meta(avaliarMetas([ex({ ms: 31_000 })]), "Custo").ok).toBe(false);
    expect(meta(avaliarMetas([ex({ proibido: true })]), "Texto proibido").ok).toBe(false);
  });
});

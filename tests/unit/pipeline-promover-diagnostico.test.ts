import { describe, expect, test } from "bun:test";
import {
  criterioF116,
  escolherDiagnosticos,
  type CandidatoDiagnostico,
} from "../../scripts/content/promover-diagnostico";

function item(id: string, skillId: string, difficulty: 1 | 2 | 3 | 4 | 5, extra: Partial<CandidatoDiagnostico> = {}): CandidatoDiagnostico {
  return { id, skillId, area: "MT", difficulty, status: "revisada-humano", jaDiagnostico: false, ...extra };
}

describe("promover-diagnostico (docs/31 F11.6)", () => {
  const pool: CandidatoDiagnostico[] = [];
  for (let s = 1; s <= 6; s++)
    for (const d of [1, 2, 3, 3, 4, 5] as const) pool.push(item(`i-${s}-${d}-${pool.length}`, `mat:h${s}`, d));

  test("atinge o critério: ≥12 itens, ≥3 por faixa, ≥5 habilidades", () => {
    const escolhidos = escolherDiagnosticos(pool, 18);
    const selecionados = pool.filter((p) => escolhidos.has(p.id));
    const r = criterioF116(selecionados);
    expect(r.ok).toBe(true);
    expect(r.total).toBe(18);
  });

  test("não promove item que não passou por revisão humana", () => {
    const soIA = pool.map((p) => ({ ...p, status: "verificada-ia" as const }));
    expect(escolherDiagnosticos(soIA, 18).size).toBe(0);
  });

  test("é determinístico", () => {
    expect([...escolherDiagnosticos(pool, 12)]).toEqual([...escolherDiagnosticos([...pool].reverse(), 12)]);
  });

  test("itens que já são diagnóstico contam na meta", () => {
    const comJa = pool.map((p, i) => (i < 10 ? { ...p, jaDiagnostico: true } : p));
    const escolhidos = escolherDiagnosticos(comJa, 12);
    const r = criterioF116(comJa.filter((p) => p.jaDiagnostico || escolhidos.has(p.id)));
    expect(r.ok).toBe(true);
  });

  test("diagnósticos pré-existentes todos na dificuldade 3 não impedem o mínimo nas outras faixas", () => {
    const tudo3 = pool.map((p) => (p.difficulty === 3 ? { ...p, jaDiagnostico: true } : p));
    const escolhidos = escolherDiagnosticos(tudo3, 12);
    const r = criterioF116(tudo3.filter((p) => p.jaDiagnostico || escolhidos.has(p.id)));
    expect(r.porFaixa["1-2"]).toBeGreaterThanOrEqual(3);
    expect(r.porFaixa["4-5"]).toBeGreaterThanOrEqual(3);
  });
});

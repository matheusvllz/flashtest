/**
 * Simulado — composição pura (spec 50 §5.9.4, T-50.10.2/10.3).
 */
import { describe, expect, test } from "bun:test";
import {
  composicaoDaProva,
  composicaoMini,
  composicaoNivel,
  montarResultado,
  provasDisponiveis,
  semanaDe,
  simuladoTemConteudo,
  type AreaEnem,
  type ItemDeSimulado,
} from "@/lib/simulado";
import { itensOficiais } from "@/server/estudo/conteudo";

function itens(ano: number, area: AreaEnem, n: number, dia: 1 | 2 = 1): ItemDeSimulado[] {
  return Array.from({ length: n }, (_, i) => ({ id: `o:${ano}:${area}:${i}`, ano, dia, numero: 100 - i, area, skillIds: [`h${i % 5}`] }));
}

describe("provas oficiais", () => {
  test("só oferece ano × área com 30+ questões, do ano mais recente para o mais antigo", () => {
    const lista = [...itens(2023, "MT", 45), ...itens(2024, "MT", 29), ...itens(2024, "LC", 40)];
    expect(provasDisponiveis(lista)).toEqual([
      { ano: 2024, area: "LC", questoes: 40 },
      { ano: 2023, area: "MT", questoes: 45 },
    ]);
  });
  test("a prova sai na ordem original do caderno", () => {
    const ids = composicaoDaProva(itens(2023, "MT", 5), 2023, "MT");
    expect(ids).toEqual(["o:2023:MT:4", "o:2023:MT:3", "o:2023:MT:2", "o:2023:MT:1", "o:2023:MT:0"]);
  });
  test("o simulado completo só liga com 3 provas por área", () => {
    const tres = (["LC", "CH", "CN", "MT"] as const).flatMap((a) => [2022, 2023, 2024].flatMap((y) => itens(y, a, 30)));
    expect(simuladoTemConteudo(tres)).toBe(true);
    expect(simuladoTemConteudo(tres.filter((i) => !(i.area === "CN" && i.ano === 2022)))).toBe(false);
  });
});

describe("nível ENEM e mini", () => {
  const banco = [2022, 2023, 2024].flatMap((y) => itens(y, "CH", 30));
  test("nível ENEM: 45 questões da área, inéditas primeiro, espalhadas pelas habilidades", () => {
    const vistos = new Set(banco.slice(0, 50).map((i) => i.id));
    const ids = composicaoNivel(banco, "CH", vistos, "s1");
    expect(ids.length).toBe(45);
    expect(new Set(ids).size).toBe(45);
    expect(ids.slice(0, 40).every((i) => !vistos.has(i))).toBe(true);
    const primeiras = ids.slice(0, 5).map((i) => banco.find((b) => b.id === i)!.skillIds[0]);
    expect(new Set(primeiras).size).toBe(5);
  });
  test("mini: 4/4/4/3 por área, igual para todos na mesma semana e diferente na seguinte", () => {
    const todos = (["LC", "CH", "CN", "MT"] as const).flatMap((a) => itens(2024, a, 30));
    const a = composicaoMini(todos, "2026-10-12");
    expect(a.length).toBe(15);
    expect(a.filter((i) => i.includes(":MT:")).length).toBe(3);
    expect(composicaoMini(todos, "2026-10-12")).toEqual(a);
    expect(composicaoMini(todos, "2026-10-19")).not.toEqual(a);
    expect(semanaDe("2026-10-18")).toBe("2026-10-12");
    expect(semanaDe("2026-10-12")).toBe("2026-10-12");
  });
});

test("resultado: acertos por área, habilidades a revisar e respondidas", () => {
  const r = montarResultado(
    [
      { id: "a", area: "MT", skillId: "h1", correta: false, respondida: true },
      { id: "b", area: "MT", skillId: "h1", correta: false, respondida: false },
      { id: "c", area: "LC", skillId: "h2", correta: true, respondida: true },
      { id: "d", area: "LC", skillId: "h3", correta: false, respondida: true },
    ],
    1000,
  );
  expect(r).toMatchObject({ total: 4, respondidas: 3, acertos: 1, revisar: ["h1", "h3"] });
  expect(r.porArea).toEqual([
    { area: "LC", acertos: 1, total: 2 },
    { area: "MT", acertos: 0, total: 2 },
  ]);
});

test("acervo real: itens oficiais com área pelo número e o simulado completo tem conteúdo", () => {
  const of = itensOficiais();
  expect(of.length).toBeGreaterThan(500);
  for (const i of of.slice(0, 50)) expect(["LC", "CH", "CN", "MT"]).toContain(i.area);
  expect(simuladoTemConteudo(of)).toBe(true);
});

import { describe, expect, test } from "bun:test";
import { humanizeGuard, extractInvariants } from "../../scripts/content/humanize-guard";

/**
 * Guarda de invariantes do Humanizer (docs/30 §19.4, Fase 9 F9.7).
 */

describe("humanizeGuard — aceita reestruturação sem mudar invariantes", () => {
  test("caso real de porcentagem: reordenar a frase sem mudar números", () => {
    const antes = "20% de 300 é igual a 60. Basta multiplicar 300 por 0,20.";
    const depois = "Multiplicando 300 por 0,20 chegamos a 60 — que é exatamente 20% de 300.";
    const r = humanizeGuard(antes, depois);
    expect(r.accepted).toBe(true);
  });

  test("caso real de crase: trocar conectivo sem mudar a regra", () => {
    const antes = "Não se usa crase antes de palavra masculina, exceto em expressões fixas.";
    const depois = "Antes de palavra masculina, a crase não é usada — exceto em expressões fixas.";
    const r = humanizeGuard(antes, depois);
    expect(r.accepted).toBe(true);
  });

  test("sinônimo simples sem número nenhum envolvido", () => {
    const r = humanizeGuard("A resposta correta explica o motivo.", "A alternativa certa explica o porquê.");
    expect(r.accepted).toBe(true);
  });
});

describe("humanizeGuard — rejeita mudança de invariante", () => {
  test("muda o número", () => {
    const r = humanizeGuard("20% de 300 é 60.", "20% de 300 é 65.");
    expect(r.accepted).toBe(false);
    expect(r.rejectedBecause).toContain("números");
  });

  test("muda a unidade", () => {
    const r = humanizeGuard("A velocidade é 60 km/h.", "A velocidade é 60 m/s.");
    expect(r.accepted).toBe(false);
    expect(r.rejectedBecause).toContain("unidades");
  });

  test("remove uma negação", () => {
    const r = humanizeGuard("Não se usa crase antes de verbo.", "Se usa crase antes de verbo.");
    expect(r.accepted).toBe(false);
    expect(r.rejectedBecause).toContain("negações");
  });

  test("troca um nome próprio", () => {
    const r = humanizeGuard("Segundo Machado de Assis, a ironia é central.", "Segundo José de Alencar, a ironia é central.");
    expect(r.accepted).toBe(false);
    expect(r.rejectedBecause).toContain("nomes próprios");
  });

  test("muda uma fração", () => {
    const r = humanizeGuard("Metade equivale a 1/2 do total.", "Metade equivale a 1/3 do total.");
    expect(r.accepted).toBe(false);
    expect(r.rejectedBecause).toContain("frações");
  });

  test("muda uma data", () => {
    const r = humanizeGuard("Essa questão é do ENEM 2019.", "Essa questão é do ENEM 2020.");
    expect(r.accepted).toBe(false);
    expect(r.rejectedBecause).toContain("datas");
  });

  test("muda uma fórmula", () => {
    const r = humanizeGuard("Aplicando v = v0 + a*t chegamos ao resultado.", "Aplicando v = v0 - a*t chegamos ao resultado.");
    expect(r.accepted).toBe(false);
    expect(r.rejectedBecause).toContain("fórmulas");
  });

  test("relatório de rejeição lista TODAS as categorias que mudaram, não só a primeira", () => {
    const r = humanizeGuard("20% é 60, não é 70.", "25% é 65, é 70.");
    expect(r.accepted).toBe(false);
    expect(r.rejectedBecause!.length).toBeGreaterThan(1);
  });
});

describe("extractInvariants", () => {
  test("normaliza vírgula decimal e ponto decimal como o mesmo número", () => {
    const a = extractInvariants("O valor é 0,5.");
    const b = extractInvariants("O valor é 0.5.");
    expect(a.numeros).toEqual(b.numeros);
  });
});

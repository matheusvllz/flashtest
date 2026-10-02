import { describe, expect, test } from "bun:test";
import {
  BENEFICIOS,
  CODIGOS_DE_PRODUTO,
  ehCodigoDeProduto,
  formatarReais,
  MINIMO_COBRANCA_CENTAVOS,
  planoMaior,
  PRODUTOS,
  resumoDoAnual,
  temFuncao,
  VIDAS_POR_DIA,
} from "@/lib/planos";

/** Catálogo de planos (spec 49 §5.1, D49-01/05/07/10): os valores aprovados em 02/10/2026, num lugar só. */
describe("preços aprovados", () => {
  test("mensais e anuais", () => {
    expect(formatarReais(PRODUTOS.basic_mensal.centavos)).toBe("R$ 24,90");
    expect(formatarReais(PRODUTOS.pro_mensal.centavos)).toBe("R$ 39,90");
    expect(formatarReais(PRODUTOS.basic_anual.centavos)).toBe("R$ 209,90");
    expect(formatarReais(PRODUTOS.pro_anual.centavos)).toBe("R$ 329,90");
  });

  test("anual: equivalente mensal e desconto sobre 12 mensais (§5.1)", () => {
    expect(resumoDoAnual("basic")).toEqual({ totalCentavos: 20990, porMesCentavos: 1749, descontoPct: 29.8 });
    expect(resumoDoAnual("pro")).toEqual({ totalCentavos: 32990, porMesCentavos: 2749, descontoPct: 31.1 });
  });

  test("protetores avulsos e o mínimo do Asaas (R$ 5,00)", () => {
    expect([PRODUTOS.protetor_1, PRODUTOS.protetor_3, PRODUTOS.protetor_7].map((p) => formatarReais(p.centavos))).toEqual([
      "R$ 5,90",
      "R$ 12,90",
      "R$ 24,90",
    ]);
    for (const c of CODIGOS_DE_PRODUTO) expect(PRODUTOS[c].centavos).toBeGreaterThanOrEqual(MINIMO_COBRANCA_CENTAVOS);
  });

  test("código de produto só do catálogo", () => {
    expect(ehCodigoDeProduto("pro_mensal")).toBe(true);
    expect(ehCodigoDeProduto("pro_gratis")).toBe(false);
    expect(ehCodigoDeProduto(1)).toBe(false);
  });
});

describe("benefícios por plano", () => {
  test("anúncios só no Free; vidas ilimitadas no Basic e no Pro; 5 vidas por dia", () => {
    expect([BENEFICIOS.gratis.anuncios, BENEFICIOS.basic.anuncios, BENEFICIOS.pro.anuncios]).toEqual([true, false, false]);
    expect([BENEFICIOS.gratis.vidasIlimitadas, BENEFICIOS.basic.vidasIlimitadas, BENEFICIOS.pro.vidasIlimitadas]).toEqual([false, true, true]);
    expect(VIDAS_POR_DIA).toBe(5);
  });

  test("Foca IA e protetores (D49-10, D49-05)", () => {
    expect([BENEFICIOS.gratis.iaMensagensDia, BENEFICIOS.basic.iaMensagensDia, BENEFICIOS.pro.iaMensagensDia]).toEqual([3, 15, 30]);
    expect([BENEFICIOS.basic.iaFotosDia, BENEFICIOS.pro.iaFotosDia]).toEqual([3, 8]);
    expect([BENEFICIOS.basic.iaUsoJustoMes, BENEFICIOS.pro.iaUsoJustoMes]).toEqual([300, 500]);
    expect([BENEFICIOS.gratis.protetoresEstoqueMax, BENEFICIOS.basic.protetoresEstoqueMax, BENEFICIOS.pro.protetoresEstoqueMax]).toEqual([2, 4, 7]);
    expect([BENEFICIOS.basic.protetoresBonusMes, BENEFICIOS.pro.protetoresBonusMes]).toEqual([2, 5]);
  });

  test("funções pagas: Basic tem caderno, cronograma e estudo sem internet; o Pro tem todas", () => {
    expect(temFuncao("gratis", "cadernoDeErros")).toBe(false);
    for (const f of ["cadernoDeErros", "cronograma", "semInternet"] as const) expect(temFuncao("basic", f)).toBe(true);
    for (const f of ["simulado", "explicaOutroJeito", "treinoRedacao", "corretorRedacao"] as const) {
      expect(temFuncao("basic", f)).toBe(false);
      expect(temFuncao("pro", f)).toBe(true);
    }
    expect(BENEFICIOS.pro.correcoesRedacaoMes).toBe(10);
  });

  test("com mais de um plano válido, vale o maior", () => {
    expect(planoMaior("basic", "pro")).toBe("pro");
    expect(planoMaior("pro", "gratis")).toBe("pro");
    expect(planoMaior("gratis", "basic")).toBe("basic");
  });
});

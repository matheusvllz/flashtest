import { describe, expect, test } from "bun:test";
import { escolherCelebracao, momentoDoMarco } from "@/lib/celebracao";
import { PRIORIDADE_FECHAMENTO, SOUND_ASSETS } from "@/lib/audio/identity";
import {
  LOJA,
  MARCOS_DE_OFENSIVA,
  conteudoDoBau,
  ehMarcoDeOfensiva,
  itemDaLoja,
  podeComprar,
  type SituacaoParaCompra,
} from "@/lib/perolas";
import { readFileSync } from "node:fs";

describe("celebração (spec 50 §5.12.3)", () => {
  test("um momento principal, selos para o resto, um som", () => {
    const c = escolherCelebracao(["missoes", "nivel", "perfeita", "ofensiva-acesa"]);
    expect(c.principal).toBe("nivel");
    expect(c.selos).toEqual(["perfeita", "missoes", "ofensiva-acesa"]);
    expect(c.som).toBe("level-up");
  });

  test("marco de ofensiva vence o nível; marco de 100+ é especial", () => {
    expect(escolherCelebracao(["nivel", "marco"]).principal).toBe("marco");
    expect(momentoDoMarco(30)).toBe("marco");
    expect(momentoDoMarco(100)).toBe("especial");
  });

  test("sem nada especial, a conclusão da lição", () => {
    expect(escolherCelebracao([])).toEqual({ principal: "licao", selos: [], som: "conclusao-licao" });
  });

  test("ordem do som de fechamento: marco acima do nível (C-SOM-2 revista pela 50)", () => {
    expect(PRIORIDADE_FECHAMENTO.indexOf("marco-streak")).toBeLessThan(PRIORIDADE_FECHAMENTO.indexOf("level-up"));
    expect(PRIORIDADE_FECHAMENTO[0]).toBe("recompensa-especial");
    expect(new Set(PRIORIDADE_FECHAMENTO).size).toBe(PRIORIDADE_FECHAMENTO.length);
    for (const s of PRIORIDADE_FECHAMENTO) expect(SOUND_ASSETS[s]).toBeTruthy();
  });
});

const BASE: SituacaoParaCompra = {
  saldo: 1000,
  plano: "gratis",
  protetores: 0,
  protetoresMax: 2,
  vidasLigadas: true,
  vidasRestantes: 1,
  vidasMax: 5,
  recargasHoje: 0,
  possui: new Set(),
};

describe("Pérolas (spec 50 §5.3)", () => {
  test("loja: protetor respeita o estoque do plano", () => {
    expect(podeComprar(itemDaLoja("protetor"), BASE)).toBeNull();
    expect(podeComprar(itemDaLoja("protetor"), { ...BASE, protetores: 2 })).toBe("ESTOQUE_CHEIO");
  });

  test("loja: recarga só no Free com vidas, uma por dia, e não com vidas cheias", () => {
    expect(podeComprar(itemDaLoja("recarga-vidas"), BASE)).toBeNull();
    expect(podeComprar(itemDaLoja("recarga-vidas"), { ...BASE, plano: "basic" })).toBe("SEM_VIDAS_NO_PLANO");
    expect(podeComprar(itemDaLoja("recarga-vidas"), { ...BASE, vidasLigadas: false })).toBe("SEM_VIDAS_NO_PLANO");
    expect(podeComprar(itemDaLoja("recarga-vidas"), { ...BASE, recargasHoje: 1 })).toBe("RECARGA_JA_USADA_HOJE");
    expect(podeComprar(itemDaLoja("recarga-vidas"), { ...BASE, vidasRestantes: 5 })).toBe("VIDAS_CHEIAS");
  });

  test("loja: saldo, item único e item desconhecido", () => {
    expect(podeComprar(itemDaLoja("roupa:coroa-conchas"), { ...BASE, saldo: 899 })).toBe("SALDO_INSUFICIENTE");
    expect(podeComprar(itemDaLoja("roupa:bone"), { ...BASE, possui: new Set(["roupa:bone"]) })).toBe("JA_POSSUI");
    expect(podeComprar(itemDaLoja("xp-em-dobro"), BASE)).toBe("ITEM_DESCONHECIDO");
  });

  test("a loja nunca vende aprendizagem nem ofensiva", () => {
    const tipos = new Set(LOJA.map((i) => i.tipo));
    expect([...tipos].sort()).toEqual(["protetor", "recarga", "roupa", "tema"]);
    expect(LOJA.some((i) => /xp|dia|pular|liga|cota|consert/i.test(i.id))).toBe(false);
  });

  test("baú de marco tem conteúdo fixo e conhecido", () => {
    for (const d of MARCOS_DE_OFENSIVA) expect(conteudoDoBau(d)).toEqual(conteudoDoBau(d));
    expect(conteudoDoBau(30)).toEqual({ perolas: 150, item: "roupa:cachecol" });
    expect(conteudoDoBau(8)).toBeNull();
    expect(ehMarcoDeOfensiva(500)).toBe(true);
    expect(ehMarcoDeOfensiva(450)).toBe(false);
  });

  test("nenhuma regra de ganho lê tempo de uso (RF-9)", () => {
    const fonte = readFileSync("src/lib/perolas.ts", "utf8");
    expect(/duracao|minutos|tempoDeUso|durationMs/i.test(fonte.replace(/\/\*[\s\S]*?\*\//g, ""))).toBe(false);
    expect(/Math\.random/.test(fonte)).toBe(false);
  });
});

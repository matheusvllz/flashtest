import { describe, expect, test } from "bun:test";
import {
  verify,
  resolveEscalation,
  CONFIANCA_MINIMA,
  balancearPosicaoGabarito,
  rotulaAfirmacoes,
} from "../../scripts/content/verify";

describe("balancearPosicaoGabarito", () => {
  const ex = { opcoes: ["certa", "b", "c", "d"], correta: 0 };

  test("mantém a mesma alternativa certa, só muda a posição", () => {
    for (const id of ["l-1", "l-2", "l-3", "l-4", "l-5"]) {
      const r = balancearPosicaoGabarito(ex, id);
      expect(r.opcoes[r.correta]).toBe("certa");
      expect([...r.opcoes].sort()).toEqual([...ex.opcoes].sort());
    }
  });

  test("é determinístico por candidateId", () => {
    expect(balancearPosicaoGabarito(ex, "lote-7")).toEqual(balancearPosicaoGabarito(ex, "lote-7"));
  });

  test("letras citadas na explicação acompanham o giro das alternativas", () => {
    const comLetra = {
      opcoes: ["certa", "b", "c", "d"],
      correta: 0,
      explicacao: "A alternativa A está certa; (B) e C) erram. Alelo C = cinzento não é alternativa.",
    };
    for (const id of ["l-1", "l-2", "l-3", "l-4", "l-5", "l-6"]) {
      const r = balancearPosicaoGabarito(comLetra, id);
      const letraCerta = "ABCD"[r.correta];
      expect(r.explicacao).toContain(`alternativa ${letraCerta} está certa`);
      expect(r.explicacao).toContain("Alelo C = cinzento");
    }
  });

  test("espalha o gabarito entre as 4 posições num lote grande", () => {
    const contagem = [0, 0, 0, 0];
    for (let i = 1; i <= 200; i++) contagem[balancearPosicaoGabarito(ex, `onda1-01-${i}`).correta]++;
    for (const n of contagem) expect(n).toBeGreaterThan(30);
  });
});

/**
 * Afirmações rotuladas (achado real da repescagem, docs/32 L365; portado na T-07.6 do docs/36): quando
 * o enunciado rotula sentenças com (A)/(B)/(C)/(D) e as alternativas respondem "Somente A"/"C e D",
 * as letras da explicação são rótulos do TEXTO — o rebalanceamento gira as alternativas mas não pode
 * remapear essas letras.
 */
describe("rotulaAfirmacoes / balancearPosicaoGabarito com afirmações rotuladas", () => {
  const rotulado = {
    pergunta:
      "Qual das sentenças abaixo viola a norma culta da língua? (A) Fazem dois anos que não a vejo. (B) Houve muitos erros na prova. (C) Haviam poucos alunos na sala. (D) Existem dúvidas sobre o assunto.",
    opcoes: ["Somente A", "A e C", "C e D", "Somente B"],
    correta: 1,
    explicacao:
      "Violam a norma (A), com fazer no plural, e (C), com haver no plural. Por isso a alternativa B, A e C, é a resposta. As sentenças (B) e (D) estão corretas.",
  };

  test("detecta o formato: ≥ 2 rótulos no enunciado E alternativa que só cita rótulos", () => {
    expect(rotulaAfirmacoes(rotulado)).toBe(true);
    for (const alt of ["Somente A", "apenas B", "C e D", "A, B e C", "A ou D", "As afirmativas A e C.", "Só as alternativas B"]) {
      expect(rotulaAfirmacoes({ ...rotulado, opcoes: [alt, "x1", "x2", "x3"] }), alt).toBe(true);
    }
  });

  test("não pega enunciado comum: um rótulo só, ou alternativas em texto corrido, ou sem rótulo nenhum", () => {
    expect(rotulaAfirmacoes({ pergunta: "Na frase (A) do texto, o verbo concorda com o sujeito?", opcoes: ["Somente A", "B", "C", "D"] })).toBe(false);
    expect(rotulaAfirmacoes({ pergunta: rotulado.pergunta, opcoes: ["Fazem dois anos", "Houve erros", "Haviam alunos", "Existem dúvidas"] })).toBe(false);
    expect(rotulaAfirmacoes({ pergunta: "Qual a capital do Brasil?", opcoes: ["Brasília", "Recife", "Natal", "Belém"] })).toBe(false);
    expect(rotulaAfirmacoes({ opcoes: ["A e B", "C", "D", "E"] })).toBe(false);
  });

  test("a explicação NÃO é remapeada em nenhuma rotação (e as alternativas giram normalmente)", () => {
    for (let i = 1; i <= 24; i++) {
      const r = balancearPosicaoGabarito(rotulado, `lote-${i}`);
      expect(r.explicacao, `lote-${i}`).toBe(rotulado.explicacao);
      expect(r.opcoes[r.correta]).toBe("A e C");
      expect([...r.opcoes].sort()).toEqual([...rotulado.opcoes].sort());
    }
  });

  test("controle: sem o formato rotulado a mesma explicação É remapeada (o conserto não desliga o remapeamento em geral)", () => {
    const comum = { ...rotulado, pergunta: "Qual das sentenças viola a norma culta?", opcoes: ["Fazem dois anos", "Haviam poucos alunos", "Houve erros", "Existem dúvidas"] };
    const mudou = Array.from({ length: 24 }, (_, i) => balancearPosicaoGabarito(comum, `lote-${i + 1}`).explicacao !== comum.explicacao);
    expect(mudou.some(Boolean)).toBe(true);
  });
});

/**
 * Verificador (docs/30 §19.2 estágio 4/4b, Fase 9 F9.6).
 */

describe("verify", () => {
  test("concorda e confiança alta -> agree, sem escalar", () => {
    const r = verify(2, 2, 0.9);
    expect(r.agree).toBe(true);
    if (r.agree) expect(r.finalAnswer).toBe(2);
  });

  test("discorda -> escala", () => {
    const r = verify(2, 3, 0.9);
    expect(r.agree).toBe(false);
    expect(r.escalated).toBe(true);
  });

  test("concorda mas confiança abaixo do mínimo -> escala mesmo assim", () => {
    const r = verify(2, 2, CONFIANCA_MINIMA - 0.01);
    expect(r.agree).toBe(false);
  });

  test("confiança exatamente no mínimo -> agree (fronteira inclusiva)", () => {
    const r = verify(2, 2, CONFIANCA_MINIMA);
    expect(r.agree).toBe(true);
  });

  test("respostas compostas (ordenar/parear): mesma ordem concorda", () => {
    const r = verify([1, 0, 2], [1, 0, 2], 0.9);
    expect(r.agree).toBe(true);
  });

  test("respostas compostas: ordem DIFERENTE discorda (ordem importa em 'ordenar')", () => {
    const r = verify([1, 0, 2], [0, 1, 2], 0.9);
    expect(r.agree).toBe(false);
  });

  test("comprimentos diferentes discordam sem lançar", () => {
    const r = verify([1, 0], [1, 0, 2], 0.9);
    expect(r.agree).toBe(false);
  });
});

describe("resolveEscalation", () => {
  test("veredito 'ambiguo' rejeita o item", () => {
    const r = resolveEscalation("ambiguo", 2, 3, "sonnet");
    expect("rejected" in r && r.rejected).toBe(true);
  });

  test("veredito 'gerador' confirma o gabarito do gerador", () => {
    const r = resolveEscalation("gerador", 2, 3, "sonnet");
    expect("finalAnswer" in r && r.finalAnswer).toBe(2);
  });

  test("veredito 'solucionador' confirma a resposta do solucionador independente", () => {
    const r = resolveEscalation("solucionador", 2, 3, "sonnet");
    expect("finalAnswer" in r && r.finalAnswer).toBe(3);
  });
});

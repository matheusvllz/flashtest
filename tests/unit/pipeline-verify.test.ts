import { describe, expect, test } from "bun:test";
import {
  verify,
  resolveEscalation,
  CONFIANCA_MINIMA,
  balancearPosicaoGabarito,
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

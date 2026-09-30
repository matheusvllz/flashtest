/** Regras de recompensa compartilhadas entre app e servidor (docs/specs/46-producao T-06.2). */
import { describe, expect, test } from "bun:test";
import {
  SEQUENCIA_INICIAL,
  avancarSequencia,
  diasEntre,
  estrelasPorPct,
  sequenciaDosDias,
  xpAPagar,
  xpAlvoDaAtividade,
  xpAlvoDaQuestaoGeral,
} from "../../src/lib/recompensas";

describe("XP", () => {
  test("faixas de estrelas: 70 e 90 são os limiares", () => {
    expect(estrelasPorPct(69)).toBe(1);
    expect(estrelasPorPct(70)).toBe(2);
    expect(estrelasPorPct(89)).toBe(2);
    expect(estrelasPorPct(90)).toBe(3);
  });

  test("atividade: revisão 5, checagem 20, prática pela faixa (10/20/30)", () => {
    expect(xpAlvoDaAtividade("revisao", 0, 4)).toBe(5);
    expect(xpAlvoDaAtividade("checkpoint", 1, 8)).toBe(20);
    expect(xpAlvoDaAtividade("pratica", 1, 4)).toBe(10);
    expect(xpAlvoDaAtividade("pratica", 3, 4)).toBe(20);
    expect(xpAlvoDaAtividade("pratica", 4, 4)).toBe(30);
    expect(xpAlvoDaAtividade("pratica", 0, 0)).toBe(10);
  });

  test("teto por chave: paga só a diferença, nunca de novo", () => {
    expect(xpAPagar(0, xpAlvoDaQuestaoGeral(false))).toBe(5);
    expect(xpAPagar(5, xpAlvoDaQuestaoGeral(true))).toBe(10);
    expect(xpAPagar(15, xpAlvoDaQuestaoGeral(true))).toBe(0);
    expect(xpAPagar(15, xpAlvoDaQuestaoGeral(false))).toBe(0);
  });
});

describe("sequência", () => {
  test("dias corridos pelo calendário, inclusive virada de mês", () => {
    expect(diasEntre("2026-09-30", "2026-10-01")).toBe(1);
    expect(diasEntre("2026-10-01", "2026-09-30")).toBe(-1);
    expect(diasEntre("2026-02-28", "2026-03-01")).toBe(1);
  });

  test("primeiro dia vale 1; dia seguinte soma; o mesmo dia não muda nada", () => {
    let e = avancarSequencia(SEQUENCIA_INICIAL, "2026-09-01");
    expect(e.sequencia).toBe(1);
    e = avancarSequencia(e, "2026-09-02");
    expect(e.sequencia).toBe(2);
    expect(avancarSequencia(e, "2026-09-02")).toBe(e);
  });

  test("um dia perdido gasta o congelamento; sem congelamento, recomeça", () => {
    let e = sequenciaDosDias(["2026-09-01", "2026-09-02"]);
    expect(e.congelamentos).toBe(1);
    e = avancarSequencia(e, "2026-09-04"); // perdeu o dia 3
    expect(e.sequencia).toBe(3);
    expect(e.congelamentos).toBe(0);
    e = avancarSequencia(e, "2026-09-06"); // perdeu o dia 5, sem congelamento
    expect(e.sequencia).toBe(1);
    expect(e.melhorSequencia).toBe(3);
  });

  test("dois ou mais dias perdidos recomeçam mesmo com congelamento", () => {
    const e = sequenciaDosDias(["2026-09-01", "2026-09-04"]);
    expect(e.sequencia).toBe(1);
    expect(e.congelamentos).toBe(1);
  });

  test("ganha 1 congelamento a cada 7 dias com atividade, no máximo 2", () => {
    const dias = Array.from({ length: 21 }, (_, i) => `2026-09-${String(i + 1).padStart(2, "0")}`);
    const e = sequenciaDosDias(dias);
    expect(e.sequencia).toBe(21);
    expect(e.congelamentos).toBe(2);
  });

  test("dias fora de ordem ou repetidos são ignorados pelo replay (ordem não importa)", () => {
    const a = sequenciaDosDias(["2026-09-03", "2026-09-01", "2026-09-02", "2026-09-02"]);
    const b = sequenciaDosDias(["2026-09-01", "2026-09-02", "2026-09-03"]);
    expect(a).toEqual(b);
  });
});

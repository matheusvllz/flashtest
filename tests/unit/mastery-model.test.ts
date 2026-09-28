import { describe, expect, test } from "bun:test";
import { mastery, probabilityCorrect, updateSkill } from "@/lib/adaptive/model";
import { MAX_STEP, SIGMA0, SIGMA_MIN } from "@/lib/adaptive/constants";
import type { SkillModelEntry } from "@/lib/learning/types";

/**
 * Valores de referência do docs/30 §9.5 — a fórmula está certa se ESTES
 * números baterem, não o contrário. Item fácil = dificuldade 1, múltipla
 * escolha de 5 alternativas (irt a=1, b=-1.6, c=0.2); médio = dif 3 (b=0);
 * difícil = dif 4 (b=0.8).
 */
const FACIL = { a: 1, b: -1.6, c: 0.2 };
const MEDIO = { a: 1, b: 0, c: 0.2 };
const DIFICIL = { a: 1, b: 0.8, c: 0.2 };

function responder(
  entry: SkillModelEntry | undefined,
  irt: typeof FACIL,
  correct: boolean,
  today = "2026-09-21",
): SkillModelEntry {
  return updateSkill(entry, "mat:x", { role: "pratica", correct }, irt, today, { now: "2026-09-21T10:00:00.000Z" });
}

describe("probabilityCorrect", () => {
  test("no prior (theta=-0.7), item fácil: p ≈ 0,698 (conta de referência do docs/30 §9.5)", () => {
    expect(probabilityCorrect(-0.7, FACIL)).toBeCloseTo(0.698, 2);
  });

  test("'não sei' não usa o piso de chute c", () => {
    const comChute = probabilityCorrect(-0.7, FACIL, { dontKnow: false });
    const semChute = probabilityCorrect(-0.7, FACIL, { dontKnow: true });
    expect(semChute).toBeLessThan(comChute);
  });
});

describe("updateSkill — tabela de referência (docs/30 §9.5)", () => {
  test("1 acerto fácil a partir do prior: theta ≈ -0,337, Mastery ≈ 42, sigma ≈ 1,054", () => {
    const depois = responder(undefined, FACIL, true);
    expect(depois.theta).toBeCloseTo(-0.337, 2);
    expect(mastery(depois)).toBeGreaterThanOrEqual(40);
    expect(mastery(depois)).toBeLessThanOrEqual(44);
    expect(depois.sigma).toBeCloseTo(1.054, 2);
  });

  test("2 acertos fáceis: Mastery entre 44 e 52 (~48)", () => {
    let e = responder(undefined, FACIL, true);
    e = responder(e, FACIL, true);
    expect(mastery(e)).toBeGreaterThanOrEqual(44);
    expect(mastery(e)).toBeLessThanOrEqual(52);
  });

  test("2 fáceis + 1 médio certos: Mastery entre 55 e 65 (~60)", () => {
    let e = responder(undefined, FACIL, true);
    e = responder(e, FACIL, true);
    e = responder(e, MEDIO, true);
    expect(mastery(e)).toBeGreaterThanOrEqual(55);
    expect(mastery(e)).toBeLessThanOrEqual(65);
  });

  test("2 fáceis + 1 médio + 1 difícil certos: Mastery entre 66 e 76 (~71)", () => {
    let e = responder(undefined, FACIL, true);
    e = responder(e, FACIL, true);
    e = responder(e, MEDIO, true);
    e = responder(e, DIFICIL, true);
    expect(mastery(e)).toBeGreaterThanOrEqual(66);
    expect(mastery(e)).toBeLessThanOrEqual(76);
  });

  test("depois da sequência acima, 1 erro num item fácil: Mastery cai (entre 52 e 62, ~57) — nunca despenca (MAX_STEP)", () => {
    let e = responder(undefined, FACIL, true);
    e = responder(e, FACIL, true);
    e = responder(e, MEDIO, true);
    e = responder(e, DIFICIL, true);
    const masteryAntes = mastery(e);
    e = responder(e, FACIL, false);
    expect(mastery(e)).toBeLessThan(masteryAntes);
    expect(mastery(e)).toBeGreaterThanOrEqual(52);
    expect(mastery(e)).toBeLessThanOrEqual(62);
  });
});

describe("updateSkill — regras estruturais (docs/30 §9.4/§9.7)", () => {
  test("passo nunca excede MAX_STEP em módulo", () => {
    const e = responder(undefined, DIFICIL, true, "2026-09-21");
    // theta prior -0,7; delta = theta_depois - theta_antes
    expect(Math.abs(e.theta - -0.7)).toBeLessThanOrEqual(MAX_STEP + 1e-9);
  });

  test("sigma nunca fica abaixo de SIGMA_MIN mesmo com muita evidência", () => {
    let e: SkillModelEntry | undefined = undefined;
    for (let i = 0; i < 30; i++) e = responder(e, MEDIO, true, "2026-09-21");
    expect(e!.sigma).toBeGreaterThanOrEqual(SIGMA_MIN - 1e-9);
  });

  test("sigma nunca ultrapassa SIGMA0 mesmo com drift de muitos dias sem evidência", () => {
    const primeira = responder(undefined, MEDIO, true, "2026-01-01");
    const depoisDeAnos = updateSkill(
      primeira,
      "mat:x",
      { role: "pratica", correct: true },
      MEDIO,
      "2027-01-01",
      { now: "2027-01-01T00:00:00.000Z" },
    );
    expect(depoisDeAnos.sigma).toBeLessThanOrEqual(SIGMA0 + 1e-9);
  });

  test("'não sei' cai menos que um erro com chute (docs/30 §16.1)", () => {
    const comErro = updateSkill(undefined, "mat:x", { role: "pratica", correct: false }, MEDIO, "2026-09-21", {
      now: "x",
    });
    const comNaoSei = updateSkill(
      undefined,
      "mat:x",
      { role: "pratica", correct: false, response: "dont-know" },
      MEDIO,
      "2026-09-21",
      { now: "x" },
    );
    // Ambos caem (obs=0), mas "não sei" cai MENOS — theta final maior (mais perto do prior).
    expect(comNaoSei.theta).toBeGreaterThan(comErro.theta);
  });

  test("tentativa assistida (dica/tutor) move menos que uma independente", () => {
    const independente = updateSkill(undefined, "mat:x", { role: "pratica", correct: true }, FACIL, "2026-09-21", {
      now: "x",
    });
    const assistida = updateSkill(
      undefined,
      "mat:x",
      { role: "pratica", correct: true, assisted: true },
      FACIL,
      "2026-09-21",
      { now: "x" },
    );
    expect(assistida.theta - (-0.7)).toBeLessThan(independente.theta - -0.7);
  });

  test("papel 'checkpoint' (checagem de aula) pesa metade de 'pratica'", () => {
    const pratica = updateSkill(undefined, "mat:x", { role: "pratica", correct: true }, FACIL, "2026-09-21", {
      now: "x",
    });
    const checkpoint = updateSkill(undefined, "mat:x", { role: "checkpoint", correct: true }, FACIL, "2026-09-21", {
      now: "x",
    });
    expect(checkpoint.nEff).toBeCloseTo(pratica.nEff * 0.5, 5);
  });

  test("item repetido no mesmo dia pesa metade (weightMultiplier 0,5 combinado pelo chamador)", () => {
    const normal = updateSkill(undefined, "mat:x", { role: "pratica", correct: true }, FACIL, "2026-09-21", {
      now: "x",
    });
    const repetido = updateSkill(undefined, "mat:x", { role: "pratica", correct: true }, FACIL, "2026-09-21", {
      now: "x",
      weightMultiplier: 0.5,
    });
    expect(repetido.nEff).toBeCloseTo(normal.nEff * 0.5, 5);
  });

  test("difficultiesSeen só cresce com dificuldade nova e resposta independente", () => {
    let e = updateSkill(undefined, "mat:x", { role: "pratica", correct: true }, FACIL, "2026-09-21", {
      now: "x",
      difficulty: 1,
    });
    expect(e.difficultiesSeen).toEqual([1]);
    e = updateSkill(e, "mat:x", { role: "pratica", correct: true }, FACIL, "2026-09-21", {
      now: "x",
      difficulty: 1, // repetida — não duplica
    });
    expect(e.difficultiesSeen).toEqual([1]);
    e = updateSkill(e, "mat:x", { role: "pratica", correct: true, assisted: true }, MEDIO, "2026-09-21", {
      now: "x",
      difficulty: 3, // nova, mas ASSISTIDA — não conta
    });
    expect(e.difficultiesSeen).toEqual([1]);
    e = updateSkill(e, "mat:x", { role: "pratica", correct: true }, MEDIO, "2026-09-21", {
      now: "x",
      difficulty: 3, // nova, independente — conta
    });
    expect(e.difficultiesSeen).toEqual([1, 3]);
  });

  test("lapses sobe quando erra REVISÃO/DIAGNÓSTICO com Mastery alta antes; não sobe em prática", () => {
    // Constrói Mastery alta primeiro.
    let e: SkillModelEntry | undefined = undefined;
    for (let i = 0; i < 8; i++) e = responder(e, DIFICIL, true, "2026-09-21");
    expect(mastery(e!)).toBeGreaterThanOrEqual(70);

    const erroPratica = updateSkill(e, "mat:x", { role: "pratica", correct: false }, FACIL, "2026-09-22", {
      now: "x",
    });
    expect(erroPratica.lapses).toBe(e!.lapses);

    const erroRevisao = updateSkill(e, "mat:x", { role: "revisao", correct: false }, FACIL, "2026-09-22", {
      now: "x",
    });
    expect(erroRevisao.lapses).toBe(e!.lapses + 1);
  });

  test("recent guarda no máximo os últimos 8, com 2 pra 'não sei'", () => {
    let e: SkillModelEntry | undefined = undefined;
    for (let i = 0; i < 10; i++) e = responder(e, MEDIO, true, "2026-09-21");
    expect(e!.recent).toHaveLength(8);
    e = updateSkill(e, "mat:x", { role: "pratica", correct: false, response: "dont-know" }, MEDIO, "2026-09-21", {
      now: "x",
    });
    expect(e.recent[e.recent.length - 1]).toBe(2);
  });

  test("prior custom seeda o ponto de partida de theta/sigma, mas a chamada em si já é evidência real (Fase 13, docs/32)", () => {
    const e = updateSkill(undefined, "mat:x", { role: "pratica", correct: true }, MEDIO, "2026-09-21", {
      now: "x",
      prior: { theta: 0.5, sigma: 1.0, source: "prior-nivelamento" },
    });
    expect(e.theta).toBeGreaterThan(0.5); // acerto empurra pra cima do prior
    // `source` NUNCA fica "prior-*" depois de passar por `updateSkill` — essa
    // chamada processou uma tentativa de verdade (docs/30 §12.3: uma
    // habilidade "medida diretamente" no nivelamento vira "evidencia", não
    // fica presa como prior pra sempre). Só `applyPlacement` grava entradas
    // com source "prior-*" de verdade, direto, sem chamar `updateSkill`.
    expect(e.source).toBe("evidencia");
  });

  test("dontKnowRecent decai com os dias e sobe a cada 'não sei'", () => {
    const primeiro = updateSkill(
      undefined,
      "mat:x",
      { role: "pratica", correct: false, response: "dont-know" },
      MEDIO,
      "2026-09-21",
      { now: "x" },
    );
    expect(primeiro.dontKnowRecent).toBe(1);
    const dezDiasDepois = updateSkill(primeiro, "mat:x", { role: "pratica", correct: true }, MEDIO, "2026-10-01", {
      now: "x",
    });
    expect(dezDiasDepois.dontKnowRecent).toBe(0); // decaiu totalmente (10 dias > 1)
  });
});

describe("mastery()", () => {
  test("sem entrada, devolve o Mastery do prior (não quebra)", () => {
    expect(mastery(undefined)).toBeGreaterThan(0);
    expect(mastery(undefined)).toBeLessThan(50);
  });
});

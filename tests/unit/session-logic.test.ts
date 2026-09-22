import { describe, expect, test } from "bun:test";
import {
  isAnswerComplete,
  nextStepIndex,
  presentedOrderFor,
  scoreOf,
} from "@/lib/learning/session-logic";
import {
  completeLacuna,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  ordenar,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";
import type { Exercise } from "@/lib/lessons/types";
import type { LessonStep } from "@/lib/learning/types";

/**
 * Testes das funções puras do motor de passo-a-passo (docs/25 §7.3/§9/§18
 * T-08) — sem React, sem store. Casos exigidos pelo plano: `scoreOf` ignora
 * checkpoint; `isAnswerComplete` nos 7 tipos; `presentedOrderFor` nunca
 * devolve ordem idêntica quando há >= 2 itens diferentes (shuffle injetado);
 * `nextStepIndex` para no último passo.
 */

describe("nextStepIndex (docs/25 §18 T-08)", () => {
  const steps: LessonStep[] = [
    { kind: "intro", title: "t", body: "b" },
    { kind: "teach", block: { type: "concept", title: "t", body: "b" } },
    { kind: "recap", body: "b" },
  ];

  test("avança um passo de cada vez", () => {
    expect(nextStepIndex(steps, 0)).toBe(1);
    expect(nextStepIndex(steps, 1)).toBe(2);
  });

  test("devolve null no último passo — não há próximo", () => {
    expect(nextStepIndex(steps, 2)).toBeNull();
  });
});

describe("isAnswerComplete — nos 7 tipos de exercício (docs/25 §9)", () => {
  test("null nunca é completo, em nenhum tipo", () => {
    const mc = multiplaEscolha({ pergunta: "p", opcoes: ["a", "b"], correta: 0, explicacao: "e" });
    expect(isAnswerComplete(mc, null)).toBe(false);
  });

  test("multipla-escolha: índice presente é completo", () => {
    const ex = multiplaEscolha({ pergunta: "p", opcoes: ["a", "b"], correta: 0, explicacao: "e" });
    expect(isAnswerComplete(ex, 0)).toBe(true);
  });

  test("encontre-o-erro: índice presente é completo", () => {
    const ex = encontreOErro({ frase: "uma frase errada aqui", erroIndex: 1, explicacao: "e" });
    expect(isAnswerComplete(ex, 1)).toBe(true);
  });

  test("complete-lacuna: índice presente é completo", () => {
    const ex = completeLacuna({ frase: "eu vou ___ escola", opcoes: ["a", "à"], correta: 1, explicacao: "e" });
    expect(isAnswerComplete(ex, 1)).toBe(true);
  });

  test("interpretacao: índice presente é completo", () => {
    const ex = interpretacao({
      texto: "Um texto de apoio com pelo menos quarenta caracteres de verdade.",
      pergunta: "p",
      opcoes: ["a", "b"],
      correta: 0,
      explicacao: "e",
    });
    expect(isAnswerComplete(ex, 0)).toBe(true);
  });

  test("verdadeiro-falso: índice presente é completo", () => {
    const ex = verdadeiroFalso({ afirmacao: "Uma afirmação qualquer", verdadeiro: true, explicacao: "e" });
    expect(isAnswerComplete(ex, 1)).toBe(true);
  });

  test("ordenar: completo só quando o array tem um item por bloco", () => {
    const ex = ordenar({ blocos: ["a", "b", "c"], explicacao: "e" });
    expect(isAnswerComplete(ex, [])).toBe(false);
    expect(isAnswerComplete(ex, [0, 1])).toBe(false);
    expect(isAnswerComplete(ex, [0, 1, 2])).toBe(true);
  });

  test("parear: completo só quando o array tem um item por par", () => {
    const ex = parear({
      pares: [
        { a: "x", b: "1" },
        { a: "y", b: "2" },
      ],
      explicacao: "e",
    });
    expect(isAnswerComplete(ex, [0])).toBe(false);
    expect(isAnswerComplete(ex, [0, 1])).toBe(true);
  });
});

describe("scoreOf — só conta questões pontuadas (docs/25 §6.6, ignora checkpoint)", () => {
  const steps: LessonStep[] = [
    { kind: "intro", title: "t", body: "b" },
    { kind: "question", exerciseId: "c1", role: "checkpoint", difficulty: 1 },
    { kind: "question", exerciseId: "p1", role: "pratica", difficulty: 2 },
    { kind: "question", exerciseId: "p2", role: "pratica", difficulty: 2 },
    { kind: "recap", body: "b" },
  ];

  test("ignora o checkpoint mesmo se ele estiver 'errado' nas respostas", () => {
    const answers = {
      "1": { correct: false }, // checkpoint — não deve contar pra total nem correct
      "2": { correct: true },
      "3": { correct: false },
    };
    expect(scoreOf(steps, answers)).toEqual({ correct: 1, total: 2 });
  });

  test("questão pontuada sem resposta ainda não conta como certa", () => {
    const answers = { "1": { correct: true }, "2": { correct: true } };
    expect(scoreOf(steps, answers)).toEqual({ correct: 1, total: 2 });
  });

  test("todas certas -> correct === total", () => {
    const answers = { "1": { correct: true }, "2": { correct: true }, "3": { correct: true } };
    expect(scoreOf(steps, answers)).toEqual({ correct: 2, total: 2 });
  });
});

describe("presentedOrderFor — embaralha ordenar/parear, nunca idêntico ao original (docs/25 §18 T-08)", () => {
  test("outros 5 tipos não têm ordem apresentada", () => {
    const ex = multiplaEscolha({ pergunta: "p", opcoes: ["a", "b"], correta: 0, explicacao: "e" });
    expect(presentedOrderFor(ex)).toBeUndefined();
  });

  test("ordenar: reembaralha até sair diferente do original, com shuffle injetado", () => {
    const ex = ordenar({ blocos: ["a", "b", "c"], explicacao: "e" });
    // Shuffle determinístico: primeira chamada devolve a MESMA ordem (deveria
    // reembaralhar); da segunda em diante, inverte — resultado tem que ser
    // diferente do original.
    let chamadas = 0;
    const shuffleFake = <T,>(items: T[]): T[] => {
      chamadas += 1;
      return chamadas === 1 ? [...items] : [...items].reverse();
    };
    const ordem = presentedOrderFor(ex, shuffleFake);
    expect(ordem).toEqual(["c", "b", "a"]);
    expect(ordem).not.toEqual(ex.blocos);
    expect(chamadas).toBeGreaterThan(1);
  });

  test("ordenar: se o shuffle injetado SEMPRE devolver a ordem original, desiste após 3 tentativas (nunca trava)", () => {
    const ex = ordenar({ blocos: ["a", "b", "c"], explicacao: "e" });
    const shuffleIdentidade = <T,>(items: T[]): T[] => [...items];
    const ordem = presentedOrderFor(ex, shuffleIdentidade);
    expect(ordem).toEqual(ex.blocos);
  });

  test("parear: embaralha a coluna B, nunca idêntica quando há >= 2 pares distintos", () => {
    const ex = parear({
      pares: [
        { a: "x", b: "1" },
        { a: "y", b: "2" },
        { a: "z", b: "3" },
      ],
      explicacao: "e",
    });
    const original = ex.pares.map((p) => p.b);
    let chamadas = 0;
    const shuffleFake = <T,>(items: T[]): T[] => {
      chamadas += 1;
      return chamadas === 1 ? [...items] : [...items].reverse();
    };
    const ordem = presentedOrderFor(ex, shuffleFake);
    expect(ordem).toEqual(["3", "2", "1"]);
    expect(ordem).not.toEqual(original);
  });
});

// Só pra documentar que a lista acima cobre os 7 tipos de exercício —
// referência estática, não um teste de verdade.
const _todosOsTipos: Exercise["type"][] = [
  "multipla-escolha",
  "encontre-o-erro",
  "complete-lacuna",
  "ordenar",
  "interpretacao",
  "parear",
  "verdadeiro-falso",
];
void _todosOsTipos;

import { describe, expect, test } from "bun:test";
import { validateExercise, type ValidateContext } from "../../scripts/content/validate";
import type { Exercise, MultipleChoiceExercise } from "@/lib/lessons/types";

/**
 * Validação de item (docs/30 §19.5, Fase 9 F9.8) — um teste por regra.
 */

const ctxOk: ValidateContext = {
  skillExists: () => true,
  skillActive: () => true,
  existingStatementsBySkill: () => [],
};

function itemBase(overrides: Partial<MultipleChoiceExercise> = {}): MultipleChoiceExercise {
  return {
    type: "multipla-escolha",
    pergunta: "Quanto é vinte por cento de trezentos reais, considerando o valor total do investimento inicial feito no banco?",
    opcoes: ["Sessenta reais", "Setenta reais", "Oitenta reais", "Cinquenta reais"],
    correta: 0,
    explicacao:
      "Para calcular a porcentagem, multiplicamos o valor total pela fração correspondente. Vinte por cento equivale a 0,20, e 300 vezes 0,20 resulta em 60, que é a resposta correta desta questão.",
    ...overrides,
  };
}

describe("validateExercise — gabarito dentro do intervalo", () => {
  test("índice válido passa", () => {
    expect(validateExercise(itemBase(), "mat:x", ctxOk).ok).toBe(true);
  });
  test("índice negativo falha", () => {
    const r = validateExercise(itemBase({ correta: -1 }), "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "gabarito-no-intervalo")).toBe(true);
  });
  test("índice fora do array falha", () => {
    const r = validateExercise(itemBase({ correta: 10 }), "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "gabarito-no-intervalo")).toBe(true);
  });
});

describe("validateExercise — alternativas distintas", () => {
  test("alternativas duplicadas (mesmo com case diferente) falham", () => {
    const r = validateExercise(itemBase({ opcoes: ["Sessenta reais", "SESSENTA REAIS", "Oitenta", "Noventa"] }), "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "alternativas-distintas")).toBe(true);
  });
  test("alternativas que diferem só por acento (crase: 'a' x 'à') são distintas", () => {
    const r = validateExercise(itemBase({ opcoes: ["a", "à", "ao", "às"] }), "por:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "alternativas-distintas")).toBe(false);
  });
});

describe("validateExercise — rascunho do gerador na explicação", () => {
  test("'Espera, deixe recalcular' reprova", () => {
    const r = validateExercise(
      itemBase({
        explicacao:
          "A força resultante é massa vezes aceleração, então 2 vezes 3 dá 6. Espera, deixe recalcular: com atrito a força fica menor, e o resultado final é 4 newtons, que é a alternativa certa.",
      }),
      "fis:x",
      ctxOk,
    );
    expect(r.issues.some((i) => i.rule === "sem-rascunho")).toBe(true);
  });
  test("'espera-se' e 'esperava' não disparam", () => {
    const r = validateExercise(
      itemBase({
        explicacao:
          "Espera-se que o aluno multiplique 300 por 0,20, o que dá 60 reais. Quem esperava somar os percentuais erra, porque porcentagem de um valor é multiplicação, não soma.",
      }),
      "mat:x",
      ctxOk,
    );
    expect(r.issues.some((i) => i.rule === "sem-rascunho")).toBe(false);
  });
});

describe("validateExercise — proibição 'todas/nenhuma das anteriores'", () => {
  test("rejeita a alternativa proibida", () => {
    const r = validateExercise(itemBase({ opcoes: ["Sessenta", "Setenta", "Oitenta", "Nenhuma das anteriores"] }), "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "sem-todas-nenhuma")).toBe(true);
  });
});

describe("validateExercise — LaTeX × dinheiro", () => {
  test("dois valores em R$ não são LaTeX; $x^2$ é", () => {
    const din = validateExercise(
      itemBase({
        explicacao:
          "O capital de R$ 2000 rende 15% ao ano, então depois de 3 anos vira 2000 vezes 1,15 elevado a 3, o que dá R$ 3041,75. Não some 15% três vezes, porque os juros incidem sobre o valor já corrigido.",
      }),
      "mat:x",
      ctxOk,
    );
    expect(din.issues.some((i) => i.message.includes("LaTeX"))).toBe(false);
    const tex = validateExercise(
      itemBase({
        explicacao:
          "Como $x^2 = 9$, temos x igual a 3 ou menos 3, mas só o valor positivo serve porque é uma medida de comprimento. Não esqueça de descartar a raiz negativa quando a grandeza não pode ser negativa.",
      }),
      "mat:x",
      ctxOk,
    );
    expect(tex.issues.some((i) => i.message.includes("LaTeX"))).toBe(true);
  });
});

describe("validateExercise — letra embutida na alternativa (achado real, rep-03)", () => {
  test("'A) feliz' reprova; 'a) b)' no meio do texto não", () => {
    const com = validateExercise(itemBase({ opcoes: ["A) Sessenta", "B) Setenta", "C) Oitenta", "D) Noventa"] }), "mat:x", ctxOk);
    expect(com.issues.some((i) => i.rule === "sem-prefixo-letra")).toBe(true);
    const sem = validateExercise(itemBase({ opcoes: ["Sessenta", "Setenta (b) exato", "Oitenta", "Noventa"] }), "mat:x", ctxOk);
    expect(sem.issues.some((i) => i.rule === "sem-prefixo-letra")).toBe(false);
  });
});

describe("validateExercise — tamanho de enunciado/explicação", () => {
  test("enunciado curto demais (< 15 palavras) falha", () => {
    const r = validateExercise(itemBase({ pergunta: "Quanto é vinte por cento?" }), "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "tamanho-enunciado")).toBe(true);
  });
  test("explicação curta demais (< 25 palavras) falha", () => {
    const r = validateExercise(itemBase({ explicacao: "Porque sim, é assim que funciona a matemática básica." }), "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "tamanho-explicacao")).toBe(true);
  });
});

describe("validateExercise — sem LaTeX", () => {
  test("rejeita \\( \\) no enunciado", () => {
    const r = validateExercise(itemBase({ pergunta: "Quanto vale \\(x^2\\) quando x é igual a três nessa equação simples?" }), "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "sem-latex")).toBe(true);
  });
  test("rejeita $...$ na explicação", () => {
    const r = validateExercise(
      itemBase({ explicacao: "Sabendo que $x = 3$, substituímos na fórmula e obtemos o resultado final correto da questão apresentada." }),
      "mat:x",
      ctxOk,
    );
    expect(r.issues.some((i) => i.rule === "sem-latex")).toBe(true);
  });
});

describe("validateExercise — 'segundo o texto' sem texto de apoio", () => {
  test("multipla-escolha mencionando 'segundo o texto' falha (não tem texto de apoio)", () => {
    const r = validateExercise(
      itemBase({ pergunta: "Segundo o texto apresentado anteriormente, qual é a porcentagem correta do valor total investido?" }),
      "mat:x",
      ctxOk,
    );
    expect(r.issues.some((i) => i.rule === "segundo-o-texto-sem-texto")).toBe(true);
  });

  test("interpretacao mencionando 'segundo o texto' passa (tem texto de apoio)", () => {
    const ex: Exercise = {
      type: "interpretacao",
      texto: "Texto de apoio bem longo sobre o assunto da prova, com informações suficientes para embasar a questão de interpretação a seguir.",
      pergunta: "Segundo o texto, qual é a conclusão correta sobre o assunto discutido ao longo de toda a leitura apresentada?",
      opcoes: ["Primeira opção plausível", "Segunda opção plausível", "Terceira opção plausível", "Quarta opção plausível"],
      correta: 0,
      explicacao:
        "A conclusão correta está embasada diretamente no texto de apoio, que apresenta argumentos claros o suficiente para sustentar essa alternativa como a resposta certa da questão.",
    };
    const r = validateExercise(ex, "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "segundo-o-texto-sem-texto")).toBe(false);
  });
});

describe("validateExercise — habilidade existe e está ativa", () => {
  test("habilidade inexistente falha", () => {
    const r = validateExercise(itemBase(), "mat:nao-existe", { ...ctxOk, skillExists: () => false });
    expect(r.issues.some((i) => i.rule === "habilidade-existe")).toBe(true);
  });
  test("habilidade planejada (não ativa) falha", () => {
    const r = validateExercise(itemBase(), "mat:planejada", { ...ctxOk, skillActive: () => false });
    expect(r.issues.some((i) => i.rule === "habilidade-ativa")).toBe(true);
  });
});

describe("validateExercise — imagem externa", () => {
  test("URL externa (http) falha", () => {
    const r = validateExercise(itemBase({ imagem: { url: "https://exemplo.com/img.png", alt: "descrição" } }), "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "sem-imagem-externa")).toBe(true);
  });
  test("caminho controlado (/content/...) passa", () => {
    const r = validateExercise(itemBase({ imagem: { url: "/content/v1/img.svg", alt: "descrição" } }), "mat:x", ctxOk);
    expect(r.issues.some((i) => i.rule === "sem-imagem-externa")).toBe(false);
  });
});

describe("validateExercise — dificuldade coerente (heurística, só alerta)", () => {
  test("solução em <= 2 passos gera WARNING, não bloqueia ok", () => {
    const r = validateExercise(itemBase(), "mat:x", { ...ctxOk, solutionSteps: 1 });
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => w.rule === "dificuldade-coerente")).toBe(true);
  });
});

describe("validateExercise — duplicata semântica (Jaccard de 5-gramas)", () => {
  test("enunciado quase idêntico a um existente é rejeitado", () => {
    const existente = "Quanto é vinte por cento de trezentos reais, considerando o valor total do investimento inicial feito no banco?";
    const r = validateExercise(itemBase(), "mat:x", { ...ctxOk, existingStatementsBySkill: () => [existente] });
    expect(r.issues.some((i) => i.rule === "duplicata-semantica")).toBe(true);
  });

  test("enunciado bem diferente não é rejeitado por duplicata", () => {
    const existente = "Qual é a capital do estado de Minas Gerais, conhecida por sua arquitetura histórica barroca?";
    const r = validateExercise(itemBase(), "mat:x", { ...ctxOk, existingStatementsBySkill: () => [existente] });
    expect(r.issues.some((i) => i.rule === "duplicata-semantica")).toBe(false);
  });
});

describe("validateExercise — item válido não gera nenhum issue", () => {
  test("ok:true e issues vazio", () => {
    const r = validateExercise(itemBase(), "mat:x", ctxOk);
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });
});

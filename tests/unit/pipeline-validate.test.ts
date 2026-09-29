import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { validateExercise, type ValidateContext } from "../../scripts/content/validate";
import { avisoPosicaoLote, avisosDeForma, metricasForma, parseExcecoes } from "../../scripts/content/qualidade-forma";
import { isPublishable, temAvisoAlto } from "../../scripts/content/publish";
import type { Candidate } from "../../scripts/content/pipeline-types";
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

/**
 * Warnings de qualidade de forma (docs/36 T-07.2, §G.7, RP-8): pista de tamanho/absolutismo/
 * travessão/letra citada. Nunca bloqueiam `ok`; severidade e exceção registrável por id+regra.
 */
function itemDoBanco(arquivo: string, id: string): MultipleChoiceExercise {
  const json = JSON.parse(readFileSync(`src/content/banco/${arquivo}`, "utf-8")) as {
    items: Array<{ id: string; exercise: MultipleChoiceExercise }>;
  };
  const item = json.items.find((i) => i.id === id);
  if (!item) throw new Error(`item ${id} não está em ${arquivo}`);
  return item.exercise;
}

const regras = (r: { warnings: Array<{ regra: string }> }) => r.warnings.map((w) => w.regra);
const sev = (r: { warnings: Array<{ regra: string; severidade: string }> }, regra: string) =>
  r.warnings.find((w) => w.regra === regra)?.severidade;

/** Exemplos do docs/35 §7.1 na versão original (antes da revisão da Fase 7), congelados em fixture. */
function itemOriginalDocs35(id: string): MultipleChoiceExercise {
  const json = JSON.parse(readFileSync("tests/unit/fixtures/itens-docs35-versao-original.json", "utf-8")) as {
    items: Array<{ id: string; exercise: MultipleChoiceExercise }>;
  };
  const item = json.items.find((i) => i.id === id);
  if (!item) throw new Error(`item ${id} não está no fixture`);
  return item.exercise;
}

describe("validateExercise — warnings de forma: positivos (ids do docs/35 §7.1, versão original congelada)", () => {
  const casos: Array<[string, string, string]> = [
    ["bio/bio-membrana-estrutura.json", "gen:bio:membrana-estrutura:6553a1bf", "4.51"],
    ["bio/bio-membrana-estrutura.json", "gen:bio:membrana-estrutura:5ae4f57c", "4.27"],
    ["bio/bio-ecologia-relacoes-ecossistema.json", "gen:bio:ecologia-relacoes-ecossistema:b9bc002a", "4.30"],
    ["bio/bio-organelas-funcao.json", "gen:bio:organelas-funcao:a655cd73", "3.92"],
  ];
  for (const [arquivo, id, razao] of casos) {
    test(`${id}: tamanho-correta-maior alta (razão ${razao}), sem mudar ok`, () => {
      const ex = itemOriginalDocs35(id);
      const r = validateExercise(ex, "bio:x", { ...ctxOk, itemId: id });
      expect(sev(r, "tamanho-correta-maior")).toBe("alta");
      const w = r.warnings.find((x) => x.regra === "tamanho-correta-maior")!;
      expect(w.detalhe).toContain(`razão ${razao}`);
      // Compatibilidade do formato antigo: rule/message espelham regra/detalhe.
      expect(w.rule).toBe(w.regra);
      expect(w.message).toBe(w.detalhe);
      // O aviso nunca é bloqueio: nenhum `issue` de tamanho de alternativa.
      expect(r.issues.some((i) => i.rule.startsWith("tamanho-correta"))).toBe(false);
    });
  }

  test("5ae4f57c também acusa absolutismo nos distratores; b9bc002a acusa travessão", () => {
    const a = validateExercise(itemOriginalDocs35("gen:bio:membrana-estrutura:5ae4f57c"), "bio:x", ctxOk);
    expect(regras(a)).toContain("absolutismo-distratores");
    const b = validateExercise(
      itemOriginalDocs35("gen:bio:ecologia-relacoes-ecossistema:b9bc002a"),
      "bio:x",
      ctxOk,
    );
    expect(regras(b)).toContain("travessao-alternativa");
  });
});

describe("validateExercise — warnings de forma: negativos", () => {
  test("item de matemática com correta curta e distratores do mesmo tamanho não gera aviso de forma", () => {
    const r = validateExercise(itemBase({ opcoes: ["60", "70", "80", "50"], correta: 0 }), "mat:x", ctxOk);
    expect(r.warnings).toEqual([]);
    expect(r.excecoes).toEqual([]);
  });

  test("item base (alternativas de tamanhos parecidos) não gera aviso", () => {
    expect(validateExercise(itemBase(), "mat:x", ctxOk).warnings).toEqual([]);
  });
});

describe("avisosDeForma: limiares exatos de §G.7", () => {
  const com = (correta: string, outras: string[]) => [correta, ...outras];
  const nomes = (opcoes: string[], correta = 0, expl?: string) =>
    avisosDeForma(opcoes, correta, expl).map((a) => `${a.regra}:${a.severidade}`);

  test("razão 2,0 → alta; 1,5 → média; logo abaixo de 1,5 → nada", () => {
    expect(nomes(com("a".repeat(20), ["b".repeat(10), "c".repeat(10), "d".repeat(10)]))).toContain("tamanho-correta-maior:alta");
    expect(nomes(com("a".repeat(15), ["b".repeat(10), "c".repeat(10), "d".repeat(10)]))).toContain("tamanho-correta-maior:media");
    expect(nomes(com("a".repeat(14), ["b".repeat(10), "c".repeat(10), "d".repeat(10)]))).not.toContain("tamanho-correta-maior:media");
  });

  test("a medida usa trim e colapso de espaços", () => {
    const m = metricasForma(["  aa   bb  ", "aa bb", "cc dd", "ee ff"], 0)!;
    expect(m.lenCorreta).toBe(5);
    expect(m.razaoMaior).toBe(1);
  });

  test("correta ≤ 0,4 da menor incorreta → tamanho-correta-menor (média)", () => {
    expect(nomes(com("ab", ["a".repeat(5), "b".repeat(5), "c".repeat(5)]))).toContain("tamanho-correta-menor:media");
    expect(nomes(com("abc", ["a".repeat(5), "b".repeat(5), "c".repeat(5)]))).not.toContain("tamanho-correta-menor:media");
  });

  test("dispersão: coeficiente de variação > 0,6 → info", () => {
    expect(nomes(com("a".repeat(4), ["b".repeat(4), "c".repeat(4), "d".repeat(40)]))).toContain("dispersao-tamanhos:info");
    expect(nomes(com("a".repeat(10), ["b".repeat(11), "c".repeat(12), "d".repeat(13)]))).not.toContain("dispersao-tamanhos:info");
  });

  test("absolutismo: ≥ 2 incorretas e a correta sem → média; 1 só ou correta também com → nada", () => {
    expect(nomes(["Depende do meio", "Nunca ocorre", "Sempre ocorre", "Em parte"])).toContain("absolutismo-distratores:media");
    expect(nomes(["Depende do meio", "Nunca ocorre", "Ocorre às vezes", "Em parte"])).not.toContain("absolutismo-distratores:media");
    expect(nomes(["Ocorre apenas no verão", "Nunca ocorre", "Sempre ocorre", "Em parte"])).not.toContain("absolutismo-distratores:media");
    // palavra inteira: "todavia"/"sempreviva" não são absolutismo
    expect(nomes(["Depende", "Todavia ocorre", "A sempreviva ocorre", "Em parte"])).not.toContain("absolutismo-distratores:media");
  });

  test("travessão (— e –) em alternativa → média", () => {
    expect(nomes(["Ocorre — sempre", "Em parte", "Depende", "Nenhum"])).toContain("travessao-alternativa:media");
    expect(nomes(["Ocorre 2–3 vezes", "Em parte", "Depende", "Outra"])).toContain("travessao-alternativa:media");
    expect(nomes(["Ocorre-se", "Em parte", "Depende", "Outra"])).not.toContain("travessao-alternativa:media");
  });

  test("explicação cita letra ≠ gabarito → alta; cita a do gabarito → nada", () => {
    const ops = ["Ocorre", "Em parte", "Depende", "Outra"];
    expect(nomes(ops, 0, "A alternativa B está errada porque nada disso ocorre.")).toContain("explicacao-cita-alternativa-errada:alta");
    expect(nomes(ops, 0, "A alternativa A está certa porque ocorre sempre.")).not.toContain("explicacao-cita-alternativa-errada:alta");
    // "C = cinzento" (alelo) e letras soltas não são alternativa
    expect(nomes(ops, 0, "O alelo C = cinzento domina; a opção A resume isso.")).not.toContain("explicacao-cita-alternativa-errada:alta");
  });

  test("item com afirmações rotuladas (A)/(B): as letras da explicação são do texto, não acusam (falso positivo conhecido)", () => {
    const rotulado = itemBase({
      pergunta:
        "Qual das sentenças abaixo viola a norma culta da língua portuguesa? (A) Fazem dois anos que não a vejo. (B) Houve muitos erros na prova. (C) Haviam poucos alunos na sala.",
      opcoes: ["Somente A", "A e C", "Somente B", "B e C"],
      correta: 1,
      explicacao:
        "Violam a norma a sentença (A), com fazer no plural, e a sentença (C), com haver no plural. A sentença B está correta, então a resposta é a que reúne apenas A e C, sem nenhuma outra.",
    });
    const r = validateExercise(rotulado, "por:x", ctxOk);
    expect(regras(r)).not.toContain("explicacao-cita-alternativa-errada");
    // Sem o formato rotulado, a mesma explicação citando "alternativa A" com gabarito B acusaria.
    expect(nomes(["Somente A", "A e C", "Somente B", "B e C"], 1, "A alternativa A está errada.")).toContain("explicacao-cita-alternativa-errada:alta");
    expect(nomes(["Somente A", "A e C", "Somente B", "B e C"], 1, "A alternativa A está errada.")).not.toEqual([]);
    expect(avisosDeForma(["a", "b", "c", "d"], 1, "A alternativa A está errada.", { ignorarLetras: true })).toEqual([]);
  });

  test("item sem como medir (uma alternativa, gabarito fora do intervalo) não quebra", () => {
    expect(avisosDeForma(["só uma"], 0)).toEqual([]);
    expect(avisosDeForma(["a", "b"], 5)).toEqual([]);
  });
});

describe("avisoPosicaoLote", () => {
  test("≥ 20 itens e uma posição acima de 40 % → info; exatamente 40 % ou lote pequeno → nada", () => {
    const quarentaECinco = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3]; // 9/20 = 45 %
    expect(avisoPosicaoLote(quarentaECinco)?.severidade).toBe("info");
    const quarenta = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]; // 8/20 = 40 %
    expect(avisoPosicaoLote(quarenta)).toBeNull();
    expect(avisoPosicaoLote([0, 0, 0, 0, 0])).toBeNull();
  });
});

describe("validateExercise — exceção registrada (falso positivo conhecido)", () => {
  // Resposta numérica com unidade é legitimamente mais longa que os distratores curtos.
  const numerica = itemBase({
    opcoes: ["2,5 metros por segundo ao quadrado", "2", "5", "10"],
    correta: 0,
  });
  const excecao = { id: "gen:mat:x:1", regra: "tamanho-correta-maior", motivo: "resposta numérica com unidade", registradoEm: "2026-09-28" };

  test("sem exceção o aviso aparece; com id+regra ele sai de warnings e vai para excecoes", () => {
    const sem = validateExercise(numerica, "mat:x", { ...ctxOk, itemId: "gen:mat:x:1" });
    expect(sev(sem, "tamanho-correta-maior")).toBe("alta");

    const com = validateExercise(numerica, "mat:x", { ...ctxOk, itemId: "gen:mat:x:1", excecoes: [excecao] });
    expect(regras(com)).not.toContain("tamanho-correta-maior");
    expect(com.excecoes.map((e) => e.regra)).toEqual(["tamanho-correta-maior"]);
    expect(com.ok).toBe(sem.ok);
  });

  test("exceção de OUTRO id ou de OUTRA regra não suprime", () => {
    const outroId = validateExercise(numerica, "mat:x", { ...ctxOk, itemId: "gen:mat:x:2", excecoes: [excecao] });
    expect(sev(outroId, "tamanho-correta-maior")).toBe("alta");
    const outraRegra = validateExercise(numerica, "mat:x", {
      ...ctxOk,
      itemId: "gen:mat:x:1",
      excecoes: [{ ...excecao, regra: "travessao-alternativa" }],
    });
    expect(sev(outraRegra, "tamanho-correta-maior")).toBe("alta");
  });

  test("parseExcecoes exige id, regra e motivo não vazio", () => {
    expect(parseExcecoes([])).toEqual([]);
    expect(parseExcecoes([excecao])).toHaveLength(1);
    expect(() => parseExcecoes([{ id: "x", regra: "y", motivo: "  " }])).toThrow();
    expect(() => parseExcecoes({} as unknown)).toThrow();
  });
});

describe("validateExercise — quase-duplicata (bigramas ≥ 0,4, só informa)", () => {
  test("enunciado parecido mas abaixo do bloqueio de 5-gramas → info, ok segue true", () => {
    const novo = itemBase({
      pergunta:
        "Calcule o volume de um cilindro com raio de 3 metros e altura de 10 metros, usando pi aproximado por 3,14 na conta final.",
    });
    const existente =
      "Calcule o volume de um cilindro com raio de 5 metros e altura de 8 metros, usando pi aproximado por 3,14 na conta final.";
    const r = validateExercise(novo, "mat:x", { ...ctxOk, existingStatementsBySkill: () => [existente] });
    expect(r.issues.some((i) => i.rule === "duplicata-semantica")).toBe(false);
    expect(sev(r, "quase-duplicata")).toBe("info");
    expect(r.ok).toBe(true);
  });

  test("enunciado sem relação não avisa", () => {
    const r = validateExercise(itemBase(), "mat:x", {
      ...ctxOk,
      existingStatementsBySkill: () => ["Qual é a capital do estado de Minas Gerais, conhecida por sua arquitetura histórica barroca?"],
    });
    expect(regras(r)).not.toContain("quase-duplicata");
  });
});

describe("isPublishable: aviso ALTO exige aprovação explícita (docs/36 T-07.2)", () => {
  const cand = (over: Partial<Candidate["stages"]> = {}): Candidate => ({
    candidateId: "l-1",
    skillId: "mat:x",
    difficulty: 2,
    role: "pratica",
    kind: "item",
    meta: {},
    stages: {
      validation: { ok: true, issues: [], warnings: [{ regra: "tamanho-correta-maior", severidade: "alta", detalhe: "x" }] },
      ...over,
    },
  });

  test("aprovação do lote por amostra NÃO libera item com aviso alto; `aprova` do item libera; `reprova` bloqueia", () => {
    expect(temAvisoAlto(cand())).toBe(true);
    expect(isPublishable(cand(), true)).toBe(false);
    expect(isPublishable(cand({ humanReview: { reviewer: "ia-delegada:sonnet", verdict: "aprova" } }), false)).toBe(true);
    expect(isPublishable(cand({ humanReview: { reviewer: "x", verdict: "reprova" } }), true)).toBe(false);
  });

  test("aviso média/info não muda nada: continua valendo a aprovação por amostra", () => {
    const c = cand({ validation: { ok: true, issues: [], warnings: [{ regra: "dispersao-tamanhos", severidade: "info", detalhe: "x" }] } });
    expect(temAvisoAlto(c)).toBe(false);
    expect(isPublishable(c, true)).toBe(true);
  });
});

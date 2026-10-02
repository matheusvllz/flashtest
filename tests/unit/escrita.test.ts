/**
 * Tarefas de escrita (spec 50 §5.10.1–5.10.2; T-50.11.1–11.3): validador do tipo `escrita`, catálogo das 12 tarefas
 * autorais, 20 temas de treino e a checagem automática (sem IA, não dá nota).
 */
import { describe, expect, test } from "bun:test";
import { TAREFAS_DE_ESCRITA, tarefaDeEscrita, tarefasDepoisDe } from "@/content/tarefas-escrita";
import { TRILHAS } from "@/content/trilhas";
import {
  checagemAutomatica,
  conectivosUsados,
  elementosDaProposta,
  LIMITES_DA_ESCRITA,
  linhasEstimadas,
  palavrasRepetidas,
  validarCatalogoDeEscrita,
  validarTarefaDeEscrita,
} from "@/lib/escrita";
import type { WritingTask } from "@/lib/lessons/types";
import { TEMAS_DE_TREINO, temaDaSemana } from "@/lib/redacao-ia";

const licoesPorTrilha = Object.fromEntries(TRILHAS.map((t) => [t.id, t.licoes.map((l) => l.id)]));

describe("catálogo de tarefas (T-50.11.2)", () => {
  test("12 tarefas válidas, 4 por trilha de redação, cada trilha com um texto completo", () => {
    expect(validarCatalogoDeEscrita(TAREFAS_DE_ESCRITA, licoesPorTrilha)).toEqual([]);
    expect(TAREFAS_DE_ESCRITA).toHaveLength(12);
    for (const trilha of ["redacao-estrutura", "redacao-argumentacao", "redacao-competencias"]) {
      const delas = TAREFAS_DE_ESCRITA.filter((t) => t.trilhaId === trilha);
      expect(delas).toHaveLength(4);
      expect(delas.filter((t) => t.modo === "completo")).toHaveLength(1);
    }
  });

  test("tudo rotulado como autoral do Foca, tema sempre de treino, sem gabarito", () => {
    for (const t of TAREFAS_DE_ESCRITA) {
      expect(t.autoria).toBe("foca");
      expect(TEMAS_DE_TREINO).toContain(t.exercicio.tema);
      expect("correta" in t.exercicio).toBe(false);
    }
  });

  test("o nó aparece depois da lição do assunto; busca por id", () => {
    expect(tarefasDepoisDe("redacao-estrutura-02-introducao-contextualizacao-tese").map((t) => t.id)).toEqual(["estrutura-introducao"]);
    expect(tarefaDeEscrita("competencias-texto-completo")?.modo).toBe("completo");
    expect(tarefaDeEscrita("nao-existe")).toBeNull();
  });

  test("textos-modelo e trechos: nenhum número inventado (só anos de leis e da Constituição) nem pesquisa citada", () => {
    for (const t of TAREFAS_DE_ESCRITA) {
      const tudo = [t.modelo.texto, t.exercicio.textoDeApoio?.texto ?? ""].join(" ");
      const numeros = tudo.match(/\d+/g) ?? [];
      // Só anos (1988, 1990, 2010, 2015) e a numeração "1." "2." dos argumentos dados.
      for (const n of numeros) expect(["1988", "1990", "2010", "2015", "1", "2"]).toContain(n);
      expect(/segundo (o|a) (ibge|ipea|oms|onu|unesco|pesquisa)|de acordo com (o|a) (ibge|pesquisa|oms)/i.test(tudo)).toBe(false);
      expect(/%/.test(tudo)).toBe(false);
    }
  });

  test("o texto completo modelo passa da checagem com estrutura de 4 parágrafos e proposta completa", () => {
    for (const t of TAREFAS_DE_ESCRITA.filter((x) => x.modo === "completo")) {
      const c = checagemAutomatica(t.modelo.texto, "completo");
      expect(c.paragrafos).toBe(4);
      expect(c.itens.find((i) => i.id === "proposta")?.estado).toBe("ok");
      expect(c.itens.find((i) => i.id === "conectivos")?.estado).toBe("ok");
      expect(c.linhas).toBeGreaterThan(7);
      expect(c.linhas).toBeLessThanOrEqual(30);
    }
  });
});

describe("temas de treino", () => {
  test("20 temas, sem repetição; nenhum é tema oficial do ENEM", () => {
    expect(TEMAS_DE_TREINO).toHaveLength(20);
    expect(new Set(TEMAS_DE_TREINO).size).toBe(20);
    // Temas oficiais recentes (INEP): nenhum tema de treino pode coincidir.
    const oficiais = [
      "Persistência da violência contra a mulher na sociedade brasileira",
      "Caminhos para combater a intolerância religiosa no Brasil",
      "Desafios para a formação educacional de surdos no Brasil",
      "Manipulação do comportamento do usuário pelo controle de dados na internet",
      "Democratização do acesso ao cinema no Brasil",
      "O estigma associado às doenças mentais na sociedade brasileira",
      "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil",
      "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
      "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil",
      "Desafios para a valorização da herança africana no Brasil",
    ].map((x) => x.toLowerCase());
    for (const t of TEMAS_DE_TREINO) expect(oficiais).not.toContain(t.toLowerCase());
    expect(TEMAS_DE_TREINO).toContain(temaDaSemana("2026-10-15"));
  });
});

describe("validador do tipo escrita (R-ESC-9)", () => {
  const base = TAREFAS_DE_ESCRITA[0];
  const com = (mut: (t: WritingTask) => void): WritingTask => {
    const t = structuredClone(base) as WritingTask;
    mut(t);
    return t;
  };

  test("recusa gabarito, tema fora da lista, limites fora do modo e modelo sem comentários", () => {
    expect(validarTarefaDeEscrita(base)).toEqual([]);
    expect(validarTarefaDeEscrita(com((t) => Object.assign(t.exercicio, { correta: 0 })))[0]).toContain("não tem correta");
    expect(validarTarefaDeEscrita(com((t) => (t.exercicio.tema = "Tema inventado")))[0]).toContain("tema");
    expect(validarTarefaDeEscrita(com((t) => (t.exercicio.limites = { min: 10, max: 2000 })))[0]).toContain("limites");
    expect(validarTarefaDeEscrita(com((t) => (t.modelo.comentarios = ["só um"])))[0]).toContain("comentários");
    expect(validarTarefaDeEscrita(com((t) => (t.id = "Id Ruim")))[0]).toContain("id");
  });

  test("catálogo recusa id repetido e lição que não está na trilha", () => {
    const outra = { ...base, depoisDe: "licao-que-nao-existe" };
    const erros = validarCatalogoDeEscrita([base, outra], licoesPorTrilha);
    expect(erros.some((e) => e.includes("id repetido"))).toBe(true);
    expect(erros.some((e) => e.includes("licao-que-nao-existe"))).toBe(true);
  });

  test("limites gerais: trecho 20–1.500, completo 400–5.000", () => {
    expect(LIMITES_DA_ESCRITA).toEqual({ trecho: { min: 20, max: 1500 }, completo: { min: 400, max: 5000 } });
  });
});

describe("checagem automática (T-50.11.3)", () => {
  test("linhas estimadas por parágrafo (70 caracteres por linha)", () => {
    expect(linhasEstimadas("a".repeat(70))).toBe(1);
    expect(linhasEstimadas(`${"a".repeat(71)}\n\nb`)).toBe(3);
    expect(linhasEstimadas("")).toBe(0);
  });

  test("conectivos sem acento e por palavra inteira; repetição ignora palavras curtas e comuns", () => {
    expect(conectivosUsados("Além disso, o tema é sério. Portanto, mas.")).toEqual(["alem disso", "mas", "portanto"]);
    expect(conectivosUsados("Massa e demais")).toEqual([]);
    expect(palavrasRepetidas("Leitura leitura LEITURA para para para casa", 3)).toEqual([{ palavra: "leitura", vezes: 3 }]);
  });

  test("os 5 elementos da proposta", () => {
    const e = elementosDaProposta("O governo deve criar bibliotecas, por meio de verbas, a fim de formar leitores, que leiam por exemplo jornais.");
    expect(Object.values(e).every(Boolean)).toBe(true);
    expect(elementosDaProposta("Precisamos melhorar isso.").agente).toBe(false);
  });

  test("trecho: frases soltas sem conectivo pedem atenção; mais de um parágrafo avisa", () => {
    const c = checagemAutomatica("As notícias falsas se espalham. As pessoas compartilham.\nOutro parágrafo.", "trecho");
    expect(c.itens.find((i) => i.id === "conectivos")?.estado).toBe("atencao");
    expect(c.itens.find((i) => i.id === "paragrafos")?.texto).toContain("um parágrafo");
    expect(c.elementos).toBeNull();
  });

  test("trecho com proposta checa os elementos; texto completo curto avisa das 7 linhas", () => {
    const p = checagemAutomatica("Precisamos melhorar isso.", "trecho", { checaProposta: true });
    expect(p.itens.find((i) => i.id === "proposta")?.estado).toBe("atencao");
    const curto = checagemAutomatica("Um texto curto demais para o ENEM. ".repeat(12), "completo");
    expect(curto.linhas).toBeLessThanOrEqual(7);
    expect(curto.itens.find((i) => i.id === "linhas")).toMatchObject({ estado: "atencao" });
    expect(curto.itens.find((i) => i.id === "linhas")?.texto).toContain("7 linhas");
  });

  test("nunca dá nota: nenhum item fala em pontos ou nota", () => {
    for (const t of TAREFAS_DE_ESCRITA) {
      const c = checagemAutomatica(t.modelo.texto, t.modo, { checaProposta: t.checaProposta });
      for (const i of c.itens) expect(/\bnota\b|pontos|\/1000|de 1000/i.test(i.texto)).toBe(false);
    }
  });

  test("determinística: o mesmo texto dá a mesma checagem", () => {
    const t = TAREFAS_DE_ESCRITA[3].modelo.texto;
    expect(checagemAutomatica(t, "completo")).toEqual(checagemAutomatica(t, "completo"));
  });
});

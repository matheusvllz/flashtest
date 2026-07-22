import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 01: Advérbio e locução adverbial
 * Tópico: Identificar advérbios, locuções adverbiais e suas funções
 */
export const adverbioLocucao = defineLesson({
  id: "classes-2-formacao-01-adverbio-locucao",
  titulo: "Advérbio e locução adverbial",
  descricao: "Palavras que modificam verbos, adjetivos e outros advérbios.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um advérbio?",
      opcoes: [
        "Uma palavra que modifica verbo, adjetivo ou outro advérbio, expressando circunstâncias",
        "Uma palavra que liga duas orações",
        "Uma classe de palavras que marca quantidade",
      ],
      correta: 0,
      explicacao:
        'Advérbio é o modificador por excelência: ele muda o sentido do verbo ("correr rápido"), do adjetivo ("muito bonito") ou de outro advérbio ("extremamente devagar"). Circunstâncias, não coisas.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Ela chegou cedo e ainda estudou bastante", "cedo" e "bastante" são advérbios.',
      verdadeiro: true,
      explicacao:
        "Ambos modificam o verbo e expressam circunstâncias (tempo e intensidade). Advérbio é isso: palavra que explica COMO, QUANDO, ONDE, POR QUÊ.",
    }),
    parear({
      instrucao: "Combine cada advérbio com a circunstância que expressa",
      pares: [
        { a: "Ele fala rapidamente.", b: "Modo" },
        { a: "Chegamos ontem.", b: "Tempo" },
        { a: "Procuramos lá.", b: "Lugar" },
        { a: "Ela é muito bonita.", b: "Intensidade" },
      ],
      explicacao:
        "Modo (como?), tempo (quando?), lugar (onde?), intensidade (quanto?): cada advérbio responde a uma pergunta diferente sobre a ação.",
    }),
    completeLacuna({
      frase: "Ela trabalha ___ e sempre atinge suas metas.",
      opcoes: ["dedicadamente", "muito dedicado", "dedico-me"],
      correta: 0,
      explicacao:
        'Advérbio é invariável: a forma correta é "dedicadamente". "Muito dedicado" é adjetivo (concordaria com sujeito), e "dedico-me" é verbo. Advérbio em -mente não muda.',
    }),
    multiplaEscolha({
      pergunta: "O que é uma locução adverbial?",
      opcoes: [
        "Um conjunto de palavras que funciona como advérbio",
        "Um tipo de vírgula que marca circunstância",
        "Um advérbio repetido na mesma frase",
      ],
      correta: 0,
      explicacao:
        'Locução adverbial é quando várias palavras juntas fazem o trabalho de um advérbio. Exemplos: "de noite", "em silêncio", "sem demora". O conjunto todo modifica verbo, adjetivo ou outro advérbio.',
    }),
    encontreOErro({
      frase: "O aluno respondeu o questionário muito correto.",
      erroIndex: 6,
      explicacao:
        'A palavra "correto" é adjetivo, e advérbio é invariável: quem responde, responde CORRETAMENTE, não "correto". "Muito correto" precisa virar "muito corretamente" ou "muito bem".',
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma locução adverbial pode ser substituída por um único advérbio com o mesmo sentido.",
      verdadeiro: true,
      explicacao:
        '"De manhã cedo" pode ser "cedo"; "sem demora" pode ser "imediatamente". Locução e advérbio simples têm a mesma função: só mudam o formato.',
    }),
    interpretacao({
      texto:
        'Os advérbios são ferramentas de precisão na linguagem. Não dizemos apenas "ele correu"; dizemos "ele correu rapidamente" ou "ele correu muito rápido". Quando precisamos de mais nuances, agrupamos palavras: "ele correu sem parar", "ele correu a noite inteira". A locução adverbial oferece essa riqueza de expressão que uma única palavra nem sempre alcança.',
      pergunta:
        "Segundo o texto, qual é a principal diferença entre um advérbio simples e uma locução adverbial?",
      opcoes: [
        "A locução adverbial oferece mais nuances de expressão",
        "O advérbio simples é mais correto que a locução",
        "A locução adverbial nunca pode ser substituída por um advérbio",
      ],
      correta: 0,
      explicacao:
        "Ambas fazem o mesmo trabalho, mas a locução oferece riqueza de expressão que uma única palavra nem sempre alcança. Cumprem funções equivalentes, com formatos diferentes.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa advérbio ou locução adverbial de forma correta?",
      opcoes: [
        "Estudo diariamente pela manhã.",
        "Ele agiu muito sensatamente com a situação.",
        "A menina dança muito gracioso no palco.",
      ],
      correta: 0,
      explicacao:
        'Em "diariamente" (advérbio simples) e "pela manhã" (locução adverbial), ambos modificam o verbo sem erros. As outras têm adjetivos onde deveriam ter advérbios.',
    }),
  ],
});

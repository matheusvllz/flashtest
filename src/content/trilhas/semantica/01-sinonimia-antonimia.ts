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
 * Sinonímia e antonímia: base de tudo que é palavra.
 * vocabulário de construção ("alicerce", "estrutura").
 */
export const sinonimiaAntonimia = defineLesson({
  id: "semantica-01-sinonimia-antonimia",
  titulo: "Sinonímia e antonímia",
  descricao: "Palavras que significam igual ou oposto: alicerce do vocabulário.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que são sinônimos?",
      opcoes: [
        "Palavras que têm significados iguais ou muito parecidos",
        "Palavras que significam o oposto uma da outra",
        "Palavras que têm a mesma grafia, mas som diferente",
      ],
      correta: 0,
      explicacao:
        'Sinônimos são palavras com sentido igual ou próximo. "Rápido" e "veloz" constroem a mesma ideia. Usar sinônimos evita repetição e dá solidez ao texto.',
    }),
    multiplaEscolha({
      pergunta:
        'Qual é o melhor sinônimo para "medo" neste contexto: "O atleta sentiu medo ao ver o adversário"?',
      opcoes: ["pavor", "timidez", "apreensão"],
      correta: 2,
      explicacao:
        "Pavor é muito forte, não cabe na situação. Timidez é traço de personalidade, não encaixa. Apreensão é o nervosismo diante do desconhecido: a base certa para o texto.",
    }),
    verdadeiroFalso({
      afirmacao: "Sinônimos sempre significam EXATAMENTE a mesma coisa, palavra por palavra.",
      verdadeiro: false,
      explicacao:
        'Sinônimos carregam a mesma ideia central, mas podem variar em tom e contexto. "Morrer" e "falecer" dizem o mesmo, mas falecer é mais formal. A escolha depende da estrutura que você quer montar.',
    }),
    multiplaEscolha({
      pergunta: "O que são antônimos?",
      opcoes: [
        "Palavras que significam o oposto uma da outra",
        "Palavras que soam parecido",
        "Palavras que aparecem juntas na frase",
      ],
      correta: 0,
      explicacao:
        'Antônimos constroem o contraste: "quente" e "frio", "entrada" e "saída". Dominar antônimos é montar a estrutura de paradoxo e antítese que dá força ao texto.',
    }),
    parear({
      instrucao: "Combine cada palavra com seu antônimo",
      pares: [
        { a: "coragem", b: "covardia" },
        { a: "clareza", b: "confusão" },
        { a: "ordem", b: "caos" },
      ],
      explicacao:
        "Os antônimos formam pares de oposição que estruturam a argumentação. Em um texto que fala de conflito, os antônimos trabalham como alicerces da construção de sentido.",
    }),
    completeLacuna({
      frase: "O discurso do candidato trouxe ___  onde havia confusão.",
      opcoes: ["caos", "clareza", "ruído"],
      correta: 1,
      explicacao:
        "Clareza é o antônimo de confusão: essa palavra fecha a estrutura da frase com o sentido oposto que o contexto pede.",
    }),
    interpretacao({
      texto:
        'O vocabulário é o alicerce de toda boa redação. Um escritor que conhece sinônimos consegue evitar repetição e matizar sentimentos: "pequeno", "minúsculo", "diminuto" dizem tamanho, mas cada um pinta de forma diferente. Já quem domina antônimos cria estruturas de contraste que prendem a atenção. Em uma redação sobre desigualdade social, o contraste entre "riqueza" e "pobreza" não é só palavras: é o fundamento da argumentação.',
      pergunta: "Segundo o texto, qual é a importância de dominar sinônimos na redação?",
      opcoes: [
        "Aumentar o tamanho do texto",
        "Evitar repetição e matizar sentimentos com palavras diferentes",
        "Fazer o texto parecer mais erudito",
      ],
      correta: 1,
      explicacao:
        'Sinônimos permitem construir o mesmo conceito com nuances diferentes. Não é ostentação: é precisão. Em uma redação que fala de medo, você tem "pavor", "terror", "pânico", cada um com sua própria estrutura de sentimento.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Em uma redação sobre conflito, os antônimos são ferramentas de estrutura argumentativa.",
      verdadeiro: true,
      explicacao:
        'Quando você constrói um argumento sobre conflito, os antônimos trabalham como pilares: "liberdade" versus "opressão". Isso não é só linguagem, é arquitetura do texto.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa sinônimos de forma mais eficaz?",
      opcoes: [
        "Ele correu rápido e depressa para chegar cedo.",
        "Ele correu apressado para chegar cedo.",
        "Ele correu depressa para chegar sem atraso.",
      ],
      correta: 2,
      explicacao:
        'A primeira frase tem redundância ("rápido" e "depressa" repetem a mesma ideia lado a lado, sem necessidade). A terceira constrói: correr depressa é ação, chegar sem atraso é consequência. Cada palavra tem seu papel estrutural na frase.',
    }),
  ],
});

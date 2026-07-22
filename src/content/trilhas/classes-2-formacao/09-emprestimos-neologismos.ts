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
 * Lição 09: Empréstimos e neologismos
 * Tópico: Palavras que chegam de outras línguas e palavras novas
 */
export const emprestimosNeologismos = defineLesson({
  id: "classes-2-formacao-09-emprestimos-neologismos",
  titulo: "Empréstimos e neologismos",
  descricao:
    "Palavras que vêm de outras línguas e palavras novas criadas pela comunidade de falantes.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um empréstimo linguístico?",
      opcoes: [
        "Palavra que uma língua pega emprestada de outra e incorpora ao seu acervo",
        "Uma palavra que perde o significado com o tempo",
        "Tipo de pontuação que marca dúvida",
      ],
      correta: 0,
      explicacao:
        'Empréstimo é quando uma língua toma de outra a palavra de que precisa. "Futebol" vem do inglês "football". "Computador" é uma criação portuguesa sobre "compute". Ambas são empréstimos ou adaptações.',
    }),
    parear({
      instrucao: "Combine cada palavra com sua origem (empréstimo ou adaptação)",
      pares: [
        { a: "Futebol (do inglês football)", b: "Adaptação de empréstimo" },
        { a: "Internet (do inglês internet)", b: "Empréstimo direto" },
        { a: "Computador (de compute)", b: "Criação portuguesa sobre empréstimo" },
      ],
      explicacao:
        "Empréstimo direto copia a palavra como vem; adaptação faz modificações fonéticas ou gramaticais; criação inventada toma a ideia de fora mas constrói a palavra localmente.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Neologismo é qualquer palavra nova criada pelos falantes, seja por empréstimo, derivação ou composição.",
      verdadeiro: true,
      explicacao:
        "Neologismo é o nome geral para palavra nova: pode vir de fora (empréstimo), ser derivada de raízes conhecidas, ou composta. O que define é ser nova para a língua.",
    }),
    completeLacuna({
      frase:
        'A palavra "selfie" é um ___ do inglês que foi incorporada ao português e virou neologismo usado amplamente.',
      opcoes: ["empréstimo", "prefixo", "radical"],
      correta: 0,
      explicacao:
        '"Selfie" vem do inglês e a gente adotou tal qual (com pequena acomodação de pronúncia). É um empréstimo linguístico que se tornou neologismo em português.',
    }),
    encontreOErro({
      frase:
        'O empresário usava constantemente expressões em inglês, como "business" e "startup", em suas reuniões formais.',
      erroIndex: 8,
      explicacao:
        'Empréstimos como "business" e "startup" em contexto formal português soam estrangeiros. Melhor seria "negócio" e "empresa iniciante" ou reconhecer que é jargão técnico específico. Na redação de ENEM, evita-se empréstimo desnecessário.',
    }),
    multiplaEscolha({
      pergunta: "Qual é a principal razão pela qual as línguas adotam empréstimos?",
      opcoes: [
        "Para nomear conceitos novos ou adotar uma palavra que já está bem estabelecida em outra língua",
        "Para tornar o texto mais bonito",
        "Para facilitar a memorização de palavras",
      ],
      correta: 0,
      explicacao:
        'Empréstimo não é capricho: é necessidade. "Computador" nomeia coisa nova. "Futebol" vem pronto e eficiente do inglês. A língua pragmática toma de fora quando vale à pena.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Neologismo é sempre uma palavra que entra no dicionário oficial. Se não estiver no dicionário, não é neologismo.",
      verdadeiro: false,
      explicacao:
        'Neologismo é palavra nova em circulação; nem sempre chega ao dicionário. "Cancelar" (censurar socialmente) é neologismo recente que AINDA está entrando no léxico e no dicionário. O dicionário documenta DEPOIS que a gente cria.',
    }),
    interpretacao({
      texto:
        'As línguas vivas respiram. Incorporam palavras de fora quando precisam nomear realidades novas ou quando outras línguas já têm a solução perfeita. "Ouiça", "rosbife", "pizza": empréstimos que ficaram. "Tweetar", "deletar", "printar": neologismos recentes que vieram com a tecnologia. No ENEM, a redação dissertativa em português formal exige cuidado com empréstimos. Usa-se quando não há alternativa elegante em português ("feedback" é mais conciso que "retroalimentação"), mas abusa-se não. O equilíbrio é marca de quem domina a língua.',
      pergunta: "Quando é apropriado usar empréstimos na redação de ENEM?",
      opcoes: [
        "Quando não há alternativa elegante e clara em português",
        "Sempre que possível, para soar sofisticado",
        "Nunca, pois empréstimos baixam a nota",
      ],
      correta: 0,
      explicacao:
        'Empréstimo justificado vale: "feedback" é mais conciso que "retroalimentação". Abuso de empréstimo marca desnecessário ou mostra fraqueza de vocabulário. No ENEM, qualidade manda.',
    }),
    multiplaEscolha({
      pergunta:
        "Qual palavra é exemplo de neologismo criado pelos falantes DENTRO do português, não empréstimo?",
      opcoes: [
        "Informática (info + mática, formação portuguesa)",
        "Internet (empréstimo direto do inglês)",
        "Chocolate (empréstimo do nahuatl via espanhol)",
      ],
      correta: 0,
      explicacao:
        '"Informática" foi criada em português: "informação" + "-ática". É neologismo de formação local. "Internet" é empréstimo. "Chocolate" vem de indígenas via espanhol. Estruturas diferentes.',
    }),
  ],
});

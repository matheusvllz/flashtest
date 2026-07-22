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
 * Lição 01: A regra de ouro da crase.
 * Zero emoji, zero travessão.
 */
export const craseARegra = defineLesson({
  id: "crase-01-a-regra-de-ouro",
  titulo: "A regra de ouro",
  descricao: 'Crase é preposição "a" + artigo "a". Simplesmente isso.',
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é crase?",
      opcoes: [
        'A fusão da preposição "a" com o artigo "a"',
        "Uma vírgula especial de alguns dialetos",
        "Um acento obrigatório em todas as palavras femininas",
      ],
      correta: 0,
      explicacao:
        'Crase é a contração de dois "a": o "a" preposição (aquele que pede regência) mais o "a" artigo feminino. Quando o "a" preposição encontra o "a" artigo, eles formam crase. Se viesse "ao" (a + o), não teria crase; só acontece com "a" feminino.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Se eu troco a palavra feminina por uma equivalente masculina e o resultado vira "ao", então ali tem crase.',
      verdadeiro: true,
      explicacao:
        'Essa é a bússola de verdade: troco o termo por um masculino e vejo o que sobra. "Fui à escola" vira "Fui ao colégio" (a + o = ao), então confirma a crase. "Fui a Pedro" vira "Fui a Paulo", continua só "a" solto, sem crase, porque nome de homem nunca traz artigo feminino.',
    }),
    completeLacuna({
      frase: "Estou indo___ festa de aniversário.",
      opcoes: ["à", "a", "ah"],
      correta: 0,
      explicacao:
        'Preposição "a" (indica destino, movimento) + artigo feminino "a" (antes de "festa") = crase. Funciona assim: "Estou indo da festa"? A ideia passa, então a preposição está lá, logo é crase.',
    }),
    multiplaEscolha({
      pergunta: 'Em qual frase a crase é CORRETA porque há preposição "a" + artigo "a"?',
      opcoes: [
        "Refiro-me àquela professora incrível.",
        "Respeito as mulheres fortes.",
        "Conheço a história desde pequeno.",
      ],
      correta: 0,
      explicacao:
        'Em "àquela", temos a preposição "a" (verbo "referir-se a") + o demonstrativo "aquela" que traz artigo "a" embutido. Nos outros, há o artigo puro e simples, mas sem preposição "a" na regência do verbo (respeito, conheço não pedem preposição "a").',
    }),
    parear({
      instrucao: "Relacione cada frase à sua análise correta",
      pares: [
        {
          a: "Assisti à peça de teatro ontem.",
          b: 'Preposição "a" (verbo assistir a) + artigo "a"',
        },
        {
          a: "Estou em um lugar aberto.",
          b: 'Sem preposição "a" nessa regência',
        },
        {
          a: "Paguei a mais por isso.",
          b: "Artigo puro antes de adjetivo, sem preposição",
        },
      ],
      explicacao:
        'Crase só existe quando OS DOIS "a" aparecem: o preposicional (que vem da regência do verbo) E o artigo feminino (que vem antes do substantivo ou demonstrativo feminino). Se um deles faltar, sem crase.',
    }),
    encontreOErro({
      frase: "Dirijo-me a aquela porta da sala de aula.",
      // Tokenização: Dirijo-me(0) a(1) aquela(2) porta(3) da(4) sala(5) de(6) aula(7)
      // O erro está em "a(1)" que deveria ser "à" porque "a" é preposição + "aquela" traz artigo
      erroIndex: 1,
      explicacao:
        'O verbo "dirigir-se" exige a preposição "a", e "aquela" é um demonstrativo que contém o artigo "a" em si. Então preposição + artigo = crase. Seria "Dirijo-me àquela porta". A preposição sozinha não marca crase.',
    }),
    interpretacao({
      texto:
        'A crase é um encontro de duas letras iguais que se fundem numa única com acento. Não é um acento mágico ou caprichoso: ele só aparece quando a preposição "a" (exigida pelo verbo ou expressão) se aproxima de um artigo "a" feminino (que vem antes da palavra). É como quando duas gotas de chuva se juntam numa só. Muitos alunos colocam crase em lugares aleatórios porque acham que é "coisa de feminino", mas a verdade é que crase é puramente sintática: depende de uma preposição regida, não do gênero da palavra só.',
      pergunta: "Segundo o texto, a crase aparece porque:",
      opcoes: [
        'A preposição "a" se encontra com um artigo "a" feminino',
        "As palavras femininas naturalmente pedem acento",
        "O escritor decide que quer usar um acento especial",
      ],
      correta: 0,
      explicacao:
        'Crase não é decoração: é fusão de duas estruturas gramaticais. Se só há artigo feminino e nenhuma preposição "a" antes (como em "Conheço a menina"), sem crase. Se há preposição "a" mas a palavra é masculina (como em "Fui a um lugar"), também sem crase. Só com OS DOIS juntos é que emerge a crase.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Toda vez que vejo uma palavra feminina, posso automaticamente colocar crase antes dela.",
      verdadeiro: false,
      explicacao:
        'Absolutamente não. A palavra ser feminina é necessária, mas não é suficiente. Você também precisa que haja uma preposição "a" regida pelo verbo ou expressão anterior. Exemplo: "Amo a natureza" (sem preposição "a" na regência de amar, só há artigo) e "Assisti à natureza" (com preposição "a" de assistir, aí sim crase). Mesmo termo feminino, contextos diferentes.',
    }),
  ],
});

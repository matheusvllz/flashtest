import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  ordenar,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Classes de Palavras I - Lição 02: Artigo e efeitos de sentido
 */
export const artigo = defineLesson({
  id: "classes-1-02-artigo",
  titulo: "Artigo e efeitos de sentido",
  descricao: "O pequeno determinante que muda tudo: a, um, aquele.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um artigo?",
      opcoes: [
        "Uma palavra que introduz o substantivo e indica se ele é definido ou indefinido",
        "Um verbo no gerúndio",
        "Um tipo de adjetivo que nunca muda",
      ],
      correta: 0,
      explicacao:
        'Artigo é o determinante que vem antes do substantivo: "o", "a", "um", "uma". Ele mostra se o substantivo é conhecido (definido: o, a) ou desconhecido (indefinido: um, uma).',
    }),
    verdadeiroFalso({
      afirmacao: 'A frase "Encontrei um gato" é diferente de "Encontrei o gato".',
      verdadeiro: true,
      explicacao:
        "Na primeira, o gato é novo pra você. Na segunda, é um gato específico que a gente já conhece. O artigo muda toda a cena, e isso é sentido puro.",
    }),
    parear({
      instrucao: "Identifique o tipo de artigo em cada frase",
      pares: [
        { a: "O livro estava na mesa.", b: "Artigo definido" },
        { a: "Uma criança entrou na sala.", b: "Artigo indefinido" },
        { a: "As professoras chegaram cedo.", b: "Artigo definido (plural)" },
      ],
      explicacao:
        "O, a, os, as são definidos (já conhecemos de quem se fala). Um, uma, uns, umas são indefinidos (é a primeira vez que mencionamos).",
    }),
    completeLacuna({
      frase: "Vi ___ menina chorar no pátio da escola.",
      opcoes: ["um", "uma", "o"],
      correta: 1,
      explicacao:
        'Uma é o artigo indefinido feminino: a menina é nova, a gente não sabe quem é. Se fosse "a menina", teríamos falado dela antes e ela seria conhecida.',
    }),
    encontreOErro({
      frase: "O aluno estudou com um dedicação impressionante.",
      erroIndex: 4,
      explicacao:
        'Dedicação é feminino, então o artigo deveria ser "uma", não "um". O artigo precisa concordar em gênero com o substantivo que vem depois.',
    }),
    multiplaEscolha({
      pergunta: "Em qual frase o artigo criou um efeito de sentido diferente?",
      opcoes: [
        "Entrei em uma casa e encontrei o senhor esperando.",
        "Entrei em uma casa e encontrei um senhor esperando.",
        "Entrei na casa e encontrei o senhor esperando.",
      ],
      correta: 1,
      explicacao:
        'Na opção B, "um senhor" é alguém desconhecido que o falante vê pela primeira vez. Na C, "o senhor" é alguém específico que a gente já esperava encontrar. Artigo muda a história.',
    }),
    verdadeiroFalso({
      afirmacao: "O artigo definido sempre aparece em nomes próprios de pessoas.",
      verdadeiro: false,
      explicacao:
        'A gente diz "João", não "o João" (salvo em dialetos e nomes regionais). Mas em nomes de rios, países e títulos, vale: "o Amazonas", "o Brasil", "o Corão".',
    }),
    completeLacuna({
      frase: "___ criança que vi era muito feliz.",
      opcoes: ["A", "Uma", "O"],
      correta: 0,
      explicacao:
        'A criança é uma menina específica que o falante já conhece ou já mencionou. Se fosse "uma", seria uma desconhecida. O tipo errado de artigo muda o sentido.',
    }),
    interpretacao({
      texto:
        'O artigo é um silencioso transformador de sentido. Na redação do ENEM, usar "um" no lugar de "o" (ou vice-versa) pode fazer sua tese perder força. Exemplo: "A globalização traz desafios" soa como uma verdade estabelecida. "Uma globalização traz desafios" soa vago, como se houvesse várias e você está falando de uma delas. O artigo define o que você está discutindo.',
      pergunta: "Por que o artigo é importante para a força de uma argumentação no ENEM?",
      opcoes: [
        "Porque deixa a frase mais bonita",
        "Porque marca o substantivo como específico ou geral, definindo a tese",
        "Porque é obrigatório em português",
      ],
      correta: 1,
      explicacao:
        "O artigo definido dá peso à sua tese, deixando claro que você fala de algo específico e bem definido, não de uma ideia vaga.",
    }),
  ],
});

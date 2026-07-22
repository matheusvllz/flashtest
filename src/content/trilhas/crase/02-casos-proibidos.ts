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
 * Lição 02: Casos PROIBIDOS de crase.
 * Quando o "a" preposição encontra uma barreira.
 */
export const casesProibidos = defineLesson({
  id: "crase-02-casos-proibidos",
  titulo: "Casos proibidos",
  descricao: "Crase NÃO existe quando faltam as duas condições.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual frase está ERRADA porque colocou crase onde não tinha que estar?",
      opcoes: [
        "Entreguei o relatório àquele colega de trabalho.",
        "Entreguei o relatório a um colega de trabalho.",
        "Entrego o relatório a ele todo dia.",
      ],
      correta: 2,
      explicacao:
        'Não existe crase antes de pronome pessoal. "Ele" é um pronome, não um artigo feminino. Mesmo que haja preposição "a" (de entregar algo a alguém), o pronome "ele" não admite crase porque não há artigo feminino ali. Os outros dois estão certos: em "àquele", há crase; em "a um", não há porque "um" é artigo indefinido masculino.',
    }),
    verdadeiroFalso({
      afirmacao: 'Posso escrever "Vou à Paulo" ou "Vou à João" normalmente.',
      verdadeiro: false,
      explicacao:
        '"Paulo" e "João" são nomes de homem. Crase só existe quando entra um "a" feminino, seja artigo, seja o "a" de aquele, aquela, aquilo. Nome masculino nunca recebe artigo feminino, então nunca leva crase. O certo é sempre "Vou a Paulo" e "Vou a João", sem acento.',
    }),
    completeLacuna({
      frase: "Ofereço o presente___ você com todo o carinho.",
      opcoes: ["a", "à"],
      correta: 0,
      explicacao:
        '"Você" é um pronome, não um substantivo feminino com artigo. Mesmo que a preposição "a" esteja ali (oferecer algo a alguém), o pronome bloqueia a crase. Sem artigo feminino, sem crase.',
    }),
    encontreOErro({
      frase: "Assistimos à um filme de ficção científica no cinema.",
      // Tokenização: Assistimos(0) à(1) um(2) filme(3) de(4) ficção(5) científica(6) no(7) cinema(8)
      // "Um" é artigo indefinido masculino: não existe artigo feminino ali, então não pode haver crase.
      // Erro em "à(1)", que deveria voltar a ser só "a".
      erroIndex: 1,
      explicacao:
        '"Um" é artigo indefinido masculino. A preposição "a" (de assistir a algo) até está lá, mas sem artigo feminino não tem com o que se fundir. O correto é "Assistimos a um filme", preposição solta, sem acento.',
    }),
    multiplaEscolha({
      pergunta: "Em qual alternativa há corretamente NENHUMA crase porque a palavra é masculina?",
      opcoes: [
        "Refiro-me àquele professor magnífico.",
        "Refiro-me a um professor magnífico.",
        "Refiro-me àquela professora magnífica.",
      ],
      correta: 1,
      explicacao:
        'Em "a um", o artigo "um" é indefinido e masculino. Há preposição "a" (referir-se a alguém), mas o artigo é masculino, então sem crase. Já "àquele" tem crase mesmo sendo demonstrativo masculino, porque "aquele" começa com "a" e é esse "a" que se funde com a preposição, não é erro. E "àquela" (demonstrativo feminino) tem crase pelo caminho de sempre, o artigo feminino.',
    }),
    parear({
      instrucao: "Combine a frase com o motivo da ausência de crase",
      pares: [
        {
          a: "Pedi informações a você.",
          b: "Pronome pessoal não recebe crase",
        },
        {
          a: "Ele voltou a estudar.",
          b: "Antes de verbo não há crase",
        },
        {
          a: "Dirigi-me a este rapaz.",
          b: "Demonstrativo masculino, sem crase",
        },
      ],
      explicacao:
        "Crase não funciona com pronomes pessoais (você, ele, ela, mim, ti, etc.) nem com termos masculinos, mesmo que haja preposição. Sem artigo feminino, sem crase. Simples assim.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Se o verbo requer preposição "a", eu SEMPRE coloco crase, independente de qual palavra vem depois.',
      verdadeiro: false,
      explicacao:
        'Errado. A preposição "a" é necessária, mas não é suficiente. A palavra que vem depois também precisa ser feminina com artigo, ou uma estrutura que traz artigo feminino (demonstrativo feminino, pronome feminino raro). Se a palavra é masculina, é pronome pessoal ou não admite artigo, a preposição "a" fica sozinha, sem crase.',
    }),
    interpretacao({
      texto:
        'Crase é bidirecional: depende tanto de quem vem antes (preposição "a") quanto de quem vem depois (artigo "a" feminino). Se um lado falha, a crase cai. Frases como "Fui a ela" são comuns na fala e corretas na escrita porque "ela" é pronome pessoal, que nunca admite crase. Já "Fui àquela mulher" tem crase porque "aquela" traz o artigo feminino. O erro mais comum é pensar que crase é "coisa de feminino": não é. É matemática: preposição + artigo = crase. Sem os dois, sem crase.',
      pergunta: 'Qual é a razão correta para não haver crase em "Referi-me a ela"?',
      opcoes: [
        "Ela é pronome pessoal, que não recebe artigo feminino",
        "O verbo referir-se não exige preposição",
        "Crase só aparece com substantivos próprios femininos",
      ],
      correta: 0,
      explicacao:
        'Pronomes pessoais são a razão número um de erros de crase. Eles nunca recebem artigo, então mesmo com preposição "a" anterior, sem crase. "A ela", "a você", "a mim" são sempre assim na forma correta.',
    }),
    encontreOErro({
      frase: "Entreguei o documento à ele pessoalmente.",
      // Tokenização: Entreguei(0) o(1) documento(2) à(3) ele(4) pessoalmente(5)
      // "Ele" é pronome pessoal, não deve vir com crase. Erro em "à(3)"
      erroIndex: 3,
      explicacao:
        '"Ele" é pronome pessoal masculino. Pronomes pessoais nunca recebem artigo, logo nunca recebem crase. O correto é "Entreguei o documento a ele". A preposição fica sozinha, sem acento.',
    }),
  ],
});

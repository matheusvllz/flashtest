import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  ordenar,
  interpretacao,
} from "@/lib/lessons/define";

/**
 * Lição 07: Complemento nominal
 */
export const complementoNominal = defineLesson({
  id: "sintaxe-1-07-complemento-nominal",
  titulo: "Complemento nominal",
  descricao: "O complemento que alimenta nomes e adjetivos, não verbos.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é complemento nominal?",
      opcoes: [
        "Um complemento que completa o sentido de um verbo",
        "Um complemento que completa o sentido de um nome ou adjetivo",
        "Qualquer palavra que vem depois de um substantivo",
      ],
      correta: 1,
      explicacao:
        'Complemento nominal alimenta nomes e adjetivos. Em "Amor pela família", o nome "amor" precisa de "pela família" pra fazer sentido. Estrutura que sustenta o não-verbal.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem complemento nominal?",
      opcoes: [
        "Ela partiu de madrugada.",
        "O medo de altura paralisa algumas pessoas.",
        "Eles desciam a montanha lentamente.",
      ],
      correta: 1,
      explicacao:
        'Em "medo de altura", o nome "medo" carece de complemento. "De altura" completa seu sentido: medo do quê? Estrutura que fechan sentido do nome.',
    }),
    verdadeiroFalso({
      afirmacao: "Complemento nominal é sempre introduzido por preposição.",
      verdadeiro: true,
      explicacao:
        'Verdadeiro. Diferente do objeto direto (sem preposição), complemento nominal SEMPRE tem preposição. "Respeito a", "desejo por", "aversão a".',
    }),
    completeLacuna({
      frase:
        'Em "A necessidade ___ estudo constante é real", o complemento nominal é introduzido pela preposição.',
      opcoes: ["de", "para", "por"],
      correta: 0,
      explicacao:
        'Necessidade DE estudo: o nome "necessidade" pede o complemento "estudo" via preposição "de". Sem ela, soa quebrado. Fundação preposicional.',
    }),
    encontreOErro({
      frase: "A capacidade em resolver problemas é fundamental para o sucesso.",
      erroIndex: 2,
      explicacao:
        'O nome "capacidade" toma complemento com DE, não EM: "capacidade de resolver". A preposição "em" é estrangeira aqui. Português correto exige "de".',
    }),
    parear({
      instrucao: "Associe cada nome com seu complemento correto",
      pares: [
        { a: "Esperança", b: "em dias melhores" },
        { a: "Interesse", b: "pela leitura" },
        { a: "Aversão", b: "a conflitos" },
      ],
      explicacao:
        "Todos esses nomes precisam de preposição pra fazer sentido pleno. Esperança em, interesse por, aversão a: cada um pede seu complemento nominal exato. Estrutura que sustenta.",
    }),
    verdadeiroFalso({
      afirmacao: "Um adjetivo nunca precisa de complemento nominal.",
      verdadeiro: false,
      explicacao:
        'Falso. Adjetivos como "apto", "acostumado", "averso" carregam complemento nominal: "apto a estudar", "acostumado com barulho", "averso a mentiras".',
    }),
    ordenar({
      blocos: ["Complemento nominal", "é o complemento", "que sacia", "nomes e adjetivos."],
      explicacao:
        "A ordem mostra a distinção: não é verbo que recebe, mas nome ou adjetivo. Estrutura paralela à do objeto, mas plantada em solo não-verbal.",
    }),
    interpretacao({
      texto:
        'Dominar complemento nominal permite escrever com precisão. Frases como "A falta de educação" soam naturais só porque o complemento está certo. Muitos alunos escrevem "falta em educação" (errado), "dependência de drogas" (certo), sem entender a diferença. Mas o ouvido de quem lê sente: uma soa estranha, a outra, sólida. O redator que estrutura complementos nominais corretamente semeia confiança no texto.',
      pergunta: "Conforme o texto, qual é o efeito de usar complementos nominais incorretos?",
      opcoes: [
        "O texto soa estranha, quebrando a confiança do leitor",
        "O significado muda completamente",
        "O texto fica mais curto mas menos denso",
      ],
      correta: 0,
      explicacao:
        "O desconforto é auditivo: o ouvido sente que algo está errado. Essa falta de segurança estrutural esfarela a confiança no texto. Correção é alicerce.",
    }),
  ],
});

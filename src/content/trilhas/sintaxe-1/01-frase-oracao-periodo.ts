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
 * Lição 01: Frase, oração e período
 */
export const fraseOracaoPeriodo = defineLesson({
  id: "sintaxe-1-01-frase-oracao-periodo",
  titulo: "Frase, oração e período",
  descricao: "Os alicerces: a diferença entre frase, oração e período simples.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma frase?",
      opcoes: [
        "Qualquer palavra ou conjunto de palavras com sentido completo",
        "Um conjunto de palavras que sempre tem verbo",
        "Uma oração com dois pontos de vista",
      ],
      correta: 0,
      explicacao:
        'Frase é a menor unidade de comunicação. Pode ser uma palavra ("Fogo!") ou várias, com ou sem verbo. O que importa é o sentido estar fechado.',
    }),
    verdadeiroFalso({
      afirmacao: "Toda frase é uma oração.",
      verdadeiro: false,
      explicacao:
        'Falso. A frase é mais ampla: "Que dia!" é uma frase, mas não é oração porque não tem verbo. Oração é a frase que contém um verbo e estrutura sintática.',
    }),
    multiplaEscolha({
      pergunta: "Qual destes é um período simples?",
      opcoes: [
        "Comprei pão na padaria.",
        "Comprei pão e saí correndo.",
        "Quando cheguei na padaria, a fila estava grande.",
      ],
      correta: 0,
      explicacao:
        "Período simples tem uma oração só: sujeito e verbo (e companhia). Os outros dois têm mais de uma oração e por isso são períodos compostos.",
    }),
    encontreOErro({
      frase: "O gato subiu árvore rapidamente para escapar.",
      erroIndex: 3,
      explicacao:
        'Falta preposição antes de "árvore": não é "subiu árvore", é "subiu na árvore". Sem a preposição, a estrutura fica manca e a oração perde clareza.',
    }),
    parear({
      instrucao: "Relacione cada estrutura com seu termo correto",
      pares: [
        { a: "Saúde é tudo.", b: "Período simples" },
        { a: "Saúde é tudo, mas dinheiro também ajuda.", b: "Período composto" },
        { a: "Que dia lindo!", b: "Frase sem verbo" },
      ],
      explicacao:
        "Período simples = uma oração. Período composto = duas ou mais. Frase pode ser um grito, uma palavra solta, sem precisar de verbo.",
    }),
    completeLacuna({
      frase: "Uma oração sempre precisa ter pelo menos um ___, o núcleo da estrutura.",
      opcoes: ["verbo", "sujeito", "objeto"],
      correta: 0,
      explicacao:
        "O verbo é a coluna vertebral. Alguns períodos têm sujeito indeterminado, orações sem sujeito, mas verbo nunca falta em oração.",
    }),
    verdadeiroFalso({
      afirmacao: '"Chove" é uma oração e também um período simples.',
      verdadeiro: true,
      explicacao:
        'Correto. "Chove" é uma oração porque tem verbo (e estrutura sintática). Como tem apenas uma oração, é um período simples também.',
    }),
    ordenar({
      blocos: ["Uma frase", "tem sentido completo,", "uma oração", "tem verbo."],
      explicacao:
        "A ordem mostra a relação: frase é o termo mais abrangente, oração é um tipo especial de frase que sempre carrega verbo.",
    }),
    interpretacao({
      texto:
        "A estrutura de uma redação se apoia em períodos. Um período simples direto cria clareza; vários períodos compostos deixam a leitura pesada. A escolha entre simples e composto não é capricho: é ritmo, é respiração da prosa. Um bom redator sabe quando quebrar o pensamento em orações curtas e quando amarrá-las num período longo.",
      pergunta:
        "Conforme o texto, qual é o principal impacto de usar períodos simples ou compostos?",
      opcoes: [
        "O ritmo e a resposta do leitor",
        "A quantidade de verbos na frase",
        "O tamanho total da redação",
      ],
      correta: 0,
      explicacao:
        "O texto deixa claro: a escolha é questão de ritmo e respiração. Períodos simples criam ritmo direto; compostos, mais denso. É instrumento do redator.",
    }),
  ],
});

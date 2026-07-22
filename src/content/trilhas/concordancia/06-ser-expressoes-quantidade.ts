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
 * Lição 06 da trilha de Concordância: ser + expressões de quantidade.
 */
export const serExpressoesQuantidade = defineLesson({
  id: "concordancia-06-ser-expressoes-quantidade",
  titulo: "Ser + expressões de quantidade",
  descricao: "Como o verbo SER concorda com números, porcentagens e medidas.",
  exercicios: [
    multiplaEscolha({
      pergunta: 'Como o verbo SER concorda em "Vinte quilos é demais para carregar"?',
      opcoes: [
        'Com "vinte quilos" (núcleo "quilos", plural), então verbo plural "são".',
        'Com "vinte" (número singular), então verbo singular "é".',
        "Pode ser singular ou plural, não há regra fixa.",
      ],
      correta: 1,
      explicacao:
        'Números funcionam como singulares diante do verbo SER: "Vinte quilos é demais". O "é" concorda com o número total, não com a unidade. Parece estranho ao ouvido, mas é a regra.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Três maçãs são frutas", o verbo "são" está correto porque concorda com "maçãs" (plural).',
      verdadeiro: true,
      explicacao:
        'Aqui "são" é PLURAL mesmo, porque temos DE FATO várias maçãs (três indivíduos). Quando falamos de vários seres, pode ir para plural. Mas em quantidade/medida ("Três maçãs é pouco"), fica singular.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem concordância correta com SER e quantidade?",
      opcoes: [
        "Cinquenta por cento dos votos são para o candidato A.",
        "Cinquenta por cento dos votos é para o candidato A.",
        "Cinquenta por cento dos votos foi para o candidato A.",
      ],
      correta: 0,
      explicacao:
        'Porcentagem com plural ("dos votos") permite verbo plural "são". Se fosse "50% da população", aí seria "é" (singular). O número do complemento importa aqui.',
    }),
    completeLacuna({
      frase: "Dois litros de leite ___ suficiente para o bolo.",
      opcoes: ["é", "são"],
      correta: 0,
      explicacao:
        'Medida como sujeito: "Dois litros" é uma quantidade (núcleo), logo verbo singular "é". Não é "dois litros foram"; é "a quantidade de dois litros é".',
    }),
    encontreOErro({
      frase: "Vinte e cinco reais são muito caro para este livro usado.",
      erroIndex: 6,
      explicacao:
        'Verbo "são" é PLURAL, o que está certo aqui ("25 reais" plural). Mas "caro" (adjetivo) deveria ser "caros" (plural) para concordar com "reais". O erro é no adjetivo, não no verbo. Nesta frase temos concordância verbal correta, só nominais em falta.',
    }),
    parear({
      instrucao: "Combine cada frase com a regra de concordância",
      pares: [
        { a: "Dez alunos é pouco para este projeto.", b: "Quantidade (SER singular)" },
        { a: "Dez alunos são inteligentes.", b: "Característica (SER plural)" },
        { a: "Dois quilos é o peso ideal.", b: "Medida (SER singular)" },
      ],
      explicacao:
        "SER muda de número conforme o contexto: quantidade/medida fica singular, mas característica de vários seres fica plural.",
    }),
    ordenar({
      blocos: ["Mil", "reais", "é", "um", "bom", "orçamento."],
      explicacao:
        'Medida como sujeito: "Mil reais" (quantidade) + verbo singular "é". Não há sujeito múltiplo realizando ação; há uma soma/medida sendo caracterizada.',
    }),
    interpretacao({
      texto:
        'O verbo SER é especial: ele não apenas liga sujeito e predicado, mas às vezes inverte a concordância. Quando o sujeito é um número ou medida, o SER fica singular: "Vinte quilos é demais." Quando o sujeito é um grupo de seres recebendo característica, o SER pode ir para plural: "Os vinte quilos são pesados" (os quilos, em si, são pesados). A diferença está no sentido: em "Vinte quilos é a meta", "vinte quilos" é uma QUANTIDADE (singular). Em "Os vinte quilos são distribuídos igualmente", "quilos" são INDIVÍDUOS (plural) recebendo ação. O contexto define o número.',
      pergunta:
        'Qual é a diferença de sentido entre "Vinte quilos é demais" e "Os vinte quilos são divididos"?',
      opcoes: [
        "Na primeira, temos uma quantidade; na segunda, temos indivíduos sendo distribuídos",
        "A primeira está errada e a segunda correta",
        "Não há diferença; os dois estão igualmente certos",
      ],
      correta: 0,
      explicacao:
        'O texto explica: "vinte quilos" como QUANTIDADE é singular. "Os vinte quilos" como ELEMENTOS sendo distribuídos é plural. Mesmo número, sentidos diferentes, regras diferentes.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Trezentos reais é muito pouco para um mês", o verbo singular "é" está correto porque trata a quantia como uma medida.',
      verdadeiro: true,
      explicacao:
        'Sim: "trezentos reais" é uma QUANTIA, uma medida de valor. O verbo SER fica singular "é" neste contexto de quantidade.',
    }),
  ],
});

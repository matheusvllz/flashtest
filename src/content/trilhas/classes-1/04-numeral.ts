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
 * Classes de Palavras I - Lição 04: Numeral
 */
export const numeral = defineLesson({
  id: "classes-1-04-numeral",
  titulo: "Numeral",
  descricao: "A palavra que conta e ordena: um, segundo, metade.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um numeral?",
      opcoes: [
        "Uma palavra que expressa quantidade, ordem ou fração",
        "Um número escrito só com algarismos",
        "Um adjetivo que fala de cores",
      ],
      correta: 0,
      explicacao:
        "Numeral é a palavra que fala de quantidade (três, múltiplo), ordem (primeiro, segundo), fração (metade, um terço) e multiplicidade (dobro, triplo).",
    }),
    verdadeiroFalso({
      afirmacao: 'Em "Ela era a primeira da turma", a palavra "primeira" é um numeral.',
      verdadeiro: true,
      explicacao:
        "Primeira é um numeral ordinal, que marca a posição na sequência. Ordinais: primeiro, segundo, terceiro, décimo... todos contam posição.",
    }),
    parear({
      instrucao: "Classifique cada numeral conforme seu tipo",
      pares: [
        { a: "Tenho cinco livros.", b: "Numeral cardinal" },
        { a: "Chegou em terceiro lugar.", b: "Numeral ordinal" },
        { a: "O triplo de dez é trinta.", b: "Numeral multiplicativo" },
        { a: "Comi um quarto da pizza.", b: "Numeral fracionário" },
      ],
      explicacao:
        "Cardinais contam quantidade (um, dois, dez). Ordinais marcam ordem (segundo, oitavo). Multiplicativos multiplicam (dobro, triplo). Fracionários dividem (metade, terço).",
    }),
    completeLacuna({
      frase: "Estudei por ___ horas seguidas para a prova.",
      opcoes: ["três", "terceira", "tríplice"],
      correta: 0,
      explicacao:
        "Três é o numeral cardinal correto, quantificando as horas. Terceira é ordinal (terceira hora do dia). Tríplice é adjetivo, não serve aí.",
    }),
    encontreOErro({
      frase: "Ele ganhou o primeira prêmio da competição ontem.",
      erroIndex: 3,
      explicacao:
        'Primeira concorda em gênero e número com "prêmio" (masculino, singular), então deveria ser "primeiro". Numeral ordinal tem que concordar.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa corretamente um numeral multiplicativo ou fracionário?",
      opcoes: [
        "Bebi cinco xícaras de café.",
        "A herança foi dividida em terceiro partes iguais.",
        "O lucro foi o dobro do ano anterior.",
      ],
      correta: 2,
      explicacao:
        'A opção C usa "dobro" (multiplicativo) de forma correta. A opção A usa cardinal (cinco), não multiplicativo. A opção B tem erro: "terceiro" deveria ser "três".',
    }),
    verdadeiroFalso({
      afirmacao: "Os numerais podem ser flexionados em gênero e número, dependendo do contexto.",
      verdadeiro: true,
      explicacao:
        'Um, uma (gênero). Primeiro, primeira (gênero). Alguns numerais variam: "Os primeiros alunos" vs "As primeiras alunas". Nem todos variam (três, dez).',
    }),
    completeLacuna({
      frase: "Ele alcançou a ___ colocação no ranking nacional de xadrez.",
      opcoes: ["vigésima", "vinte", "vintenária"],
      correta: 0,
      explicacao:
        'Vigésima é o ordinal feminino, combinando com "colocação". Vinte é cardinal. Vintenária não existe em português. O ordinal é a forma certa aqui.',
    }),
    interpretacao({
      texto:
        'Na escrita acadêmica e em redações do ENEM, o uso correto dos numerais importa para a credibilidade do texto. Quando você cita dados (uma pesquisa mostrou que 45% dos alunos...), deve usar o cardinal. Quando ordena ideias (em primeiro lugar, em segundo lugar), use ordinais. A confusão entre "primeira" e "um" ou "segundo" e "dois" é sutil, mas um avaliador atento nota e subtrai pontos.',
      pergunta: "Por que o uso correto dos numerais é importante em uma redação acadêmica?",
      opcoes: [
        "Porque números são mais bonitos que palavras",
        "Porque marca credibilidade e clareza da argumentação",
        "Porque é regra obrigatória em todas as línguas",
      ],
      correta: 1,
      explicacao:
        "O texto ressalta que a confusão de numerais afeta a credibilidade e a clareza. Ordinais e cardinais servem a funções diferentes, e usar certo eleva a qualidade.",
    }),
  ],
});

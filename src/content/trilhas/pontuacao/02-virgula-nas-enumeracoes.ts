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
 * Lição 02 da trilha de pontuação: vírgula nas enumerações.
 * Enumeração é quando você lista itens (palavras, expressões, orações).
 */
export const virgulaNasEnumeracoes = defineLesson({
  id: "pontuacao-02-virgula-nas-enumeracoes",
  titulo: "Vírgula nas enumerações",
  descricao: "A vírgula que lista, enumera e organiza itens: a costura do pensamento no papel.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma enumeração?",
      opcoes: [
        "Uma lista de itens separados por vírgulas",
        "Qualquer frase que tem muitas palavras",
        "Um termo que explica outro termo",
      ],
      correta: 0,
      explicacao:
        'Enumeração é quando você lista: "Estudo português, matemática, história e física." Os itens falam a mesma língua e a vírgula os separa para o leitor respirar.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase enumera os itens do jeito certo?",
      opcoes: [
        "Preciso de lápis, borracha, caderno e régua.",
        "Preciso de lápis borracha caderno e régua.",
        "Preciso de lápis, borracha, caderno, e régua.",
      ],
      correta: 0,
      explicacao:
        'Vírgula separa os itens até o penúltimo. Depois vem "e" com o último item direto, sem vírgula extra. Isso é elegância: economia de pontuação.',
    }),
    verdadeiroFalso({
      afirmacao: 'A vírgula antes do "e" é sempre proibida, em qualquer frase.',
      verdadeiro: false,
      explicacao:
        'Na lista simples ela sobra mesmo. Mas a vírgula aparece antes do "e" quando ele liga orações de sujeitos diferentes: "Ela saiu, e o irmão ficou". Regra tem contexto.',
    }),
    encontreOErro({
      frase: "Ela gosta de ler, escrever ouvir música e desenhar.",
      erroIndex: 4,
      explicacao:
        'A vírgula sumiu depois de "escrever". Numa enumeração, todos os itens seguem o mesmo padrão: "ler, escrever, ouvir música e desenhar". Nada de pular vírgula no meio do caminho.',
    }),
    completeLacuna({
      frase: "O relatório deve incluir introdução___ desenvolvimento, conclusão e referências.",
      opcoes: [",", ";", "nada"],
      correta: 0,
      explicacao:
        'Enumeração simples pede vírgula entre os itens: "introdução, desenvolvimento, conclusão e referências". O ponto e vírgula só entra quando os itens têm vírgulas por dentro.',
    }),
    parear({
      instrucao: "Combine cada frase com o tipo de enumeração que ela tem",
      pares: [
        { a: "Estudei física, química, biologia.", b: "Enumeração simples" },
        {
          a: "Trouxe um livro; um caderno, lápis e borracha; e uma mochila.",
          b: "Enumeração complexa com subgrupos",
        },
        { a: "Acordei, tomei café e saí.", b: "Enumeração de ações" },
      ],
      explicacao:
        "Enumeração simples usa só vírgula. Quando cada item tem internamente vírgulas, o ponto-e-vírgula agrupa: é complexa. E ações (verbos) listam do mesmo jeito que coisas (nomes): a regra é universal.",
    }),
    encontreOErro({
      frase: "Na festa havia músicos, dançarinos cantores e fotógrafos.",
      erroIndex: 4,
      explicacao:
        'Faltou vírgula depois de "dançarinos": sem ela, "dançarinos cantores" vira uma coisa só. Cada item da lista merece a própria vírgula até o penúltimo.',
    }),
    ordenar({
      blocos: ["O ENEM avalia", "linguagens, matemática, ciências naturais", "e ciências humanas."],
      explicacao:
        'Enumeração com "e" no final: lista tudo com vírgula e amarra o último item com o "e". Sujeito e verbo abrem o caminho, a lista vem depois.',
    }),
    interpretacao({
      texto:
        'A enumeração é a ferramenta que transforma um pensamento caótico em lista clara. "Na viagem, levei camisetas, calças, meias, sapatos, um casaco e um chapéu" é muito mais legível do que "Na viagem levei camisetas calças meias sapatos um casaco um chapéu." A vírgula aqui não é pausa estilística: é sinal de trânsito. Ela avisa: atenção, mais um item vem aí. O leitor quer saber quantos itens você enumera, em que ordem, e quando a lista termina. Sem vírgula, tudo vira um muro de palavras.',
      pergunta: "Segundo o texto, qual é a função principal da vírgula na enumeração?",
      opcoes: [
        "Avisar que mais um item vem, deixando a leitura clara e organizada",
        "Fazer o texto parecer mais bonito e comprido",
        "Apenas criar uma pausa para o leitor respirar",
      ],
      correta: 0,
      explicacao:
        "A vírgula na enumeração não é pausa poética: é sinal de trânsito mesmo. Ela estrutura o pensamento, divide itens e avisa o leitor. É semântica pura, não estética.",
    }),
  ],
});

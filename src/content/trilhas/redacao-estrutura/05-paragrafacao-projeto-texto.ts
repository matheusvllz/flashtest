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
 * Lição 05: Paragrafação e projeto de texto
 */
export const paragrafacaoProjetoTexto = defineLesson({
  id: "redacao-estrutura-05-paragrafacao-projeto-texto",
  titulo: "Paragrafação e projeto de texto",
  descricao: "Organização visual e mental: como estruturar seus argumentos em parágrafos.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um projeto de texto?",
      opcoes: [
        "Um desenho que o aluno faz no rascunho",
        "O planejamento mental ou escrito do texto antes de redigi-lo, indicando estrutura, argumentos e progressão",
        "Um esboço de apenas uma página sem importância real",
      ],
      correta: 1,
      explicacao:
        'Projeto é alicerce. É você pensando: "vou introduzir assim, argumentar sobre inclusão digital no parágrafo 2, depois impacto econômico no 3, depois proposta de intervenção." Quem planeja evita repetições, garante progressão e economiza tempo.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Um texto bem estruturado deve ter no mínimo um parágrafo de introdução, dois ou três de desenvolvimento e um de conclusão.",
      verdadeiro: true,
      explicacao:
        'Essa é a proporção clássica e funciona bem. Claro, você pode ter quatro parágrafos de desenvolvimento se houver argumentos distintos e bem fundamentados. Mas o mínimo de "dois de desenvolvimento" garante que você não vai respeitar sua tese com um único argumento.',
    }),
    multiplaEscolha({
      pergunta: "Qual é a função básica de um parágrafo?",
      opcoes: [
        "Ocupar espaço na página",
        "Separar ideias visualmente e desenvolver uma ideia central com seus desdobramentos",
        "Fazer o texto ficar mais longo",
      ],
      correta: 1,
      explicacao:
        "Parágrafo é unidade de pensamento. Cada um cumpre uma missão: introduz a tese, apresenta um argumento, expande sobre outro, encerra com a proposta. Sem paragrafação clara, o texto vira uma massa confusa, mesmo que bem escrito.",
    }),
    completeLacuna({
      frase:
        "Um parágrafo único, mesmo que bem argumentado, prejudica a leitura porque não permite ___ clara entre ideias distintas.",
      opcoes: ["repetição", "separação", "conexão"],
      correta: 1,
      explicacao:
        "Separação, divisão visual. Quando tudo está num bloco único, o leitor se perde: cadê a ideia um, cadê a dois? A paragrafação organiza o pensamento no espaço. É leitura facilitada, e isso conta na Competência IV (coesão).",
    }),
    parear({
      instrucao: "Relacione cada tipo de parágrafo com sua função",
      pares: [
        { a: "Parágrafo de introdução", b: "Contextualiza e expõe a tese central" },
        {
          a: "Parágrafo de desenvolvimento",
          b: "Apresenta um argumento específico e o fundamenta",
        },
        {
          a: "Parágrafo de conclusão",
          b: "Retoma a discussão e apresenta a proposta de intervenção",
        },
      ],
      explicacao:
        "Cada parágrafo tem seu ofício. Introdução abre, desenvolvimento sustenta, conclusão fecha e orienta para ação. Misturar funções no mesmo parágrafo enfraquece a estrutura.",
    }),
    encontreOErro({
      frase:
        "A educação digital transformará a sociedade porque acessa mais pessoas e tecnologia é importante para o futuro das crianças no Brasil.",
      erroIndex: 13,
      explicacao:
        'Repare em "importante": o problema não é gramatical, é estrutural. Dizer que a tecnologia "é importante" é vago, não fundamenta nada; dizer que "acessa mais pessoas" é bom, mas precisa de exemplo. O tópico frasal existe, mas a fundamentação é fraca: dados, exemplos, análise mais funda garantem a Competência III.',
    }),
    ordenar({
      blocos: [
        "Você escuta a prova, lê a proposta e constrói seu projeto",
        "O projeto de texto organiza mentalmente quantos parágrafos serão, em que ordem",
        "Você planejou: introdução, dois argumentos, conclusão",
        "Cada parágrafo do desenvolvimento trabalha um aspecto do tema",
        "Você redige respeitando esse projeto, sem desvios",
        "Assim você garante coesão e progressão clara",
      ],
      explicacao:
        "Essa é a respiração do trabalho: planejamento, execução fiel, entrega organizada. Quem pula o projeto sofre depois com repetições, desorganização e falta de tempo para revisar.",
    }),
    multiplaEscolha({
      pergunta:
        "Qual estrutura de paragrafação melhor organiza um texto dissertativo sobre educação digital?",
      opcoes: [
        "Um parágrafo com tudo junto: problema, argumentos, proposta, sem separação clara",
        "Parágrafo 1 (introdução/tese), Parágrafo 2 (inclusão social), Parágrafo 3 (impacto econômico), Parágrafo 4 (proposta de intervenção)",
        "Múltiplos parágrafos minúsculos, cada um com uma frase, para parecer mais longo",
      ],
      correta: 1,
      explicacao:
        "Só a segunda mostra projeto claro: cada parágrafo tem função definida, argumentos distintos, e avança rumo à conclusão. A primeira é confusa; a terceira é vazia. Estrutura é elegância.",
    }),
    interpretacao({
      texto:
        'A Competência III do ENEM valoriza o "projeto de texto", percebido pela organização estratégica dos argumentos. Um projeto claro significa que o aluno planejou quantos parágrafos teria, qual seria o tópico frasal de cada um, como os argumentos se articulariam para fortalecer a tese. Falta de projeto resulta em parágrafos desconectados, repetições, ou pior: conclusão que não dialoga com a introdução. Professores chamam isso de "texto que não sabe onde quer chegar".',
      pergunta: "Qual é a consequência visível de não ter um projeto de texto bem definido?",
      opcoes: [
        "O texto fica muito longo",
        "Parágrafos desconectados, repetições e conclusão que não dialoga com a introdução",
        "O aluno escreve com mais rapidez",
      ],
      correta: 1,
      explicacao:
        "Falta de projeto deixa marcas. Argumentos saltam de um lado para outro, repetindo-se; a conclusão estranhamente não conversa com o que foi dito. Isso prejudica Competência III e IV. Projeto é a diferença entre redação que parece reflexão e redação que parece improviso.",
    }),
  ],
});

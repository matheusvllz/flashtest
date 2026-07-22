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
 * Lição sobre infográfico e gráfico: dados que falam.
 * Textos descrevem os dados em vez de usar imagem.
 */
export const InfograficoEGrafico = defineLesson({
  id: "interpretacao-05-infografico-e-grafico",
  titulo: "Infográfico e gráfico",
  descricao: "Extrair informação de dados visuais e interpretar tendências.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a principal função de um gráfico em um texto?",
      opcoes: [
        "Decorar a página e torná-la mais atrativa visualmente",
        "Comunicar dados de forma resumida e visual para rápida compreensão",
        "Substituir toda necessidade de leitura de texto explicativo",
      ],
      correta: 1,
      explicacao:
        "Gráfico é alicerce visual de dados. Ele faz em imagem o que levaria parágrafos em palavras. Base sólida para comunicação rápida e clara de números.",
    }),
    verdadeiroFalso({
      afirmacao: "Infográfico e gráfico são a mesma coisa.",
      verdadeiro: false,
      explicacao:
        "Não. Gráfico é visual de dados (barras, linhas, pizza). Infográfico combina gráfico, texto curto, ícones e design em uma estrutura única que conta uma história completa.",
    }),
    multiplaEscolha({
      pergunta:
        "Um gráfico de barras mostra desemprego: 2018: 8%, 2019: 7%, 2020: 10%, 2021: 9%. O que isso permite concluir?",
      opcoes: [
        "Desemprego caiu permanentemente desde 2018",
        "Havia tendência de queda até 2019, mas houve pico em 2020, com recuperação em 2021",
        "O desemprego foi sempre igual durante esses 4 anos",
      ],
      correta: 1,
      explicacao:
        "Ler gráfico é ver a tendência, não apenas números soltos. Base sólida é conectar os pontos: queda, depois salto, depois estabilização. Cada movimento conta uma história.",
    }),
    completeLacuna({
      frase:
        "Um ___ é um recurso que organiza informações complexas em imagem com blocos, cores e hierarquia visual.",
      opcoes: ["gráfico de linha", "infográfico", "tabela de dados"],
      correta: 1,
      explicacao:
        "Infográfico tem estrutura de design: hierarquiza o que importa, usa cor para diferenciar, texto curto e direto. É a fusão de dado com design. Tabela é só dados em linhas.",
    }),
    encontreOErro({
      frase:
        "Um gráfico de pizza é a melhor escolha para mostrar tendências ao longo de 10 anos consecutivos.",
      erroIndex: 3,
      explicacao:
        "Gráfico de pizza mostra proporção de um todo em um momento. Para tendência temporal, linha ou barras são base sólida. Escolher a ferramenta errada distorce a leitura.",
    }),
    parear({
      instrucao: "Combine cada tipo de gráfico com seu uso ideal",
      pares: [
        { a: "Gráfico de barras", b: "Comparar valores entre categorias" },
        { a: "Gráfico de linhas", b: "Mostrar evolução ou tendência no tempo" },
        { a: "Gráfico de pizza", b: "Representar partes de um total" },
        { a: "Infográfico", b: "Contar história com dados, design e contexto" },
      ],
      explicacao:
        "Cada tipo tem sua base própria. Não é questão de gosto: é adequação da ferramenta ao dado. Estrutura correta facilita interpretação.",
    }),
    interpretacao({
      texto:
        'Descrição de infográfico sobre reciclagem: Bloco 1: "Apenas 10% do lixo é reciclado no Brasil" com número grande. Bloco 2: Ícone de lata = 75 anos para decompor. Bloco 3: Ícone de plástico = 400 anos. Bloco 4: Seta verde apontando para cima com texto "Reciclagem reduz poluição em até 80%". Bloco 5: "Como você pode ajudar" com 4 etapas ilustradas.',
      pergunta: "Qual é o propósito geral deste infográfico?",
      opcoes: [
        "Criticar duramente as pessoas que não reciclam",
        "Informar sobre reciclagem e motivar ação pessoal",
        "Explicar detalhadamente o processo químico de decomposição",
      ],
      correta: 1,
      explicacao:
        "O alicerce do infográfico está na estrutura: dado alarmante (10%), contexto (tempo de decomposição), benefício (redução de poluição), chamada à ação (como ajudar). Design a serviço da mensagem.",
    }),
    verdadeiroFalso({
      afirmacao: "Se dois gráficos mostram os mesmos dados, ambos comunicam a mesma mensagem.",
      verdadeiro: false,
      explicacao:
        "Não. Um gráfico de barras vs. linha do mesmo dado pode destacar aspectos diferentes. Escolha de escala, cores, título: tudo altera a ênfase. Base visual é base de persuasão.",
    }),
    ordenar({
      blocos: [
        "Primeiro, leia o título ou a pergunta que o gráfico responde.",
        "Identifique os eixos e o que cada um representa.",
        "Observe a escala: ela distorce ou é neutra.",
        "Procure tendências: o que sobe, o que cai, o que se estabiliza.",
        "Compare com o texto ao redor: o texto interpreta ou nega o gráfico.",
      ],
      explicacao:
        "Essa é a trajetória estruturada para ler gráfico: contexto primeiro, números depois, tendência por último. Base sólida em cada etapa.",
    }),
    interpretacao({
      texto:
        'Descrição de gráfico de barras horizontais mostrando taxa de alfabetização por região do Brasil em 2020: Norte 87%, Nordeste 83%, Centro-Oeste 89%, Sudeste 93%, Sul 95%. Titulo: "Desigualdade regional na educação persiste".',
      pergunta: "Que conclusão o gráfico sustenta com seus dados?",
      opcoes: [
        "O Brasil tem taxa de alfabetização uniforme em todas as regiões",
        "O sul é a região mais alfabetizada, enquanto o nordeste tem os índices mais baixos",
        "A taxa de alfabetização não tem relação com desenvolvimento regional",
      ],
      correta: 1,
      explicacao:
        "Os dados são base sólida: observar a sequência de barras mostra que sul lidera (95%) e nordeste fica atrás (83%). A diferença de 12 pontos sustenta a tese do título sobre desigualdade.",
    }),
  ],
});

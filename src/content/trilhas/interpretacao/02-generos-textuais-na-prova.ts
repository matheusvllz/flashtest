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
 * Lição sobre gêneros textuais que aparecem na prova.
 */
export const generosTextuaisNaProva = defineLesson({
  id: "interpretacao-02-generos-textuais-na-prova",
  titulo: "Gêneros textuais na prova",
  descricao: "Crônica, notícia, artigo de opinião e mais: reconhecer e interpretar.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um gênero textual?",
      opcoes: [
        "Um tipo de história com personagens fictícios",
        "Uma forma social de texto que segue padrões reconhecíveis",
        "Um estilo de escrita literária muito formal",
      ],
      correta: 1,
      explicacao:
        "Gênero é a categoria que organiza o texto na sociedade. Uma notícia tem estrutura própria, assim como uma crônica ou um anúncio. Cada um tem seu formato de base.",
    }),
    parear({
      instrucao: "Combine cada gênero com sua característica principal",
      pares: [
        { a: "Notícia", b: "Relata fatos recentes de interesse público" },
        { a: "Crônica", b: "Mistura narração e reflexão sobre o cotidiano" },
        { a: "Artigo de opinião", b: "Argumenta posição sobre tema atual" },
        { a: "Anúncio publicitário", b: "Promociona produto ou serviço" },
      ],
      explicacao:
        "A base de cada gênero é diferente. Notícia informa fato, crônica reflete sobre a vida, artigo defende tese, anúncio convida à ação. Reconhecer o gênero é entender o propósito.",
    }),
    multiplaEscolha({
      pergunta: "Qual é a marca mais forte de uma crônica?",
      opcoes: [
        "O tom impessoal e a precisão dos dados",
        "A reflexão pessoal sobre o cotidiano com tom leve e familiar",
        "A defesa de uma posição política usando argumentos rigorosos",
      ],
      correta: 1,
      explicacao:
        "Crônica respira do dia a dia: um fato simples vira reflexão. Tom descontraído, perspectiva pessoal, humor leve. Ela observa a vida e comenta com carinho.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma notícia deve ser imparcial, enquanto um artigo de opinião toma posição clara.",
      verdadeiro: true,
      explicacao:
        "Notícia: base sólida, fatos verificáveis, voz neutra. Artigo de opinião: autor declarado, argumento pessoal, defesa de tese. São estruturas diferentes de propósito.",
    }),
    completeLacuna({
      frase:
        "A ___ é um gênero que mistura narrativa de fato recente com uma reflexão sobre seu significado.",
      opcoes: ["notícia interpretativa", "crônica jornalística", "reportagem"],
      correta: 0,
      explicacao:
        "Notícia interpretativa cruza o fato com contexto e sentido. É mais rara na prova, mas é o alicerce que liga informação a entendimento. Notícia pura só relata.",
    }),
    encontreOErro({
      frase:
        "O ensaio breve é um gênero que exige rigidez total de estrutura e linguagem impessoal.",
      erroIndex: 8,
      explicacao:
        "Ensaio exige rigor de IDEIA, não de forma. Ele permite tom pessoal, estrutura flexível, desde que sustente a tese. Confundir rigor com rigidez é perder a base do ensaio.",
    }),
    multiplaEscolha({
      pergunta: "Uma charge ou tirinha é um texto que se apoia principalmente em qual recurso?",
      opcoes: [
        "Palavras bem escolhidas que descrevem a cena",
        "Imagem com ou sem texto, usando humor e crítica",
        "Argumentação lógica com estatísticas precisas",
      ],
      correta: 1,
      explicacao:
        "Charge e tirinha comunicam via imagem primeiro, texto depois (ou sem texto). O visual é a base; a crítica sai da forma e do detalhe desenhado. Palavra complementa.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Poema e carta são gêneros textuais reconhecíveis na prova com estruturas e propósitos diferentes.",
      verdadeiro: true,
      explicacao:
        "Carta tem data, endereço, saudação, corpo, despedida. Poema explora ritmo, rima, verso. Gêneros distintos com base sólida. A prova testa se você identifica cada um.",
    }),
    ordenar({
      blocos: [
        "Leia a notícia e identifique quem, o quê, quando, onde.",
        "Procure pela tese principal se for artigo ou ensaio.",
        "Observe o tom: impessoal (notícia) ou pessoal (crônica).",
        "Entenda o propósito: informar, refletir ou argumentar.",
      ],
      explicacao:
        "Essa é a estratégia de leitura que eu construí: reconheça o gênero, localize a estrutura, desvende o propósito. Com essa base, a interpretação sai sólida.",
    }),
    interpretacao({
      texto:
        "Um jornalista escreveu sobre o aumento das ruas alagadas na cidade. Fez uma crônica comparando as enchentes com a vida de um personagem. Outro jornalista escreveu uma notícia apenas relatando os números de desabrigados. Um terceiro escreveu um artigo argumentando que a culpa era da falta de investimento público. Três olhares sobre o mesmo fato, três gêneros diferentes, três estruturas de base diferentes. O leitor que identifica o gênero sabe logo o que esperar: fato puro, reflexão pessoal ou defesa de posição.",
      pergunta: "De acordo com o texto, qual é a utilidade de reconhecer o gênero textual?",
      opcoes: [
        "Aumentar a velocidade de leitura do texto",
        "Saber qual estrutura e propósito esperar do texto",
        "Determinar qual dos textos é melhor ou mais verdadeiro",
      ],
      correta: 1,
      explicacao:
        "Reconhecer o gênero é conhecer a base. Você sabe se é fato puro ou argumento, se é reflexão ou relatório. Cada estrutura tem seu propósito sólido.",
    }),
  ],
});

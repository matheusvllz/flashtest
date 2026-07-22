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
 * Lição sobre literatura na prova: o essencial para ENEM.
 */
export const LiteraturaNaProva = defineLesson({
  id: "interpretacao-10-literatura-na-prova",
  titulo: "Literatura na prova",
  descricao: "Reconhecer períodos, autores e obras essenciais do ENEM.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Por que a ENEM testa conhecimento de literatura?",
      opcoes: [
        "Para punir quem não leu livros clássicos",
        "Para verificar se o aluno conhece o patrimônio cultural e consegue interpretar textos complexos",
        "Para avaliar apenas memória de datas e autores",
      ],
      correta: 1,
      explicacao:
        "Literatura no ENEM não é teste de memorização. Base sólida é interpretação: você lê um fragmento e precisa entender contexto, intencionalidade, estilo. Literatura ensina pensar.",
    }),
    verdadeiroFalso({
      afirmacao:
        "O ENEM exige que você leia todos os clássicos da literatura brasileira para uma boa nota em interpretação.",
      verdadeiro: false,
      explicacao:
        'Não. O ENEM fornece fragmentos e contexto. Você não precisa ter lido "Dom Casmurro" inteiro; precisa conseguir ler Machado quando o texto é oferecido. Base é habilidade, não enciclopédia.',
    }),
    multiplaEscolha({
      pergunta: 'O que é encontrar uma obra no "Barroco"?',
      opcoes: [
        "Um livro que trata de religião",
        "Uma obra do século 17 marcada por contradição, dramaticidade e dualismo",
        "Um romance escrito em prosa poética",
      ],
      correta: 1,
      explicacao:
        "Barroco é período com sua base estrutural própria: contradição (carpe diem + memento mori), dramaticidade, dualismo espírito/corpo. Datas importam menos que características.",
    }),
    completeLacuna({
      frase:
        "O Romantismo brasileiro do século 19 se caracteriza por valorização do ___, paisagem natural e emoção intensa.",
      opcoes: ["passado", "individualismo", "modernismo"],
      correta: 1,
      explicacao:
        'Romantismo é sobre o indivíduo: suas paixões, seus sentimentos. "Eu" em maiúscula. A paisagem natural complementa essa introspecção. Alicerce é o sujeito lírico, não o mundo objetivo.',
    }),
    encontreOErro({
      frase:
        "A prosa de Machado de Assis é considerada romântica porque usa muita emoção e sentimento nos personagens.",
      erroIndex: 8,
      explicacao:
        'Machado é considerado Realista, não Romântico. Embora trate de emoção, sua abordagem é crítica e irônica, não idealista. Confundir "fala de sentimento" com "período romântico" é um erro de base.',
    }),
    parear({
      instrucao: "Combine cada autor com sua característica principal",
      pares: [
        { a: "Gonçalves Dias (Romantismo)", b: "Tema do índio, nostalgia, lirismo" },
        { a: "Machado de Assis (Realismo)", b: "Ironia, crítica social, psicologia profunda" },
        {
          a: "Fernando Pessoa (Modernismo)",
          b: "Multiplicidade de vozes, heteronímia, experimentalismo",
        },
        {
          a: "Clarice Lispector (Contemporâneo)",
          b: "Subjetividade feminina, reflexão existencial",
        },
      ],
      explicacao:
        "Cada autor tem sua base própria. Não é lista para decorar: é padrão reconhecível quando você lê o fragmento. Se encontra ironia fina, é Machado; se encontra experimentalismo, é Pessoa.",
    }),
    interpretacao({
      texto:
        'Fragmento do Romantismo: "Meus olhos! Que doçura! Qual é o homem que vendo esta natureza abrasada de amor, não sente ferir-se nos peitos o coração? Que sentimento é este, que nos oprime o peito quando vemos o pôr do sol?" (Gonçalves Dias). O texto é característico: emoção, natureza como espelho do sentimento, "eu" lírico exaltado.',
      pergunta: "Qual é a característica central do fragmento?",
      opcoes: [
        "Descrição precisa e científica da natureza",
        "Conexão entre sentimento do poeta e cenário natural, com tom de exaltação lírica",
        "Crítica irônica ao sentimentalismo humano",
      ],
      correta: 1,
      explicacao:
        "Alicerce do Romantismo está aqui: natureza NÃO é descrita objetivamente, é SENTIDA. O poeta coloca seu coração no cenário e espera que você sinta o mesmo. É projeção emocional.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma obra literária pode ser interpretada de múltiplas formas e todas as interpretações são igualmente válidas.",
      verdadeiro: false,
      explicacao:
        "Não completamente. Interpretação tem base: o texto. Há interpretações que se sustentam no texto e outras que não. Pluralidade sim, relativismo total não. Alicerce é a materialidade da obra.",
    }),
    ordenar({
      blocos: [
        "Leia o fragmento literário com atenção ao estilo: tom, linguagem, recursos.",
        "Identifique características: movimento, período, tema predominante.",
        "Localize o sujeito poético ou narrativo: quem fala, de onde fala.",
        "Procure pela intenção: o que o texto está comunicando além da história.",
        "Conecte com contexto histórico se disponível no enunciado.",
      ],
      explicacao:
        "Estratégia para ler fragmento literário na prova: estilo primeiro, características depois, intenção final. Base sólida em cada passo.",
    }),
    interpretacao({
      texto:
        'Fragmento modernista de Fernando Pessoa: "Tenho tantas personalidades que não tenho certeza de quem sou quando falo comigo mesmo / Sou um universo de contradições" (adaptado). O Modernismo português/brasileiro que Pessoa representa rompe com o Romantismo: não há sujeito uno, há multiplidade. A ironia e a fragmentação são a base.',
      pergunta: "Como este fragmento marca uma ruptura com o Romantismo?",
      opcoes: [
        "Porque usa linguagem mais científica",
        "Porque dissolve a ideia de sujeito único e coerente, substituindo por multiplicidade e contradição",
        "Porque critica a natureza em vez de idealizá-la",
      ],
      correta: 1,
      explicacao:
        'Alicerce da ruptura está em identidade. Romantismo: "eu" singular, coerente, que sente a natureza. Pessoa: "eu" é ilusão, há múltiplas vozes. Base modernista é fragmentação, não unidade.',
    }),
  ],
});

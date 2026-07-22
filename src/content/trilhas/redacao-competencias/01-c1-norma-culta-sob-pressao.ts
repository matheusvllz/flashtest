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
 * Competência I do ENEM: Demonstrar domínio da modalidade escrita formal da língua portuguesa
 * ZERO emoji, ZERO travessão.
 */
export const c1NormaCultaSobPressao = defineLesson({
  id: "redacao-competencias-01-c1-norma-culta-sob-pressao",
  titulo: "C1: Norma culta sob pressão",
  descricao: "Como dominar a gramática e a formalidade na prova, mesmo quando o tempo aperta.",
  exercicios: [
    verdadeiroFalso({
      afirmacao: "Na redação ENEM, um desvio gramatical isolado derruba a nota de C1 para zero.",
      verdadeiro: false,
      explicacao:
        "A banca tolera exceções ocasionais. O que derruba C1 é reincidência sistemática: muitos erros de concordância, regência ou ortografia repetindo no texto.",
    }),
    multiplaEscolha({
      pergunta: 'Em "Ela gosta de ler, escrever e ouvindo podcasts", qual é a falha?',
      opcoes: [
        "Falta de pontuação entre os verbos",
        "Falta de paralelismo entre os três termos",
        "Não há falha; está correto",
      ],
      correta: 1,
      explicacao:
        'Os três elementos da série deveriam manter a mesma forma verbal. "Ler" e "escrever" estão no infinitivo, mas "ouvindo" muda para o gerúndio e quebra a construção. Paralelismo sintático é um alicerce de C1: construir em série mantendo a mesma forma.',
    }),
    encontreOErro({
      frase: "O artigo de opinião propõem argumentos instigantes aos leitores.",
      // Tokenização: O(0) artigo(1) de(2) opinião(3) propõem(4) argumentos(5) instigantes(6) aos(7) leitores(8)
      // Erro: "propõem" (plural) mas "artigo" é singular. Palavra alvo: propõem (índice 4)
      erroIndex: 4,
      explicacao:
        'O sujeito "artigo" é singular; o verbo "propõem" está no plural. Concordância verbal é estrutura sólida de C1: sujeito e verbo têm que andar juntos.',
    }),
    completeLacuna({
      frase: "O domínio da modalidade formal é___ alicerce para uma nota alta em C1.",
      opcoes: ["a", "o", "um"],
      correta: 1,
      explicacao:
        'Após "é", o artigo concorda com o predicativo do sujeito. "Alicerce" é masculino singular, então usamos "o". Predicativos nominais em frases de identificação respeitam o gênero do termo: estrutura básica de C1.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase respeita melhor a regência verbal na norma culta formal?",
      opcoes: [
        "Ele assistiu o filme inteiro sem distrações.",
        "Ele assistiu ao filme inteiro sem distrações.",
        "Ele assistiu no filme cenas memoráveis.",
      ],
      correta: 1,
      explicacao:
        'O verbo "assistir" (significando "ver, presenciar") rege preposição "a": "assistir a algo". Regência verbal é o arcabouço de frases bem construídas em C1; errar nela deixa o texto frágil.',
    }),
    parear({
      instrucao: "Associe cada frase ao seu tipo de desvio em C1",
      pares: [
        { a: "Se você estuda, você vai conseguir.", b: "Repetição inadequada de pronome" },
        { a: "O texto foram publicado na revista.", b: "Erro de concordância verbal" },
        { a: "Ele trabalha no escritorio há dez anos.", b: "Erro de acentuação" },
      ],
      explicacao:
        "Cada desvio compromete um pilar diferente: repetições atolam a fluidez, erros de concordância quebram a base estrutural, e falhas de acentuação denunciam falta de atenção. C1 é a soma desses pilares.",
    }),
    interpretacao({
      texto:
        "A norma culta não é rigidez, mas confiança. Quando você domina as regras de concordância, regência e pontuação, sua redação soa estruturada mesmo sob pressão de tempo. A banca ENEM reconhece que ninguém escreve perfeito em 5 horas; o que ela avalia é se você conhece a base e a respeita na maioria das vezes. Um texto com 2 ou 3 erros em 25 linhas demonstra domínio mediano (120 pontos); sem erros, domínio bom (160); com apenas exceções ocasionais em construções complexas, domínio excelente (200).",
      pergunta: "Segundo o texto, qual é o critério REAL da banca para nota alta em C1?",
      opcoes: [
        "Zero erro em todo o texto",
        "Conhecer as regras e respeitá-las na maioria das vezes",
        "Usar apenas frases simples para evitar desvios",
      ],
      correta: 1,
      explicacao:
        "A banca procura por domínio demonstrado, não perfeição impossível. Domínio mediano tolera alguns erros; domínio excelente, apenas exceções em estruturas complexas. Isso é realismo de avaliação.",
    }),
    verdadeiroFalso({
      afirmacao: "Usar vocabulário muito rebuscado garante nota 200 em C1.",
      verdadeiro: false,
      explicacao:
        "Vocabulário preciso é parte de C1, mas não é o tudo. Um texto pode usar palavras simples, bem escolhidas, e ainda acertar 200; outro, cheio de termos difíceis mas com erros de concordância, baixa. C1 avalia domínio gramatical primeiro, escolha vocabular depois.",
    }),
  ],
});

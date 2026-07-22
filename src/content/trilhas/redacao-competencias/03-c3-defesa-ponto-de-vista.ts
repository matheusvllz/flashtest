import {
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Competência III do ENEM: Selecionar, relacionar, organizar e interpretar
 * informações, fatos, opiniões e argumentos em defesa de um ponto de vista.
 */
export const c3DefesaPontodeVista = defineLesson({
  id: "redacao-competencias-03-c3-defesa-ponto-de-vista",
  titulo: "C3: Defesa do ponto de vista",
  descricao: "Organizar argumentos com coerência, desenvolver ideias e demonstrar autoria.",
  exercicios: [
    verdadeiroFalso({
      afirmacao:
        "Defender um ponto de vista significa repetir a mesma ideia em palavras diferentes.",
      verdadeiro: false,
      explicacao:
        "Defesa exige progressão. Você apresenta uma tese, depois traz argumentos que a fundamentam, cada um agregando profundidade diferente. Repetição é fraqueza de C3; progressão é força. Autoria mora no detalhe, no novo ângulo trazido a cada parágrafo.",
    }),
    multiplaEscolha({
      pergunta: "Qual dessas características marca uma nota 200 em C3?",
      opcoes: [
        "Apresenta informações relacionadas ao tema de forma coerente e configura autoria",
        "Copia argumentos dos textos motivadores com boa organização",
        "Traz muitos argumentos, mesmo que desconectados entre si",
      ],
      correta: 0,
      explicacao:
        "Autoria é o diferencial que leva a 200. Não é volume de ideias; é capacidade de selecionar, relacionar e organizar de forma que demonstre pensamento próprio. Coerência sem autoria fica em 160; autoria com coerência chega a 200.",
    }),
    encontreOErro({
      frase:
        "A educação transforma vidas. Educação deve ser prioridade. A educação é fundamental. Educação resolve tudo.",
      // Tokenização: A(0) educação(1) transforma(2) vidas.(3) Educação(4) deve(5) ser(6) prioridade.(7) A(8) educação(9) é(10) fundamental.(11) Educação(12) resolve(13) tudo.(14)
      // Erro: Repetição de "educação" sem progresso temático. O aluno deveria variar ("Esse fenômeno", "Tal transformação", etc.). Palavra-alvo para tocar: "Educação" na 4ª frase (índice 12).
      erroIndex: 12,
      explicacao:
        'Repetir o mesmo sujeito em cada frase, sem referenciação variada, enfraquece a defesa da tese. A banca quer ver que você conhece técnicas de coesão e progressão. Em vez de "educação...educação...educação", use "Esse fenômeno", "Tal transformação", pronomes: mostre que você comanda a argumentação.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Um texto coerente e bem estruturado em C3 é aquele em que todos os argumentos defendem o mesmo ponto de vista sem contradições.",
      verdadeiro: true,
      explicacao:
        "Coerência é inteligibilidade: as ideias se encadeiam de forma lógica e plausível. Contradições quebram o edifício; toda frase tem que sustentar a tese ou avançar a defesa dela. Sem coerência, não há defesa convincente.",
    }),
    multiplaEscolha({
      pergunta: 'O que diferencia um argumento "bem desenvolvido" de um "subdesenvolvido" em C3?',
      opcoes: [
        "Argumento bem desenvolvido é aquele com muitas palavras",
        "Argumento bem desenvolvido é fundamentado por exemplos, definições, comparações, sem lacunas de sentido",
        "Argumento bem desenvolvido é aquele que concorda com a opinião da banca",
      ],
      correta: 1,
      explicacao:
        'Desenvolvimento é apoio. Um argumento solto ("educação é importante") é casca; desenvolvido ("educação reduz desigualdade porque permite acesso a oportunidades econômicas, como mostram dados de mobilidade social em países com políticas educacionais fortes") é sólido. Você fecha as lacunas que o leitor deixaria aberta.',
    }),
    parear({
      instrucao: "Combine cada tipo de lacuna com o tipo de desenvolvimento que a preenche",
      pares: [
        {
          a: "Por que a educação transforma vidas?",
          b: "Desenvolvimento por causalidade e exemplo",
        },
        {
          a: "Qual é a diferença entre educação pública em países ricos e pobres?",
          b: "Desenvolvimento por comparação",
        },
        { a: "Como a educação é semelhante a um alicerce?", b: "Desenvolvimento por analogia" },
      ],
      explicacao:
        'Cada tipo de pergunta que sua tese levanta exige um tipo de desenvolvimento. "Por quê?" pede causalidade e exemplos; "qual diferença?" pede comparação; "como é semelhante?" pede analogia. Conhecer qual ferramenta usar é marca de autoria em C3.',
    }),
    multiplaEscolha({
      pergunta:
        "Em uma redação com 3 parágrafos de argumentação sobre tecnologia na educação, qual estrutura demonstra melhor autoria?",
      opcoes: [
        "Parágrafo 1: tecnologia melhora aprendizado (fato); Parágrafo 2: tecnologia melhora aprendizado (opinião); Parágrafo 3: tecnologia melhora aprendizado (conclusão repetida)",
        "Parágrafo 1: tecnologia melhora aprendizado via interatividade (exemplo: plataformas adaptativas); Parágrafo 2: tecnologia reduz barreiras de acesso geográfico (estatística: X% das escolas rurais conectadas em Y); Parágrafo 3: tecnologia exige preparo docente (contraposição: risco sem treinamento adequado)",
        "Parágrafo 1: tecnologia é boa; Parágrafo 2: tecnologia é boa; Parágrafo 3: tecnologia é boa.",
      ],
      correta: 1,
      explicacao:
        "Autoria mora na variedade de ângulos e no suporte específico. Repetição sem progressão é fraqueza. Trazer exemplos diferentes, dados reais, até mesmo uma contraposição bem refutada, mostra que você pensou sobre o tema e não só recitou uma opinião pré-formada.",
    }),
    interpretacao({
      texto:
        'Um texto com nota 200 em C3 apresenta argumentos que não vêm só dos textos motivadores, mas de conhecimento pessoal do aluno: leituras extras, dados que ele pesquisou, vivências conectadas ao tema. Cada argumento é fundamentado: não é uma frase solta, é uma ideia com apoio. E há progressão: o primeiro argumento estabelece um ponto; o segundo aprofunda ou diversifica; o terceiro conclui ou abre novamente a discussão de forma inteligente. O leitor não fica pensando "por quê?" a cada sentença; cada afirmação tem seu sustentáculo.',
      pergunta: "Segundo o texto, o que diferencia um texto nota 200 em C3 de um texto nota 120?",
      opcoes: [
        "Tamanho; 200 é mais longo",
        "Presença de conhecimento próprio, argumentos fundamentados e progressão organizada",
        "Quantidade de pontuação e conectivos",
      ],
      correta: 1,
      explicacao:
        "Nem tamanho, nem pontuação: é qualidade de pensamento demonstrada. Você mostra que pesquisou, refletiu, organizou logicamente e não apenas recitou. Isso é autoria. E autoria é o piso para 200 em C3.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Se você apresentar dois argumentos bem desenvolvidos e coerentes, mas contraditórios entre si, a banca ainda pode dar 200 em C3.",
      verdadeiro: false,
      explicacao:
        "Contradição quebra coerência. C3 avalia inteligibilidade e plausibilidade entre as ideias; se elas se chocam, o texto perde força. Defesa de um ponto de vista exige consistência interna. Ou você resolve a contradição de forma inteligente (mostrando nuance), ou não a deixa aparecer.",
    }),
  ],
});

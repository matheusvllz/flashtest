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
 * Lição 03: Como costurar repertório sem decoreba
 */
export const costurarRepertorio = defineLesson({
  id: "redacao-argumentacao-03-costurar-repertorio",
  titulo: "Como costurar repertório sem decoreba",
  descricao: "A técnica de integrar referências ao parágrafo de forma orgânica e lógica.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a estrutura correta para inserir um repertório em um parágrafo?",
      opcoes: [
        "Escrever a tese, depois citar a referência isolada no fim",
        "Apresentar a tese, conectar a referência ao argumento e explicar o nexo",
        "Começar com a referência sem contexto",
      ],
      correta: 1,
      explicacao:
        "A costura funciona assim: você estabelece a IDEIA, traz a referência como ALICERCE dessa ideia, depois EXPLICA por que ela importa. Sem explicação, fica flutuando. Com ela, fica plantada.",
    }),
    ordenar({
      blocos: [
        "A educação bancária, criticada por Paulo Freire,",
        "trata o aluno como recipiente vazio para ser preenchido.",
        "Essa abordagem reduz o engajamento crítico dos estudantes.",
        "Por isso, metodologias ativas que respeitam a autonomia do aprendiz",
        "geram resultados melhores em termos de retenção e consciência.",
      ],
      explicacao:
        "Note a sequência: problema (educação bancária) + referência (Freire) + explicação do conceito (recipiente vazio) + consequência (reduz engajamento) + proposta (metodologias ativas). Nenhum salto. Nenhuma referência solta.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Ao usar uma citação de autor conhecido, você DEVE aspas se for reprodução exata das palavras dele.",
      verdadeiro: true,
      explicacao:
        "Honestidade intelectual: se copia a frase idêntica, marca com aspas. Se parafraseia (reformula a ideia em suas palavras), não precisa aspas, mas cita o autor. Decoreba é roubo; paráfrase com atribuição é trabalho legítimo.",
    }),
    completeLacuna({
      frase:
        "A inserção de repertório sem nexo com o argumento é chamada de repertório ___, que a banca avalia negativamente.",
      opcoes: ["de bolso", "produtivo", "científico"],
      correta: 0,
      explicacao:
        "De bolso é a referência desconectada, colhida de memória pronta mas sem raiz no tema. Eu sempre digo: é como tentar construir uma parede com tijolos que não se encaixam.",
    }),
    encontreOErro({
      frase: "Conforme Michel Foucault, o poder está em toda parte. Logo, devemos aceitar.",
      erroIndex: 11,
      explicacao:
        'O problema é "aceitar" sozinho, sem completar o argumento. Foucault aborda o poder, mas qual é sua tese sobre isso? Se você termina a frase com "devemos aceitar", não há proposição clara. Complete: "devemos resistir em cada espaço" ou "devemos problematizar cada relação".',
    }),
    multiplaEscolha({
      pergunta: 'Qual é a diferença entre "citar" e "costurar" um repertório?',
      opcoes: [
        "Citar é apenas mencionar o nome; costurar é integrar a ideia ao argumento",
        "Citar e costurar são a mesma coisa",
        "Costurar é usar o repertório em todas as frases",
      ],
      correta: 0,
      explicacao:
        "Citar é o ato de nomear. Costurar é o ato de CONECTAR. Uma menção solta não constrói nada; uma integração lógica constrói estrutura. Meu trabalho é costurador: entrelaço as ideias para que nada se solte.",
    }),
    interpretacao({
      texto:
        "A Constituição de 1988 estabelece que a educação é direito de todos. Contudo, Bourdieu mostrou que educação reproduz desigualdade de classes, pois famílias ricas transferem capital cultural que facilita o sucesso escolar. Portanto, Lei só não basta: é necessário políticas que redistribuam capital cultural, como programas de reforço e mentoría em escolas periféricas. Sem essa mediação, direito constitucional vira promessa no papel.",
      pergunta:
        "Como o parágrafo integra o repertório de Bourdieu em relação à tese sobre educação?",
      opcoes: [
        "Menciona Bourdieu e depois ignora a ideia dele",
        "Explica o conceito de capital cultural (IDEIA), mostra a consequência (contradição entre Lei e prática), e propõe ação (políticas de redistribuição)",
        "Apenas cita o nome de Bourdieu",
      ],
      correta: 1,
      explicacao:
        "Olha só a costura: Constituição estabelece direito (base) + Bourdieu revela o nó (barreira real) + logo, ação específica (reforço, mentoría). Nenhuma palavra está lá por acaso. É como carpintaria: cada argumento encaixa no outro.",
    }),
    parear({
      instrucao: "Combine cada erro de costura com o tipo de problema",
      pares: [
        {
          a: "Citar Freire no começo de um parágrafo e nunca mais tocá-lo",
          b: "Referência suspensa (não articulada)",
        },
        {
          a: "Usar um conceito de sociólogo sem explicar o que significa",
          b: "Falta de contextualização (leitor não sabe o nexo)",
        },
        {
          a: "Mencionar dois autores contraditórios sem resolver a contradição",
          b: "Referências em conflito (não há síntese)",
        },
      ],
      explicacao:
        "Na carpintaria, erros assim deixam a construção instável. Uma viga suspensa, um encaixe obscuro, vigas que não convergem: tudo leva ao colapso. Costurar é resolver cada um desses problemas.",
    }),
    verdadeiroFalso({
      afirmacao:
        "É melhor usar apenas uma referência bem explicada do que três referências citadas rapidamente.",
      verdadeiro: true,
      explicacao:
        "Profundidade vence quantidade. Um conceito bem costurado, bem explicado, bem articulado com seu argumento, vale mais que três nomes soltos. Mostre o fio de pensamento; não amontoar nomes.",
    }),
  ],
});

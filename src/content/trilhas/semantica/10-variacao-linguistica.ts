import {
  defineLesson,
  encontreOErro,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
  interpretacao,
  completeLacuna,
} from "@/lib/lessons/define";

/**
 * Variação linguística e preconceito linguístico.
 * A língua não é monolítica: tem sotaques, gírias, regionalismos, socioletos.
 */
export const variacaoLinguistica = defineLesson({
  id: "semantica-10-variacao-linguistica",
  titulo: "Variação linguística e preconceito linguístico",
  descricao: "Dialetos, sotaques, gírias: a riqueza da língua não é norma única.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é variação linguística?",
      opcoes: [
        "As diferentes formas como a mesma língua é falada em contextos, regiões e grupos sociais diferentes",
        "Um erro grave na fala ou escrita",
        "A pronúncia errada de uma palavra",
      ],
      correta: 0,
      explicacao:
        'Variação linguística é natural e legítima. O português do Nordeste, do Rio de Janeiro, de Minas Gerais não é "errado": é diferente. Gírias, sotaques, dialetos são camadas de uma mesma língua. Dominar variação é entender a riqueza estrutural da língua.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Preconceito linguístico é julgar e desvalorizar uma forma de fala por razões de classe, região ou etnia.",
      verdadeiro: true,
      explicacao:
        'Preconceito linguístico: julgar alguém por falar "cum você" em vez de "com você", por usar gíria, por ter sotaque caipira ou carioca. Essas variações não são inferiores: são diferentes. Reconhecer isso é alicerce de compreensão.',
    }),
    parear({
      instrucao: "Combine cada tipo de variação com um exemplo",
      pares: [
        { a: "Variação regional", b: 'No interior paulista: "ocê" em vez de "você".' },
        { a: "Variação geracional (gíria)", b: 'O jovem usa "curtir", "maneiro", "galera".' },
        {
          a: "Variação social (socioleto)",
          b: 'A pessoa de classe alta pode falar "hediondo"; a de classe baixa, "nojento".',
        },
      ],
      explicacao:
        "Regional varia por lugar. Geracional (gíria) varia por idade e grupo. Social varia por classe. Nenhuma é errada: são escolhas dentro da estrutura da língua.",
    }),
    multiplaEscolha({
      pergunta: "Por que é importante entender variação linguística em uma redação argumentativa?",
      opcoes: [
        "Para parecer mais erudito",
        "Para entender que a norma culta é apenas uma opção dentre várias, e que outras variações têm valor",
        "Para usar gíria na prova",
      ],
      correta: 1,
      explicacao:
        'Entender variação permite que você argumente sobre linguagem com precisão. Se for criticar forma de fala, você não dirá "é errada", mas "é diferente da norma formal". Isso solidifica sua argumentação.',
    }),
    completeLacuna({
      frase:
        'A expressão "tá chovendo" em lugar de "está chovendo" é um exemplo de variação ___, comumente usada na fala coloquial.',
      opcoes: ["fonética", "geracional", "regional"],
      correta: 0,
      explicacao:
        'Variação fonética: "tá" é a redução de "está", uma mudança no som da palavra que aparece na fala informal de falantes de qualquer idade e região do Brasil. Não é erro: é escolha de registro dentro da estrutura da língua.',
    }),
    interpretacao({
      texto:
        'Um sociólogo estuda variação linguística em São Paulo e Rio de Janeiro. Encontra que: no Rio, cariocas de classe baixa falam "pros" (para os) e "pra" (para). Em São Paulo, paulistas fazem o mesmo. A diferença regional é menor; a diferença social é maior. Um promotor de justiça fala "para os cidadãos"; um trabalhador manual, "pros caras". A mesma informação. Diferentes estruturas sociais de fala. O preconceito linguístico acontece quando o promotor invalida a fala do trabalhador, quando na verdade ambas são legítimas em seus contextos. A redação que reconhece essa estrutura ganha profundidade.',
      pergunta: "Qual é a diferença mais importante no texto: regional ou social?",
      opcoes: [
        "Regional, porque separadas por estados",
        "Social, porque marca diferenças de classe e contexto",
        "Não há diferença: são iguais",
      ],
      correta: 1,
      explicacao:
        "Variação social é mais estruturante que regional aqui. Ambos os lugares têm fala formal e informal, de classe alta e baixa. A marca está em quem fala e em que contexto, não apenas em onde mora.",
    }),
    verdadeiroFalso({
      afirmacao:
        "A norma culta é a única forma correta de falar português; outras variações são erros.",
      verdadeiro: false,
      explicacao:
        'Norma culta é apropriada para contextos formais: redação de ENEM, texto acadêmico, entrevista. Mas não é "mais correta": é mais contextualmente adequada. Falar gíria em uma reunião formal é inadequado; falar norma culta com amigos é estranheza. Contexto determina adequação, não correção absoluta.',
    }),
    multiplaEscolha({
      pergunta: "Como um redator deve lidar com variação linguística em uma prova?",
      opcoes: [
        "Usar gíria e sotaque porque mostram autenticidade",
        "Usar norma culta formal porque é o contexto da prova, mas reconhecer que outras variações têm valor",
        "Misturar todas as variações para parecer culto",
      ],
      correta: 1,
      explicacao:
        "Prova exige norma culta: é contexto formal. Mas uma redação madura reconhece que outras formas de falar têm legitimidade. Se argumentar sobre linguagem, inclua essa compreensão. Isso é sofisticação de alicerce.",
    }),
  ],
});

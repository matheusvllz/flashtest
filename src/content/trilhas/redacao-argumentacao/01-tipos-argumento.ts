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
 * Lição 01: Tipos de argumento (dados, exemplo, autoridade, causa-consequência)
 */
export const tiposArgumento = defineLesson({
  id: "redacao-argumentacao-01-tipos-argumento",
  titulo: "Tipos de argumento",
  descricao: "Dados, exemplo, autoridade, causa-consequência: a base da argumentação sólida.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é o papel de um argumento em uma redação?",
      opcoes: [
        "Decorar o texto com palavras bonitas",
        "Fundamentar a tese, oferecendo provas e raciocínios que a sustentam",
        "Contar histórias pessoais sem relação com o tema",
      ],
      correta: 1,
      explicacao:
        "Argumento é o alicerce: sem ele, a tese fica suspensa no ar. Dados, exemplos e raciocínios viram os tijolos que constroem a estrutura da sua defesa.",
    }),
    parear({
      instrucao: "Associe cada tipo de argumento ao seu exemplo",
      pares: [
        {
          a: '"60% dos adolescentes têm depressão, segundo estudo de 2024."',
          b: "Argumento por dados",
        },
        { a: '"Paulo Freire afirmou que a educação liberta."', b: "Argumento por autoridade" },
        {
          a: '"Cidades com ciclovias tiveram redução de acidentes."',
          b: "Argumento por causa-consequência",
        },
        {
          a: '"Há alunos que conseguem nota 1000 estudando 1 hora diária."',
          b: "Argumento por exemplo",
        },
      ],
      explicacao:
        "Cada tipo tem seu peso na construção. O dado ancora em número, a autoridade em voz reconhecida, o exemplo em caso concreto e a causa-consequência em lógica. Use diferentes tipos para uma argumentação robusta.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Um exemplo pessoal ("meu primo conseguiu bolsa estudando à noite") é tão legítimo quanto dados oficiais em uma redação do ENEM.',
      verdadeiro: false,
      explicacao:
        "Repertório legítimo precisa extrapolar o pessoal. Sua vivência conta, sim, mas conectada a fatos históricos, leis, pesquisas ou pensadores reconhecidos. Experiência isolada não é base de construção.",
    }),
    completeLacuna({
      frase: "Um argumento por ___ usa fatos estatísticos para sustentar a tese.",
      opcoes: ["dados", "autoridade", "emoção"],
      correta: 0,
      explicacao:
        "Dados são números, pesquisas, índices. Eles constroem uma estrutura sólida porque vêm de fonte verificável. Autoridade é a voz do especialista; dados são o peso da evidência.",
    }),
    encontreOErro({
      frase:
        "O psicólogo Maslow criou uma hierarquia de necessidades, prova que educação é fundamental.",
      erroIndex: 8,
      explicacao:
        'A palavra "prova" está fraca aqui. Maslow não prova nada sobre educação diretamente; ele fundamenta o ARGUMENTO. Diga: "estrutura o argumento" ou "sustenta a ideia". Palavra exagerada quebra a lógica.',
    }),
    multiplaEscolha({
      pergunta:
        "Qual estrutura melhor demonstra o uso de diferentes tipos de argumento em um parágrafo argumentativo?",
      opcoes: [
        "Só exemplo, só exemplo, só exemplo.",
        "Tese + dado estatístico + exemplo concreto + causa-consequência.",
        "Argumento por autoridade repetido três vezes.",
      ],
      correta: 1,
      explicacao:
        "Variedade constrói força. Um parágrafo robusto mistura tipos: a estatística dá peso, o exemplo humaniza, a causa-consequência mostra encadeamento lógico. Repetição do mesmo tipo deixa a estrutura frágil.",
    }),
    interpretacao({
      texto:
        "A educação financeira reduz endividamento entre jovens. Estudo do Banco Central de 2023 apontou que 72% dos jovens que receberam aulas de finanças conseguem poupar. Um exemplo: Rafael, 19 anos, após aprender sobre juros compostos, diminuiu gastos desnecessários em 40%. Consequentemente, quando surge emergência, ele não precisa recorrer ao crédito predatório. Paulo Freire defendeu que conhecimento liberta; na prática, conhecimento financeiro liberta do endividamento.",
      pergunta: "Quantos tipos diferentes de argumento aparecem nesse texto?",
      opcoes: [
        "Um: só dados estatísticos",
        "Dois: dados e exemplo",
        "Quatro: dados, exemplo, causa-consequência e autoridade",
      ],
      correta: 2,
      explicacao:
        'O texto constrói com inteligência. A estatística fundamenta a tese, o exemplo (Rafael) humaniza, a lógica causa-consequência mostra implicação ("quando surge emergência...") e Freire fecha com autoridade. Esta é a mistura que sobe nota.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Um argumento por causa-consequência pode ser invertido, começando da consequência desejada para explicar a causa.",
      verdadeiro: true,
      explicacao:
        'Verdade. Você tanto pode dizer "a desigualdade CAUSA revolta social" quanto "OBSERVE a revolta social: sua causa é a desigualdade." A lógica de encadeamento funciona nos dois sentidos, desde que o nexo seja claro e plausível.',
    }),
    ordenar({
      blocos: [
        "Segundo pesquisa do IPEA, 35% dos brasileiros não têm acesso a internet banda larga.",
        "Isso impede que estudantes acompanhem aulas remotas.",
        "A exclusão digital reproduz desigualdade educacional.",
        "Portanto, políticas de conectividade são urgentes.",
      ],
      explicacao:
        "Olha como a construção flui: dado (peso do número), depois a consequência direta (aula remota inviabilizada), depois a consequência mais profunda (desigualdade), fechando com a tese reforçada (urgência). O encadeamento causa-consequência liga o dado à conclusão, passo a passo.",
    }),
  ],
});

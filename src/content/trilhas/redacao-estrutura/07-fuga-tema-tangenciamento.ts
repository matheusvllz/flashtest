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
 * Lição 07: Fuga do tema vs tangenciamento
 */
export const fugaTemaTangenciamento = defineLesson({
  id: "redacao-estrutura-07-fuga-tema-tangenciamento",
  titulo: "Fuga do tema vs tangenciamento",
  descricao: "Compreender os limites: o que é desvio leve e o que é abandono total do tema.",
  exercicios: [
    multiplaEscolha({
      pergunta: 'Qual é a diferença principal entre "fuga ao tema" e "tangenciamento"?',
      opcoes: [
        "Fuga é leve; tangenciamento é grave",
        "Fuga é total abandono do tema; tangenciamento é abordagem parcial baseada no assunto amplo",
        "Não existe diferença; são sinônimos",
      ],
      correta: 1,
      explicacao:
        'Fuga: você ignora completamente o que foi pedido. Tangenciamento: você toca o assunto amplo mas não a especificidade do tema. Exemplo: tema é "inclusão digital em zonas rurais"; fuga é escrever sobre futebol; tangenciamento é escrever sobre "tecnologia em geral" sem conectar à ruralidade.',
    }),
    verdadeiroFalso({
      afirmacao: "Uma redação com tangenciamento recebe nota zero em todas as competências.",
      verdadeiro: false,
      explicacao:
        "Tangenciamento limita a nota: máximo 40 pontos nas Competências II, III e V. Não é zero, mas é severamente prejudicial. Fuga total é que resulta em zero absoluto. A diferença de severidade é crucial.",
    }),
    multiplaEscolha({
      pergunta:
        'Tema: "Desafios para a valorização da herança africana no Brasil". Qual redação é fuga total?',
      opcoes: [
        "Texto que desenvolve apenas o aspecto econômico (valorização através de mercado) ignorando aspectos culturais, educacionais e políticos",
        "Texto que fala sobre história do Brasil em geral sem conectar à herança africana específica",
        "Texto que reconhece herança africana mas não a aborda em todos os seus elementos",
      ],
      correta: 1,
      explicacao:
        "A segunda é fuga: não toca na herança africana. A primeira é tangenciamento (toca um aspecto mas não todos). A terceira é abordagem parcial mas reconhecível como tentativa válida. Fuga é invisibilidade do tema.",
    }),
    completeLacuna({
      frase:
        "Tangenciamento é quando o aluno desenvolve o assunto amplo, mas aborda a temática específica proposta apenas ___.",
      opcoes: ["marginalmente", "totalmente", "com profundidade"],
      correta: 0,
      explicacao:
        'Tangenciamento é desequilíbrio: o aluno caminha bem no assunto geral e marginaliza o específico. Tema "desigualdade educacional em escolas rurais"; tangenciamento seria discutir "desigualdade educacional" de forma genérica e mal tocar na ruralidade. Faltou especificidade.',
    }),
    parear({
      instrucao: "Relacione cada situação com sua classificação de desvio",
      pares: [
        {
          a: "Tema: inclusão digital. Redação: tecnologia em geral, sem mencionar inclusão",
          b: "Fuga total",
        },
        {
          a: "Tema: inclusão digital. Redação: foca em cidades, mal menciona zonas rurais",
          b: "Tangenciamento",
        },
        {
          a: "Tema: inclusão digital. Redação: aborda inclusão, acesso, educação, benefícios",
          b: "Desenvolvimento adequado do tema",
        },
      ],
      explicacao:
        "Fuga ignora. Tangenciamento toca superficialmente. Adequação aborda os elementos essenciais com profundidade. Reconhecer a diferença é saber onde você está no espectro de desempenho.",
    }),
    encontreOErro({
      frase:
        "A tecnologia avança rapidamente no Brasil, influenciando diversas áreas da sociedade e transformando a forma como as pessoas vivem.",
      erroIndex: 1,
      explicacao:
        'Esta frase é genérica. Se o tema específico é "inclusão digital em zonas rurais", esta afirmação ignora a ruralidade, igualdade e inclusão. Ela foca em "tecnologia e sociedade" como conceito vago. Isso é o início de uma possível fuga ou tangenciamento, dependendo de como o resto do texto se desenvolver.',
    }),
    ordenar({
      blocos: [
        'Tema: "Desafios para a valorização da herança africana no Brasil"',
        "Você não menciona herança africana em nenhum momento",
        "Você toca levemente na herança africana mas se concentra em histórico geral do Brasil",
        "Você aborda herança africana, valorização, desafios educacionais, culturais e políticos",
        "Cenário 1 = Fuga total = zero em todas as competências",
        "Cenário 2 = Tangenciamento = máximo 40 pontos em Competências II, III e V",
        "Cenário 3 = Desenvolvimento adequado = possibilidade de notas altas",
      ],
      explicacao:
        "O mesmo tema, três abordagens, três consequências diferentes. Fuga é destruidora; tangenciamento é limitante; adequação é fundamental para nota alta. Você conhecer esses três níveis garante que evita o primeiro e o segundo.",
    }),
    multiplaEscolha({
      pergunta:
        'Qual redação MELHOR aborda o tema "Desafios da sustentabilidade ambiental nas cidades brasileiras"?',
      opcoes: [
        "Redação sobre sustentabilidade em geral, em países do mundo inteiro, sem focar cidades brasileiras",
        "Redação que aborda principalmente cidades, com menção tangencial a desafios ambientais específicos",
        "Redação que expõe desafios como poluição, resíduos, falta de áreas verdes nas cidades brasileiras, e propõe políticas de recuperação ambiental urbana",
      ],
      correta: 2,
      explicacao:
        "Só a terceira integra os elementos: Brasil (especificidade), cidades (recorte geográfico), sustentabilidade ambiental (tema central), desafios (ênfase no problema), e proposta (solução). As outras são vagas, genéricas, ou tangenciam.",
    }),
    interpretacao({
      texto:
        'A Cartilha do ENEM 2025 define que tangenciamento é "abordagem parcial baseada somente no assunto mais amplo", e impõe limite máximo de 40 pontos nas Competências II, III e V quando presente. Isso significa que, mesmo que você escreva muito bem (Competência I com 200 pontos) e use ótimos conectivos (Competência IV com 200 pontos), a Competência II ficará travada em 40 por você não ter abordado a especificidade do tema. Essa penalização estrutural reconhece que o ENEM não quer apenas bom português; quer compreensão profunda do tema proposto.',
      pergunta:
        "Como a penalização de tangenciamento afeta a nota final da redação, mesmo que Competências I e IV sejam ótimas?",
      opcoes: [
        "Não afeta; se I e IV forem boas, a nota final é alta",
        "Limita Competências II, III e V a 40 pontos, reduzindo significativamente a nota final",
        "Zera toda a redação",
      ],
      correta: 1,
      explicacao:
        "Tangenciamento é o teto da casa: não importa quão bem você escreva ou quão elegantes sejam seus conectivos, se você não abordou o tema específico em profundidade, três das cinco competências ficam limitadas. É uma penalização estrutural, não superficial.",
    }),
  ],
});

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
 * Lição 02: Introdução - contextualização e tese
 */
export const introducaoContextualizacaoTese = defineLesson({
  id: "redacao-estrutura-02-introducao-contextualizacao-tese",
  titulo: "Introdução: contextualização + tese",
  descricao: "Como abrir o texto com clareza: contexto da discussão e sua opinião central.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é a contextualização em uma introdução?",
      opcoes: [
        "Contar uma história pessoal do autor sobre o tema",
        "Apresentar o cenário, a realidade ou o problema que justifica a discussão",
        "Copiar um trecho dos textos motivadores da prova",
      ],
      correta: 1,
      explicacao:
        "Contextualizar é pisar firme no terreno: você indica ao leitor onde estamos, qual é o estado de coisas que vale a pena discutir. Não é narrativa pessoal, não é cópia. É o alicerce da conversa.",
    }),
    multiplaEscolha({
      pergunta: "Qual é a função da tese na introdução?",
      opcoes: [
        "Contar detalhes que serão expandidos depois",
        "Apresentar claramente o ponto de vista do autor sobre o tema",
        "Fazer uma pergunta retórica sem resposta esperada",
      ],
      correta: 1,
      explicacao:
        'A tese é sua bússola. Não é vaga, não é pergunta: é uma afirmação clara do que você defende. "A educação digital é essencial para incluir comunidades rurais." Isso é tese. O leitor já sabe sua posição após ler a introdução.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma boa introdução cumpre em poucas linhas: contextualiza rapidamente e expõe a tese sem rodeio.",
      verdadeiro: true,
      explicacao:
        "Introdução não é um discurso. Um a três parágrafos bastam. Você contextualiza em poucas linhas e já traz sua opinião. O desenvolvimento é que aprofunda; a introdução abre a porta com elegância, não constrói a casa toda.",
    }),
    completeLacuna({
      frase:
        "A tese é o elemento que ___ claramente qual é o ponto de vista defendido ao longo da redação.",
      opcoes: ["esconde", "expõe", "questiona"],
      correta: 1,
      explicacao:
        "Tese expõe, revela, não esconde. O avaliador precisa identificar sua opinião logo na introdução. Se ele ler até o fim e ainda estiver em dúvida sobre o que você defende, a tese falhou na sua função estrutural.",
    }),
    parear({
      instrucao: "Relacione cada componente com sua descrição",
      pares: [
        { a: "Contextualização", b: "Apresenta o cenário ou problema que justifica a discussão" },
        { a: "Tese", b: "Expressa claramente o ponto de vista do autor" },
        { a: "Introdução", b: "Parágrafo(s) inicial(is) que contextualiza e expõe a tese" },
      ],
      explicacao:
        "Introdução é a estrutura que abriga contextualização e tese. Uma não vive sem a outra: contexto sem opinião fica solto; opinião sem contexto parece gratuita.",
    }),
    encontreOErro({
      frase:
        "A sociedade contemporânea enfrenta desafios digitais? A tecnologia é importante? Será que devemos pensar em inovação?",
      erroIndex: 10,
      explicacao:
        'Repare em "Será": é dúvida, hedge, não afirmação. Depois dela vem só mais uma pergunta, nunca a tese. Você contextualizou os desafios (tudo bem até aqui), mas cadê sua opinião? Perguntas retóricas só funcionam se, no fim, vierem seguidas de uma afirmação clara. Aqui, o texto termina como começou: só perguntando.',
    }),
    ordenar({
      blocos: [
        "Hoje, a tecnologia permeia todas as esferas da vida: educação, trabalho, saúde.",
        "Estudos mostram que comunidades sem acesso à internet estão cada vez mais marginalizadas.",
        "Portanto, a inclusão digital é fundamental para reduzir desigualdades.",
        "Uma introdução bem estruturada segue este movimento",
      ],
      explicacao:
        "Você começa abrindo a janela (contexto geral), depois aperta o foco (problema específico), e termina com a opinião (tese). Nessa ordem, você constrói a credibilidade para defender o ponto de vista nos parágrafos seguintes.",
    }),
    multiplaEscolha({
      pergunta: "Qual introdução melhor atende aos critérios de clareza e estrutura?",
      opcoes: [
        "O mundo é complexo. As pessoas pensam de forma diferente. A vida é uma jornada de descobertas.",
        "Hoje, tecnologia e educação caminham juntas. Escolas brasileiras, porém, enfrentam falta de infraestrutura digital. Portanto, políticas públicas de investimento tecnológico são essenciais para modernizar o ensino.",
        "Você já parou para pensar em como as coisas funcionam? Será que sabemos realmente o que queremos? A vida nos coloca muitas dúvidas.",
      ],
      correta: 1,
      explicacao:
        "Só a segunda contextualiza (tecnologia + educação), identifica o problema (falta de infraestrutura), e expõe a tese (políticas públicas são essenciais). A primeira é vaga; a terceira, só perguntas sem respostas. Clareza é força.",
    }),
    interpretacao({
      texto:
        'Uma introdução forte reconhece o contexto: a realidade que fundamenta o debate. Por exemplo, se o tema é inclusão digital, contextualizar significa reconhecer que, de fato, há exclusão: dados mostram disparidades de acesso em regiões rurais e comunidades de baixa renda. Depois, a tese expõe a opinião: "Políticas públicas devem priorizar a conectividade nas zonas rurais." Sem contextualização, a tese parece opinião vaga; sem tese clara, o contexto vira descrição estéril.',
      pergunta:
        "De acordo com o texto, por que uma tese sem contextualização prévia é problemática?",
      opcoes: [
        "Porque não há desenvolvimento depois da introdução",
        "Porque parece uma opinião vaga, desconectada da realidade",
        "Porque o leitor não consegue ler o resto da redação",
      ],
      correta: 1,
      explicacao:
        'Tese isolada é bolha. Seu fundamento está na realidade que você contextualizou. Se você pula direto para "políticas públicas devem priorizar conectividade" sem antes indicar que há exclusão digital real, parece gratuita. Contexto constrói credibilidade.',
    }),
  ],
});

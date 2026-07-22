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
 * Lição 03: Desenvolvimento - tópico frasal e progressão
 */
export const desenvolvimentoTopicoFrasalProgressao = defineLesson({
  id: "redacao-estrutura-03-desenvolvimento-topico-frasal-progressao",
  titulo: "Desenvolvimento: tópico frasal e progressão",
  descricao: "A espinha dorsal do argumento: tópico frasal e expansão organizada.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um tópico frasal?",
      opcoes: [
        "A primeira palavra de qualquer parágrafo",
        "A ideia central de um parágrafo que será desenvolvida e fundamentada",
        "Uma citação de autor famoso ao início do parágrafo",
      ],
      correta: 1,
      explicacao:
        'Tópico frasal é a base estrutural de cada parágrafo. Ele anuncia o argumento: "Educar crianças em ambientes digitais amplia sua criatividade." Tudo que vem depois sustenta essa ideia. É o alicerce local.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Cada parágrafo do desenvolvimento deve ter um tópico frasal claro que se conecte diretamente com a tese introduzida.",
      verdadeiro: true,
      explicacao:
        "Sem tópico frasal, o parágrafo vira uma colcha de retalhos. Com ele, você mantém a progressão lógica: tese principal (introdução) desdobra-se em argumentos (cada um com seu tópico), que se relacionam e avançam na defesa do ponto de vista.",
    }),
    multiplaEscolha({
      pergunta: "Qual é a estrutura interna ideal de um parágrafo do desenvolvimento?",
      opcoes: [
        "Várias ideias diferentes sem ordem específica",
        "Tópico frasal seguido de explicação, exemplos ou dados que o fundamentam",
        "Apenas cópia dos textos motivadores da prova",
      ],
      correta: 1,
      explicacao:
        'Você expõe a ideia, depois a sustenta. Não é suficiente dizer "educação digital muda vidas"; você precisa mostrar por quê: dados de acesso, exemplos de programas bem-sucedidos, análise. Estrutura: ideia + fundamento.',
    }),
    completeLacuna({
      frase:
        "A progressão de argumentos significa que cada novo parágrafo deve ___ com o anterior, aprofundando ou expandindo o ponto de vista defendido.",
      opcoes: ["repetir", "contradizer", "relacionar-se"],
      correta: 2,
      explicacao:
        "Progressão é movimento organizado. Não é repetição de tópicos. Cada parágrafo novo traz um ângulo diferente, um argumento complementar, que se encadeia com os anteriores em direção à conclusão. É arquitetura, não passos em falso.",
    }),
    parear({
      instrucao: "Combine cada elemento com sua função no desenvolvimento",
      pares: [
        { a: "Tópico frasal", b: "Anuncia a ideia central do parágrafo" },
        { a: "Fundamentação", b: "Exemplos, dados ou explicações que sustentam o tópico" },
        { a: "Progressão", b: "Avanço lógico entre parágrafos sucessivos" },
      ],
      explicacao:
        "O desenvolvimento é uma máquina de três peças. Tópico abre a porta, fundamentação a atravessa, progressão a articula com a porta seguinte. Nenhuma sobra; todas importam.",
    }),
    encontreOErro({
      frase:
        "Educação digital é importante. Além disso, as pessoas precisam aprender. Também, tecnologia está em toda parte. Por fim, tudo muda rápido.",
      erroIndex: 3,
      explicacao:
        'Repare em "importante.": dizer que algo "é importante" não fundamenta nada, é a afirmação mais vazia que existe numa redação. Este parágrafo não tem tópico frasal de verdade: é uma lista de afirmações soltas ("pessoas precisam aprender" repete o óbvio; os conectivos Além, Também, Por fim ligam frases, não ideias). Falta o argumento consistente que sustenta cada afirmação.',
    }),
    ordenar({
      blocos: [
        "A inclusão digital é fundamental para ampliar oportunidades econômicas em comunidades rurais.",
        "Estudos de instituições como UNESCO mostram que acesso digital reduz desigualdades educacionais em até 35%.",
        "Portanto, investir em infraestrutura tecnológica retorna em crescimento e mobilidade social.",
        "Um parágrafo bem estruturado do desenvolvimento segue este movimento",
      ],
      explicacao:
        "Tópico frasal anuncia a ideia (inclusão digital amplia oportunidades), dados e exemplos a fundamentam (estatísticas de UNESCO), e você encerra conectando a ideia ao contexto maior (retorno econômico). Essa é a respiração do argumento.",
    }),
    multiplaEscolha({
      pergunta: "Qual parágrafo melhor exemplifica uma progressão coerente no desenvolvimento?",
      opcoes: [
        "Primeiro parágrafo: educação digital muda vidas. Segundo parágrafo: tecnologia em casa é bom. Terceiro parágrafo: crianças gostam de computador.",
        "Primeiro parágrafo: educação digital expande acesso. Segundo parágrafo: a inclusão digital reduz lacunas de aprendizado. Terceiro parágrafo: logo, políticas de conectividade geram retorno social mensurável.",
        "Primeiro parágrafo: muitas coisas acontecem no mundo. Segundo parágrafo: as pessoas pensam diferente. Terceiro parágrafo: tudo é complicado.",
      ],
      correta: 1,
      explicacao:
        "A segunda progressão segue uma lógica clara: acesso (fato base) leva a inclusão (consequência imediata) que gera retorno social (implicação maior). Cada parágrafo aprofunda a defesa. As outras são vagas ou circulares.",
    }),
    interpretacao({
      texto:
        'Segundo a Competência III do ENEM, o texto deve "apresentar informações, fatos e opiniões relacionados ao tema proposto, de forma consistente e organizada, configurando autoria, em defesa de um ponto de vista." Isso significa que o aluno não pode apenas listar argumentos: precisa organizá-los de forma que cada um conecte ao anterior e avancem juntos para fortalecer a tese. Parágrafos desconectados, mesmo que bem escritos individualmente, reduzem a inteligibilidade do texto e prejudicam a nota na Competência III.',
      pergunta: "O que a Competência III avalia que vai além da simples listagem de argumentos?",
      opcoes: [
        "A quantidade de palavras usadas em cada parágrafo",
        "A organização e conexão entre argumentos, bem como o avanço progressivo para fortalecer a tese",
        "A quantidade de pontuação utilizada",
      ],
      correta: 1,
      explicacao:
        "Competência III avalia a ESTRUTURA PROFUNDA: como as ideias se relacionam, avançam, constroem um projeto coerente. Não é quantidade; é qualidade de pensamento. Parágrafos soltos, mesmo inteligentes, mostram falta de planejamento, e planejamento (projeto de texto) é o que diferencia nota alta de nota média.",
    }),
  ],
});

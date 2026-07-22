import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  ordenar,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 04: Contra-argumentação
 */
export const contraArgumentacao = defineLesson({
  id: "redacao-argumentacao-04-contra-argumentacao",
  titulo: "Contra-argumentação",
  descricao: "Como reconhecer objeções ao seu argumento e rebatê-las para fortalecer sua tese.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é contra-argumentação em um texto dissertativo?",
      opcoes: [
        "Mudar de opinião no meio da redação",
        "Reconhecer uma objeção possível e rebatê-la para fortalecer a tese",
        "Escrever contra o tema proposto",
      ],
      correta: 1,
      explicacao:
        "Contra-argumentação é inteligência. Você antecipa o que o leitor crítico poderia objetar, confronta essa objeção, e mostra por que sua tese continua de pé. É como reforçar a estrutura onde há risco de rachadura.",
    }),
    ordenar({
      blocos: [
        "Alguns argumentam que educação a distância reduz custos e democratiza acesso.",
        "De fato, aumentou o acesso, mas com um custo oculto:",
        "queda nas taxas de conclusão e no aprendizado significativo em populações vulneráveis.",
        "Portanto, educação a distância sozinha não resolve; precisa de infraestrutura de suporte.",
      ],
      explicacao:
        "Estrutura clássica: tese oposta + concessão (sim, tem um lado bom) + PORÉM + refutação (mas o lado negativo é maior) + tese reforçada (precisamos de mais). Essa é a força do contra-argumento bem aplicado.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma boa contra-argumentação começa reconhecendo que a tese oposta tem algum ponto válido.",
      verdadeiro: true,
      explicacao:
        "Verdade. Reconhecer a força do argumento contrário não enfraquece você; fortalece. Mostra que você NÃO é inflexível, que pensa com profundidade. A banca respeita quem sabe ler os dois lados.",
    }),
    completeLacuna({
      frase:
        "A conjunção ___ é típica da contra-argumentação porque marca a virada lógica de concessão para refutação.",
      opcoes: ["mas", "pois", "portanto"],
      correta: 0,
      explicacao:
        "Mas é a dobradiça: reconheço o argumento anterior E contrapono meu ponto. É o conector mais crítico para virar a mesa. Pois justifica; portanto conclui. Mas OPÕE.",
    }),
    encontreOErro({
      frase:
        "Alguns dizem que redes sociais conectam pessoas. Isso é verdade, então devemos evitá-las.",
      erroIndex: 10,
      explicacao:
        'Lógica errada. Se reconheceu que conectam (concessão), não pode saltar para "evitá-las" sem refutar o benefício ou explicar por que o malefício é maior. Falta a ponte argumentativa. Use: "...mas o custo mental supera o benefício de conexão".',
    }),
    multiplaEscolha({
      pergunta: "Qual frase exemplifica bem uma contra-argumentação?",
      opcoes: [
        '"Tecnologia não deveria existir porque tira empregos."',
        '"Tecnologia tira empregos, é verdade. Porém, historicamente, novas tecnologias criam mais postos que destroem, desde que acompanhadas de requalificação."',
        '"Tecnologia é boa porque conecta o mundo."',
      ],
      correta: 1,
      explicacao:
        'Repara no "é verdade" seguido de "Porém". Isso é contra-argumentação de verdade: concessão + refutação. Mostra pensamento crítico, não rigidez. A banca sobe nota em Competência III quando vê esse manejo.',
    }),
    interpretacao({
      texto:
        "Críticos argumentam que o Ensino Médio de 3 anos não preza aprofundamento nas disciplinas. Essa preocupação é legítima. Contudo, a realidade brasileira também faz urgência: jovens pobres precisam entrar no mercado de trabalho cedo. Uma reforma que estendesse o Ensino Médio para 4 anos aumentaria a evasão justamente entre quem menos pode esperar. Logo, a solução não é mais tempo na escola, mas melhor qualidade no tempo que existe, com curriculos flexíveis.",
      pergunta: "Como o texto trabalha a contra-argumentação para reforçar sua tese?",
      opcoes: [
        "Ignora a crítica e segue adiante",
        "Reconhece a legitimidade da crítica (concessão), mas apresenta realidade conflitante, e propõe solução alternativa",
        "Prova que os críticos estão 100% errados",
      ],
      correta: 1,
      explicacao:
        'Sofisticação é isso: "Sua preocupação é legítima" não é fraqueza, é força. Mostra que você PENSA. Depois vem a realidade (contexto de pobreza) que refuta a solução proposta (mais tempo) sem descartar a preocupação original (qualidade). É carpintaria de argumentação de alta complexidade.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Usar contra-argumentação deixa sua tese fraca porque você está dando espaço para o lado contrário.",
      verdadeiro: false,
      explicacao:
        "Inverso. Reconhecer o argumento oposto e rebatê-lo mostra que sua defesa é sólida o bastante para suportar desafio. É como estar em uma luta e absorver um golpe sem cair. A banca reconhece isso como autoria e maturidade intelectual.",
    }),
    multiplaEscolha({
      pergunta: "Em qual contexto a contra-argumentação é MENOS recomendada em uma redação?",
      opcoes: [
        "Quando não há espaço no parágrafo para rebater de verdade",
        "Quando você quer mostrar profundidade de pensamento",
        "Quando sua tese é sólida",
      ],
      correta: 0,
      explicacao:
        "Se você menciona uma objeção mas não tem espaço para rebatê-la direito, é melhor deixar de fora. Uma contra-argumentação fraca (concessão sem refutação vigorosa) prejudica mais que ajuda. De novo: é qualidade, não quantidade.",
    }),
  ],
});

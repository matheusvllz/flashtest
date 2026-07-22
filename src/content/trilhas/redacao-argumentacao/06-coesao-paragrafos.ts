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
 * Lição 06: Coesão entre parágrafos (C4 aplicada)
 */
export const coesaoParagrafos = defineLesson({
  id: "redacao-argumentacao-06-coesao-paragrafos",
  titulo: "Coesão entre parágrafos",
  descricao:
    "Como conectar os parágrafos de forma lógica e explícita usando conectivos e referências.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é coesão entre parágrafos?",
      opcoes: [
        "Começar todos os parágrafos da mesma forma",
        "Usar conectivos e referências para criar ligação lógica explícita entre ideias dos parágrafos",
        "Escrever parágrafos muito longos",
      ],
      correta: 1,
      explicacao:
        "Coesão é o cimento entre os tijolos. Um parágrafo isolado é bonito, mas um texto é um edifício: cada parágrafo tem que estar amarrado ao anterior e ao próximo. Sem essa amarração, o texto desaba.",
    }),
    ordenar({
      blocos: [
        "A educação de qualidade é direito fundamental para desenvolvimento social.",
        "Ademais, histórico de investimento BAIXO em educação pública explica muitos problemas contemporâneos.",
        "Portanto, aumentar orçamento para escolas não é gasto, é INVESTIMENTO em receita futura.",
        "Consequentemente, toda política de desenvolvimento sustentável tem que começar aqui.",
      ],
      explicacao:
        "Vê como funciona: direito (tese) + ademais (soma argumento) + portanto (tira conclusão lógica) + consequentemente (leva adiante). Cada parágrafo é um passo que leva ao próximo. Sem conectivos, seriam ideias soltas.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Um texto com três parágrafos desconectados mas cada um bem escrito pode receber nota alta em Competência III (argumentação).",
      verdadeiro: false,
      explicacao:
        'Não. Competência III exige "coerência e plausibilidade ENTRE as ideias" e "progressão adequada". Parágrafo isolado não tem progressão. A banca liga: não há estrutura, não há autoria, há só boas frases suspensas.',
    }),
    completeLacuna({
      frase:
        "O conectivo ___ marca uma relação de ADIÇÃO de argumento ao parágrafo anterior, reforçando a tese.",
      opcoes: ["além disso", "porém", "portanto"],
      correta: 0,
      explicacao:
        '"Além disso" e "outrossim" SOMAM argumentos. "Porém" OPÕE. "Portanto" CONCLUI. Escolha o conector que faz o trabalho lógico certo. É a diferença entre construção sólida e construção frágil.',
    }),
    encontreOErro({
      frase: "A educação reduz violência. Os jovens precisam de oportunidades.",
      erroIndex: 4,
      explicacao:
        'Falta conexão entre as frases. Qual é o nexo? "A educação reduz violência. PORTANTO, os jovens precisam de oportunidades." ou "...PORQUE os jovens precisam de oportunidades." Sem conectivo, parece que uma frase não tem nada a ver com a outra.',
    }),
    multiplaEscolha({
      pergunta: "Como melhorar a coesão de um texto com parágrafos desconectados?",
      opcoes: [
        "Deixar como está; desconexão é estilo pessoal",
        "Adicionar conectivos que expliquem a relação lógica entre parágrafos",
        "Fazer os parágrafos ainda maiores",
      ],
      correta: 1,
      explicacao:
        'Conectivos SÃO a construção. Não é estilo: é estrutura. "Além disso", "entretanto", "logo", "em outras palavras" não são decoração; são o cimento. Sem eles, a banca vê desorganização na Competência IV (coesão).',
    }),
    interpretacao({
      texto:
        "Parágrafo 1: Desigualdade educacional começa na primeira infância. Parágrafo 2 (original): Livros são caros. Parágrafo 2 (revisado): Além disso, acesso a livros é desigual: famílias pobres não conseguem comprar material pedagógico de qualidade, aprofundando o problema. Parágrafo 3 (original): A professora é importante. Parágrafo 3 (revisado): Consequentemente, o papel do professor se torna ainda mais crítico: deve compensar a falta de recurso doméstico com mediação em sala de aula.",
      pergunta: "Qual é o ganho de coesão na revisão?",
      opcoes: [
        "Apenas tornou mais longo",
        'Adicionou conectivos ("Além disso", "Consequentemente") que explicam COMO cada ideia se relaciona com a anterior, formando progressão lógica',
        "Não houve ganho real",
      ],
      correta: 1,
      explicacao:
        'Repara: a versão revisada mostra o caminho do pensamento. "Além disso" diz "estou APROFUNDANDO o problema de desigualdade". "Consequentemente" diz "você vê que o RESULTADO é sobrecarga do professor". Sem essas marcas, o leitor se perde. Com elas, segue o fio.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Um parágrafo bem coeso pode usar apenas conectivos para se ligar ao anterior; não precisa de outras técnicas como pronome anafórico ou sinônimo.",
      verdadeiro: false,
      explicacao:
        'Falso. Coesão é REPERTÓRIO diverso. Conectivos são importantes, mas também pronomes ("isso", "tal situação"), sinônimos ("desigualdade"..."disparidade"), advérbios ("lá", "então"). Variedade de técnicas fortalece a estrutura.',
    }),
    multiplaEscolha({
      pergunta: "Qual sequência de conectivos mantém melhor progressão argumentativa?",
      opcoes: [
        '"Primeiro... Segundo... Terceiro... Quarto..."',
        '"Inicialmente... Além disso... Entretanto... Portanto..."',
        '"Assim... Assim... Assim... Assim..."',
      ],
      correta: 1,
      explicacao:
        'Diversidade com lógica: iniciação, adição, objeção (contra-argumento), conclusão. Isso é PROGRESSÃO. Repetir "primeiro segundo" é lista, não argumentação. Repetir "assim" é falta de vocabulário. A banca aprecia variedade que faz sentido.',
    }),
  ],
});

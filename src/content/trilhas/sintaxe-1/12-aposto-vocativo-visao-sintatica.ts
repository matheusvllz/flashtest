import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

/**
 * Lição 12: Aposto e vocativo (visão sintática)
 */
export const apostoVocativoSintatico = defineLesson({
  id: "sintaxe-1-12-aposto-vocativo-visao-sintatica",
  titulo: "Aposto e vocativo (visão sintática)",
  descricao: "Como reconhecer e usar corretamente esses termos acessórios.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a diferença entre aposto e vocativo?",
      opcoes: [
        "Aposto explica; vocativo chama",
        "Vocativo explica; aposto chama",
        "Não há diferença, são sinônimos",
      ],
      correta: 0,
      explicacao:
        'Aposto é o comentário que detalha outro termo: "Machado, autor de Dom Casmurro". Vocativo é o chamamento: "Machado, venha aqui!". Um explica, o outro convida. Papéis distintos.',
    }),
    multiplaEscolha({
      pergunta: "Em qual frase há vocativo?",
      opcoes: [
        "O presidente, homem de princípios, discursou.",
        "Presidente, quero falar com o senhor.",
        "O discurso do presidente foi marcante.",
      ],
      correta: 1,
      explicacao:
        'Em "Presidente, quero falar", chama-se o presidente pela atenção. Vocativo é sempre chamamento, sempre pede vírgula, sempre pode ser removido sem quebrar a frase.',
    }),
    verdadeiroFalso({
      afirmacao: "Aposto pode ser um nome próprio que explica um nome comum.",
      verdadeiro: true,
      explicacao:
        'Verdadeiro. Em "A capital, Brasília, foi inaugurada em 1960", Brasília é aposto, nome próprio que explica/detalha capital. Explicação cruzada entre nomes.',
    }),
    completeLacuna({
      frase: 'Em "Professor, o senhor poderia responder?", "Professor" é um ___.',
      opcoes: ["vocativo", "aposto", "complemento nominal"],
      correta: 0,
      explicacao:
        'Vocativo: chama-se o professor pela atenção. Sem ele, "O senhor poderia responder?" é oração completa. Vocativo entra em cena pra convocar, nada mais.',
    }),
    encontreOErro({
      frase: "Meu amigo João, o melhor colega que tenho visitou-me ontem.",
      erroIndex: 7,
      explicacao:
        'Falta vírgula após "tenho": "Meu amigo João, o melhor colega que tenho, visitou-me". O aposto "o melhor colega que tenho" precisa de vírgula de fechamento. Sem ela, estrutura quebra.',
    }),
    parear({
      instrucao: "Combine cada frase com seu termo acessório",
      pares: [
        { a: "Ana, chegou a hora.", b: "Vocativo" },
        { a: "Ana, minha melhor amiga, chegou.", b: "Aposto" },
        { a: "Ana chegou.", b: "Frase sem acessórios" },
      ],
      explicacao:
        "Vocativo chama (Ana!). Aposto descreve (Ana, minha amiga). Sem nenhum, frase simples. Cada um tem papel sintático nítido.",
    }),
    verdadeiroFalso({
      afirmacao: "Vocativo nunca pode estar no meio de uma oração, só no início ou final.",
      verdadeiro: false,
      explicacao:
        'Falso. Em "Tenho, professor, uma dúvida sobre a prova", o vocativo aparece bem no meio. Ele pode começar, terminar ou estar no meio da oração, sempre isolado por vírgula(s), mas livre no deslocamento.',
    }),
    interpretacao({
      texto:
        'Aposto e vocativo são luxo sintático que distingue texto sofisticado de ingênuo. Uma redação que nunca usa aposto soa telegráfica: "A capital é Brasília. Fica no centro do Brasil." Uma que domina aposto respira: "Brasília, capital audaciosa, fica no coração do Brasil." Vocativo marca intimidade na fala, é recurso de diálogo, de dramaturgia. O redator que os maneja cria texturas, ritmos, aproximação com o leitor. Estrutura que seduz.',
      pergunta: "Conforme o texto, qual é o efeito de usar aposto e vocativo na redação?",
      opcoes: [
        "Cria texturas, ritmo e sofisticação na linguagem",
        "Torna o texto mais formal e científico",
        "Não tem efeito relevante na qualidade",
      ],
      correta: 0,
      explicacao:
        "Aposto e vocativo são ferramentas de estilo: refinam, respiram, aproximam. Redação que os domina soa madura, confortável. Redação que os ignora soa seca, vazia de nuance. Luxo sintático que marca profissionalismo.",
    }),
  ],
});

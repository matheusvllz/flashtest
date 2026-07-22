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
 * Lição 03 da trilha de Concordância: expressões partitivas e porcentagem.
 */
export const expressoesPartitivasPercentagem = defineLesson({
  id: "concordancia-03-expressoes-partitivas-porcentagem",
  titulo: "Expressões partitivas e porcentagem",
  descricao: 'Concordância com "um dos", "a maioria", "50%" e similares.',
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma expressão partitiva?",
      opcoes: [
        "Uma frase que começa com vírgula",
        'Uma expressão que indica uma PARTE de um todo, como "um dos alunos" ou "a maioria"',
        "Uma palavra que divide um texto em partes",
      ],
      correta: 1,
      explicacao:
        'Partitiva vem de "parte": ela fala de um pedaço, uma porção. "Alguns dos candidatos" é partitiva porque "alguns" é apenas PARTE do grupo total.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Um dos alunos estava doente", o verbo concorda com "um" (singular) e não com "alunos" (plural).',
      verdadeiro: true,
      explicacao:
        'Quando a partitiva começa com "um de...", o verbo segue o "um": singular. É o um que faz a ação, não o grupo inteiro.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem concordância correta com expressão partitiva?",
      opcoes: [
        "A maioria dos alunos vão passar no teste.",
        "A maioria dos alunos vai passar no teste.",
        "Muitos dos alunos vão passar no teste.",
      ],
      correta: 1,
      explicacao:
        '"Maioria" é o núcleo (singular), então verbo singular "vai". "Muitos" é plural, daí "vão". O verbo segue quem comanda: a maioria comanda no singular.',
    }),
    completeLacuna({
      frase: "50% dos candidatos ___ à prova com muita ansiedade.",
      opcoes: ["comparecerá", "comparecerão"],
      correta: 1,
      explicacao:
        'Porcentagem é flexível, mas aqui "dos candidatos" é plural, então o verbo vai para plural "comparecerão". Quando a porcentagem vem seguida de plural, prefira o plural no verbo.',
    }),
    encontreOErro({
      frase: "A maior parte das crianças brincam no parque.",
      erroIndex: 5,
      explicacao:
        'Sujeito: "maior parte" é singular (a PARTE), então verbo singular "brinca". "Das crianças" é apenas o complemento nominal. Muitos confundem a parte com o todo, mas aqui a parte manda.',
    }),
    parear({
      instrucao: "Combine cada expressão com o número correto do verbo",
      pares: [
        { a: "Um dos poetas", b: "escreve boas poesias (verbo singular)" },
        { a: "A maioria dos poetas", b: "prefere poesia clássica (verbo singular)" },
        { a: "Alguns dos poetas", b: "escrevem boa poesia (verbo plural)" },
      ],
      explicacao:
        '"Um" é singular (um poeta age). "Maioria" é singular (a maioria age como uma). "Alguns" é plural (vários agem). Cada um tem seu verbo certo.',
    }),
    ordenar({
      blocos: ["Cerca de", "80%", "dos entrevistados", "aprovam", "a política."],
      explicacao:
        'Porcentagem: "80% dos entrevistados" é plural, logo verbo "aprovam" plural. Quando o núcleo é plural, o verbo segue.',
    }),
    interpretacao({
      texto:
        'Expressões partitivas como "um dos", "a maioria", "a maior parte", "a minoria", "cerca de", "mais de", "menos de" e porcentagens causam dúvida em concordância. A regra é: o verbo segue o núcleo da expressão. Em "Um dos alunos chegou cedo", "um" é o núcleo (singular). Em "A maioria dos alunos chegou cedo", "maioria" é o núcleo (singular). Porcentagens são flexíveis: "30% dos alunos chegaram" (plural, porque "alunos" é plural) ou "30% da turma chegou" (singular, porque "turma" é singular). Na dúvida, siga o número de quem vem logo depois da partitiva: se for plural, o verbo pode ir para plural.',
      pergunta: "Segundo o texto, qual é a estratégia para acertar concordância com partitivas?",
      opcoes: [
        "Seguir sempre o número do complemento (alunos, turma, etc)",
        "Seguir o núcleo da expressão (um, maioria, parte)",
        "Usar sempre singular, que é mais seguro",
      ],
      correta: 1,
      explicacao:
        "O texto ensina que o verbo segue o NÚCLEO (um, maioria, parte). Porcentagens são casos especiais onde o complemento importa.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "A minoria dos candidatos discordava da decisão", o verbo está correto porque "minoria" é singular.',
      verdadeiro: true,
      explicacao:
        'Sim: "minoria" é o núcleo (singular), então verbo "discordava" (singular) está perfeito. A minoria (como uma unidade) discordava.',
    }),
  ],
});

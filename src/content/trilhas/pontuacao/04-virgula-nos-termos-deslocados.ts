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
 * Lição 04: Vírgula nos termos deslocados
 */
export const virgulaNosTernosDeslocados = defineLesson({
  id: "pontuacao-04-termos-deslocados",
  titulo: "Vírgula nos termos deslocados",
  descricao: "A vírgula que marca termos fora de seu lugar natural na frase.",
  exercicios: [
    verdadeiroFalso({
      afirmacao:
        "Quando você coloca um termo no início da frase, ele pode precisar de vírgula para ficar claro.",
      verdadeiro: true,
      explicacao:
        "Verdade. O lugar natural de muitos termos é depois do verbo. Se você os leva para o início, a vírgula avisa que eles estão deslocados.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase está pontuada corretamente?",
      opcoes: [
        "Ontem estudei a noite toda para a prova.",
        "Ontem, estudei a noite toda para a prova.",
        "Estudei, ontem, a noite toda para a prova.",
      ],
      correta: 1,
      explicacao:
        'O advérbio "ontem" está deslocado no início. A vírgula depois dele sinaliza que ele saiu do seu lugar natural, que seria no final ou no meio da frase.',
    }),
    completeLacuna({
      frase: "Com o coração acelerado___ a menina entrou na sala de provas.",
      opcoes: [",", ".", "nada"],
      correta: 0,
      explicacao:
        'A expressão "com o coração acelerado" é um termo que naturalmente viria depois do verbo. No início, ela pede vírgula: "Com o coração acelerado, a menina..."',
    }),
    encontreOErro({
      frase: "Infelizmente a chuva atrapalhou o jogo de futebol ontem.",
      erroIndex: 0,
      explicacao:
        'O advérbio "Infelizmente" está no início da frase e precisa de vírgula: "Infelizmente, a chuva...". Sem ela, a leitura fica penosa.',
    }),
    ordenar({
      blocos: ["Com muita dedicação,", "conseguiu", "finalmente", "passar", "no concurso."],
      explicacao:
        'O termo "com muita dedicação" é adjunto que normalmente iria depois do verbo. Deslocado no início, recebe vírgula.',
    }),
    completeLacuna({
      frase: "No dia da prova___ ele estava muito nervoso e ansioso.",
      opcoes: [",", ";", "nada"],
      correta: 0,
      explicacao:
        'A expressão temporal "no dia da prova" está no início, fora de seu lugar natural. Merece vírgula: "No dia da prova, ele estava..."',
    }),
    multiplaEscolha({
      pergunta: 'Por que a vírgula em "Alguns dias depois, ela recebeu a notícia" é necessária?',
      opcoes: [
        "Para separar sujeito do verbo",
        "Para marcar um termo deslocado do seu lugar natural",
        "Para indicar que a frase é uma pergunta",
      ],
      correta: 1,
      explicacao:
        '"Alguns dias depois" é um adjunto adverbial de tempo que naturalmente viria no final ou no meio. Quando se desloca para o início, precisa de vírgula.',
    }),
    encontreOErro({
      frase: "Apesar de todas as dificuldades o aluno não desistiu do sonho.",
      erroIndex: 4,
      explicacao:
        'O termo "apesar de todas as dificuldades" está deslocado no início e falta sua vírgula: "Apesar de todas as dificuldades, o aluno..."',
    }),
    interpretacao({
      texto:
        'A vírgula dos termos deslocados é uma questão de clareza. Quando você escreve "No dia da prova, o coração acelerou", a vírgula avisa que a informação sobre o dia não é o sujeito da frase: é um detalhe contextual. Compare com "O coração no dia da prova acelerou" sem vírgula, que é confuso. A pontuação organiza a leitura e ajuda o leitor a entender a hierarquia de informações na frase.',
      pergunta: "Segundo o texto, qual é a principal função da vírgula nos termos deslocados?",
      opcoes: [
        "Separar o sujeito do predicado",
        "Organizar a leitura e indicar que o termo não é a informação principal",
        "Indicar pausa para respiração",
      ],
      correta: 1,
      explicacao:
        "A vírgula não é pausa: é sinalização de estrutura. Ela diz ao leitor que aquele termo inicial é um detalhe, não o cerne da frase.",
    }),
  ],
});

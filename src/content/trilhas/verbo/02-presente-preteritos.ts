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

export const presentePrateritos = defineLesson({
  id: "verbo-02-presente-preteritos",
  titulo: "Presente e pretéritos do indicativo",
  descricao: "Os tempos que falam de agora, de perto e de longe.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual frase usa corretamente o presente do indicativo?",
      opcoes: [
        "Amanhã eu comprarei um livro novo.",
        "Agora eu compro um livro novo.",
        "Semana passada eu comprei um livro novo.",
      ],
      correta: 1,
      explicacao:
        'O presente do indicativo fala do que acontece agora, em tempo real. "Compro" é presente. Os outros dois são futuro e pretérito, tempos diferentes.',
    }),
    multiplaEscolha({
      pergunta: "Qual é a diferença entre pretérito perfeito e pretérito imperfeito?",
      opcoes: [
        "O perfeito acabou, o imperfeito era repetido ou durava no passado",
        "O imperfeito é mais antigo que o perfeito",
        "O perfeito fala de fatos recentes, o imperfeito de fatos muito antigos",
      ],
      correta: 0,
      explicacao:
        'O pretérito perfeito marca uma ação que começou e terminou num tempo fechado: "li o livro ontem". O imperfeito mostra ações que duravam, se repetiam ou eram hábitos: "eu lia todo dia". Perspectivas diferentes do passado.',
    }),
    completeLacuna({
      frase: "Quando era criança, eu ___ muito na rua com os amigos.",
      opcoes: ["brinco", "brinquei", "brincava"],
      correta: 2,
      explicacao:
        'O imperfeito mostra ação repetida e durável no passado. "Brincava" é imperfeito e fala de um hábito que se repetia. A frase toda ("quando era criança") pede essa atmosfera de rotina do passado.',
    }),
    verdadeiroFalso({
      afirmacao:
        "O pretérito perfeito só pode ser usado para ações que acabaram muito tempo atrás.",
      verdadeiro: false,
      explicacao:
        'Não importa se foi há uma hora ou há um ano. Se a ação começou e terminou num tempo fechado, usa-se o perfeito: "bebi café esta manhã", "escrevi um poema há dez anos". O que importa é o acabamento, não a distância.',
    }),
    encontreOErro({
      frase: "Ele correr todos os dias na praça quando jovem.",
      // Ele(0) correr(1) todos(2) os(3) dias(4) na(5) praça(6) quando(7) jovem(8)
      erroIndex: 1,
      explicacao:
        'A forma "correr" está no infinitivo, mas o contexto ("quando jovem") pede imperfeito. Deveria ser "corria". Aqui há confusão de modo e tempo: o infinitivo não cabe nessa estrutura.',
    }),
    parear({
      instrucao: "Combine cada frase ao tempo verbal correto",
      pares: [
        { a: "Escrevo uma carta todo o dia.", b: "Presente do indicativo" },
        { a: "Escrevi uma carta ontem.", b: "Pretérito perfeito" },
        { a: "Escrevia uma carta quando você chegou.", b: "Pretérito imperfeito" },
      ],
      explicacao:
        "O presente fala do agora e do habitual atual. O perfeito marca o fim de uma ação. O imperfeito mostra uma ação que durava quando outra aconteceu. Cada um tem seu papel e sua perspectiva do tempo.",
    }),
    ordenar({
      blocos: [
        "Quando criança,",
        "eu brincava no parque",
        "até que um dia",
        "fui acidentado e não pude mais voltar.",
      ],
      explicacao:
        'A sequência monta um contraste: imperfeito ("brincava") para o hábito antigo, perfeito ("fui") para o evento que mudou tudo. Tempos diferentes constroem a história.',
    }),
    interpretacao({
      texto:
        "No dia em que passei no ENEM, recebi a notícia enquanto estudava na biblioteca. Minhas mãos tremiam quando abri o e-mail. Aquele era o resultado de dois anos de preparação. Estudava diariamente, assistia a aulas, resolvia provas. Tudo aquilo ganhou sentido naquele instante.",
      pergunta: 'Por que o texto usa "estudava" (imperfeito) e não "estudei" (perfeito)?',
      opcoes: [
        'Porque "estudava" mostra uma ação repetida e durável no passado',
        "Porque o imperfeito é mais educado que o perfeito",
        'Porque "estudava" é mais recente no passado',
      ],
      correta: 0,
      explicacao:
        'O imperfeito "estudava" pinta um quadro do passado: aquilo era hábito, durava, se repetia. O perfeito "recebi" marca o ponto específico em que tudo mudou. Um contrasta com o outro pra criar a tensão da narrativa.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "quando cheguei, ele dormia", o verbo "dormia" está no pretérito imperfeito porque mostra uma ação que durava quando a outra começou.',
      verdadeiro: true,
      explicacao:
        'Exatamente. "Dormia" era o pano de fundo; "cheguei" é o evento que interrompe. O imperfeito está lá justamente pra marcar essa duração e essa sobreposição de tempos.',
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa tem o uso ERRADO de pretérito?",
      opcoes: [
        "Ontem assisti um filme e adorei cada minuto.",
        "No ano passado, quando morava em São Paulo, comia muita pizza.",
        "Fiz a tarefa enquanto brinco com meu gato na sala.",
      ],
      correta: 2,
      explicacao:
        'Em "fiz a tarefa enquanto brinco", o verbo "brinco" está no presente, mas a frase inteira narra o passado, puxada por "fiz". Pra manter a mesma linha do tempo, o certo é "brincava" (imperfeito). Trocar de tempo no meio da frase sem motivo quebra a coerência.',
    }),
  ],
});

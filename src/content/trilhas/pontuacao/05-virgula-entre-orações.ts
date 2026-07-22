import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 05: Vírgula entre orações
 */
export const virgulaEntreOrações = defineLesson({
  id: "pontuacao-05-entre-orações",
  titulo: "Vírgula entre orações",
  descricao: "A vírgula que une duas ideias de peso parecido na mesma frase.",
  exercicios: [
    verdadeiroFalso({
      afirmacao: "Duas orações coordenadas independentes podem ser separadas por vírgula.",
      verdadeiro: true,
      explicacao:
        'Podem e devem, quando faltam conectivos. Exemplo: "Ela estudou, passou na prova, comemorou com os amigos." São três ideias da mesma importância, ligadas por vírgulas.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase está corretamente pontuada?",
      opcoes: [
        "Ele entrou na sala, sentou e esperou pelo chamado.",
        "Ele entrou na sala sentou e esperou pelo chamado.",
        "Ele entrou na sala e sentou, esperou pelo chamado.",
      ],
      correta: 0,
      explicacao:
        'As três ações ("entrou", "sentou", "esperou") estão no mesmo nível de importância. A vírgula antes de "e" marca a ligação entre a primeira ação e as próximas.',
    }),
    completeLacuna({
      frase: "O menino corria, brincava___ ria de verdade.",
      opcoes: [",", ".", "nada"],
      correta: 0,
      explicacao:
        'Três ações de igual peso: "corria", "brincava" e "ria". Cada uma se liga à próxima com vírgula: "corria, brincava, ria". Esse ritmo de vírgulas marca a sequência de ações.',
    }),
    encontreOErro({
      frase: "Os alunos chegaram à escola e o professor começou a lição imediatamente.",
      erroIndex: 4,
      explicacao:
        'Essas duas orações têm sujeitos diferentes e significados independentes. Deveria haver vírgula antes de "e": "Os alunos chegaram à escola, e o professor começou..." Quando "e" liga orações com sujeitos diferentes, costuma vir com vírgula.',
    }),
    multiplaEscolha({
      pergunta: "Qual é a diferença entre estas frases?",
      opcoes: [
        "Não há diferença, são iguais",
        '"Ele trabalha e descansa" tem uma continuidade natural; "Ele trabalha, e descansa" separa mais as ideias',
        "A vírgula não faz diferença em português",
      ],
      correta: 1,
      explicacao:
        'Sem vírgula antes de "e", as ações soam conectadas e contínuas. Com vírgula, o "e" marca uma pausa: as ideias ganham peso separado. A vírgula é uma escolha estilística que muda o ritmo.',
    }),
    completeLacuna({
      frase: "Ela sorriu, ele respondeu com um gesto___ os dois se entenderam sem palavras.",
      opcoes: [",", ".", "nada"],
      correta: 0,
      explicacao:
        'Três orações coordenadas, mesma importância, sem conectivo nenhum entre elas: a vírgula é quem faz a ponte. Ela liga "ele respondeu com um gesto" a "os dois se entenderam sem palavras".',
    }),
    encontreOErro({
      frase: "O cão correu atrás da bola o gato fugiu apavorado para o quintal.",
      erroIndex: 5,
      explicacao:
        'Duas orações independentes, cada uma com seu sujeito ("o cão", "o gato"), e nenhum conectivo entre elas. Isso pede vírgula: "...atrás da bola, o gato fugiu..." Sem ela, as duas ideias colidem.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Quando você tem muitas orações coordenadas, a vírgula ajuda o leitor a não se perder no ritmo da frase.",
      verdadeiro: true,
      explicacao:
        'Exato. Uma frase como "Estudei, pratiquei, revisei, entrei na prova, fiz minhas respostas e saí tranquilo" pede vírgulas para marcar cada parada. Sem elas, soa confuso.',
    }),
    interpretacao({
      texto:
        'A vírgula entre orações coordenadas é a respiração da frase. Quando você escreve "Ela dançou toda a noite, cantou suas músicas favoritas, e ainda queria mais", está criando um ritmo que o leitor segue naturalmente. Cada vírgula é uma pausa breve, uma batida no compasso da narrativa. Sem essas vírgulas, "Ela dançou toda a noite e cantou suas músicas favoritas e ainda queria mais" fica monótono, como uma sequência sem graça.',
      pergunta:
        "De acordo com o texto, qual é a função estilística da vírgula entre orações coordenadas?",
      opcoes: [
        "Separar definitivamente as ideias",
        "Criar ritmo e respiração na frase",
        "Indicar obrigatoriedade de pausa",
      ],
      correta: 1,
      explicacao:
        "A vírgula aqui é musical: marca o compasso da ideia, ajuda o leitor a seguir o fluxo de pensamento com naturalidade.",
    }),
  ],
});

import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 08: Dois pontos
 */
export const doisPontos = defineLesson({
  id: "pontuacao-08-dois-pontos",
  titulo: "Dois pontos",
  descricao: "O sinal que abre: introduz listas, explicações e discurso direto.",
  exercicios: [
    verdadeiroFalso({
      afirmacao: "Os dois pontos anunciam algo que vem depois, como uma lista ou uma explicação.",
      verdadeiro: true,
      explicacao:
        'Correto. Dois pontos dizem "atenção, aqui vem a resposta, o detalhe, o exemplo". É um sinal de abertura.',
    }),
    multiplaEscolha({
      pergunta: "Em qual frase os dois pontos estão corretos?",
      opcoes: [
        "As frutas são: maçã, banana, laranja.",
        "As frutas são maçã, banana, laranja.",
        "Ambas estão corretas, dos pontos são opcionais.",
      ],
      correta: 0,
      explicacao:
        "Os dois pontos introduzem a lista de frutas. Eles avançam a ideia e indicam que uma sequência de exemplos vem. A segunda frase está correta também, mas sem o anúncio dos dois pontos.",
    }),
    completeLacuna({
      frase:
        "Para escrever bem, você precisa de três coisas___ ler muito, praticar sempre e pedir feedback.",
      opcoes: [":", ",", "nada"],
      correta: 0,
      explicacao:
        "Os dois pontos introduzem a lista de três coisas necessárias. Eles abrem o espaço para o detalhe importante.",
    }),
    encontreOErro({
      frase: "A receita para o sucesso é uma só disciplina.",
      erroIndex: 7,
      explicacao:
        'Os dois pontos anunciam o detalhe prometido pela frase. Faltou aqui, antes da resposta: "...uma só: disciplina." Sem o sinal, a palavra final chega sem nenhum aviso.',
    }),
    multiplaEscolha({
      pergunta:
        'Qual é o significado dos dois pontos nesta frase: "Ela tinha um sonho: ser escritora publicada"?',
      opcoes: [
        "Iniciar uma lista de sonhos",
        "Introduzir uma explicação ou clarificação do que foi dito antes",
        "Separar duas frases independentes",
      ],
      correta: 1,
      explicacao:
        'Os dois pontos ali abrem a explicação: "qual era o sonho? Era ser escritora publicada." É um esclarecimento, não uma lista.',
    }),
    completeLacuna({
      frase:
        "O método de aprendizado envolvia quatro etapas___ leitura, resumo, prática e avaliação final.",
      opcoes: [":", ";", ","],
      correta: 0,
      explicacao:
        "Os dois pontos anunciam as quatro etapas. Eles abrem a enumeração de forma clara e elegante.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Os dois pontos nunca podem ser usados quando se vai iniciar um discurso direto (fala de personagem).",
      verdadeiro: false,
      explicacao:
        'Mentira. Os dois pontos anunciam a fala que vem a seguir: Ela olhou para ele e disse: "Vamos embora?" As aspas fecham a fala do personagem, e os dois pontos abrem esse diálogo.',
    }),
    interpretacao({
      texto:
        'Os dois pontos funcionam como uma seta apontando para frente. Quando você escreve "A receita de sucesso é simples: trabalhe duro, acredite em si mesmo, nunca desista", os dois pontos indicam que o que segue é a resposta ou o detalhe da frase anterior. Em um texto bem escrito, os dois pontos criam expectativa: o leitor sente que algo importante vem vindo. Em redações escolares, usar dois pontos corretamente marca maturidade na construção de frases.',
      pergunta: "De acordo com o texto, o que os dois pontos indicam ao leitor?",
      opcoes: [
        "Uma pausa para respirar",
        "Que algo importante vem vindo em seguida",
        "Uma separação entre temas diferentes",
      ],
      correta: 1,
      explicacao:
        "Os dois pontos criam uma expectativa de detalhe. O leitor sente que a informação relevante está chegando.",
    }),
  ],
});

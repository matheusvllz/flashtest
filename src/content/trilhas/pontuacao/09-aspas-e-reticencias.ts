import {
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 09: Aspas e reticências
 */
export const aspasEReticencias = defineLesson({
  id: "pontuacao-09-aspas-reticencias",
  titulo: "Aspas e reticências",
  descricao: "Os sinais que citam e pausam: aspas para discurso e reticências para incompletude.",
  exercicios: [
    verdadeiroFalso({
      afirmacao: "As aspas servem apenas para indicar diálogo direto de personagens.",
      verdadeiro: false,
      explicacao:
        'Não só. Aspas marcam também citações de outros autores, termos estrangeiros, apelidos e palavras que você quer destacar de forma especial. "Beleza" entre aspas pode questionar a própria palavra.',
    }),
    multiplaEscolha({
      pergunta: "Em qual frase as aspas estão usadas corretamente?",
      opcoes: [
        'Ele disse que "não queria vir para a festa hoje".',
        'Ele disse: "Não quero vir para a festa hoje."',
        "Ele disse: não queria vir para a festa hoje.",
      ],
      correta: 1,
      explicacao:
        "A segunda é discurso direto bem pontuado: dois pontos anunciam a fala, aspas delimitam a palavra exata do personagem, ponto dentro das aspas fecha. A primeira usa aspas em discurso indireto, o que é menos comum e menos elegante.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Reticências (...) indicam que a ideia não foi completada ou que há algo implícito que o leitor pode imaginar.",
      verdadeiro: true,
      explicacao:
        'Exato. "Eu ia discordar, mas depois pensei..." deixa a frase em suspensão. As reticências dizem ao leitor que há silêncio, dúvida ou emoção não dita.',
    }),
    encontreOErro({
      frase: '"Vou estudar a noite toda" disse o aluno confiante.',
      erroIndex: 4,
      explicacao:
        'Depois da fala entre aspas, quando o narrador retoma para dizer quem falou, entra vírgula: "...a noite toda," disse o aluno. Sem ela, a frase gruda a fala no verbo sem pausa nenhuma.',
    }),
    multiplaEscolha({
      pergunta: 'O que as reticências indicam nesta frase: "Eu queria ir, mas..."?',
      opcoes: [
        "Que a frase continua normalmente",
        "Que há algo não dito, uma hesitação ou emoção contida",
        "Que há erro de pontuação",
      ],
      correta: 1,
      explicacao:
        'As reticências criam suspensão. O leitor percebe que o personagem tem algo mais a dizer, mas escolhe o silêncio. É muito mais elegante que "mas não vou falar sobre isso".',
    }),
    verdadeiroFalso({
      afirmacao: "Você pode usar reticências múltiplas (.....) para dar mais ênfase à pausa.",
      verdadeiro: false,
      explicacao:
        "Não. São sempre três pontos, nem mais, nem menos. Mais que três é sinal de preguiça ou falta de conhecimento. Dois pontos não são reticências, são dois pontos. Exatamente três.",
    }),
    encontreOErro({
      frase:
        'O professor citou Machado de Assis "A vida é um espetáculo" e explicou a beleza da frase.',
      erroIndex: 5,
      explicacao:
        "Antes de uma citação direta, os dois pontos avisam que a fala exata vem a seguir. Faltou aqui: \"Machado de Assis: 'A vida é um espetáculo'...\" Sem o sinal, a citação atropela o nome do autor.",
    }),
    interpretacao({
      texto:
        'Aspas e reticências são ferramentas de nuance. Quando um personagem diz "Tudo bem..." com reticências, a emoção fica implícita: nem tudo está bem, mas ele não dirá mais. Quando você cita um pensador famoso com aspas, honra a autoria e marca que aquelas palavras não são suas. Em uma redação do ENEM, usar bem essas pontuações afasta o texto do clichê e marca sofisticação na comunicação.',
      pergunta: "Segundo o texto, qual é a importância de aspas e reticências em uma redação?",
      opcoes: [
        "São obrigatórias em qualquer texto",
        "Marcam sofisticação e precisão na comunicação, evitando clichês",
        "São apenas decorativas",
      ],
      correta: 1,
      explicacao:
        "Usar bem esses sinais eleva a qualidade do texto. Eles criam nuances e deixam implícito o que merece ser deixado em silêncio.",
    }),
  ],
});

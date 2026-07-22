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
 * Lição demo do motor: valida os 5 tipos de exercício de ponta a ponta.
 * leve, bordões de pontuação, zero emoji, zero travessão.
 */
export const virgulaNoAposto = defineLesson({
  id: "pontuacao-01-virgula-no-aposto",
  titulo: "Vírgula no aposto",
  descricao: "A vírgula que apresenta, explica e detalha.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um aposto?",
      opcoes: [
        "Um termo que explica ou detalha outro termo da frase",
        "O verbo principal da oração",
        "Qualquer palavra que vem depois de vírgula",
      ],
      correta: 0,
      explicacao:
        'Aposto é o comentário que explica um termo, como em "Machado de Assis, autor de Dom Casmurro, é genial". E ele vem sempre abraçado por vírgulas.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa o aposto do jeito certo?",
      opcoes: [
        "Machado de Assis autor de Dom Casmurro, revolucionou a literatura.",
        "Machado de Assis, autor de Dom Casmurro, revolucionou a literatura.",
        "Machado de Assis, autor de Dom Casmurro revolucionou a literatura.",
      ],
      correta: 1,
      explicacao:
        "O aposto pede vírgula antes E depois. Abriu, tem que fechar: são sempre duas, como um parêntese.",
    }),
    completeLacuna({
      frase: "Brasília___ capital do Brasil, foi inaugurada em 1960.",
      opcoes: [",", ";", "nada"],
      correta: 0,
      explicacao:
        'A vírgula abre o aposto "capital do Brasil". A segunda, depois de "Brasil", já estava lá esperando a irmã chegar.',
    }),
    encontreOErro({
      frase: "O ENEM, exige preparo constante dos candidatos.",
      erroIndex: 1,
      explicacao:
        "Essa vírgula separa o sujeito do verbo, e isso é proibido. Vírgula sozinha entre sujeito e verbo é dor no meu coração.",
    }),
    ordenar({
      blocos: ["O ENEM,", "porta de entrada da universidade,", "exige", "treino diário."],
      explicacao:
        'O aposto "porta de entrada da universidade" vem logo depois do termo que ele explica, sempre entre vírgulas.',
    }),
    completeLacuna({
      frase: "Clarice Lispector, escritora ucraniano-brasileira___ é um ícone da nossa literatura.",
      opcoes: [",", ".", "nada"],
      correta: 0,
      explicacao:
        "Abriu o aposto com vírgula, fecha com vírgula. Quem abre e não fecha me deixa de cabelo em pé.",
    }),
    encontreOErro({
      frase: "Estudei gramática, redação, e matemática para a prova.",
      erroIndex: 2,
      explicacao:
        'Numa lista simples, o "e" já liga o último item sozinho: a vírgula antes dele sobra. Menos é mais.',
    }),
    verdadeiroFalso({
      afirmacao: "O aposto pode aparecer com uma vírgula só, desde que a frase seja curta.",
      verdadeiro: false,
      explicacao:
        "Tamanho de frase não muda a regra: aposto no meio da frase pede o par completo de vírgulas, uma antes e uma depois. Sempre.",
    }),
    parear({
      instrucao: "Combine cada frase com o que ela contém",
      pares: [
        { a: "Ana, minha vizinha, viajou.", b: "Aposto entre vírgulas" },
        { a: "Ana viajou ontem.", b: "Frase sem aposto" },
        { a: "Ana, venha aqui!", b: "Vocativo (chamamento)" },
      ],
      explicacao:
        'Aposto explica ("minha vizinha"), vocativo chama ("Ana, venha!"). Os dois usam vírgula, mas com papéis diferentes na frase.',
    }),
    interpretacao({
      texto:
        'A pontuação organiza o pensamento no papel. Um aposto mal isolado muda o sentido: em "Meu irmão, que mora em Recife, chegou", as vírgulas indicam que o falante tem um único irmão e acrescentam onde ele mora. Sem as vírgulas, a frase passa a sugerir que ele tem vários irmãos e fala apenas daquele que mora em Recife.',
      pergunta:
        'Segundo o texto, o que as vírgulas indicam em "Meu irmão, que mora em Recife, chegou"?',
      opcoes: [
        "Que o falante tem um único irmão",
        "Que o falante tem vários irmãos",
        "Apenas uma pausa para respirar",
      ],
      correta: 0,
      explicacao:
        "Entre vírgulas, a informação é um extra sobre o único irmão. Sem elas, restringe: seria um entre vários. Pontuação é sentido, não pausa pra respirar.",
    }),
  ],
});

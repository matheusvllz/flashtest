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
 * Lição 01: Regência Verbal
 * Foco: assistir, aspirar, visar, preferir
 */
export const regenciaVerbal = defineLesson({
  id: "regencia-colocacao-01-regencia-verbal",
  titulo: "Regência verbal: assistir, aspirar, visar, preferir",
  descricao: "Qual preposição o verbo pede? A regência corrige o caminho.",
  exercicios: [
    verdadeiroFalso({
      afirmacao: 'O verbo "assistir" sempre pede a preposição "a": "assistir a uma aula".',
      verdadeiro: false,
      explicacao:
        'Quando significa "ver" ou "presenciar", assistir exige "a". Mas quando quer dizer "ajudar", dispensa preposição: "assistir uma pessoa". Regência é escolha de preposição, e o verbo manda, não uma regra fixa pra sempre.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase está gramaticalmente correta?",
      opcoes: [
        "Todos aspiram de uma vida melhor.",
        "Todos aspiram a uma vida melhor.",
        "Todos aspiram para uma vida melhor.",
      ],
      correta: 1,
      explicacao:
        'Aspirar (desejar, almejar) reclama a preposição "a", não "de" nem "para". Regência verbal não é achismo: é lei da língua.',
    }),
    encontreOErro({
      // "O" (0) "juiz" (1) "visava" (2) "de" (3) "punir" (4) "o" (5) "culpado." (6)
      frase: "O juiz visava de punir o culpado.",
      erroIndex: 3,
      explicacao:
        'Visar (ter como objetivo, almejar) pede "a", não "de". "O juiz visava a punir..." é o correto. Cada verbo carrega seu mapa de caminhos.',
    }),
    completeLacuna({
      frase: "Ela preferiu ficar em casa ___ sair à noite.",
      opcoes: ["a", "de", "em"],
      correta: 0,
      explicacao:
        'Preferir reclama "a": "prefiro ficar em casa a sair à noite". Não é "preferir de" nem "preferir em", é regência verbal bem marcada, com "a" ligando as duas opções comparadas.',
    }),
    parear({
      instrucao: "Combine cada verbo com a preposição que ele exige",
      pares: [
        { a: "assistir a uma aula", b: "Presenciar, ver" },
        { a: "assistir uma pessoa", b: "Ajudar, socorrer" },
        { a: "aspirar a um cargo", b: "Almejar, desejar" },
        { a: "visar a um objetivo", b: "Ter por meta" },
      ],
      explicacao:
        'Assistir tem duas faces: com "a", é presença; sem preposição, é ajuda. Aspirar e visar sempre exigem "a". Regência é identidade do verbo.',
    }),
    multiplaEscolha({
      pergunta: 'Em qual alternativa o verbo "assistir" está empregado incorretamente?',
      opcoes: [
        "Assistimos ao jogo do Brasil ontem.",
        "O médico assistiu ao paciente com atenção.",
        "Todos assistiram a missa de domingo.",
      ],
      correta: 1,
      explicacao:
        'Na alternativa B, "assistir" (ajudar) dispensa preposição: o correto é "assistiu o paciente", sem "a". Na A e C, "assistir" (presenciar) leva "a" normalmente.',
    }),
    verdadeiroFalso({
      afirmacao:
        'A frase "Ele aspirava em ser engenheiro" respeita a regência verbal do português.',
      verdadeiro: false,
      explicacao:
        'Aspirar é regência em "a", não "em". O correto é "aspirava a ser engenheiro". Regência errada é amadorismo que custa ponto em prova.',
    }),
    encontreOErro({
      // "Eu" (0) "prefiro" (1) "chocolate" (2) "ao" (3) "invés" (4) "de" (5) "doce." (6)
      frase: "Eu prefiro chocolate ao invés de doce.",
      erroIndex: 4,
      explicacao:
        'Preferir já compara sozinho, com a preposição "a": "prefiro chocolate a doce". "Ao invés de" é redundante aqui, ele marca substituição, não comparação de preferência. Corte o excesso.',
    }),
    interpretacao({
      texto:
        'A regência verbal é como um endereço: cada verbo sabe o caminho certo para chegar ao seu complemento. "Assistir a", "aspirar a", "visar a" e "preferir de" não são caprichos da gramática, mas escolhas históricas que a língua cristalizou. Desrespeitá-las é como mandar uma carta com CEP errado: chega errado ou não chega.',
      pergunta: "De acordo com o texto, a regência verbal é melhor entendida como:",
      opcoes: [
        "Uma lista de regras arbitrárias e sem motivo lógico.",
        "Um sistema de direções históricas que cada verbo segue.",
        "Uma escolha livre do falante, sem consequências para a clareza.",
      ],
      correta: 1,
      explicacao:
        "O texto compara regência a um mapa de endereços: cada verbo tem seu caminho. A escolha não é livre ou caprichosa, é histórica e fixa.",
    }),
  ],
});

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
 * Lição 04: Próclise (Palavras Atrativas)
 * Foco: pronomes atraídos ANTES do verbo (me chama, te vejo, o mundo nos abraça)
 */
export const proclise = defineLesson({
  id: "regencia-colocacao-04-proclise",
  titulo: "Próclise: o pronome que vem ANTES do verbo",
  descricao: "Palavras atrativas puxam o pronome para frente. Entenda o magnetismo.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que provoca próclise (pronome antes do verbo)?",
      opcoes: [
        "Palavras negativas, interrogativas, relativas e advérbios no início da oração.",
        "Qualquer verbo conjugado no presente do indicativo.",
        "A ordem das palavras sempre, sem exceção.",
      ],
      correta: 0,
      explicacao:
        'Próclise é magnetismo: "não me chame", "quando te vejo", "o menino que nos abraça": palavras negativas, interrogativas e advérbios atraem o pronome para antes do verbo. É como um ímã.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "Nunca me enganei", o pronome está correto porque "nunca" atrai.',
      verdadeiro: true,
      explicacao:
        'Exato. "Nunca me enganei" usa próclise porque "nunca" (palavra negativa) magnetiza o pronome pra frente. A regra funciona.',
    }),
    encontreOErro({
      // "O" (0) "menino" (1) "que" (2) "deixou" (3) "me" (4) "cair" (5) "da" (6)
      // "bicicleta" (7) "nem" (8) "pediu" (9) "desculpas." (10)
      frase: "O menino que deixou me cair da bicicleta nem pediu desculpas.",
      erroIndex: 4,
      explicacao:
        'Com a palavra relativa "que", próclise é obrigatória. O correto é "que me deixou cair", não "que deixou me cair". A atração atua desde a primeira sílaba.',
    }),
    completeLacuna({
      frase: "Quando ___ chamou, você estava dormindo profundamente.",
      opcoes: ["te", "t-", "e te"],
      correta: 0,
      explicacao:
        'Com palavra interrogativa ou relativa ("quando"), o pronome vem ANTES do verbo. "Quando te chamou" é próclise, é o certo. O ímã puxa.',
    }),
    parear({
      instrucao: "Combine cada situação com a colocação pronominal correta",
      pares: [
        { a: "Não me deixe sozinho.", b: "Negação atrai próclise" },
        { a: "Quando te vejo, sorrio.", b: "Advérbio relativo atrai próclise" },
        { a: "O carro que nos levou...", b: "Pronome relativo atrai próclise" },
        { a: "Se me perguntasse, eu dizia.", b: "Conjunção condicional atrai próclise" },
      ],
      explicacao:
        "Próclise é a orquestra: quando uma palavra atrativa entra em cena, o pronome segue ela. Magnetismo sintático puro.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa corretamente a próclise?",
      opcoes: [
        "Ninguém deixou passar-me sem documentos.",
        "Ninguém me deixou passar sem documentos.",
        "Ninguém deixou-me passar sem documentos.",
      ],
      correta: 1,
      explicacao:
        'Ninguém é palavra negativa, próclise obrigatória: "ninguém me deixou". Ênclise e mesóclise saem do jogo quando há palavra atrativa.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Se me encontrasse no caminho, eu falaria com ele", o pronome está em próclise porque "se" atrai.',
      verdadeiro: true,
      explicacao:
        'Verdade. "Se" (conjunção condicional) magnetiza o pronome pra frente. "Se me encontrasse" é próclise, é o padrão correto.',
    }),
    encontreOErro({
      // "Talvez" (0) "visse-o" (1) "em" (2) "São" (3) "Paulo" (4) "amanhã." (5)
      frase: "Talvez visse-o em São Paulo amanhã.",
      erroIndex: 1,
      explicacao:
        'Advérbios como "talvez" atraem o pronome pra próclise quando vêm logo antes do verbo. O certo é "talvez o visse", não "talvez visse-o". A dúvida no ar não tira a força do ímã.',
    }),
    interpretacao({
      texto:
        "A próclise é o triunfo da precisão: quando uma palavra magnética aparece, o pronome não escolhe, apenas obedece. Negação, interrogação, relatividade: cada uma delas puxa o pronome pra frente com autoridade sintática. Ignorar isso é ignorar o ritmo da língua portuguesa. Uma próclise errada soa como amador em banca de prova.",
      pergunta: "O texto afirma que próclise é um triunfo da precisão porque:",
      opcoes: [
        "O pronome nunca segue nenhuma regra clara.",
        "Palavras magnéticas determinam a colocação pronominal com autoridade sintática.",
        "A próclise é sempre opcional e depende do gosto de quem escreve.",
      ],
      correta: 1,
      explicacao:
        'O texto diz que próclise obedece a "autoridade sintática": palavras magnéticas DETERMINAM o padrão, não sugerem. Isso é precisão.',
    }),
  ],
});

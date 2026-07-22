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
 * Lição 02: Regência Nominal
 * Foco: nomes e adjetivos que pedem preposição (análogo, ávido, obediente, etc.)
 */
export const regenciaNominal = defineLesson({
  id: "regencia-colocacao-02-regencia-nominal",
  titulo: "Regência nominal: adjetivos e nomes que pedem preposição",
  descricao: "Adjetivos e nomes também têm seus caminhos de preposição.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual frase usa a regência nominal corretamente?",
      opcoes: [
        "Ele é ávido de conhecimento.",
        "Ele é ávido em conhecimento.",
        "Ele é ávido por conhecimento.",
      ],
      correta: 0,
      explicacao:
        'Ávido reclama "de": ávido de livros, ávido de experiência. Não é capricho, é regência, e ela é tão exigente nos nomes quanto nos verbos.',
    }),
    verdadeiroFalso({
      afirmacao:
        'A frase "O carro estava análogo com o modelo anterior" respeita a regência nominal.',
      verdadeiro: false,
      explicacao:
        'Análogo exige "a", não "com". O correto é "análogo ao modelo anterior". Preposição errada em adjetivo machuca de igual forma que em verbo.',
    }),
    encontreOErro({
      // "Ela" (0) "está" (1) "obediente" (2) "em" (3) "seu" (4) "marido." (5)
      frase: "Ela está obediente em seu marido.",
      erroIndex: 3,
      explicacao:
        'Obediente pede "a", não "em". "Obediente a seu marido" é o caminho. Regência nominal organiza o sentido, como faz a regência verbal.',
    }),
    completeLacuna({
      frase: "Todos concordam que o projeto é necessário ___ comunidade.",
      opcoes: ["a", "de", "para"],
      correta: 2,
      explicacao:
        'Necessário pede "para": necessário para a comunidade, necessário para o trabalho. É a preposição que marca destino, utilidade.',
    }),
    parear({
      instrucao: "Combine cada adjetivo com a preposição que ele exige",
      pares: [
        { a: "ávido de conhecimento", b: "Que deseja intensamente" },
        { a: "análogo a um modelo", b: "Que se parece, que é semelhante" },
        { a: "necessário para a obra", b: "Que é essencial, indispensável" },
        { a: "capaz de resolver", b: "Que tem competência para fazer" },
      ],
      explicacao:
        "Nomes e adjetivos também seguem rotas de preposição bem definidas. Conhecê-las é conhecer a língua pelo seu esqueleto.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase está gramaticalmente correta quanto à regência nominal?",
      opcoes: [
        "A atitude dela era favorável de sua participação.",
        "A atitude dela era favorável a sua participação.",
        "A atitude dela era favorável em sua participação.",
      ],
      correta: 1,
      explicacao:
        'Favorável exige "a": favorável ao projeto, favorável à ideia. A preposição "a" marca concordância com o alvo.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em português, o adjetivo "oposto" reclama a preposição "a".',
      verdadeiro: true,
      explicacao:
        'Oposto a, contrário a: a língua prefere "a" para marcar o antagonismo. Diga "oposto ao" normalmente, não "oposto de".',
    }),
    encontreOErro({
      // "Seu" (0) "comportamento" (1) "é" (2) "indiferente" (3) "em" (4) "os" (5) "outros." (6)
      frase: "Seu comportamento é indiferente em os outros.",
      erroIndex: 4,
      explicacao:
        'Indiferente pede "a", não "em". E "em os" já é errado de cara: é "a os" ou "aos" quando necessário. "Indiferente aos outros" é o certo.',
    }),
    interpretacao({
      texto:
        'A regência nominal funciona como uma assinatura: cada adjetivo ou nome carrega consigo suas preposições características, como um documento de identidade gramatical. "Ávido de", "análogo a", "necessário para" não são alternativas: são definições. Variar sem conhecer é amadorismo.',
      pergunta: "O texto compara a regência nominal a uma assinatura. O que isso significa?",
      opcoes: [
        "Que a regência é opcional e depende do gosto de quem escreve.",
        "Que cada adjetivo leva consigo suas preposições características, como marca pessoal.",
        "Que a regência nominal existe apenas em nomes, nunca em adjetivos.",
      ],
      correta: 1,
      explicacao:
        'A metáfora de "assinatura" marca a fixidez: assim como sua assinatura é sua, "ávido de" é a assinatura do adjetivo "ávido".',
    }),
  ],
});

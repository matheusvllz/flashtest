import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

export const estruturaVerbal = defineLesson({
  id: "verbo-01-estrutura-verbal",
  titulo: "Estrutura verbal: radical, vogal temática e desinências",
  descricao: "Os tijolos do verbo: como se monta uma forma verbal.",
  exercicios: [
    multiplaEscolha({
      pergunta: 'Qual é o radical do verbo "cantar"?',
      opcoes: ["cant", "can", "cantar"],
      correta: 0,
      explicacao:
        'O radical é a raiz do verbo, a parte que carrega o significado. Em "cantar", é "cant". Tiro o "ar" de fora e o "cant" fica intacto pra montar qualquer forma.',
    }),
    multiplaEscolha({
      pergunta: "O que faz em um verbo a vogal temática?",
      opcoes: [
        "Dá ao verbo sua conjugação: 1ª, 2ª ou 3ª",
        "Separa o sujeito do verbo",
        "Marca o tempo da ação",
      ],
      correta: 0,
      explicacao:
        'A vogal temática (a, e, i) conecta o radical ao restante e define se o verbo é de 1ª, 2ª ou 3ª conjugação. "Cant-a-r" tem vogal "a", então é 1ª conjugação, e isso é estrutura, não tempo.',
    }),
    completeLacuna({
      frase: 'Na forma "comerei", o radical é "com", a vogal temática é "e", e a desinência é ___.',
      opcoes: ["ria", "rei", "rá"],
      correta: 1,
      explicacao:
        'A desinência marca modo, tempo e pessoa. Em "com-e-rei", "rei" é a desinência de futuro do indicativo, 1ª pessoa do singular. Ela vem sempre no fim.',
    }),
    verdadeiroFalso({
      afirmacao: "Todos os verbos em português têm vogal temática clara na forma infinitiva.",
      verdadeiro: true,
      explicacao:
        'Sim, sempre. "Falar" (1ª, vogal "a"), "comer" (2ª, vogal "e"), "partir" (3ª, vogal "i"). A vogal temática é o divisor das três conjugações e nunca sumiu.',
    }),
    encontreOErro({
      frase: "O verbo pôr tem radical pô e vogal temática o.",
      // O(0) verbo(1) pôr(2) tem(3) radical(4) pô(5) e(6) vogal(7) temática(8) o.(9)
      erroIndex: 5,
      explicacao:
        'O verbo "pôr" é irregular: o radical é "p" e não "pô". A vogal temática é "o", mas o radical é só "p", bem curtinho. Essa é uma daquelas armadilhas do português.',
    }),
    parear({
      instrucao: "Combine cada verbo ao radical e vogal temática corretos",
      pares: [
        { a: "falar", b: 'radical "fal", vogal "a"' },
        { a: "vender", b: 'radical "vend", vogal "e"' },
        { a: "partir", b: 'radical "part", vogal "i"' },
      ],
      explicacao:
        "As três conjugações se diferenciam só pela vogal temática. Tudo começa ali: ela define como a forma verbal se comporta em cada tempo.",
    }),
    interpretacao({
      texto:
        'A estrutura do verbo português é simples: radical + vogal temática + desinência. O radical carrega o sentido ("cantar", "comer", "partir" todos fazem coisas diferentes). A vogal temática organiza a conjugação. A desinência marca pessoa, número, modo e tempo. Quando estudamos um verbo, primeiro vemos sua conjugação (1ª, 2ª ou 3ª) pela vogal temática; depois, entendemos como suas formas se constroem.',
      pergunta: "Segundo o texto, qual é a função da desinência do verbo?",
      opcoes: [
        "Marcar pessoa, número, modo e tempo",
        "Definir a conjugação (1ª, 2ª ou 3ª)",
        "Carregar o significado da ação",
      ],
      correta: 0,
      explicacao:
        "A desinência é a reta final do verbo, aquela que muda conforme quem faz e quando faz. Ela é o comunicador de tudo que importa pra direção da frase.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "falasse", o radical é "fal" e a desinência marca subjuntivo, pretérito imperfeito.',
      verdadeiro: true,
      explicacao:
        'Correto. "Fal" (radical) + "á" (vogal temática) + "sse" (desinência = modo subjuntivo + tempo pretérito imperfeito + pessoa). A desinência empilha muita informação naquele fim ali.',
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa traz a análise ERRADA de estrutura verbal?",
      opcoes: [
        'Em "comíamos": radical "com", vogal "e", desinência "íamos"',
        'Em "partiu": radical "part", vogal "i", desinência "u"',
        'Em "falávamos": radical "fal", vogal "a", desinência "vamos"',
      ],
      correta: 0,
      explicacao:
        'A primeira embaralha os pedaços: a vogal temática "e" se funde com a marca de imperfeito e vira "í", então o certo é radical "com" + vogal "í" + desinência "amos". Só juntando "com" + "e" + "íamos" a palavra nem se forma direito, dá "comeíamos", que não existe.',
    }),
  ],
});

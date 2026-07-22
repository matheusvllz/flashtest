import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

export const verbosIrregulares = defineLesson({
  id: "verbo-08-verbos-irregulares",
  titulo: "Verbos irregulares que caem no ENEM: ver, vir, pôr, caber",
  descricao: "Os verbos que fogem à regra e amam aparecer em prova.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a característica principal de um verbo irregular?",
      opcoes: [
        "Aquele que muda o radical ou a desinência de forma imprevisível",
        "Aquele que muda apenas a vogal temática",
        "Aquele que nunca aparece em provas de português",
      ],
      correta: 0,
      explicacao:
        'Um verbo irregular não segue a receita de bolo. "Ver" vira "vejo" (não "veio"), "vir" vira "venho" (não "vino"). Eles têm surpresas escondidas no radical ou na desinência. E sim, adoram aparecer no ENEM.',
    }),
    multiplaEscolha({
      pergunta: 'Complete: "Se eu ___ para a festa, vou me divertir".',
      opcoes: ["vou", "vinha", "vier"],
      correta: 2,
      explicacao:
        'O futuro do subjuntivo de "vir" é "vier", não "vir". Essa é uma armadilha de pronuncia: "vir" é infinitivo, "vier" é futuro do subjuntivo. Em "se eu vier" (condição), o subjuntivo é obrigatório.',
    }),
    completeLacuna({
      frase: "Você ___ seu tempo nisso? Acho que cabe uma distração.",
      opcoes: ["põe", "pões", "poé"],
      correta: 0,
      explicacao:
        'O verbo "pôr" no presente indicativo, 2ª pessoa (você), é "você põe". O acento circunflexo protege o "o" porque senão seria confundido com a preposição "por". Esse acento torna "pôr" verbo de verdade.',
    }),
    verdadeiroFalso({
      afirmacao: 'O verbo "caber" é completamente regular e segue o modelo de "haver".',
      verdadeiro: false,
      explicacao:
        'Não. "Caber" tem irregularidades: eu caibo (não "cabo"), ele coube (não "cabeu"). Parece regular, mas não é. E não segue "haver": "eu caibo", mas "eu hei" soa antigo demais. São primos distantes.',
    }),
    encontreOErro({
      frase: "Ele vio o carro vindo pela rua e pôs-se a correr.",
      // Ele(0) vio(1) o(2) carro(3) vindo(4) pela(5) rua(6) e(7) pôs-se(8) a(9) correr(10)
      erroIndex: 1,
      explicacao:
        '"Vio" não existe. O pretérito perfeito de "ver" na 3ª pessoa do singular é "viu". É um erro comum, confundir com "vir", que dá "veio". O certo aqui é "ele viu o carro".',
    }),
    parear({
      instrucao: "Combine cada forma verbal irregular ao verbo e tempo corretos",
      pares: [
        { a: "vi", b: 'Pretérito perfeito de "ver"' },
        { a: "venho", b: 'Presente indicativo de "vir"' },
        { a: "ponho", b: 'Presente indicativo de "pôr"' },
        { a: "caibo", b: 'Presente indicativo de "caber"' },
      ],
      explicacao:
        'Estas são as formas mais comuns e armadilhosas dos quatro irregulares. "Ponho" é especial porque o "n" aparece no presente (você ponha, ele ponha), mas desaparece no futuro (porei). Memoriza-se por contato, não por lógica.',
    }),
    interpretacao({
      texto:
        'Os verbos irregulares são os bastidores da língua portuguesa. Eles trazem história: "pôr" vem do latim "ponere", e por isso segue um padrão próprio. "Ver" vem de "videre", outro percurso. Não é negligência da gramática: é arqueologia. Quando você estuda um irregular, você lê as camadas de tempos antigos embutidas na forma moderna. "Vir" virou "venho" porque o latim "venire" tem sua própria música. Aprender irregulares é respeitar a genealogia das palavras.',
      pergunta: 'O que o texto sugere sobre irregularidades verbais ao dizer "é arqueologia"?',
      opcoes: [
        "Que as irregularidades são erros que precisam ser corrigidos",
        "Que as irregularidades refletem a história e origem (latim) das palavras",
        "Que as irregularidades só existem em português antigo",
      ],
      correta: 1,
      explicacao:
        "Exatamente. Os irregulares não são caprichos: são fósseis vivos de línguas ancestrais. Compreender isso não muda a prova, mas muda como você estuda: com respeito, não com raiva.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "ele virá amanhã", o verbo "virá" é futuro do indicativo de "vir", formado regularmente.',
      verdadeiro: true,
      explicacao:
        'Sim. Alguns tempos do "vir" são regulares (futuro "virá", condicional "viria", futuro subjuntivo "vier"). Outras formas são irregulares (presente "venho", pretérito "vim"). O mesmo verbo tem zonas regulares e irregulares.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem uso INCORRETO de verbo irregular?",
      opcoes: [
        "Eu vi o filme que você recomendou.",
        "Ele vem sempre que pode.",
        "Se você caiba naquele carro, saia já.",
      ],
      correta: 2,
      explicacao:
        'Em "se você caiba", o erro está em usar "caiba" (subjuntivo errado). O correto é "se você couber" (futuro do subjuntivo de "caber"). "Caiba" é presente do subjuntivo, não futuro. Aqui há confusão de tempo dentro do modo.',
    }),
    multiplaEscolha({
      pergunta: 'Qual é o infinitivo do verbo em "ele coube no armário"?',
      opcoes: ["couber", "caber", "caibir"],
      correta: 1,
      explicacao:
        'O infinitivo é "caber". "Coube" é pretérito perfeito. "Couber" é futuro do subjuntivo. Sempre que vir uma forma estranha do verbo, pense de trás pra frente: qual é o infinitivo? Que tempo/modo isso marca?',
    }),
  ],
});

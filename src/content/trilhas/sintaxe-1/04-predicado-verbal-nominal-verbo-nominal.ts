import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

/**
 * Lição 04: Predicado (verbal, nominal, verbo-nominal)
 */
export const predicadoVerbalsNominalVerboNominal = defineLesson({
  id: "sintaxe-1-04-predicado-verbal-nominal-verbo-nominal",
  titulo: "Predicado: verbal, nominal, verbo-nominal",
  descricao: "Os três tipos de estrutura predicativa e como reconhecê-los.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é predicado?",
      opcoes: [
        "A informação que se dá sobre o sujeito",
        "O verbo da oração sozinho",
        "Qualquer palavra que vem depois do sujeito",
      ],
      correta: 0,
      explicacao:
        "Predicado é tudo o que se afirma sobre o sujeito. Pode conter ação, estado ou qualidade. É o conjunto estruturado que dá resposta: quem (sujeito) faz ou é quê (predicado).",
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem predicado verbal?",
      opcoes: [
        "O professor é justo e experiente.",
        "O professor exigiu disciplina dos alunos.",
        "O professor ficou furioso com a aula.",
      ],
      correta: 1,
      explicacao:
        'Predicado verbal tem como núcleo um verbo ativo (transitivo ou intransitivo). "Exigiu" é ação pura: o professor faz algo. Os outros dois têm verbo de estado ou mudança de estado.',
    }),
    multiplaEscolha({
      pergunta: "Qual é predicado nominal?",
      opcoes: [
        "A criança corria no parque.",
        "A criança é inteligente e educada.",
        "A criança dormiu cedo.",
      ],
      correta: 1,
      explicacao:
        'Predicado nominal tem verbo de ligação (ser, estar, parecer, ficar, permanecer) como elo. "É inteligente" não descreve ação, mas qualidade: quem é, qual é a natureza. O núcleo é o adjetivo ou nome.',
    }),
    verdadeiroFalso({
      afirmacao: "Um predicado verbo-nominal tem dois núcleos: um verbo e um nome ou adjetivo.",
      verdadeiro: true,
      explicacao:
        'Exato. Verbo-nominal: "Ele comeu a sopa quente" tem dois núcleos, "comeu" (verbal) e "quente" (nome/adjetivo predicando ao mesmo tempo). Dupla fundação.',
    }),
    encontreOErro({
      frase: "As atletas ficaram exausto após a prova.",
      erroIndex: 3,
      explicacao:
        '"Ficaram" é verbo de ligação e "exausto" é predicativo do sujeito: ele precisa concordar em gênero e número com "as atletas". O certo é "exaustas". Predicativo veste a roupa exata do sujeito.',
    }),
    completeLacuna({
      frase:
        'Em "Os alunos ficaram ___ após a prova", o predicado é nominal porque "ficaram" é verbo de ligação.',
      opcoes: ["nervosos", "no corredor", "para casa"],
      correta: 0,
      explicacao:
        'Verbo de ligação (ficar, ser, estar, parecer) liga o sujeito a uma qualidade ou estado. "Ficaram nervosos" é predicado nominal: descreve estado, não ação. "Ficaram no corredor" já seria predicado verbal, indicando lugar.',
    }),
    parear({
      instrucao: "Associe cada frase com seu tipo de predicado",
      pares: [
        { a: "Maria corria na praia.", b: "Predicado verbal" },
        { a: "Maria parecia cansada.", b: "Predicado nominal" },
        { a: "Maria corria cansada pela praia.", b: "Predicado verbo-nominal" },
      ],
      explicacao:
        "Verbal: ação (correr). Nominal: estado com verbo de ligação (parecer + cansada). Verbo-nominal: ação E estado unidos (correr cansada).",
    }),
    interpretacao({
      texto:
        'A escolha entre predicados molda o texto. Um predicado verbal é direto: "O herói lutou bravamente". Um nominal é contemplativo: "O herói era bravo". Um verbo-nominal une o dinâmico e o estático: "O herói lutava bravo". Na redação, variar predicados controla o ritmo. Muita ação cansa o leitor; muita contemplação adormece. O bom redator mescla.',
      pergunta: "Conforme o texto, qual é o efeito de usar apenas predicados verbais numa redação?",
      opcoes: [
        "A leitura fica dinâmica, mas pode cansar",
        "A leitura fica mais bonita e contemplativa",
        "Não há mudança no ritmo da leitura",
      ],
      correta: 0,
      explicacao:
        "O texto deixa claro: ação contínua cansa. Ritmo é mesclagem. Uma redação só de ação não respira; precisa de momentos contemplativos (nominais) para descanso estrutural.",
    }),
  ],
});

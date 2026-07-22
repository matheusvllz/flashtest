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
 * Lição 06: Objeto direto e indireto
 */
export const objetoDiretoIndireto = defineLesson({
  id: "sintaxe-1-06-objeto-direto-indireto",
  titulo: "Objeto direto e indireto",
  descricao: "Como o verbo transitivo recebe seu complemento.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é objeto direto?",
      opcoes: [
        "O complemento que recebe a ação sem preposição",
        "O complemento que recebe a ação com preposição",
        "Qualquer palavra que vem depois do verbo",
      ],
      correta: 0,
      explicacao:
        'Objeto direto é a ação em estado puro, sem mediação. Em "Comi a maçã", maçã recebe "comi" de frente, sem intermediário. Estrutura direta e sólida.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem objeto indireto?",
      opcoes: [
        "O professor ensinou português.",
        "Os alunos obedeceram às regras.",
        "A criança comeu o bolo.",
      ],
      correta: 1,
      explicacao:
        'Objeto indireto tem preposição mediando. Em "Obedeceram às regras", regras recebem a ação através da preposição "a". Há um tubo entre verbo e objeto.',
    }),
    verdadeiroFalso({
      afirmacao: "Objeto direto e indireto nunca podem aparecer na mesma frase.",
      verdadeiro: false,
      explicacao:
        'Falso. Um verbo transitivo direto e indireto (bitonal) carrega os dois. Em "Avisei o erro ao chefe", "erro" é OD e "chefe" é OI. Dupla recepção da ação.',
    }),
    completeLacuna({
      frase: 'Em "Ele informou ao cliente as notícias", o objeto ___ é "as notícias".',
      opcoes: ["direto", "indireto", "complemento nominal"],
      correta: 0,
      explicacao:
        'Notícias não tem preposição antes. Chega direto na ação "informar". "Ao cliente" é o objeto indireto (tem "a"). Dois objetos, dois papéis.',
    }),
    encontreOErro({
      frase: "Os espectadores assistiram o show inteiro emocionados.",
      erroIndex: 3,
      explicacao:
        '"Assistir" no sentido de ver é transitivo indireto: pede a preposição "a". O certo é "assistiram AO show", não "assistiram o show". Regência que até quem fala bem esquece.',
    }),
    parear({
      instrucao: "Combine cada estrutura com seu complemento correto",
      pares: [
        { a: "Ela comeu o bolo.", b: "Objeto direto" },
        { a: "Ele confiou em você.", b: "Objeto indireto" },
        { a: "Contei ao amigo minha história.", b: "Objetos direto e indireto" },
      ],
      explicacao:
        "OD: sem preposição. OI: com preposição. Quando os dois aparecem, a estrutura é bitonal, dupla base que sustenta o verbo.",
    }),
    verdadeiroFalso({
      afirmacao: 'O objeto direto pode ser substituído pelo pronome "o", "a", "os", "as".',
      verdadeiro: true,
      explicacao:
        'Verdadeiro. "Comi a maçã" vira "Comi-a". O pronome ocluso (clítico) entra direto no verbo, marca de objeto direto puro.',
    }),
    interpretacao({
      texto:
        'A clareza de um texto repousa em objetos bem colocados. Quando o objeto é ambíguo, a frase titubeía. "Ele pediu ao amigo o favor" é cristalino: quem pede (sujeito), a quem pede (OI), o quê (OD). Se escreve "Ele pediu para o amigo", soa como pedido direto ao amigo, não uma coisa específica. O domínio da sintaxe objetiva é domínio da prosa.',
      pergunta: "Conforme o texto, por que a colocação correta de objetos importa?",
      opcoes: [
        "Para manter a clareza e evitar ambiguidade",
        "Para soar mais formal e erudito",
        "Para ocupar mais espaço na redação",
      ],
      correta: 0,
      explicacao:
        "Clareza é fundação. Um objeto ambíguo deixa o leitor confuso. A estrutura sintática certa faz o sentido transparent. É alicerce da comunicação eficiente.",
    }),
  ],
});

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
 * Lição 07 da trilha de Concordância: concordância nominal (adjetivo e nomes).
 */
export const concordanciaNominal = defineLesson({
  id: "concordancia-07-concordancia-nominal",
  titulo: "Concordância nominal (adjetivo e nomes)",
  descricao: "Adjetivos, artigos e nomes concordam em gênero e número com o núcleo.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é concordância nominal?",
      opcoes: [
        "O verbo que concorda com o sujeito",
        "Adjetivos, artigos e nomes que concordam em gênero E número com o núcleo do sintagma",
        "A organização das palavras na frase",
      ],
      correta: 1,
      explicacao:
        'Concordância nominal é quando adjetivos e nomes caminham juntos no mesmo gênero e número. "Bonitas casas" (ambas feminino plural), "carro vermelho" (ambos masculino singular). Quando um sai do lugar, dor no meu coração.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "O livro amarelo está na prateleira", adjetivo "amarelo" concorda em gênero e número com "livro".',
      verdadeiro: true,
      explicacao:
        'Sim: "livro" é masculino singular, "amarelo" é masculino singular. A concordância está correta. O adjetivo segue o nome como sombra.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem erro de concordância nominal?",
      opcoes: [
        "As alunas inteligentes participaram da discussão.",
        "Os meninos criativo falaram durante a aula.",
        "A professora dedicada preparou aulas excelentes.",
      ],
      correta: 1,
      explicacao:
        '"Meninos" é masculino plural, mas "criativo" é singular. O adjetivo deveria ser "criativos" (masculino plural). Adjetivo que sai do número do nome me deixa de cabelo em pé.',
    }),
    completeLacuna({
      frase: "As candidatas ___ apresentaram suas propostas com clareza.",
      opcoes: ["melhor", "melhores", "melhor delas"],
      correta: 1,
      explicacao:
        '"Candidatas" é feminino plural, então adjetivo "melhores" também é feminino plural. "Melhor" (singular) não concorda. Tem que casar no número.',
    }),
    encontreOErro({
      frase: "Os alunos e as alunas diligente estudam juntos.",
      erroIndex: 5,
      explicacao:
        'Sujeito composto "alunos e alunas" é plural (masculino + feminino = masculino plural na regra tradicional), mas "diligente" é singular. Deveria ser "diligentes" (plural). Adjetivo que não respeita o número do nome é um problema.',
    }),
    parear({
      instrucao: "Combine cada sintagma com o gênero e número corretos",
      pares: [
        { a: "O carro preto", b: "Masculino singular" },
        { a: "As casas antigas", b: "Feminino plural" },
        { a: "Os sofás macios", b: "Masculino plural" },
      ],
      explicacao:
        "Cada sintagma tem seu gênero e número. Artigo, nome e adjetivo caminham juntos no mesmo ritmo.",
    }),
    ordenar({
      blocos: [
        "Os",
        "alunos",
        "mais",
        "dedicados",
        "sempre",
        "aprovam",
        "em",
        "primeiro",
        "lugar.",
      ],
      explicacao:
        'Concordância nominal: "alunos" (masculino plural) combina com "dedicados" (masculino plural). Artigo "os" também concorda. Tudo caminha junto.',
    }),
    interpretacao({
      texto:
        'A concordância nominal envolve adjetivos, artigos, nomes e pronomes que modificam ou retomam um núcleo. Todos devem concordar em gênero (masculino ou feminino) e número (singular ou plural). Exemplos: "cavalo branco" (ambos masculino singular), "cavalos brancos" (ambos masculino plural), "égua branca" (ambos feminino singular), "éguas brancas" (ambos feminino plural). Quando há dois nomes de gênero diferente, o adjetivo que vem depois concorda no plural masculino por tradição gramatical: "menino e menina bonitos". Um erro comum é deixar o adjetivo no singular quando vem após nome plural: "Os alunos inteligente" está errado; o certo é "Os alunos inteligentes".',
      pergunta:
        "Qual é a regra quando temos dois nomes de gênero diferente modificados por um adjetivo?",
      opcoes: [
        "O adjetivo concorda com o mais próximo",
        "O adjetivo vai para plural masculino (regra tradicional)",
        "O adjetivo fica no singular",
      ],
      correta: 1,
      explicacao:
        'O texto ensina a regra tradicional: dois nomes de gênero diferente = adjetivo plural masculino. "Menino e menina bonitos", não "bonita".',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "As jovens estudantes estão preparadas para o desafio", a concordância nominal está correta em todos os adjetivos.',
      verdadeiro: true,
      explicacao:
        'Sim: "jovens" é feminino plural (nome plural), "estudantes" é feminino plural, "preparadas" é feminino plural. Tudo em harmonia perfeita.',
    }),
  ],
});

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
 * Lição 08: Funções do pronome relativo
 */
export const pronomeRelativo = defineLesson({
  id: "sintaxe-2-08-pronome-relativo",
  titulo: "Funções do pronome relativo",
  descricao: 'O "que" e "qual" em seus múltiplos papéis sintáticos dentro da oração.',
  exercicios: [
    multiplaEscolha({
      pergunta:
        'Em "A pessoa que conheci ontem é professora", qual é a função do "que" na oração subordinada?',
      opcoes: ["Sujeito", "Objeto direto", "Predicativo"],
      correta: 1,
      explicacao:
        'Pronome relativo "que" retoma "pessoa" e exerce função de objeto direto em "conheci". "Conheci" pede complemento: conheci quem? A pessoa. O "que" recebe a ação, é paciente.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "O lugar onde nasci é especial", "onde" é um pronome relativo adverbial.',
      verdadeiro: true,
      explicacao:
        'Adverbial porque exerce função de advérbio (lugar) na subordinada. "Nasci" + onde (adjunto adverbial de lugar). Relativo porque retoma "lugar".',
    }),
    parear({
      pares: [
        { a: "O aluno que estudou passou.", b: "Sujeito" },
        { a: "O livro que li foi excelente.", b: "Objeto direto" },
        { a: "A regra de que falei é importante.", b: "Objeto indireto" },
        { a: "A paisagem cuja beleza impressiona é de tirar o fôlego.", b: "Adjunto adnominal" },
      ],
      explicacao:
        "Sujeito realiza a ação do verbo. Objeto direto recebe a ação sem preposição. Objeto indireto completa o verbo com a preposição exigida por ele (falar DE algo). Adjunto adnominal modifica nome (possessivo, qualidade). Cada função estrutura a oração diferente.",
    }),
    encontreOErro({
      frase: "O projeto que trabalho é inovador.",
      erroIndex: 3,
      explicacao:
        'O verbo "trabalho" (de trabalhar) pede a preposição "em" antes do relativo: "no qual trabalho" ou "em que trabalho". Sem ela, falta a regência do verbo "trabalho" aqui.',
    }),
    completeLacuna({
      frase: "A professora ___ ensinava era rigorosa mas amada pelos alunos.",
      opcoes: ["que", "qual", "o qual"],
      correta: 0,
      explicacao:
        'Pronome relativo simples "que" exerce função de sujeito (ela ensinava). "Qual" é mais formal e raro com essa função; "que" é econômico e claro aqui.',
    }),
    multiplaEscolha({
      pergunta: 'Em "A razão pela qual desisti é pessoal", qual é a função de "qual"?',
      opcoes: ["Objeto direto", 'Complemento nominal (exigido por "razão")', "Adjunto adverbial"],
      correta: 1,
      explicacao:
        'Nome "razão" exige complemento introduzido por preposição "de". "Pela qual" = "por que" (= por qual razão). O pronome relativo completa o nome "razão".',
    }),
    ordenar({
      blocos: [
        "O texto cuja autoria é questionada",
        "foi publicado há séculos.",
        "Sua origem permanece mistério.",
        "E fascina pesquisadores.",
      ],
      explicacao:
        '"Cuja" é adjunto adnominal: marca posse/pertença. "Autoria" pertence ao texto. Relativo possessivo estrutura a propriedade do termo antecedente.',
    }),
    interpretacao({
      texto:
        'Pronome relativo é o tijolo de ouro da construção de períodos sofisticados. Quando bem empregado, cada função (sujeito, objeto, adjunto) cria um movimento sintático diferente: "O professor que ensina" (sujeito, ação vem do professor) vs "O professor que entendo" (objeto, ação recai sobre o professor). Na redação ENEM, fluidez depende de dominar essas sutilezas. Um período que começa com "Os dados que coletei" marca clareza; "Os dados cuja análise é complexa" marca profundidade.',
      pergunta: "Por que dominar as funções do pronome relativo importa em uma redação?",
      opcoes: [
        "Para evitar repetir palavras",
        "Para criar movimento sintático e fluidez argumentativa",
        "Para usar palavras mais bonitas",
      ],
      correta: 1,
      explicacao:
        "Cada função do relativo gera um ritmo diferente. Sujeito marca agência; objeto marca recipiência; adjunto marca modificação. Escolher bem = construir persuasão.",
    }),
    encontreOErro({
      frase: "A teoria que eu acredito fundamenta meu argumento.",
      erroIndex: 4,
      explicacao:
        'O verbo "acredito" (de acreditar) rege a preposição "em": "acredito EM algo". Sem o "em" antes do relativo, falta a regência: o certo é "a teoria em que acredito" ou "a teoria na qual acredito".',
    }),
    verdadeiroFalso({
      afirmacao: '"Onde" é sempre pronome relativo adverbial quando retoma nome.',
      verdadeiro: true,
      explicacao:
        'Quando "onde" retoma um lugar ("O lugar onde nasci"), é relativo adverbial. Quando é pergunta ("Onde você vai?"), é advérbio interrogativo. Contexto marca a classe.',
    }),
  ],
});

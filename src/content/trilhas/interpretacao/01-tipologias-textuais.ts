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
 * Lição sobre tipologias textuais: as formas de organizar o pensamento.
 */
export const tipologiasTextuais = defineLesson({
  id: "interpretacao-01-tipologias-textuais",
  titulo: "Tipologias textuais",
  descricao: "Narração, descrição, dissertação e injunção: as estruturas do texto.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma tipologia textual?",
      opcoes: [
        "A forma como o texto se estrutura para comunicar uma ideia",
        "Um gênero literário específico",
        "A quantidade de parágrafos em um texto",
      ],
      correta: 0,
      explicacao:
        "Tipologia é a forma, o esqueleto que segura o sentido. Um texto pode ser narrativo, descritivo, dissertativo ou injuntivo. Cada um tem seu alicerce próprio.",
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa traz um exemplo de texto narrativo?",
      opcoes: [
        "A floresta é densa, úmida e repleta de sons à noite.",
        "Pedro acordou cedo, pegou o metrô e chegou atrasado ao trabalho.",
        "A educação é o caminho para transformar uma nação.",
      ],
      correta: 1,
      explicacao:
        "Narração conta uma história: tem personagens, tempo, ação. Pedro acordou, pegou metrô, chegou: é o encadeamento de fatos que estrutura a narrativa.",
    }),
    verdadeiroFalso({
      afirmacao: "Na descrição, o objetivo é contar uma sequência de acontecimentos.",
      verdadeiro: false,
      explicacao:
        "Descrição pinta, não conta. Ela detém o tempo para você enxergar cores, formas, sensações. Narrativa segue em frente; descrição fica naquele momento.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase é claramente descritiva?",
      opcoes: [
        "O autor escreveu um livro sobre a Amazônia.",
        "A Amazônia estende-se por nove países, com rios que cortam a paisagem como veias azuis.",
        "A Amazônia deve ser preservada porque fornece oxigênio ao planeta.",
      ],
      correta: 1,
      explicacao:
        "Descrição constrói imagem: rios como veias azuis, paisagem. Ela faz você VISUALIZAR. Não narra fato, não argumenta razão.",
    }),
    completeLacuna({
      frase: "A dissertação argumenta e prova através de ___, exemplos e dados.",
      opcoes: ["razões", "histórias", "detalhes"],
      correta: 0,
      explicacao:
        "Dissertação tem base sólida: tese, argumentos e provas. A razão é o alicerce; exemplos e dados vêm depois para apoiar.",
    }),
    parear({
      instrucao: "Combine cada trecho com sua tipologia",
      pares: [
        { a: "Marina desceu as escadas, abriu a porta e desapareceu na noite.", b: "Narrativo" },
        { a: "Marina era alta, de cabelo comprido e olhar profundo.", b: "Descritivo" },
        { a: "Marina merecia uma chance porque tinha talento e dedicação.", b: "Dissertativo" },
        { a: "Faça o seguinte: acenda a vela, feche os olhos, respire fundo.", b: "Injuntivo" },
      ],
      explicacao:
        "Cada tipologia tem seu papel. Narração avança a história, descrição congela a imagem, dissertação fundamenta, injunção ordena ação. Base sólida para cada uma.",
    }),
    encontreOErro({
      frase: "O texto dissertativo argumenta uma opinião sem apresentar bases lógicas.",
      erroIndex: 6,
      explicacao:
        'Dissertação SEM base não é estrutura, é achismo. Dissertação sólida traz razões, provas, dados. "Sem apresentar" está invertido do que realmente acontece em um bom texto dissertativo.',
    }),
    verdadeiroFalso({
      afirmacao: "Um texto injuntivo ordena ações usando verbos no imperativo.",
      verdadeiro: true,
      explicacao:
        "Injunção é mandado: abra, feche, faça. O imperativo é a ferramenta que estrutura esse comando. Receita, manual, instrução: todos são tipologia injuntiva.",
    }),
    interpretacao({
      texto:
        "A escritora Maria Rosa sempre acreditou que a estrutura textual era a base de tudo. Em seus workshops, ela separava os alunos em quatro grupos: uns praticavam narração recontando histórias pessoais com sequência clara de fatos; outros faziam descrição detalhada de lugares nunca vistos; outros ainda argumentavam sobre temas sociais usando dados e exemplos; e os últimos recebiam uma receita de bolo para reescrever em forma de instrução. Só depois de entender a forma, ela dizia, o aluno domina o conteúdo.",
      pergunta: "Segundo o texto, qual é a importância de separar os textos por tipologia?",
      opcoes: [
        "Tornar o aprendizado mais fácil para cada tipo de estudante",
        "Fazer os alunos entenderem a forma antes de dominar o conteúdo",
        "Aumentar o número de alunos nos workshops de escrita",
      ],
      correta: 1,
      explicacao:
        "Maria Rosa organiza pelo fundamento: FORMA primeiro. Entender a estrutura de cada tipologia é aprender o alicerce que segura qualquer texto. Depois, o conteúdo flui naturalmente.",
    }),
  ],
});

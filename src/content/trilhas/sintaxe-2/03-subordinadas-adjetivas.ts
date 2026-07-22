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
 * Lição 03: Subordinadas adjetivas (restritiva vs explicativa)
 */
export const subordinadasAdjetivas = defineLesson({
  id: "sintaxe-2-03-subordinadas-adjetivas",
  titulo: "Subordinadas adjetivas: restritiva vs explicativa",
  descricao: "A oração que descreve e modifica um nome, com impacto decisivo no sentido.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a diferença fundamental entre adjetiva restritiva e explicativa?",
      opcoes: [
        "A restritiva restringe o sentido; a explicativa apenas adiciona informação",
        'A explicativa usa "que" e a restritiva usa "qual"',
        "Ambas significam a mesma coisa, apenas com pontuação diferente",
      ],
      correta: 0,
      explicacao:
        'Restritiva reduz o universo: "O aluno que estuda passa" fala de uns apenas. Explicativa adiciona: "O aluno, que é dedicado, passa" fala do aluno em questão. São estruturalmente irmãs, mas semanticamente opostas.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "O filme que assistimos ontem foi ótimo", a adjetiva é restritiva.',
      verdadeiro: true,
      explicacao:
        "Sem vírgulas, a oração restringe: há filmes e filmes; essa fala de um específico. Restritiva é essencial ao sentido, é o alicerce que marca qual deles você quer dizer.",
    }),
    encontreOErro({
      frase: "As pessoas, que têm dinheiro, nem sempre são felizes.",
      erroIndex: 1,
      explicacao:
        'A vírgula depois de "pessoas" transforma a restritiva em explicativa e muda o sentido: passaria a dizer que todas as pessoas têm dinheiro, quando a intenção é falar só das que têm. Restritiva não leva vírgula.',
    }),
    completeLacuna({
      frase: "Os estudantes___ se preparam com seriedade costumam ter bom desempenho.",
      opcoes: [", que", "que", ", os quais,"],
      correta: 1,
      explicacao:
        'Restritiva não leva vírgula: "que se preparam" restringe qual tipo de estudante estamos falando. Se usássemos vírgulas, a frase diria "Os estudantes (todos eles) se preparam com seriedade", o que não é verdade.',
    }),
    parear({
      pares: [
        {
          a: "Meu avô, que viajou pelo mundo, é mais sábio do que qualquer livro.",
          b: "Explicativa (informação extra)",
        },
        {
          a: "O professor que mais influi é aquele que ouve os alunos.",
          b: "Restritiva (define qual professor)",
        },
        {
          a: "Brasília, que foi inaugurada em 1960, é capital do Brasil.",
          b: "Explicativa (aposto sobre Brasília)",
        },
        {
          a: "Problemas que não têm solução precisam ser aceitos.",
          b: "Restritiva (define quais problemas)",
        },
      ],
      explicacao:
        "Explicativa traz vírgula e adiciona dado extra: já sabemos de quem fala. Restritiva não tem vírgula e reduz o universo: há vários, mas falo desse que tem essa qualidade.",
    }),
    multiplaEscolha({
      pergunta: "Escolha a frase cuja adjetiva é claramente explicativa:",
      opcoes: [
        "Os livros que tratam de filosofia ensinam a pensar.",
        "Machado de Assis, que escreveu Dom Casmurro, é genial.",
        "A redação que não tem conclusão não pode passar.",
      ],
      correta: 1,
      explicacao:
        'A oração explicativa adiciona um fato extra sobre alguém já conhecido. "Machado de Assis" já é identificado; saber que escreveu Dom Casmurro é um complemento, não uma restrição.',
    }),
    ordenar({
      blocos: ["O artigo", "que você procura", "está na terceira página", "do jornal."],
      explicacao:
        'Restritiva: não há vírgula. "Que você procura" escolhe qual artigo de todos os possíveis. É o alicerce que torna a frase completa e clara.',
    }),
    interpretacao({
      texto:
        'A escolha entre restritiva e explicativa muda o tom da redação. Se o aluno escreve "O cidadão que cumpre a lei", restringe: fala apenas dos que cumprem. Se escreve "O cidadão, que cumpre a lei" (intenção explicativa, mas graficamente errada), sugeriria que todo cidadão cumpre, o que é falso. Por isso, a pontuação não é detalhe: é a lógica da frase.',
      pergunta: "Qual é o impacto de confundir restritiva e explicativa na redação?",
      opcoes: [
        "Nenhum; elas significam a mesma coisa",
        "Muda o sentido da frase e compromete a argumentação",
        "Apenas torna a linguagem mais bonita ou menos",
      ],
      correta: 1,
      explicacao:
        'Restritiva e explicativa têm papéis diferentes. Confundi-las prejudica o argumento. "Políticas que reduzem desigualdade" (restritiva) fala de umas; "Políticas, que reduzem desigualdade" (explicativa, mas mal construída) pareceria afirmar que toda política reduz.',
    }),
    encontreOErro({
      frase: "Os alunos os quais estudam bastante, passam nas provas.",
      erroIndex: 5,
      explicacao:
        'Adjetiva restritiva não leva vírgula. "Os quais" é adequado (pode ser restritivo ou explicativo), mas aqui a vírgula marca "passam" como se fosse uma consequência esperada de todos, não apenas daqueles que estudam. Remove a vírgula e fica correto.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma adjetiva explicativa pode ser retirada da frase sem alterar o sentido essencial.",
      verdadeiro: true,
      explicacao:
        'Explicativa adiciona, não restringe. "Sua professora, que é rigorosa, corrige bem" = "Sua professora corrige bem". A informação extra é contextual, não essencial à estrutura.',
    }),
  ],
});

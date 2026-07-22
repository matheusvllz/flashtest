import {
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 10: Conectivos de adição e oposição
 */
export const conectivosAdicaoOposicao = defineLesson({
  id: "pontuacao-10-conectivos-adicao-oposicao",
  titulo: "Conectivos de adição e oposição",
  descricao:
    'Vírgula com "e", "mas", "porém", "contudo": quando acompanham e como mudam o ritmo da frase.',
  exercicios: [
    verdadeiroFalso({
      afirmacao:
        'Toda vez que você usa "mas" para contrastar ideias, precisa de vírgula antes dele.',
      verdadeiro: false,
      explicacao:
        'Depende. Se as orações têm sujeitos diferentes e são longas, sim: "O aluno estudou muito, mas a prova estava difícil demais." Se são curtas e simples, pode não ter: "Ele ama mas sofre." Contexto importa.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase está pontuada corretamente?",
      opcoes: [
        "Ela trabalha, e estuda a noite toda.",
        "Ela trabalha e estuda a noite toda.",
        "Nenhuma das duas é correta.",
      ],
      correta: 1,
      explicacao:
        'A segunda está melhor. Sem vírgula antes de "e" em frases curtas com o mesmo sujeito (ela). A vírgula na primeira separa demais, sem necessidade, quando a ação é paralela.',
    }),
    encontreOErro({
      frase: "A redação exige clareza mas a pontuação exige atenção constante.",
      erroIndex: 3,
      explicacao:
        'Falta vírgula antes de "mas". Essas são duas orações com sujeitos diferentes ("redação" vs. "pontuação") e ideias contrastadas. O correto é: "A redação exige clareza, mas a pontuação exige atenção constante."',
    }),
    multiplaEscolha({
      pergunta:
        'Em "Ele correu e correu até a linha de chegada, e ainda pôde comemorar", qual é o papel das vírgulas?',
      opcoes: [
        'Separar uma lista de ações com "e" repetido marca que cada ação tem peso',
        "Indicar que há erro de pontuação",
        "Adicionar informação sem importância",
      ],
      correta: 0,
      explicacao:
        'A repetição de "e" com vírgulas cria um ritmo de insistência. "E ainda pôde comemorar" é uma virada que merece vírgula antes. O padrão "e ainda" marca uma sequência que se finaliza com um ponto alto.',
    }),
    parear({
      instrucao: "Combine cada conectivo com seu uso",
      pares: [
        { a: "e", b: "Adiciona ideias do mesmo nível" },
        { a: "mas", b: "Contrasta, nega a expectativa anterior" },
        { a: "porém", b: "Contrasta com tom mais formal que mas" },
      ],
      explicacao:
        'Conectivos de adição e oposição têm papéis diferentes. "E" liga sem problemas. "Mas" e "porém" marcam virada de sentido: a vírgula antes deles ajuda o leitor a perceber a mudança.',
    }),
    encontreOErro({
      frase: "Estudei a noite toda mas não consegui entender toda a matéria da prova.",
      erroIndex: 3,
      explicacao:
        'O "mas" marca contraste e pede vírgula antes dele quando reverte a expectativa: "...a noite toda, mas não consegui..." A vírgula avisa o leitor que a ideia vai virar.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Quando "mas" contrasta duas ideias de peso igual em uma redação, a vírgula antes dele é muito importante para marcar a virada.',
      verdadeiro: true,
      explicacao:
        'Verdade. "Ele era rico, mas era infeliz" marca um contraste forte. A vírgula avisa ao leitor que a expectativa vai mudar naquele ponto.',
    }),
    interpretacao({
      texto:
        'Os conectivos de adição e oposição são o ritmo de um argumento. Quando você escreve "O aluno estuda e pratica e revisa e acaba dominando o tema", as ações se acumulam sem contraste. Mas quando escreve "O aluno estuda, porém não consegue assimilar, e por isso fica frustrado", os conectivos e suas vírgulas marcam a progressão de ideias com nuance. "E" adiciona, "mas" e "porém" revertem expectativas. Usar bem esses conectivos com pontuação correta faz o texto respirar com lógica.',
      pergunta:
        'Segundo o texto, qual é a diferença entre usar "e" repetido vs. usar "mas" ou "porém"?',
      opcoes: [
        '"E" separa ideias, "mas" une',
        '"E" adiciona sem contraste, "mas" e "porém" marcam virada de sentido',
        "Todos fazem a mesma coisa",
      ],
      correta: 1,
      explicacao:
        'O papel dos conectivos é diferente. "E" é continuação. "Mas" e "porém" são reviravolta: esperava uma coisa, mas aconteceu outra. Entender essa diferença é chave para pontuar bem.',
    }),
  ],
});

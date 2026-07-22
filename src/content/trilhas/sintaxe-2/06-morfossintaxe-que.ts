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
 * Lição 06: A morfossintaxe do QUE
 */
export const morfossintaxeQue = defineLesson({
  id: "sintaxe-2-06-morfossintaxe-que",
  titulo: "A morfossintaxe do QUE",
  descricao: 'Como a palavra "que" funciona em seus múltiplos papéis sintáticos.',
  exercicios: [
    multiplaEscolha({
      pergunta: 'Qual é a diferença entre "que" conjunção e "que" pronome relativo?',
      opcoes: [
        "Pronome relativo pode ser substituído por um nome; conjunção não",
        "Ambos têm exatamente a mesma função na frase",
        "Conjunção vem sempre após verbo; pronome relativo vem depois de nome",
      ],
      correta: 0,
      explicacao:
        'Pronome relativo retoma um nome anterior: "O livro que li" (que = livro). Conjunção liga orações sem retomar: "Espero que você passe" (que apenas conecta). Etimologia diferente, papéis diferentes.',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "Percebi que você faltou", o "que" é conjunção integrante.',
      verdadeiro: true,
      explicacao:
        'Integrante introduz oração subordinada substantiva (aqui, objetiva direta). Não retoma nada anterior, apenas conecta. "Percebi" é o verbo que pede a oração.',
    }),
    parear({
      pares: [
        {
          a: "O argumento que você trouxe foi sólido.",
          b: 'Pronome relativo (retoma "argumento")',
        },
        { a: "Creio que você está certo.", b: 'Conjunção integrante (liga "creio")' },
        { a: "Estudei o assunto que caiu na prova.", b: 'Pronome relativo (retoma "assunto")' },
        {
          a: "O professor pediu que fizéssemos silêncio.",
          b: 'Conjunção integrante (liga "pediu")',
        },
      ],
      explicacao:
        "Relativo retoma nome anterior e funciona como termo da segunda oração. Integrante apenas conecta sem retomar. Relativo é pronome (substitui nome); integrante é conjunção (conecta).",
    }),
    encontreOErro({
      frase: "O livro que eu comprei ele está em cima da mesa.",
      erroIndex: 5,
      explicacao:
        'O "que" já retoma "livro" dentro da oração; repetir a referência com "ele" logo depois é pleonasmo do pronome relativo, um desvio comum na fala que não vale na escrita formal. O certo é só "O livro que eu comprei está em cima da mesa".',
    }),
    completeLacuna({
      frase: "Todos sabiam ___ a redação teria tema novo.",
      opcoes: ["que", "o que", "qual"],
      correta: 0,
      explicacao:
        'Conjunção integrante "que" introduz oração subordinada substantiva (aqui, objetiva direta de "sabiam"). "Que" simples é o correto; "o que" marcaria pronome relativo (incorreto aqui).',
    }),
    multiplaEscolha({
      pergunta:
        'Em "Quem fez o trabalho que entregou foi para a faculdade", qual é o papel do segundo "que"?',
      opcoes: ["Conjunção aditiva", 'Pronome relativo retomando "trabalho"', "Advérbio de tempo"],
      correta: 1,
      explicacao:
        'O segundo "que" é pronome relativo: retoma "trabalho" e funciona como objeto direto de "entregou". "Que" = "o qual", facilmente substituível sem perder sentido.',
    }),
    ordenar({
      blocos: [
        "A tese que você formulou",
        "é tão forte",
        "que convence qualquer leitor.",
        "Ótimo argumento.",
      ],
      explicacao:
        'Primeira "que": pronome relativo ("a tese que você formulou"). Segunda "que": conjunção explicativa ou aditiva (introduz oração mostrando resultado). Mesma forma, funções opostas.',
    }),
    interpretacao({
      texto:
        'O "que" é a palavra mais polivalente do português. Pode retomar um nome (pronome relativo), conectar orações (conjunção integrante), marcar causa ou explicação (conjunção explicativa) ou até marcar ênfase ("Que dia lindo!"). Na redação de ENEM, dominar esses usos evita erros comuns: confundir "que" relativo com conjunção, colocar artigo onde não cabe ("o que" quando era só "que"), ou deixar duas orações sem nexo claro. Cada uso tem estrutura.',
      pergunta: 'Qual é o erro mais comum com "que" na escrita de alunos?',
      opcoes: [
        'Usar "que" conjunção em vez de "o qual"',
        "Confundir pronome relativo com conjunção integrante",
        'Esquecer o "que" quando é necessário',
      ],
      correta: 1,
      explicacao:
        'Confundir "que" relativo com integrante pode gerar ambiguidade. "Vi o filme que caiu na prova" (relativo: qual filme) vs "Soube que o filme caiu" (integrante: apenas conecta). O contexto é chave.',
    }),
    encontreOErro({
      frase: "Os dados que eu analisei e que extraí conclusões foram precisos.",
      erroIndex: 7,
      explicacao:
        'Aqui há erro: "que extraí conclusões" está incorreto. Não se extrai conclusões DE/PARA algo; extrai-se UM RESULTADO. Deveria ser "dados de que extraí" ou "dados, de que extraí" (com preposição). O "que" relativo precisa de preposição aqui.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Quero que você estude", o "que" pode ser substituído por "para que" sem mudar o sentido.',
      verdadeiro: false,
      explicacao:
        'Se trocarmos por "para que", mudamos a circunstância: de objetivo direto ("quero X") para finalidade ("quero para que X"). O "que" integrante aqui é neutro, sem nuance de propósito.',
    }),
  ],
});

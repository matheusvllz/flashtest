import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 12: Coesão referencial
 */
export const coesaoReferencial = defineLesson({
  id: "pontuacao-12-coesao-referencial",
  titulo: "Coesão referencial",
  descricao:
    "Como vírgulas e pontuação clareiam a retomada de termos: pronomes, sinônimos, elipses.",
  exercicios: [
    verdadeiroFalso({
      afirmacao:
        "Coesão referencial é a capacidade de referenciar (retomar) um termo já mencionado sem repeti-lo desnecessariamente.",
      verdadeiro: true,
      explicacao:
        'Exatamente. Se você escreve "Comprei um livro. Ele é muito bom", o "ele" retoma "livro". Sem essa retomada, o texto fica repetitivo e maçante.',
    }),
    multiplaEscolha({
      pergunta: "Qual versão tem melhor coesão referencial?",
      opcoes: [
        "Os alunos chegaram à aula e os alunos começaram a estudar com os alunos todos focados.",
        "Os alunos chegaram à aula e começaram a estudar, todos focados no objetivo.",
        "Alunos chegaram à aula. Os alunos estudaram. Os alunos se concentraram.",
      ],
      correta: 1,
      explicacao:
        'A segunda usa pronomes implícitos ("eles" subentendido), elipse (corte de repetição) e um aposto ("todos focados") que retoma o sujeito. Flui bem, sem repetir "alunos" em cada frase.',
    }),
    completeLacuna({
      frase:
        "A redação é importante, pois ela desenvolve capacidades críticas e ___ abre portas para melhor escrita.",
      opcoes: ["ele", "ela", "aquela"],
      correta: 1,
      explicacao:
        '"Redação" é palavra feminina: o pronome que a retoma é "ela", não "ele". "Aquela" até funcionaria, mas fica mais distante do que a frase pede aqui. "Ela" é a escolha mais natural.',
    }),
    encontreOErro({
      frase:
        "Meu primo veio me visitar. Ele estava muito animado e contou muitas histórias sobre ele mesmo.",
      erroIndex: 14,
      explicacao:
        'O segundo "ele" é redundante. "Contou histórias sobre si mesmo" ou "...sobre si" seria bem melhor. Repetir "ele" cria uma sensação de erro de coesão, ainda que gramaticalmente correto.',
    }),
    parear({
      instrucao: "Combine cada tipo de retomada com seu exemplo",
      pares: [
        { a: "Pronome pessoal", b: "Ele chegou e começou a trabalhar." },
        { a: "Pronome demonstrativo", b: "Esse e aquele livro são muito bons." },
        { a: "Elipse", b: "Comprei maçã, pera e uva no mercado." },
      ],
      explicacao:
        "Retomadas podem ser pronominais (ele, esse), demonstrativas (isso, aquilo) ou elípticas (corte de repetição). A pontuação clara ajuda em todas.",
    }),
    multiplaEscolha({
      pergunta:
        'Em "A educação constrói cidadania. Ela é a base de uma sociedade democrática", qual é o papel de "ela"?',
      opcoes: [
        "Repetir o termo anterior sem necessidade",
        'Retomar "educação" de forma elegante, evitando repetição',
        "Introduzir um novo sujeito",
      ],
      correta: 1,
      explicacao:
        'O pronome "ela" retoma "educação" e permite ao leitor seguir o fio da ideia sem cansar com repetição. É coesão bem feita.',
    }),
    encontreOErro({
      frase:
        "Os temas do ENEM são profundos, exigem pesquisa, e desafiam os alunos a pensar criticamente sobre os mesmos.",
      erroIndex: 17,
      explicacao:
        'A expressão "sobre os mesmos" é estranha. Deveria ser "sobre os temas" ou apenas "sobre eles" ou sem retomada. "Os mesmos" é formal demais e cria uma sensação de erro de coesão.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Quando há muito tempo entre a menção de um termo e sua retomada, é bom repetir o termo real em vez de usar só pronome.",
      verdadeiro: true,
      explicacao:
        'Verdade. "A redação é importante... ela mudou minha vida" funciona. Mas se há cinco frases no meio, repetir "a redação" ou usar sinônimos ("esse instrumento") é mais claro que deixar um pronome sozinho.',
    }),
    interpretacao({
      texto:
        "Coesão referencial é a costura que mantém um texto unido. Quando você retoma termos de forma variada (pronomes, sinônimos, elipses), o leitor sente que está lendo um texto vivo e sofisticado. Sem coesão, o texto fica salteado e repetitivo. Em uma redação do ENEM, a coesão referencial não é apenas uma questão gramatical: é sinal de que o escritor domina a língua e consegue expressar ideias complexas sem cair na mesmice. Pontuação clara ajuda esse efeito: vírgulas e pontos marcam o início de cada nova retomada e deixam o fluxo natural.",
      pergunta: "Segundo o texto, por que a coesão referencial importa em uma redação de ENEM?",
      opcoes: [
        "É apenas uma regra técnica sem efeito real",
        "Marca sofisticação e fluidez, evitando repetição e monotonia",
        "Só importa em textos científicos",
      ],
      correta: 1,
      explicacao:
        "A coesão referencial bem feita deixa o texto respirar e marca qualidade percebida. É uma das competências implícitas que diferenciam redações boas de excelentes.",
    }),
  ],
});

import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  ordenar,
  interpretacao,
} from "@/lib/lessons/define";

/**
 * Lição 10: Adjunto adverbial
 */
export const adjuntoAdverbial = defineLesson({
  id: "sintaxe-1-10-adjunto-adverbial",
  titulo: "Adjunto adverbial",
  descricao: "O termo que circunstancia a ação: tempo, lugar, modo, causa, etc.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é adjunto adverbial?",
      opcoes: [
        "Um termo que modifica o sentido de um verbo, adjetivo ou advérbio",
        "Um termo que completa o significado de um nome",
        "Qualquer palavra que vem depois de uma vírgula",
      ],
      correta: 0,
      explicacao:
        'Adjunto adverbial circunstancia a ação: quando, onde, como, por quê. Em "Ela saiu rapidamente", rapidamente modifica "saiu", diz o modo. É luxo, é tempero da frase.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem adjunto adverbial de tempo?",
      opcoes: [
        "Ela dançava alegremente na festa.",
        "Voltarei amanhã para casa.",
        "O carro parou abruptamente na chuva.",
      ],
      correta: 1,
      explicacao:
        'Em "Voltarei amanhã", amanhã é adjunto adverbial de tempo: quando voltará? Amanhã. Marca o templo da ação com precisão. Estrutura que situa no tempo.',
    }),
    verdadeiroFalso({
      afirmacao: "Adjunto adverbial é sempre necessário para fazer a oração completa.",
      verdadeiro: false,
      explicacao:
        'Falso. Adjunto é dispensável: "Ela saiu" já é oração. "Ela saiu rapidamente na chuva de madrugada" só amplia, circunstancia, mas não completa o essencial.',
    }),
    completeLacuna({
      frase: 'Em "Corremos para casa com muito medo", "com muito medo" é adjunto adverbial de ___.',
      opcoes: ["modo", "causa", "tempo"],
      correta: 0,
      explicacao:
        'Modo: como corremos? Com muito medo. Descreve a maneira. A causa seria "corremos porque tínhamos medo". Modos de circunstanciar a ação.',
    }),
    encontreOErro({
      frase: "Ele trabalha aqui a dez anos.",
      erroIndex: 3,
      explicacao:
        'Tempo decorrido pede o verbo "haver", não a preposição "a". O certo é "Ele trabalha aqui há dez anos". Na fala os dois soam igual, mas na escrita a diferença é obrigatória.',
    }),
    parear({
      instrucao: "Relacione cada adjunto adverbial com seu tipo",
      pares: [
        { a: "Chegou ontem.", b: "Adjunto adverbial de tempo" },
        { a: "Corria velozmente.", b: "Adjunto adverbial de modo" },
        { a: "Estava no parque.", b: "Adjunto adverbial de lugar" },
      ],
      explicacao:
        "Tempo: quando. Modo: como. Lugar: onde. Cada um circunstancia a ação sob aspecto diferente. A estrutura se amplia a cada camada.",
    }),
    verdadeiroFalso({
      afirmacao: "Um advérbio sozinho sempre é um adjunto adverbial.",
      verdadeiro: false,
      explicacao:
        'Falso. Advérbio pode ser adjunto adverbial, mas também pode modificar adjetivo ("muito bonita"), outro advérbio ("muito rapidamente") ou até integrar predicado nominal ("Aqui é seguro").',
    }),
    ordenar({
      blocos: [
        "O adjunto adverbial",
        "circunstancia a ação",
        "dizendo quando, onde,",
        "como, por que acontece.",
      ],
      explicacao:
        "A sequência mostra a função: não completa, mas expande. Quadro que envolve a ação, dá contexto, respiração.",
    }),
    interpretacao({
      texto:
        'Um redator novato escreve "Ele chegou. Ele entrou. Ele falou." Sem adjuntos adverbiais, a prosa morre. Um redator experiente escreve "Ele chegou cansado pela madrugada. Entrou cauteloso na sala escura. Falou baixo, temeroso." Adjuntos adverbiais são oxigênio: transformam listagem mecânica em cena viva. Quando e onde tudo acontece. Com que cara, que suspense. Ritmo.',
      pergunta: "Conforme o texto, qual é o efeito de usar adjuntos adverbiais na redação?",
      opcoes: [
        "Transforma texto mecânico em cena vivida e respirável",
        "Torna o texto mais formal e científico",
        "Reduz a quantidade de caracteres da redação",
      ],
      correta: 0,
      explicacao:
        "Adjuntos adverbiais são vida da prosa. Sem eles, carcaça. Com eles, respiração, ritmo, dramaticidade. São tempero que distingue texto vivo de lista morta.",
    }),
  ],
});

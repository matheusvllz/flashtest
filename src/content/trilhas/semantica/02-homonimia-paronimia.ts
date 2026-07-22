import {
  defineLesson,
  encontreOErro,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
  interpretacao,
  completeLacuna,
} from "@/lib/lessons/define";

/**
 * Homonímia e paronímia: quando as palavras se parecem e confundem.
 */
export const homonimiParonimia = defineLesson({
  id: "semantica-02-homonimia-paronimia",
  titulo: "Homonímia e paronímia",
  descricao: "Palavras que soam igual ou parecido, mas têm sentidos diferentes.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que são homônimos?",
      opcoes: [
        "Palavras que têm som igual, mas significado diferente",
        "Palavras que significam quase a mesma coisa",
        "Palavras que têm a mesma raiz etimológica",
      ],
      correta: 0,
      explicacao:
        'Homônimos têm a mesma grafia ou som, mas sentidos completamente diferentes. "Banco" (instituição) e "banco" (assento) constroem significados opostos da mesma forma. Na redação, essa confusão desconstrói a estrutura de sentido.',
    }),
    verdadeiroFalso({
      afirmacao: "Parônimos são palavras que soam idênticas mas significam coisas diferentes.",
      verdadeiro: false,
      explicacao:
        'Homônimos soam idênticos. Parônimos soam PARECIDO: "eminente" (ilustre) e "iminente" (que vai acontecer em breve). A semelhança confunde, mas não é igualdade. Confundir parônimos enfraquece a solidez do texto.',
    }),
    parear({
      instrucao: "Combine cada palavra com um homônimo seu",
      pares: [
        { a: "obra (construção)", b: "obra (escritor)" },
        { a: "manga (fruta)", b: "manga (parte da roupa)" },
        { a: "caixa (recipiente)", b: "caixa (profissional)" },
      ],
      explicacao:
        'Homônimos são armadilhas de grafia. Quando você escreve "manga", o leitor pode entender fruta ou parte da roupa. A frase tem que deixar claro qual estrutura você está montando.',
    }),
    encontreOErro({
      frase: "O advogado foi iminente ao defender o cliente.",
      erroIndex: 3,
      explicacao:
        '"Iminente" significa que está prestes a acontecer, e não combina com a ideia de defender um cliente com talento. A palavra certa aqui é "eminente" (ilustre, de destaque). A troca é parônima: as palavras soam parecido, mas carregam sentidos diferentes.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa a palavra certa?",
      opcoes: [
        "A chuva era iminente naquela manhã.",
        "O professor era iminente no ensino de história.",
        "A situação era eminente para uma solução.",
      ],
      correta: 0,
      explicacao:
        'Iminente é o que está prestes a acontecer. Eminente é alguém ilustre. A estrutura da frase exige "iminente": a chuva vai chegar, é iminente. Professores ilustres são eminentes, não iminentes.',
    }),
    completeLacuna({
      frase: "O juiz foi ___ em sua decisão, porque a sentença era clara e justa.",
      opcoes: ["eminente", "iminente", "negligente"],
      correta: 0,
      explicacao:
        'O juiz ilustre, respeitado, é eminente. Aqui "eminente" constrói a ideia de prestígio e autoridade. "Iminente" não cabe: não é algo prestes a acontecer.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Homônimos precisam ser evitados completamente na redação porque sempre causam confusão.",
      verdadeiro: false,
      explicacao:
        'Homônimos existem na língua e, com contexto claro, funcionam bem. O erro é criar ambiguidade desnecessária. "Ele levou o banco para a sala" pode ser móvel ou instituição, mas a frase deixa claro qual é pelo contexto. Evite quando a estrutura da frase permitir confusão.',
    }),
    interpretacao({
      texto:
        'Um dos maiores desafios da redação é a precisão lexical. Quando duas palavras soam parecidas ou iguais, a linha entre clareza e confusão fica tênue. Um candidato do ENEM escreveu: "O governo foi indiferente às críticas". Outra entrega estava: "O governo foi indolente nas ações sociais". Indolente é "preguiçoso", indiferente é "sem interesse". Ambas podem descrever um governo negligente, mas cada uma constrói um tipo de crítica diferente. A imprecisão não é erro de regra: é fraqueza de alicerce no texto.',
      pergunta: 'Qual é a diferença entre "indolente" e "indiferente" conforme explicado no texto?',
      opcoes: [
        "Indolente é preguiçoso, indiferente é sem interesse",
        "Indolente é mais formal, indiferente é mais coloquial",
        "Não há diferença, são sinônimos perfeitos",
      ],
      correta: 0,
      explicacao:
        "A distinção é de alicerce: preguiça é passividade, indiferença é falta de interesse. A escolha entre uma e outra constrói argumentos diferentes sobre o mesmo objeto.",
    }),
    parear({
      instrucao: "Combine cada palavra com seu parônimo",
      pares: [
        { a: "flagrante (evidente)", b: "fragrante (perfumado)" },
        { a: "descrição (ato de descrever)", b: "discrição (reserva)" },
        { a: "sensível (que sente)", b: "sensato (que tem senso)" },
      ],
      explicacao:
        'Parônimos deixam armadilhas de som. Uma frase com "fragrante" quando deveria ser "flagrante" desconstrói o sentido que você quis montar. A precisão é fundação.',
    }),
  ],
});

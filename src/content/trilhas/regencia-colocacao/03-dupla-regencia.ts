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
 * Lição 03: Verbos com Dupla Regência e Mudança de Sentido
 * Foco: verbos que mudam de significado conforme a preposição (obedecer, ser grato, pagar, etc.)
 */
export const duplaRegencia = defineLesson({
  id: "regencia-colocacao-03-dupla-regencia",
  titulo: "Dupla regência: quando a preposição muda o sentido",
  descricao: "Um verbo, dois caminhos, dois significados. Escolha certo.",
  exercicios: [
    multiplaEscolha({
      pergunta:
        'Qual alternativa explica corretamente a diferença entre "paguei a conta" e "paguei em dinheiro"?',
      opcoes: [
        '"Paguei a conta" significa que quitei a dívida; "paguei em dinheiro" indica apenas a forma de pagamento usada.',
        '"Paguei a conta" significa que paguei dinheiro a alguém, sem quitar a dívida.',
        '"Paguei a conta" e "paguei em dinheiro" significam exatamente a mesma coisa.',
      ],
      correta: 0,
      explicacao:
        'Pagar com "a" significa quitar: paguei a conta, paguei a dívida. Pagar com "em" marca a forma de pagamento: paguei em dinheiro, paguei em espécie. Regência dupla é semântica.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Obedeço a lei" e "Obedeci em suas ordens", as duas frases estão corretas porque "obedecer" tem dupla regência.',
      verdadeiro: false,
      explicacao:
        'Obedecer sempre exige "a", nunca "em". O correto é "obedeço a lei" e "obedeci a suas ordens". Dupla regência não é liberdade para errar.',
    }),
    encontreOErro({
      // "Sou" (0) "grato" (1) "em" (2) "sua" (3) "ajuda." (4)
      frase: "Sou grato em sua ajuda.",
      erroIndex: 2,
      explicacao:
        'Ser grato reclama "a", não "em". "Sou grato a você", "sou grato a sua ajuda". Gratidão tem endereço marcado por "a".',
    }),
    completeLacuna({
      frase: "O candidato aspirava ___ cargo de diretor, mas acabou aspirando a fama também.",
      opcoes: ["a", "ao", "de"],
      correta: 1,
      explicacao:
        'Aspirar é constante: sempre pede "a". Só que "a" mais o artigo "o" (de "o cargo") vira "ao": "aspirava ao cargo de diretor". A preposição não muda, mas se funde com o artigo.',
    }),
    parear({
      instrucao: "Combine cada verbo com suas formas e significados",
      pares: [
        { a: "Pagar a dívida", b: "Quitar, liquidar" },
        { a: "Pagar em dinheiro", b: "Usar como meio de pagamento" },
        { a: "Ser grato a alguém", b: "Reconhecer benefício" },
        { a: "Obedecer a regra", b: "Cumprir, acatar" },
      ],
      explicacao:
        "Verbos com dupla regência são charadas semânticas: a preposição é chave que abre o significado certo. Escolha errado, sentido desaparece.",
    }),
    multiplaEscolha({
      pergunta: "Em qual frase a regência está correta?",
      opcoes: [
        "Ele informou ao gerente sobre o atraso.",
        "Ele informou o gerente do atraso.",
        "Ele informou o gerente sobre o atraso.",
      ],
      correta: 1,
      explicacao:
        'Informar segue o padrão informar alguém de algo: "informou o gerente do atraso" é o mais fiel à norma culta. Misturar "ao gerente" com "sobre" foge dos dois padrões corretos do verbo.',
    }),
    verdadeiroFalso({
      afirmacao:
        'O verbo "chamar" tem dupla regência: "chamar a alguém" (convocar) e "chamar de alguém" (atribuir nome).',
      verdadeiro: true,
      explicacao:
        'Exato: "chamei a João para trabalhar" (convocar com "a") e "chamei de idiota" (atribuir qualidade com "de"). Regência dupla revela camadas de significado.',
    }),
    encontreOErro({
      // "O" (0) "professor" (1) "informou" (2) "aos" (3) "alunos" (4) "de" (5) "a" (6) "mudança." (7)
      frase: "O professor informou aos alunos de a mudança.",
      erroIndex: 5,
      explicacao:
        'Informar pede "sobre" ou complemento direto (acusativo), não "de a". O correto é "informou aos alunos sobre a mudança" ou "informou os alunos da mudança".',
    }),
    interpretacao({
      texto:
        'Dupla regência não é licença para errar, mas oportunidade para capturar nuance. Quando o mesmo verbo muda de preposição, muda de sentido: "viso a seu sucesso" (desejo seu sucesso) versus "viso em sua proposta" (não existe; visar é sempre "a"). Reconhecer essa bifurcação é ler a língua com precisão, não amadorismo.',
      pergunta: "Segundo o texto, dupla regência é melhor entendida como:",
      opcoes: [
        "Uma confusão gramatical que o falante pode ignorar.",
        "Uma oportunidade de capturar nuance semântica através de diferentes preposições.",
        "Uma regra opcional que vale apenas em textos formais.",
      ],
      correta: 1,
      explicacao:
        'O texto diz claramente que dupla regência captura sentidos diferentes, é "oportunidade", não confusão. Conhecer a diferença é ler a língua com precisão.',
    }),
  ],
});

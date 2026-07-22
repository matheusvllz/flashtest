import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const paronimosDeProva = defineLesson({
  id: "fonologia-ortografia-10-paronimosprova",
  titulo: "Parônimos de prova",
  descricao:
    "Sessão/seção/cessão, descrição/discrição, flagrante/fragrante e outros que aparecem no ENEM.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um parônimo?",
      opcoes: [
        "Duas palavras com significados opostos",
        "Duas palavras que soam parecido mas têm significados diferentes",
        "Duas palavras que têm exatamente o mesmo significado",
      ],
      correta: 1,
      explicacao:
        'Parônimo é aquele que PARECE irmão, mas não é. "Sessão" (reunião) parece "seção" (divisão), mas significados completamente diferentes. O som te engana.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa o parônimo corretamente?",
      opcoes: [
        "Assisti a uma seção de cinema.",
        "Assisti a uma sessão de cinema.",
        "A discrição do relatório impressionou todos pela riqueza de detalhes.",
      ],
      correta: 1,
      explicacao:
        'Sessão é reunião, encontro (sessão de cinema = tempo de exibição). Seção é divisão, parte (seção de têxteis). A segunda está certa. A terceira mistura os dois: "riqueza de detalhes" pede descrição, não discrição (que é reserva, sigilo).',
    }),
    parear({
      pares: [
        { a: "Sessão", b: "Reunião, encontro (sessão de cinema)" },
        { a: "Seção", b: "Divisão, departamento (seção de vendas)" },
        { a: "Cessão", b: "Ato de ceder (cessão de direitos)" },
      ],
      explicacao:
        'Sessão tem dois esses (junta pessoas). Seção tem um cê-cedilhado, de "seccionar" (cortar, dividir). Cessão tem um cê e dois esses, vem de "ceder". Reparar a grafia de cada uma evita a confusão.',
    }),
    verdadeiroFalso({
      afirmacao: "Descrição e discrição são parônimos com significados totalmente distintos.",
      verdadeiro: true,
      explicacao:
        "Sim. Descrição é DETALHAR (descrever um quadro). Discrição é SER DISCRETO (guardar segredo, ser reservado). Sons parecidos, significados opostos na prática.",
    }),
    encontreOErro({
      frase: "O fragrante delito foi presenciado por muitas pessoas durante o dia.",
      erroIndex: 1,
      explicacao:
        'Contando: O(0) fragrante(1) delito(2) foi(3) presenciado(4) por(5) muitas(6) pessoas(7) durante(8) o(9) dia(10). O erro está em "fragrante" (índice 1). Deveria ser "flagrante". Fragrante = com fragrância (cheiro bom). Flagrante = evidente, em ato (delito em flagrante).',
    }),
    completeLacuna({
      frase: "A cessão de dados da empresa foi feita com ___, mantendo sigilo total.",
      opcoes: ["discrição", "descrição", "discretção"],
      correta: 0,
      explicacao:
        'Discrição, qualidade de ser discreto. A cessão (transferência) de dados foi feita com reserva e sigilo. "Descrição" seria detalhar, o oposto do que a frase pede.',
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa tem TODOS os parônimos usados corretamente?",
      opcoes: [
        "A descrição detalhada da paisagem foi feita com discrição.",
        "O cumprimento da estrada deixou ele cansado.",
        "A expedição explorou a flora local com espírito filantrópico.",
      ],
      correta: 0,
      explicacao:
        'Primeira opção. Descrição (detalhar) está correto; discrição (sigilo, reserva) está correto. Segunda: o certo seria "comprimento" (tamanho, extensão da estrada), não "cumprimento" (saudação), que não faz sentido nessa frase. Terceira está correta, mas não tem parônimos em jogo.',
    }),
    interpretacao({
      texto:
        'Parônimos são uma armadilha frequente em provas de redação e de compreensão porque exploram a semelhança sonora que nosso ouvido percebe naturalmente. Quando falamos rápido, "sessão" e "seção" soam quase idênticas, mas na escrita a diferença é crucial: uma reúne pessoas, a outra divide espaço. O mesmo vale para "fragrante" (cheiroso) vs "flagrante" (óbvio, em ato). Dominar parônimos não é memorizar uma lista, mas reconhecer que o português oferece precisão de palavra para cada conceito, e essa precisão é testada justamente porque a confusão é fácil.',
      pergunta: "Por que parônimos são frequentemente testados em provas?",
      opcoes: [
        "Porque são palavras raras e de difícil pronúncia",
        "Porque a semelhança sonora facilita confusão, testando precisão do aluno",
        "Porque pertencem a uma categoria de palavras fora da norma",
      ],
      correta: 1,
      explicacao:
        "Exato. A prova quer saber se você compreende que a PRONÚNCIA semelhante não garante SIGNIFICADO semelhante. Isso é maturidade linguística: reconhecer a distinção onde a orelha não vê diferença.",
    }),
  ],
});

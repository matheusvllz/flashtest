import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const osPortques = defineLesson({
  id: "fonologia-ortografia-08-os-porques",
  titulo: "Os porquês",
  descricao: "Por que (2 palavras), porque, porquê e por quê: cada um em seu lugar.",
  exercicios: [
    multiplaEscolha({
      pergunta: 'Qual é a diferença entre "por que" e "porque"?',
      opcoes: [
        '"Por que" é pergunta ou explicação antecedente; "porque" é resposta ou explicação de causa',
        "Não há diferença, são sinônimos",
        '"Porque" é mais formal que "por que"',
      ],
      correta: 0,
      explicacao:
        'Por que é PERGUNTA: "por que você saiu?" Porque é RESPOSTA: "saí porque estava cansado". Memoriza assim: per-GUNTA tem quem? Por QUE. Res-POSTA tem se. Por QUE... porque.',
    }),
    multiplaEscolha({
      pergunta: 'Qual frase usa "porquê" corretamente?',
      opcoes: [
        "Não entendo o porquê de sua ausência.",
        "Porquê você não veio?",
        "Ele saiu porquê estava chato.",
      ],
      correta: 0,
      explicacao:
        'Porquê é SUBSTANTIVO, vem com acento e artigo. "O porquê de sua saída" = "a razão de sua saída". As outras duas usam errado: porquê não é interrogativo nem explicação.',
    }),
    parear({
      pares: [
        { a: "Por que", b: "Pergunta ou elo causal" },
        { a: "Porque", b: "Resposta, explicação de causa" },
        { a: "Porquê", b: 'Substantivo, "a razão"' },
      ],
      explicacao:
        "Por que: 2 palavras, pergunta. Porque: 1 palavra, resposta. Porquê: 1 palavra acentuada, é um nome (coisa), precisa de artigo. Por quê no final: ênfase em pergunta (você por quê? = por quê você?).",
    }),
    verdadeiroFalso({
      afirmacao:
        'A expressão "por quê" (2 palavras com acento) aparece sempre no final de frase ou sozinha.',
      verdadeiro: true,
      explicacao:
        'Por quê (isolado) marca ênfase ou fim de pergunta. "Você saiu por quê?" = "Por quê?" A acentuação vem porque está no fim, onde a tonicidade fica mais saliente na pronúncia.',
    }),
    encontreOErro({
      frase: "Não descobrimos o porque ele sumiu do trabalho.",
      erroIndex: 3,
      explicacao:
        'Contando: Não(0) descobrimos(1) o(2) porque(3) ele(4) sumiu(5) do(6) trabalho(7). O erro mora em "porque" (índice 3): depois do artigo "o", a palavra vira substantivo e pede acento, "o porquê". Toque em "porque".',
    }),
    completeLacuna({
      frase: "Você sabe ___ eu saio cedo? Eu saio porque tenho aula de noite.",
      opcoes: ["por que", "porque", "porquê"],
      correta: 0,
      explicacao:
        'Por que, separado e sem acento, porque é pergunta (direta ou indireta). "Porque" grudado guarda ele pra explicações, tipo "porque tenho aula", nunca pra perguntas.',
    }),
    multiplaEscolha({
      pergunta: 'Em qual alternativa os "porquês" estão corretos?',
      opcoes: [
        "Porque você não veio? Por que estava doente.",
        "Por que você não veio? Porque estava doente.",
        "Porquê você não veio? Por que estava doente.",
      ],
      correta: 1,
      explicacao:
        'Segunda opção. "Por que" (pergunta) / "porque" (resposta). A primeira tem o porque da pergunta errado (seria por que). A terceira usa porquê errado (não é substantivo aqui).',
    }),
    interpretacao({
      texto:
        'Os quatro porquês cobrem situações diferentes: "por que" é o mais frequente, usado em perguntas e explicações causais; "porque" é a resposta natural; "porquê" é o nome daquilo que se pergunta (a razão, o motivo); "por quê" é a ênfase da pergunta no final. Em prova, o grande erro é confundir "porque" (conjunção) com "porquê" (substantivo). A dica de ouro: se você conseguir substituir por "a razão" ou "o motivo", use porquê com acento. Caso contrário, é porque ou por que.',
      pergunta: 'Como diferenciar "porque" de "porquê" de forma prática?',
      opcoes: [
        'Porque é conjunção, porquê é substantivo (substitua por "razão" ou "motivo")',
        "Porque é mais formal e porquê é coloquial",
        "Porquê é sempre no fim, porque é sempre no meio",
      ],
      correta: 0,
      explicacao:
        'Exato. Se cabe "a razão" ou "o motivo", é porquê. "Não entendo o porquê" = "não entendo a razão". Caso contrário, é porque ou por que. Essa é a técnica mais confiável pra acertar toda vez.',
    }),
  ],
});

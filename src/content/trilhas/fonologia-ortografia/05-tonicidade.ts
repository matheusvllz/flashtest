import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const tonicidade = defineLesson({
  id: "fonologia-ortografia-05-tonicidade",
  titulo: "Tonicidade (oxítonas, paroxítonas, proparoxítonas)",
  descricao: "Onde cai o acento tônico e como classificamos as palavras pelo som.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é tonicidade?",
      opcoes: [
        "O número de sílabas de uma palavra",
        "A sílaba em que o acento tônico cai, dando ênfase ao som",
        "A vogal principal de uma frase",
      ],
      correta: 1,
      explicacao:
        'Tonicidade é qual sílaba você fala MAIS FORTE. Em "casa", é CA (tônica), SA é átona. "Café" tem a tônica em FÉ. Esse detalhe muda até o sentido às vezes.',
    }),
    multiplaEscolha({
      pergunta: "Qual palavra é oxítona?",
      opcoes: [
        "Carro (tônica na primeira sílaba)",
        "Café (tônica na última sílaba)",
        "Público (tônica na primeira sílaba)",
      ],
      correta: 1,
      explicacao:
        "Oxítona tem tônica na ÚLTIMA sílaba. Ca-FÉ, ci-DAD-de, re-fe-I-ÇÃO. A tônica vem no final. Oxítonas sempre recebem acento gráfico (com raras exceções).",
    }),
    parear({
      pares: [
        { a: "Paroxítona", b: "Tônica na penúltima sílaba" },
        { a: "Proparoxítona", b: "Tônica na antepenúltima sílaba" },
        { a: "Oxítona", b: "Tônica na última sílaba" },
      ],
      explicacao:
        "Memória: OXI = final (oxigênio tem O-XI no final, lembra?). PA-RO = perto (penúltima é perto do fim). PRO-PA = antes (antepenúltima é antes de penúltima).",
    }),
    verdadeiroFalso({
      afirmacao: "Toda palavra proparoxítona recebe acento gráfico obrigatoriamente.",
      verdadeiro: true,
      explicacao:
        'Sempre. Proparoxítona é 100% acentuada: "tábula", "lâmpada", "médico". A regra não tem exceção, e isso facilita: se vir acento na antepenúltima, sabe que é proparoxítona.',
    }),
    encontreOErro({
      frase: "Todas as palavras paroxítonas recebem acento gráfico obrigatoriamente.",
      erroIndex: 0,
      explicacao:
        'Contando: Todas(0) as(1) palavras(2) paroxítonas(3) recebem(4) acento(5) gráfico(6) obrigatoriamente.(7). Nem todas! Paroxítona só recebe acento em terminações especiais (árvore, tórax). "Casa", "livro" e "janela" são paroxítonas sem acento nenhum. O erro mora nesse "Todas". Toque nele.',
    }),
    completeLacuna({
      frase:
        "Em uma palavra ___, a tônica cai sempre na última sílaba e geralmente recebe acento gráfico.",
      opcoes: ["paroxítona", "oxítona", "monossílaba"],
      correta: 1,
      explicacao:
        "Oxítona. A tônica está no FINAL, daí o nome (OXI = final). Oxítonas terminadas em A, E, O, EM quase sempre levam acento: sofá, café, paletó, alguém. A regra é clara.",
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa tem uma palavra de cada tipo de tonicidade?",
      opcoes: [
        "Sofá (oxítona), Pedra (paroxítona), Lâmpada (proparoxítona)",
        "Casa (paroxítona), Café (paroxítona), Árvore (proparoxítona)",
        "Camisa (paroxítona), Bondade (oxítona), Público (paroxítona)",
      ],
      correta: 0,
      explicacao:
        "Sofá (so-FÁ, última), Pedra (PED-ra, penúltima), Lâmpada (LÂM-pa-da, antepenúltima). Uma de cada. As outras têm repetições ou erros.",
    }),
    interpretacao({
      texto:
        "A pronúncia e a escrita caminham juntas na tonicidade. Enquanto oxítonas e proparoxítonas seguem regras bastante fixas na acentuação gráfica, as paroxítonas oferecem variação: algumas recebem acento (próximo, pâssaro) e outras não (mesa, livro). Isso ocorre porque a acentuação gráfica do português segue um princípio de necessidade: marca onde há risco de confusão.",
      pergunta:
        "Por que paroxítonas têm regras de acentuação mais complexas que oxítonas e proparoxítonas?",
      opcoes: [
        "Porque paroxítona é a mais frequente e cobre muitos padrões",
        "Porque a acentuação marca onde há risco de confusão",
        "Porque paroxítonas são mais difíceis de pronunciar",
      ],
      correta: 1,
      explicacao:
        'Exato. Oxítona é raro no português, então recebe acento. Proparoxítona também é rara. Paroxítona é o padrão natural, então só marcamos quando há ambiguidade: "pêlo" (substantivo) vs "pelo" (preposição). Economia de tinta, sabedoria de linguagem.',
    }),
  ],
});

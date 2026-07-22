import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const acentosDiferenciais = defineLesson({
  id: "fonologia-ortografia-07-acentos-diferenciais",
  titulo: "Acentos diferenciais",
  descricao:
    "Os poucos acentos que sobraram para distinguir palavras de som quase idêntico: pôde/pode, pôr/por, têm/tem.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um acento diferencial?",
      opcoes: [
        "Um acento que marca a sílaba tônica",
        "Um acento que distingue duas palavras de pronúncia quase igual",
        "Um acento em palavras estrangeiras",
      ],
      correta: 1,
      explicacao:
        'Acento diferencial marca diferença de sentido, não de tonicidade extra. O caso clássico que sobrou até hoje é "pôde" (passado: ele pôde) e "pode" (presente: ele pode). O acento evita confundir os dois tempos.',
    }),
    multiplaEscolha({
      pergunta: "Qual par de palavras usa acento diferencial na norma culta atual?",
      opcoes: [
        "Sofá / sofá (mesma palavra)",
        "Pôde / pode (pôde=passado, pode=presente)",
        "Hábito / habito (tempos diferentes do verbo, não acento diferencial)",
      ],
      correta: 1,
      explicacao:
        'Pôde vs pode é o caso clássico que sobreviveu ao Acordo Ortográfico de 1990: "ele pôde" é passado, "ele pode" é presente. O acento evita a confusão dos tempos verbais.',
    }),
    parear({
      pares: [
        { a: "Pôr a mesa", b: "Verbo pôr, com acento" },
        { a: "Lutar por um sonho", b: "Preposição por, sem acento" },
        { a: "Eles têm razão", b: 'Plural de "tem", com acento' },
      ],
      explicacao:
        "O acento diferencial hoje sobrevive em poucos pares: pôr (verbo) contra por (preposição), e têm (plural) contra tem (singular). A maioria dos outros diferenciais, como pêlo/pelo e pólo/polo, foi extinta pelo Acordo Ortográfico de 1990.",
    }),
    verdadeiroFalso({
      afirmacao: 'O acento diferencial em "pode" (presente) distingue de "pôde" (pretérito).',
      verdadeiro: true,
      explicacao:
        'Sim. "Pode" (presente: ele pode) contra "pôde" (passado: ele pôde). Esse é um dos poucos acentos diferenciais que a norma culta manteve até hoje, e ainda aparece em prova.',
    }),
    encontreOErro({
      frase:
        'O acento diferencial em "pôr" e "por" já foi extinto pelo Acordo Ortográfico de 1990, então hoje se escreve "por" nos dois casos.',
      erroIndex: 9,
      explicacao:
        'Contando: O(0) acento(1) diferencial(2) em(3) "pôr"(4) e(5) "por"(6) já(7) foi(8) extinto(9) pelo(10) Acordo(11) Ortográfico(12) de(13) 1990,(14) então(15) hoje(16) se(17) escreve(18) "por"(19) nos(20) dois(21) casos.(22). Pôr (verbo) e por (preposição) continuam distintos até hoje, esse diferencial sobreviveu à reforma. Quem foi extinto foi o de pêlo/pelo e pólo/polo. O erro mora em "extinto". Toque nele.',
    }),
    completeLacuna({
      frase:
        'Em "Estou com ___ no rosto", usamos a palavra que indica o fio que cobre a pele, sem acento desde o Acordo Ortográfico de 1990.',
      opcoes: ["pêlo", "pelo", "pélo"],
      correta: 1,
      explicacao:
        'Pelo, sem acento. Antes de 1990 existia "pêlo" (substantivo) contra "pelo" (preposição/contração), mas essa distinção gráfica foi extinta: hoje as duas se escrevem "pelo", e o contexto resolve o sentido.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa o acento diferencial corretamente?",
      opcoes: [
        "Ele pôde vir ontem.",
        "Ele pode vir amanhã.",
        "Ambas estão certas (tempos diferentes do verbo exigem grafias diferentes)",
      ],
      correta: 2,
      explicacao:
        'Ambas. "Pôde" é pretérito (ele conseguiu vir, passado), "pode" é presente (ele consegue vir, presente). Essa distinção é o acento diferencial clássico que segue valendo.',
    }),
    interpretacao({
      texto:
        'Os acentos diferenciais marcam palavras de pronúncia parecida, mas sentido diferente. Antes do Acordo Ortográfico de 1990, havia muitos casos, como "pêlo" (substantivo) e "pelo" (preposição), ou "pólo" e "polo". A reforma extinguiu a maioria deles, e hoje sobrevivem poucos, como "pôde" (pretérito) e "pode" (presente), ou "pôr" (verbo) e "por" (preposição). Mesmo reduzidos, esses casos ainda aparecem em provas de norma culta e no ENEM.',
      pergunta: "Por que existem acentos diferenciais em português?",
      opcoes: [
        "Para marcar sílabas tônicas em palavras raras",
        "Para distinguir palavras de som e grafia iguais, evitando ambiguidade",
        "Para seguir padrões de pontuação internacional",
      ],
      correta: 1,
      explicacao:
        "Exato. O acento diferencial é sinal de SIGNIFICADO, não de tonicidade extra. Hoje restam poucos casos, como pôde/pode e pôr/por, mas continuam valendo pra separar sentidos diferentes que soam quase igual.",
    }),
  ],
});

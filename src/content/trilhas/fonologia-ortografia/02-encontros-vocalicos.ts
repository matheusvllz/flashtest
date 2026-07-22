import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const encontrosVocalicos = defineLesson({
  id: "fonologia-ortografia-02-encontros-vocalicos",
  titulo: "Encontros vocálicos",
  descricao: "Ditongos, tritongos e hiatos: quando duas ou mais vogais se encontram.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um ditongo?",
      opcoes: [
        "Um encontro de duas consoantes na mesma sílaba",
        "Um encontro de duas vogais na mesma sílaba, formando um único som",
        "Uma vogal seguida de acento gráfico",
      ],
      correta: 1,
      explicacao:
        'Ditongo é duas vogais, um som. "Pai", "série", "noite": as duas vogais formam um único som na mesma sílaba. Por isso eu conto como fonema único.',
    }),
    multiplaEscolha({
      pergunta: "Qual dessas palavras tem um hiato?",
      opcoes: ["Caixa (AI é ditongo)", "Poesia (OE e IA são hiatos)", "Muito (UI é ditongo)"],
      correta: 1,
      explicacao:
        "Hiato é duas vogais em sílabas DIFERENTES. Poesia: po-e-si-a (o E e o A estão separados, são hiatos). Um hiato em cada sequência.",
    }),
    parear({
      pares: [
        { a: "Pai", b: "Ditongo decrescente" },
        { a: "Série", b: "Ditongo crescente" },
        { a: "Lua", b: "Hiato" },
      ],
      explicacao:
        "Ditongo decrescente: vogal forte + fraca, mesma sílaba (PAI: a+i). Ditongo crescente: fraca + forte, mesma sílaba (SÉ-RIE: i+e). Hiato: vogais em sílabas separadas, cada uma com sua força (LU-A: o U carrega o acento tônico sozinho).",
    }),
    verdadeiroFalso({
      afirmacao: "Um tritongo é um encontro de três consoantes na mesma sílaba.",
      verdadeiro: false,
      explicacao:
        'Não. Tritongo é TRÊS VOGAIS na mesma sílaba. "Enguaiadura" tem um (GUAI). Consoantes múltiplas chamam-se encontros consonantais.',
    }),
    encontreOErro({
      frase: 'A palavra "saúde" tem dois hiatos: "a" com "u" e "u" com "de".',
      erroIndex: 4,
      explicacao:
        'Contando: A(0) palavra(1) saúde(2) tem(3) dois(4) hiatos:(5) "a"(6) com(7) "u"(8) e(9) "u"(10) com(11) "de".(12). "Saúde" é SA-Ú-DE: só existe UM hiato, entre A e Ú. Entre Ú e DE há a consoante D no meio, então não é encontro de vogais nenhum. O erro mora em "dois". Toque nele.',
    }),
    completeLacuna({
      frase:
        'Em "família", o IA de "lia" forma um ___ porque as duas vogais estão na mesma sílaba.',
      opcoes: ["ditongo", "hiato", "tritongo"],
      correta: 0,
      explicacao:
        'Fa-MÍ-lia: o I e o A de "lia" moram juntos na mesma sílaba, formando um ditongo crescente (fraca antes de forte). Quando as vogais dividem a sílaba, é ditongo; quando cada uma tem sílaba própria, é hiato.',
    }),
    multiplaEscolha({
      pergunta: 'Quantos hiatos há na palavra "poeta"?',
      opcoes: [
        "Nenhum: PO-E-TA não tem encontro vocálico",
        "Um: o O e o E estão em sílabas diferentes (PO-E-TA)",
        "Dois: cada vogal forma um hiato com a seguinte",
      ],
      correta: 1,
      explicacao:
        "Po-E-ta: o O termina a primeira sílaba e o E começa a segunda, vogais vizinhas em sílabas diferentes. Isso é hiato, e só existe um nessa palavra.",
    }),
    interpretacao({
      texto:
        'Os encontros vocálicos são fundamentais para a silabação em português. Um ditongo permanece unido na mesma sílaba, enquanto um hiato divide vogais em sílabas distintas. A diferença não é apenas gráfica, mas afeta a pronúncia e a acentuação. Por exemplo, "moeda" é MO-E-DA (hiato, sem acento) porque o O e E estão separados, enquanto "couro" é COU-RO (ditongo) porque o OU permanece unido.',
      pergunta: "De acordo com o texto, qual é o impacto do ditongo e do hiato?",
      opcoes: [
        "Afetam apenas a escrita, não a pronúncia",
        "Afetam a silabação, pronúncia e acentuação",
        "São conceitos apenas teóricos sem aplicação prática",
      ],
      correta: 1,
      explicacao:
        "Exato. Ditongo e hiato não são só curiosidade: eles determinam onde você corta a sílaba, como pronuncia e se precisa acento. Na prova, silabação errada leva a erros em separação de sílabas e em acentuação. Presta atenção neles.",
    }),
  ],
});

import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const encontrosConsoantaisDigrafos = defineLesson({
  id: "fonologia-ortografia-03-encontros-consonantais-digrafos",
  titulo: "Encontros consonantais e dígrafos",
  descricao:
    "Quando consoantes se encontram: na mesma sílaba ou em sílabas diferentes, e quando duas letras fazem um som.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um encontro consonantal?",
      opcoes: [
        "Uma consoante seguida de uma vogal",
        "Duas consoantes juntas, na mesma sílaba ou em sílabas diferentes",
        "Qualquer sequência de letras na palavra",
      ],
      correta: 1,
      explicacao:
        'Encontro consonantal é duas consoantes cônjugas. "Prazo" tem PR juntas na mesma sílaba. "Perspectiva" tem R em uma sílaba e P em outra. Ambas são encontros consonantais.',
    }),
    multiplaEscolha({
      pergunta: "Qual é a diferença entre encontro consonantal e dígrafo?",
      opcoes: [
        "Não há diferença, os termos são sinônimos",
        "Encontro consonantal é duas consoantes na mesma sílaba; dígrafo é duas letras que fazem um único som",
        "Dígrafo é mais raro que encontro consonantal",
      ],
      correta: 1,
      explicacao:
        'Encontro consonantal é estrutura: PR em "prazo" (dois sons). Dígrafo é duas letras UM som: "chave" tem CH (som único /x/), "ninho" tem NH (som único /nh/). Um conceito é silábico, o outro é fonético.',
    }),
    parear({
      pares: [
        { a: 'CH em "chave"', b: "Dígrafo (duas letras, um som)" },
        { a: 'BR em "bravo"', b: "Encontro consonantal (dois sons)" },
        { a: 'RR em "carro"', b: "Dígrafo (duas letras, um som /r/)" },
      ],
      explicacao:
        "Dígrafos mais comuns: CH, LH, NH, RR, SS, SC, SÇ, XC, XS. Encontros: BR, CR, DR, FR, GR, PR, TR, BL, CL, FL, GL, PL, VR, etc. O som define qual é qual.",
    }),
    verdadeiroFalso({
      afirmacao: 'A palavra "psicologia" tem um encontro consonantal no início com PS.',
      verdadeiro: true,
      explicacao:
        "Sim. PS é um encontro consonantal clássico de início de palavra, junto com PN (pneu), GN (gnomo) e MN (mnemônico). Muita gente engole o P na fala do dia a dia, mas na norma culta ele continua fazendo parte do encontro.",
    }),
    encontreOErro({
      frase: "Os dígrafos SS e RR sempre separam o som em duas sílabas diferentes.",
      erroIndex: 8,
      explicacao:
        'Contando: Os(0) dígrafos(1) SS(2) e(3) RR(4) sempre(5) separam(6) o(7) som(8) em(9) duas(10) sílabas(11) diferentes(12). SS e RR realmente dividem a ESCRITA em duas sílabas ("pas-se", "car-ro"), mas o SOM continua um só: /s/, /R/. Quem erra aqui é "som", ele não se separa, só a grafia se divide. Toque em "som".',
    }),
    completeLacuna({
      frase: 'Em "nasce", o SC forma um ___ porque as duas letras representam um único som, o /s/.',
      opcoes: ["dígrafo", "encontro consonantal", "hiato"],
      correta: 0,
      explicacao:
        "Dígrafo. SC antes de E ou I (nasce, cresça, desço) é duas letras fazendo um som só, igual CH, LH, NH, RR, SS, SÇ, XC e XS.",
    }),
    multiplaEscolha({
      pergunta: "Em qual palavra encontramos DOIS dígrafos?",
      opcoes: [
        "Cachorro (CH + RR: dois dígrafos)",
        "Choque (só CH: um dígrafo)",
        "Ninho (só NH: um dígrafo)",
      ],
      correta: 0,
      explicacao:
        'Cachorro tem CH ("cacho") e RR ("carro"): dois dígrafos na mesma palavra. Choque e ninho têm só um cada.',
    }),
    interpretacao({
      texto:
        'Na separação de sílabas, encontros consonantais e dígrafos têm regras diferentes. Encontros consonantais nunca se separam: "prato" é PRA-TO, não P-RA-TO. Mas dígrafos podem ser divididos: "carro" é CAR-RO, o primeiro R fica com a sílaba anterior. Essas regras importam na pronúncia e na estética de linha em textos justificados.',
      pergunta: "Segundo o texto, como se separam encontros consonantais e dígrafos?",
      opcoes: [
        "Encontros não se separam; dígrafos podem ser divididos",
        "Ambos se separam igualmente",
        "Dígrafos nunca se separam; encontros podem ser divididos",
      ],
      correta: 0,
      explicacao:
        "Isso. Encontro consonantal viaja inteiro pra próxima sílaba: AT-LAS, AT-MÓSFERA. Dígrafo: o segundo símbolo fica com a sílaba anterior: CAR-RO, PAS-SO. Regra que vira questão de prova toda hora.",
    }),
  ],
});

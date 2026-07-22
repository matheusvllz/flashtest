import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const regrasAcentuacao = defineLesson({
  id: "fonologia-ortografia-06-regras-acentuacao",
  titulo: "Regras de acentuação",
  descricao:
    "As regras principais: oxítonas, paroxítonas terminadas em I/US/R/L/N, proparoxítonas.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual regra de acentuação está correta?",
      opcoes: [
        "Paroxítonas terminadas em R sempre recebem acento",
        "Oxítonas terminadas em A, E, O recebem acento",
        "Paroxítonas terminadas em S nunca recebem acento",
      ],
      correta: 1,
      explicacao:
        'Oxítonas em A, E, O levam acento: sofá, café, sapato. Essa é a regra madre. Cuidado pra não confundir com paroxítona terminada em R, que sempre recebe acento (açúcar, cadáver): "professor" não entra nessa conta porque é oxítona, e por isso fica sem acento.',
    }),
    multiplaEscolha({
      pergunta: "Qual palavra está acentuada erradamente?",
      opcoes: [
        "Hábito (proparoxítona, sempre acentuada)",
        "Sábia (paroxítona terminada em ditongo)",
        "Vírtude (paroxítona em E)",
      ],
      correta: 2,
      explicacao:
        'Vírtude com acento não existe. O certo é "virtude", paroxítona terminada em E simples, sem acento (igual "pele", "chave"). Hábito e sábia levam acento de verdade: hábito é proparoxítona (sempre acentuada) e sábia termina em ditongo (também acentuada).',
    }),
    parear({
      pares: [
        { a: "Sofá, café, paletó", b: "Oxítonas em A, E, O" },
        { a: "Público, tímido, lâmpada", b: "Proparoxítonas (sempre)" },
        { a: "Lápis, vírus, táxi", b: "Paroxítonas em I/S/X" },
      ],
      explicacao:
        "Oxítona em A/E/O: regra clara. Proparoxítona: 100% acentuada sempre. Paroxítona: mais complexa, mas I/S/X/PS/L/N/R/-ÃO/-ÃE recebem.",
    }),
    verdadeiroFalso({
      afirmacao: "Palavras paroxítonas terminadas em consoante sempre recebem acento.",
      verdadeiro: false,
      explicacao:
        'Não sempre. Muita paroxítona termina em consoante sem acento: "jovem", "imagem", "homem" (a terminação -EM de paroxítona não acentua). Já "açúcar" e "cadáver", paroxítonas terminadas em R, levam acento sempre. E cuidado: "professor" não entra nesse debate, ele é oxítona.',
    }),
    encontreOErro({
      frase:
        'As palavras "fácil", "hábil" e "reptil" são paroxítonas terminadas em IL e por isso levam acento.',
      erroIndex: 5,
      explicacao:
        'Contando: As(0) palavras(1) "fácil",(2) "hábil"(3) e(4) "reptil"(5) são(6) paroxítonas(7) terminadas(8) em(9) IL(10) e(11) por(12) isso(13) levam(14) acento.(15). Faltou o acento em "reptil": o certo é "réptil". Toda paroxítona terminada em IL leva acento sem exceção: fácil, hábil, réptil, fóssil, míssil. Toque em "reptil".',
    }),
    completeLacuna({
      frase:
        "Uma palavra oxítona terminada em consoante (menos A, E, O, EM/ENS) ___ recebe acento.",
      opcoes: ["sempre", "nunca", "às vezes"],
      correta: 1,
      explicacao:
        'Nunca. Oxítona em consoante diferente de A, E, O, EM ou ENS não recebe acento: "amor", "sinal", "feliz". Já as oxítonas em EM/ENS, tipo "também" e "parabéns", são um caso à parte que também acentua.',
    }),
    multiplaEscolha({
      pergunta: "Qual palavra segue corretamente as regras de acentuação?",
      opcoes: [
        "Cáfé (acento fora, é café)",
        "Próximo (proparoxítona, acento correto)",
        "Você (oxítona em E, acento correto)",
      ],
      correta: 2,
      explicacao:
        'Você é oxítona em E (vo-CÊ), e oxítonas em E recebem acento. Próximo é proparoxítona (PRÓ-xi-mo), sempre acentuada, sem exceção. Café é oxítona em E e leva acento, não "cáfé".',
    }),
    interpretacao({
      texto:
        "As regras de acentuação gráfica do português não são caprichosas, mas obedecem a uma lógica de frequência e distinção. Proparoxítonas recebem acento 100% porque são raras. Oxítonas em vogal recebem acento porque é padrão menos comum em português. Paroxítonas, sendo o padrão natural, só recebem acento quando o final é ambíguo (terminação rara como I, US, R etc.). Essa economia de marcas garante que, ao ver um acento, você já sabe algo sobre a estrutura da palavra.",
      pergunta: "Por que proparoxítonas recebem acento 100% das vezes?",
      opcoes: [
        "Porque é uma regra histórica sem justificativa prática",
        "Porque são raras e o acento marca essa raridade",
        "Porque facilita a tradução para outras línguas",
      ],
      correta: 1,
      explicacao:
        "Exato. Proparoxítona é rara no português natural (vem de latim, grego, palavras técnicas). O acento MARCA essa estranheza. Quando você vê acento na antepenúltima, sabe que é coisa rara. Eficiência pura.",
    }),
  ],
});

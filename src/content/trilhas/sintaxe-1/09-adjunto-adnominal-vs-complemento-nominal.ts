import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

/**
 * Lição 09: Adjunto adnominal vs complemento nominal
 */
export const adjuntoAdnominalVsComplementoNominal = defineLesson({
  id: "sintaxe-1-09-adjunto-adnominal-vs-complemento-nominal",
  titulo: "Adjunto adnominal vs complemento nominal",
  descricao: "Como distinguir um do outro e nunca mais cair na confusão.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a diferença essencial entre adjunto adnominal e complemento nominal?",
      opcoes: [
        "Adjunto é opcional, complemento é necessário para fazer sentido",
        "Complemento é opcional, adjunto é sempre necessário",
        "Não há diferença, são sinônimos",
      ],
      correta: 0,
      explicacao:
        'Adjunto adnominal é luxo, enfeite: "casa azul" sem "azul" ainda é casa. Complemento nominal é alicerce: "esperança em deus" sem "em deus" deixa a frase manca. Um alimenta, o outro decora.',
    }),
    multiplaEscolha({
      pergunta: 'Em "O livro de ficção científica", o que é "de ficção científica"?',
      opcoes: [
        "Adjunto adnominal (especifica o tipo de livro)",
        'Complemento nominal (completa "livro")',
        "Nenhum dos dois",
      ],
      correta: 0,
      explicacao:
        'É adjunto: especifica, qualifica, enfeita. Sem ele, "livro" continua existindo. "Livro" é nome que não precisa de complemento, é autossuficiente. Adjunto o decora, expande.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Substantivos abstratos derivados de adjetivo ou verbo (como "esperança", "medo") costumam pedir complemento nominal para fechar o sentido.',
      verdadeiro: true,
      explicacao:
        'Verdadeiro. Nomes como "esperança", "medo", "ódio", "amor" vêm de adjetivos ou verbos e tendem a puxar complemento pra especificar do quê se trata. "Esperança de", "medo de", "ódio de".',
    }),
    completeLacuna({
      frase: 'Em "Água de coco fresco", "de coco" é ___ porque apenas especifica o tipo de água.',
      opcoes: ["adjunto adnominal", "complemento nominal", "objeto indireto"],
      correta: 0,
      explicacao:
        'Água é substantivo concreto, autossuficiente. "De coco" não completa seu sentido, apenas detalha: água de qual tipo? Luxo sintático, não necessidade.',
    }),
    encontreOErro({
      frase: "O respeito de hierarquia é fundamental em qualquer instituição.",
      erroIndex: 2,
      explicacao:
        'Respeito é nome que EXIGE complemento nominal: "respeito pela hierarquia" ou "respeito à hierarquia", não "respeito de". A preposição "a" ou "por" é exigida.',
    }),
    parear({
      instrucao: "Classifique cada termo ligado ao nome",
      pares: [
        { a: "Casa branca", b: "Adjunto adnominal" },
        { a: "Esperança em vida", b: "Complemento nominal" },
      ],
      explicacao:
        'Branca qualifica sem ser necessária: é adjunto. "Em vida" completa "esperança", é necessário: é complemento. Luxo vs. alicerce.',
    }),
    verdadeiroFalso({
      afirmacao: "Um adjunto adnominal sempre tem preposição.",
      verdadeiro: false,
      explicacao:
        'Falso. Adjunto pode vir sem preposição: "casa branca". Complemento nominal SEMPRE tem preposição. Essa é marca distintiva: complemento = preposição obrigatória.',
    }),
    interpretacao({
      texto:
        'A confusão entre adjunto e complemento é tão comum que até linguistas discutem casos limítrofes. Mas o redator que a resolve tem textos mais firmes. "Medo de escuro" é complemento nominal: escuro completa medo. "Escuro profundo" seria adjunto (se escuro fosse nome; aqui é adjetivo modificando adjetivo). O ouvido que treina sente: um soa incompleto sem o complemento, outro soa gordo demais com os adjuntos desnecessários. Estrutura é equilíbrio.',
      pergunta: "Conforme o texto, qual é o sinal prático para diferenciar adjunto de complemento?",
      opcoes: [
        "O complemento é necessário para completar sentido; adjunto é dispensável",
        "Complemento sempre vem antes do nome; adjunto vem depois",
        "Não há diferença prática, só teórica",
      ],
      correta: 0,
      explicacao:
        "Necessidade vs. ornamento. Complemento = estrutura. Adjunto = decoração. O redator que enxerga essa diferença controla o peso de cada frase, constrói com eficiência.",
    }),
  ],
});

import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

export const hifen = defineLesson({
  id: "fonologia-ortografia-12-hifen",
  titulo: "Hífen",
  descricao: "Quando usar hífen em palavras compostas, prefixos e em quebra de linha.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Em qual situação o hífen é OBRIGATÓRIO?",
      opcoes: [
        "Sempre no meio de uma palavra composta",
        "Quando um prefixo termina e a palavra seguinte começa com a mesma vogal (ex.: micro-ondas, anti-inflamatório)",
        "Nunca é obrigatório, é opcional",
      ],
      correta: 1,
      explicacao:
        'Micro-ondas tem hífen porque o prefixo "micro" termina em O e "ondas" começa com O: a mesma vogal se encontraria e a leitura ficaria confusa sem separação. É uma das regras de hífen que sobreviveram ao Acordo de 1990.',
    }),
    multiplaEscolha({
      pergunta: "Qual palavra está grafada corretamente?",
      opcoes: [
        "Semi-analfabeto (sem hífen, por ser prefixo)",
        "Semiconsciente (sem hífen, não há encontro de vogais)",
        "Contrassenso (com hífen por semelhança com contra-senso)",
      ],
      correta: 1,
      explicacao:
        'Semiconsciente: não há encontro vocálico (E+CO = não é colisão). "Semi" + consoante = sem hífen. "Semi" + vogal = com hífen (semi-árido). "Contrassenso" historicamente é uma palavra, não precisa hífen regularmente.',
    }),
    parear({
      pares: [
        { a: "Guarda-chuva", b: "Composto lexicalizado, hífen por tradição do dicionário" },
        { a: "Coexistir", b: "Prefixo CO sempre junto, mesmo antes de vogal (sem hífen)" },
        { a: "Pré-história", b: "Prefixo antes de H ou vogal acentuada (sempre hífen)" },
      ],
      explicacao:
        'Guarda-chuva é composto que o dicionário registra com hífen, sem regra fonética por trás. Coexistir foge da regra geral: co-, re- e pro- ficam sempre grudados, mesmo diante de vogal igual. Pré-história leva hífen porque "pré" é prefixo tônico acentuado e "história" começa com H.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Segundo a reforma ortográfica de 1990, o hífen foi eliminado de todas as palavras compostas.",
      verdadeiro: false,
      explicacao:
        'Não, foi reduzido, não eliminado. A reforma mexeu principalmente nas regras de prefixo: hoje o hífen é obrigatório diante de H (pré-história) ou quando o prefixo termina na mesma vogal do elemento seguinte (micro-ondas, anti-inflamatório). Compostos antigos já consolidados, como "guarda-chuva" e "guarda-roupa", mantiveram o hífen por tradição.',
    }),
    encontreOErro({
      frase: "Os contrassenhos usados na escola eram verificados frequentemente pela coordenação.",
      erroIndex: 1,
      explicacao:
        'Contando: Os(0) contrassenhos(1) usados(2) na(3) escola(4) eram(5) verificados(6) frequentemente(7) pela(8) coordenação(9). O erro mora em "contrassenhos" (índice 1): "senha" é palavra feminina, então o certo é "contrassenhas", com SS dobrado (igual "contrassenso") e sem hífen. "Contrassenho" no masculino não existe. Toque nele.',
    }),
    completeLacuna({
      frase:
        'As palavras "bem-vindo" e "___ -vindo" podem ser ligadas com hífen quando indicam um conceito único.',
      opcoes: ["mal", "mau", "mausvindo"],
      correta: 0,
      explicacao:
        'Mal-vindo (malvindo, de origem antiga). Bem-vindo tem hífen porque é um adjetivo composto que funciona como unidade semântica (significa "recebido com satisfação"). Mau-vindo seria menos usado, mas Mal-vindo está correto.',
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa tem USO CORRETO do hífen em compostos?",
      opcoes: [
        "Médico-cirurgião (profissão dupla, hífen correto)",
        "Segunda-feira (composição temporal, hífen correto)",
        "Ambas estão corretas",
      ],
      correta: 2,
      explicacao:
        'Ambas: "médico-cirurgião" é composto que forma uma unidade profissional (hífen), "segunda-feira" é composto de dias, unidade de tempo (hífen). Ambos mantiveram hífen na reforma de 1990.',
    }),
    interpretacao({
      texto:
        'O hífen em português cumpre função pragmática: evita ambiguidades de leitura, marca compostos que ainda produzem novos termos, e clareia o sentido. A reforma de 1990 não eliminou o hífen, mas reduziu seu uso, principalmente nas regras de prefixo: hoje ele só é obrigatório diante de H (pré-história) ou quando o prefixo termina na mesma vogal com que o próximo elemento começa (micro-ondas, anti-inflamatório). Compostos antigos já consolidados, como "guarda-chuva" e "guarda-roupa", mantiveram o hífen por tradição, mesmo sem essas condições fonéticas.',
      pergunta: "Qual é a função principal do hífen após a reforma ortográfica de 1990?",
      opcoes: [
        "Apenas efeito estético, sem função real",
        "Clarear leitura de compostos ainda vivos e evitar ambiguidades",
        "Marcar todas as palavras derivadas de prefixos",
      ],
      correta: 1,
      explicacao:
        'Exato. Hífen hoje serve sobretudo pra evitar que duas vogais iguais se encontrem (micro-ondas) ou pra separar de um H (pré-história). Compostos antigos como "guarda-chuva" mantiveram o hífen por tradição do dicionário, não por uma regra fonética viva.',
    }),
  ],
});

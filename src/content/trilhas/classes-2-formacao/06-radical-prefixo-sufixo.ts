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
 * Lição 06: Radical, prefixo e sufixo
 * Tópico: Componentes da estrutura das palavras
 */
export const radicalPrefixoSufixo = defineLesson({
  id: "classes-2-formacao-06-radical-prefixo-sufixo",
  titulo: "Radical, prefixo e sufixo",
  descricao: "Componentes que formam a estrutura das palavras.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é o radical de uma palavra?",
      opcoes: [
        "A parte que carrega o significado central da palavra",
        "O som no início da palavra",
        "A terminação que marca plural",
      ],
      correta: 0,
      explicacao:
        'Radical é o coração da palavra: ele carrega o sentido. "Flor", "cabel", "livr" são radicais. Tudo o mais é adorno, modificação ou informação gramatical.',
    }),
    parear({
      instrucao: "Combine cada termo com seu papel na estrutura da palavra",
      pares: [
        { a: "Radical", b: "Carrega o significado central" },
        { a: "Prefixo", b: "Vem antes do radical, modifica sentido" },
        { a: "Sufixo", b: "Vem depois do radical, pode mudar classe" },
      ],
      explicacao:
        "Radical é o tronco; prefixo e sufixo são galhos. Juntos formam a estrutura total. Tirar o radical, a palavra morre de sentido.",
    }),
    completeLacuna({
      frase: 'A palavra "infeliz" tem prefixo ___ e radical "feliz".',
      opcoes: ["in-", "des-", "re-"],
      correta: 0,
      explicacao:
        '"In-" é o prefixo que nega: in + feliz = não-feliz. "Des-" e "re-" existem, mas aqui "in-" é o que torna a palavra infeliz.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Prefixos e sufixos têm significados próprios que modificam ou expandem o sentido do radical.",
      verdadeiro: true,
      explicacao:
        'Sim. "Re-" significa repetição (refazer = fazer de novo), "in-" significa negação (infeliz = não feliz), "-idade" significa qualidade (felicidade = qualidade de feliz). Cada peça tem papel.',
    }),
    multiplaEscolha({
      pergunta: 'Qual palavra tem prefixo "des-" que indica negação ou oposição?',
      opcoes: ["Desfazer", "Desculpa", "Descansar"],
      correta: 0,
      explicacao:
        'Em "desfazer", "des-" marca oposição: desfazer = fazer o oposto, anular. "Desculpa" e "descansar" têm "des-" mas com valores semânticos diferentes (afastamento, mudança de estado).',
    }),
    encontreOErro({
      frase: 'A palavra "antiinflamatório" tem radical "inflamatório" e prefixo "anti", sem hífen.',
      erroIndex: 2,
      explicacao:
        'Quando o prefixo termina na mesma vogal com que começa o radical, coloca-se hífen: o certo é "anti-inflamatório". Já com "re-" ou "pre-", a regra é outra: "reaprender" e "preencher" se escrevem juntos, sem hífen, mesmo dobrando a vogal.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Alguns sufixos mudam a classe gramatical da palavra, como "-mente" que transforma adjetivos em advérbios.',
      verdadeiro: true,
      explicacao:
        '"Rápido" é adjetivo; "rapidamente" é advérbio. O sufixo "-mente" faz essa mudança de classe. Mesmo radical, sufixo diferente = papel gramatical diferente.',
    }),
    interpretacao({
      texto:
        'A estrutura interna das palavras é um mapa de sentidos. Quando você vê "reconstruir", seu cérebro decodifica: "re-" (de novo) + "construir" (edificar). Quando encontra "impossível", lê: "im-" (negação) + "possível" (viável). Essa decodificação é automática para quem domina prefixos e sufixos. No ENEM, compreender a estrutura das palavras ajuda tanto na interpretação de textos (o que a palavra quer dizer) quanto na produção de vocabulário variado e preciso.',
      pergunta:
        "Qual benefício há em dominar a estrutura interna das palavras (radical, prefixo, sufixo)?",
      opcoes: [
        "Ajuda a decodificar significados e expandir vocabulário de forma consciente",
        "Torna a redação mais bonita",
        "Elimina a necessidade de dicionário",
      ],
      correta: 0,
      explicacao:
        'Decodificação de estrutura = compreensão de sentidos novos e precisão vocabular. "Reconstruir" você lê como "construir de novo" sem pensar. No ENEM, isso é ganho de velocidade e compreensão.',
    }),
    multiplaEscolha({
      pergunta: 'Qual é o radical da palavra "desconfortável"?',
      opcoes: ["confort", "des", "desconfort"],
      correta: 0,
      explicacao:
        'O radical é "confort" (vem do francês "confort"). "Des-" é prefixo, "-ável" é sufixo. Sem o radical, a palavra não teria sentido. Prefixo e sufixo apenas modificam.',
    }),
  ],
});

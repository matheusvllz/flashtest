import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  ordenar,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 04: Subordinadas adverbiais (9 circunstâncias)
 */
export const subordinadasAdverbiais = defineLesson({
  id: "sintaxe-2-04-subordinadas-adverbiais",
  titulo: "Subordinadas adverbiais: as 9 circunstâncias",
  descricao: "Orações que modificam o verbo, adicionando tempo, causa, condição e mais.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma subordinada adverbial?",
      opcoes: [
        "Uma oração que funciona como adjetivo de um nome",
        "Uma oração que funciona como advérbio, modificando o verbo",
        "Uma oração que sempre leva conjunção integrante",
      ],
      correta: 1,
      explicacao:
        "Adverbial modifica o verbo, adicionando circunstância: tempo (quando), causa (porque), condição (se), finalidade (para que). É o alicerce que estrutura o clima, o ritmo, as condições da ação principal.",
    }),
    verdadeiroFalso({
      afirmacao: 'Em "Embora chovesse, ele saiu de casa", a oração "embora chovesse" é concessiva.',
      verdadeiro: true,
      explicacao:
        'Concessiva marca uma objeção, uma dificuldade que não impede a ação. "Embora chovesse" = apesar da chuva. O sujeito saiu mesmo assim. Embora, conquanto, ainda que marcam essa resistência.',
    }),
    parear({
      pares: [
        { a: "Quando você terminar, avise-me.", b: "Temporal" },
        { a: "Estudo para que meu futuro seja melhor.", b: "Final" },
        { a: "Como você pediu, fiz exatamente assim.", b: "Conformativa" },
        { a: "Se não chover, iremos ao parque.", b: "Condicional" },
        { a: "Porque estudou bem, passou com louvor.", b: "Causal" },
      ],
      explicacao:
        "Temporal marca quando. Final marca para quê. Conformativa marca conforme (segundo regra). Condicional marca se (sob condição). Causal marca porque (razão). Cada uma estrutura a frase de forma diferente.",
    }),
    encontreOErro({
      frase: "Na medida que você estuda, sua nota aumenta proporcionalmente.",
      erroIndex: 1,
      explicacao:
        '"Na medida que", sem o "em", não existe na norma culta. O certo é "na medida EM que" ou "à medida que", as formas usadas para marcar proporção. Faltou o "em" logo depois de "medida".',
    }),
    completeLacuna({
      frase: "___ você não faça o trabalho agora, arrepender-se-á mais tarde.",
      opcoes: ["Quando", "Se", "Caso"],
      correta: 2,
      explicacao:
        '"Caso" pede o subjuntivo presente ("faça"), como aqui. "Se", nesse mesmo sentido de hipótese futura, pede o futuro do subjuntivo ("Se você não fizer"), não o presente. Por isso "Caso você não faça" soa correto. "Quando" é temporal, não marca hipótese.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase exemplifica uma subordinada adverbial comparativa?",
      opcoes: [
        "Estou cansado assim como você está.",
        "Estudo porque quero passar de ano.",
        "Assim que chegar, ligo para você.",
      ],
      correta: 0,
      explicacao:
        'Comparativa marca semelhança entre duas ações. "Assim como você" estabelece uma equivalência. Causal (porque) marca razão, temporal (assim que) marca momento. São estruturas diferentes.',
    }),
    ordenar({
      blocos: [
        "Sua redação foi",
        "uma consequência lógica",
        "da dedicação que você teve,",
        "de forma que ficou excelente.",
      ],
      explicacao:
        'A oração "de forma que ficou excelente" é consecutiva: marca o resultado esperado de um fato anterior. Consecutiva estrutura ação e sua consequência necessária.',
    }),
    interpretacao({
      texto:
        'As subordinadas adverbiais são o motor do ritmo em uma redação. Enquanto uma causal ("porque o Brasil tem déficit educacional") fundamenta um argumento, uma concessiva ("ainda que existam políticas públicas") reconhece a complexidade. Temporal ("quando o aluno ingressa na universidade") situa o leitor. Finalidade ("para que nenhum caia na armadilha") marca propósito. Cada uma constrói uma dimensão diferente da ideia.',
      pergunta: "Qual é o papel das adverbiais na estrutura de um argumento?",
      opcoes: [
        "Apenas criar pausa para o leitor respirar",
        "Estruturar causa, condição, tempo e propósito da ação",
        "Substituir adjetivos quando eles não cabem",
      ],
      correta: 1,
      explicacao:
        "Adverbiais não são enfeite: são o alicerce que sustenta a lógica de um argumento. Causal explica por quê, temporal situa quando, condicional marca se, final marca para quê. Dominá-las é construir persuasão.",
    }),
    encontreOErro({
      frase: "Conforme com o artigo 5º da Constituição, todos são iguais perante a lei.",
      erroIndex: 1,
      explicacao:
        '"Conforme" já significa "de acordo com": não precisa do "com" depois. O certo é só "Conforme o artigo 5º" ou "De acordo com o artigo 5º", nunca as duas formas juntas.',
    }),
    verdadeiroFalso({
      afirmacao: "Uma subordinada consecutiva marca uma condição que pode ou não acontecer.",
      verdadeiro: false,
      explicacao:
        'Consecutiva marca resultado necessário de um fato: "Choveu tanto que o rio transbordou". Condicional marca possibilidade: "Se chover, o rio pode transbordar". Não confunda as duas.',
    }),
  ],
});

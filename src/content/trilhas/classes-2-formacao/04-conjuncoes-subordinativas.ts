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
 * Lição 04: Conjunções subordinativas
 * Tópico: Palavras que criam dependência entre orações
 */
export const conjuncoesSubordinativas = defineLesson({
  id: "classes-2-formacao-04-conjuncoes-subordinativas",
  titulo: "Conjunções subordinativas",
  descricao: "Palavras que subordinam uma oração a outra, criando dependência.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma conjunção subordinativa?",
      opcoes: [
        "Uma palavra que torna uma oração dependente de outra, criando hierarquia",
        "Uma palavra que une dois verbos na mesma oração",
        "Um tipo de pontuação que marca pausas longas",
      ],
      correta: 0,
      explicacao:
        "Subordinativa é a conjunção do comando: ela torna uma oração servil à outra. A oração subordinada não existe sozinha; ela depende da principal para fazer sentido.",
    }),
    parear({
      instrucao: "Combine cada conjunção subordinativa com seu tipo de relação",
      pares: [
        { a: "porque / já que / uma vez que", b: "Causa" },
        { a: "se / caso / contanto que", b: "Condição" },
        { a: "embora / ainda que / conquanto", b: "Concessão" },
        { a: "quando / enquanto / logo que", b: "Tempo" },
      ],
      explicacao:
        "Cada subordinativa abre uma lógica diferente: porque explica causa, se marca condição, embora confronta, quando situa no tempo. A relação é hierárquica: a principal comanda.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Uma oração subordinada pode existir sozinha sem a oração principal e fazer sentido completo.",
      verdadeiro: false,
      explicacao:
        'Nunca. Subordinada é dependente por definição. "Se chovesse..." fica em aberto. "Quando chegou..." precisa de mais contexto. Ela só fecha sentido abraçada pela principal.',
    }),
    completeLacuna({
      frase: "Não saí de casa ___ estava muito cansada.",
      opcoes: ["porque", "se", "quando"],
      correta: 0,
      explicacao:
        'A causal "porque" é a certa: ela explica o motivo de não ter saído. "Se" marcaria condição futura, "quando" marcaria tempo. A causa é o que se encaixa aqui.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase diferencia corretamente coordenação de subordinação?",
      opcoes: [
        "Ela estudou muito e passou no exame. / Ela passou no exame porque estudou muito.",
        "Ela dormiu cedo e acordou tarde. / Ela acordou porque dormiu cedo.",
        "Ambas as frases têm estrutura idêntica.",
      ],
      correta: 0,
      explicacao:
        'Na primeira, "e" une dois fatos iguais em peso. Na segunda, "porque" torna um fato explicação do outro. Uma é democrática, a outra é hierárquica. Sentidos bem diferentes.',
    }),
    encontreOErro({
      frase: "Embora tivesse estudado bastante, não conseguir passar.",
      erroIndex: 5,
      explicacao:
        'Erro de concordância verbal: "não conseguir" deveria ser "não conseguiu" para alinhar com "tivesse estudado". A subordinativa exige concordância, não infinitivo frouxo.',
    }),
    verdadeiroFalso({
      afirmacao:
        'A conjunção subordinativa "que" é tão versátil que pode marcar causa, condição, tempo e propósito ao mesmo tempo.',
      verdadeiro: false,
      explicacao:
        '"Que" é versátil, sim, mas cada uso marca um contexto específico. Contexto define: "Fiz tudo para que você entendesse" (propósito) é diferente de "Sei que você entendeu" (completiva). Não é ambíguo, é flexível.',
    }),
    interpretacao({
      texto:
        'A subordinação é a chave da sofisticação sintática. Enquanto um iniciante encadeia fatos com "e", "e", "e" (parataxe), um escritor experiente cria hierarquias com subordinadas: causa explica efeito, condição modula ação, concessão matiza certezas. No ENEM, um parágrafo com subordinadas bem construídas revela pensamento estruturado e vocabulário de conectivos variado. É a diferença entre "Saí porque choveu" e "Embora chovesse, saí."',
      pergunta:
        'Por que a subordinação é considerada mais sofisticada que a parataxe (encadeamento com "e")?',
      opcoes: [
        "Porque cria hierarquias entre ideias e revela pensamento estruturado",
        "Porque usa mais palavras",
        "Porque é mais fácil de aprender",
      ],
      correta: 0,
      explicacao:
        "Subordinação mostra que você controla nuances: causa, condição, concessão. Parataxe é acúmulo simples. No ENEM, sofisticação de conectivos = clareza de pensamento.",
    }),
    multiplaEscolha({
      pergunta: "Qual oração subordinada está introduzida corretamente?",
      opcoes: [
        "Ele desistiu do projeto contanto que recebesse apoio financeiro.",
        "Ele continuou confiante ainda que tivesse enfrentado dificuldades.",
        "Ele trabalhou duro embora de que não havia garantia de sucesso.",
      ],
      correta: 1,
      explicacao:
        'Em B, "ainda que" + subjuntivo (tivesse) é perfeito: marca concessão. A é contraditória (contanto que = condição de sim, não de abandono). C tem erro de estrutura: "de que" não combina com "embora".',
    }),
  ],
});

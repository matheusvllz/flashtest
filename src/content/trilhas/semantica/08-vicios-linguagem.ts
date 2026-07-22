import {
  defineLesson,
  encontreOErro,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
  interpretacao,
  completeLacuna,
} from "@/lib/lessons/define";

/**
 * Vícios de linguagem: erros semânticos e estilísticos que enfraquecem a redação.
 * Solecismo, pleonasmo, barbarismo, ambiguidade não intencional, etc.
 */
export const viciosLinguagem = defineLesson({
  id: "semantica-08-vicios-linguagem",
  titulo: "Vícios de linguagem",
  descricao: "Erros semânticos e estilísticos que enfraquecem a estrutura do texto.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é pleonasmo vicioso?",
      opcoes: [
        "Repetição desnecessária de uma mesma ideia com palavras diferentes",
        "Uma comparação fraca entre duas coisas",
        "Uma inversão da ordem gramatical das palavras",
      ],
      correta: 0,
      explicacao:
        'Pleonasmo vicioso é dizer "subir para cima", "descer para baixo", "elo de ligação". A ideia já está em "subir" e "descer". A repetição enfraquece o alicerce: você não constrói, apenas ecoa. Evite.',
    }),
    encontreOErro({
      frase: "Ele voltou a regressar para casa no final da tarde.",
      erroIndex: 3,
      explicacao:
        'Voltou e regressar significam o mesmo: duplicação desnecessária. Escolha uma. "Ele voltou para casa" ou "Ele regressou para casa". A repetição de conceito enfraquece a estrutura.',
    }),
    verdadeiroFalso({
      afirmacao: "Barbarismo é o uso de uma palavra que não existe na língua ou é mal formada.",
      verdadeiro: true,
      explicacao:
        'Barbarismo: "muvuca" em lugar de "misturada", "lotar" em lugar de "locar" (derivação errada de "lote"). Essas palavras não existem ou são deformações. O alicerce se quebra quando você usa construções que a língua não admite.',
    }),
    parear({
      instrucao: "Combine cada vício com um exemplo",
      pares: [
        { a: "Solecismo", b: "Eu vi ele saindo de casa." },
        { a: "Ambiguidade não intencional", b: "Encontrei meu amigo e sua bolsa caiu." },
        { a: "Pleonasmo vicioso", b: "Subir para cima da cadeira." },
      ],
      explicacao:
        "Solecismo é erro de concordância ou regência. Ambiguidade é confusão sobre quem fez o quê. Pleonasmo é repetição desnecessária. Cada um enfraquece de forma diferente.",
    }),
    multiplaEscolha({
      pergunta: "Em qual frase há solecismo?",
      opcoes: [
        "Fazem dois anos que ele se formou.",
        "A maioria dos candidatos chegou cedo.",
        "Todos concordaram com o novo plano.",
      ],
      correta: 0,
      explicacao:
        'A primeira tem solecismo de concordância: "fazer" indicando tempo decorrido é verbo impessoal e fica sempre no singular. O certo é "Faz dois anos que ele se formou". As outras duas seguem a norma culta sem desvio.',
    }),
    completeLacuna({
      frase: "A ___ do novo presidente gerou muito debate sobre o futuro do país.",
      opcoes: ["posse", "tomada de posse", "ascensão"],
      correta: 0,
      explicacao:
        'Posse é direto e claro. "Tomada de posse" é pleonasmo: você não precisa de "tomada" se já tem "posse". Ascensão muda o sentido. A clareza de alicerce exige a palavra certa sem redundância.',
    }),
    interpretacao({
      texto:
        'Um aluno escreveu: "A violência dos policiais contra cidadãos desarmados é uma realidade muito verdadeira em nossas cidades brasileiras." Problemas: "realidade muito verdadeira" é pleonasmo (realidade já é verdadeira), "cidadãos desarmados" é redundante em contexto de violência (já fica claro que não podem se defender), "nossas cidades brasileiras" duplica conceito de cidade brasileira. Cada erro enfraquece o alicerce. Uma versão corrigida: "A violência policial contra cidadãos inermes é uma realidade crescente nas grandes cidades." Cada palavra trabalha sem eco.',
      pergunta: "Qual é o principal impacto dos vícios de linguagem no texto original?",
      opcoes: [
        "Tornam a ideia mais clara e enfática",
        "Enfraquecem a estrutura através de repetição desnecessária de conceitos",
        "Não têm impacto algum: são apenas questão de estilo",
      ],
      correta: 1,
      explicacao:
        "Vícios de linguagem criam ruído: o leitor sente que você está repetindo, não construindo. A precisão de cada palavra é o alicerce. Quando você repete conceitos desnecessariamente, perde poder argumentativo.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Cacófato é um som desagradável que resulta da junção de palavras, e deve ser evitado na redação.",
      verdadeiro: true,
      explicacao:
        'Cacófato: "Que legal" soa como "queléga", "por sua culpa" soa como "porsucupa". Evite especialmente em redação formal. O ouvido do leitor sente o desconforto sonoro, enfraquecendo a estrutura de significado.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase está livre de vícios de linguagem?",
      opcoes: [
        "Ele subiu para cima com muita pressa e apressamento.",
        "O governo voltou a regressar sobre suas decisões anteriores.",
        "A educação é fundamental para o desenvolvimento intelectual do ser humano.",
      ],
      correta: 2,
      explicacao:
        'A primeira tem pleonasmo: "subir para cima", "pressa e apressamento". A segunda tem pleonasmo: "voltou a regressar". A terceira é clara, cada palavra constrói sentido sem redundância.',
    }),
  ],
});

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
 * Lição 03: Sujeito indeterminado e oração sem sujeito
 */
export const sujeitoIndeterminadoOracaoSemSujeito = defineLesson({
  id: "sintaxe-1-03-sujeito-indeterminado-oracao-sem-sujeito",
  titulo: "Sujeito indeterminado e oração sem sujeito",
  descricao: "Quando o sujeito é vago, incerto ou simplesmente não existe.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual frase tem sujeito indeterminado?",
      opcoes: [
        "A polícia investigava o crime.",
        "Investigavam o crime, mas não acharam o culpado.",
        "O crime foi investigado pela polícia.",
      ],
      correta: 1,
      explicacao:
        'Sujeito indeterminado é quando a ação acontece, mas não sabemos quem faz. "Investigavam" está em terceira pessoa do plural sem referência clara. Há quem investigue, mas quem exatamente? Misterioso proposital.',
    }),
    verdadeiroFalso({
      afirmacao: "Uma oração sem sujeito é uma oração com sujeito indeterminado.",
      verdadeiro: false,
      explicacao:
        "Não. São diferentes. Sem sujeito significa o verbo não admite sujeito (chuva, escurecer). Indeterminado significa o verbo até admite, mas não sabemos quem faz.",
    }),
    multiplaEscolha({
      pergunta: "Qual é uma oração sem sujeito?",
      opcoes: [
        "Disseram que ele viajou.",
        "Chove bastante no inverno.",
        "O povo está descontente.",
      ],
      correta: 1,
      explicacao:
        'Verbos de fenômeno natural (chover, nevar, amanhecer, escurecer) não têm sujeito. "Chove" é oração completa sem precisar de ninguém chovendo. É a ação pura.',
    }),
    encontreOErro({
      frase: "Fazem anos que não nos vemos com os amigos.",
      erroIndex: 0,
      explicacao:
        'O verbo "fazer" indicando tempo decorrido é impessoal: não tem sujeito, então nunca varia para o plural. O certo é "Faz anos que não nos vemos com os amigos".',
    }),
    completeLacuna({
      frase: 'Em "Amanheceu cedo", temos uma oração ___ porque o verbo não admite sujeito.',
      opcoes: ["sem sujeito", "com sujeito indeterminado", "com sujeito posposto"],
      correta: 0,
      explicacao:
        'Amanhecer é fenômeno natural. "Amanheceu" é completo assim: a estrutura é fechada, não tem lugar para sujeito. É a natureza agindo, não há quem.',
    }),
    verdadeiroFalso({
      afirmacao: "Sujeito indeterminado acontece sempre com verbo no infinitivo.",
      verdadeiro: false,
      explicacao:
        'Não. Sujeito indeterminado é tipicamente terceira pessoa do plural (eles/elas): "Roubaram o carro." Infinitivo é outra estrutura sintática, usada em outros contextos.',
    }),
    parear({
      instrucao: "Combine cada oração com sua classificação",
      pares: [
        { a: "Falam mal de mim.", b: "Sujeito indeterminado" },
        { a: "Neva bastante nos Alpes.", b: "Oração sem sujeito" },
        { a: "Ana fala com clareza.", b: "Sujeito determinado" },
      ],
      explicacao:
        "Indeterminado: não sabemos quem fala. Sem sujeito: verbo impessoal (neva). Determinado: sabemos quem (Ana). Três estruturas diferentes, bases sólidas para o texto.",
    }),
    interpretacao({
      texto:
        'A língua usa sujeito indeterminado quando quer proteger quem fala ou criar distância. "Dizem que choveu muito" é diferente de "Eu digo que choveu". Sem sujeito, o verbo impessoal marca tempo ou fenômeno: "Faz frio", "Amanheceu". As duas ferramentas existem por necessidade de expressão: às vezes, importa quem faz; às vezes, só importa o que acontece.',
      pergunta:
        "Segundo o texto, quando se usa sujeito indeterminado, qual é a intenção do falante?",
      opcoes: [
        "Deixar vago quem faz a ação ou criar distância",
        "Indicar que a ação é impossível",
        "Enfatizar que é sempre a mesma pessoa",
      ],
      correta: 0,
      explicacao:
        'O texto esclarece: indeterminado é ferramenta de proteção e distanciamento. "Comentaram isso" protege quem fala; "Você comentou isso" culpa direto. Estratégia de linguagem estruturada.',
    }),
  ],
});

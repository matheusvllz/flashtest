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
 * Lição 07: Derivação (todos os tipos)
 * Tópico: Processo de formação de palavras por derivação
 */
export const derivacao = defineLesson({
  id: "classes-2-formacao-07-derivacao",
  titulo: "Derivação (todos os tipos)",
  descricao: "Processo de criar novas palavras a partir de uma raiz comum.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é derivação?",
      opcoes: [
        "Processo de criar novas palavras acrescentando prefixos, sufixos ou fazendo modificações no radical",
        "Mudança de significado apenas pela pontuação",
        "Repetição da mesma palavra em contextos diferentes",
      ],
      correta: 0,
      explicacao:
        'Derivação é o criadouro de palavras: você pega um radical ("feliz") e varia ele com prefixos, sufixos, mudanças de vogal. Daí nascem "infeliz", "felizmente", "felicidade". Uma raiz, mil frutos.',
    }),
    parear({
      instrucao: "Combine cada tipo de derivação com seu exemplo",
      pares: [
        { a: "Prefixal", b: "in + feliz = infeliz" },
        { a: "Sufixal", b: "feliz + idade = felicidade" },
        { a: "Parassintética", b: "en + velho + ecer = envelhecer" },
        { a: "Regressiva", b: "escolher > escolha (verbo > substantivo)" },
      ],
      explicacao:
        "Prefixal acrescenta antes; sufixal acrescenta depois; parassintética faz os dois; regressiva encurta o radical. Estratégias diferentes, todas geram palavras novas.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Derivação parassintética ocorre quando se acrescenta prefixo E sufixo ao mesmo tempo no radical.",
      verdadeiro: true,
      explicacao:
        'Sim. "Entardecer" é parassintética: "en-" (prefixo) + "tarde" (radical) + "-ecer" (sufixo), tudo junto. Se remover qualquer um dos afixos ("entarde" ou "tardecer"), a palavra não existe sozinha.',
    }),
    completeLacuna({
      frase: 'A palavra "escuridade" é um exemplo de derivação ___ do radical "escuro".',
      opcoes: ["sufixal", "prefixal", "parassintética"],
      correta: 0,
      explicacao:
        '"Escuro" + "-idade" = escuridade. Derivação sufixal: acrescenta-se só o sufixo ao final. O prefixo não está envolvido aqui.',
    }),
    multiplaEscolha({
      pergunta: "Qual palavra é exemplo de derivação regressiva?",
      opcoes: [
        "Luta (do verbo lutar)",
        "Infeliz (do adjetivo feliz)",
        "Rapidamente (do adjetivo rápido)",
      ],
      correta: 0,
      explicacao:
        'Derivação regressiva pega um verbo e o encurta para criar um substantivo: "lutar > luta". "Infeliz" é prefixal, "rapidamente" é sufixal. Regressiva encurta.',
    }),
    encontreOErro({
      frase: "A belezura da paisagem nos encantava todos os dias.",
      erroIndex: 1,
      explicacao:
        '"Belezura" é forma regional e coloquial, fora do padrão que a redação de ENEM exige. O correto no registro formal é "beleza" (derivação regressiva de "embelezar") ou "belíssima" (derivação sufixal com superlativo).',
    }),
    verdadeiroFalso({
      afirmacao:
        "Toda palavra derivada tem uma palavra primitiva (aquela que não vem de nenhuma outra) como origem.",
      verdadeiro: true,
      explicacao:
        'Sim. "Flor" é primitiva (não derivada de nada). "Florista", "floração", "florear": todas derivam de "flor". Toda derivada aponta a uma primitiva como raiz.',
    }),
    interpretacao({
      texto:
        'A derivação é um mecanismo de economia e criatividade linguística. Em vez de inventar uma palavra inteiramente nova, a língua reutiliza raízes conhecidas e as varia com prefixos e sufixos. "Livro" se torna "livraria", "livradão", "livreco": mesma raiz, novos sentidos. No ENEM, dominar derivação ajuda a expandir vocabulário de forma consciente e a entender nuances de sentido que prefixos e sufixos trazem: "inimigo" (prefixo "in-" = negação) soa bem diferente de "desafeto" (prefixo "des-" = oposição).',
      pergunta:
        'Por que a derivação é considerada um mecanismo de "economia e criatividade" linguística?',
      opcoes: [
        "Porque reutiliza raízes conhecidas em vez de inventar palavras novas",
        "Porque economiza letras na escrita",
        "Porque evita que se use dicionário",
      ],
      correta: 0,
      explicacao:
        'A língua não precisa criar do zero: pega "livro" e varia. "Livraria", "livresco", "livreto". Economia de invenção, criatividade de combinação. No ENEM, isso é precisão vocabular.',
    }),
    multiplaEscolha({
      pergunta:
        "Qual palavra melhor exemplifica derivação com mudança de classe gramatical (verbo > nome)?",
      opcoes: ["Ensinar > ensino", "Forte > fortaleza", "Rapidamente > rápido"],
      correta: 0,
      explicacao:
        '"Ensinar" é verbo; "ensino" é a derivação regressiva que gera o substantivo, encurtando o verbo sem acrescentar sufixo. "Forte > fortaleza" também vira substantivo, mas de adjetivo, com sufixo. "Rapidamente" vai de adjetivo a advérbio, não passa por verbo.',
    }),
  ],
});

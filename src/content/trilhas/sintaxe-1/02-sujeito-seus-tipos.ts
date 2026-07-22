import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  ordenar,
  interpretacao,
} from "@/lib/lessons/define";

/**
 * Lição 02: Sujeito e seus tipos
 */
export const sujeitoSeusTipos = defineLesson({
  id: "sintaxe-1-02-sujeito-seus-tipos",
  titulo: "Sujeito e seus tipos",
  descricao: "O termo essencial: simples, composto e seus derivados.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é sujeito?",
      opcoes: [
        "O termo sobre o qual o verbo faz uma afirmação",
        "O verbo que comanda a frase",
        "A parte final da oração",
      ],
      correta: 0,
      explicacao:
        'Sujeito é o alicerce: aquele de quem ou do que se fala. O verbo gira em torno dele. Em "Ana correu", Ana é o sujeito; o verbo descreve a ação dela.',
    }),
    multiplaEscolha({
      pergunta: 'Qual é o sujeito em "O rapaz e a moça chegaram atrasados"?',
      opcoes: ["O rapaz", "A moça", "O rapaz e a moça (sujeito composto)"],
      correta: 2,
      explicacao:
        'Sujeito simples tem só um núcleo; composto tem dois ou mais. Quando dois nomes fazem a ação, separados por "e", temos um sujeito composto. A base segura é estruturada.',
    }),
    verdadeiroFalso({
      afirmacao: "Sujeito é sempre uma pessoa.",
      verdadeiro: false,
      explicacao:
        'Não. Sujeito pode ser pessoa, coisa, animal, ideia. Em "A chuva caiu" e "A justiça deve prevalecer", chuva e justiça são sujeitos, não pessoas.',
    }),
    completeLacuna({
      frase: 'Em "As árvores caíram com o furacão", o sujeito é ___, e está no número plural.',
      opcoes: ["as árvores", "o furacão", "caíram"],
      correta: 0,
      explicacao:
        'O verbo concorda com o sujeito. "Caíram" está no plural porque "as árvores" (sujeito) é plural. Essa é a harmonia da estrutura.',
    }),
    encontreOErro({
      frase: "Os alunos estuda muito para o ENEM.",
      erroIndex: 2,
      explicacao:
        'O sujeito é "os alunos" (plural), mas o verbo "estuda" está no singular. Falta concordância: deveria ser "estudam". O verbo veste a roupa certa do sujeito.',
    }),
    parear({
      instrucao: "Relacione cada oração com seu tipo de sujeito",
      pares: [
        { a: "Maria partiu ontem.", b: "Sujeito simples" },
        { a: "Maria e João partiram.", b: "Sujeito composto" },
        { a: "Estudamos bastante ontem.", b: "Sujeito oculto" },
      ],
      explicacao:
        'Simples tem um núcleo só ("Maria"). Composto tem dois ou mais ("Maria e João"). Oculto não aparece na frase, mas a desinência do verbo entrega quem é: "Estudamos" só pode ser "nós".',
    }),
    verdadeiroFalso({
      afirmacao: "O sujeito sempre vem antes do verbo.",
      verdadeiro: false,
      explicacao:
        'Falso. Muitas vezes, por ênfase ou ritmo, o verbo vem primeiro: "Chegou Maria!" é oração invertida, mas "Maria" ainda é sujeito. A ordem não muda a função.',
    }),
    ordenar({
      blocos: ["O sujeito", "é aquele de quem", "ou do que", "se faz a afirmação."],
      explicacao:
        "A estrutura mostra o alicerce: tudo o que acontece na oração gira em volta do sujeito. Ele dá base ao verbo.",
    }),
    interpretacao({
      texto:
        'Na construção de um texto bem estruturado, o sujeito é quem sustenta a clareza. Um sujeito obscuro deixa o leitor perdido. Se você escreve "Segundo estudos recentes, a importância de investimentos em educação", o sujeito não está claro (é "a importância"? são "investimentos"?). Mas se escreve "Os estudos recentes mostram que os investimentos em educação são importantes", o sujeito é cristalino: "os estudos".',
      pergunta: "Conforme o texto, o que torna um texto bem estruturado em relação ao sujeito?",
      opcoes: [
        "Um sujeito claro e evidente",
        "Um sujeito colocado sempre no meio da frase",
        "Vários sujeitos compostos na mesma oração",
      ],
      correta: 0,
      explicacao:
        "A clareza é pilar da estrutura. Um sujeito nítido permite que o leitor navegue sem tropeços. A nebulosidade confunde e enfraquece.",
    }),
  ],
});

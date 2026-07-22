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
 * Lição 05: Transitividade verbal
 */
export const transividadeVerbal = defineLesson({
  id: "sintaxe-1-05-transitividade-verbal",
  titulo: "Transitividade verbal",
  descricao: "Verbo intransitivo, transitivo direto e transitivo indireto.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um verbo transitivo?",
      opcoes: [
        "Um verbo que não precisa de complemento",
        "Um verbo que precisa de complemento para fazer sentido",
        "Um verbo que muda de significado sempre",
      ],
      correta: 1,
      explicacao:
        'Verbo transitivo carece de objeto: não fica de pé sozinho. "Ela comeu" é incompleto sem saber o quê. "Ela comeu bolo" é estrutura firme. A ação transita para algo exterior.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase tem verbo transitivo direto?",
      opcoes: [
        "Os jogadores corriam na quadra.",
        "Os jogadores comiam frutas na hora do intervalo.",
        "Os jogadores descansavam debaixo da árvore.",
      ],
      correta: 1,
      explicacao:
        'Transitivo direto recebe objeto direto (sem preposição). "Comiam frutas" é TD: a ação "comer" vai direto pra "frutas", sem preparação. Estrutura sólida e direta.',
    }),
    verdadeiroFalso({
      afirmacao: "Muitos verbos podem ser transitivos ou intransitivos dependendo do contexto.",
      verdadeiro: true,
      explicacao:
        'Verdadeiro. "Correr" é intransitivo ("Ele corre"), mas "Ele corre maratona" faz dele transitivo. O contexto molda a transitividade. Isso não vale pra todo verbo: os de ligação, por exemplo, seguem outra lógica.',
    }),
    completeLacuna({
      frase:
        'Em "Ele obedeceu às normas", o verbo é transitivo ___ porque a ação depende de preposição.',
      opcoes: ["indireto", "direto", "incompleto"],
      correta: 0,
      explicacao:
        'Transitivo indireto: a ação transita via preposição. "Obedecer a", "confiar em", "insistir em". A preposição é tubo condutor da ação.',
    }),
    encontreOErro({
      frase: "Eles confiavam o segredo para o melhor amigo.",
      erroIndex: 4,
      explicacao:
        'Quando "confiar" tem objeto direto (aqui, "o segredo"), a pessoa que recebe entra com a preposição "a", não "para". O certo é "confiavam o segredo ao melhor amigo". Regência exata, sem atalho.',
    }),
    parear({
      instrucao: "Relacione cada verbo com sua transitividade",
      pares: [
        { a: "correr (sem complemento)", b: "Intransitivo" },
        { a: "adorar alguém", b: "Transitivo direto" },
        { a: "depender de alguém", b: "Transitivo indireto" },
      ],
      explicacao:
        "Intransitivo: basta sozinho. TD: objeto sem preposição. TI: objeto com preposição. Cada um tem sua fundação sintática.",
    }),
    verdadeiroFalso({
      afirmacao: "Um verbo transitivo direto e indireto ao mesmo tempo é muito raro em português.",
      verdadeiro: false,
      explicacao:
        'Falso. Muitos verbos são bitonais: "Avisei ao gerente o atraso" (TD: avisei o atraso; TI: avisei ao gerente). A estrutura carrega dois objetos de naturezas diferentes.',
    }),
    ordenar({
      blocos: ["O verbo", "transitivo precisa", "de um complemento", "para fazer sentido."],
      explicacao:
        "A sequência mostra a fundação: verbo transitivo é incompleto até receber seu objeto. É estrutura de dependência necessária.",
    }),
    interpretacao({
      texto:
        'Na redação, a transitividade verbal não é detalhe: molda a clareza. "Ele esqueceu" deixa dúvida (esqueceu o quê?). "Ele esqueceu o compromisso" é claro. "Ele se esqueceu do compromisso" (reflexiva) é outra nuance. O redator que domina transitividade escreve frases que respiram: cada palavra em seu lugar, nada faltando, nada sobrando.',
      pergunta: "Segundo o texto, qual é a vantagem de dominar transitividade verbal?",
      opcoes: [
        "Frases mais claras e bem estruturadas",
        "Textos que soam mais científicos",
        "Capacidade de usar mais adjetivos",
      ],
      correta: 0,
      explicacao:
        "A transitividade é fundação da clareza. Sem ela, ficam lacunas que confundem. Com ela, cada verbo carrega seu peso exato, sua intenção vira tangível.",
    }),
  ],
});

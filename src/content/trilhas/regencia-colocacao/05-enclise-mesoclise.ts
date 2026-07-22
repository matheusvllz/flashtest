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
 * Lição 05: Ênclise e Mesóclise
 * Foco: pronomes DEPOIS do verbo (deixa-me, deixou-me) ou NO MEIO (deixa-me-ia)
 */
export const encliseeMesoclise = defineLesson({
  id: "regencia-colocacao-05-enclise-mesoclise",
  titulo: "Ênclise e mesóclise: pronome depois ou no meio do verbo",
  descricao: "Quando o pronome não vem na frente, ele escolhe o fim ou o meio.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual é a diferença entre ênclise e mesóclise?",
      opcoes: [
        "Ênclise coloca o pronome depois do verbo; mesóclise o coloca no meio do verbo (entre radical e terminação).",
        "Ênclise e mesóclise são palavras sinônimas, não há diferença real.",
        "Ênclise é usada em português antigo; mesóclise não existe em português moderno.",
      ],
      correta: 0,
      explicacao:
        'Ênclise: "deixa-me", "chamou-o". Mesóclise: "deixa-me-ia" (deixaria + me). A mesóclise vive em futuros e condicionais. Pronome no meio é a assinatura de tempos compostos.',
    }),
    verdadeiroFalso({
      afirmacao: 'A frase "Eu deixei-o ir" está correta porque usa ênclise.',
      verdadeiro: false,
      explicacao:
        'Errado. Com pronome relativo ou sujeito claro, próclise é regra: "Eu o deixei ir". Ênclise ocorre sem palavra atrativa e após pausa ou início de oração: "Deixa-me ir", "Chamou-o logo." Com sujeito expresso, próclise vence.',
    }),
    encontreOErro({
      // "Ele" (0) "pediu-me" (1) "para" (2) "voltar" (3) "cedo." (4)
      frase: "Ele pediu-me para voltar cedo.",
      erroIndex: 1,
      explicacao:
        'Com sujeito expresso ("Ele"), a próclise é obrigatória. O correto é "Ele me pediu para voltar", não "Ele pediu-me". Ênclise só entra quando o sujeito está ausente ou há pausa.',
    }),
    completeLacuna({
      frase: "Se eu pudesse, ajudar-___-ia neste projeto urgente.",
      opcoes: ["te", "lhe", "vos"],
      correta: 0,
      explicacao:
        'Em futuro do pretérito (condicional), a mesóclise entra no meio do verbo: "ajudar-te-ia" (ajudar + te + ia). O pronome mora dentro do verbo, não do lado dele. Pronome no meio é a marca do futuro composto.',
    }),
    parear({
      instrucao: "Combine cada construção com seu tipo de colocação pronominal",
      pares: [
        { a: "Deixa-me sair.", b: "Ênclise (sem sujeito, imperativo)" },
        { a: "Chamou-o logo cedo.", b: "Ênclise (início de oração)" },
        { a: "Contar-lhe-ei tudo.", b: "Mesóclise (futuro do presente)" },
        { a: "Dir-me-iam a verdade.", b: "Mesóclise (futuro do pretérito)" },
      ],
      explicacao:
        "Ênclise é o fim do verbo; mesóclise é o meio. Cada uma tem seu momento: ênclise em imperativos e inícios, mesóclise em futuros.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase está correta quanto à colocação pronominal?",
      opcoes: [
        "Quando você vir-me, avise-me imediatamente.",
        "Quando me vir, avise-me imediatamente.",
        "Quando você vir-me, avise a mim imediatamente.",
      ],
      correta: 1,
      explicacao:
        'Com "quando" (palavra relativa), próclise é obrigatória: "quando me vir". Depois, na segunda oração sem atrator, ênclise é natural: "avise-me".',
    }),
    verdadeiroFalso({
      afirmacao: "Mesóclise ocorre naturalmente em tempos simples como presente e pretérito.",
      verdadeiro: false,
      explicacao:
        'Mesóclise é propriedade do futuro do presente e do futuro do pretérito: "contar-lhe-ei", "diriam-me". Em tempos simples, só próclise e ênclise aparecem.',
    }),
    encontreOErro({
      // "A" (0) "cena" (1) "que" (2) "vi-a" (3) "representar" (4) "marcou" (5) "minha" (6) "vida." (7)
      frase: "A cena que vi-a representar marcou minha vida.",
      erroIndex: 3,
      explicacao:
        'Com "que" (pronome relativo), próclise é obrigatória. Ênclise está proibida aqui. O correto é "que a vi representar", não "que vi-a".',
    }),
    interpretacao({
      texto:
        "A colocação pronominal em português é como uma dança de posições: próclise (frente), ênclise (fim) e mesóclise (meio) respondem a sinais sintáticos. Quando há palavra atrativa, o pronome corre para a frente. Quando não há, ele segue ao fim. E em futuros compostos, ele dança no meio do verbo. Dominar esses três ritmos é dominar a prosódia da língua.",
      pergunta: "O texto compara colocação pronominal a uma dança. O que isso quer dizer?",
      opcoes: [
        "Que a colocação pronominal é aleatória e não segue padrão algum.",
        "Que a colocação pronominal segue posições fixas (frente, fim, meio) em resposta a sinais sintáticos.",
        "Que próclise é a única forma correta de colocação em português.",
      ],
      correta: 1,
      explicacao:
        'A metáfora de "dança" marca precisão: cada posição (frente/fim/meio) responde a sinais sintáticos específicos. É ritmo, não caos.',
    }),
  ],
});

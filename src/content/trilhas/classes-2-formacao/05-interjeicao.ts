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
 * Lição 05: Interjeição
 * Tópico: Palavras que expressam emoções e sensações
 */
export const interjeicao = defineLesson({
  id: "classes-2-formacao-05-interjeicao",
  titulo: "Interjeição",
  descricao: "Palavras que expressam emoções, sensações e chamamentos.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma interjeição?",
      opcoes: [
        "Uma palavra invariável que expressa emoção, sensação ou chamamento",
        "Uma pausa na frase que marca respiração",
        "Um tipo de verbo no infinitivo",
      ],
      correta: 0,
      explicacao:
        "Interjeição é o grito do coração: ela sai, expressa o sentimento, e não participa da estrutura sintática da frase. Ah, Deus, Oxalá, Puxa: são todas interjeições.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Interjeições como "Ai!", "Que legal!", "Puxa!" são usadas na fala coloquial, mas desapropriadas na redação formal de ENEM.',
      verdadeiro: true,
      explicacao:
        "Em ENEM, a redação exige formalidade. Interjeições são da fala viva; na escrita de prova, elas rompem o tom. Existem, mas marcam informalidade. Na redação dissertativa, evita-se.",
    }),
    parear({
      instrucao: "Combine cada interjeição com a emoção ou sensação que expressa",
      pares: [
        { a: "Ai! / Opa!", b: "Dor ou espanto" },
        { a: "Que legal! / Eba!", b: "Alegria ou aprovação" },
        { a: "Psiu! / Silêncio!", b: "Pedido de silêncio" },
        { a: "Cuidado! / Calma!", b: "Advertência" },
        { a: "Oxalá! / Tomara!", b: "Desejo" },
      ],
      explicacao:
        "Cada interjeição carrega uma emoção ou sensação específica. Não há estrutura gramatical envolvida: é pura expressão do sentimento do falante.",
    }),
    completeLacuna({
      frase: "___ susto você me deu!",
      opcoes: ["Que", "Qual", "Quando"],
      correta: 0,
      explicacao:
        'A frase toda "Que susto!" funciona como locução interjetiva: junta mais de uma palavra, mas expressa espanto igual a uma interjeição só. "Qual" pergunta e "quando" marca tempo, não carregam essa carga emocional.',
    }),
    encontreOErro({
      frase: "Puxa, que trabalho difícil! A gente consegue resolver isto.",
      erroIndex: 0,
      explicacao:
        'Essa interjeição "Puxa" é desapropriada na redação de ENEM. A frase ganha tom coloquial demais. Na escrita formal, substitui-se por pontuação enfática ou reformula: "Que trabalho difícil! Conseguiremos resolver isto."',
    }),
    multiplaEscolha({
      pergunta: "Qual diferença existe entre uma interjeição e uma exclamação?",
      opcoes: [
        "Interjeição é a palavra que expressa emoção; exclamação é o ponto (!) que marca a entonação",
        "São a mesma coisa, nomes diferentes",
        "Exclamação é sempre acompanhada de interjeição",
      ],
      correta: 0,
      explicacao:
        'Interjeição é a palavra ("Ai!", "Que legal!"); exclamação é a pontuação (o ponto de exclamação). Podem andar juntas, mas são conceitos diferentes.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Uma interjeição como "Oxalá" nunca participa da sintaxe da frase, sempre vem isolada ou entre vírgulas.',
      verdadeiro: true,
      explicacao:
        'Exato. Interjeição é autônoma: não se liga sintaticamente ao resto da frase. "Oxalá chegue cedo" tem "Oxalá" isolado + oração subordinada. Ela está ali, mas não comanda verbo nem objeto.',
    }),
    interpretacao({
      texto:
        'As interjeições são filhas da oralidade. "Ai de mim!", "Que Deus me perdoe!", "Tomara que funcione!": expressam o que o falante sente no momento. Na fala viva, elas marcam autenticidade e emoção genuína. Mas na redação de prova como o ENEM, exigem cuidado: usar interjeição é arriscar perder formalidade. O redator sábio sabe quando deixá-las falar e quando contê-las em favor da estrutura dissertativa.',
      pergunta: "Por que as interjeições exigem cuidado na redação de ENEM?",
      opcoes: [
        "Porque marcam oralidade e podem prejudicar a formalidade exigida",
        "Porque são muito difíceis de escrever",
        "Porque todas as interjeições são erros de gramática",
      ],
      correta: 0,
      explicacao:
        "Interjeições são genuínas na fala, mas na redação formal, rompem tom. ENEM exige dissertação: isso pede formalidade. Usar interjeição aqui é escolher oralidade sobre estrutura.",
    }),
    multiplaEscolha({
      pergunta: "Em qual contexto uma interjeição seria apropriada na redação?",
      opcoes: [
        "Em discurso direto reproduzindo a fala de um personagem",
        "No desenvolvimento do argumento principal",
        "Na proposição de solução",
      ],
      correta: 0,
      explicacao:
        "Se a redação inclui fala de personagem (discurso direto), a interjeição marca autenticidade. No texto dissertativo puro, ela é evitada. Contexto de fala = interjeição apropriada.",
    }),
  ],
});

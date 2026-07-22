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
 * Níveis de linguagem: formal, coloquial e suas nuances.
 * Como adaptar o registro de linguagem ao contexto.
 */
export const niveisLinguagem = defineLesson({
  id: "semantica-11-niveis-linguagem",
  titulo: "Níveis de linguagem",
  descricao: "Formal, coloquial e as nuances: registros de fala conforme o contexto.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é linguagem formal?",
      opcoes: [
        "Aquela usada em contextos oficiais, profissionais e acadêmicos, com vocabulário refinado e gramática precisa",
        "A forma como as pessoas falam normalmente entre amigos",
        "Linguagem que usa muita gíria e informalidade",
      ],
      correta: 0,
      explicacao:
        "Linguagem formal constrói a base de uma redação de ENEM: ausência de gíria, concordância perfeita, vocabulário técnico quando apropriado. É o alicerce que permite ao examinador medir sua precisão de linguagem.",
    }),
    verdadeiroFalso({
      afirmacao: 'Linguagem coloquial é "errada" e deve ser evitada em todas as situações.',
      verdadeiro: false,
      explicacao:
        "Linguagem coloquial é legítima e natural em contextos informais: conversa com amigos, mensagens, narrativas de vivência. O erro é usá-la onde cabe formal. Contexto determina adequação. O alicerce é saber quando usar qual registro.",
    }),
    parear({
      instrucao: "Combine cada tipo de linguagem com um exemplo",
      pares: [
        {
          a: "Formal",
          b: "A economia brasileira apresenta desafios estruturais de sustentabilidade.",
        },
        { a: "Coloquial", b: "Cara, a economia tá complicada mesmo, não tá fácil não." },
        { a: "Familiar/Íntimo", b: "Pô, que raiva dessa crise toda, mano." },
      ],
      explicacao:
        "Formal é estruturado e técnico. Coloquial é conversa cotidiana. Familiar/Íntimo é ainda mais relaxado, com interjeições. Cada um tem seu alicerce e seu lugar.",
    }),
    multiplaEscolha({
      pergunta: "Qual frase está em nível formal apropriado?",
      opcoes: [
        "Tipo, a gente precisa de mudanças na educação, sabe?",
        "A educação requer reformas estruturais para garantir equidade.",
        "Tá preciso mudar a educação, tá bom?",
      ],
      correta: 1,
      explicacao:
        'A segunda constrói o registro formal: sem "tipo", sem "sabe", sem "tá bom". É objetiva e usa vocabulário apropriado. Em prova, é essa estrutura que constrói credibilidade.',
    }),
    encontreOErro({
      frase:
        "O governo vai ficar investindo cada vez mais em tecnologia pra resolver problema de educação.",
      erroIndex: 10,
      explicacao:
        'A contração "pra" é coloquial. Em registro formal, o correto é "para". É essa troca de registro que quebra a formalidade que a frase pede.',
    }),
    completeLacuna({
      frase:
        "Na redação formal, devemos ___ gíria e expressões muito informais, mantendo um registro acadêmico e profissional.",
      opcoes: ["usar", "evitar", "equilibrar"],
      correta: 1,
      explicacao:
        'Em contexto formal, evitamos gíria. "Evitar" constrói a regra clara. "Usar" seria contradição. "Equilibrar" seria apropriado em contexto híbrido, mas em prova formal, é evitar.',
    }),
    interpretacao({
      texto:
        'Uma mãe escreve para a escola: "Gostaria de informar que meu filho apresentou dificuldades na resolução das atividades propostas na última semana, e solicito uma reunião para discutir alternativas pedagógicas." Formal, objetiva, respeitosa. Depois escreve para a amiga: "Tá, a criança tá achando matemática difícil mesmo, viu? Vou falar com a professora. Essa coisa de fração é complicada pra caramba." Coloquial, quente, viva. Ambas comunicam o mesmo problema, mas em registros diferentes. A inadequação aconteceria ao misturar: "Gostaria de informar que meu filho tá achando matemática difícil pra caramba" soaria quebrada. A escolha de registro é alicerce de coerência.',
      pergunta: "Por que é importante adaptar o nível de linguagem ao contexto?",
      opcoes: [
        "Porque permite que você pareça mais inteligente",
        "Porque garante que a mensagem chegue com o tom apropriado, mantendo credibilidade e clareza",
        "Porque há uma única forma correta de falar",
      ],
      correta: 1,
      explicacao:
        "Registro apropriado constrói confiança e clareza. Com a escola, formalidade deixa sua preocupação legítima. Com a amiga, coloquialismo deixa a relação calorosa. Misturar quebra a estrutura emocional do texto.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Usar linguagem coloquial em uma prova de ENEM é uma escolha válida se o candidato se sente mais confortável.",
      verdadeiro: false,
      explicacao:
        "ENEM exige norma formal: é o contexto. Conforto pessoal não sobrepõe o alicerce que a avaliação estabelece. A redação formal é técnica e deve ser dominada por quem aspira nota alta. Conforto vem com prática.",
    }),
    multiplaEscolha({
      pergunta:
        "Qual é o melhor nível de linguagem para uma redação de ENEM sobre direitos humanos?",
      opcoes: [
        "Coloquial, para parecer próximo ao leitor",
        "Formal, porque é contexto acadêmico e exige precisão",
        "Uma mistura de formal e coloquial, para equilibrar",
      ],
      correta: 1,
      explicacao:
        "Formal é estrutura certa. O ENEM avalia sua capacidade de argumentar em registro acadêmico. Isso não torna seu texto frio: precisão e clareza fazem a diferença legítima. Formal bem feito é potente.",
    }),
  ],
});

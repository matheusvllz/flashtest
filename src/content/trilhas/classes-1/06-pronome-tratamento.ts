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
 * Classes de Palavras I - Lição 06: Pronomes de tratamento
 */
export const pronomeeTratamento = defineLesson({
  id: "classes-1-06-pronome-tratamento",
  titulo: "Pronomes de tratamento",
  descricao: "Você, senhor, dona: as palavras que mostram respeito.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um pronome de tratamento?",
      opcoes: [
        "Uma palavra que substitui nomes de pessoas com respeito ou familiaridade",
        "Um pronome que só aparece em cartas formais",
        "Um adjetivo que descreve como alguém é tratado",
      ],
      correta: 0,
      explicacao:
        "Pronome de tratamento marca relação social: você (confiança), senhor/senhora (formalidade), dona (afeto + formalidade). A escolha diz tudo sobre a relação.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Em Portugal, "você" é informal, enquanto no Brasil "você" é a forma padrão de conversa.',
      verdadeiro: true,
      explicacao:
        "Portugal usa tu e vós (formal antigo). Brasil abraçou você para tudo. Na redação brasileira, você é neutro. Já Vossa Excelência é para presidente, juiz, ministro.",
    }),
    parear({
      instrucao: "Combine cada pronome de tratamento com seu contexto",
      pares: [
        { a: "Você pode me ajudar?", b: "Conversação comum, informal" },
        { a: "Senhor diretor, gostaria de falar com você.", b: "Formalidade com respeito" },
        { a: "Dona Maria, como a dona está?", b: "Respeito + afeto (comum em comunidades)" },
        { a: "Vossa Excelência comparecerá à sessão?", b: "Formalidade extrema (autoridade)" },
      ],
      explicacao:
        "Você é padrão. Senhor/Senhora é formal com educação. Dona é formal + afetuoso. Vossa Excelência é para figuras públicas de grande destaque.",
    }),
    completeLacuna({
      frase: "___ poderia me explicar como resolver essa questão?",
      opcoes: ["Você", "Tu", "Vossa Senhoria"],
      correta: 0,
      explicacao:
        "Você é o padrão em português brasileiro moderno. Tu é arcaico no Brasil urbano (salvo em alguns regionalismos do Sul). Vossa Senhoria é histórico.",
    }),
    encontreOErro({
      frase: "Senhor presidente, você apresentaram suas ideias com clareza admirável.",
      erroIndex: 3,
      explicacao:
        'Apresentaram está no plural, mas "você" pede o verbo na 3ª pessoa do singular: apresentou. Pronome de tratamento sempre vai com verbo no singular, mesmo soando como se falasse direto com a pessoa.',
    }),
    multiplaEscolha({
      pergunta: "Em qual frase o pronome de tratamento está usado incorretamente?",
      opcoes: [
        "Senhor, o senhor está bem?",
        "Dona, a dona quer café?",
        "Vossa Majestade deixareis o reino?",
      ],
      correta: 2,
      explicacao:
        'A opção C mistura tempos verbais (Vossa Majestade com "deixareis", que é vós antigo). As duas primeiras combinam bem: Senhor com "o senhor", Dona com "a dona".',
    }),
    verdadeiroFalso({
      afirmacao:
        'Quando se usa "Vossa Excelência", o verbo fica na 3ª pessoa do singular, não na 2ª.',
      verdadeiro: true,
      explicacao:
        'Vossa Excelência pede 3ª pessoa: "Vossa Excelência deseja" (não "desejais"). É respeitoso porque trata a pessoa como ausente, elevada.',
    }),
    completeLacuna({
      frase: "Professora, a professora já corrigiu ___ trabalho?",
      opcoes: ["meu", "seu", "vosso"],
      correta: 1,
      explicacao:
        'Seu combina com "a professora" (pronome de tratamento). Meu seria "a professora corrigiu meu trabalho" (mais informal). Vosso é arcaico, não se usa.',
    }),
    interpretacao({
      texto:
        'Pronome de tratamento é marca de respeito e também de contexto social. Uma redação de ENEM que trata todos por "você" informal pode soar desrespeitosa se o gênero exigir formalidade. Mas uma que abusa de "Vossa Excelência" quando não é necessário fica artificial. O equilíbrio entre formalidade e naturalidade é um sinal de bom escritor: sabe quando mudar o tom.',
      pergunta: "O que o texto sugere sobre o uso de pronomes de tratamento em uma redação?",
      opcoes: [
        "Sempre use o mais formal possível",
        'Use sempre "você" porque é moderno',
        "Equilibre formalidade com o contexto e gênero textual",
      ],
      correta: 2,
      explicacao:
        "O texto enfatiza equilíbrio: não abuse de formalidade, mas também não seja desrespeitoso. A escolha deve combinar com o gênero textual e o contexto.",
    }),
  ],
});

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
 * Lição 07: A morfossintaxe do SE
 */
export const morfossintaxeSe = defineLesson({
  id: "sintaxe-2-07-morfossintaxe-se",
  titulo: "A morfossintaxe do SE",
  descricao: 'Como o "se" funciona: conjunção, pronome apassivador, indefinido e advérbio.',
  exercicios: [
    multiplaEscolha({
      pergunta: 'Em "Se você estudar, passa", qual é o papel do "se"?',
      opcoes: ["Pronome apassivador", "Conjunção condicional", "Pronome indefinido"],
      correta: 1,
      explicacao:
        'Conjunção condicional marca uma hipótese. "Se você estudar" = sob essa condição. É o alicerce que estrutura: ação esperada (você estudar) e resultado (passa).',
    }),
    verdadeiroFalso({
      afirmacao: 'Em "Vive-se bem onde há disciplina", o "se" é pronome apassivador.',
      verdadeiro: false,
      explicacao:
        'Aqui não há apassivador: "viver" é intransitivo nessa frase, não tem objeto direto para virar sujeito da passiva. O "se" é índice de indeterminação do sujeito, o mesmo papel de "Precisa-se de bons professores". Apassivador exige verbo transitivo direto, como em "Vendem-se casas".',
    }),
    parear({
      pares: [
        { a: "Se não houvesse chuva, iríamos ao parque.", b: "Conjunção condicional" },
        { a: "Compra-se livro nesta loja.", b: "Pronome apassivador" },
        {
          a: "Se alguém souber a resposta, que levante a mão.",
          b: "Conjunção condicional (com imperativo)",
        },
        { a: "Precisa-se de bons professores.", b: "Pronome indefinido" },
      ],
      explicacao:
        "Condicional marca hipótese. Apassivador transforma ativo em passivo (verbo transitivo direto). Indefinido marca sujeito indeterminado sem paciente claro. Cada um estrutura de forma diferente.",
    }),
    encontreOErro({
      frase: "Vende-se casas antigas no centro da cidade.",
      erroIndex: 0,
      explicacao:
        'Nessa construção, "casas antigas" é o sujeito paciente da voz passiva sintética: há sujeito claro, não é indeterminação. O verbo precisa concordar com ele: o certo é "Vendem-se casas antigas", no plural. "Vende-se", no singular, quebra a concordância.',
    }),
    completeLacuna({
      frase: "___ a estrutura for forte, o prédio não cai.",
      opcoes: ["Sem", "Se", "Vê-se"],
      correta: 1,
      explicacao:
        '"Se" introduz a condição, e o verbo no futuro do subjuntivo ("for") mostra que é uma hipótese. "Sem" pede só um substantivo depois, não uma oração com verbo flexionado, e mudaria a lógica da frase. "Vê-se" nem se encaixa na estrutura condicional.',
    }),
    multiplaEscolha({
      pergunta: 'Qual frase usa "se" como pronome indefinido?',
      opcoes: [
        "Se você visse o que vi, entenderia.",
        "Discute-se muito sobre educação.",
        "Se houvesse tempo, viajaria.",
      ],
      correta: 1,
      explicacao:
        'Indefinido marca que não se sabe quem faz a ação. "Discute-se" = "as pessoas discutem, mas não digo quem especificamente". Apassivador simples é quando há paciente claro ("Compra-se pão"); indefinido é quando não há.',
    }),
    ordenar({
      blocos: [
        "Se o aluno não respeita a professora,",
        "ela pode aplicar",
        "uma repreensão.",
        "Isso acontece todo dia.",
      ],
      explicacao:
        'Condicional "Se" marca que a repreensão é consequência da falta de respeito. Sem essa condição, não há consequência. É o alicerce da relação causa-efeito.',
    }),
    interpretacao({
      texto:
        'O "se" é um maestro de múltiplos papéis. Pode marcar condição ("Se chover, fico em casa"), indicar indeterminação ("Trabalha-se muito neste lugar"), transformar ativo em passivo ("Vende-se casa"), ou ainda marcar uma causa velada. Um escritor que domina o "se" consegue construir períodos sofisticados: "Se se pudesse viajar no tempo, se se reescrevesse a história, tudo seria diferente". A repetição da partícula marca ritmo e persuasão.',
      pergunta: 'Qual é a diferença entre "se" apassivador e "se" indefinido?',
      opcoes: [
        "Não há diferença; são a mesma coisa",
        "Apassivador transforma ativo em passivo; indefinido marca sujeito indeterminado",
        "Apassivador vem sempre depois do verbo; indefinido vem antes",
      ],
      correta: 1,
      explicacao:
        'Apassivador indica voz passiva implícita: "Compra-se pão" (o pão é comprado). Indefinido marca ator não-especificado: "Fala-se muito" (as pessoas falam, quem?). A sutileza é no contexto.',
    }),
    encontreOErro({
      frase: "Se eu ver a resposta certa, te aviso na hora.",
      erroIndex: 2,
      explicacao:
        'Depois do "se" condicional, o futuro do subjuntivo do verbo "ver" é "vir", não "ver" (que é o infinitivo). O certo é "Se eu vir a resposta certa, te aviso na hora". É uma troca comum entre infinitivo e futuro do subjuntivo.',
    }),
    verdadeiroFalso({
      afirmacao: 'O "se" de "Se você sabe, por que não responde?" é causal, não condicional.',
      verdadeiro: true,
      explicacao:
        'Aqui o "se" marca causa velada: porque você sabe (razão), por que não responde (pergunta retórica). Não é hipótese (condicional), é fato presumido que explica o espanto.',
    }),
  ],
});

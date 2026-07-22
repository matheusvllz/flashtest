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
 * Lição 02: Preposição (relações de sentido)
 * Tópico: Preposições e as relações de sentido que estabelecem
 */
export const preposicaoRelacoes = defineLesson({
  id: "classes-2-formacao-02-preposicao-relacoes",
  titulo: "Preposição (relações de sentido)",
  descricao: "Palavras que ligam termos e estabelecem relações entre eles.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma preposição?",
      opcoes: [
        "Uma palavra invariável que estabelece relação de sentido entre termos",
        "Um tipo de adjetivo que modifica o verbo",
        "Uma pausa obrigatória em toda frase",
      ],
      correta: 0,
      explicacao:
        "Preposição é o elo de corrente: ela une dois termos e explica qual é a relação entre eles. De posse, de tempo, de lugar, de causa... cada preposição abre uma porta de sentido diferente.",
    }),
    parear({
      instrucao: "Combine cada preposição com a relação de sentido que expressa",
      pares: [
        { a: "Livro de Paulo", b: "Posse" },
        { a: "Viagem para São Paulo", b: "Destino" },
        { a: "Parei por cansaço", b: "Causa" },
        { a: "Acordo com sua ideia", b: "Conformidade" },
      ],
      explicacao:
        "Cada preposição abre uma relação diferente: posse, direção, causa, conformidade. A mesma coisa pode mudar de sentido só pela preposição que escolhemos.",
    }),
    completeLacuna({
      frase: "Entramos ___ sala com cuidado.",
      opcoes: ["na", "sobre", "para"],
      correta: 0,
      explicacao:
        'A preposição "em" (contraída em "na") marca lugar. "Sobre" marcaria posição acima, e "para" seria destino futuro. O contexto pede o lugar onde já estamos.',
    }),
    verdadeiroFalso({
      afirmacao: "As preposições são palavras variáveis que concordam com os termos que ligam.",
      verdadeiro: false,
      explicacao:
        'Preposição é invariável: "de", "para", "em", "com" não mudam de forma. O que muda é o artigo ou pronome que vem depois ("do", "da", "de quem", etc.), não a preposição.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa preposição com relação de sentido mais clara?",
      opcoes: [
        "Escrevi o email com atenção para o cliente.",
        "Escrevi o email em atenção.",
        "Escrevi o email sobre atenção.",
      ],
      correta: 0,
      explicacao:
        'Em "com atenção", a preposição marca modo (como). "Em atenção" e "sobre atenção" criam sentidos confusos ou incorretos. Preposição certa = sentido claro.',
    }),
    encontreOErro({
      frase: "Tenho confiança sobre sua capacidade.",
      erroIndex: 2,
      explicacao:
        'O verbo "confiar" pede "em", não "sobre". Seria "confiança em sua capacidade". Preposição errada muda o sentido e cria erro gramatical grave.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Uma colher de sopa" e "Uma sopa de colher", a preposição é a mesma mas os sentidos são diferentes.',
      verdadeiro: true,
      explicacao:
        'Exato. "De" marca material (colher feita de sopa? não, é colher PARA sopa) e designação (sopa que se come de colher). A preposição é a mesma, mas o contexto muda tudo.',
    }),
    interpretacao({
      texto:
        'A preposição é como a mão invisível que guia o sentido da frase. Quando digo "saí pela porta", indico o caminho; "saí com raiva", indico o modo; "saí de manhã", indico o tempo. A mesma ação ("saír") ganha cores diferentes conforme a preposição. Por isso, errar a preposição não é um detalhe: é mudar o significado inteiro da mensagem. Um redator de ENEM que confunde preposições perde preciosos pontos de clareza.',
      pergunta:
        "De acordo com o texto, o que acontece quando usamos preposições diferentes na mesma ação?",
      opcoes: [
        "A ação ganha cores diferentes e o significado muda",
        "A frase se torna mais bonita e poética",
        "A preposição não interfere no sentido final",
      ],
      correta: 0,
      explicacao:
        'Exato. Preposição não é detalhe: ela modula o sentido. "Saír pela porta", "saír com raiva", "saír de manhã": mesma ação, cores diferentes. Errar aqui é perder clareza no ENEM.',
    }),
    multiplaEscolha({
      pergunta: "Qual combinação de verbo + preposição está correta?",
      opcoes: [
        "Insistir em, assistir a, obedecer a",
        "Insistir para, assistir em, obedecer em",
        "Insistir a, assistir para, obedecer de",
      ],
      correta: 0,
      explicacao:
        'Verbo + preposição é uma parceria fixada pela norma culta. "Insistir em", "assistir a" (ver ou aula), "obedecer a": decorar estas é investimento em clareza.',
    }),
  ],
});

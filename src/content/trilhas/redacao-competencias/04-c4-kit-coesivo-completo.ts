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
 * Competência IV do ENEM: Demonstrar conhecimento dos mecanismos linguísticos
 * necessários para a construção da argumentação (coesão superficial).
 */
export const c4KitCoesivoCompleto = defineLesson({
  id: "redacao-competencias-04-c4-kit-coesivo-completo",
  titulo: "C4: O kit coesivo completo",
  descricao:
    "Conectar as partes da redação com operadores argumentativos, referenciação e estrutura de parágrafos.",
  exercicios: [
    verdadeiroFalso({
      afirmacao: "Usar muitos conectivos (portanto, logo, entretanto) garante nota 200 em C4.",
      verdadeiro: false,
      explicacao:
        "Quantidade não é qualidade. Um conectivo mal usado (que não estabeleça relação lógica) enfraquece o texto. C4 avalia se os recursos coesivos ESTABELECEM relações lógicas adequadas entre as partes. Um texto com 3 conectivos bem pensados supera outro com 10 desalinhados.",
    }),
    multiplaEscolha({
      pergunta: "Qual é o papel de um operador argumentativo em C4?",
      opcoes: [
        "Encher o texto de palavras sofisticadas",
        "Estabelecer relação lógica entre partes (igualdade, adversidade, causa/consequência, conclusão)",
        "Substituir pontuação",
      ],
      correta: 1,
      explicacao:
        'Operadores argumentativos (assim como, entretanto, por isso, enfim) são as junções que sustentam o edifício. Eles dizem ao leitor: "esse argumento é semelhante ao anterior" (igualdade), "mas isto contrasta" (adversidade), "e por isso" (causa/consequência), "concluindo" (fechamento). Sem eles, frases flutuam soltas.',
    }),
    completeLacuna({
      frase:
        "O investimento em educação traz retorno econômico. ___, diversos estudos comprovam que alunos bem educados ganham mais ao longo da vida.",
      opcoes: ["Além disso", "Todavia", "Portanto"],
      correta: 0,
      explicacao:
        '"Além disso" adiciona um argumento similar (igualdade/reforço). "Todavia" criaria contraste indevido. "Portanto" indicaria conclusão prematura. Conhecer qual conectivo fecha a relação lógica é o trabalho de C4.',
    }),
    encontreOErro({
      frase:
        "A tecnologia transformou a educação porque permite acesso a conhecimento. Entretanto, o conhecimento é importante para o desenvolvimento pessoal.",
      // Tokenização: A(0) tecnologia(1) transformou(2) a(3) educação(4) porque(5) permite(6) acesso(7) a(8) conhecimento.(9) Entretanto,(10) o(11) conhecimento(12) é(13) importante(14) para(15) o(16) desenvolvimento(17) pessoal.(18)
      // Erro: "Entretanto" marca uma adversidade que não existe entre as frases. A 2ª frase reforça a 1ª (conhecimento é importante, por isso a tecnologia que permite acesso é transformadora). O conectivo está desalinhado. Palavra-alvo: "Entretanto" (índice 10).
      erroIndex: 10,
      explicacao:
        'O conectivo "Entretanto" marca uma reversão ou contraste; aqui, a 2ª frase reforça a 1ª, não a contesta. O adequado seria "Assim" ou "Portanto" ou remover o conectivo e usar vírgula. Conectivo desalinhado confunde o leitor: é a falha clássica em C4.',
    }),
    parear({
      instrucao: "Associe cada frase-problema ao tipo de falha em coesão",
      pares: [
        {
          a: "Educação é importante. O Brasil precisa de reforma",
          b: "Falta de referenciação; mudança abrupta de sujeito",
        },
        {
          a: "Escolas precisam de investimento porque há falta de recursos. Portanto, estrutura é o foco.",
          b: "Conectivo não estabelece relação lógica clara",
        },
        {
          a: "A tecnologia melhora a aprendizagem. Ela permite novas formas de interação.",
          b: "Boa referenciação e coesão interna",
        },
      ],
      explicacao:
        'Coesão é a liga entre frases e parágrafos. Quebras de sujeito sem referenciação, conectivos sem sentido lógico, e ausência de articulação são os principais furos em C4. A terceira frase é modelo: usa "ela" para retomar "tecnologia" e constrói progressão lógica.',
    }),
    multiplaEscolha({
      pergunta:
        "Qual técnica de referenciação NÃO é adequada para manter coesão em um texto sobre educação?",
      opcoes: [
        'Usar pronomes: "A educação é fundamental. Ela transforma..."',
        'Usar sinônimos: "A educação reduz desigualdade. Tal fenômeno observa-se..."',
        'Repetir "educação" em cada frase para deixar claro do que falo',
      ],
      correta: 2,
      explicacao:
        'Repetição é atolamento. Referenciação usa pronomes ("ela", "isso"), sinônimos ("tal fenômeno"), advérbios ("assim") para retomar a ideia sem cansaço. Variedade de referência mostra domínio; repetição monótona mostra pobreza vocabular e falta de técnica.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Um parágrafo bem estruturado em C4 tem ideia principal + ideias secundárias, com articulação explícita entre parágrafos.",
      verdadeiro: true,
      explicacao:
        "Essa é a base de C4 em nível parágrafo. Dentro do parágrafo, hierarquia clara; entre parágrafos, fios visíveis conectando um ao próximo. Sem essa estrutura, o leitor se perde.",
    }),
    interpretacao({
      texto:
        "Um texto com 200 em C4 articula bem as partes (frases ligam-se logicamente, parágrafos conectam-se) e apresenta repertório diversificado de recursos coesivos. Isso significa: não o mesmo conectivo repetido; não só pronomes, mas também sinônimos e expressões resumitivas; não apenas justaposição de ideias, mas encadeamento explícito. Um texto com 120 em C4 tem coesão mediana, com falhas e inadequações frequentes. O diferencial entre 160 e 200 é a diversidade: você não só conhece conectivos, mas os escolhe com precisão; não só usa pronomes, mas mescla técnicas de forma fluida.",
      pergunta: "Qual é a diferença entre nota 160 e nota 200 em C4, segundo o texto?",
      opcoes: [
        "Nota 200 tem mais parágrafos",
        "Nota 200 usa conectivos únicos; nota 160 repete os mesmos",
        "Nota 200 articula bem as partes com repertório diversificado de recursos; nota 160 articula com poucas inadequações",
      ],
      correta: 2,
      explicacao:
        "Qualidade da articulação e diversidade de recursos. Não é quantidade; é precisão. Conhecer várias técnicas de coesão e usá-las com estratégia eleva de 160 a 200. Isso é marca de maturidade textual.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Ausência de conectivos entre parágrafos é aceitável se a ideia principal de cada um é clara.",
      verdadeiro: false,
      explicacao:
        "Clareza de ideia não substitui articulação. C4 avalia especificamente os mecanismos de ligação entre as partes. Parágrafos soltos, sem pontes explícitas, revelam falta de domínio da coesão. Mesmo que a ideia seja clara, o texto enfraquece.",
    }),
  ],
});

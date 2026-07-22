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
 * Classes de Palavras I - Lição 09: Pronome relativo (introdução)
 */
export const pronomeRelativo = defineLesson({
  id: "classes-1-09-pronome-relativo",
  titulo: "Pronome relativo",
  descricao: "Que, qual, onde: as palavras que conectam ideias.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é um pronome relativo?",
      opcoes: [
        "Uma palavra que conecta duas orações e retoma um termo já mencionado",
        "Um pronome que faz perguntas sobre lugar",
        "Um verbo no infinitivo",
      ],
      correta: 0,
      explicacao:
        'Pronome relativo retoma e conecta: em "O livro que li era ótimo", o "que" retoma "livro" e junta as duas ideias num fluxo só. Economia e elegância.',
    }),
    verdadeiroFalso({
      afirmacao:
        'O pronome relativo "que" é o mais versátil e pode retomar qualquer termo anterior.',
      verdadeiro: true,
      explicacao:
        'Que funciona para pessoa, coisa, ideia: "O homem que saiu", "A casa que comprei", "A verdade que ninguém sabia". Versátil demais.',
    }),
    parear({
      instrucao: "Combine cada pronome relativo com seu uso principal",
      pares: [
        { a: "O menino que sorriu era tímido.", b: "Que (para qualquer antecedente)" },
        { a: "A professora, a qual você respeita, é sábia.", b: "Qual (mais formal, com vírgula)" },
        { a: "A cidade onde nasci é pequena.", b: "Onde (para lugar)" },
      ],
      explicacao:
        "Que é neutro. Qual é mais formal e refinado, exigindo vírgula. Onde é específico para lugar.",
    }),
    completeLacuna({
      frase: "A redação ___ enviei foi aprovada pelo professor.",
      opcoes: ["que", "qual", "onde"],
      correta: 0,
      explicacao:
        'Que retoma "redação" naturalmente. Qual seria muito formal aí. Onde seria errado porque redação não é um lugar.',
    }),
    encontreOErro({
      frase: "A garota que ela mora naquela casa é minha colega de classe.",
      erroIndex: 3,
      explicacao:
        'Ela sobra na frase: o relativo "que" já retoma "garota", então repetir o pronome depois é erro (o famoso pronome lembrete). O certo é "a garota que mora naquela casa".',
    }),
    multiplaEscolha({
      pergunta: "Em qual frase o pronome relativo criou uma estrutura mais elegante?",
      opcoes: [
        "Ele contou uma história. A história era triste.",
        "Ele contou uma história que era triste.",
        "Ele contou uma história de tristeza.",
      ],
      correta: 1,
      explicacao:
        "A opção B usa o pronome relativo para conectar fluidamente. A opção A é fragmentária. A opção C é nominal, menos dinâmica. Fluidez vence.",
    }),
    verdadeiroFalso({
      afirmacao: "O pronome relativo sempre vem imediatamente após o termo que ele retoma.",
      verdadeiro: false,
      explicacao:
        'Nem sempre! Pode haver adjuntos entre o antecedente e o relativo: "O livro que comprei na feira ontem...". Posição natural é logo depois, mas a língua é flexível.',
    }),
    completeLacuna({
      frase: "O filme ___ assistimos ontem era de ficção científica.",
      opcoes: ["que", "o qual", "ao qual"],
      correta: 2,
      explicacao:
        'Assistir, no sentido de ver, pede a preposição "a": assistir A um filme. Por isso o relativo certo aqui é "ao qual". "O filme que assistimos" é super comum na fala, mas foge da norma culta.',
    }),
    interpretacao({
      texto:
        'Pronomes relativos são a cola da elegância: transformam dois períodos simples e chatos em um período complexo e fluido. Um escritor que domina relativos sabe fazer frases longas sem deixar o leitor se perder. No ENEM, essa é uma marca de maturidade textual: juntar ideias com "que", "qual", "onde" sem desorganizar o pensamento. A leitura fica leve, o argumento forte.',
      pergunta: "Segundo o texto, qual é o efeito de usar pronomes relativos na redação?",
      opcoes: [
        "Torna a redação mais longa e cansativa",
        "Transforma períodos simples em estrutura complexa e fluida",
        "É apenas um detalhe, sem impacto real",
      ],
      correta: 1,
      explicacao:
        "O texto ressalta que relativos criam elegância e fluidez, evitando fragmentação. É um marcador de maturidade textual.",
    }),
  ],
});

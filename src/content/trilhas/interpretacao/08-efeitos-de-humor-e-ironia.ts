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
 * Lição sobre humor e ironia: o dito e o não-dito.
 */
export const EfeitosDeHumorEIronia = defineLesson({
  id: "interpretacao-08-efeitos-de-humor-e-ironia",
  titulo: "Efeitos de humor e ironia",
  descricao: "Reconhecer ironia, sarcasmo e humor nas entrelinhas.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é ironia?",
      opcoes: [
        "Uma brincadeira que faz todos rirem",
        "Dizer algo significando o contrário ou contradição entre o esperado e o real",
        "Uma figura de linguagem que compara duas coisas",
      ],
      correta: 1,
      explicacao:
        "Ironia é a inversão do sentido: você diz A para significar não-A, ou mostra o oposto do esperado. É o alicerce do humor refinado: quem entende a contradição sorri.",
    }),
    verdadeiroFalso({
      afirmacao: "Toda ironia é feita para fazer rir; se não há riso, não é ironia.",
      verdadeiro: false,
      explicacao:
        'Ironia pode ser séria ou até amarga. Um texto que diz "que futuro brilhante nos espera" enquanto descreve tragédia é ironia pesada, não cômica. Base da ironia é contradição, não riso.',
    }),
    multiplaEscolha({
      pergunta:
        'Um texto sobre desemprego escreve: "Conseguir emprego nunca foi tão fácil neste país: basta estar desesperado." Qual é o efeito?',
      opcoes: [
        "Elogio sincero à facilidade de encontrar trabalho",
        "Ironia crítica mostrando o oposto da realidade",
        "Descrição neutra de como as pessoas conseguem emprego",
      ],
      correta: 1,
      explicacao:
        'A ironia está na contradição: "fácil" seguido de "basta estar desesperado" revela que na verdade é difícil e exigente. O alicerce é mostrar o contrário do que parece dizer.',
    }),
    completeLacuna({
      frase: "O ___ é quando o locutor exagera excessivamente para ridicularizar algo ou alguém.",
      opcoes: ["sarcasmo", "hipérbole", "exagero humorístico"],
      correta: 1,
      explicacao:
        "Sarcasmo é irmão próximo da ironia: usa tom mordaz e zombador. Hipérbole é exagero puro para efeito. O alicerce do sarcasmo é a intenção de ofender ou ridicularizar através de ironia.",
    }),
    encontreOErro({
      frase: "A ironia sempre é óbvia e o leitor não precisa fazer inferência para entendê-la.",
      erroIndex: 2,
      explicacao:
        "Errado. A ironia frequentemente é discreta, exige que o leitor deduza a contradição. Ironia óbvia é fraca; ironia sutil é arte. Base do bom humor está na discreção.",
    }),
    parear({
      instrucao: "Combine cada técnica de humor com seu funcionamento",
      pares: [
        { a: "Ironia", b: "Dizer algo significando o contrário" },
        { a: "Sarcasmo", b: "Usar ironia com tom mordaz e zombador" },
        { a: "Paródia", b: "Imitar estilo ou obra para ridicularizar" },
        { a: "Trocadilho", b: "Brincar com duplo sentido de palavras" },
      ],
      explicacao:
        "Cada técnica tem sua base própria. Ironia é contradição de sentido, sarcasmo é contradição com agressividade, paródia é imitação crítica. Alicerce é sempre o reconhecimento pela audiência.",
    }),
    interpretacao({
      texto: `Uma crônica descrita: "Fui ao banco pedir empréstimo. O gerente ouviu minha história de desemprego de seis meses e respondeu com um sorriso: 'Parabéns, você é exatamente o cliente que procuramos'. Saí de lá com R$0 no bolso e com a certeza de que o sistema financeiro tem um ótimo senso de humor." A ironia está em duas camadas: o gerente não ofereceu empréstimo, e o narrador finaliza fingindo achar engraçado o absurdo.`,
      pergunta: "Qual é a crítica central desta passagem irônica?",
      opcoes: [
        "O sistema bancário realmente quer ajudar os desempregados",
        "O gerente foi muito simpático e humorístico",
        "As instituições financeiras negam crédito para quem mais precisa, o que é absurdo",
      ],
      correta: 2,
      explicacao:
        'A base da ironia está no contraste: gerente sorri (esperaria gentileza), mas nega crédito (ofereceu nada). O "senso de humor" final é sarcasmo amargo. Crítica sólida através de contradição.',
    }),
    verdadeiroFalso({
      afirmacao: "Ironia pode ser mal interpretada se o leitor não conhecer o contexto adequado.",
      verdadeiro: true,
      explicacao:
        'Sim. Ironia vive do contexto. Uma frase "ótimo trabalho" é elogio sincero em um contexto e sarcasmo em outro. Base de compreensão está em saber o contexto.',
    }),
    ordenar({
      blocos: [
        "Leia a frase e entenda o significado literal.",
        "Procure por uma contradição: algo não bate.",
        "Identifique qual é o sentido REAL por trás do que foi dito.",
        "Determine a intenção: é crítica, humor, zombaria ou amargura.",
        "Integre a ironia à leitura global do texto.",
      ],
      explicacao:
        "Estratégia para ler ironia: literal primeiro, contradição depois, dedução final. Base estruturada em cada degrau.",
    }),
    interpretacao({
      texto:
        'Um texto satírico sobre redes sociais escreve: "Nunca nos sentimos tão conectados. Milhões de pessoas compartilhando sua vida inteira com desconhecidos em tempo real. É lindo demais: pare de chorar de emoção. Somos todos influenciadores de nós mesmos, a maior audiência do universo: nós mesmos." O tom está recheado de ironia e sarcasmo para criticar a cultura digital.',
      pergunta: "Qual é a crítica real do autor através da ironia?",
      opcoes: [
        "Redes sociais realmente nos conectam de forma genuína",
        "Compartilhar com desconhecidos é ótimo para relacionamentos",
        "Redes sociais criam ilusão de conexão e obsessão narcisista",
      ],
      correta: 2,
      explicacao:
        'O autor inverte: "conectados" = isolados digitalmente; "lindo" = vazio; "influenciadores" = auto-absortos. Base da crítica está na contradição entre aparência e realidade. Ironia revela hipocrisia.',
    }),
  ],
});

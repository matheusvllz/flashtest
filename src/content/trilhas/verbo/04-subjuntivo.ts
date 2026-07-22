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

export const subjuntivo = defineLesson({
  id: "verbo-04-subjuntivo",
  titulo: "Subjuntivo: presente, imperfeito e futuro",
  descricao: "O modo da possibilidade, da dúvida e do irrealizável.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Em que situação usamos o subjuntivo?",
      opcoes: [
        "Para falar de fatos reais e certos",
        "Para falar de possibilidades, desejos, dúvidas e hipóteses",
        "Para dar ordens e comandos",
      ],
      correta: 1,
      explicacao:
        'O subjuntivo não afirma nada como certo. Ele flutua no mundo da possibilidade: "espero que você venha", "se eu fosse rico", "quando você chegue". O indicativo é terra firme; o subjuntivo é neblina.',
    }),
    multiplaEscolha({
      pergunta: "Qual frase usa o subjuntivo de forma correta?",
      opcoes: [
        "Tenho certeza que ele viria amanhã.",
        "Embora ele trabalhe muito, nunca fica rico.",
        "Quando ele chegar, me liga.",
      ],
      correta: 1,
      explicacao:
        'Em "embora ele trabalhe", temos certeza da ação, mas expressamos uma concessão ("mesmo assim, não fica rico"). "Trabalhe" é subjuntivo porque encaixa na estrutura "embora + subjuntivo". As outras duas têm indicativo sendo falsos amigos.',
    }),
    completeLacuna({
      frase: "Espero que você ___ de férias muito em breve.",
      opcoes: ["vai", "irá", "vá"],
      correta: 2,
      explicacao:
        'Depois de "espero que", o subjuntivo é obrigatório. "Vá" é subjuntivo presente. "Vai" e "irá" são indicativo, e não combinam com "espero que" porque indicativo afirma certeza, enquanto "esperar" abre espaço pra possibilidade.',
    }),
    verdadeiroFalso({
      afirmacao:
        'O subjuntivo imperfeito (se eu fosse, se você comesse) só aparece em orações iniciadas por "se".',
      verdadeiro: false,
      explicacao:
        'O imperfeito do subjuntivo aparece em vários contextos de irrealidade: "se eu fosse", "quando você comesse (no passado)", "embora ele partisse". O "se" é um contexto comum, mas não o único.',
    }),
    encontreOErro({
      frase: "Contanto que você faz o seu melhor, tudo ficará bem.",
      // Contanto(0) que(1) você(2) faz(3) o(4) seu(5) melhor(6) tudo(7) ficará(8) bem(9)
      erroIndex: 3,
      explicacao:
        'Depois de "contanto que" (que expressa condição), o subjuntivo é obrigatório. "Faz" é indicativo presente, mas deveria ser "faça" (subjuntivo). A estrutura "contanto que" sempre puxe o subjuntivo pra dentro dela.',
    }),
    parear({
      instrucao: "Combine cada oração ao tempo do subjuntivo correto",
      pares: [
        { a: "Espero que você estude para a prova.", b: "Subjuntivo presente" },
        { a: "Se eu tivesse dinheiro, viajaria.", b: "Subjuntivo imperfeito" },
        { a: "Quando você chegar, me avise.", b: "Subjuntivo futuro" },
      ],
      explicacao:
        'Cada tempo do subjuntivo marca uma possibilidade em um eixo temporal: presente ("estude"), passado hipotético ("tivesse"), e futuro incerto ("chegar"). O subjuntivo é sempre sobre o que PODE ser, não sobre o que É.',
    }),
    ordenar({
      blocos: [
        "Se eu tivesse coragem,",
        "eu não esperaria tanto tempo",
        "para dizer a verdade.",
        "Mas tenho medo de machucar você.",
      ],
      explicacao:
        'O subjuntivo imperfeito "tivesse" abre uma porta para o irreal. O condicional "não esperaria" responde a essa hipótese. A sequência faz sentido: hipótese + consequência + realidade que explica tudo.',
    }),
    interpretacao({
      texto:
        'Muitos estudantes acreditam que o subjuntivo é difícil. Mas basta compreender que ele marca tudo aquilo que NÃO é certeza. Quando o professor diz "é importante que você chegue no horário", usa subjuntivo "chegue" porque o futuro é incerto. Se dissesse "você chega", estaria afirmando como certeza. O subjuntivo é a ferramenta da incerteza, da possibilidade, do desejo. Uma vez que você entende isso, cada frase te mostra o tempo certo naturalmente.',
      pergunta: 'Por que o texto diz que "chegue" é subjuntivo enquanto "chega" seria indicativo?',
      opcoes: [
        'Porque "chegue" é mais educado e formal',
        'Porque "chegue" marca uma possibilidade futura, enquanto "chega" afirma como certeza',
        'Porque "chegue" é mais rápido de pronunciar',
      ],
      correta: 1,
      explicacao:
        'Exatamente. "Chegue" flutuador, possível. "Chega" é terra firme, real e certo. A diferença entre indicativo e subjuntivo é a diferença entre o certo (indicativo) e o possível (subjuntivo).',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "Caso você precise de ajuda, venha me procurar", os dois verbos estão no subjuntivo.',
      verdadeiro: true,
      explicacao:
        'Sim. "Precise" (subjuntivo, condição incerta) e "venha" (subjuntivo, ordem modalizada pela condição). "Caso" é um conectivo que sempre puxa subjuntivo, assim como "se", "embora", "ainda que" e outros.',
    }),
    multiplaEscolha({
      pergunta: "Qual alternativa tem USO INCORRETO do subjuntivo?",
      opcoes: [
        "Embora ele seja inteligente, não consegue passar.",
        "Quando você termine o trabalho, me avise.",
        "Acho que ele viaje para o exterior semana que vem.",
      ],
      correta: 2,
      explicacao:
        'Depois de "achar que" afirmativo, o verbo vem no indicativo, porque "achar" trata a opinião quase como certeza. O certo é "acho que ele viaja". O subjuntivo ("viaje") só entraria numa frase negativa, tipo "não acho que ele viaje".',
    }),
  ],
});

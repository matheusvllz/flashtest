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

export const vozesVerbais = defineLesson({
  id: "verbo-07-vozes-verbais",
  titulo: "Vozes verbais: ativa, passiva e reflexiva",
  descricao: "Quem faz a ação mudando a perspectiva da frase.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Na voz ativa, qual é o papel do sujeito?",
      opcoes: ["Sofrer a ação", "Realizar, fazer a ação", "Não aparecer na frase"],
      correta: 1,
      explicacao:
        'Voz ativa: sujeito ativo, que FAZ. "O gato comeu o peixe". Quem faz? O gato. É o agente da ação. E ponto.',
    }),
    multiplaEscolha({
      pergunta: "Qual é a estrutura correta de uma passiva com agente da ação?",
      opcoes: [
        "Verbo ser + particípio + por + agente",
        "Verbo estar + particípio + para + agente",
        "Particípio + verbo ser + agente",
      ],
      correta: 0,
      explicacao:
        'A passiva de "o gato comeu o peixe" é "o peixe foi comido pelo gato". Verbo "ser" conjugado + particípio do verbo principal + por + quem fez. Simples, mas há armadilha em colocar o "por" no fim ou esquecer o auxiliar.',
    }),
    completeLacuna({
      frase: "Os alunos ___ elegidos para representar a escola.",
      opcoes: ["foram", "são", "estão"],
      correta: 0,
      explicacao:
        'A voz passiva com ação concluída pede "foram" (pretérito perfeito de "ser") + particípio. "Foram elegidos" marca uma ação que se completou. "São" seria presente (estão sendo elegidos agora), e "estão" é errado porque mistura "estar" com particípio, que soa estado, não ação completada.',
    }),
    verdadeiroFalso({
      afirmacao:
        "A voz reflexiva sempre precisa de um agente externo; o sujeito não pode agir sobre si mesmo.",
      verdadeiro: false,
      explicacao:
        'Totalmente ao contrário. A voz reflexiva é EXATAMENTE o sujeito agindo sobre si mesmo. "Ela se penteia", "eu me curei", "nós nos abraçamos". O reflexivo é a autossuficiência verbal.',
    }),
    encontreOErro({
      frase: "As decisões foi tomadas pelos diretores da empresa.",
      // As(0) decisões(1) foi(2) tomadas(3) pelos(4) diretores(5) da(6) empresa(7)
      erroIndex: 2,
      explicacao:
        'O verbo "foi" está no singular, mas o sujeito "as decisões" é plural. Na voz passiva, o verbo "ser" concorda com o sujeito que sofre a ação, então o certo é "foram tomadas". Concordância não falha nem dentro da passiva.',
    }),
    parear({
      instrucao: "Combine cada frase ao tipo de voz verbal",
      pares: [
        { a: "O professor ensina os alunos.", b: "Voz ativa" },
        { a: "Os alunos são ensinados pelo professor.", b: "Voz passiva" },
        { a: "A criança se penteia sozinha.", b: "Voz reflexiva" },
      ],
      explicacao:
        'Voz ativa: sujeito faz. Voz passiva: sujeito sofre (e geralmente vem marcado quem faz, com "por"). Voz reflexiva: sujeito faz em si mesmo. Três perspectivas da mesma ação.',
    }),
    ordenar({
      blocos: [
        "Ativa: o pintor pintou o quadro.",
        "Passiva: o quadro foi pintado pelo pintor.",
        "Reflexiva: o pintor se pintou (de tinta).",
      ],
      explicacao:
        "A mesma ação em três vozes. Ativa: pintor é o foco, quadro é passivo. Passiva: quadro é o foco, pintor é secundário. Reflexiva: pintor faz em si mesmo. Cada uma abre uma porta diferente pro sentido.",
    }),
    interpretacao({
      texto:
        'A voz passiva é ferramenta importante em textos científicos e acadêmicos, onde a ação importa mais que quem a faz. "O experimento foi realizado em laboratório" soa neutro, objetivo, sem viés. Já "nós realizamos o experimento" é mais pessoal. A passiva também esconde responsabilidade quando convém: "erros foram cometidos" é estrategicamente vago em comparação a "você cometeu erros". Numa redação de prova, a voz passiva é marca de formalidade, mas nunca uma fuga: se você usar, que seja clara.',
      pergunta: "Por que o texto alerta sobre esconder responsabilidade com a passiva?",
      opcoes: [
        "Porque a passiva é gramaticalmente incorreta",
        "Porque a passiva pode ser usada para ser vago e evitar culpa",
        "Porque a passiva é muito informal",
      ],
      correta: 1,
      explicacao:
        'Exato. A passiva é tecnicamente legítima, mas politicamente interessante: "decisões foram tomadas" é menos comprometedor que "eu tomei decisões erradas". Em redação e em textos reais, observa-se quando alguém começa a usar passiva demais, porque ali há algo para esconder.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Em "meu celular se danificou", o verbo está em voz reflexiva porque o sujeito age sobre si mesmo.',
      verdadeiro: true,
      explicacao:
        'Sim. "Se danificou" mostra que o celular sofreu a ação (foi danificado), e fez isso consigo mesmo. É reflexivo: o sujeito e o objeto são a mesma coisa. Diferente de "alguém danificou meu celular" (ativa com agente externo).',
    }),
    multiplaEscolha({
      pergunta: "Qual transformação para voz passiva está INCORRETA?",
      opcoes: [
        'Ativa: "O governo construiu a ponte". Passiva: "A ponte foi construída pelo governo".',
        'Ativa: "Todos admiram Maria". Passiva: "Maria é admirada por todos".',
        'Ativa: "Ele roubou o dinheiro". Passiva: "O dinheiro foi roubado por ele dela".',
      ],
      correta: 2,
      explicacao:
        'Na terceira, há erro: "roubado por ele dela" está confuso e duplica agentes. Deveria ser "o dinheiro foi roubado por ele" ou "dela", não ambos. A passiva pode ter agente único, mas não dois ao mesmo tempo dessa forma.',
    }),
  ],
});

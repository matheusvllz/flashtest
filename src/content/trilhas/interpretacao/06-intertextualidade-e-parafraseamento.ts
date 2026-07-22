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
 * Lição sobre intertextualidade e paráfrase: diálogo entre textos.
 */
export const IntertextualidadeEParafrase = defineLesson({
  id: "interpretacao-06-intertextualidade-e-parafraseamento",
  titulo: "Intertextualidade e paráfrase",
  descricao: "Reconhecer referências e reescrever mantendo o sentido.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é intertextualidade?",
      opcoes: [
        "A reprodução exata de um texto dentro de outro texto",
        "O diálogo entre textos, quando um referencia ou conversa com outro",
        "A soma de todos os significados possíveis de uma palavra",
      ],
      correta: 1,
      explicacao:
        "Intertextualidade é a conversa entre textos: um texto fala com outro, cita, alude, dialoga. É um alicerce literário: nada existe isolado, tudo se constrói sobre o que já foi dito.",
    }),
    verdadeiroFalso({
      afirmacao:
        "A intertextualidade exige que o leitor conheça o texto original para compreender a referência.",
      verdadeiro: true,
      explicacao:
        'Sim. Se o texto cita "ser ou não ser", você precisa conhecer Hamlet para capturar a profundidade. Base compartilhada é o alicerce de referência bem-sucedida.',
    }),
    multiplaEscolha({
      pergunta: "O que é paráfrase?",
      opcoes: [
        "Copiar um texto palavra por palavra",
        "Reescrever um texto mantendo o sentido, mas com palavras diferentes",
        "Criticar as ideias de um texto através de ironia",
      ],
      correta: 1,
      explicacao:
        "Paráfrase é reescrever preservando o núcleo: o sentido, a ideia, a intenção. Mudam-se as palavras, mas a base permanece intacta.",
    }),
    completeLacuna({
      frase:
        "A ___ é uma forma de intertextualidade onde o autor cita diretamente as palavras de outro texto.",
      opcoes: ["alusão", "citação", "estilização"],
      correta: 1,
      explicacao:
        "Citação é a forma mais direta: reproduz o texto original entre aspas. É a base mais explícita de intertextualidade, deixando claro que é empréstimo de outro autor.",
    }),
    encontreOErro({
      frase:
        "A paráfrase mantém exatamente as mesmas palavras do texto original, apenas reorganizadas na sequência.",
      erroIndex: 2,
      explicacao:
        "Errado. Paráfrase muda palavras sim. Se você só reorganizar a sequência mantendo tudo igual, não é paráfrase, é anagrama. A base está em trocar lexicon, não só ordem.",
    }),
    parear({
      instrucao: "Combine cada recurso intertextual com seu funcionamento",
      pares: [
        { a: "Citação", b: "Reproduz textualmente entre aspas" },
        { a: "Alusão", b: "Faz referência indireta sem nomear" },
        { a: "Paráfrase", b: "Reescreve mantendo sentido" },
        { a: "Pastiche", b: "Imita estilo de outro autor para homenagear ou ironizar" },
      ],
      explicacao:
        "Cada recurso tem sua base própria. Citação é direta, alusão é discreta, paráfrase é reescrita, pastiche é imitação. O alicerce é o tipo de diálogo estabelecido.",
    }),
    interpretacao({
      texto:
        'Um texto moderno escreve: "Ser freelancer ou ter emprego, eis a questão". Aqui, o autor faz uma alusão ao famoso "Ser ou não ser" de Hamlet de Shakespeare. O leitor que conhece o clássico percebe que há uma intenção irônica: a angústia existencial de Hamlet é comparada de forma cômica à decisão de carreira do século 21. A intertextualidade funciona porque o leitor reconhece a base literária e sente o contraste proposto.',
      pergunta: "Por que a alusão ao Hamlet funciona neste texto?",
      opcoes: [
        "Porque cita a obra diretamente com aspas e referência de página",
        "Porque convida o leitor a reconhecer a comparação entre angústia existencial e decisão profissional",
        "Porque critica duramente quem não lê os clássicos da literatura",
      ],
      correta: 1,
      explicacao:
        "A alusão funciona no subentendido: leitor culto reconhece Hamlet, percebe o paralelo cômico. É um diálogo tácito. A base é a parceria entre texto e leitura atenta.",
    }),
    verdadeiroFalso({
      afirmacao: "Paráfrase e plágio são a mesma coisa.",
      verdadeiro: false,
      explicacao:
        "Não. Paráfrase é legítima: reescreve com permissão ou contexto claramente acadêmico. Plágio esconde a origem. Base da ética está em dar crédito e deixar claro que é reescrita.",
    }),
    ordenar({
      blocos: [
        "Identifique se há uma referência a outro texto (citação, alusão ou paráfrase).",
        "Localize o texto ou autor original se possível.",
        "Entenda a intenção: por que o autor escolheu exatamente essa referência.",
        "Perceba o efeito: humor, crítica, aprofundamento, homenagem.",
        "Integre a referência à compreensão geral do texto lido.",
      ],
      explicacao:
        "Essa é a estratégia para dominar intertextualidade: reconhecer primeiro, contextualizar depois, integrar por fim. Base sólida em cada degrau.",
    }),
    interpretacao({
      texto:
        'Texto original: "A educação é o caminho para transformar a sociedade". Paráfrase do texto: "Através da educação é possível promover mudanças profundas na estrutura social". Qual está certo? Ambos. O primeiro é conciso; o segundo, explicativo. A paráfrase não descarta o original, apenas expande ou simplifica conforme o contexto.',
      pergunta: "Qual é a vantagem de fazer uma paráfrase em vez de apenas copiar?",
      opcoes: [
        "A paráfrase sempre fica mais bonita e elegante",
        "A paráfrase permite adaptação ao contexto e à audiência enquanto mantém a ideia",
        "A paráfrase não precisa dar crédito ao autor original",
      ],
      correta: 1,
      explicacao:
        "Paráfrase é ferramenta de flexibilidade: você adapta ao seu texto, sua audiência, seu tom. Base permanece sólida porque a ideia não muda. É reescrita a serviço do contexto.",
    }),
  ],
});

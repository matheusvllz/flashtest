import {
  defineLesson,
  multiplaEscolha,
  verdadeiroFalso,
  parear,
  encontreOErro,
  completeLacuna,
  interpretacao,
} from "@/lib/lessons/define";

/**
 * Lição 11: Agente da passiva
 */
export const agentePassiva = defineLesson({
  id: "sintaxe-1-11-agente-da-passiva",
  titulo: "Agente da passiva",
  descricao: "O termo que identifica quem realiza a ação na oração passiva.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é agente da passiva?",
      opcoes: [
        "O ser que sofre a ação na oração passiva",
        "O ser que realiza a ação na oração passiva",
        "O verbo que marca a passiva",
      ],
      correta: 1,
      explicacao:
        'Agente da passiva é quem faz: em "O livro foi lido por Maria", Maria é agente. Sofre a ação é o paciente (o livro). Inversão de papéis estrutura a passiva.',
    }),
    multiplaEscolha({
      pergunta: 'Em "A lei foi sancionada pelo presidente", quem é o agente da passiva?',
      opcoes: ["A lei", "O presidente", "Foi sancionada"],
      correta: 1,
      explicacao:
        "O presidente faz a ação (sancionar). Ele é quem age, quem realiza. Lei sofre (é sancionada). Papéis invertidos: paciente em primeiro plano, agente introduzido por preposição.",
    }),
    verdadeiroFalso({
      afirmacao: 'O agente da passiva é sempre introduzido pela preposição "por".',
      verdadeiro: true,
      explicacao:
        'Verdadeiro. "Por" é tubo que leva a ação de volta ao agente. "Amado por seus filhos", "Admirado pelo povo". "Por" marca a inversão essencial da voz passiva.',
    }),
    completeLacuna({
      frase:
        'Em "A verdade foi ocultada ___ autoridades", a preposição que introduz o agente é "por".',
      opcoes: ["pelas", "pela", "pelo"],
      correta: 0,
      explicacao:
        'Pelas (por + as): a preposição concorda em gênero e número com "autoridades", que é plural feminino. "Ocultada pelas autoridades" veste a estrutura corretamente.',
    }),
    encontreOErro({
      frase: "O crime foi investigado de polícia competente.",
      erroIndex: 4,
      explicacao:
        'A preposição "de" é incorreta aqui. Deve ser "por": "investigado pela polícia". "De" marcaria posse ou material, não agência. O tubo correto é "por".',
    }),
    parear({
      instrucao: "Combine cada frase passiva com seu agente",
      pares: [
        { a: "A obra foi construída pelos engenheiros.", b: "Agente: engenheiros" },
        { a: "O poema foi escrito por Fernando Pessoa.", b: "Agente: Fernando Pessoa" },
        { a: "A decisão foi tomada pelo juiz.", b: "Agente: juiz" },
      ],
      explicacao:
        'Agente sempre vem após "por" (ou "pela", "pelo", "pelas", "pelos", que são a preposição fundida com o artigo). Estrutura que resgata quem faz quando o verbo está na passiva.',
    }),
    verdadeiroFalso({
      afirmacao: "Numa oração passiva sem agente explícito, a ação não tem quem a realize.",
      verdadeiro: false,
      explicacao:
        'Falso. Sem agente explícito, apenas não nomeamos quem faz: "A porta foi aberta" não diz por quem, mas a ação tem agente implícito (alguém abriu). Omissão intencional ou elegância.',
    }),
    interpretacao({
      texto:
        'A voz passiva é ferramenta estratégica. Na notícia "O ladrão foi preso pela polícia", a polícia é agente claro. Mas "Foram cometidos crimes" (passiva sem agente) desvia responsabilidade: quem cometeu? Mistério. A redação de ENEM pede voz ativa majoritariamente porque força clareza: "A polícia prendeu o ladrão" marca quem faz. Mas passiva sem agente é recurso legítimo quando se quer vagueza estratégica. Não é erro, é escolha.',
      pergunta:
        'Conforme o texto, qual é a diferença de impacto entre "A polícia prendeu o ladrão" e "O ladrão foi preso"?',
      opcoes: [
        "Primeira: quem faz é claro; segunda: ação vira nebulosa",
        "Não há diferença de impacto, só de estrutura gramatical",
        "Segunda é sempre melhor porque é mais elegante",
      ],
      correta: 0,
      explicacao:
        "Voz ativa clareia quem faz; passiva sem agente borrifa. Redação excelente clareia estruturas, não deixa responsabilidade a flutuar. Passiva sem agente é risco que o bom redator evita ou usa com propósito consciente.",
    }),
  ],
});

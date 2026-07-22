import {
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Casos de banca: O que anula a redação e o que derruba a nota nas 5 competências.
 * Conhecimento prático baseado nas regras oficiais de nota 0 do ENEM.
 */
export const casosBancaAnulaDerruba = defineLesson({
  id: "redacao-competencias-06-casos-banca-anula-derruba",
  titulo: "Casos de banca: O que anula e o que derruba",
  descricao: "Conheça os motivos de nota 0 e as armadilhas que reduzem drasticamente a pontuação.",
  exercicios: [
    multiplaEscolha({
      pergunta:
        "Qual dessas situações ANULA a redação (nota zero total, sem avaliação nas competências)?",
      opcoes: [
        "Identificar-se fora do espaço destinado (nome, assinatura, rubrica em qualquer lugar da folha)",
        "Ter 2 ou 3 erros de acentuação",
        "Misturar descrição com dissertação em alguns parágrafos",
      ],
      correta: 0,
      explicacao:
        "Identificação fora do local correto é critério automático de anulação. A banca valoriza sigilo. Erros de acentuação e tipo textual prejudicam a nota, mas não anulam. Anulação é para infrações formais ou desistência deliberada.",
    }),
    verdadeiroFalso({
      afirmacao:
        'Uma redação com menos de 8 linhas manuscritas é considerada "Texto insuficiente" e recebe nota zero.',
      verdadeiro: true,
      explicacao:
        "O mínimo efetivo é mais de 7 linhas (ou mais de 10 no Braille). Até 7 linhas = nota 0. A lógica é que não há espaço para desenvolver uma argumentação mínima.",
    }),
    multiplaEscolha({
      pergunta: "Qual desses tipos de conteúdo NÃO causa anulação automática?",
      opcoes: [
        "Desenhos propostos ou formas propositais de anulação (rabiscos, garatujas fora de contexto)",
        "Texto escrito predominantemente em língua estrangeira",
        'Uma frase solta sobre seu próprio desempenho na prova ("Que prova difícil, não consegui fazer")',
      ],
      correta: 2,
      explicacao:
        "Desenhos sem função e texto em língua estrangeira anulam. Uma frase fora de contexto sobre a prova, ou até uma breve oração/mensagem pontual, pode anular SE desconectada do corpo do texto e proposital; mas se for isolada e breve, a banca avalia caso a caso. Isolamento e intencionalidade definem anulação. Mensagens políticas de protesto anulam; reflexões pessoais soltas podem não anular se mínimas.",
    }),
    encontreOErro({
      frase:
        "A sociedade está destruída e o Brasil é o pior país do mundo. Ninguém tem valor aqui.",
      // Tokenização: A(0) sociedade(1) está(2) destruída(3) e(4) o(5) Brasil(6) é(7) o(8) pior(9) país(10) do(11) mundo.(12) Ninguém(13) tem(14) valor(15) aqui.(16)
      // Essa frase é problemática porque: 1) generalização absurda, 2) falta de repertório, 3) pode ser vista como expressão de ódio ou desrespeito. A palavra-alvo seria "pior" (índice 9) ou "destruída" (índice 3). Vou usar "destruída" (índice 3).
      erroIndex: 3,
      explicacao:
        'Generalizações extremas ("sociedade destruída", "Brasil pior") sem nuance e repertório não apenas enfraquecem a argumentação em C3; também podem ser lidas como expressão de desespero ou discurso simplista. A banca quer reflexão crítica, não lamúria. Além disso, afirmar que "ninguém tem valor" roça em desrespeito a direitos humanos, risco de redução severa ou anulação de C5.',
    }),
    verdadeiroFalso({
      afirmacao:
        "Se você copiar mais de 5 linhas dos textos motivadores da prova, sua redação é automaticamente anulada.",
      verdadeiro: false,
      explicacao:
        "Cópia não anula automaticamente. Mas linhas copiadas: (1) não contam para o mínimo de 8 linhas, (2) prejudicam C2 (falta de repertório próprio e compreensão), (3) reduzem a nota severamente. Cópia integral de todo o texto anularia por falta de autoria; excertos são penalizados, não anulados.",
    }),
    multiplaEscolha({
      pergunta:
        "Um texto legível, bem estruturado, mas que FOGE totalmente ao tema proposto recebe qual nota final?",
      opcoes: [
        "0 (zero); redação anulada",
        "40 em C2, C3 e C5; avaliação nas demais",
        "80 em todas as competências",
      ],
      correta: 0,
      explicacao:
        "Fuga total ao tema é critério de anulação automática. Nem o assunto amplo nem o tema específico são desenvolvidos. A nota final é 0, sem avaliação em competências. Estrutura bonita não salva se o aluno falou de outro assunto completamente.",
    }),
    multiplaEscolha({
      pergunta:
        "Qual situação causa penalidade em C2, C3 e C5 (limita a nota a máximo 40), mas não anula?",
      opcoes: [
        "Tangenciamento: abordagem parcial baseada só no assunto amplo, ignorando o recorte temático",
        "Texto ilegível",
        "Desistência deliberada (em branco)",
      ],
      correta: 0,
      explicacao:
        'Tangenciamento é quando você pega o tema geral mas não o específico. Ex.: tema era "Segurança nas ruas de bairros periféricos"; você abordou "segurança em geral" sem mencionar bairros periféricos. Isso limita C2, C3 e C5 a 40 pontos; C1 e C4 são avaliadas normalmente. Não anula, mas derruba bastante.',
    }),
    interpretacao({
      texto:
        'A linha entre "redação anulada" (nota 0 total) e "redação penalizada" (redução severa) é delicada. Identidade fora do local, texto em branco ou com menos de 8 linhas, fuga total, desenhos propostos, texto em língua estrangeira, ilegibilidade comprovada por dois avaliadores: esses casos resultam em nota 0 absoluta. Cópia pesada, tangenciamento, tangência a direitos humanos, desrespeito em frase isolada: esses prejudicam competências específicas ou limitam notas. A diferença: anulação é bina (0 ou não-zero); penalização é gradual (quanto pior, mais cai). Um texto que toca em preconceito mas não é o foco anula C5? Não; é analisado contexto. Um que defende tortura ou violência: C5 = 0, mas redação avaliada nas demais? Não; é anulação completa se caracterizar discurso de ódio sistemático.',
      pergunta: "Qual é a diferença principal entre anulação total e penalização de competência?",
      opcoes: [
        "Anulação = nota 0 em tudo; penalização = redução em competência específica",
        "Anulação é mais grave; penalização é mais leve",
        "Anulação afeta só C5; penalização afeta todas",
      ],
      correta: 0,
      explicacao:
        "Anulação é binária: redação não recebe nota em nenhuma competência. Penalização é seletiva: pode afetar C2 e C3 (tangenciamento) ou só C5 (direitos humanos borderline). Conhecer essa distinção ajuda a evitar furos críticos.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Um parágrafo único, sem divisão, prejudica a nota em C4, mas não anula a redação.",
      verdadeiro: true,
      explicacao:
        "Texto em um bloco enfraquece estrutura de parágrafos (avaliada em C4), reduzindo a nota nessa competência. Mas não é motivo de anulação. C1, C2, C3, C5 seguem sendo avaliadas. É fraqueza estrutural, não infração formal.",
    }),
    verdadeiroFalso({
      afirmacao:
        "Citar o nome do presidente ou políticos polêmicos na redação é motivo de anulação automática.",
      verdadeiro: false,
      explicacao:
        'Mencionar políticos ou figuras públicas é permitido se contextualizado para argumento válido. Problema é discurso de ódio sistemático ou ofensas pessoais. Uma citação de Getúlio Vargas em contexto histórico é legítima; uma frase do tipo "político X é ladrão, merecia estar preso" enfraquece C2/C3 e pode prejudicar C5. Não é automático; depende de contexto.',
    }),
  ],
});

import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  ordenar,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Competência II do ENEM: Compreender a proposta de redação e aplicar conceitos
 * das várias áreas de conhecimento para desenvolver o tema dentro dos limites
 * estruturais do texto dissertativo-argumentativo em prosa.
 */
export const c2TemaEstruturarepertorio = defineLesson({
  id: "redacao-competencias-02-c2-tema-estrutura-repertorio",
  titulo: "C2: Tema, estrutura e repertório",
  descricao:
    "Entender a proposta, manter o foco no tema e construir argumentação com apoio de conhecimento real.",
  exercicios: [
    verdadeiroFalso({
      afirmacao:
        "Se você aborda o assunto geral (ex: segurança pública) mas não o tema específico (ex: segurança nas ruas de bairros periféricos), a redação recebe nota zero.",
      verdadeiro: false,
      explicacao:
        "Isso é tangenciamento, não fuga total. Tangenciamento limita a nota a no máximo 40 pontos em C2, C3 e C5; fuga completa (nem o assunto amplo aparece) anula tudo. O base estrutural ainda está lá; só não se aprofundou no recorte pedido.",
    }),
    multiplaEscolha({
      pergunta: "Qual é a estrutura básica que C2 exige?",
      opcoes: [
        "Introdução, desenvolvimento, conclusão e proposta",
        "Proposição do tema, argumentação e conclusão",
        "Somente argumentação bem desenvolvida",
      ],
      correta: 1,
      explicacao:
        "A estrutura dissertativo-argumentativa tem três pilares: proposição (você apresenta o ponto de vista), argumentação (você defende com razões e exemplos) e conclusão (você retoma e encerra). Essa é a arquitetura que a banca espera em C2.",
    }),
    multiplaEscolha({
      pergunta: 'O que configura "repertório de bolso" para a banca ENEM?',
      opcoes: [
        "Usar exemplos de filmes ou músicas conhecidas",
        "Citar referências prontas, memorizadas, sem contexto real com o tema",
        "Mencionar pensadores famosos",
      ],
      correta: 1,
      explicacao:
        "Repertório legítimo é informação, fato ou citação conectada ao tema e bem contextualizada. Repertório de bolso é enfeite teórico memorizado que você cola sem conexão genuína, como citar Bauman só para parecer culto. A banca detecta quando não há diálogo real entre a referência e o argumento.",
    }),
    encontreOErro({
      frase:
        "Tema proposto: educação inclusiva nas escolas. Meu texto fala sobre museus de arte contemporânea.",
      // Tokenização: Tema(0) proposto:(1) educação(2) inclusiva(3) nas(4) escolas.(5) Meu(6) texto(7) fala(8) sobre(9) museus(10) de(11) arte(12) contemporânea.(13)
      // Erro: "arte" ou "contemporânea" representam a fuga ao tema. Vou usar "arte" (índice 12) como a palavra que sinaliza o desvio.
      erroIndex: 12,
      explicacao:
        "Quando seu texto fala de assuntos desconectados da proposta, você foge ao tema. Fuga total significa nota zero em tudo. Verifique antes de escrever: o tema que a prova pede é realmente o que estou abordando?",
    }),
    completeLacuna({
      frase:
        "Um texto dissertativo-argumentativo bem estruturado em C2 deve ter uma proposição clara, uma___ rica com exemplos e reflexão, e uma conclusão que retoma a ideia central.",
      opcoes: ["argumentação", "descrição", "narração"],
      correta: 0,
      explicacao:
        "Argumentação é o coração de C2. Proposição sem argumentação é só promessa; conclusão sem argumentação é só conclusão vazia. O edifício em pé depende dos pilares no meio.",
    }),
    ordenar({
      blocos: [
        "A educação é direito fundamental para a ascensão social",
        "Histórico: estatísticas de mobilidade social em países com políticas educacionais fortes",
        "Escolas bem equipadas e professores qualificados transformam comunidades",
        "Investir em educação inclusiva é investir no futuro do país",
      ],
      // Ordem: 1. Proposição (tese) -> 2. Evidência/repertório (histórico) -> 3. Desenvolvimento (argumento) -> 4. Conclusão/reforço
      explicacao:
        "A estrutura dissertativo-argumentativa começa com a proposição clara (o que você defende), depois traz repertório e evidências, desenvolve a argumentação, e termina reforçando a conclusão. Essa é a base arquitetônica que C2 avalia.",
    }),
    multiplaEscolha({
      pergunta: 'O que diferencia "repertório legítimo" de simples cópia dos textos motivadores?',
      opcoes: [
        "Legítimo usa frases inteiras; cópia usa palavras isoladas",
        "Legítimo vai além dos textos motivadores e conecta com outras áreas de conhecimento",
        "Não há diferença; tudo que vem dos motivadores é válido",
      ],
      correta: 1,
      explicacao:
        "Os textos motivadores são inspiração, não o alicerce de C2. Cópia deles demonstra falta de repertório próprio. Legítimo é quando você traz conhecimento institucionalizado (história, dados estatísticos, pensadores) ou de mundo (filmes, notícias) E articula com o tema de forma genuína. Extrapolar os motivadores é sinal de domínio.",
    }),
    interpretacao({
      texto:
        'A proposta de redação do ENEM 2024 era "Desafios para a valorização da herança africana no Brasil". Uma redação que discute a importância geral da diversidade cultural, mas não especifica a herança africana, tangencia o tema. Outra que fala exclusivamente de história afro-brasileira em paralelo com lutas políticas contemporâneas, sem conectar à "valorização" (ação presente/futura), também tangencia. Mas uma que mapeia os desafios históricos (escravidão, apagamento) e propõe ações concretas de valorização (políticas de representação, educação antirracista, reconhecimento institucional) atende ao tema em todas as suas camadas: desafios + valorização + herança africana + Brasil.',
      pergunta: "Segundo o texto, qual redação NÃO tangencia o tema sobre herança africana?",
      opcoes: [
        "A que aborda diversidade cultural em geral",
        "A que mapeia desafios históricos e propõe ações de valorização",
        "A que fala só de história afro-brasileira sem conectar à valorização presente",
      ],
      correta: 1,
      explicacao:
        "Atender ao tema integralmente significa tocar em TODOS os seus elementos. Genérica demais, ou histórica demais sem elo com o presente, ou faltando a ação de valorização: isso é tangenciamento. A redação forte é a que costura tudo junto. Esse é o trabalho exigido em C2.",
    }),
  ],
});

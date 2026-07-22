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
 * Lição 04: Conclusão - a proposta de intervenção (5 elementos)
 */
export const conclusaoPropostaIntervencao = defineLesson({
  id: "redacao-estrutura-04-conclusao-proposta-intervencao",
  titulo: "Conclusão: a proposta de intervenção (5 elementos)",
  descricao: "Fechamento estratégico: a solução concreta que responde ao problema.",
  exercicios: [
    multiplaEscolha({
      pergunta: "O que é uma proposta de intervenção no ENEM?",
      opcoes: [
        "Uma sugestão vaga de que algo deveria melhorar",
        "Uma ação concreta, detalhada, que busca resolver o problema apresentado na redação",
        "Uma opinião pessoal sobre o tema sem nenhuma ligação com a discussão",
      ],
      correta: 1,
      explicacao:
        'Proposta é ação. Não é "seria bom se" nem "deveria haver". É: "o Estado deve ampliar a banda larga nas zonas rurais através de parcerias público-privadas, usando verba de fundos de tecnologia, para alcançar 90% de cobertura em 5 anos." Específica, executável, articulada com o argumento.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Uma proposta de intervenção válida pode ser apenas uma constatação do problema: "faltam investimentos em tecnologia".',
      verdadeiro: false,
      explicacao:
        'Constatar não é propor. "Faltam investimentos" é apenas reafirmar o problema. Propor é indicar a solução: "O Ministério da Educação deve investir 500 milhões em infraestrutura digital nas escolas públicas, com prioridade em regiões de baixa renda, para garantir banda larga de qualidade." É ação, não lamento.',
    }),
    multiplaEscolha({
      pergunta: "Quantos e quais são os cinco elementos de uma proposta de intervenção completa?",
      opcoes: [
        "Problema, consequência, opinião, esperança, finalização",
        "Ação, agente, modo/meio, efeito/finalidade, detalhamento",
        "Tema, tese, argumento, conclusão, observação",
      ],
      correta: 1,
      explicacao:
        "Os cinco elementos são: 1) AÇÃO (o quê), 2) AGENTE (quem), 3) MODO/MEIO (como), 4) EFEITO/FINALIDADE (para quê), 5) DETALHAMENTO (informação adicional). Todos cinco fortalecem a proposta. Quando faltam, ela fica fraca ou vaga na avaliação da Competência V.",
    }),
    parear({
      instrucao: "Relacione cada elemento com seu significado na proposta de intervenção",
      pares: [
        { a: "Ação", b: "O que deve ser feito para intervir no problema" },
        { a: "Agente", b: "Quem deve executar a ação (governo, sociedade civil, indústria)" },
        { a: "Modo/Meio", b: "Como executar a ação, por quais caminhos viabilizá-la" },
        { a: "Efeito/Finalidade", b: "O efeito pretendido ou a finalidade esperada" },
        {
          a: "Detalhamento",
          b: "Informação complementar que aprofunda qualquer elemento anterior",
        },
      ],
      explicacao:
        "Esses cinco sustentáculos garantem que sua proposta não seja genérica. Quando todos estão presentes, a avaliação na Competência V tende a ser alta. Quando faltam, a proposta desaba.",
    }),
    completeLacuna({
      frase:
        "A proposta de intervenção deve ser ___ ao tema e articulada com os argumentos desenvolvidos no texto, não solta ou desconectada da discussão.",
      opcoes: ["relacionada", "vaga", "criativa"],
      correta: 0,
      explicacao:
        "Sua proposta é a conclusão natural do caminho que você traçou. Se o texto argumenta que educação digital reduz desigualdades, a proposta deve responder a isso: investimento em conectividade, treinamento de professores, acesso a plataformas. Deve respirar junto com o argumento.",
    }),
    encontreOErro({
      frase:
        "Portanto, se houvesse mais investimento, talvez pudesse haver melhorias na educação digital das comunidades rurais brasileiras.",
      erroIndex: 2,
      explicacao:
        'Essa proposta é condicional: "se houvesse", "talvez pudesse". O ENEM rejeita estruturas condicionais como proposta, porque não indicam ação concreta. Uma proposta deve ser assertiva: "O governo deve investir em conectividade rural", sem "se" ou "talvez". Assertividade é autoridade.',
    }),
    ordenar({
      blocos: [
        "(AGENTE) O Ministério da Educação, em parceria com provedores privados,",
        "(AÇÃO) deve ampliar a banda larga nas escolas rurais",
        "(MODO/MEIO) através de licitações para infraestrutura de fibra óptica e 4G",
        "(EFEITO/FINALIDADE) para garantir acesso igualitário ao ensino online",
        "(DETALHAMENTO) atingindo 95% das escolas públicas rurais em até 3 anos.",
        "Uma proposta bem estruturada integra todos os cinco elementos nesta ordem",
      ],
      explicacao:
        "A proposta começa com quem faz, segue com o quê e como, aponta a finalidade, e encerra com um detalhe concreto que reforça a viabilidade. Essa arquitetura é o que diferencia uma proposta forte de uma vaga.",
    }),
    multiplaEscolha({
      pergunta:
        "Qual proposta de intervenção melhor atende aos critérios de completude e concretude?",
      opcoes: [
        "Deveria haver mais educação digital no Brasil.",
        "As escolas devem investir em tecnologia porque é importante.",
        "Os governos estaduais devem criar programas de treinamento em plataformas digitais nas escolas públicas, com financiamento de fundos estaduais de educação, a fim de capacitar 10 mil professores por estado em um ano, reduzindo assim a lacuna de competência digital docente.",
        "Algo tem que mudar na forma como ensinamos.",
      ],
      correta: 2,
      explicacao:
        "Só a terceira traz os cinco elementos: ação (criar programas), agente (governos estaduais), modo (financiamento de fundos), finalidade (capacitar professores, reduzir lacuna), detalhamento (10 mil professores, um ano). As outras são vagas, genéricas ou apenas constatações.",
    }),
    interpretacao({
      texto:
        'Segundo a matriz do ENEM 2025, a Competência V avalia a apresentação de uma proposta de intervenção relacionada ao tema, integrada ao projeto de texto e coerente com o ponto de vista e os argumentos. Propostas que desrespeitem os direitos humanos recebem nota 0 nesta competência. Uma proposta vaga ("faltam investimentos"), genérica ("deveria haver mudança") ou condicional ("se o governo investisse") prejudica severamente a nota, pois indica falta de autoria e de pensamento crítico construído.',
      pergunta: "Segundo o texto, o que causa penalização severa na nota da Competência V?",
      opcoes: [
        "Usar muitas palavras na proposta",
        "Propostas vagas, genéricas ou condicionais, que indicam falta de autoria e pensamento crítico construído",
        "Utilizar linguagem muito formal",
      ],
      correta: 1,
      explicacao:
        'Vagueza é a morte da proposta. "Deveria haver mudança" não é proposta, é suspiro. O ENEM quer ação específica: quem faz, como, para quê, com quais detalhes. Isso mostra que você realmente pensou no problema e tem uma saída viável.',
    }),
  ],
});

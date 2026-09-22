import type { ExamTip } from "@/lib/learning/types";

/**
 * Lote curado de dicas (docs/20 §10, Fase 8, item 2) — pequeno de propósito:
 * "curar pequeno lote de dicas com fonte/revisão/validade", não popular um
 * banco grande sem curadoria individual. Cada uma tem fonte e foi revisada
 * na autoria (`reviewedAt`) — não é validação por especialista externo (ver
 * docs/21 pro mesmo tipo de ressalva já registrado nas microlições).
 *
 * Estratégias de prova são conteúdo evergreen (`validUntil: null`); a única
 * alegação factual específica sobre a prova (TRI do ENEM) cita o INEP e evita
 * número/fórmula que possa ficar desatualizado.
 */
export const EXAM_TIPS: ExamTip[] = [
  {
    id: "enem-estrategia-comando-primeiro",
    version: 1,
    examProfileId: "enem",
    skillIds: [],
    category: "estrategia",
    text: "Leia o comando da questão antes do texto de apoio — ele diz exatamente o que procurar, e isso evita reler o texto duas vezes.",
    source: "Estratégia geral de prova objetiva, sem alegação específica do ENEM.",
    reviewedAt: "2026-09-21",
    validUntil: null,
    priority: 1,
  },
  {
    id: "enem-gestao-tempo-nao-travar",
    version: 1,
    examProfileId: "enem",
    skillIds: [],
    category: "gestao-tempo",
    text: "Questão travou? Marque a melhor alternativa que você tem, sinalize pra revisar e siga. Tempo perdido numa questão é tempo que falta pra outras três que você sabia.",
    source: "Estratégia geral de prova cronometrada.",
    reviewedAt: "2026-09-21",
    validUntil: null,
    priority: 2,
  },
  {
    id: "enem-eliminacao-reduzir-alternativas",
    version: 1,
    examProfileId: "enem",
    skillIds: [],
    category: "eliminacao",
    text: "Elimine primeiro as alternativas obviamente erradas. Reduzir de cinco pra duas ou três opções já muda sua chance, mesmo sem saber a resposta certa de cara.",
    source: "Estratégia geral de eliminação em múltipla escolha.",
    reviewedAt: "2026-09-21",
    validUntil: null,
    priority: 2,
  },
  {
    id: "enem-erro-comum-porcentagem-aumento-vs-valor",
    version: 1,
    examProfileId: "enem",
    skillIds: ["mat:porcentagem-fator-multiplicativo"],
    category: "erro-comum",
    text: "Erro comum: confundir \"aumentar 20%\" com \"chegar a 20% do valor original\". São coisas bem diferentes — releia o enunciado pra ver qual das duas ele está pedindo.",
    source: "Erro recorrente registrado na autoria do conteúdo de porcentagem.",
    reviewedAt: "2026-09-21",
    validUntil: null,
    priority: 3,
  },
  {
    id: "enem-interpretacao-crase-substituicao",
    version: 1,
    examProfileId: "enem",
    skillIds: ["por:crase-regra-basica", "por:crase-casos-proibidos"],
    category: "interpretacao",
    text: "Na dúvida sobre crase numa questão de português, aplique o truque da substituição por palavra masculina antes de marcar — é mais rápido que tentar lembrar a regra decorada.",
    source: "Estratégia derivada do conteúdo de crase (ver microlições de Português).",
    reviewedAt: "2026-09-21",
    validUntil: null,
    priority: 3,
  },
  {
    id: "enem-caracteristica-tri-consistencia",
    version: 1,
    examProfileId: "enem",
    skillIds: [],
    category: "caracteristica-prova",
    text: "O ENEM usa a Teoria de Resposta ao Item (TRI): errar questões fáceis pesa contra a nota mesmo acertando as difíceis. Responder com consistência do fácil ao difícil vale mais que acertar só as puladas.",
    source: "INEP — Nota Técnica da Metodologia do ENEM (TRI).",
    reviewedAt: "2026-09-21",
    validUntil: null,
    priority: 1,
  },
  {
    id: "pas-unb-estrategia-etapas",
    version: 1,
    examProfileId: "pas-unb",
    stage: "1",
    skillIds: [],
    category: "estrategia",
    text: "No PAS, cada etapa cobra o conteúdo do ano letivo correspondente — revisar só o que foi visto nesse ano rende mais do que tentar cobrir os três anos de uma vez.",
    source: "Cebraspe — Programa do PAS/UnB (estrutura por etapa).",
    reviewedAt: "2026-09-21",
    validUntil: null,
    priority: 1,
  },
  {
    id: "pas-unb-gestao-tempo-redacao",
    version: 1,
    examProfileId: "pas-unb",
    stage: "3",
    skillIds: [],
    category: "gestao-tempo",
    text: "Na 3ª etapa do PAS, reserve tempo fixo pra redação antes de começar — ela pesa proporcionalmente mais que uma questão objetiva isolada.",
    source: "Cebraspe — Programa do PAS/UnB (estrutura da 3ª etapa).",
    reviewedAt: "2026-09-21",
    validUntil: null,
    priority: 2,
  },
];

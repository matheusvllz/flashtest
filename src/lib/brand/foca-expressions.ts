/**
 * Sistema oficial das expressões da Foca (docs/44 §6; tabela completa em docs/15 §5).
 *
 * Fonte única: nenhum componente monta caminho de imagem da Foca à mão. Os nomes são os oficiais da entrega
 * (29/09/2026) e são a chave do registro. Originais em `src/assets/branding/foca/expressoes/<nome>.png`;
 * derivados (96 e 320 px, WebP + PNG) gerados por `scripts/gerar-marca.ts`.
 *
 * Regra que vale sobre qualquer mapeamento: errar NUNCA mostra `desapontada` nem `cobrando` (docs/44 I-5,
 * docs/15 §3). A Foca ajuda o aluno a continuar; não fica decepcionada com ele.
 *
 * Marca x mascote: o ícone institucional (favicon, PWA, app) é a LOGO OFICIAL sobre o azul `--mar`, nunca uma
 * expressão (docs/44 I-4).
 */

export const FOCA_EXPRESSIONS = [
  "neutra",
  "acolhedora",
  "orgulhosa",
  "empolgada",
  "surpresa",
  "entediada",
  "desapontada",
  "cobrando",
] as const;

export type FocaExpression = (typeof FOCA_EXPRESSIONS)[number];

/** Expressão padrão e fallback de qualquer valor desconhecido. */
export const FOCA_EXPRESSION_DEFAULT: FocaExpression = "neutra";

export interface FocaExpressionInfo {
  /** O que a expressão comunica. */
  significado: string;
  /** Onde usar no produto e no marketing. */
  usar: string;
  /** Onde nunca usar. */
  evitar: string;
}

export const FOCA_EXPRESSION_INFO: Record<FocaExpression, FocaExpressionInfo> = {
  neutra: {
    significado: "Presença calma, atenta. O estado padrão.",
    usar: "Padrão, entrada do app, informação, \"Não sei\", resumo de introdução, carregamento contextual.",
    evitar: "Momentos de pico emocional, onde outra expressão diz mais.",
  },
  acolhedora: {
    significado: "Tá tudo bem, vamos junto. Sorriso fechado, olho aberto (nunca semicerrado).",
    usar: "Erro de questão (\"Bora ver onde travou\"), retorno depois de dias parado, primeira interação, onboarding, ajuda.",
    evitar: "Nada que carregue cobrança; nunca misturar com fala de culpa.",
  },
  orgulhosa: {
    significado: "Satisfação tranquila com o que o aluno fez.",
    usar: "Acerto, lição concluída, meta do dia fechada, faixa que subiu, sessão de hoje concluída.",
    evitar: "Antes de o aluno ter feito algo (não é elogio vazio).",
  },
  empolgada: {
    significado: "Energia de marco. Olhos brilhando, boca grande.",
    usar: "Capítulo concluído, marco de sequência, começo de algo novo, chamada positiva de marketing.",
    evitar: "Acertos comuns (vira ruído) e qualquer contexto de dificuldade.",
  },
  surpresa: {
    significado: "Descoberta, algo inesperado e bom.",
    usar: "Aha moment do onboarding, acerto difícil, descoberta de um ponto novo.",
    evitar: "Erro do aluno (soa como \"nossa, você errou isso?\").",
  },
  entediada: {
    significado: "Humor leve de tela vazia. Olhar de lado, boca torta.",
    usar: "Estados vazios, 404, lista sem conteúdo.",
    evitar: "Explicação, dificuldade, suporte, erro do aluno, qualquer momento sério.",
  },
  desapontada: {
    significado: "Algo deu errado do nosso lado.",
    usar: "Falha do app ou do conteúdo (não carregou, erro de rede). Nunca sobre o aluno.",
    evitar: "Erro de questão, \"Não sei\", lição interrompida, ausência, desempenho. Usar com cautela.",
  },
  cobrando: {
    significado: "Olhar semicerrado de personagem. Existe para humor explícito.",
    usar: "Só humor explícito e combinado com o guia de copy (ex.: peça de marketing brincando com a própria Foca).",
    evitar: "Ausência, sequência, resultado, erro, lembretes. Não é usada em nenhum fluxo do aluno hoje.",
  },
};

/** Lado em px de cada derivado gerado. */
export const FOCA_ASSET_SIZES = [96, 320] as const;

/** Garante uma expressão válida: valor desconhecido (dado antigo, string solta) cai no padrão, sem quebrar a UI. */
export function focaExpression(valor: unknown): FocaExpression {
  return typeof valor === "string" && (FOCA_EXPRESSIONS as readonly string[]).includes(valor) ? (valor as FocaExpression) : FOCA_EXPRESSION_DEFAULT;
}

/** Caminhos do derivado de uma expressão no tamanho que cobre `px` (com densidade 2x até 160 px de exibição). */
export function focaExpressionSrc(expressao: FocaExpression, px: number): { webp: string; png: string } {
  const lado = px <= 48 ? 96 : 320;
  const base = `/branding/foca/expressoes/${focaExpression(expressao)}-${lado}`;
  return { webp: `${base}.webp`, png: `${base}.png` };
}

/** Logo oficial (Foca de frente colorida). */
export function focaLogoSrc(px: number): { webp: string; png: string } {
  const lado = px <= 48 ? 96 : 320;
  return { webp: `/branding/foca/foca-color-${lado}.webp`, png: `/branding/foca/foca-color-${lado}.png` };
}

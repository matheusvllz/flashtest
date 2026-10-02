/**
 * Missões do dia (spec 50 §5.4.1) — catálogo, elegibilidade e sorteio determinístico. Puro: o servidor sorteia e
 * acompanha; a tela só mostra.
 * Regras: 3 por dia (uma "fazer", uma "acertar", uma de "conteúdo"); nunca por tempo, nunca por abrir o app, nunca
 * por comprar, nunca social, nunca penaliza o "Não sei"; sem contagem regressiva (trocam em silêncio na virada).
 * A missão "fazer" conta qualquer bloco, inclusive flashcards: sempre dá para cumprir uma sem gastar vida.
 */

export type TipoDeMissao = "fazer" | "acertar" | "conteudo";
export type AreaEnem = "LC" | "CH" | "CN" | "MT";

export type IdDeMissao =
  | "fazer-1"
  | "fazer-2"
  | "combo-3"
  | "combo-5"
  | "perfeita"
  | "revisao-trilha"
  | "pratica-LC"
  | "pratica-CH"
  | "pratica-CN"
  | "pratica-MT"
  | "caderno-3"
  | "escrita-1"
  | "mini-semana"
  | "flashcards-1";

export interface Missao {
  id: IdDeMissao;
  tipo: TipoDeMissao;
  alvo: number;
}

export interface ContextoDasMissoes {
  /** Meta diária do aluno em blocos (`prefs.dailyLessons`). */
  metaDiaria: number;
  /** Dias com estudo desde sempre. */
  diasDeEstudo: number;
  /** Acertos de primeira nas últimas respostas (0–1), ou `null` sem dado. */
  precisaoRecente: number | null;
  revisaoDevida: boolean;
  /** Área com mais lacuna pelo modelo do aluno, ou `null`. */
  areaComLacuna: AreaEnem | null;
  /** Itens do caderno para hoje (0 = sem caderno ou nada para hoje). */
  cadernoParaHoje: number;
  /** Tarefas de escrita no ar (E6). */
  temEscrita: boolean;
  /** Mini-simulado da semana disponível e ainda não feito (E5). */
  miniDisponivel: boolean;
  flashcardsDevidos: number;
}

export const ALVO: Record<IdDeMissao, number> = {
  "fazer-1": 1,
  "fazer-2": 2,
  "combo-3": 3,
  "combo-5": 5,
  perfeita: 1,
  "revisao-trilha": 1,
  "pratica-LC": 4,
  "pratica-CH": 4,
  "pratica-CN": 4,
  "pratica-MT": 4,
  "caderno-3": 3,
  "escrita-1": 1,
  "mini-semana": 1,
  "flashcards-1": 1,
};

const TIPO: Record<IdDeMissao, TipoDeMissao> = {
  "fazer-1": "fazer",
  "fazer-2": "fazer",
  "combo-3": "acertar",
  "combo-5": "acertar",
  perfeita: "acertar",
  "revisao-trilha": "conteudo",
  "pratica-LC": "conteudo",
  "pratica-CH": "conteudo",
  "pratica-CN": "conteudo",
  "pratica-MT": "conteudo",
  "caderno-3": "conteudo",
  "escrita-1": "conteudo",
  "mini-semana": "conteudo",
  "flashcards-1": "conteudo",
};

export function missaoDe(id: IdDeMissao): Missao {
  return { id, tipo: TIPO[id], alvo: ALVO[id] };
}

/** Missões elegíveis hoje, por tipo, a partir do conteúdo e do plano disponíveis para o aluno. */
export function elegiveis(ctx: ContextoDasMissoes): Record<TipoDeMissao, IdDeMissao[]> {
  const fazer: IdDeMissao[] = [ctx.metaDiaria >= 2 ? "fazer-2" : "fazer-1"];
  const acertar: IdDeMissao[] = ["combo-3"];
  if (ctx.diasDeEstudo >= 7) acertar.push("combo-5");
  if (ctx.precisaoRecente !== null && ctx.precisaoRecente >= 0.6) acertar.push("perfeita");
  const conteudo: IdDeMissao[] = [];
  if (ctx.revisaoDevida) conteudo.push("revisao-trilha");
  if (ctx.areaComLacuna) conteudo.push(`pratica-${ctx.areaComLacuna}` as IdDeMissao);
  if (ctx.cadernoParaHoje >= 3) conteudo.push("caderno-3");
  if (ctx.temEscrita) conteudo.push("escrita-1");
  if (ctx.miniDisponivel) conteudo.push("mini-semana");
  if (ctx.flashcardsDevidos > 0) conteudo.push("flashcards-1");
  if (conteudo.length === 0) conteudo.push("pratica-MT");
  return { fazer, acertar, conteudo };
}

/** Hash estável (FNV-1a de 32 bits) para o sorteio determinístico. */
function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Sorteio do dia: mesma semente (aluno + dia) → mesmas missões; reabrir o app não troca. */
export function sortearMissoes(userId: string, dia: string, ctx: ContextoDasMissoes): Missao[] {
  const e = elegiveis(ctx);
  const escolher = (lista: IdDeMissao[], sal: string) => lista[hash(`${userId}:${dia}:${sal}`) % lista.length];
  return [missaoDe(escolher(e.fazer, "fazer")), missaoDe(escolher(e.acertar, "acertar")), missaoDe(escolher(e.conteudo, "conteudo"))];
}

/** Desafio do mês (§5.4.2): missões concluídas no mês. */
export const MISSOES_DO_DESAFIO = 20;

/** Mês (`AAAA-MM`) de um dia `AAAA-MM-DD`. */
export function mesDe(dia: string): string {
  return dia.slice(0, 7);
}

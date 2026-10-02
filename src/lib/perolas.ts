/**
 * Pérolas (spec 50 §5.3, D50-01, D50-09) — fonte única dos valores da economia, usada pelo servidor (que concede e
 * cobra) e pela tela (que só mostra). Regras que não mudam:
 * - ganha-se só aprendendo (concluir, acertar, cumprir meta), NUNCA por tempo de uso (Decreto 12.880 art. 9º, III);
 * - Pérolas não são vendidas por dinheiro, nem direta nem indiretamente (nenhum plano dá Pérolas);
 * - nada aleatório: baú de marco com conteúdo conhecido antes de abrir;
 * - nunca se compra XP, dias de ofensiva, consertar ofensiva quebrada, pular lição, posição na liga, cota de IA.
 * Ajuste de valor depois da revisão de 4 semanas (T-50.16.2) = mudar aqui e anotar no registro.
 */
import type { Plano } from "@/lib/planos";

/* ------------------------------------------------------------------ ganhos --- */

export const PEROLAS_POR_BLOCO = 5;
export const BLOCOS_PAGOS_POR_DIA = 5;
export const PEROLAS_LICAO_PERFEITA = 5;
export const PERFEITAS_PAGAS_POR_DIA = 3;
export const PEROLAS_POR_MISSAO = 10;
export const PEROLAS_MISSOES_COMPLETAS = 10;
export const PEROLAS_DESAFIO_DO_MES = 150;
export const PEROLAS_POR_NIVEL = 20;
export const PEROLAS_SIMULADO = 30;

/** Meta de ofensiva escolhida pelo aluno (§5.2.2): recompensa fixa e conhecida. */
export const METAS_DE_OFENSIVA = [7, 14, 30, 50] as const;
export type MetaDeOfensiva = (typeof METAS_DE_OFENSIVA)[number];
export const PEROLAS_DA_META: Record<MetaDeOfensiva, number> = { 7: 50, 14: 120, 30: 300, 50: 500 };

export function ehMetaDeOfensiva(n: number): n is MetaDeOfensiva {
  return (METAS_DE_OFENSIVA as readonly number[]).includes(n);
}

/* ------------------------------------------------------------- baú de marco --- */

/** Marcos de ofensiva (§5.2.4): 7, 14, 30, 50, 100, 150, 200, 365 e depois a cada 100. */
export const MARCOS_DE_OFENSIVA = [7, 14, 30, 50, 100, 150, 200, 365] as const;

export function ehMarcoDeOfensiva(dias: number): boolean {
  if ((MARCOS_DE_OFENSIVA as readonly number[]).includes(dias)) return true;
  return dias > 365 && dias % 100 === 0;
}

export interface ConteudoDoBau {
  perolas: number;
  /** Item da loja incluído (roupa ou tema), se houver. */
  item?: ItemDaLoja["id"];
}

/** Conteúdo FIXO por marco, mostrado antes de abrir (§5.3.5). Item já possuído vira o preço em Pérolas. */
export function conteudoDoBau(dias: number): ConteudoDoBau | null {
  if (!ehMarcoDeOfensiva(dias)) return null;
  switch (dias) {
    case 7:
      return { perolas: 50 };
    case 14:
      return { perolas: 80 };
    case 30:
      return { perolas: 150, item: "roupa:cachecol" };
    case 50:
      return { perolas: 250 };
    case 100:
      return { perolas: 400, item: "roupa:coroa-conchas" };
    case 150:
      return { perolas: 400 };
    case 200:
      return { perolas: 500 };
    case 365:
      return { perolas: 1000, item: "tema:noite-no-mar" };
    default:
      return { perolas: 500 };
  }
}

/* ------------------------------------------------------------------- loja --- */

export type TipoDeItem = "protetor" | "recarga" | "roupa" | "tema";

export interface ItemDaLoja {
  id:
    | "protetor"
    | "recarga-vidas"
    | "roupa:bone"
    | "roupa:oculos"
    | "roupa:cachecol"
    | "roupa:fone"
    | "roupa:mochila"
    | "roupa:coroa-conchas"
    | "tema:coral"
    | "tema:recife"
    | "tema:noite-no-mar";
  tipo: TipoDeItem;
  preco: number;
  /** Item permanente: compra única. */
  unico: boolean;
}

export const LOJA: readonly ItemDaLoja[] = [
  { id: "protetor", tipo: "protetor", preco: 250, unico: false },
  { id: "recarga-vidas", tipo: "recarga", preco: 150, unico: false },
  { id: "roupa:bone", tipo: "roupa", preco: 300, unico: true },
  { id: "roupa:oculos", tipo: "roupa", preco: 400, unico: true },
  { id: "roupa:cachecol", tipo: "roupa", preco: 500, unico: true },
  { id: "roupa:fone", tipo: "roupa", preco: 600, unico: true },
  { id: "roupa:mochila", tipo: "roupa", preco: 700, unico: true },
  { id: "roupa:coroa-conchas", tipo: "roupa", preco: 900, unico: true },
  { id: "tema:coral", tipo: "tema", preco: 600, unico: true },
  { id: "tema:recife", tipo: "tema", preco: 600, unico: true },
  { id: "tema:noite-no-mar", tipo: "tema", preco: 600, unico: true },
];

export const RECARGAS_POR_DIA = 1;

export function itemDaLoja(id: string): ItemDaLoja | null {
  return LOJA.find((i) => i.id === id) ?? null;
}

export type MotivoRecusaDaLoja =
  | "ITEM_DESCONHECIDO"
  | "SALDO_INSUFICIENTE"
  | "ESTOQUE_CHEIO"
  | "SEM_VIDAS_NO_PLANO"
  | "VIDAS_CHEIAS"
  | "RECARGA_JA_USADA_HOJE"
  | "JA_POSSUI";

export interface SituacaoParaCompra {
  saldo: number;
  plano: Plano;
  /** Protetores guardados agora e teto do plano. */
  protetores: number;
  protetoresMax: number;
  /** Vidas ligadas para o aluno (Free com a função ligada) e restantes hoje. */
  vidasLigadas: boolean;
  vidasRestantes: number;
  vidasMax: number;
  recargasHoje: number;
  possui: ReadonlySet<string>;
}

/** Decide se a compra pode acontecer (puro; o servidor chama dentro da transação travada). */
export function podeComprar(item: ItemDaLoja | null, s: SituacaoParaCompra): MotivoRecusaDaLoja | null {
  if (!item) return "ITEM_DESCONHECIDO";
  if (item.unico && s.possui.has(item.id)) return "JA_POSSUI";
  if (item.tipo === "protetor" && s.protetores >= s.protetoresMax) return "ESTOQUE_CHEIO";
  if (item.tipo === "recarga") {
    if (!s.vidasLigadas || s.plano !== "gratis") return "SEM_VIDAS_NO_PLANO";
    if (s.vidasRestantes >= s.vidasMax) return "VIDAS_CHEIAS";
    if (s.recargasHoje >= RECARGAS_POR_DIA) return "RECARGA_JA_USADA_HOJE";
  }
  if (s.saldo < item.preco) return "SALDO_INSUFICIENTE";
  return null;
}

/* ---------------------------------------------------------- chaves do livro --- */

/** Chaves do livro-razão: o mesmo fato nunca paga duas vezes (unique por aluno). */
export const chavePerola = {
  bloco: (conclusao: string) => `bloco:${conclusao}`,
  perfeita: (attemptKey: string) => `perfeita:${attemptKey}`,
  missao: (dia: string, id: string) => `missao:${dia}:${id}`,
  missoesCompletas: (dia: string) => `missoes-completas:${dia}`,
  metaOfensiva: (metaId: string) => `meta-ofensiva:${metaId}`,
  marco: (dias: number) => `marco:${dias}`,
  conquista: (id: string) => `conquista:${id}`,
  desafio: (mes: string) => `desafio:${mes}`,
  nivel: (n: number) => `nivel:${n}`,
  simulado: (id: string) => `simulado:${id}`,
  compra: (pedidoId: string) => `compra:${pedidoId}`,
} as const;

export type MotivoDePerola =
  | "bloco"
  | "perfeita"
  | "missao"
  | "missoes-completas"
  | "meta-ofensiva"
  | "marco"
  | "conquista"
  | "desafio"
  | "nivel"
  | "simulado"
  | "compra";

export const MOTIVOS_DE_PEROLA: readonly MotivoDePerola[] = [
  "bloco",
  "perfeita",
  "missao",
  "missoes-completas",
  "meta-ofensiva",
  "marco",
  "conquista",
  "desafio",
  "nivel",
  "simulado",
  "compra",
];

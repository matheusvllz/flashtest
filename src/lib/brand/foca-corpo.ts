/**
 * Foca de corpo inteiro (spec 50 §5.8): expressões do corpo, poses, roupas e regras de movimento.
 *
 * Dado puro, sem React: o componente (`src/components/brand/FocaCorpo.tsx`) e o `FocaMark` leem daqui.
 * O corpo só existe com `forma="corpo"` no `FocaMark`, carregado sob demanda; a cabeça, a logo e o ícone
 * institucional nunca recebem roupa (§5.8.2; docs/44 I-4).
 *
 * Regra que vale sobre qualquer mapeamento: o corpo não tem `desapontada` nem `cobrando` (§5.8.1, §5.8.5).
 * Qualquer expressão que não exista no corpo cai em `neutra`.
 */

/** Rostos do corpo: as 5 expressões usadas em momentos + o estado dormindo (§5.8.1). */
export const FOCA_CORPO_EXPRESSOES = [
  "neutra",
  "acolhedora",
  "orgulhosa",
  "empolgada",
  "surpresa",
  "dormindo",
] as const;
export type FocaCorpoExpressao = (typeof FOCA_CORPO_EXPRESSOES)[number];

/** Poses (§5.8.3). `parada` só respira; as outras tocam uma vez e voltam à pose parada. */
export const FOCA_POSES = ["parada", "aceno", "pulo", "palmas", "cauda", "dormindo"] as const;
export type FocaPose = (typeof FOCA_POSES)[number];

/** Roupas da loja (§5.3.3, T-50.3.5): camadas ancoradas na cabeça ou no pescoço. Preço mora na economia. */
export const FOCA_ROUPAS = [
  { id: "bone", nome: "Boné", ancora: "cabeca" },
  { id: "oculos", nome: "Óculos", ancora: "cabeca" },
  { id: "cachecol", nome: "Cachecol", ancora: "pescoco" },
  { id: "fone", nome: "Fone", ancora: "cabeca" },
  { id: "mochila", nome: "Mochila", ancora: "pescoco" },
  { id: "coroa-conchas", nome: "Coroa de conchas", ancora: "cabeca" },
] as const satisfies readonly { id: string; nome: string; ancora: "cabeca" | "pescoco" }[];
export type FocaRoupaId = (typeof FOCA_ROUPAS)[number]["id"];
export type FocaRoupa = (typeof FOCA_ROUPAS)[number];

/**
 * Duração de cada movimento em ms (§5.8.3). Os de uma vez já incluem as repetições
 * (aceno 2 × 900, palmas 2 × 300, cauda 3 × 800); `parada` e `dormindo` são ciclos em laço.
 */
export const FOCA_MOVIMENTO_MS = {
  respiracao: 3200,
  piscar: 180,
  aceno: 1800,
  pulo: 600,
  palmas: 600,
  cauda: 2400,
  dormindo: 4000,
} as const;

/** Intervalo aleatório entre piscadas (ms). */
export const FOCA_PISCAR_INTERVALO_MS = [4000, 7000] as const;

/** Expressões do corpo que têm olhos abertos (as únicas que piscam). */
export function focaCorpoTemOlhosAbertos(expressao: FocaCorpoExpressao): boolean {
  return expressao !== "orgulhosa" && expressao !== "dormindo";
}

/**
 * Converte qualquer valor (inclusive as 8 expressões da cabeça) numa expressão do corpo.
 * `desapontada`, `cobrando`, `entediada` e valores desconhecidos viram `neutra`.
 */
export function focaCorpoExpressao(valor: unknown): FocaCorpoExpressao {
  return typeof valor === "string" && (FOCA_CORPO_EXPRESSOES as readonly string[]).includes(valor)
    ? (valor as FocaCorpoExpressao)
    : "neutra";
}

/** Pose válida; desconhecida vira `parada`. */
export function focaPose(valor: unknown): FocaPose {
  return typeof valor === "string" && (FOCA_POSES as readonly string[]).includes(valor)
    ? (valor as FocaPose)
    : "parada";
}

/** Roupa válida ou nenhuma (id desconhecido não quebra a tela: a Foca sai sem roupa). */
export function focaRoupa(valor: unknown): FocaRoupaId | undefined {
  return FOCA_ROUPAS.find((r) => r.id === valor)?.id;
}

/** O rosto que aparece de fato: a pose `dormindo` fecha os olhos, seja qual for a expressão pedida. */
export function focaCorpoRosto(expressao: FocaCorpoExpressao, pose: FocaPose): FocaCorpoExpressao {
  return pose === "dormindo" ? "dormindo" : expressao;
}

/**
 * Aparelho fraco (§5.8.3): `deviceMemory` ≤ 2 GB ou `hardwareConcurrency` ≤ 4 núcleos. Nele a Foca faz só a
 * pose final, sem laço. Campo ausente (Safari não expõe `deviceMemory`) não conta como fraco.
 */
export function aparelhoFraco(nav?: {
  deviceMemory?: number;
  hardwareConcurrency?: number;
}): boolean {
  if (!nav) return false;
  const memoria = nav.deviceMemory;
  const nucleos = nav.hardwareConcurrency;
  return (
    (typeof memoria === "number" && memoria <= 2) ||
    (typeof nucleos === "number" && nucleos > 0 && nucleos <= 4)
  );
}

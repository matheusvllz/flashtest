/**
 * Nivelamento adaptativo — CAT (teste adaptativo por computador) com EAP em
 * grade (docs/30 §12.3, Fase 13 do docs/31). Funções puras, SEM import de
 * `@/content/*`: o pool de itens elegíveis é sempre recebido por parâmetro,
 * de propósito — `store.ts` chama estas funções direto (mesma regra de
 * fronteira de bundle do `select-items.ts`/`model.ts`, docs/30 §21.3). A
 * ponte com o catálogo real (pool por área, preenchimento de prior nas
 * habilidades não medidas) mora em `placement-pool.ts`, importado só pelas
 * telas (`/nivelamento`), não por `store.ts`.
 */
import type { PlacementAreaState, PlacementResponse, PlacementState } from "@/lib/learning/types";
import { probabilityCorrect, type ItemIrtLike } from "./model";
import {
  PLACEMENT_GRID_MAX,
  PLACEMENT_GRID_MIN,
  PLACEMENT_GRID_STEP,
  PLACEMENT_MAX_ITENS_AREA_NORMAL,
  PLACEMENT_MAX_ITENS_AREA_PRIORITARIA,
  PLACEMENT_MAX_ITENS_TOTAL,
  PLACEMENT_PRIOR_MEAN,
  PLACEMENT_PRIOR_SD,
  PLACEMENT_SE_STOP,
} from "./constants";

/** Um item elegível pro nivelamento — forma mínima que o motor precisa (docs/30 §12.3). `incidence` vem do `SkillDef` (docs/30 §8.2), resolvido por quem monta o pool. */
export interface PlacementPoolItem {
  id: string;
  skillId: string;
  subjectId: string;
  area: EnemAreaLike;
  irt: ItemIrtLike;
  incidence: 1 | 2 | 3;
}

/** Cópia local do tipo (evita importar `@/content/taxonomy/types` — o objetivo deste arquivo é não puxar NADA de `@/content`). */
export type EnemAreaLike = "LC" | "MT" | "CN" | "CH" | "RED";

/** Escopo de UMA execução do nivelamento — áreas incluídas e quais são prioritárias (docs/30 §12.2/§12.3). */
export interface PlacementScope {
  areas: EnemAreaLike[];
  priorityAreas: Set<EnemAreaLike>;
}

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const GRID: number[] = (() => {
  const pontos: number[] = [];
  for (let t = PLACEMENT_GRID_MIN; t <= PLACEMENT_GRID_MAX + 1e-9; t += PLACEMENT_GRID_STEP) {
    pontos.push(Math.round(t * 100) / 100);
  }
  return pontos;
})();

function normalDensity(x: number, mean: number, sd: number): number {
  return Math.exp(-0.5 * ((x - mean) / sd) ** 2);
}

/** Fator de verossimilhança de UMA resposta em θ (docs/30 §12.3 — "não sei" usa P sem chute, mesma regra do `model.ts`). */
function likelihoodFactor(
  theta: number,
  irt: ItemIrtLike,
  correct: boolean,
  dontKnow: boolean,
): number {
  const p = probabilityCorrect(theta, irt, { dontKnow });
  const acertou = !dontKnow && correct;
  return acertou ? p : 1 - p;
}

export interface EapResult {
  theta: number;
  se: number;
}

/** EAP em grade (docs/30 §12.3): média/desvio-padrão da posterior, prior fixo Normal(-0,3; 1,0). */
export function estimateEAP(
  responses: Array<{ irt: ItemIrtLike; correct: boolean; dontKnow: boolean }>,
  priorMean: number = PLACEMENT_PRIOR_MEAN,
  priorSd: number = PLACEMENT_PRIOR_SD,
): EapResult {
  const pesos = GRID.map((theta) => {
    let p = normalDensity(theta, priorMean, priorSd);
    for (const r of responses) p *= likelihoodFactor(theta, r.irt, r.correct, r.dontKnow);
    return p;
  });
  const total = pesos.reduce((a, b) => a + b, 0);
  const norm = total > 0 ? pesos.map((p) => p / total) : GRID.map(() => 1 / GRID.length);
  const theta = GRID.reduce((acc, t, i) => acc + t * norm[i], 0);
  const variancia = GRID.reduce((acc, t, i) => acc + (t - theta) ** 2 * norm[i], 0);
  return { theta, se: Math.sqrt(variancia) };
}

/** P do 3PL "puro" (sem escorregão) — a fórmula clássica de informação de Fisher usa esta, não a do modelo de resposta (docs/30 §12.3). */
function p3pl(theta: number, irt: ItemIrtLike): number {
  return irt.c + (1 - irt.c) / (1 + Math.exp(-irt.a * (theta - irt.b)));
}

/** Informação de Fisher do 3PL em θ (docs/30 §12.3, fórmula literal). */
export function fisherInformation3PL(theta: number, irt: ItemIrtLike): number {
  const p = p3pl(theta, irt);
  if (p <= irt.c || p >= 1) return 0;
  return irt.a ** 2 * ((p - irt.c) ** 2 / (1 - irt.c) ** 2) * ((1 - p) / p);
}

export function maxItensDaArea(prioritaria: boolean): number {
  return prioritaria ? PLACEMENT_MAX_ITENS_AREA_PRIORITARIA : PLACEMENT_MAX_ITENS_AREA_NORMAL;
}

/** Critério de parada de UMA área (docs/30 §12.3): SE baixo, limite de itens da área, ou orçamento total esgotado. */
export function shouldStopArea(
  areaState: Pick<PlacementAreaState, "itemIds" | "se">,
  prioritaria: boolean,
  itensRestantesOrcamento: number,
): boolean {
  if (areaState.se !== null && areaState.se <= PLACEMENT_SE_STOP) return true;
  if (areaState.itemIds.length >= maxItensDaArea(prioritaria)) return true;
  if (itensRestantesOrcamento <= 0) return true;
  return false;
}

/** Primeiro item de uma área: `b` mais próximo de 0, desempate pela habilidade de maior incidência (docs/30 §12.3). */
function primeiroItem(pool: PlacementPoolItem[]): PlacementPoolItem | null {
  if (pool.length === 0) return null;
  const ordenado = [...pool].sort((a, b) => {
    const diffB = Math.abs(a.irt.b) - Math.abs(b.irt.b);
    if (diffB !== 0) return diffB;
    return b.incidence - a.incidence;
  });
  return ordenado[0];
}

/**
 * Escolhe o próximo item de uma área (docs/30 §12.3): top 3 elegíveis por
 * informação de Fisher em θ̂, com balanceamento (habilidade ainda não usada
 * na área; alternar matérias da área), escolhido 1 dos 3 por hash(seed).
 */
export function nextPlacementItem(
  pool: PlacementPoolItem[],
  areaState: Pick<PlacementAreaState, "itemIds" | "theta">,
  seed: string,
  lastSubjectId: string | null,
): PlacementPoolItem | null {
  const usados = new Set(areaState.itemIds);
  let candidatos = pool.filter((i) => !usados.has(i.id));
  if (candidatos.length === 0) return null;
  if (areaState.itemIds.length === 0) return primeiroItem(candidatos);

  const skillsUsadas = new Set(pool.filter((i) => usados.has(i.id)).map((i) => i.skillId));
  const semSkillUsada = candidatos.filter((i) => !skillsUsadas.has(i.skillId));
  if (semSkillUsada.length > 0) candidatos = semSkillUsada;

  if (lastSubjectId) {
    const outraMateria = candidatos.filter((i) => i.subjectId !== lastSubjectId);
    if (outraMateria.length > 0) candidatos = outraMateria;
  }

  const theta = areaState.theta ?? PLACEMENT_PRIOR_MEAN;
  const comInfo = candidatos
    .map((item) => ({ item, info: fisherInformation3PL(theta, item.irt) }))
    .sort((a, b) => b.info - a.info);
  const top3 = comInfo.slice(0, 3).map((x) => x.item);
  const comHash = top3
    .map((item) => ({ item, h: fnv1a(`${seed}:${item.id}`) }))
    .sort((a, b) => a.h - b.h);
  return comHash[0]?.item ?? null;
}

/** Registra UMA resposta e recalcula θ̂/SE da área (docs/30 §12.3). Não decide parada — ver `shouldStopArea`. */
export function recordPlacementResponse(
  state: PlacementState,
  item: PlacementPoolItem,
  correct: boolean,
  dontKnow: boolean,
  itemsById: Map<string, PlacementPoolItem>,
): PlacementState {
  const area = item.area;
  const atual: PlacementAreaState = state.areas[area] ?? {
    itemIds: [],
    responses: [],
    theta: null,
    se: null,
    done: false,
  };
  const resposta: PlacementResponse = { itemId: item.id, correct, dontKnow };
  const respostas = [...atual.responses, resposta];
  const respostasComIrt = respostas
    .map((r) => {
      const it = itemsById.get(r.itemId);
      return it ? { irt: it.irt, correct: r.correct, dontKnow: r.dontKnow } : null;
    })
    .filter((r): r is { irt: ItemIrtLike; correct: boolean; dontKnow: boolean } => r !== null);
  const { theta, se } = estimateEAP(respostasComIrt);
  const novaArea: PlacementAreaState = {
    itemIds: [...atual.itemIds, item.id],
    responses: respostas,
    theta,
    se,
    done: atual.done,
  };
  return { ...state, areas: { ...state.areas, [area]: novaArea } };
}

/** Registra a resposta e já marca a área como concluída se `shouldStopArea` disser que sim. */
export function advancePlacement(
  state: PlacementState,
  scope: PlacementScope,
  item: PlacementPoolItem,
  correct: boolean,
  dontKnow: boolean,
  itemsById: Map<string, PlacementPoolItem>,
): PlacementState {
  const comResposta = recordPlacementResponse(state, item, correct, dontKnow, itemsById);
  const area = item.area;
  const areaState = comResposta.areas[area]!;
  const totalItens = Object.values(comResposta.areas).reduce((acc, a) => acc + a.itemIds.length, 0);
  const prioritaria = scope.priorityAreas.has(area);
  const parar = shouldStopArea(areaState, prioritaria, PLACEMENT_MAX_ITENS_TOTAL - totalItens);
  if (!parar) return comResposta;
  return { ...comResposta, areas: { ...comResposta.areas, [area]: { ...areaState, done: true } } };
}

/** Área atual do nivelamento — a primeira do escopo, na ordem, que ainda não parou. `null` = nivelamento terminou. */
export function currentPlacementArea(
  state: PlacementState,
  scope: PlacementScope,
): EnemAreaLike | null {
  const totalItens = Object.values(state.areas).reduce((acc, a) => acc + a.itemIds.length, 0);
  if (totalItens >= PLACEMENT_MAX_ITENS_TOTAL) return null;
  for (const area of scope.areas) {
    const areaState = state.areas[area];
    if (areaState?.done) continue;
    return area;
  }
  return null;
}

export function placementConcluido(state: PlacementState, scope: PlacementScope): boolean {
  return currentPlacementArea(state, scope) === null;
}

/**
 * Escolhe o próximo item a mostrar (docs/30 §12.3) — avança de área sozinho
 * quando o pool da área atual acaba ANTES de bater SE/limite (pool real
 * escasso, ver `placement-pool.ts`). `poolDaArea` normalmente é
 * `poolDiagnosticoDaArea`; injetável pra teste com pool sintético.
 */
export function pickPlacementItem(
  state: PlacementState,
  scope: PlacementScope,
  poolDaArea: (area: EnemAreaLike) => PlacementPoolItem[],
  seed: string,
  lastSubjectId: string | null,
): { item: PlacementPoolItem | null; state: PlacementState } {
  let atual = state;
  for (;;) {
    const area = currentPlacementArea(atual, scope);
    if (!area) return { item: null, state: atual };
    const areaState: PlacementAreaState = atual.areas[area] ?? {
      itemIds: [],
      responses: [],
      theta: null,
      se: null,
      done: false,
    };
    const pool = poolDaArea(area);
    const proximo = nextPlacementItem(pool, areaState, seed, lastSubjectId);
    if (proximo) return { item: proximo, state: atual };
    atual = { ...atual, areas: { ...atual.areas, [area]: { ...areaState, done: true } } };
  }
}

export function startPlacement(seed: string, now: string): PlacementState {
  return { status: "em-andamento", startedAt: now, finishedAt: null, areas: {}, seed };
}

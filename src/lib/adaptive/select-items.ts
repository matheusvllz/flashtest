/**
 * Seleção de itens de UMA atividade (docs/30 §11.7, Fase 8 do docs/31 F8.6)
 * — chamada na hora de COMEÇAR a atividade (estado mais recente), não no
 * planejamento. Pura: recebe tudo por parâmetro, semente injetada.
 */
import { itemDisponivel, itemsOfSkill, type ItemIndexEntry } from "@/content/items";
import { SKILL_MAP } from "@/content/taxonomy";
import { SLIP } from "./constants";
import type { LearningState } from "@/lib/learning/types";

/** a/c NOMINAIS pro cálculo de b-alvo (docs/30 §11.7) — não derivados do item real: o alvo é um ponto de referência pra RANQUEAR o pool pela proximidade de `b`, não uma predição de probabilidade item a item. a=1 (discriminação típica), c=0,2 (item de 5 alternativas, o formato mais comum no banco). */
const A_NOMINAL = 1;
const C_NOMINAL = 0.2;

export interface SelectItemsResult {
  itemIds: string[];
  /** true quando o pool não tinha itens suficientes mesmo depois de completar com habilidade vizinha (docs/30 §11.7). */
  poolCurto: boolean;
}

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** `bAlvo` — dificuldade-alvo (escala logit) pra uma probabilidade-alvo (docs/30 §11.7). */
export function bAlvo(theta: number, targetP: number, a = A_NOMINAL, c = C_NOMINAL): number {
  const targetPLinha = (targetP - c) / (1 - c - SLIP);
  const clamped = Math.min(0.999, Math.max(0.001, targetPLinha));
  return theta - Math.log(clamped / (1 - clamped)) / a;
}

function excluido(
  item: ItemIndexEntry,
  papel: "pratica" | "revisao" | "desafio" | "diagnostico",
  hoje: string,
  vistosHoje: Set<string>,
  vistosUltimos3Dias: Set<string>,
): boolean {
  if (item.status === "gerada") return true;
  if (!item.roles.includes(papel)) return true;
  if (vistosHoje.has(item.id)) return true;
  if (papel === "revisao" && vistosUltimos3Dias.has(item.id)) return true;
  return false;
}

/** "Randomesque": dos candidatos mais próximos de `bAlvo`, escolhe `n` com semente determinística, não sempre o top-n cru. */
function escolherRandomesque(candidatos: ItemIndexEntry[], n: number, seed: string): ItemIndexEntry[] {
  const pool = candidatos.slice(0, Math.min(candidatos.length, n * 3));
  const comHash = pool.map((item) => ({ item, h: fnv1a(`${seed}:${item.id}`) }));
  comHash.sort((a, b) => a.h - b.h);
  return comHash.slice(0, n).map((x) => x.item);
}

export function selectItems(
  skillId: string,
  n: number,
  targetP: number,
  theta: number,
  learning: Pick<LearningState, "recentAttempts">,
  today: string,
  seed: string,
  papel: "pratica" | "revisao" | "desafio" | "diagnostico" = "pratica",
  minDifficulty?: 1 | 2 | 3 | 4 | 5,
  maxDifficulty?: 1 | 2 | 3 | 4 | 5,
): SelectItemsResult {
  const vistosHoje = new Set(learning.recentAttempts.filter((a) => a.localDate === today).map((a) => a.exerciseId));
  const vistosUltimos3Dias = new Set(
    learning.recentAttempts
      .filter((a) => {
        const dias = Math.round(
          (new Date(`${today}T00:00:00Z`).getTime() - new Date(`${a.localDate}T00:00:00Z`).getTime()) / 86_400_000,
        );
        return dias >= 0 && dias <= 3;
      })
      .map((a) => a.exerciseId),
  );

  const alvo = bAlvo(theta, targetP);
  const dentroDaFaixa = (item: ItemIndexEntry) =>
    (minDifficulty === undefined || item.difficulty >= minDifficulty) &&
    (maxDifficulty === undefined || item.difficulty <= maxDifficulty);

  function poolDe(skillIds: string[]): ItemIndexEntry[] {
    const vistos = new Set<string>();
    const itens: ItemIndexEntry[] = [];
    for (const id of skillIds) {
      for (const item of itemsOfSkill(id)) {
        if (vistos.has(item.id)) continue;
        vistos.add(item.id);
        if (!itemDisponivel(item.id)) continue; // item de pacote ainda não carregado (docs/30 §21.3)
        if (excluido(item, papel, today, vistosHoje, vistosUltimos3Dias)) continue;
        if (!dentroDaFaixa(item)) continue;
        itens.push(item);
      }
    }
    return itens.sort((a, b) => Math.abs(a.b - alvo) - Math.abs(b.b - alvo));
  }

  let pool = poolDe([skillId]);
  let poolCurto = false;

  if (pool.length < n) {
    const skill = SKILL_MAP[skillId];
    const vizinhas = skill
      ? Object.values(SKILL_MAP).filter((s) => s.id !== skillId && s.topicId === skill.topicId).map((s) => s.id)
      : [];
    if (vizinhas.length > 0) {
      const idsJaNoPool = new Set(pool.map((i) => i.id));
      const extras = poolDe(vizinhas).filter((i) => !idsJaNoPool.has(i.id));
      pool = [...pool, ...extras].sort((a, b) => Math.abs(a.b - alvo) - Math.abs(b.b - alvo));
    }
  }

  let nFinal = n;
  if (pool.length < n) {
    poolCurto = true;
    nFinal = Math.max(2, Math.min(n, pool.length));
  }

  const escolhidos = escolherRandomesque(pool, Math.min(nFinal, pool.length), seed);
  const ordenadosPorDificuldade = escolhidos.sort((a, b) => a.difficulty - b.difficulty);

  return { itemIds: ordenadosPorDificuldade.map((i) => i.id), poolCurto: poolCurto || escolhidos.length < 2 };
}

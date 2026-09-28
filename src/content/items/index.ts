import { EXERCISE_IDS } from "@/content/exercise-ids";
import { resolveExercise } from "@/content/microlicoes";
import { FEATURES } from "@/lib/features";
import { packagedExercise, packagedItemMeta } from "@/lib/content/repository";
import { irtFromDifficulty } from "./irt";
import { ITEM_META_MICROLICOES } from "./meta/microlicoes";
import { ITEM_META_BANCO_GERAL } from "./meta/banco-geral";
import { trilhaItemMeta } from "./meta/trilhas";
import { ITENS_GERADOS } from "@/content/banco/itens-gerados";
import type { GeneratedItemRef } from "./package";
import type { ItemMeta } from "./types";

const REF_GERADO = new Map<string, GeneratedItemRef>(ITENS_GERADOS.map((r) => [r.id, r]));

/** Item de pacote (pipeline de conteúdo, docs/30 §21.3)? O texto dele só resolve depois de `ensureSubjects`. */
export function isPackagedItem(id: string): boolean {
  return REF_GERADO.has(id);
}

/**
 * Dá pra montar a questão agora? Item embarcado sempre; item de pacote só com o
 * pacote em memória. A SELEÇÃO usa isto — assim, pacote que não carregou vira o
 * fallback "só conteúdo embarcado" do `30` §21.3 sozinho, sem tela quebrada.
 */
export function itemDisponivel(id: string): boolean {
  return !REF_GERADO.has(id) || packagedExercise(id) !== undefined;
}

/** Matérias que têm itens em pacote (distintas, ordenadas). */
export function subjectsComItensGerados(): string[] {
  return [...new Set(ITENS_GERADOS.map((r) => r.subjectId))].sort();
}

/** Matéria do item de pacote — pra quem precisa chamar `ensureSubjects` antes de abrir. */
export function packagedSubjectOf(id: string): string | undefined {
  return REF_GERADO.get(id)?.subjectId;
}

/** Meta mínima a partir do índice leve, pra o motor escolher o item antes do pacote carregar. */
function metaFromRef(ref: GeneratedItemRef): ItemMeta {
  return {
    id: ref.id,
    version: 1,
    skillIds: ref.skillIds,
    difficulty: ref.difficulty,
    irt: { a: ref.a, b: ref.b, c: ref.c, source: "estimado" },
    roles: ref.roles,
    estimatedSeconds: 60,
    dontKnowAllowed: true,
    source: { kind: "ia-validada" },
    validation: { status: ref.status },
    examProfiles: ["enem"],
  };
}

export type { ItemCommonMistake, ItemExplanationLayers, ItemIrt, ItemMeta, ItemRole, ItemSource, ItemSourceKind, ItemValidation, ItemValidationStatus } from "./types";
export { guessingProbability, irtFromDifficulty } from "./irt";

/**
 * Padrão para item sem metadado explícito nas 3 fontes acima (docs/30 §8.4)
 * — nunca deveria ser atingido pra id que exista em `EXERCISE_IDS` (as 3
 * fontes cobrem 100%), mas existe pra `itemMetaOf` nunca lançar.
 */
function defaultMetaFor(id: string): ItemMeta {
  const exercise = resolveExercise(id);
  const difficulty = 2 as const;
  return {
    id,
    version: 1,
    skillIds: [],
    difficulty,
    irt: irtFromDifficulty(difficulty, exercise),
    roles: ["pratica", "revisao"],
    estimatedSeconds: 45,
    dontKnowAllowed: true,
    source: { kind: "autoral" },
    validation: { status: "revisada-humano", reviewer: "sem-classificacao" },
    examProfiles: ["enem"],
  };
}

/**
 * Metadado de UM item — local de microlição, banco geral, trilha legada, ou
 * o padrão de segurança acima (docs/30 §8.4, Fase 3 T-3.6). Nunca lança:
 * item sem classificação explícita ainda tem `ItemMeta` (habilidade vazia),
 * o motor adaptativo (Fase 8) trata `skillIds: []` como "não elegível pro
 * modelo", não como erro.
 */
export function itemMetaOf(id: string): ItemMeta {
  const ref = FEATURES.pacotesConteudo ? REF_GERADO.get(id) : undefined;
  const doPacote = FEATURES.pacotesConteudo ? (packagedItemMeta(id) ?? (ref ? metaFromRef(ref) : undefined)) : undefined;
  return (
    ITEM_META_MICROLICOES[id] ?? ITEM_META_BANCO_GERAL[id] ?? trilhaItemMeta(id) ?? doPacote ?? defaultMetaFor(id)
  );
}

export interface ItemIndexEntry {
  id: string;
  skill: string | null;
  skills: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  b: number;
  /** Discriminação/chute do 3PL (docs/30 §8.4) — expostos além de `b` pro nivelamento (Fase 13, informação de Fisher real). */
  a: number;
  c: number;
  roles: ItemMeta["roles"];
  status: ItemMeta["validation"]["status"];
  subjectId: string | null;
}

let cache: ItemIndexEntry[] | null = null;

/**
 * Todos os ids de item conhecidos — `EXERCISE_IDS` (docs/20 §9, banco geral
 * + trilhas) **não inclui** os exercícios locais das microlições (`mc:*`,
 * que não têm entrada lá porque nasceram depois, direto com id estável
 * próprio); união dos dois pra `itemIndex` não perder nenhum item.
 */
function allItemIds(): string[] {
  const gerados = FEATURES.pacotesConteudo ? ITENS_GERADOS.map((r) => r.id) : [];
  return [...new Set([...Object.keys(EXERCISE_IDS), ...Object.keys(ITEM_META_MICROLICOES), ...gerados])];
}

/** Índice de TODOS os itens conhecidos (docs/30 §8.4, Fase 3 T-3.6). Memoizado. */
export function itemIndex(): ItemIndexEntry[] {
  if (cache) return cache;
  cache = allItemIds().map((id) => {
    const meta = itemMetaOf(id);
    return {
      id,
      skill: meta.skillIds[0] ?? null,
      skills: meta.skillIds,
      difficulty: meta.difficulty,
      b: meta.irt.b,
      a: meta.irt.a,
      c: meta.irt.c,
      roles: meta.roles,
      status: meta.validation.status,
      subjectId: meta.skillIds[0]?.split(":")[0] ?? null,
    };
  });
  return cache;
}

export function itemsOfSkill(skillId: string): ItemIndexEntry[] {
  return itemIndex().filter((e) => e.skills.includes(skillId));
}

/** Só para teste — evita índice desatualizado entre cargas de módulo isoladas. */
export function _resetItemIndexCacheForTests(): void {
  cache = null;
}

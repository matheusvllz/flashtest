/**
 * Contratos do pipeline offline de conteúdo (docs/30 §19.3, Fase 9 do
 * docs/31). Roda fora do app — nada em `src/` importa este arquivo nem
 * qualquer outro de `scripts/content/pipeline-*`/`coverage`/`plan-batch`/
 * `run-stage`/`verify`/`humanize-guard`/`validate`/`publish` (guardado por
 * `tests/unit/pipeline-boundary.test.ts`), mas ELE pode importar de
 * `@/content/*` livremente — é o app que nunca deve importar o pipeline, o
 * contrário é normal (mesmo padrão de `scripts/content/build-packs.ts`).
 */
import type { Exercise } from "@/lib/lessons/types";
import type { MicroLessonV2 } from "@/lib/learning/types";
import type { ItemMeta, ItemRole } from "@/content/items/types";

export type CritiqueVerdict = "aprova" | "corrige" | "rejeita";

export interface CandidateStages {
  generated?: { model: string; at: string };
  critique?: { model: string; verdict: CritiqueVerdict; issues: string[]; fixed?: Exercise };
  solution?: { model: string; answerIndex: number | number[]; confidence: number; reasoning: string };
  verification?: { agree: boolean; escalated: boolean; finalAnswer?: number | number[]; judge?: string; note?: string };
  humanized?: { model: string; accepted: boolean; rejectedBecause?: string[] };
  validation?: { ok: boolean; issues: string[] };
  humanReview?: { reviewer: string; verdict: "aprova" | "reprova"; note?: string };
}

export interface Candidate {
  candidateId: string; // "<loteId>-<n>"
  skillId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  role: ItemRole;
  kind: "item" | "aula";
  exercise?: Exercise;
  lesson?: MicroLessonV2;
  meta: Partial<ItemMeta>;
  stages: CandidateStages;
}

/** Um item do lote planejado por `plan-batch.ts` (docs/30 §19.2, estágio 0). */
export interface BatchPlanEntry {
  skillId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  role: ItemRole;
  kind: "item" | "aula";
  quantity: number;
}

export interface BatchPlan {
  loteId: string;
  createdAt: string;
  entries: BatchPlanEntry[];
  totalCandidates: number;
}

/** Cobertura por habilidade (docs/30 §19.2, `coverage.ts`). */
export interface SkillCoverage {
  skillId: string;
  hasLesson: boolean;
  itemsByDifficulty: Record<1 | 2 | 3 | 4 | 5, number>;
  itemsByRole: Record<ItemRole, number>;
  diagnosticReviewed: number;
}

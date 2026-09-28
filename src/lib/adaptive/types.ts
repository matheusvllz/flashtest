/**
 * Contratos do motor adaptativo (docs/30 §11.6, Fase 4 do docs/31 — só
 * tipos, pra `learning/types.ts` poder referenciar `PlannedActivity` sem
 * ciclo; a lógica em si é da Fase 8). Nenhum destes tipos importa React,
 * store ou rede.
 */

export type ActivityKind = "aula" | "pratica" | "revisao" | "desafio" | "checkpoint" | "legado" | "reforco";

export type ReasonCode =
  | "retomar"
  | "nova-habilidade"
  | "consolidar"
  | "revisao-devida"
  | "revisao-atrasada"
  | "desafio"
  | "reforco-erros"
  | "reforco-nao-sei"
  | "reforco-ajuda"
  | "equilibrio-area"
  | "prioridade-aluno"
  | "checkpoint"
  | "confirmar-fundamento"
  | "fallback";

export interface PlannedActivity {
  /** Estável dentro do plano — `"atv-<data>-<hash>"` (Fase 8). */
  id: string;
  kind: ActivityKind;
  skillIds: string[];
  subjectId: string;
  /** Aula/legado/reforço com aula própria. */
  lessonId?: string;
  /** Prática/revisão/desafio/checkpoint — escolhidos ao COMEÇAR a atividade (docs/30 §11.7), não no planejamento. */
  itemIds?: string[];
  targetP?: number;
  estimatedMinutes: number;
  reasons: ReasonCode[];
  score: number;
  scoreBreakdown: Record<string, number>;
}

export interface JourneyPlan {
  generatedAt: string;
  algoVersion: number;
  activities: PlannedActivity[];
  fallback: boolean;
}

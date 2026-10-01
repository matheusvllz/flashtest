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
  /**
   * ISO UTC do início da tentativa (docs/36 §H, RF-2/RF-4). Gravado uma vez por
   * `startJourneyActivity` (T-02.1); ausente = atividade de antes do plano 36
   * (a sincronização mantém a regra antiga, por mera existência do registro).
   */
  startedAt?: string;
  /**
   * Checagem (spec 48 T-48.5.1): Domínio (0–100) de cada habilidade da checagem no momento em que o aluno tocou
   * "Começar", antes da primeira resposta. Gravado uma vez (recarregar não troca); base do "Subiu / Firme / Vale revisar".
   */
  masteryAntes?: Record<string, number>;
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

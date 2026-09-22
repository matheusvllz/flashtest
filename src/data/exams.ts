/**
 * Perfis de vestibular (docs/20 §10, Fase 8, item 1) — "cadastrar perfis e
 * dados mínimos de PAS/ENEM sem misturar instituição e prova". `hasStages`
 * marca perfis onde etapa/ciclo são obrigatórios pra uma dica ser elegível
 * (docs/20 §10 regra 5) — não dedutível da universidade-alvo do aluno.
 */
export interface ExamProfileDef {
  id: string;
  name: string;
  hasStages: boolean;
  stages?: string[];
}

export const EXAMS: ExamProfileDef[] = [
  { id: "enem", name: "ENEM", hasStages: false },
  { id: "pas-unb", name: "PAS/UnB", hasStages: true, stages: ["1", "2", "3"] },
];

export const EXAM_MAP: Record<string, ExamProfileDef> = Object.fromEntries(
  EXAMS.map((e) => [e.id, e]),
);

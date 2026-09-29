// Seleção das questões do Praticar (/study). Mora fora do arquivo da rota de propósito (docs/44 §3): o divisor de
// código do roteador só separa o componente; qualquer outro export de um arquivo de rota vai para o JS inicial de
// toda página (inclusive a landing), junto com o banco de questões e o store que ele importa.
import { QUESTIONS, type Question } from "@/data/questions";
import { planWithFallback, selectItemsForActivity } from "@/lib/adaptive";
import { hojeISO, type AppState, type Gap } from "@/lib/store";

/** Uma aula tem 2 questões — é a unidade de 60 segundos decidida no SDD 12. */
export const LESSON_SIZE = 2;

/**
 * Monta a aula de 60s. A ordem de prioridade é: lacunas do diagnóstico primeiro,
 * depois matérias declaradas difíceis, depois o resto do banco. Questões já
 * respondidas saem da fila até o banco acabar.
 */
export function pickQuestions(gaps: Gap[], difficultSubjects: string[], completed: string[]): Question[] {
  const remaining = QUESTIONS.filter((q) => !completed.includes(q.id));
  const pool = remaining.length ? remaining : QUESTIONS;
  const gapTopics = gaps.map((g) => g.topic);

  const rank = (q: Question) =>
    gapTopics.includes(q.topic) ? 0 : difficultSubjects.includes(q.subjectName) ? 1 : 2;

  return [...pool].sort((a, b) => rank(a) - rank(b)).slice(0, LESSON_SIZE);
}

/**
 * Variante adaptativa (docs/30 §11.10, Fase 12 F12.7) — reaproveita
 * `planWithFallback`/`selectItemsForActivity` (os únicos contratos que o
 * resto do app deveria chamar no motor — comentário de `adaptive/index.ts`)
 * em vez de reimplementar `classifySkill`/`scoreCandidate` aqui: o
 * planejador já só cria atividade "pratica" pra habilidade EM_APRENDIZADO e
 * "revisao" pra DEVIDA, já ordenadas por score (docs/30 §11.2-§11.4) — pegar
 * a primeira com itens que existem no banco geral (`QUESTIONS`, o único
 * catálogo que `/study` sabe renderizar) é equivalente ao pseudocódigo do
 * `31` sem duplicar a lógica de pontuação. `null` = nenhuma candidata (sem
 * modelo ainda, ou nenhum item do banco geral na seleção) — quem chama cai
 * no `pickQuestions` de sempre.
 */
export function pickQuestionsAdaptive(s: Pick<AppState, "prefs" | "learning" | "progress">): Question[] | null {
  const hoje = hojeISO();
  try {
    const plano = planWithFallback(s, hoje, hoje, { n: 8 });
    for (const atividade of plano.activities) {
      if (atividade.kind !== "pratica" && atividade.kind !== "revisao") continue;
      const itemIds = selectItemsForActivity(atividade, s, hoje, atividade.id);
      const perguntas = itemIds
        .map((id) => QUESTIONS.find((question) => question.id === id))
        .filter((question): question is Question => Boolean(question));
      if (perguntas.length >= LESSON_SIZE) return perguntas.slice(0, LESSON_SIZE);
    }
  } catch {
    return null;
  }
  return null;
}


import type { Attempt, LearningSession, MicroLesson } from "./types";
import { nextAvailableMicroLesson } from "./selectors";
import type { AppState } from "@/lib/store";

/**
 * Recomendação determinística (docs/20 §13, Fase 10) — função pura, relógio
 * injetado (`hojeISO`), nenhuma chamada de IA. Mesmo estado + mesma entrada
 * sempre produz o mesmo resultado (docs/20 §13: "mesmo estado/relógio produz
 * mesma recomendação" — critério A13). Prioridade fixa da seção 13:
 *
 * 1. Retomar sessão ativa não concluída.
 * 2. Dois erros distintos na mesma habilidade -> remediação (no máx. 1/sessão).
 * 3. Revisão devida elegível.
 * 4. Próxima microlição disponível.
 * 5. (MVP não tem "conteúdo curado por dificuldade declarada" — ver nota abaixo)
 * 6. Nenhuma lição elegível -> `reason: "none"`, nunca inventa conteúdo.
 */
export type RecommendationReason =
  | "resume-session"
  | "remediation"
  | "review-due"
  | "next-lesson"
  | "none";

export interface Recommendation {
  reason: RecommendationReason;
  lessonId?: string;
  skillId?: string;
  /** Explicação simples pro "por que esta lição?" (docs/20 §13, item 7) — nunca "a IA descobriu": é regra. */
  explanation: string;
}

/** Habilidades com pelo menos 2 exercícios DISTINTOS errados nas tentativas recentes. */
function skillsWithTwoDistinctErrors(attempts: Attempt[]): string[] {
  const erradosPorSkill = new Map<string, Set<string>>();
  for (const a of attempts) {
    if (a.correct) continue;
    for (const skillId of a.skillIds) {
      const set = erradosPorSkill.get(skillId) ?? new Set<string>();
      set.add(a.exerciseId);
      erradosPorSkill.set(skillId, set);
    }
  }
  return [...erradosPorSkill.entries()].filter(([, ids]) => ids.size >= 2).map(([skillId]) => skillId);
}

export function recommendNext(params: {
  activeSession: LearningSession | null;
  lessons: MicroLesson[];
  recentAttempts: Attempt[];
  reviewSchedule: AppState["learning"]["reviewSchedule"];
  s: AppState;
  hojeISO: string;
  /** O chamador rastreia isso (ex.: um `useState` na sessão de tela) — regra de "no máx. 1 remediação por sessão" (docs/20 §13, item 4). */
  remediationAlreadyOfferedThisSession: boolean;
}): Recommendation {
  // 1. Retomar sessão ativa não concluída — sempre a maior prioridade.
  if (params.activeSession && params.activeSession.completedAt === null) {
    return {
      reason: "resume-session",
      lessonId: params.activeSession.contentId,
      explanation: "Você tem uma lição em andamento — vamos terminar ela primeiro.",
    };
  }

  // 2. Dois erros distintos na mesma habilidade -> remediação (uma sugestão por sessão).
  if (!params.remediationAlreadyOfferedThisSession) {
    const skillsComErro = skillsWithTwoDistinctErrors(params.recentAttempts);
    if (skillsComErro.length > 0) {
      const skillId = skillsComErro[0];
      const licaoDaHabilidade = params.lessons.find((l) => l.skillIds.includes(skillId));
      if (licaoDaHabilidade) {
        return {
          reason: "remediation",
          lessonId: licaoDaHabilidade.id,
          skillId,
          explanation: `Você errou duas vezes em ${skillId.split(":")[1] ?? skillId} — vale revisar antes de seguir.`,
        };
      }
    }
  }

  // 3. Revisão devida elegível.
  for (const [skillId, agenda] of Object.entries(params.reviewSchedule)) {
    if (agenda.dueDate <= params.hojeISO) {
      const licaoDaHabilidade = params.lessons.find((l) => l.skillIds.includes(skillId));
      if (licaoDaHabilidade) {
        return {
          reason: "review-due",
          lessonId: licaoDaHabilidade.id,
          skillId,
          explanation: "Tem uma revisão prevista pra hoje — é o melhor uso do seu tempo agora.",
        };
      }
    }
  }

  // 4. Próxima microlição disponível (mesma fonte que a trilha usa — docs/20 §13, item 3).
  const proxima = nextAvailableMicroLesson(params.lessons, params.s);
  if (proxima) {
    return {
      reason: "next-lesson",
      lessonId: proxima.id,
      explanation: `Sua próxima lição da trilha é "${proxima.title}".`,
    };
  }

  // 6. Nada elegível — nunca promete um tópico que não vai realmente abrir (docs/20 §13, item 2/7).
  return { reason: "none", explanation: "Nenhuma lição nova disponível agora." };
}

/**
 * Candidatos de atividade por habilidade (docs/30 §11.3, Fase 8 do docs/31
 * F8.3) — pura tabela estado→candidato; a pontuação (scoring.ts) e a
 * sequência (planner.ts) decidem o resto.
 */
import { CURRICULUM_TREE } from "@/content/curriculum-tree";
import { trilhaById } from "@/content/trilhas";
import { MICROLICOES } from "@/content/microlicoes";
import { AULAS_GERADAS } from "@/content/banco/aulas-geradas";
import { FEATURES } from "@/lib/features";
import type { LearningState, MicroLesson } from "@/lib/learning/types";
import type { SkillDef } from "@/content/taxonomy/types";
import type { ActivityKind } from "./types";
import type { SkillClassification } from "./classify";
import { ITENS_POR_ATIVIDADE, P_ALVO_POR_ATIVIDADE, MASTERY_AULA_OPCIONAL_MIN, CONFIDENCE_AULA_OPCIONAL_MIN } from "./constants";
import { mastery } from "./model";
import { confidence } from "./confidence";

export interface Candidate {
  kind: ActivityKind;
  skillId: string;
  subjectId: string;
  lessonId?: string;
  itemCount: number;
  targetP: number;
  minDifficulty?: 1 | 2 | 3 | 4 | 5;
  /** Prática introdutória em vez de aula (NOVA sem aula própria) — dificuldade ≤ 2. */
  maxDifficulty?: 1 | 2 | 3 | 4 | 5;
}

/** Lição autoral (não-revisão) que ensina a habilidade, se existir — primeira na ordem do catálogo. */
export function lessonForSkill(skillId: string): MicroLesson | undefined {
  return MICROLICOES.find((l) => l.skillIds.includes(skillId));
}

/**
 * Id da aula que ensina a habilidade: a autoral embarcada primeiro; senão a aula
 * gerada pelo pipeline (docs/31 F11.3), que mora em pacote e é carregada pela
 * rota `/learn/$lessonId` antes de tocar.
 */
export function lessonIdForSkill(skillId: string): string | undefined {
  const autoral = lessonForSkill(skillId);
  if (autoral) return autoral.id;
  if (!FEATURES.pacotesConteudo) return undefined;
  return AULAS_GERADAS.find((r) => r.skillIds.includes(skillId))?.lessonId;
}

/** Capítulo legado (trilha de redação) mapeado pra essa habilidade, se existir. */
function legacyChapterForSkill(skillId: string) {
  const capitulos = CURRICULUM_TREE.subjects.flatMap((s) => s.sections.flatMap((sec) => sec.chapters));
  return capitulos.find((c) => c.trilhaId && c.skillIds?.includes(skillId));
}

/** Próxima lição não concluída da trilha legada, na ordem declarada — `undefined` se a trilha acabou. */
function nextLegacyLesson(trilhaId: string, completedLessons: Record<string, unknown>) {
  const trilha = trilhaById(trilhaId);
  if (!trilha) return undefined;
  return trilha.licoes.find((l) => !completedLessons[l.id]);
}

/**
 * `candidateForSkill` (§11.3) — um candidato por habilidade elegível, na
 * classificação já resolvida (`classify.ts`). `IGNORAR`/`BLOQUEADA` nunca
 * chegam aqui (o chamador já filtrou).
 */
export function candidateForSkill(
  skill: Pick<SkillDef, "id" | "subjectId" | "core">,
  state: SkillClassification,
  learning: Pick<LearningState, "completedLessons" | "skillModel" | "skillEvidence">,
  today: string,
): Candidate | null {
  const skillId = skill.id;
  const subjectId = skill.subjectId;
  switch (state) {
    case "NOVA": {
      const aula = lessonIdForSkill(skillId);
      if (aula) {
        // "Aula opcional" (docs/31 §12 algoritmo, Fase 8): habilidade NOVA mas já com
        // Mastery/Confidence alta vinda de EVIDÊNCIA (nivelamento/replay, não prior frio)
        // pula a aula e vira prática de CONFIRMAÇÃO — nunca pula de vez (nunca "nada"),
        // sempre confirma; fundamento (`core`) segue a MESMA regra, não uma diferente
        // (a ressalva "se core, sempre confirmação" é sobre não pular pra FIRME direto).
        const entry = learning.skillModel[skillId];
        const m = mastery(entry);
        const c = confidence(entry, learning.skillEvidence[skillId], today).value;
        const evidenciaForte = entry?.source === "evidencia" && m >= MASTERY_AULA_OPCIONAL_MIN && c >= CONFIDENCE_AULA_OPCIONAL_MIN;
        if (evidenciaForte) {
          return {
            kind: "pratica",
            skillId,
            subjectId,
            itemCount: 3,
            targetP: P_ALVO_POR_ATIVIDADE.introducao,
          };
        }
        return { kind: "aula", skillId, subjectId, lessonId: aula, itemCount: 0, targetP: P_ALVO_POR_ATIVIDADE.introducao };
      }
      return {
        kind: "pratica",
        skillId,
        subjectId,
        itemCount: ITENS_POR_ATIVIDADE.introducao,
        targetP: P_ALVO_POR_ATIVIDADE.introducao,
        maxDifficulty: 2,
      };
    }
    case "EM_APRENDIZADO":
      return { kind: "pratica", skillId, subjectId, itemCount: ITENS_POR_ATIVIDADE.pratica, targetP: P_ALVO_POR_ATIVIDADE.pratica };
    case "DEVIDA":
      return { kind: "revisao", skillId, subjectId, itemCount: ITENS_POR_ATIVIDADE.revisao, targetP: P_ALVO_POR_ATIVIDADE.revisao };
    case "FIRME":
      return {
        kind: "desafio",
        skillId,
        subjectId,
        itemCount: ITENS_POR_ATIVIDADE.desafio,
        targetP: P_ALVO_POR_ATIVIDADE.desafio,
        minDifficulty: 4,
      };
    case "REFORCO": {
      const aula = lessonIdForSkill(skillId);
      return {
        kind: "reforco",
        skillId,
        subjectId,
        lessonId: aula,
        itemCount: ITENS_POR_ATIVIDADE.reforco,
        targetP: P_ALVO_POR_ATIVIDADE.reforco,
      };
    }
    default:
      return null;
  }
}

/**
 * Candidato de lição LEGADA (trilha de redação) pra uma habilidade NOVA/EM_APRENDIZADO
 * mapeada em `LEGACY_CHAPTER_SKILLS`, respeitando a ordem da trilha (§11.3, última linha).
 * `undefined` quando a habilidade não tem trilha legada mapeada, ou a trilha já acabou.
 */
export function legacyCandidateForSkill(
  skillId: string,
  state: SkillClassification,
  learning: Pick<LearningState, "completedLessons">,
): Candidate | null {
  if (state !== "NOVA" && state !== "EM_APRENDIZADO") return null;
  const capitulo = legacyChapterForSkill(skillId);
  if (!capitulo?.trilhaId) return null;
  const proxima = nextLegacyLesson(capitulo.trilhaId, learning.completedLessons);
  if (!proxima) return null;
  return {
    kind: "legado",
    skillId,
    subjectId: "red",
    lessonId: proxima.id,
    itemCount: 0,
    targetP: P_ALVO_POR_ATIVIDADE.introducao,
  };
}

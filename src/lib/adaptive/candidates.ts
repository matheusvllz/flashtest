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
import {
  ITENS_POR_ATIVIDADE,
  P_ALVO_POR_ATIVIDADE,
  MASTERY_AULA_OPCIONAL_MIN,
  CONFIDENCE_AULA_OPCIONAL_MIN,
  MASTERY_SINAL_DESAFIO_MIN,
} from "./constants";
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
  /** Desafio que veio do sinal de recalibração do checkpoint (docs/36 RP-4) — o planner limita a 1 por plano. */
  porSinalDeDesafio?: boolean;
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

/**
 * TODAS as aulas que ensinam a habilidade (docs/36 RF-5): autoral(is)
 * embarcada(s) primeiro (ordem do catálogo), depois as geradas pelo pipeline
 * (só com `pacotesConteudo` ligada). `lessonIdForSkill` continua devolvendo a
 * primeira — quem precisa saber "alguma aula desta habilidade foi concluída?"
 * (planner, pré-requisito) usa esta lista, porque uma aula GERADA concluída
 * também conta (antes só a autoral contava — bug C4b).
 */
export function lessonIdsForSkill(skillId: string): string[] {
  const ids = MICROLICOES.filter((l) => l.skillIds.includes(skillId)).map((l) => l.id);
  if (FEATURES.pacotesConteudo) {
    for (const r of AULAS_GERADAS) {
      if (r.skillIds.includes(skillId) && !ids.includes(r.lessonId)) ids.push(r.lessonId);
    }
  }
  return ids;
}

/** Alguma aula (autoral OU gerada) da habilidade consta como concluída em `learning.completedLessons`? (docs/36 RF-5) */
export function aulaConcluidaDaHabilidade(skillId: string, completedLessons: Record<string, unknown>): boolean {
  return lessonIdsForSkill(skillId).some((id) => Boolean(completedLessons[id]));
}

/** Capítulo legado (trilha de redação) mapeado pra essa habilidade, se existir. */
function legacyChapterForSkill(skillId: string) {
  const capitulos = CURRICULUM_TREE.subjects.flatMap((s) => s.sections.flatMap((sec) => sec.chapters));
  return capitulos.find((c) => c.trilhaId && c.skillIds?.includes(skillId));
}

/** Próxima lição não concluída da trilha legada, na ordem declarada — `undefined` se a trilha acabou. */
function nextLegacyLesson(trilhaId: string, progressLessons: Record<string, unknown>) {
  const trilha = trilhaById(trilhaId);
  if (!trilha) return undefined;
  return trilha.licoes.find((l) => !progressLessons[l.id]);
}

/**
 * `candidateForSkill` (§11.3) — um candidato por habilidade elegível, na
 * classificação já resolvida (`classify.ts`). `IGNORAR`/`BLOQUEADA` nunca
 * chegam aqui (o chamador já filtrou).
 */
export function candidateForSkill(
  skill: Pick<SkillDef, "id" | "subjectId" | "core">,
  state: SkillClassification,
  learning: Pick<LearningState, "completedLessons" | "skillModel" | "skillEvidence"> & {
    journey?: Pick<LearningState["journey"], "challengeEligible">;
  },
  today: string,
  opts: { sinalDeDesafioPermitido?: boolean } = {},
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
    case "EM_APRENDIZADO": {
      // Sinal de "subestimada" da recalibração do checkpoint (docs/36 RP-4, G.4): acertou
      // o que o modelo achava difícil e o sinal ainda vale (`challengeEligible[skill] >= hoje`)
      // → desafio (dificuldade ≥ 3) em vez de mais uma prática. Exige Mastery ≥ 60; o
      // planner passa `sinalDeDesafioPermitido: false` depois do primeiro do plano (máx. 1).
      const validade = learning.journey?.challengeEligible?.[skillId];
      if (
        opts.sinalDeDesafioPermitido !== false &&
        validade !== undefined &&
        validade >= today &&
        mastery(learning.skillModel[skillId]) >= MASTERY_SINAL_DESAFIO_MIN
      ) {
        return {
          kind: "desafio",
          skillId,
          subjectId,
          itemCount: ITENS_POR_ATIVIDADE.desafio,
          targetP: P_ALVO_POR_ATIVIDADE.desafio,
          minDifficulty: 3,
          porSinalDeDesafio: true,
        };
      }
      return { kind: "pratica", skillId, subjectId, itemCount: ITENS_POR_ATIVIDADE.pratica, targetP: P_ALVO_POR_ATIVIDADE.pratica };
    }
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
 *
 * `progressLessons` = `progress.lessons` (docs/36 RF-5, C4a): a conclusão de lição
 * LEGADA mora ali (`completeLesson`), NÃO em `learning.completedLessons` (que é
 * de aula). Ler a fonte errada devolvia a mesma lição antes e depois de concluir.
 */
export function legacyCandidateForSkill(
  skillId: string,
  state: SkillClassification,
  progressLessons: Record<string, unknown>,
): Candidate | null {
  if (state !== "NOVA" && state !== "EM_APRENDIZADO") return null;
  const capitulo = legacyChapterForSkill(skillId);
  if (!capitulo?.trilhaId) return null;
  const proxima = nextLegacyLesson(capitulo.trilhaId, progressLessons);
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

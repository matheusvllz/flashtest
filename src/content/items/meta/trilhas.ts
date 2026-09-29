import { CURRICULUM_TREE } from "@/content/curriculum-tree";
import { lessonById } from "@/content/trilhas";
import { irtFromDifficulty } from "../irt";
import type { ItemMeta } from "../types";

/**
 * Metadado dos 1.204 exercícios das 15 trilhas legadas de Português/Redação
 * (docs/30 §8.4/§18.2, Fase 3 T-3.5).
 *
 * **Divergência registrada em docs/32:** o `31` pedia classificação item a
 * item (habilidade + dificuldade individual, com conferência de gabarito —
 * "o modelo resolve sem ver `correta` e compara"). Isso exige ler os 1.204
 * enunciados um a um, o que não coube no orçamento desta rodada de execução
 * direta (sem um lote de subagentes baratos supervisionado à parte). Em vez
 * de fabricar 1.204 entradas com aparência de precisão que não existe, esta
 * fase implementa exatamente o **padrão já documentado no `30` §8.4** —
 * "item sem metadado usa a habilidade da lição, dificuldade 2, papéis
 * prática/revisão" — como FUNÇÃO (não tabela estática), derivada da mesma
 * habilidade já real e revisada que o capítulo da trilha recebeu na Fase 2
 * (`LEGACY_CHAPTER_SKILLS` em `curriculum-tree.ts`). Fica pendente uma
 * passada real de classificação por item (Fase 9/11 do `31`, ou uma tarefa
 * dedicada de lote com modelo barato + amostra humana), que pode SUBSTITUIR
 * esta função por uma tabela — sem quebrar nada, o formato de saída é o
 * mesmo `ItemMeta`.
 */

const TRILHA_ID_REGEX = /^(.+):(\d+)$/;

function chapterSkillIdsOfTrilha(trilhaId: string): string[] {
  const capitulo = CURRICULUM_TREE.subjects
    .flatMap((s) => s.sections.flatMap((sec) => sec.chapters))
    .find((c) => c.trilhaId === trilhaId);
  return capitulo?.skillIds ?? [];
}

/** `undefined` se `id` não for um id de exercício de trilha (`<lessonId>:<índice>`) ou a lição não existir. */
export function trilhaItemMeta(id: string): ItemMeta | undefined {
  const match = TRILHA_ID_REGEX.exec(id);
  if (!match) return undefined;
  const [, lessonId, indiceStr] = match;
  const encontrado = lessonById(lessonId);
  if (!encontrado) return undefined;
  const indice = Number(indiceStr);
  const exercise = encontrado.lesson.exercicios[indice];
  if (!exercise) return undefined;

  const skillIds = chapterSkillIdsOfTrilha(encontrado.trilha.id);
  const difficulty = 2 as const;

  return {
    id,
    version: 1,
    skillIds: skillIds.length > 0 ? skillIds.slice(0, 1) : [],
    difficulty,
    irt: irtFromDifficulty(difficulty, exercise),
    roles: ["pratica", "revisao"],
    estimatedSeconds: 45,
    dontKnowAllowed: true,
    source: { kind: "autoral" },
    // Conteúdo revisado na autoria da trilha (docs/22/26) — "revisada-humano"
    // é sobre SEGURANÇA do conteúdo mostrado, não sobre a precisão da
    // classificação de habilidade/dificuldade (ver nota de divergência acima).
    validation: { status: "revisada-humano", reviewer: "autoria-legada-nivel-capitulo", reviewKind: "autoria-legada" },
    examProfiles: ["enem"],
  };
}

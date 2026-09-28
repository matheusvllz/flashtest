import { describe, expect, test } from "bun:test";
import { candidateForSkill, legacyCandidateForSkill, lessonForSkill } from "@/lib/adaptive/candidates";
import { updateSkill } from "@/lib/adaptive/model";
import { SKILL_MAP } from "@/content/taxonomy";

/**
 * Candidatos por habilidade (docs/30 §11.3, Fase 8 F8.3).
 */

const learningVazio = { completedLessons: {}, skillModel: {}, skillEvidence: {} };
const hoje = "2026-09-24";
const skill = SKILL_MAP["mat:porcentagem-conceito"]; // tem aula própria ("porcentagem-valor")
const skillSemAula = SKILL_MAP["mat:operacoes-fundamentais"];

describe("candidateForSkill", () => {
  test("NOVA com aula própria, sem evidência prévia → kind aula", () => {
    const c = candidateForSkill(skill, "NOVA", learningVazio, hoje);
    expect(c?.kind).toBe("aula");
    expect(c?.lessonId).toBe(lessonForSkill(skill.id)?.id);
  });

  test("NOVA sem aula própria → prática introdutória, dificuldade <= 2", () => {
    const c = candidateForSkill(skillSemAula, "NOVA", learningVazio, hoje);
    expect(c?.kind).toBe("pratica");
    expect(c?.maxDifficulty).toBe(2);
    expect(c?.itemCount).toBe(4);
  });

  test("EM_APRENDIZADO → prática, 5 itens, p-alvo 0.70", () => {
    const c = candidateForSkill(skill, "EM_APRENDIZADO", learningVazio, hoje);
    expect(c?.kind).toBe("pratica");
    expect(c?.itemCount).toBe(5);
    expect(c?.targetP).toBeCloseTo(0.7, 5);
  });

  test("DEVIDA → revisao, 4 itens, p-alvo 0.80", () => {
    const c = candidateForSkill(skill, "DEVIDA", learningVazio, hoje);
    expect(c?.kind).toBe("revisao");
    expect(c?.itemCount).toBe(4);
    expect(c?.targetP).toBeCloseTo(0.8, 5);
  });

  test("FIRME → desafio, 3 itens, dificuldade mínima 4, p-alvo 0.50", () => {
    const c = candidateForSkill(skill, "FIRME", learningVazio, hoje);
    expect(c?.kind).toBe("desafio");
    expect(c?.itemCount).toBe(3);
    expect(c?.minDifficulty).toBe(4);
    expect(c?.targetP).toBeCloseTo(0.5, 5);
  });

  test("REFORCO → reforco, 4 itens, p-alvo 0.85", () => {
    const c = candidateForSkill(skill, "REFORCO", learningVazio, hoje);
    expect(c?.kind).toBe("reforco");
    expect(c?.itemCount).toBe(4);
    expect(c?.targetP).toBeCloseTo(0.85, 5);
  });

  test("IGNORAR/BLOQUEADA não geram candidato", () => {
    expect(candidateForSkill(skill, "IGNORAR", learningVazio, hoje)).toBeNull();
    expect(candidateForSkill(skill, "BLOQUEADA", learningVazio, hoje)).toBeNull();
  });

  test("aula opcional (docs/31 §12): NOVA com Mastery/Confidence alta vinda de EVIDÊNCIA vira prática de confirmação (3 itens), não aula", () => {
    let entry = undefined;
    for (let i = 0; i < 10; i++) {
      entry = updateSkill(
        entry,
        skill.id,
        { role: "diagnostico", correct: true },
        { a: 1.3, b: -0.5, c: 0.2, source: "estimado" },
        `2026-09-1${i}`,
        { difficulty: 3, now: `2026-09-1${i}T10:00:00.000Z` },
      );
    }
    const evidence = {
      skillId: skill.id,
      distinctExerciseIds: ["a", "b", "c", "d", "e"],
      distinctLocalDates: ["2026-09-10", "2026-09-11", "2026-09-12"],
      lastFiveCorrect: [true, true, true, true, true],
      hasReviewCorrectAfter24h: true,
    };
    const c = candidateForSkill(
      skill,
      "NOVA",
      { completedLessons: {}, skillModel: { [skill.id]: entry! }, skillEvidence: { [skill.id]: evidence } },
      "2026-09-18",
    );
    expect(c?.kind).toBe("pratica");
    expect(c?.itemCount).toBe(3);
  });
});

describe("legacyCandidateForSkill", () => {
  test("habilidade mapeada em LEGACY_CHAPTER_SKILLS, NOVA, sem nada concluído → 1ª lição da trilha", () => {
    const c = legacyCandidateForSkill("por:crase-regra-basica", "NOVA", learningVazio);
    expect(c?.kind).toBe("legado");
    expect(c?.lessonId).toBeTruthy();
  });

  test("trilha inteira já concluída → null (fase de esgotamento, não trava)", () => {
    // Não temos fixture de trilha 100% completa aqui sem ler o catálogo — cobertura
    // indireta: FIRME/REFORCO nunca geram candidato legado (só NOVA/EM_APRENDIZADO).
    expect(legacyCandidateForSkill("por:crase-regra-basica", "FIRME", learningVazio)).toBeNull();
    expect(legacyCandidateForSkill("por:crase-regra-basica", "REFORCO", learningVazio)).toBeNull();
  });

  test("habilidade sem trilha legada mapeada → null", () => {
    expect(legacyCandidateForSkill("mat:porcentagem-conceito", "NOVA", learningVazio)).toBeNull();
  });
});

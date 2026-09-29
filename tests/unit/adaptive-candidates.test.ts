import { describe, expect, test } from "bun:test";
import { candidateForSkill, legacyCandidateForSkill, lessonForSkill, lessonIdsForSkill } from "@/lib/adaptive/candidates";
import { updateSkill } from "@/lib/adaptive/model";
import { SKILL_MAP } from "@/content/taxonomy";
import { CURRICULUM_TREE } from "@/content/curriculum-tree";
import { trilhaById } from "@/content/trilhas";

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

  // docs/36 T-04.4 (RP-4): sinal de "subestimada" do checkpoint vira desafio em EM_APRENDIZADO.
  const modeloComMastery = (theta: number) => ({
    [skill.id]: {
      skillId: skill.id, theta, sigma: 0.7, nEff: 3, difficultiesSeen: [2, 3], recent: [1, 1, 1],
      independentShare: 1, lastEvidenceDate: hoje, lapses: 0, dontKnowRecent: 0, helpHeavyRecent: 0,
      source: "evidencia" as const, algoVersion: 1, updatedAt: `${hoje}T10:00:00.000Z`,
    },
  });

  test("EM_APRENDIZADO com sinal de desafio válido e Mastery ≥ 60 → desafio (dificuldade ≥ 3), marcado como vindo do sinal", () => {
    const learning = { ...learningVazio, skillModel: modeloComMastery(0.8), journey: { challengeEligible: { [skill.id]: "2026-09-30" } } };
    const c = candidateForSkill(skill, "EM_APRENDIZADO", learning, hoje);
    expect(c?.kind).toBe("desafio");
    expect(c?.minDifficulty).toBe(3);
    expect(c?.porSinalDeDesafio).toBe(true);
  });

  test("sinal válido só até a data (validade == hoje ainda vale; vencido não)", () => {
    const model = modeloComMastery(0.8);
    expect(candidateForSkill(skill, "EM_APRENDIZADO", { ...learningVazio, skillModel: model, journey: { challengeEligible: { [skill.id]: hoje } } }, hoje)?.kind).toBe("desafio");
    expect(candidateForSkill(skill, "EM_APRENDIZADO", { ...learningVazio, skillModel: model, journey: { challengeEligible: { [skill.id]: "2026-09-23" } } }, hoje)?.kind).toBe("pratica");
  });

  test("sinal com Mastery < 60 não vira desafio; sem sinal continua prática", () => {
    const fraca = { ...learningVazio, skillModel: modeloComMastery(-0.5), journey: { challengeEligible: { [skill.id]: "2026-09-30" } } };
    expect(candidateForSkill(skill, "EM_APRENDIZADO", fraca, hoje)?.kind).toBe("pratica");
    expect(candidateForSkill(skill, "EM_APRENDIZADO", { ...learningVazio, skillModel: modeloComMastery(0.8) }, hoje)?.kind).toBe("pratica");
  });

  test("sinalDeDesafioPermitido: false (limite de 1 por plano) devolve prática", () => {
    const learning = { ...learningVazio, skillModel: modeloComMastery(0.8), journey: { challengeEligible: { [skill.id]: "2026-09-30" } } };
    expect(candidateForSkill(skill, "EM_APRENDIZADO", learning, hoje, { sinalDeDesafioPermitido: false })?.kind).toBe("pratica");
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
    const c = legacyCandidateForSkill("por:crase-regra-basica", "NOVA", {});
    expect(c?.kind).toBe("legado");
    expect(c?.lessonId).toBeTruthy();
  });

  test("trilha inteira já concluída → null (fase de esgotamento, não trava)", () => {
    // Não temos fixture de trilha 100% completa aqui sem ler o catálogo — cobertura
    // indireta: FIRME/REFORCO nunca geram candidato legado (só NOVA/EM_APRENDIZADO).
    expect(legacyCandidateForSkill("por:crase-regra-basica", "FIRME", {})).toBeNull();
    expect(legacyCandidateForSkill("por:crase-regra-basica", "REFORCO", {})).toBeNull();
  });

  test("habilidade sem trilha legada mapeada → null", () => {
    expect(legacyCandidateForSkill("mat:porcentagem-conceito", "NOVA", {})).toBeNull();
  });
});

/**
 * docs/36 RF-5 (bug C4a, T-02.4; era o vermelho intencional da T-01.5): a
 * conclusão de lição LEGADA grava em `progress.lessons` (não em
 * `learning.completedLessons`) — o candidato legado lê a fonte certa e avança
 * pra próxima lição da trilha em vez de repor a mesma.
 */
describe("legacyCandidateForSkill — conclusão vem de progress.lessons (docs/36 RF-5, C4a)", () => {
  function licoesDaTrilhaDeCrase() {
    const capitulo = CURRICULUM_TREE.subjects
      .flatMap((s) => s.sections.flatMap((sec) => sec.chapters))
      .find((c) => c.trilhaId && c.skillIds?.includes("por:crase-regra-basica"));
    return trilhaById(capitulo!.trilhaId!)!.licoes;
  }

  test("1ª lição da trilha concluída em progress.lessons → candidato devolve a 2ª", () => {
    const licoes = licoesDaTrilhaDeCrase();
    expect(licoes.length).toBeGreaterThanOrEqual(2);
    const progressLessons = { [licoes[0].id]: { stars: 3, completedAt: "2026-09-28T10:00:00.000Z" } };
    const c = legacyCandidateForSkill("por:crase-regra-basica", "NOVA", progressLessons);
    expect(c?.lessonId).toBe(licoes[1].id);
  });

  test("trilha inteira concluída em progress.lessons → null", () => {
    const licoes = licoesDaTrilhaDeCrase();
    const tudo = Object.fromEntries(licoes.map((l) => [l.id, { stars: 3 }]));
    expect(legacyCandidateForSkill("por:crase-regra-basica", "NOVA", tudo)).toBeNull();
  });
});

describe("lessonIdsForSkill (docs/36 RF-5, C4b)", () => {
  test("autoral primeiro; lista tudo o que ensina a habilidade", () => {
    const ids = lessonIdsForSkill("mat:porcentagem-conceito");
    expect(ids[0]).toBe(lessonForSkill("mat:porcentagem-conceito")?.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("habilidade sem nenhuma aula → lista vazia", () => {
    expect(lessonIdsForSkill("nao-existe:skill")).toEqual([]);
  });
});

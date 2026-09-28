import { describe, expect, test } from "bun:test";
import { updateSkill, mastery } from "@/lib/adaptive/model";
import { confidence } from "@/lib/adaptive/confidence";
import { updateSkillEvidence } from "@/lib/learning/review";
import type { SkillEvidenceEntry, SkillModelEntry } from "@/lib/learning/types";

/**
 * Cenários C, D, E, F do docs/30 §26.3, aplicados só ao MODELO (sem motor —
 * isso é Fase 8). Os 4 cenários são definidos de forma determinística no
 * plano ("4 acertos", "2x não sei" etc.) — nenhum sorteio de resultado
 * entra aqui; o simulador de aluno com semente (`helpers/simulated-
 * student.ts`) fica pronto pros cenários probabilísticos da Fase 8/13
 * (nivelamento, motor), que precisam de verdade de um aluno "verdadeiro"
 * sorteado.
 */

const FACIL = { a: 1, b: -1.6, c: 0.2 };
const MEDIO = { a: 1, b: 0, c: 0.2 };

function responder(
  modelo: SkillModelEntry | undefined,
  evidencia: SkillEvidenceEntry | undefined,
  irt: typeof FACIL,
  correct: boolean,
  role: "pratica" | "revisao",
  today: string,
  opts: { response?: "answered" | "dont-know"; difficulty?: 1 | 2 | 3 | 4 | 5 } = {},
): { modelo: SkillModelEntry; evidencia: SkillEvidenceEntry | undefined } {
  const novoModelo = updateSkill(
    modelo,
    "mat:x",
    { role, correct, response: opts.response },
    irt,
    today,
    { now: `${today}T10:00:00.000Z`, difficulty: opts.difficulty ?? 2 },
  );
  const novaEvidencia = updateSkillEvidence(evidencia, "mat:x", {
    exerciseId: `${role}-${today}-${Math.random()}`,
    correct,
    localDate: today,
    role,
    assisted: false,
    isReviewRecovery: false,
  });
  return { modelo: novoModelo, evidencia: novaEvidencia };
}

describe("Aluno C — bom mas poucos dados (docs/30 §26.3)", () => {
  test("4 acertos fáceis num único dia -> Mastery 55-75, Confidence <= 40 (evidência pouca, não convincente)", () => {
    let modelo: SkillModelEntry | undefined;
    let evidencia: SkillEvidenceEntry | undefined;
    for (let i = 0; i < 4; i++) {
      ({ modelo, evidencia } = responder(modelo, evidencia, FACIL, true, "pratica", "2026-09-21", {
        difficulty: 1,
      }));
    }
    const m = mastery(modelo);
    const c = confidence(modelo, evidencia, "2026-09-21").value;
    expect(m).toBeGreaterThanOrEqual(55);
    expect(m).toBeLessThanOrEqual(75);
    expect(c).toBeLessThanOrEqual(40);
  });
});

describe("Aluno D — esquece conteúdo antigo depois de semanas (docs/30 §26.3)", () => {
  test("Confidence cai bastante depois de ~40 dias sem estudar a habilidade; erro em revisão derruba Mastery e reinicia a agenda", () => {
    let modelo: SkillModelEntry | undefined;
    let evidencia: SkillEvidenceEntry | undefined;
    // Constrói Mastery alta com evidência de verdade ao longo de vários dias.
    const dias = ["2026-08-01", "2026-08-03", "2026-08-05", "2026-08-08", "2026-08-10"];
    for (const dia of dias) {
      ({ modelo, evidencia } = responder(modelo, evidencia, MEDIO, true, "pratica", dia, { difficulty: 3 }));
    }
    const confAntes = confidence(modelo, evidencia, "2026-08-10").value;
    expect(mastery(modelo)).toBeGreaterThanOrEqual(60);

    // 40 dias se passam sem NENHUMA evidência nova — Confidence lida NA DATA FUTURA.
    const confDepoisDeSumir = confidence(modelo, evidencia, "2026-09-19").value; // 40 dias depois de 2026-08-10
    expect(confDepoisDeSumir).toBeLessThan(confAntes * 0.7); // caiu bastante (recência, T)

    // Volta e erra uma REVISÃO — Mastery cai e a agenda reinicia (docs/30 §9.4: lapses).
    const masteryAntesDoErro = mastery(modelo);
    const depoisDoErro = updateSkill(
      modelo,
      "mat:x",
      { role: "revisao", correct: false },
      MEDIO,
      "2026-09-19",
      { now: "2026-09-19T10:00:00.000Z", difficulty: 3 },
    );
    expect(mastery(depoisDoErro)).toBeLessThan(masteryAntesDoErro);
    expect(depoisDoErro.lapses).toBe((modelo?.lapses ?? 0) + 1);
  });
});

describe("Aluno E — marca 'não sei' (docs/30 §26.3)", () => {
  test("2x 'não sei' na mesma habilidade sinaliza reforço, e cai menos que 2 erros com chute", () => {
    let comNaoSei: SkillModelEntry | undefined;
    for (let i = 0; i < 2; i++) {
      comNaoSei = updateSkill(
        comNaoSei,
        "mat:x",
        { role: "pratica", correct: false, response: "dont-know" },
        MEDIO,
        "2026-09-21",
        { now: "x" },
      );
    }
    expect(comNaoSei!.dontKnowRecent).toBe(2); // sinal que o motor (Fase 8) usa pra oferecer reforço

    let comErro: SkillModelEntry | undefined;
    for (let i = 0; i < 2; i++) {
      comErro = updateSkill(comErro, "mat:x", { role: "pratica", correct: false }, MEDIO, "2026-09-21", {
        now: "x",
      });
    }
    // "Não sei" 2x cai menos que errar 2x com chute (theta final maior = mais perto do prior).
    expect(comNaoSei!.theta).toBeGreaterThan(comErro!.theta);
  });
});

describe("Aluno F — usa muita ajuda (docs/30 §26.3)", () => {
  test("5 acertos assistidos: Confidence <= 60% da de 5 acertos independentes", () => {
    let independente: SkillModelEntry | undefined;
    let evidenciaIndependente: SkillEvidenceEntry | undefined;
    let assistido: SkillModelEntry | undefined;
    let evidenciaAssistida: SkillEvidenceEntry | undefined;

    const dias = ["2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18", "2026-09-19"];
    for (const dia of dias) {
      independente = updateSkill(independente, "mat:x", { role: "pratica", correct: true }, MEDIO, dia, {
        now: "x",
        difficulty: 2,
      });
      evidenciaIndependente = updateSkillEvidence(evidenciaIndependente, "mat:x", {
        exerciseId: `ind-${dia}`,
        correct: true,
        localDate: dia,
        role: "pratica",
        assisted: false,
        isReviewRecovery: false,
      });

      assistido = updateSkill(
        assistido,
        "mat:x",
        { role: "pratica", correct: true, assisted: true },
        MEDIO,
        dia,
        { now: "x", difficulty: 2 },
      );
      // Tentativa assistida não gera evidência (docs/20 §13, regra existente) — evidência fica vazia.
    }

    const confIndependente = confidence(independente, evidenciaIndependente, "2026-09-19").value;
    const confAssistida = confidence(assistido, evidenciaAssistida, "2026-09-19").value;

    expect(confAssistida).toBeLessThanOrEqual(confIndependente * 0.6);
  });
});

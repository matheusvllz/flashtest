import { describe, expect, test } from "bun:test";
import { applyFrequencyRules, filterEligibleTips, pickTip, selectTip } from "@/lib/learning/tips";
import { EXAM_TIPS } from "@/content/exam-tips";
import type { ExamTip, TipHistoryEntry } from "@/lib/learning/types";

function tip(overrides: Partial<ExamTip>): ExamTip {
  return {
    id: "t1",
    version: 1,
    examProfileId: "enem",
    skillIds: [],
    category: "estrategia",
    text: "x",
    source: "y",
    reviewedAt: "2026-09-21",
    validUntil: null,
    priority: 5,
    ...overrides,
  };
}

describe("filterEligibleTips — regras 4/5/6 (docs/20 §10)", () => {
  test("sem perfil conhecido, nada é elegível", () => {
    const r = filterEligibleTips([tip({})], { examTargets: [], hojeISO: "2026-09-21" });
    expect(r).toEqual([]);
  });

  test("perfil não escolhido pelo aluno não aparece", () => {
    const r = filterEligibleTips([tip({ examProfileId: "pas-unb" })], {
      examTargets: [{ examId: "enem" }],
      hojeISO: "2026-09-21",
    });
    expect(r).toEqual([]);
  });

  test("PAS exige etapa correspondente — não deduz da universidade-alvo", () => {
    const t = tip({ examProfileId: "pas-unb", stage: "2" });
    const semEtapa = filterEligibleTips([t], {
      examTargets: [{ examId: "pas-unb" }], // sem stage definido
      hojeISO: "2026-09-21",
    });
    expect(semEtapa).toEqual([]);

    const etapaErrada = filterEligibleTips([t], {
      examTargets: [{ examId: "pas-unb", stage: "1" }],
      hojeISO: "2026-09-21",
    });
    expect(etapaErrada).toEqual([]);

    const etapaCerta = filterEligibleTips([t], {
      examTargets: [{ examId: "pas-unb", stage: "2" }],
      hojeISO: "2026-09-21",
    });
    expect(etapaCerta).toEqual([t]);
  });

  test("dica vencida (validUntil no passado) não é elegível", () => {
    const t = tip({ validUntil: "2026-01-01" });
    const r = filterEligibleTips([t], { examTargets: [{ examId: "enem" }], hojeISO: "2026-09-21" });
    expect(r).toEqual([]);
  });

  test("validUntil null nunca vence", () => {
    const t = tip({ validUntil: null });
    const r = filterEligibleTips([t], { examTargets: [{ examId: "enem" }], hojeISO: "2099-01-01" });
    expect(r).toEqual([t]);
  });
});

describe("applyFrequencyRules — regras 2/8", () => {
  test("uma dica espontânea já mostrada hoje bloqueia outra espontânea", () => {
    const historico: TipHistoryEntry[] = [
      { tipId: "outra", shownAt: "2026-09-21T10:00:00Z", localDate: "2026-09-21", dismissed: false, requested: false },
    ];
    const r = applyFrequencyRules([tip({ id: "t2" })], {
      tipHistory: historico,
      hojeISO: "2026-09-21",
      requested: false,
    });
    expect(r).toEqual([]);
  });

  test("pedido do usuário ignora o limite diário", () => {
    const historico: TipHistoryEntry[] = [
      { tipId: "outra", shownAt: "2026-09-21T10:00:00Z", localDate: "2026-09-21", dismissed: false, requested: false },
    ];
    const r = applyFrequencyRules([tip({ id: "t2" })], {
      tipHistory: historico,
      hojeISO: "2026-09-21",
      requested: true,
    });
    expect(r).toEqual([tip({ id: "t2" })]);
  });

  test("mesmo ID não repete dentro de 14 dias", () => {
    const historico: TipHistoryEntry[] = [
      { tipId: "t1", shownAt: "2026-09-10T10:00:00Z", localDate: "2026-09-10", dismissed: false, requested: false },
    ];
    const r13dias = applyFrequencyRules([tip({ id: "t1" })], {
      tipHistory: historico,
      hojeISO: "2026-09-23", // 13 dias depois
      requested: true, // ignora limite diário, não o cooldown de 14 dias
    });
    expect(r13dias).toEqual([]);

    const r14dias = applyFrequencyRules([tip({ id: "t1" })], {
      tipHistory: historico,
      hojeISO: "2026-09-24", // exatamente 14 dias depois
      requested: true,
    });
    expect(r14dias).toEqual([tip({ id: "t1" })]);
  });
});

describe("selectTip — ordem determinística (regra 7)", () => {
  test("relevância de habilidade vence prioridade editorial", () => {
    const irrelevanteAltaPrioridade = tip({ id: "a", priority: 1, skillIds: [] });
    const relevanteBaixaPrioridade = tip({ id: "b", priority: 9, skillIds: ["mat:porcentagem"] });
    const escolhida = selectTip([irrelevanteAltaPrioridade, relevanteBaixaPrioridade], {
      skillIds: ["mat:porcentagem"],
    });
    expect(escolhida?.id).toBe("b");
  });

  test("empate de relevância e prioridade desempata por ID", () => {
    const escolhida = selectTip([tip({ id: "z", priority: 1 }), tip({ id: "a", priority: 1 })], {
      skillIds: [],
    });
    expect(escolhida?.id).toBe("a");
  });

  test("lista vazia não escolhe nada", () => {
    expect(selectTip([], { skillIds: [] })).toBeNull();
  });

  test("mesmo estado/entrada produz sempre o mesmo resultado (determinismo)", () => {
    const tips = [tip({ id: "c", priority: 3 }), tip({ id: "a", priority: 1 }), tip({ id: "b", priority: 2 })];
    const r1 = selectTip(tips, { skillIds: [] });
    const r2 = selectTip(tips, { skillIds: [] });
    expect(r1?.id).toBe(r2?.id);
    expect(r1?.id).toBe("a");
  });
});

describe("pickTip — composição completa, sobre o lote real de dicas", () => {
  test("aluno ENEM sem histórico recebe uma dica válida", () => {
    const escolhida = pickTip({
      tips: EXAM_TIPS,
      examTargets: [{ examId: "enem" }],
      tipHistory: [],
      skillIds: [],
      hojeISO: "2026-09-21",
      requested: false,
    });
    expect(escolhida).not.toBeNull();
    expect(escolhida?.examProfileId).toBe("enem");
  });

  test("sem perfil nenhum escolhido, nunca preenche com dica genérica", () => {
    const escolhida = pickTip({
      tips: EXAM_TIPS,
      examTargets: [],
      tipHistory: [],
      skillIds: [],
      hojeISO: "2026-09-21",
      requested: false,
    });
    expect(escolhida).toBeNull();
  });

  test("cinco lições concluídas no mesmo dia geram no máximo uma dica espontânea (critério A11)", () => {
    let historico: TipHistoryEntry[] = [];
    const resultados: (ExamTip | null)[] = [];
    for (let i = 0; i < 5; i++) {
      const escolhida = pickTip({
        tips: EXAM_TIPS,
        examTargets: [{ examId: "enem" }],
        tipHistory: historico,
        skillIds: [],
        hojeISO: "2026-09-21",
        requested: false,
      });
      resultados.push(escolhida);
      if (escolhida) {
        historico = [
          ...historico,
          {
            tipId: escolhida.id,
            shownAt: "2026-09-21T10:00:00Z",
            localDate: "2026-09-21",
            dismissed: false,
            requested: false,
          },
        ];
      }
    }
    const mostradas = resultados.filter((r) => r !== null);
    expect(mostradas.length).toBe(1);
  });

  test("PAS sem etapa escolhida não mostra dica alguma (não estereotipa a prova)", () => {
    const escolhida = pickTip({
      tips: EXAM_TIPS,
      examTargets: [{ examId: "pas-unb" }], // sem stage
      tipHistory: [],
      skillIds: [],
      hojeISO: "2026-09-21",
      requested: false,
    });
    expect(escolhida).toBeNull();
  });
});

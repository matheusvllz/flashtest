import { describe, expect, test } from "bun:test";
import { marcarPacote, reviewKindDe, serializar } from "../../scripts/content/marcar-proveniencia";
import { buildPublishPlan } from "../../scripts/content/publish";
import type { Candidate } from "../../scripts/content/pipeline-types";

/**
 * Proveniência da revisão (docs/36 T-07.5, §G.5, RP-9): `reviewKind` diz COMO o item foi revisado
 * sem tocar `status`, enunciado, alternativas, ordem, gabarito nem `version`.
 */

function item(id: string, validation: Record<string, unknown>) {
  return {
    id,
    meta: {
      id,
      version: 3,
      validation,
    },
  } as never;
}

describe("reviewKindDe (regra de §G.5)", () => {
  test("oficial-conferida → gabarito-oficial, qualquer que seja o reviewer", () => {
    expect(reviewKindDe("oficial-conferida", "solucionador-independente")).toBe("gabarito-oficial");
    expect(reviewKindDe("oficial-conferida", undefined)).toBe("gabarito-oficial");
  });

  test("reviewer com 'delegada' ou 'amostra' → ia-delegada (os dois textos reais do acervo)", () => {
    expect(reviewKindDe("revisada-humano", "revisao-completa-7b (Sonnet, delegada pelo usuário) + amostra lida pelo orquestrador")).toBe("ia-delegada");
    expect(reviewKindDe("revisada-humano", "amostra")).toBe("ia-delegada");
  });

  test("sem regra aplicável não inventa: undefined", () => {
    expect(reviewKindDe("revisada-humano", "ana")).toBeUndefined();
    expect(reviewKindDe("revisada-humano", undefined)).toBeUndefined();
  });
});

describe("marcarPacote", () => {
  test("marca só o que tem regra, insere reviewKind depois de reviewer e não toca no resto", () => {
    const a = item("a", { status: "revisada-humano", reviewedAt: "2026-09-20", reviewer: "amostra" });
    const b = item("b", { status: "oficial-conferida", reviewer: "solucionador-independente" });
    const c = item("c", { status: "revisada-humano", reviewer: "ana" });
    const json = { subjectId: "mat", items: [a, b, c] } as never;
    const rel = marcarPacote(json);
    expect(rel.marcados).toBe(2);
    expect(rel.semRegra).toEqual(["c"]);
    expect(rel.porKind).toEqual({ "ia-delegada": 1, "gabarito-oficial": 1 });
    expect(Object.keys((a as { meta: { validation: object } }).meta.validation)).toEqual(["status", "reviewedAt", "reviewer", "reviewKind"]);
    expect((a as { meta: { version: number } }).meta.version).toBe(3);
    expect((c as { meta: { validation: Record<string, unknown> } }).meta.validation.reviewKind).toBeUndefined();
  });

  test("idempotente: a 2ª passada não marca nada, e o JSON serializado fica idêntico", () => {
    const json = { subjectId: "mat", items: [item("a", { status: "revisada-humano", reviewer: "amostra" })] } as never;
    marcarPacote(json);
    const depoisDa1 = serializar(json);
    const rel2 = marcarPacote(json);
    expect(rel2.marcados).toBe(0);
    expect(rel2.jaMarcados).toBe(1);
    expect(serializar(json)).toBe(depoisDa1);
  });

  test("valor já presente e diferente do calculado vira conflito e NUNCA é sobrescrito (pode ser decisão humana)", () => {
    const a = item("a", { status: "revisada-humano", reviewer: "amostra", reviewKind: "humano" });
    const rel = marcarPacote({ subjectId: "mat", items: [a] } as never);
    expect(rel.conflitos).toEqual([{ id: "a", atual: "humano", calculado: "ia-delegada" }]);
    expect((a as { meta: { validation: { reviewKind: string } } }).meta.validation.reviewKind).toBe("humano");
  });

  test("pacote sem items não quebra", () => {
    expect(marcarPacote({} as never).total).toBe(0);
  });
});

describe("publish.ts grava reviewKind em item novo (sem mudar status)", () => {
  function candidato(humanReview?: Candidate["stages"]["humanReview"]): Candidate {
    return {
      candidateId: "l-1",
      skillId: "mat:porcentagem-conceito",
      difficulty: 2,
      role: "pratica",
      kind: "item",
      exercise: {
        type: "multipla-escolha",
        pergunta: "Quanto é vinte por cento de trezentos reais no total do investimento?",
        opcoes: ["Sessenta", "Setenta", "Oitenta", "Noventa"],
        correta: 0,
        explicacao: "x",
      },
      meta: {},
      stages: { validation: { ok: true, issues: [] }, humanReview },
    };
  }

  test("aprovação por amostra → status revisada-humano + reviewKind ia-delegada", () => {
    const [arq] = buildPublishPlan([candidato({ reviewer: "amostra", verdict: "aprova" })], false, () => []);
    const meta = arq.items[0].meta;
    expect(meta.validation.status).toBe("revisada-humano");
    expect(meta.validation.reviewKind).toBe("ia-delegada");
  });

  test("lote aprovado por amostra sem revisão individual → verificada-ia e sem reviewKind (nada a afirmar)", () => {
    const [arq] = buildPublishPlan([candidato(undefined)], true, () => []);
    expect(arq.items[0].meta.validation.status).toBe("verificada-ia");
    expect(arq.items[0].meta.validation.reviewKind).toBeUndefined();
  });
});

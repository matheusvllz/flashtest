import { describe, expect, test } from "bun:test";
import {
  amostrarParaRevisao,
  buildPublishPlan,
  formatarAmostraMarkdown,
  formatarRelatorio,
  generatedItemId,
  isPublishable,
  type PublishedItem,
} from "../../scripts/content/publish";
import type { Candidate } from "../../scripts/content/pipeline-types";
import type { MultipleChoiceExercise } from "@/lib/lessons/types";

/**
 * Publicação (docs/30 §19.2 estágio 8, Fase 9 F9.9).
 */

function exercicio(
  pergunta = "Quanto é vinte por cento de trezentos reais no total do investimento?",
): MultipleChoiceExercise {
  return {
    type: "multipla-escolha",
    pergunta,
    opcoes: ["Sessenta", "Setenta", "Oitenta", "Noventa"],
    correta: 0,
    explicacao:
      "Explicação longa o bastante pra passar na validação de tamanho mínimo de vinte e cinco palavras, cobrindo o raciocínio completo da questão apresentada.",
  };
}

function candidato(overrides: Partial<Candidate> = {}): Candidate {
  return {
    candidateId: "lote-1-1",
    skillId: "mat:porcentagem-conceito",
    difficulty: 2,
    role: "pratica",
    kind: "item",
    exercise: exercicio(),
    meta: {},
    stages: { validation: { ok: true, issues: [] } },
    ...overrides,
  };
}

describe("isPublishable", () => {
  test("validation.ok false nunca publica", () => {
    const c = candidato({
      stages: { validation: { ok: false, issues: [{ rule: "x", message: "x" }] } },
    });
    expect(isPublishable(c, true)).toBe(false);
  });

  test("humanReview aprovada publica mesmo sem amostra do lote aprovada", () => {
    const c = candidato({
      stages: {
        validation: { ok: true, issues: [] },
        humanReview: { reviewer: "ana", verdict: "aprova" },
      },
    });
    expect(isPublishable(c, false)).toBe(true);
  });

  test("humanReview reprovada NUNCA publica, mesmo com lote aprovado", () => {
    const c = candidato({
      stages: {
        validation: { ok: true, issues: [] },
        humanReview: { reviewer: "ana", verdict: "reprova" },
      },
    });
    expect(isPublishable(c, true)).toBe(false);
  });

  test("sem humanReview: publica só se lote aprovado por amostra E item não escalado", () => {
    const semEscalada = candidato({
      stages: {
        validation: { ok: true, issues: [] },
        verification: { agree: true, escalated: false, finalAnswer: 0 },
      },
    });
    expect(isPublishable(semEscalada, true)).toBe(true);
    expect(isPublishable(semEscalada, false)).toBe(false);

    const escalada = candidato({
      stages: {
        validation: { ok: true, issues: [] },
        verification: { agree: false, escalated: true },
      },
    });
    expect(isPublishable(escalada, true)).toBe(false);
  });
});

describe("generatedItemId", () => {
  test("mesmo enunciado sempre gera o mesmo id (determinístico)", () => {
    const a = generatedItemId("mat:x", exercicio());
    const b = generatedItemId("mat:x", exercicio());
    expect(a).toBe(b);
  });

  test("enunciados diferentes geram ids diferentes", () => {
    const a = generatedItemId(
      "mat:x",
      exercicio("Primeira pergunta bem diferente da segunda sobre outro assunto qualquer."),
    );
    const b = generatedItemId(
      "mat:x",
      exercicio("Segunda pergunta completamente distinta sobre um tema totalmente diferente."),
    );
    expect(a).not.toBe(b);
  });

  test("formato gen:<skillId>:<hash8>", () => {
    const id = generatedItemId("mat:porcentagem-conceito", exercicio());
    expect(id).toMatch(/^gen:mat:porcentagem-conceito:[0-9a-f]{8}$/);
  });
});

describe("buildPublishPlan", () => {
  test("candidato aprovado gera uma entrada de arquivo com o item", () => {
    const plano = buildPublishPlan([candidato()], true, () => []);
    expect(plano).toHaveLength(1);
    expect(plano[0].path).toBe("mat/mat-porcentagem-conceito.json");
    expect(plano[0].items).toHaveLength(1);
  });

  test("candidato não publicável (validation.ok false) não entra em nenhum arquivo", () => {
    const c = candidato({
      stages: { validation: { ok: false, issues: [{ rule: "x", message: "x" }] } },
    });
    const plano = buildPublishPlan([c], true, () => []);
    expect(plano).toHaveLength(0);
  });

  test("publicar o MESMO candidato 2x não duplica — merge por id, mesma entrada final", () => {
    const c = candidato();
    const primeiraPassada = buildPublishPlan([c], true, () => []);
    const idJaPublicado = primeiraPassada[0].items[0].id;
    // segunda publicação: já existe 1 item com esse id no arquivo.
    const existentes: PublishedItem[] = primeiraPassada[0].items;
    const segundaPassada = buildPublishPlan([c], true, (path) =>
      path === "mat/mat-porcentagem-conceito.json" ? existentes : [],
    );
    expect(segundaPassada[0].items).toHaveLength(1);
    expect(segundaPassada[0].items[0].id).toBe(idJaPublicado);
  });

  test("itens JÁ existentes no arquivo (de outros candidatos) são preservados", () => {
    const existente: PublishedItem = {
      id: "gen:mat:porcentagem-conceito:aaaaaaaa",
      exercise: exercicio(
        "Um item já publicado antes, de outro lote, que deve continuar existindo no arquivo final.",
      ),
      meta: {
        id: "gen:mat:porcentagem-conceito:aaaaaaaa",
        version: 1,
        skillIds: ["mat:porcentagem-conceito"],
        difficulty: 2,
        irt: { a: 1, b: 0, c: 0.2, source: "estimado" },
        roles: ["pratica"],
        estimatedSeconds: 60,
        dontKnowAllowed: true,
        source: { kind: "ia-validada" },
        validation: { status: "verificada-ia" },
        examProfiles: ["enem"],
      },
    };
    const plano = buildPublishPlan([candidato()], true, () => [existente]);
    expect(plano[0].items).toHaveLength(2);
  });

  test("humanReview aprovada grava validation.status 'revisada-humano'; sem revisão humana grava 'verificada-ia'", () => {
    const comHumano = candidato({
      stages: {
        validation: { ok: true, issues: [] },
        humanReview: { reviewer: "ana", verdict: "aprova" },
      },
    });
    const planoHumano = buildPublishPlan([comHumano], true, () => []);
    expect(planoHumano[0].items[0].meta.validation.status).toBe("revisada-humano");

    const semHumano = candidato({
      stages: {
        validation: { ok: true, issues: [] },
        verification: { agree: true, escalated: false, finalAnswer: 0 },
      },
    });
    const planoSemHumano = buildPublishPlan([semHumano], true, () => []);
    expect(planoSemHumano[0].items[0].meta.validation.status).toBe("verificada-ia");
  });

  test("candidatos de matérias diferentes vão para arquivos diferentes", () => {
    const c1 = candidato({ skillId: "mat:porcentagem-conceito" });
    const c2 = candidato({
      candidateId: "lote-1-2",
      skillId: "por:crase-regra-basica",
      exercise: exercicio(
        "Uma questão bem diferente sobre crase, completamente distinta da de matemática.",
      ),
    });
    const plano = buildPublishPlan([c1, c2], true, () => []);
    expect(plano.map((p) => p.subjectId).sort()).toEqual(["mat", "por"]);
  });

  test("candidatos 'kind: aula' são ignorados por buildPublishPlan (aulas não vão pra este formato de item)", () => {
    const c = candidato({ kind: "aula", exercise: undefined });
    const plano = buildPublishPlan([c], true, () => []);
    expect(plano).toHaveLength(0);
  });
});

describe("amostrarParaRevisao — 10% (mín. 10) + 100% dos escalados (docs/30 §19.2 estágio 7)", () => {
  function loteDeCandidatos(n: number, escaladosIds: number[] = []): Candidate[] {
    return Array.from({ length: n }, (_, i) =>
      candidato({
        candidateId: `lote-1-${i}`,
        stages: escaladosIds.includes(i) ? { verification: { escalated: true } } : {},
      }),
    );
  }

  test("lote pequeno (20): amostra mínima de 10", () => {
    const amostra = amostrarParaRevisao(loteDeCandidatos(20));
    expect(amostra).toHaveLength(10);
  });

  test("lote grande (200): amostra de 10% (20)", () => {
    const amostra = amostrarParaRevisao(loteDeCandidatos(200));
    expect(amostra).toHaveLength(20);
  });

  test("todo escalado entra, mesmo além dos 10%/mínimo", () => {
    const amostra = amostrarParaRevisao(
      loteDeCandidatos(20, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    );
    const idsEscalados = amostra
      .filter((c) => c.stages.verification?.escalated)
      .map((c) => c.candidateId);
    expect(idsEscalados).toHaveLength(12);
    expect(amostra.length).toBeGreaterThanOrEqual(12);
  });
});

describe("formatarAmostraMarkdown / formatarRelatorio", () => {
  test("marca o gabarito com ✅ e sinaliza candidato escalado", () => {
    const md = formatarAmostraMarkdown("lote-1", [
      candidato({ stages: { verification: { escalated: true } } }),
    ]);
    expect(md).toContain("ESCALADO");
    expect(md).toContain("✅");
  });

  test("formatarRelatorio sinaliza conflito acima de 15%", () => {
    const relatorio = formatarRelatorio({
      loteId: "lote-1",
      totalCandidatos: 10,
      rejeitadosNaCritica: 1,
      taxaConflito: 0.2,
      humanizacoesAceitas: 5,
      humanizacoesRejeitadas: 1,
      validos: 8,
      invalidos: 2,
      publicados: 0,
    });
    expect(relatorio).toContain("20.0%");
    expect(relatorio).toContain("acima de 15%");
  });
});

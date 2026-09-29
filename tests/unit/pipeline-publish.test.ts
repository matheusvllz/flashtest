import { describe, expect, test } from "bun:test";
import {
  amostrarParaRevisao,
  buildPublishPlan,
  conteudoDoArquivoDeBanco,
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

  test("sem meta.irt, o default segue a dificuldade editorial (RP-2, T-04.2) — não é mais b = 0 para todos", () => {
    const bs = ([1, 2, 3, 4, 5] as const).map(
      (d) => buildPublishPlan([candidato({ difficulty: d })], true, () => [])[0].items[0].meta.irt,
    );
    expect(bs.map((i) => i.b)).toEqual([-1.6, -0.8, 0, 0.8, 1.6]);
    for (const irt of bs) {
      expect(irt.a).toBe(1);
      expect(irt.c).toBeCloseTo(0.25, 10); // 4 alternativas
      expect(irt.source).toBe("estimado");
    }
  });

  test("meta.irt explícito do candidato continua valendo (só o default mudou)", () => {
    const irt = { a: 1.3, b: 0.4, c: 0.2, source: "estimado" as const };
    const plano = buildPublishPlan([candidato({ meta: { irt } })], true, () => []);
    expect(plano[0].items[0].meta.irt).toEqual(irt);
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

describe("formatarRelatorio: avisos de forma (docs/36 T-07.2)", () => {
  test("mostra contagens por severidade, exceções, retidos por aviso alto e a posição do gabarito", () => {
    const relatorio = formatarRelatorio({
      loteId: "lote-1",
      totalCandidatos: 10,
      rejeitadosNaCritica: 0,
      taxaConflito: 0,
      humanizacoesAceitas: 0,
      humanizacoesRejeitadas: 0,
      validos: 10,
      invalidos: 0,
      publicados: 7,
      avisos: { alta: 3, media: 4, info: 5, excecoes: 1, retidosPorAvisoAlto: 3, posicaoLote: "45% dos 20 itens têm o gabarito na posição A" },
    });
    expect(relatorio).toContain("3 alta · 4 média · 5 info; exceções registradas: 1");
    expect(relatorio).toContain("3 candidato(s) com aviso ALTO");
    expect(relatorio).toContain("posição A");
  });

  test("sem o campo `avisos` o relatório antigo não muda", () => {
    const relatorio = formatarRelatorio({
      loteId: "lote-1",
      totalCandidatos: 1,
      rejeitadosNaCritica: 0,
      taxaConflito: 0,
      humanizacoesAceitas: 0,
      humanizacoesRejeitadas: 0,
      validos: 1,
      invalidos: 0,
      publicados: 1,
    });
    expect(relatorio).not.toContain("Avisos de forma");
  });
});

/**
 * Republicar itens NÃO pode apagar as `lessons` do arquivo de banco (docs/36 T-07.6, achado C7):
 * `publish.ts` gravava só `{ subjectId, items }`.
 */
describe("conteudoDoArquivoDeBanco: preserva o que já existe fora de `items`", () => {
  const aula = { id: "aula-mat-porcentagem-conceito", skillIds: ["mat:porcentagem-conceito"], steps: [] };
  const itemAntigo: PublishedItem = {
    id: "gen:mat:porcentagem-conceito:aaaaaaaa",
    exercise: exercicio("Enunciado antigo do item retirado, longo o bastante pra ser realista no teste."),
    meta: { id: "gen:mat:porcentagem-conceito:aaaaaaaa" } as never,
    retired: true,
  };

  test("republicar num arquivo com aulas mantém `lessons` (e outras chaves) e troca só subjectId/items", () => {
    const existente = { subjectId: "mat", items: [itemAntigo], lessons: [aula], extra: { nota: "mantida" } };
    const plano = buildPublishPlan([candidato()], true, () => existente.items);
    const conteudo = conteudoDoArquivoDeBanco(existente, plano[0]);
    expect(conteudo.lessons).toEqual([aula]);
    expect(conteudo.extra).toEqual({ nota: "mantida" });
    expect(Object.keys(conteudo)).toEqual(["subjectId", "items", "lessons", "extra"]); // ordem existente preservada
    const itens = conteudo.items as PublishedItem[];
    expect(itens).toHaveLength(2);
    // O item retirado que já estava no arquivo continua retirado (o merge por id não o reescreve).
    expect(itens.find((i) => i.id === itemAntigo.id)?.retired).toBe(true);
  });

  test("arquivo novo (sem existente) grava só subjectId e items, como antes", () => {
    const plano = buildPublishPlan([candidato()], true, () => []);
    const conteudo = conteudoDoArquivoDeBanco(null, plano[0]);
    expect(Object.keys(conteudo)).toEqual(["subjectId", "items"]);
    expect(conteudo).not.toHaveProperty("lessons");
  });

  test("republicar o MESMO candidato 2× não duplica item nem mexe nas aulas (idempotente)", () => {
    const existente = { subjectId: "mat", items: [] as PublishedItem[], lessons: [aula] };
    const p1 = buildPublishPlan([candidato()], true, () => existente.items);
    const c1 = conteudoDoArquivoDeBanco(existente, p1[0]);
    const p2 = buildPublishPlan([candidato()], true, () => c1.items as PublishedItem[]);
    const c2 = conteudoDoArquivoDeBanco(c1, p2[0]);
    expect((c2.items as PublishedItem[]).length).toBe(1);
    expect(c2.lessons).toEqual([aula]);
  });
});

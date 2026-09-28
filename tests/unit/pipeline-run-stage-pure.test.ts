import { describe, expect, test } from "bun:test";
import {
  aplicarHumanizacao,
  buildCriticarUserContent,
  buildEscalarUserContent,
  buildGerarUserContent,
  buildHumanizarUserContent,
  buildResolverUserContent,
  exerciseAposCritica,
  expandPlanToCandidates,
  parseCriticarResponse,
  parseEscalarResponse,
  parseGerarResponse,
  parseResolverResponse,
} from "../../scripts/content/run-stage";
import type { BatchPlan } from "../../scripts/content/pipeline-types";
import type { Exercise } from "@/lib/lessons/types";

/**
 * Funções puras da orquestração Modo B (docs/30 §19.2/§19.3, Fase 9/11 do
 * docs/31) — montagem de payload por estágio e parse da resposta, extraídas
 * pra serem testáveis sem HTTP (a integração de rede fica em
 * `pipeline-run-stage.test.ts`/`pipeline-e2e.test.ts`).
 */

const ITEM: Exercise = {
  type: "multipla-escolha",
  pergunta: "Quanto é 10% de 200?",
  opcoes: ["10", "20", "30", "40"],
  correta: 1,
  explicacao: "10% de 200 é 200 vezes 0,10, que dá 20.",
};

describe("expandPlanToCandidates", () => {
  test("gera 1 candidato por unidade de quantity, id estável '<loteId>-<n>'", () => {
    const plano: BatchPlan = {
      loteId: "onda0",
      createdAt: "2026-09-24T00:00:00.000Z",
      entries: [
        {
          skillId: "mat:porcentagem-valor",
          difficulty: 1,
          role: "pratica",
          kind: "item",
          quantity: 2,
        },
        {
          skillId: "mat:porcentagem-valor",
          difficulty: 3,
          role: "pratica",
          kind: "item",
          quantity: 1,
        },
      ],
      totalCandidates: 3,
    };
    const candidatos = expandPlanToCandidates(plano);
    expect(candidatos).toHaveLength(3);
    expect(candidatos.map((c) => c.candidateId)).toEqual(["onda0-1", "onda0-2", "onda0-3"]);
    expect(candidatos[2].difficulty).toBe(3);
    expect(candidatos.every((c) => c.stages)).toBeTruthy();
  });
});

describe("gerar — payload e parse", () => {
  test("buildGerarUserContent monta o JSON de entrada exigido pelo prompt", () => {
    const json = JSON.parse(
      buildGerarUserContent(
        { skillId: "mat:porcentagem-valor", difficulty: 2, role: "pratica" },
        "Calcular %",
        "Matemática",
      ),
    );
    expect(json).toEqual({
      skillId: "mat:porcentagem-valor",
      skillName: "Calcular %",
      subjectName: "Matemática",
      difficulty: 2,
      role: "pratica",
    });
  });

  test("parseGerarResponse aceita um item válido", () => {
    const ex = parseGerarResponse(JSON.stringify(ITEM));
    expect(ex).toEqual(ITEM);
  });

  test("parseGerarResponse rejeita tipo diferente de multipla-escolha", () => {
    expect(() => parseGerarResponse(JSON.stringify({ type: "outro" }))).toThrow();
  });

  test("parseGerarResponse rejeita campo obrigatório ausente", () => {
    expect(() =>
      parseGerarResponse(JSON.stringify({ type: "multipla-escolha", pergunta: "x" })),
    ).toThrow();
  });
});

describe("criticar — payload, parse, exerciseAposCritica", () => {
  test("buildCriticarUserContent inclui skillId + exercise", () => {
    const json = JSON.parse(buildCriticarUserContent("mat:x", ITEM));
    expect(json.skillId).toBe("mat:x");
    expect(json.exercise).toEqual(ITEM);
  });

  test("parseCriticarResponse: aprova sem fixed", () => {
    const r = parseCriticarResponse(JSON.stringify({ verdict: "aprova", issues: [] }));
    expect(r.verdict).toBe("aprova");
    expect(r.fixed).toBeUndefined();
  });

  test("parseCriticarResponse: rejeita verdict inválido", () => {
    expect(() => parseCriticarResponse(JSON.stringify({ verdict: "talvez" }))).toThrow();
  });

  test("exerciseAposCritica: 'corrige' com fixed troca o exercício; 'aprova' mantém o original", () => {
    const corrigido: Exercise = { ...ITEM, pergunta: "Versão corrigida" };
    expect(exerciseAposCritica(ITEM, { verdict: "corrige", issues: [], fixed: corrigido })).toBe(
      corrigido,
    );
    expect(exerciseAposCritica(ITEM, { verdict: "aprova", issues: [] })).toBe(ITEM);
    // "corrige" sem `fixed` de verdade (resposta mal formada) -> fica com o original, nunca quebra.
    expect(exerciseAposCritica(ITEM, { verdict: "corrige", issues: [] })).toBe(ITEM);
  });
});

describe("resolver/escalar — payload e parse", () => {
  test("buildResolverUserContent NUNCA inclui 'correta' (o gabarito)", () => {
    const json = buildResolverUserContent(ITEM);
    expect(json).not.toContain("correta");
    expect(JSON.parse(json)).toEqual({ pergunta: ITEM.pergunta, opcoes: ITEM.opcoes });
  });

  test("buildResolverUserContent lança pra tipo de exercício ainda não suportado", () => {
    const outro = {
      type: "verdadeiro-falso",
      afirmacao: "x",
      verdadeiro: true,
      explicacao: "y",
    } as Exercise;
    expect(() => buildResolverUserContent(outro)).toThrow();
  });

  test("parseResolverResponse aceita answerIndex numérico ou array", () => {
    expect(
      parseResolverResponse(JSON.stringify({ answerIndex: 1, confidence: 0.9, reasoning: "x" }))
        .answerIndex,
    ).toBe(1);
    expect(
      parseResolverResponse(JSON.stringify({ answerIndex: [0, 1], confidence: 0.5, reasoning: "" }))
        .answerIndex,
    ).toEqual([0, 1]);
  });

  test("parseResolverResponse lança sem confidence", () => {
    expect(() => parseResolverResponse(JSON.stringify({ answerIndex: 1 }))).toThrow();
  });

  test("buildEscalarUserContent monta os dois raciocínios + o gabarito do gerador", () => {
    const json = JSON.parse(
      buildEscalarUserContent(
        ITEM as Exercise & { type: "multipla-escolha" },
        1,
        2,
        "raciocínio do solucionador",
        0.6,
      ),
    );
    expect(json).toMatchObject({
      gabaritoGerador: 1,
      respostaSolucionador: 2,
      raciocinioSolucionador: "raciocínio do solucionador",
      confiancaSolucionador: 0.6,
    });
  });

  test("parseEscalarResponse aceita os 3 veredictos válidos, rejeita outro", () => {
    expect(parseEscalarResponse(JSON.stringify({ veredito: "gerador" })).veredito).toBe("gerador");
    expect(parseEscalarResponse(JSON.stringify({ veredito: "ambiguo", note: "dúbio" })).note).toBe(
      "dúbio",
    );
    expect(() => parseEscalarResponse(JSON.stringify({ veredito: "talvez" }))).toThrow();
  });
});

describe("humanizar — payload texto puro + guarda", () => {
  test("buildHumanizarUserContent devolve o texto tal qual (sem envelope JSON)", () => {
    expect(buildHumanizarUserContent("10% de 200 é 20.")).toBe("10% de 200 é 20.");
  });

  test("aplicarHumanizacao aceita reescrita que preserva os invariantes", () => {
    const r = aplicarHumanizacao(
      "10% de 200 é 20.",
      "Pra achar 10% de 200 é só fazer a conta — dá 20.",
    );
    expect(r.accepted).toBe(true);
    expect(r.explicacaoFinal).toContain("20");
  });

  test("aplicarHumanizacao rejeita reescrita que muda um número — mantém o original", () => {
    const original = "10% de 200 é 20.";
    const r = aplicarHumanizacao(original, "10% de 200 é 25.");
    expect(r.accepted).toBe(false);
    expect(r.explicacaoFinal).toBe(original);
    expect(r.rejectedBecause).toContain("números");
  });
});

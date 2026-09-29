import { afterEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { atribuicaoOficial, itemMetaOf } from "@/content/items";
import {
  buildItemMetaOficial,
  conferirGabaritoOficial,
  exercicioComAtribuicao,
  officialItemId,
  validarFormaOficial,
  type ItemOficialEntrada,
} from "../../scripts/content/import-official-items";
import type { MultipleChoiceExercise } from "@/lib/lessons/types";

/**
 * Importador de questões oficiais (docs/30 §12.4/§18.4, Fase 10 do docs/31
 * F10.5) — este arquivo NÃO contém nenhuma questão real do ENEM, só dado de
 * teste sintético (o script em si não extrai PDF, recebe transcrição já
 * pronta — ver o comentário no topo de `import-official-items.ts`).
 */

function exercicioSintetico(correta = 0): MultipleChoiceExercise {
  return {
    type: "multipla-escolha",
    pergunta:
      "Questão sintética de teste, sem relação com nenhuma prova real, só pra exercitar o importador.",
    opcoes: ["Uma", "Duas", "Três", "Quatro", "Cinco"],
    correta,
    explicacao:
      "Explicação sintética de teste, longa o bastante pra passar em qualquer validação de tamanho mínimo de texto.",
  };
}

function entrada(overrides: Partial<ItemOficialEntrada> = {}): ItemOficialEntrada {
  return {
    ano: 2019,
    ref: "caderno de teste · questão 1",
    area: "MT",
    skillId: "mat:porcentagem-valor",
    difficulty: 3,
    exercise: exercicioSintetico(),
    ...overrides,
  };
}

describe("validarFormaOficial", () => {
  test("item com imagem é sempre rejeitado — regra dura, sem exceção", () => {
    const comImagem = entrada({
      exercise: { ...exercicioSintetico(), imagem: { url: "/x.png", alt: "gráfico" } },
    });
    const problemas = validarFormaOficial(comImagem);
    expect(problemas.some((p) => p.includes("imagem"))).toBe(true);
  });

  test("item sem `ref` é rejeitado (atribuição obrigatória)", () => {
    expect(validarFormaOficial(entrada({ ref: "" })).length).toBeGreaterThan(0);
  });

  test("item válido (texto puro, com ref) não tem problema nenhum", () => {
    expect(validarFormaOficial(entrada())).toEqual([]);
  });

  test("área fora de LC/MT/CN/CH é rejeitada", () => {
    const problemas = validarFormaOficial(entrada({ area: "XX" as ItemOficialEntrada["area"] }));
    expect(problemas.some((p) => p.includes("área"))).toBe(true);
  });
});

describe("officialItemId", () => {
  test("estável — mesma entrada gera sempre o mesmo id, prefixo 'oficial:<ano>:'", () => {
    const id1 = officialItemId(entrada());
    const id2 = officialItemId(entrada());
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^oficial:2019:[0-9a-f]{8}$/);
  });

  test("nunca colide com o esquema 'gen:' do gerador por IA", () => {
    expect(officialItemId(entrada())).not.toMatch(/^gen:/);
  });
});

describe("exercicioComAtribuicao — atribuição visível não-negociável (docs/34)", () => {
  test("grava 'ENEM <ano>' em `fonte`, mesmo se a transcrição não trouxe nada", () => {
    const ex = exercicioComAtribuicao(exercicioSintetico(), 2019);
    expect(ex.fonte).toBe("ENEM 2019");
  });

  test("sobrescreve qualquer `fonte` que a transcrição já tivesse — nunca fica a critério de quem transcreveu", () => {
    const comFonteErrada = { ...exercicioSintetico(), fonte: "outra coisa" };
    expect(exercicioComAtribuicao(comFonteErrada, 2021).fonte).toBe("ENEM 2021");
  });
});

describe("buildItemMetaOficial", () => {
  test("source.kind 'oficial', status 'oficial-conferida', papel inclui diagnostico", () => {
    const meta = buildItemMetaOficial(entrada());
    expect(meta.source).toEqual({
      kind: "oficial",
      exam: "ENEM",
      year: 2019,
      ref: "caderno de teste · questão 1",
    });
    expect(meta.validation.status).toBe("oficial-conferida");
    expect(meta.roles).toContain("diagnostico");
  });
});

describe("buildItemMetaOficial: proveniência (docs/36 T-07.5, RP-9)", () => {
  test("item novo já sai com reviewKind 'gabarito-oficial' (status continua 'oficial-conferida')", () => {
    const meta = buildItemMetaOficial(entrada());
    expect(meta.validation.reviewKind).toBe("gabarito-oficial");
    expect(meta.validation.status).toBe("oficial-conferida");
  });
});

describe("itens oficiais publicados (docs/36 T-07.5, RP-9/RP-10)", () => {
  // Lê só metadados dos JSON de `banco/oficial` — nenhum texto de questão é reproduzido aqui.
  const DIR = "src/content/banco/oficial";
  const itens = readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => (JSON.parse(readFileSync(`${DIR}/${f}`, "utf-8")) as { items: Array<{ id: string; exercise: { fonte?: string }; meta: { source: { kind: string; exam?: string; year?: number }; validation: { status: string; reviewKind?: string } } }> }).items);

  test("os 18 têm reviewKind 'gabarito-oficial', status 'oficial-conferida' e origem 'oficial'", () => {
    expect(itens).toHaveLength(18);
    for (const it of itens) {
      expect(it.meta.validation.reviewKind, it.id).toBe("gabarito-oficial");
      expect(it.meta.validation.status, it.id).toBe("oficial-conferida");
      expect(it.meta.source.kind, it.id).toBe("oficial");
    }
  });

  test("a meta RESOLVIDA (mesmo sem o pacote carregado) mantém source.kind 'oficial' — não vira 'ia-validada' pelo índice leve", () => {
    for (const it of itens) {
      const meta = itemMetaOf(it.id);
      expect(meta.source.kind, it.id).toBe("oficial");
      expect(meta.source.exam, it.id).toBe("ENEM");
      expect(meta.source.year, it.id).toBe(2023);
    }
  });

  test("atribuição (ano + prova) da meta resolvida é a mesma gravada no exercício", () => {
    for (const it of itens) {
      expect(atribuicaoOficial(itemMetaOf(it.id).source), it.id).toBe("ENEM 2023");
      expect(it.exercise.fonte, it.id).toBe("ENEM 2023");
    }
  });
});

describe("atribuicaoOficial", () => {
  test("oficial com prova e ano → 'ENEM 2023'; sem ano → só a prova; não oficial ou sem prova → undefined", () => {
    expect(atribuicaoOficial({ kind: "oficial", exam: "ENEM", year: 2023 })).toBe("ENEM 2023");
    expect(atribuicaoOficial({ kind: "oficial", exam: "ENEM" })).toBe("ENEM");
    expect(atribuicaoOficial({ kind: "ia-validada" })).toBeUndefined();
    expect(atribuicaoOficial({ kind: "adaptada-de-oficial", exam: "ENEM", year: 2023 })).toBeUndefined();
    expect(atribuicaoOficial({ kind: "oficial", year: 2023 })).toBeUndefined();
    expect(atribuicaoOficial(undefined)).toBeUndefined();
  });
});

describe("buildItemMetaOficial — irt (docs/36 T-04.2)", () => {
  test("b segue a dificuldade editorial e c = 1/nOpções; source continua 'estimado' (Inep não entra no modelo)", () => {
    const bs = ([1, 2, 3, 4, 5] as const).map((d) => buildItemMetaOficial(entrada({ difficulty: d })).irt);
    expect(bs.map((i) => i.b)).toEqual([-1.6, -0.8, 0, 0.8, 1.6]);
    for (const irt of bs) {
      expect(irt.c).toBeCloseTo(0.2, 10); // 5 alternativas
      expect(irt.a).toBe(1);
      expect(irt.source).toBe("estimado");
    }
  });
});

describe("conferirGabaritoOficial — segunda fonte independente (mesmo mecanismo do verificador da Fase 9)", () => {
  let server: ReturnType<typeof Bun.serve>;
  afterEach(() => server?.stop(true));

  test("solucionador concorda com o gabarito informado -> conferido", async () => {
    server = Bun.serve({
      port: 0,
      fetch: () =>
        Response.json({
          choices: [{ message: { content: JSON.stringify({ answerIndex: 0, confidence: 0.9 }) } }],
        }),
    });
    const r = await conferirGabaritoOficial(
      entrada({ exercise: exercicioSintetico(0) }),
      `http://localhost:${server.port}`,
      "chave-fake",
      "modelo-teste",
      "sistema-fake",
    );
    expect(r.conferido).toBe(true);
  });

  test("solucionador DISCORDA -> não confere, guarda a divergência, nunca publica sozinho", async () => {
    server = Bun.serve({
      port: 0,
      fetch: () =>
        Response.json({
          choices: [
            { message: { content: JSON.stringify({ answerIndex: 3, confidence: 0.8 } as const) } },
          ],
        }),
    });
    const r = await conferirGabaritoOficial(
      entrada({ exercise: exercicioSintetico(0) }),
      `http://localhost:${server.port}`,
      "chave-fake",
      "modelo-teste",
      "sistema-fake",
    );
    expect(r.conferido).toBe(false);
    expect(r.divergencia).toContain("diverge");
  });

  test("solucionador nunca recebe o índice correto no payload — checagem contra vazamento do gabarito", async () => {
    let corpoRecebido = "";
    server = Bun.serve({
      port: 0,
      async fetch(req) {
        corpoRecebido = await req.text();
        return Response.json({
          choices: [{ message: { content: JSON.stringify({ answerIndex: 0, confidence: 0.9 }) } }],
        });
      },
    });
    await conferirGabaritoOficial(
      entrada({ exercise: exercicioSintetico(2) }),
      `http://localhost:${server.port}`,
      "chave-fake",
      "modelo-teste",
      "sistema-fake",
    );
    const payloadUsuario = JSON.parse(corpoRecebido).messages[1].content;
    expect(JSON.parse(payloadUsuario)).not.toHaveProperty("correta");
  });
});

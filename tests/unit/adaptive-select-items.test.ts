import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { bAlvo, selectItems } from "@/lib/adaptive/select-items";
import { composeCheckpoint } from "@/lib/adaptive/checkpoint";
import { isPackagedItem, itemIndex, itemMetaOf, _setRetiredForTests } from "@/content/items";
import { resolveExercise } from "@/content/microlicoes";
import type { Attempt, LearningState } from "@/lib/learning/types";
import { learningStateVazio } from "@/lib/learning/types";
import { carregarPacotesReais } from "./helpers/pacotes-reais";

/**
 * Seleção de itens (docs/30 §11.7, Fase 8 F8.6).
 */

describe("bAlvo", () => {
  test("θ=0, p-alvo=0,7, item de 5 alternativas (c=0,2 nominal) → b-alvo ≈ -0,85 ± 0,1 (critério F8.6)", () => {
    const b = bAlvo(0, 0.7);
    expect(b).toBeGreaterThanOrEqual(-0.95);
    expect(b).toBeLessThanOrEqual(-0.75);
  });

  test("p-alvo maior → b-alvo menor (item mais fácil precisa ficar mais fácil, b menor)", () => {
    const facil = bAlvo(0, 0.85);
    const dificil = bAlvo(0, 0.5);
    expect(facil).toBeLessThan(dificil);
  });

  test("θ maior desloca b-alvo pra cima (mesma probabilidade exige item mais difícil)", () => {
    const baixo = bAlvo(-1, 0.7);
    const alto = bAlvo(1, 0.7);
    expect(alto).toBeGreaterThan(baixo);
  });
});

describe("selectItems", () => {
  const learningVazio: Pick<LearningState, "recentAttempts"> = { recentAttempts: [] };

  test("devolve itens da habilidade, sem nunca incluir item visto HOJE", () => {
    const skillId = "mat:porcentagem-conceito";
    const r1 = selectItems(skillId, 3, 0.7, 0, learningVazio, "2026-09-24", "seed-1", "pratica");
    expect(r1.itemIds.length).toBeGreaterThan(0);

    const vistoHoje: Attempt = {
      id: "a1",
      sessionId: null,
      exerciseId: r1.itemIds[0],
      exerciseVersion: 1,
      skillIds: [skillId],
      role: "pratica",
      answer: 0,
      correct: true,
      hintUsed: false,
      tutorUsed: false,
      firstSubmission: true,
      submittedAt: "2026-09-24T10:00:00.000Z",
      localDate: "2026-09-24",
      durationMs: 3000,
    };
    const r2 = selectItems(skillId, 3, 0.7, 0, { recentAttempts: [vistoHoje] }, "2026-09-24", "seed-1", "pratica");
    expect(r2.itemIds).not.toContain(r1.itemIds[0]);
  });

  test("ordem de apresentação final é dificuldade crescente", () => {
    const r = selectItems("mat:porcentagem-conceito", 4, 0.7, 0, learningVazio, "2026-09-24", "seed-1", "pratica");
    const dificuldades = r.itemIds.map((id) => itemMetaOf(id).difficulty);
    for (let i = 1; i < dificuldades.length; i++) {
      expect(dificuldades[i]).toBeGreaterThanOrEqual(dificuldades[i - 1]);
    }
  });

  test("é determinístico — mesma semente, mesmo resultado", () => {
    const a = selectItems("mat:porcentagem-conceito", 3, 0.7, 0, learningVazio, "2026-09-24", "seed-x", "pratica");
    const b = selectItems("mat:porcentagem-conceito", 3, 0.7, 0, learningVazio, "2026-09-24", "seed-x", "pratica");
    expect(a.itemIds).toEqual(b.itemIds);
  });

  test("sementes diferentes podem escolher itens diferentes dentro do pool próximo", () => {
    const a = selectItems("mat:porcentagem-conceito", 2, 0.7, 0, learningVazio, "2026-09-24", "seed-a", "pratica");
    const b = selectItems("mat:porcentagem-conceito", 2, 0.7, 0, learningVazio, "2026-09-24", "seed-b", "pratica");
    expect(a.itemIds.length).toBeGreaterThan(0);
    expect(b.itemIds.length).toBeGreaterThan(0);
  });

  test("habilidade sem pool nenhum (inexistente) → poolCurto true, itemIds reduzido", () => {
    const r = selectItems("mat:habilidade-que-nao-existe", 5, 0.7, 0, learningVazio, "2026-09-24", "seed-1", "pratica");
    expect(r.poolCurto).toBe(true);
    expect(r.itemIds.length).toBeLessThan(5);
  });

  test("respeita minDifficulty quando informado — nunca devolve item abaixo do mínimo", () => {
    const r = selectItems(
      "mat:porcentagem-conceito",
      3,
      0.5,
      0,
      learningVazio,
      "2026-09-24",
      "seed-1",
      "desafio",
      3,
      undefined,
    );
    for (const id of r.itemIds) {
      expect(itemMetaOf(id).difficulty).toBeGreaterThanOrEqual(3);
    }
  });

  test("respeita maxDifficulty quando informado — nunca devolve item acima do máximo", () => {
    const r = selectItems(
      "mat:porcentagem-valor",
      3,
      0.8,
      0,
      learningVazio,
      "2026-09-24",
      "seed-1",
      "pratica",
      undefined,
      2,
    );
    for (const id of r.itemIds) {
      expect(itemMetaOf(id).difficulty).toBeLessThanOrEqual(2);
    }
  });
});

/**
 * docs/36 RF-2/C7 (T-02.1): `selectItemsForActivity` não devolve `[]` só porque o
 * plano não gravou `targetP` (o planner nunca grava `itemIds`, e `targetP` só vem do
 * candidato) e usa o tamanho do TIPO em vez de `4` fixo.
 */
describe("selectItemsForActivity (docs/36 T-02.1)", () => {
  const learning = { learning: { recentAttempts: [], skillModel: {}, skillEvidence: {}, reviewSchedule: {}, journey: { history: [], lastCheckpointDate: null } } } as unknown as Pick<
    import("@/lib/store").AppState,
    "learning"
  >;
  const base = {
    id: "atv-x",
    skillIds: ["mat:porcentagem-conceito"],
    subjectId: "mat",
    estimatedMinutes: 2,
    reasons: ["consolidar" as const],
    score: 1,
    scoreBreakdown: {},
  };

  test("sem targetP no plano: usa a probabilidade-alvo do tipo e devolve >= 2 itens (antes: [])", async () => {
    const { selectItemsForActivity } = await import("@/lib/adaptive");
    for (const kind of ["pratica", "revisao", "desafio", "reforco"] as const) {
      const ids = selectItemsForActivity({ ...base, kind }, learning, "2026-09-28", "atv-x");
      expect(ids.length).toBeGreaterThanOrEqual(2);
    }
  });

  test("com itemIds já escolhidos, o tamanho segue o de itemIds (não muda ao reabrir)", async () => {
    const { selectItemsForActivity } = await import("@/lib/adaptive");
    const ids = selectItemsForActivity({ ...base, kind: "pratica", itemIds: ["a", "b"] }, learning, "2026-09-28", "atv-x");
    expect(ids.length).toBeLessThanOrEqual(2);
  });

  test("é determinístico pela semente (mesma atividade, mesmos itens)", async () => {
    const { selectItemsForActivity } = await import("@/lib/adaptive");
    const a = selectItemsForActivity({ ...base, kind: "pratica" }, learning, "2026-09-28", "atv-x");
    const b = selectItemsForActivity({ ...base, kind: "pratica" }, learning, "2026-09-28", "atv-x");
    expect(a).toEqual(b);
  });

  test("atividade sem habilidade devolve os itens que já tinha (ou [])", async () => {
    const { selectItemsForActivity } = await import("@/lib/adaptive");
    expect(selectItemsForActivity({ ...base, kind: "pratica", skillIds: [] }, learning, "2026-09-28", "x")).toEqual([]);
  });
});

/**
 * Item retirado pela revisão de qualidade (docs/36 T-07.6, §G.6): fora do pool de seleção e do
 * checkpoint, mas `resolveExercise` continua resolvendo (tentativa antiga, sessão ativa e aula
 * publicada que o referencia não quebram). Usa o pacote REAL de matemática em memória.
 */
describe("item retirado (docs/36 T-07.6)", () => {
  let limpar: () => void;
  const marcados: string[] = [];
  const retirar = (id: string) => {
    marcados.push(id);
    _setRetiredForTests(id, true);
  };
  beforeAll(async () => {
    limpar = await carregarPacotesReais(["mat"]);
  });
  afterEach(() => {
    while (marcados.length) _setRetiredForTests(marcados.pop()!, false);
  });
  afterAll(() => limpar());

  const vazio: Pick<LearningState, "recentAttempts"> = { recentAttempts: [] };

  test("selectItems: o item retirado sai do pool (pacote carregado) e resolveExercise ainda resolve", () => {
    const skill = "mat:porcentagem-conceito";
    const antes = selectItems(skill, 200, 0.7, 0, vazio, "2026-09-28", "seed", "pratica").itemIds;
    const alvo = antes.find((id) => isPackagedItem(id));
    expect(alvo, "a habilidade precisa ter item de pacote disponível").toBeDefined();

    retirar(alvo!);
    const depois = selectItems(skill, 200, 0.7, 0, vazio, "2026-09-28", "seed", "pratica").itemIds;
    expect(depois).not.toContain(alvo!);
    expect(depois.length).toBe(antes.length - 1);
    expect(resolveExercise(alvo!).type).toBe("multipla-escolha"); // segue resolvível
    expect(itemMetaOf(alvo!).id).toBe(alvo!);
  });

  test("composeCheckpoint: itens retirados do pool diagnóstico não voltam", () => {
    const skills = [
      ...new Set(
        itemIndex()
          .filter((e) => e.roles.includes("diagnostico") && e.subjectId === "mat" && e.skill)
          .map((e) => e.skill as string),
      ),
    ].slice(0, 3);
    expect(skills.length).toBeGreaterThanOrEqual(3);
    const learning = { ...learningStateVazio(), skillModel: {}, skillEvidence: {}, reviewSchedule: {} };
    const historico = skills.map((skillId) => ({ skillIds: [skillId] }));

    const antes = composeCheckpoint(learning, historico, "2026-09-28", "seed-cp");
    expect(antes.itemIds.length).toBeGreaterThan(0);
    for (const id of antes.itemIds) retirar(id);

    const depois = composeCheckpoint(learning, historico, "2026-09-28", "seed-cp");
    for (const id of antes.itemIds) expect(depois.itemIds).not.toContain(id);
    for (const id of antes.itemIds) expect(resolveExercise(id)).toBeDefined();
  });
});

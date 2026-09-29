import { describe, expect, test } from "bun:test";
import {
  ensurePlan,
  identidadeDaAtividade,
  isReadyToResume,
  isStillValid,
  navigationTargetFor,
  needsItemSelection,
  semAtividadesRepetidas,
  temAtividadeRepetida,
} from "@/lib/adaptive/journey";
import { ALGO_VERSION, PLANNER_VERSION } from "@/lib/adaptive/constants";
import { journeyVazia, learningStateVazio } from "@/lib/learning/types";
import type { PlannedActivity } from "@/lib/adaptive/types";
import type { AppState } from "@/lib/store";

/**
 * Orquestração da jornada (docs/30 §14, Fase 12 F12.1).
 */

function estadoBase(journeyOverrides: Partial<ReturnType<typeof journeyVazia>> = {}): Pick<AppState, "prefs" | "learning" | "progress"> {
  const learning = learningStateVazio();
  learning.journey = { ...journeyVazia(), ...journeyOverrides };
  return {
    prefs: {
      difficultSubjects: [],
      easySubjects: [],
      studyFocus: { mode: "todas", subjectIds: [], areas: [] },
    } as unknown as AppState["prefs"],
    learning,
    progress: { bySubject: {} } as unknown as AppState["progress"],
  };
}

function atividade(overrides: Partial<PlannedActivity> = {}): PlannedActivity {
  return {
    id: "atv-1",
    kind: "pratica",
    skillIds: ["mat:x"],
    subjectId: "mat",
    estimatedMinutes: 5,
    reasons: ["consolidar"],
    score: 0.5,
    scoreBreakdown: {},
    ...overrides,
  };
}

describe("ensurePlan", () => {
  test("committed vazio -> replaneja (devolve resultado, nunca null)", () => {
    const s = estadoBase();
    const r = ensurePlan(s, "2026-09-24", "seed-1");
    expect(r).not.toBeNull();
    expect(r!.committed.length).toBeGreaterThan(0);
  });

  test("committed com 3 e planVersion atual -> não replaneja (null)", () => {
    const s = estadoBase({
      committed: [atividade({ id: "a1" }), atividade({ id: "a2" }), atividade({ id: "a3" })],
      planVersion: PLANNER_VERSION,
    });
    const r = ensurePlan(s, "2026-09-24", "seed-1");
    expect(r).toBeNull();
  });

  test("committed curto (só 1, uma atividade concluída sem reposição) -> replaneja", () => {
    const s = estadoBase({ committed: [atividade({ id: "a1" })], planVersion: PLANNER_VERSION });
    const r = ensurePlan(s, "2026-09-24", "seed-1");
    expect(r).not.toBeNull();
  });

  test("planVersion desatualizado -> replaneja mesmo com 3 comprometidas", () => {
    const s = estadoBase({
      committed: [atividade({ id: "a1" }), atividade({ id: "a2" }), atividade({ id: "a3" })],
      planVersion: PLANNER_VERSION - 1,
    });
    const r = ensurePlan(s, "2026-09-24", "seed-1");
    expect(r).not.toBeNull();
  });

  test("resultado tem no máximo 3 comprometidas e 5 a seguir", () => {
    const s = estadoBase();
    const r = ensurePlan(s, "2026-09-24", "seed-1")!;
    expect(r.committed.length).toBeLessThanOrEqual(3);
    expect(r.upcoming.length).toBeLessThanOrEqual(5);
  });

  test("é determinístico — mesma entrada e semente dão o mesmo plano", () => {
    const s = estadoBase();
    const a = ensurePlan(s, "2026-09-24", "seed-x")!;
    const b = ensurePlan(s, "2026-09-24", "seed-x")!;
    expect(a.committed.map((x) => x.id)).toEqual(b.committed.map((x) => x.id));
  });
});

describe("isReadyToResume (docs/36 RF-2, T-02.1) — os 7 kinds", () => {
  test("dinâmicas (pratica/revisao/desafio/checkpoint) só ficam prontas com >= 2 itemIds", () => {
    for (const kind of ["pratica", "revisao", "desafio", "checkpoint"] as const) {
      expect(isReadyToResume(atividade({ kind }))).toBe(false);
      expect(isReadyToResume(atividade({ kind, itemIds: [] }))).toBe(false);
      expect(isReadyToResume(atividade({ kind, itemIds: ["q1"] }))).toBe(false);
      expect(isReadyToResume(atividade({ kind, itemIds: ["q1", "q2"] }))).toBe(true);
    }
  });

  test("aula e legado só precisam de lessonId", () => {
    for (const kind of ["aula", "legado"] as const) {
      expect(isReadyToResume(atividade({ kind }))).toBe(false);
      expect(isReadyToResume(atividade({ kind, lessonId: "licao-1" }))).toBe(true);
    }
  });

  test("reforço COM aula própria: lessonId basta; SEM aula: precisa de itens", () => {
    expect(isReadyToResume(atividade({ kind: "reforco", lessonId: "licao-1" }))).toBe(true);
    expect(isReadyToResume(atividade({ kind: "reforco" }))).toBe(false);
    expect(isReadyToResume(atividade({ kind: "reforco", itemIds: ["q1", "q2"] }))).toBe(true);
  });
});

/**
 * Reposição que preserva (docs/36 RF-8, T-02.7). Habilidades reais do catálogo
 * (mat:porcentagem-conceito tem aula embarcada; por:crase-regra-basica tem trilha legada).
 */
describe("ensurePlan — reposição preserva comprometidas e a iniciada (RF-8)", () => {
  const HOJE = "2026-09-28";
  function pratica(id: string, skill = "mat:porcentagem-conceito", over: Partial<PlannedActivity> = {}) {
    return atividade({ id, kind: "pratica", skillIds: [skill], subjectId: skill.split(":")[0], ...over });
  }

  test("(a) 3 comprometidas, conclui a 1ª -> as 2 restantes ficam nas posições 0-1 e só a 3ª é nova", () => {
    const B = pratica("B", "mat:operacoes-fundamentais");
    const C = pratica("C", "por:crase-regra-basica");
    const s = estadoBase({ committed: [B, C], upcoming: [], planVersion: PLANNER_VERSION });
    const r = ensurePlan(s, HOJE, "seed-1")!;
    expect(r).not.toBeNull();
    expect(r.committed).toHaveLength(3);
    expect(r.committed[0].id).toBe("B");
    expect(r.committed[1].id).toBe("C");
    expect(["B", "C"]).not.toContain(r.committed[2].id);
  });

  test("(b) forceReplan com atividade iniciada -> a iniciada fica no topo, com itens e startedAt", () => {
    const ativa = pratica("ATIVA", "mat:porcentagem-conceito", { startedAt: "2026-09-28T10:00:00.000Z", itemIds: ["q10", "q21"] });
    const s = estadoBase({
      committed: [pratica("ATIVA"), pratica("X", "mat:operacoes-fundamentais"), pratica("Y", "por:crase-regra-basica")],
      activeActivity: ativa,
      planVersion: PLANNER_VERSION,
    });
    const r = ensurePlan(s, HOJE, "seed-1", { forceReplan: true })!;
    expect(r).not.toBeNull();
    expect(r.committed[0].id).toBe("ATIVA");
    expect(r.committed[0].startedAt).toBe("2026-09-28T10:00:00.000Z");
    expect(r.committed[0].itemIds).toEqual(["q10", "q21"]);
    expect(r.committed.slice(1).map((a) => a.id)).not.toContain("X");
    expect(r.committed.slice(1).map((a) => a.id)).not.toContain("Y");
  });

  test("(c) comprometida de matéria fora do novo foco -> removida; as válidas ficam na ordem", () => {
    const fisica = pratica("FIS", "fis:cinematica-movimento-uniforme");
    const s = estadoBase({
      committed: [fisica, pratica("MAT"), pratica("MAT2", "mat:operacoes-fundamentais")],
      planVersion: PLANNER_VERSION,
    });
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["mat"], areas: [] };
    const r = ensurePlan(s, HOJE, "seed-1")!;
    expect(r).not.toBeNull();
    expect(r.committed.map((a) => a.id)).not.toContain("FIS");
    expect(r.committed[0].id).toBe("MAT");
    expect(r.committed[1].id).toBe("MAT2");
  });

  test("(d) planVersion antigo -> replano completo, preservando a atividade iniciada", () => {
    const ativa = pratica("ATIVA", "mat:porcentagem-conceito", { startedAt: "2026-09-28T10:00:00.000Z", itemIds: ["q10", "q21"] });
    const s = estadoBase({
      committed: [pratica("ATIVA"), pratica("OLD1", "mat:operacoes-fundamentais"), pratica("OLD2", "por:crase-regra-basica")],
      activeActivity: ativa,
      planVersion: 1,
    });
    const r = ensurePlan(s, HOJE, "seed-1")!;
    expect(r.committed[0].id).toBe("ATIVA");
    expect(r.committed.map((a) => a.id)).not.toContain("OLD1");
    expect(r.committed.map((a) => a.id)).not.toContain("OLD2");
  });

  test("(d2) planVersion antigo SEM atividade iniciada -> tudo substituído", () => {
    const s = estadoBase({
      committed: [pratica("OLD1"), pratica("OLD2", "mat:operacoes-fundamentais"), pratica("OLD3", "por:crase-regra-basica")],
      planVersion: 1,
    });
    const r = ensurePlan(s, HOJE, "seed-1")!;
    expect(r.committed.map((a) => a.id)).not.toContain("OLD1");
    expect(r.committed.map((a) => a.id)).not.toContain("OLD3");
  });

  test("(d3) RP-5: planVersion 1 -> um replano; aplicado com PLANNER_VERSION, a chamada seguinte devolve null", () => {
    const s = estadoBase({
      committed: [pratica("OLD1"), pratica("OLD2", "mat:operacoes-fundamentais"), pratica("OLD3", "por:crase-regra-basica")],
      planVersion: 1,
    });
    const r = ensurePlan(s, HOJE, "seed-1");
    expect(r).not.toBeNull();
    const s2 = estadoBase({ committed: r!.committed, upcoming: r!.upcoming, planVersion: PLANNER_VERSION });
    expect(ensurePlan(s2, HOJE, "seed-1")).toBeNull();
  });

  test("(e) loop guard: foco estreito -> aplicar o resultado e chamar de novo devolve null", () => {
    const s = estadoBase();
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["red"], areas: [] };
    const primeira = ensurePlan(s, HOJE, "seed-1");
    const s2 = estadoBase({
      committed: primeira?.committed ?? [],
      upcoming: primeira?.upcoming ?? [],
      planVersion: PLANNER_VERSION,
    });
    s2.prefs.studyFocus = { mode: "materias", subjectIds: ["red"], areas: [] };
    expect(ensurePlan(s2, HOJE, "seed-1")).toBeNull();
  });

  test("(f) aula NÃO iniciada já concluída em completedLessons -> inválida; reforço da mesma aula não; iniciada nunca", () => {
    const s = estadoBase();
    s.learning.completedLessons["porcentagem-valor"] = { version: 1, completedAt: "2026-09-27T10:00:00.000Z", stars: 3, bestPct: 100 };
    const aula = atividade({ id: "AULA", kind: "aula", lessonId: "porcentagem-valor", skillIds: ["mat:porcentagem-conceito"], subjectId: "mat" });
    const reforco = atividade({ id: "REF", kind: "reforco", lessonId: "porcentagem-valor", skillIds: ["mat:porcentagem-conceito"], subjectId: "mat" });
    expect(isStillValid(aula, s, HOJE)).toBe(false);
    expect(isStillValid(reforco, s, HOJE)).toBe(true);
    expect(isStillValid({ ...aula, startedAt: "2026-09-28T09:00:00.000Z" }, s, HOJE)).toBe(true);
  });

  test("(g) aula cujo lessonId não resolve e legado já concluído -> inválidos", () => {
    const s = estadoBase();
    (s.progress as { lessons: Record<string, unknown> }).lessons = { "crase-01-a-regra-de-ouro": { stars: 3 } };
    expect(
      isStillValid(atividade({ kind: "aula", lessonId: "aula-que-nao-existe", skillIds: ["mat:porcentagem-conceito"], subjectId: "mat" }), s, HOJE),
    ).toBe(false);
    expect(
      isStillValid(
        atividade({ kind: "legado", lessonId: "crase-01-a-regra-de-ouro", skillIds: ["por:crase-regra-basica"], subjectId: "red" }),
        s,
        HOJE,
      ),
    ).toBe(false);
  });

  test("(h) comprometida inválida dispara replano mesmo com 3 e versão em dia", () => {
    const fisica = pratica("FIS", "fis:cinematica-movimento-uniforme");
    const s = estadoBase({
      committed: [fisica, pratica("MAT"), pratica("MAT2", "mat:operacoes-fundamentais")],
      planVersion: PLANNER_VERSION,
    });
    s.prefs.studyFocus = { mode: "materias", subjectIds: ["mat"], areas: [] };
    expect(ensurePlan(s, HOJE, "seed-1")).not.toBeNull();
  });

  test("ALGO_VERSION segue 1 (RP-5): a versão do plano é outra constante", () => {
    expect(ALGO_VERSION).toBe(1);
    expect(PLANNER_VERSION).toBeGreaterThan(ALGO_VERSION);
  });
});

describe("navigationTargetFor", () => {
  test("aula com lessonId -> /learn/$lessonId", () => {
    const r = navigationTargetFor(atividade({ kind: "aula", lessonId: "licao-1" }));
    expect(r).toEqual({ kind: "aula", lessonId: "licao-1" });
  });

  test("reforço COM aula própria -> /learn/$lessonId", () => {
    const r = navigationTargetFor(atividade({ kind: "reforco", lessonId: "licao-1" }));
    expect(r).toEqual({ kind: "aula", lessonId: "licao-1" });
  });

  test("reforço SEM aula própria -> /atividade/$activityId", () => {
    const r = navigationTargetFor(atividade({ kind: "reforco", lessonId: undefined, id: "atv-9" }));
    expect(r).toEqual({ kind: "atividade", activityId: "atv-9" });
  });

  test("legado -> /redacao/$licaoId", () => {
    const r = navigationTargetFor(atividade({ kind: "legado", lessonId: "licao-legada-1" }));
    expect(r).toEqual({ kind: "legado", lessonId: "licao-legada-1" });
  });

  test("prática/revisão/desafio/checkpoint -> /atividade/$activityId", () => {
    for (const kind of ["pratica", "revisao", "desafio", "checkpoint"] as const) {
      const r = navigationTargetFor(atividade({ kind, id: `atv-${kind}` }));
      expect(r).toEqual({ kind: "atividade", activityId: `atv-${kind}` });
    }
  });
});

describe("needsItemSelection", () => {
  test("pratica/revisao/desafio/checkpoint precisam de seleção de itens", () => {
    for (const kind of ["pratica", "revisao", "desafio", "checkpoint"] as const) {
      expect(needsItemSelection(atividade({ kind }))).toBe(true);
    }
  });

  test("aula/legado NUNCA precisam (usam os passos da própria lição)", () => {
    expect(needsItemSelection(atividade({ kind: "aula", lessonId: "x" }))).toBe(false);
    expect(needsItemSelection(atividade({ kind: "legado", lessonId: "x" }))).toBe(false);
  });

  test("reforço: precisa só quando NÃO tem aula própria", () => {
    expect(needsItemSelection(atividade({ kind: "reforco", lessonId: "x" }))).toBe(false);
    expect(needsItemSelection(atividade({ kind: "reforco", lessonId: undefined }))).toBe(true);
  });
});

/* ------------------------------------------------------------------------- *
 * docs/36 A2 (spec-verifier, S3) — a fila nunca mostra a mesma atividade duas
 * vezes. Identidade = mesmo tipo + mesma aula/habilidade alvo (o `id` muda a
 * cada plano). O planner não simula a conclusão dentro do plano (D-28) e por
 * isso repete a mesma aula/prática em posições não adjacentes: quem tira a
 * repetição é o `ensurePlan`.
 * ------------------------------------------------------------------------- */
describe("ensurePlan — sem atividade repetida na fila (A2)", () => {
  const HOJE = "2026-09-28";
  const aula = (id: string, lessonId: string, skill = "por:x", over: Partial<PlannedActivity> = {}) =>
    atividade({ id, kind: "aula", lessonId, skillIds: [skill], ...over });
  const pratica = (id: string, skill: string, over: Partial<PlannedActivity> = {}) =>
    atividade({ id, kind: "pratica", skillIds: [skill], subjectId: skill.split(":")[0], ...over });

  function identidades(r: { committed: PlannedActivity[]; upcoming: PlannedActivity[] }) {
    return [...r.committed, ...r.upcoming].map(identidadeDaAtividade);
  }

  test("identidade: tipo + aula (quando há) ou tipo + habilidade; o id não conta", () => {
    expect(identidadeDaAtividade(aula("a", "L1", "s1"))).toBe(identidadeDaAtividade(aula("b", "L1", "s2")));
    expect(identidadeDaAtividade(aula("a", "L1"))).not.toBe(identidadeDaAtividade(aula("a", "L2")));
    expect(identidadeDaAtividade(pratica("a", "mat:x"))).toBe(identidadeDaAtividade(pratica("b", "mat:x")));
    expect(identidadeDaAtividade(pratica("a", "mat:x"))).not.toBe(identidadeDaAtividade(pratica("a", "mat:y")));
    // mesma habilidade, tipos diferentes = atividades diferentes
    expect(identidadeDaAtividade(pratica("a", "mat:x"))).not.toBe(
      identidadeDaAtividade(pratica("a", "mat:x", { kind: "revisao" })),
    );
    expect(identidadeDaAtividade(atividade({ kind: "checkpoint", skillIds: [] }))).toBe(
      identidadeDaAtividade(atividade({ id: "outro", kind: "checkpoint", skillIds: [] })),
    );
  });

  test("semAtividadesRepetidas preserva a ordem (vence a primeira), tira o que já está na fila e não mexe em lista sem repetição", () => {
    const A = aula("A", "L1");
    const B = pratica("B", "mat:x");
    const A2 = aula("A2", "L1", "outra:skill");
    const C = pratica("C", "mat:y");
    expect(semAtividadesRepetidas([A, B, A2, C]).map((a) => a.id)).toEqual(["A", "B", "C"]);
    expect(semAtividadesRepetidas([A, B, C])).toEqual([A, B, C]);
    // o que já está na fila (as comprometidas) vence, mesmo vindo de fora da lista
    expect(semAtividadesRepetidas([A, B, C], [pratica("K", "mat:x")]).map((a) => a.id)).toEqual(["A", "C"]);
    expect(temAtividadeRepetida([A, B], [C, A2])).toBe(true); // upcoming repete uma comprometida
    expect(temAtividadeRepetida([A], [B, pratica("B2", "mat:x")])).toBe(true); // repetição dentro de upcoming
    expect(temAtividadeRepetida([A, B], [C])).toBe(false);
  });

  test("caso 1 (verificador): a mesma atividade em committed[2] e upcoming[2] -> replano sem repetição, committed[0..1] preservadas", () => {
    const A = pratica("A", "mat:operacoes-fundamentais");
    const B = pratica("B", "por:crase-regra-basica");
    const C = aula("C", "aula-por-interpretacao-ideia-principal", "por:interpretacao-ideia-principal");
    const D = pratica("D", "mat:razao-proporcao");
    const E = pratica("E", "red:estrutura-dissertativo-argumentativa");
    const C2 = aula("C-repetida", "aula-por-interpretacao-ideia-principal", "por:interpretacao-ideia-principal");
    const s = estadoBase({ committed: [A, B, C], upcoming: [D, E, C2], planVersion: PLANNER_VERSION });
    const r = ensurePlan(s, HOJE, "seed-1");
    expect(r).not.toBeNull(); // antes: `committed` cheio e em dia -> null, e a repetição ficava
    expect(r!.committed[0].id).toBe("A");
    expect(r!.committed[1].id).toBe("B");
    expect(r!.committed[2].id).toBe("C");
    const ids = identidades(r!);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("caso 2 (verificador): a prática da mesma habilidade duas vezes em upcoming", () => {
    const s = estadoBase({
      committed: [pratica("A", "mat:operacoes-fundamentais"), pratica("B", "por:crase-regra-basica"), pratica("C", "mat:razao-proporcao")],
      upcoming: [
        pratica("U1", "red:estrutura-dissertativo-argumentativa"),
        pratica("U2", "red:estrutura-dissertativo-argumentativa"),
      ],
      planVersion: PLANNER_VERSION,
    });
    const r = ensurePlan(s, HOJE, "seed-1")!;
    expect(r).not.toBeNull();
    const ids = identidades(r);
    expect(new Set(ids).size).toBe(ids.length);
    expect(r.committed.map((a) => a.id)).toEqual(["A", "B", "C"]);
  });

  test("caso 3 (verificador): planos do motor real nunca devolvem a mesma aula/prática duas vezes (foco em uma matéria, várias, todas)", () => {
    const focos: Array<{ mode: "todas" | "materias"; subjectIds: string[] }> = [
      { mode: "todas", subjectIds: [] },
      { mode: "materias", subjectIds: ["soc"] },
      { mode: "materias", subjectIds: ["por"] },
      { mode: "materias", subjectIds: ["por", "soc", "red"] },
    ];
    for (const foco of focos) {
      const s = estadoBase();
      s.prefs.studyFocus = { ...foco, areas: [] };
      const r = ensurePlan(s, HOJE, "seed-1")!;
      expect(r, JSON.stringify(foco)).not.toBeNull();
      const ids = identidades(r);
      expect(new Set(ids).size, `${JSON.stringify(foco)}: ${ids.join(" | ")}`).toBe(ids.length);
      expect(r.committed.length + r.upcoming.length).toBeGreaterThan(0);
      // aplicar o resultado e chamar de novo não replaneja (nem entra em loop)
      const s2 = estadoBase({ committed: r.committed, upcoming: r.upcoming, planVersion: PLANNER_VERSION });
      s2.prefs.studyFocus = s.prefs.studyFocus;
      expect(ensurePlan(s2, HOJE, "seed-1"), JSON.stringify(foco)).toBeNull();
    }
  });

  test("a iniciada continua no topo mesmo quando o plano novo traz a mesma atividade", () => {
    const iniciada = pratica("ATIVA", "mat:porcentagem-conceito", { startedAt: "2026-09-28T10:00:00.000Z", itemIds: ["q1", "q2"] });
    const s = estadoBase({ committed: [iniciada], activeActivity: iniciada, upcoming: [], planVersion: PLANNER_VERSION });
    const r = ensurePlan(s, HOJE, "seed-1", { forceReplan: true })!;
    expect(r.committed[0].id).toBe("ATIVA");
    const ids = identidades(r);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

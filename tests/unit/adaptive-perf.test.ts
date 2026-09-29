import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { planNext } from "@/lib/adaptive/planner";
import { updateSkill } from "@/lib/adaptive/model";
import { learningStateVazio } from "@/lib/learning/types";
import { activeSkills } from "@/content/taxonomy";
import type { AppState } from "@/lib/store";

/**
 * Desempenho do planejador (docs/30 §11.9, Fase 8 F8.10). Escopo reduzido
 * registrado no `docs/32`: o alvo do plano é "500 habilidades/6.000 itens"
 * sintéticos — o catálogo REAL do app hoje tem ~65 habilidades ativas e
 * ~1.300 itens (`docs/32`, Fase 3), então o teto de 20ms é medido contra o
 * catálogo real (mais barato de rodar, sem fixture sintética de 500
 * habilidades pra manter), com uma folga generosa (< 20ms mesmo assim).
 */

function estadoComEvidencia(): Pick<AppState, "prefs" | "learning" | "progress"> {
  const learning = learningStateVazio();
  const hoje = "2026-09-24";
  for (const sk of activeSkills()) {
    learning.skillModel[sk.id] = updateSkill(
      undefined,
      sk.id,
      { role: "pratica", correct: Math.random() > 0.4 },
      { a: 1, b: 0, c: 0.2 },
      hoje,
      { difficulty: 3, now: `${hoje}T10:00:00.000Z` },
    );
  }
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

describe("planNext — desempenho (docs/30 §11.9)", () => {
  test("< 20ms em média (50 execuções) no catálogo real", () => {
    const s = estadoComEvidencia();
    const N_EXECUCOES = 50;
    const inicio = performance.now();
    for (let i = 0; i < N_EXECUCOES; i++) {
      planNext(s, "2026-09-24", `seed-${i}`, { n: 8 });
    }
    const total = performance.now() - inicio;
    const media = total / N_EXECUCOES;
    expect(media).toBeLessThan(20);
  });

  test("nenhuma execução isolada passa de 60ms (pior caso)", () => {
    const s = estadoComEvidencia();
    let pior = 0;
    for (let i = 0; i < 20; i++) {
      const inicio = performance.now();
      planNext(s, "2026-09-24", `seed-${i}`, { n: 8 });
      pior = Math.max(pior, performance.now() - inicio);
    }
    expect(pior).toBeLessThan(60);
  });
});

/* -------------------------------------------------------------------------- *
 * docs/36 T-05.6 — "medir antes de otimizar" (E2/N10; §J Fase 5).
 *
 * Mede no estado MÁXIMO (500 tentativas, 300 eventos, 200 históricos, todas as
 * habilidades ativas do catálogo) com o catálogo COMPLETO carregado dos pacotes
 * de `public/content/v1` (a mesma origem que o app usa em produção):
 *   (a) `setState` — structuredClone + JSON.stringify + `setItem` falso;
 *   (b) `buildTrail`;
 *   (c) `ensurePlan` com a fila vazia (pior caso: replaneja tudo).
 * 20 repetições cronometradas depois de 3 de aquecimento; p50/p95 impressos.
 *
 * REGRA DE DECISÃO do plano: se (a) p95 > 8 ms OU (b) p95 > 8 ms, aplicar o
 * `useMemo` seletivo de `buildTrail` em `trilha.tsx`; abaixo disso só registrar.
 * Os números abaixo servem à decisão HUMANA (docs/37) — as asserções daqui são
 * tetos folgados de sanidade (100 ms), não o limiar de 8 ms, para o teste não
 * flutuar por máquina. Ressalva: benchmark de Bun em máquina de desenvolvimento
 * NÃO prova fluidez em celular.
 * -------------------------------------------------------------------------- */

const REPETICOES = 20;
const AQUECIMENTO = 3;
const HOJE_PERF = "2026-09-28";

function percentis(amostras: number[]): { p50: number; p95: number; max: number; min: number } {
  const o = [...amostras].sort((a, b) => a - b);
  const em = (q: number) => o[Math.min(o.length - 1, Math.ceil(q * o.length) - 1)]!;
  return { p50: em(0.5), p95: em(0.95), max: o[o.length - 1]!, min: o[0]! };
}

function medir(fn: () => void): number[] {
  for (let i = 0; i < AQUECIMENTO; i++) fn();
  const amostras: number[] = [];
  for (let i = 0; i < REPETICOES; i++) {
    const t0 = performance.now();
    fn();
    amostras.push(performance.now() - t0);
  }
  return amostras;
}

describe("T-05.6 — medição de setState / buildTrail / ensurePlan no estado máximo (docs/36)", () => {
  const g = globalThis as unknown as Record<string, unknown>;
  const fetchOriginal = globalThis.fetch;
  let store: typeof import("@/lib/store");
  let bytesGravados = 0;
  let stateMax: AppState;

  beforeAll(async () => {
    // Catálogo completo em memória, lido do disco (mesmos pacotes que o app baixa).
    const { _resetRepositoryForTests, ensureSubjects } = await import("@/lib/content/repository");
    _resetRepositoryForTests();
    const raiz = `${import.meta.dir}/../../public`;
    globalThis.fetch = (async (url: string | URL) => {
      const arquivo = Bun.file(`${raiz}${String(url)}`);
      if (!(await arquivo.exists())) return new Response("nope", { status: 404 });
      return new Response(await arquivo.text());
    }) as typeof fetch;
    const manifest = JSON.parse(await Bun.file(`${raiz}/content/v1/manifest.json`).text()) as {
      subjects: Record<string, unknown>;
    };
    expect(await ensureSubjects(Object.keys(manifest.subjects))).toBe(true);

    // `localStorage` falso: `setItem` só guarda o tamanho (o custo do JSON.stringify já foi pago pelo store).
    g.localStorage = {
      getItem: () => null,
      setItem: (_k: string, v: string) => {
        bytesGravados = v.length;
      },
      removeItem: () => {},
    };
    g.window = { location: { search: "" }, addEventListener: () => {} };
    store = (await import("@/lib/store?perf-t0506")) as typeof import("@/lib/store");
    store.hydrate();

    // Estado máximo: cada estrutura no seu limite ao mesmo tempo (docs/30 §21.1).
    const skills = activeSkills().map((k) => k.id);
    store.setState((s) => {
      for (const id of skills) {
        s.learning.skillModel[id] = updateSkill(
          undefined,
          id,
          { role: "pratica", correct: Math.random() > 0.4 },
          { a: 1, b: 0, c: 0.2 },
          HOJE_PERF,
          { difficulty: 3, now: `${HOJE_PERF}T10:00:00.000Z` },
        );
      }
      s.learning.recentAttempts = Array.from({ length: 500 }, (_, i) => ({
        id: `at-${i}`,
        sessionId: `ls-${i}`,
        exerciseId: `mc:teste:${i}`,
        exerciseVersion: 1,
        subjectId: "mat",
        topicId: "porc",
        skillIds: [skills[i % skills.length]!],
        role: "pratica",
        answer: i % 4,
        correct: i % 2 === 0,
        hintUsed: false,
        tutorUsed: false,
        firstSubmission: true,
        submittedAt: `${HOJE_PERF}T10:00:00.000Z`,
        localDate: HOJE_PERF,
        durationMs: 4000,
        response: "answered",
        helpLevel: 0,
        assisted: false,
        itemDifficulty: 2,
        predictedP: 0.7,
        source: "microlicao",
      })) as never;
      s.learning.events = Array.from({ length: 300 }, (_, i) => ({
        type: "activity-completed",
        at: `${HOJE_PERF}T10:00:00.000Z`,
        localDate: HOJE_PERF,
        skillId: skills[i % skills.length],
        activityId: `atv-${i}`,
        meta: { scorePct: 80 },
      })) as never;
      s.learning.journey.history = Array.from({ length: 200 }, (_, i) => ({
        activityId: `atv-${i}`,
        kind: "pratica",
        skillIds: [skills[i % skills.length]!],
        subjectId: "mat",
        completedAt: `${HOJE_PERF}T10:00:00.000Z`,
        scorePct: 80,
        attemptKey: `atv-${i}@${HOJE_PERF}T09:50:00.000Z`,
        localDate: HOJE_PERF,
      })) as never;
      return s;
    });
    stateMax = store.getState();
  });

  afterAll(async () => {
    delete g.window;
    delete g.localStorage;
    globalThis.fetch = fetchOriginal;
    const { _resetRepositoryForTests } = await import("@/lib/content/repository");
    _resetRepositoryForTests();
  });

  test("estado de teste está de fato no máximo e o catálogo está completo", () => {
    expect(stateMax.learning.recentAttempts).toHaveLength(500);
    expect(stateMax.learning.events).toHaveLength(300);
    expect(stateMax.learning.journey.history).toHaveLength(200);
    expect(Object.keys(stateMax.learning.skillModel).length).toBe(activeSkills().length);
  });

  test("(a) setState no estado máximo — clone + stringify + setItem falso", () => {
    const amostras = medir(() =>
      store.setState((s) => {
        s.progress.xp += 1;
        return s;
      }),
    );
    const r = percentis(amostras);
    console.log(
      `[perf T-05.6] (a) setState: p50=${r.p50.toFixed(2)} ms  p95=${r.p95.toFixed(2)} ms  max=${r.max.toFixed(2)} ms  (JSON gravado: ${(bytesGravados / 1024).toFixed(0)} KB, ${activeSkills().length} habilidades)`,
    );
    expect(bytesGravados).toBeGreaterThan(50_000); // prova que o stringify rodou de verdade
    expect(r.p95).toBeLessThan(100);
  });

  test("(b) buildTrail com o catálogo carregado", async () => {
    const { buildTrail } = await import("@/lib/learning/trail");
    const amostras = medir(() => void buildTrail(stateMax, HOJE_PERF));
    const r = percentis(amostras);
    console.log(
      `[perf T-05.6] (b) buildTrail: p50=${r.p50.toFixed(2)} ms  p95=${r.p95.toFixed(2)} ms  max=${r.max.toFixed(2)} ms`,
    );
    expect(r.p95).toBeLessThan(100);
  });

  test("(c) ensurePlan com a fila vazia (replaneja tudo) e o catálogo carregado", async () => {
    const { ensurePlan } = await import("@/lib/adaptive/journey");
    const s = {
      prefs: stateMax.prefs,
      progress: stateMax.progress,
      learning: { ...stateMax.learning, journey: { ...stateMax.learning.journey, committed: [], upcoming: [] } },
    };
    let n = 0;
    const amostras = medir(() => void ensurePlan(s, HOJE_PERF, `seed-${n++}`));
    const r = percentis(amostras);
    console.log(
      `[perf T-05.6] (c) ensurePlan: p50=${r.p50.toFixed(2)} ms  p95=${r.p95.toFixed(2)} ms  max=${r.max.toFixed(2)} ms`,
    );
    expect(r.p95).toBeLessThan(100);
  });
});

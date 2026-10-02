/**
 * "Pular para cá" no aparelho (spec 50 §5.7.1, T-50.12.2–12.3): o store só REFLETE o que o servidor decidiu.
 * Lições "Puladas" (`pulo: true`) contam para pré-requisito, sem XP nem estrelas; fazer depois paga o XP normal da
 * primeira conclusão; revisão agendada em até 3 dias para as habilidades sem questão; idempotente pelo id do teste;
 * nada do teste vai para a outbox nem para a importação; o campo novo sobrevive à carga (sem subir a versão).
 * A trilha mostra "Pular para cá" no capítulo-alvo e "Pulada" no nó.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { CURRICULUM_TREE } from "@/content/curriculum-tree";
import { reiniciarParaTestes } from "@/lib/conta/usuario-da-sessao";
import { estadoLabel } from "@/components/learning/path/PathNode";
import { buildTrail } from "@/lib/learning/trail";
import type { Attempt } from "@/lib/learning/types";
import { learningStateVazio } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

type Store = typeof import("@/lib/store");
const KEY = "foca.state.v3";
const g = globalThis as unknown as Record<string, unknown>;
let dados: Map<string, string>;
let n = 0;

async function loja(inicial: Record<string, string> = {}): Promise<Store> {
  dados = new Map(Object.entries(inicial));
  g.localStorage = {
    getItem: (k: string) => (dados.has(k) ? dados.get(k)! : null),
    setItem: (k: string, v: string) => void dados.set(k, v),
    removeItem: (k: string) => void dados.delete(k),
    key: (i: number) => [...dados.keys()][i] ?? null,
    get length() {
      return dados.size;
    },
  };
  g.window = { location: { search: "" }, addEventListener: () => undefined };
  n += 1;
  const store = (await import(`@/lib/store?pulo=${n}`)) as Store;
  store.hydrate();
  return store;
}

beforeEach(() => reiniciarParaTestes());
afterEach(() => {
  delete g.window;
  delete g.localStorage;
  reiniciarParaTestes();
});

const POR = CURRICULUM_TREE.subjects.find((s) => s.id === "por")!.sections.flatMap((s) => s.chapters);
const MICRO = POR[0].lessonIds; // por-crase (micro)
const LEGADO = POR[1].lessonIds; // crase (legado)

const passou = (over: Partial<Parameters<Store["aplicarPuloNoAparelho"]>[0]> = {}) => ({
  id: "pulo-teste-1",
  passou: true,
  licoesPuladas: MICRO.map((id) => ({ id, tipo: "micro" as const })),
  semQuestao: [] as string[],
  xp: 20,
  hoje: "2026-10-15",
  checarEmDias: 3 as const,
  ...over,
});

describe("aplicarPuloNoAparelho", () => {
  test("passou: lições puladas contam como feitas, sem estrelas; XP do servidor; 1 bloco; idempotente", async () => {
    const s = await loja();
    const antes = s.getState().progress.xp;
    expect(s.aplicarPuloNoAparelho(passou())).toBe(true);
    const depois = s.getState();
    for (const id of MICRO) expect(depois.learning.completedLessons[id]).toMatchObject({ pulo: true });
    expect(depois.progress.xp).toBe(antes + 20);
    expect(s.atividadeHoje(depois).completedBlockIds).toHaveLength(1);
    // De novo (resposta repetida, resultado recuperado): nada muda.
    expect(s.aplicarPuloNoAparelho(passou())).toBe(false);
    expect(s.getState().progress.xp).toBe(antes + 20);
    expect(s.atividadeHoje(s.getState()).completedBlockIds).toHaveLength(1);
  });

  test("lição já feita de verdade não vira pulada; legado vai para progress.lessons", async () => {
    const s = await loja();
    s.completeMicroLesson(MICRO[0], 1, 4, 4);
    s.aplicarPuloNoAparelho(passou({ licoesPuladas: [{ id: MICRO[0], tipo: "micro" }, { id: LEGADO[0], tipo: "redacao" }] }));
    const st = s.getState();
    expect(st.learning.completedLessons[MICRO[0]].pulo).toBeUndefined();
    expect(st.learning.completedLessons[MICRO[0]].stars).toBe(3);
    expect(st.progress.lessons[LEGADO[0]]).toMatchObject({ pulo: true });
  });

  test("habilidade sem questão: revisão em até 3 dias, sem adiar a que vence antes; o domínio não muda", async () => {
    const s = await loja();
    s.setState((st) => {
      st.learning.reviewSchedule["h:cedo"] = { skillId: "h:cedo", intervalDays: 1, dueDate: "2026-10-16", lastResult: "correct" };
      st.learning.reviewSchedule["h:tarde"] = { skillId: "h:tarde", intervalDays: 14, dueDate: "2026-10-30", lastResult: "correct" };
      return st;
    });
    s.aplicarPuloNoAparelho(passou({ semQuestao: ["h:nova", "h:cedo", "h:tarde"] }));
    const agenda = s.getState().learning.reviewSchedule;
    expect(agenda["h:nova"].dueDate).toBe("2026-10-18");
    expect(agenda["h:cedo"].dueDate).toBe("2026-10-16");
    expect(agenda["h:tarde"].dueDate).toBe("2026-10-18");
    expect(s.getState().learning.skillModel["h:nova"]).toBeUndefined();
  });

  test("não passou: nada marcado, nada agendado, o bloco conta", async () => {
    const s = await loja();
    s.aplicarPuloNoAparelho(passou({ passou: false, licoesPuladas: [], xp: 0, semQuestao: ["h:x"] }));
    const st = s.getState();
    expect(Object.keys(st.learning.completedLessons)).toHaveLength(0);
    expect(st.learning.reviewSchedule["h:x"]).toBeUndefined();
    expect(s.atividadeHoje(st).completedBlockIds).toHaveLength(1);
  });
});

describe("lição pulada feita depois", () => {
  test("microlição: paga o XP normal da primeira conclusão e deixa de ser pulada", async () => {
    const s = await loja();
    s.aplicarPuloNoAparelho(passou());
    const r = s.completeMicroLesson(MICRO[0], 1, 4, 4);
    expect(r).toMatchObject({ xpAwarded: 30, alreadyCompleted: false, stars: 3 });
    expect(s.getState().learning.completedLessons[MICRO[0]].pulo).toBeUndefined();
  });

  test("lição legada: idem", async () => {
    const s = await loja();
    s.aplicarPuloNoAparelho(passou({ licoesPuladas: [{ id: LEGADO[0], tipo: "redacao" }] }));
    const r = s.completeLesson(LEGADO[0], 1, 2);
    expect(r.first).toBe(true);
    expect(r.xpAwarded).toBe(10);
    expect(s.getState().progress.lessons[LEGADO[0]].pulo).toBeUndefined();
  });
});

describe("servidor já sabe", () => {
  const tentativa = (over: Partial<Attempt> = {}): Attempt => ({
    id: `pulo-teste-1-0`,
    sessionId: "pulo:pulo-teste-1",
    exerciseId: "q1",
    exerciseVersion: 1,
    skillIds: ["mat:porcentagem-valor"],
    role: "pratica",
    answer: null,
    correct: true,
    hintUsed: false,
    tutorUsed: false,
    firstSubmission: true,
    submittedAt: "2026-10-15T13:00:00.000Z",
    localDate: "2026-10-15",
    durationMs: 1000,
    source: "pulo",
    ...over,
  });

  test("resposta do teste entra no modelo/evidência mas não vai para a outbox", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    s.recordLearningAttempt(tentativa());
    expect(s.getState().account!.outbox).toHaveLength(0);
    expect(s.getState().learning.recentAttempts).toHaveLength(1);
    expect(s.getState().learning.skillEvidence["mat:porcentagem-valor"]).toBeDefined();
  });

  test("importação não leva lição pulada nem resposta do teste (pagariam XP de novo)", async () => {
    const s = await loja();
    s.recordLearningAttempt(tentativa());
    s.aplicarPuloNoAparelho(passou());
    s.completeMicroLesson(MICRO[0], 1, 4, 4); // esta é de verdade
    const p = s.montarPedidoImportacao();
    expect(p.licoes.map((l) => l.licaoId)).toEqual([MICRO[0]]);
    expect(p.respostas).toHaveLength(0);
  });
});

describe("migração", () => {
  test("o campo pulo sobrevive à carga, sem subir a versão do estado", async () => {
    const salvo = JSON.stringify({
      schemaVersion: 6,
      authed: true,
      onboarded: true,
      prefs: { name: "Ana" },
      progress: { xp: 10, lessons: { [LEGADO[0]]: { lessonId: LEGADO[0], stars: 1, bestPct: 0, completedAt: "2026-10-15T10:00:00.000Z", pulo: true } } },
      learning: { completedLessons: { [MICRO[0]]: { version: 1, completedAt: "2026-10-15T10:00:00.000Z", stars: 1, bestPct: 0, pulo: true } } },
    });
    const s = await loja({ [KEY]: salvo });
    const st = s.getState();
    expect(st.schemaVersion).toBe(6);
    expect(st.learning.completedLessons[MICRO[0]].pulo).toBe(true);
    expect(st.progress.lessons[LEGADO[0]].pulo).toBe(true);
  });
});

describe("trilha", () => {
  function estado(completed: AppState["learning"]["completedLessons"] = {}): AppState {
    return {
      prefs: { trailSubjectId: "por" },
      progress: { lessons: {} },
      learning: { ...learningStateVazio(), completedLessons: completed },
    } as unknown as AppState;
  }
  const capitulos = (m: ReturnType<typeof buildTrail>) => m.subjects.find((x) => x.id === "por")!.sections.flatMap((x) => x.chapters);

  test("aluno novo: 'Pular para cá' só no 2º capítulo da matéria, nunca na redação", () => {
    const m = buildTrail(estado(), "2026-10-15");
    expect(capitulos(m).filter((c) => c.puloAqui).map((c) => c.id)).toEqual([POR[1].id]);
    const red = m.subjects.find((x) => x.id === "red")!;
    expect(red.sections.flatMap((x) => x.chapters).some((c) => c.puloAqui)).toBe(false);
  });

  test("depois de pular: nós 'Pulada' sem estrelas, capítulo concluído, e o alvo anda", () => {
    const pulos = Object.fromEntries(MICRO.map((id) => [id, { version: 1, completedAt: "2026-10-15T10:00:00.000Z", stars: 1 as const, bestPct: 0, pulo: true as const }]));
    const m = buildTrail(estado(pulos), "2026-10-15");
    const [primeiro, segundo, terceiro] = capitulos(m);
    expect(primeiro.status).toBe("completed");
    for (const node of primeiro.nodes.filter((x) => x.kind !== "revisao")) {
      expect(node.pulada).toBe(true);
      expect(node.stars).toBeUndefined();
      expect(estadoLabel(node)).toBe("Pulada");
    }
    expect(segundo.puloAqui).toBeUndefined();
    expect(terceiro.puloAqui).toBe(true);
  });
});

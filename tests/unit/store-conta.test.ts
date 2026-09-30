import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { PlannedActivity } from "@/lib/adaptive/types";
import { definirUsuarioDaSessao, reiniciarParaTestes } from "@/lib/conta/usuario-da-sessao";
import type { Attempt } from "@/lib/learning/types";
import { eventoEstudo } from "@/lib/sync/contrato";
import { pedidoImportacao } from "@/lib/sync/importacao";

/**
 * Conta no aparelho (docs/specs/46-producao T-06.4, T-07.2): outbox de eventos, vínculo com a conta, aparelho
 * compartilhado (estado de outra conta nunca aparece), agregado do servidor, documento de planejamento, importação e
 * sair da conta. Mesmo ambiente falso de `store-persist.test.ts`: `localStorage` num Map e um módulo de store novo
 * por teste.
 */

type Store = typeof import("@/lib/store");
const KEY = "foca.state.v3";
const g = globalThis as unknown as Record<string, unknown>;

let dados: Map<string, string>;
let n = 0;

function instalar(inicial: Record<string, string> = {}) {
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
}

async function loja(inicial: Record<string, string> = {}, opts: { hidratar?: boolean } = {}): Promise<Store> {
  instalar(inicial);
  n += 1;
  const store = (await import(`@/lib/store?conta=${n}`)) as Store;
  if (opts.hidratar !== false) store.hydrate();
  return store;
}

function tentativa(over: Partial<Attempt> = {}): Attempt {
  return {
    id: `at-${Math.random().toString(36).slice(2)}`,
    sessionId: null,
    exerciseId: "q1",
    exerciseVersion: 1,
    skillIds: ["mat:porcentagem-valor"],
    role: "pratica",
    answer: 2,
    correct: true,
    hintUsed: false,
    tutorUsed: false,
    firstSubmission: true,
    submittedAt: "2026-09-29T13:00:00.000Z",
    localDate: "2026-09-29",
    durationMs: 1200,
    source: "estudo",
    ...over,
  };
}

function atividade(over: Partial<PlannedActivity> = {}): PlannedActivity {
  return {
    id: "atv-2026-09-29-abc",
    kind: "pratica",
    skillIds: ["mat:porcentagem-valor"],
    subjectId: "matematica",
    itemIds: ["q1", "q2"],
    estimatedMinutes: 4,
    reasons: ["consolidar"],
    score: 1,
    scoreBreakdown: {},
    ...over,
  };
}

/** Estado salvo de uma conta, como o aparelho deixaria. */
function estadoSalvoDe(userId: string, extra: Record<string, unknown> = {}): string {
  return JSON.stringify({
    schemaVersion: 6,
    authed: true,
    onboarded: true,
    prefs: { name: "Ana" },
    progress: { xp: 300, lessons: { "redacao-1": { lessonId: "redacao-1", stars: 3, bestPct: 100, completedAt: "2026-09-20T10:00:00.000Z" } } },
    account: { userId, outbox: [], docRev: 4, docAssinatura: "x", aparelhoId: "aparelho-ana-123" },
    ...extra,
  });
}

beforeEach(() => reiniciarParaTestes());
afterEach(() => {
  delete g.window;
  delete g.localStorage;
  reiniciarParaTestes();
});

describe("outbox", () => {
  test("sem conta vinculada, estudar não enfileira nada (o que foi feito antes da conta vai pela importação)", async () => {
    const s = await loja();
    s.recordLearningAttempt(tentativa());
    expect(s.getState().account?.outbox ?? []).toHaveLength(0);
  });

  test("com conta: resposta vira evento válido pelo contrato, com a fonte certa e sem campo de XP", async () => {
    const s = await loja();
    expect(s.vincularConta("user-a")).toBe("vinculado");
    s.recordLearningAttempt(tentativa({ id: "at-1759150000000-123", source: "estudo", answer: 3 }));
    s.recordLearningAttempt(tentativa({ source: "legado", exerciseId: "redacao:x:1", response: "dont-know", answer: null }));
    s.recordLearningAttempt(tentativa({ source: "microlicao", presentedOrder: ["b", "a"], answer: [1, 0] }));
    const outbox = s.getState().account!.outbox;
    expect(outbox.map((e) => (e.tipo === "resposta" ? e.fonte : e.tipo))).toEqual(["questao-geral", "redacao", "licao"]);
    for (const e of outbox) expect(eventoEstudo.safeParse(e).success).toBe(true);
    expect(outbox[1]).toMatchObject({ resposta: null });
    expect(outbox[2]).toMatchObject({ resposta: [1, 0], exibidos: ["b", "a"] });
    expect(JSON.stringify(outbox)).not.toMatch(/"xp"|"correct"|"correta"/);
  });

  test("a letra gravada pela aula de 60 s vira o índice que o servidor corrige (A = 0, na ordem do banco)", async () => {
    const { QUESTIONS } = await import("@/data/questions");
    for (const q of QUESTIONS) expect(q.alternatives.map((a) => a.key).join("")).toBe("ABCDE".slice(0, q.alternatives.length));
    const s = await loja();
    s.vincularConta("user-a");
    s.recordLearningAttempt(tentativa({ answer: "B" }));
    expect(s.getState().account!.outbox[0]).toMatchObject({ resposta: 1 });
  });

  test("a mesma tentativa duas vezes vira um evento só (o id do evento é o da tentativa)", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    const t = tentativa({ id: "at-fixo-123" });
    s.recordLearningAttempt(t);
    s.recordLearningAttempt(t);
    expect(s.getState().account!.outbox).toHaveLength(1);
  });

  test("resposta de atividade da trilha leva a tentativa (attemptKey); a conclusão também", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    const ativa = s.startJourneyActivity(atividade());
    s.recordLearningAttempt(tentativa({ source: "atividade" }));
    s.completeJourneyActivity(ativa, 1, 1);
    const [resp, fim] = s.getState().account!.outbox;
    expect(resp).toMatchObject({ tipo: "resposta", fonte: "atividade" });
    expect(fim).toMatchObject({ tipo: "atividade-concluida", kind: "pratica" });
    expect(resp.tipo === "resposta" && resp.attemptKey).toBe(fim.tipo === "atividade-concluida" && fim.attemptKey);
    expect(eventoEstudo.safeParse(fim).success).toBe(true);
  });

  test("lições, aula de 60 s e lote de flashcards viram eventos válidos", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    s.completeLesson("redacao-1", 3, 4);
    s.completeMicroLesson("aula-1", 2, 4, 4);
    s.registrarAulaConcluida();
    s.registrarLoteFlashcardsConcluido();
    const tipos = s.getState().account!.outbox.map((e) => (e.tipo === "bloco-concluido" ? e.bloco : e.tipo));
    expect(tipos).toEqual(["licao-concluida", "licao-concluida", "aula-60s", "flashcards"]);
    for (const e of s.getState().account!.outbox) expect(eventoEstudo.safeParse(e).success).toBe(true);
  });

  test("o bônus de entrada do onboarding vai para o servidor ao vincular", async () => {
    const s = await loja();
    s.completeQuiz([], []);
    expect(s.vincularConta("user-a")).toBe("vinculado");
    expect(s.getState().account!.outbox).toMatchObject([{ tipo: "entrada" }]);
  });

  test("a outbox tem teto: sem conexão por muito tempo, os eventos mais antigos saem", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    for (let i = 0; i < s.LIMITE_OUTBOX + 5; i++) s.registrarAulaConcluida();
    expect(s.getState().account!.outbox).toHaveLength(s.LIMITE_OUTBOX);
  });

  test("removerDaOutbox tira só o que o servidor aplicou ou recusou", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    s.registrarAulaConcluida();
    s.registrarAulaConcluida();
    const [a] = s.getState().account!.outbox;
    s.removerDaOutbox([a.id]);
    expect(s.getState().account!.outbox).toHaveLength(1);
  });
});

describe("agregado do servidor", () => {
  const agregado = { xp: 120, sequencia: 3, melhorSequencia: 5, congelamentos: 1, ultimoDia: "2026-09-29", diasComAtividade: 4 };

  test("XP e sequência do servidor substituem os locais quando não há nada pendente", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    s.aplicarAgregadoDoServidor(agregado);
    const p = s.getState().progress;
    expect([p.xp, p.streak, p.bestStreak, p.streakFreezes]).toEqual([120, 3, 5, 1]);
    expect(p.lastStudyDate).toBe(new Date("2026-09-29T12:00:00").toDateString());
  });

  test("com evento pendente, o número local (otimista) fica até o envio", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    s.registrarAulaConcluida();
    const antes = s.getState().progress.xp;
    s.aplicarAgregadoDoServidor(agregado);
    expect(s.getState().progress.xp).toBe(antes);
  });
});

describe("documento de planejamento", () => {
  test("sem conta não há documento; com conta, sai sem recompensas, sem conversa com a IA e sem e-mail", async () => {
    const s = await loja();
    expect(s.documentoParaSincronizar()).toBeNull();
    s.vincularConta("user-a");
    s.pushTutorMessage({ role: "user", content: "segredo da conversa" } as never);
    const d = s.documentoParaSincronizar()!;
    const texto = JSON.stringify(d.doc);
    expect(texto).not.toContain("segredo da conversa");
    expect(d.doc).not.toHaveProperty("tutor");
    expect((d.doc as { progress: object }).progress).not.toHaveProperty("xp");
    expect((d.doc as { prefs: object }).prefs).not.toHaveProperty("email");
    expect(texto.length).toBeLessThan(512 * 1024);
  });

  test("depois de salvo, só volta a sair quando algo muda", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    const d = s.documentoParaSincronizar()!;
    s.marcarDocumentoSalvo(1, d.assinatura);
    expect(s.documentoParaSincronizar()).toBeNull();
    s.setTrailSubject("matematica");
    expect(s.documentoParaSincronizar()?.rev).toBe(1);
  });

  test("aparelho novo adota o documento do servidor; aparelho com mudança local não é sobrescrito", async () => {
    const novo = await loja();
    novo.vincularConta("user-a");
    novo.aplicarDocumentoDoServidor({ rev: 3, schemaVersion: 6, doc: { onboarded: true, prefs: { trailSubjectId: "biologia" } } });
    expect(novo.getState().prefs.trailSubjectId).toBe("biologia");
    expect(novo.getState().account!.docRev).toBe(3);

    const usado = await loja();
    usado.vincularConta("user-a");
    const d = usado.documentoParaSincronizar()!;
    usado.marcarDocumentoSalvo(1, d.assinatura);
    usado.setTrailSubject("fisica"); // mudança local ainda não salva
    usado.aplicarDocumentoDoServidor({ rev: 2, schemaVersion: 6, doc: { prefs: { trailSubjectId: "biologia" } } });
    expect(usado.getState().prefs.trailSubjectId).toBe("fisica");
    expect(usado.getState().account!.docRev).toBe(2);
  });
});

describe("vínculo e aparelho compartilhado", () => {
  test("estudo de antes da conta não é vinculado em silêncio: a tela de importação decide", async () => {
    const s = await loja();
    s.recordLearningAttempt(tentativa());
    definirUsuarioDaSessao("user-a");
    expect(s.getState().account?.userId ?? null).toBeNull();
    expect(s.precisaDecidirImportacao()).toBe(true);
    expect(s.vincularConta("user-a")).toBe("tem-progresso-antigo");
  });

  test("começar do zero apaga o estudo de antes e vincula", async () => {
    const s = await loja();
    s.recordLearningAttempt(tentativa());
    expect(s.vincularConta("user-a", { descartarProgressoAntigo: true })).toBe("vinculado");
    expect(s.getState().learning.recentAttempts).toHaveLength(0);
    expect(s.getState().account?.userId).toBe("user-a");
  });

  test("aparelho sem estudo vincula sozinho quando a sessão é confirmada", async () => {
    const s = await loja();
    definirUsuarioDaSessao("user-a");
    expect(s.getState().account?.userId).toBe("user-a");
    expect(s.precisaDecidirImportacao()).toBe(false);
  });

  test("abrir o app com a sessão de OUTRA conta: o estado salvo some antes de qualquer tela ler (primeira carga)", async () => {
    definirUsuarioDaSessao("user-b");
    const s = await loja({ [KEY]: estadoSalvoDe("user-a"), "foca.state.backup.before-v6": "{}", "foca.state.corrupt.2026": "{" });
    expect(s.getState().progress.lessons).toEqual({});
    expect(s.getState().prefs.name).toBe("");
    expect(s.getState().account?.userId).toBe("user-b");
    expect([...dados.keys()].filter((k) => k !== KEY)).toEqual([]);
    expect(dados.get(KEY)).not.toContain("Ana");
  });

  test("trocar de conta com o app aberto (navegação no cliente) também apaga", async () => {
    const s = await loja({ [KEY]: estadoSalvoDe("user-a") });
    definirUsuarioDaSessao("user-a");
    expect(s.getState().prefs.name).toBe("Ana");
    definirUsuarioDaSessao("user-b");
    expect(s.getState().prefs.name).toBe("");
    expect(s.getState().account?.userId).toBe("user-b");
  });

  test("a mesma conta de volta: nada é apagado", async () => {
    definirUsuarioDaSessao("user-a");
    const s = await loja({ [KEY]: estadoSalvoDe("user-a") });
    expect(s.getState().prefs.name).toBe("Ana");
    expect(s.getState().account?.docRev).toBe(4);
  });

  test("`account` corrompido no storage vira 'sem conta' sem quebrar o boot", async () => {
    const s = await loja({ [KEY]: estadoSalvoDe("x", { account: { userId: 42, outbox: "lixo", aparelhoId: "../../" } }) });
    const conta = s.getState().account!;
    expect(conta.userId).toBeNull();
    expect(conta.outbox).toEqual([]);
    expect(conta.aparelhoId).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });
});

describe("importação e saída", () => {
  test("o pedido de importação passa no contrato do servidor e tem id estável por aparelho", async () => {
    const s = await loja();
    s.completeQuiz([], []);
    s.recordLearningAttempt(tentativa({ id: "at-1759150000000-9" }));
    s.recordLearningAttempt(tentativa({ response: "dont-know", answer: null }));
    s.completeLesson("redacao-1", 3, 4);
    s.completeMicroLesson("aula-1", 1, 4, 4);
    const p = s.montarPedidoImportacao();
    expect(pedidoImportacao.safeParse(p).success).toBe(true);
    expect(p).toMatchObject({ bonusDeEntrada: true, xpNoAparelho: s.getState().progress.xp });
    expect(p.respostas).toHaveLength(2);
    expect(p.licoes.map((l) => l.tipoLicao).sort()).toEqual(["micro", "redacao"]);
    expect(s.montarPedidoImportacao().importId).toBe(p.importId);
  });

  test("concluir a importação vincula, adota o agregado do servidor e apaga as cópias antigas", async () => {
    const s = await loja({ "foca.state.backup.before-v6": "{}" });
    s.recordLearningAttempt(tentativa());
    s.concluirImportacao("user-a", { xp: 15, sequencia: 1, melhorSequencia: 1, congelamentos: 1, ultimoDia: "2026-09-29", diasComAtividade: 1 });
    expect(s.getState().account?.userId).toBe("user-a");
    expect(s.getState().progress.xp).toBe(15);
    expect(s.getState().learning.recentAttempts).toHaveLength(1);
    expect(dados.has("foca.state.backup.before-v6")).toBe(false);
  });

  test("sair da conta apaga o estado do aparelho, os backups e as cópias corrompidas", async () => {
    const s = await loja({ [KEY]: estadoSalvoDe("user-a"), "foca.state.backup.before-learning-v4": "{}", "foca.state.corrupt.x": "{" });
    s.logout();
    expect(s.getState().prefs.name).toBe("");
    expect(s.getState().account).toBeUndefined();
    expect([...dados.keys()]).toEqual([KEY]);
    expect(dados.get(KEY)).not.toContain("Ana");
  });
});

describe("sessão conhecida pelo aparelho", () => {
  test("depois de sair, a conta da carga anterior não volta pela renderização da raiz", async () => {
    const { esquecerUsuarioDaSessao, informarUsuarioDaPrimeiraCarga, usuarioDaSessao } = await import("@/lib/conta/usuario-da-sessao");
    informarUsuarioDaPrimeiraCarga("user-a");
    expect(usuarioDaSessao()).toBe("user-a");
    esquecerUsuarioDaSessao();
    informarUsuarioDaPrimeiraCarga("user-a");
    expect(usuarioDaSessao()).toBeNull();
    definirUsuarioDaSessao("user-b"); // a guarda confirmou uma sessão nova
    expect(usuarioDaSessao()).toBe("user-b");
  });

  test("sair não revincula o aparelho à conta que acabou de sair", async () => {
    const s = await loja();
    definirUsuarioDaSessao("user-a");
    expect(s.getState().account?.userId).toBe("user-a");
    const { esquecerUsuarioDaSessao, informarUsuarioDaPrimeiraCarga } = await import("@/lib/conta/usuario-da-sessao");
    s.logout();
    esquecerUsuarioDaSessao();
    informarUsuarioDaPrimeiraCarga("user-a");
    expect(s.getState().account).toBeUndefined();
  });
});

describe("tamanho do documento", () => {
  test("com o máximo de tentativas locais, o documento leva só as 200 mais recentes e fica bem abaixo de 512 KB", async () => {
    const s = await loja();
    s.vincularConta("user-a");
    for (let i = 0; i < 500; i++) s.recordLearningAttempt(tentativa({ id: `at-volume-${i}`, exerciseId: `q${(i % 50) + 1}` }));
    const d = s.documentoParaSincronizar()!;
    expect((d.doc as { learning: { recentAttempts: unknown[] } }).learning.recentAttempts).toHaveLength(200);
    expect(JSON.stringify(d.doc).length).toBeLessThan(256 * 1024);
  });
});

import { afterEach, beforeEach, describe, expect, test } from "bun:test";

/**
 * Persistência local sem perda silenciosa (docs/36 Fase 5): T-05.1 (RF-14,
 * falha de gravação e versão futura), T-05.2 (RF-15, duas abas) e T-05.3
 * (RF-16, JSON corrompido).
 *
 * O store guarda `state`/`loaded`/`runtime` em variáveis de módulo e só
 * enxerga `window`/`localStorage` como globais. Para cada teste: ambiente
 * falso (Map + `window.addEventListener` que captura o handler de `storage`)
 * e uma INSTÂNCIA NOVA do módulo (`?n=…` no import), então nenhum teste
 * contamina outro nem os demais arquivos do `bun test` (que rodam sem
 * `window`; o ambiente falso é removido em `afterEach`).
 */

type Store = typeof import("@/lib/store");

const KEY = "foca.state.v3";
const g = globalThis as unknown as Record<string, unknown>;

interface FakeLS {
  data: Map<string, string>;
  falhar: boolean;
  gravacoes: number;
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
  key(i: number): string | null;
  readonly length: number;
}

let ls: FakeLS;
let handlers: Array<(e: { key: string | null; newValue: string | null }) => void>;
let n = 0;

function instalar(inicial: Record<string, string> = {}) {
  handlers = [];
  ls = {
    data: new Map(Object.entries(inicial)),
    falhar: false,
    gravacoes: 0,
    getItem(k) {
      return this.data.has(k) ? this.data.get(k)! : null;
    },
    setItem(k, v) {
      if (this.falhar) throw new Error("QuotaExceededError");
      this.gravacoes += 1;
      this.data.set(k, v);
    },
    removeItem(k) {
      this.data.delete(k);
    },
    key(i) {
      return [...this.data.keys()][i] ?? null;
    },
    get length() {
      return this.data.size;
    },
  };
  g.localStorage = ls;
  g.window = {
    location: { search: "" },
    addEventListener: (tipo: string, fn: (e: never) => void) => {
      if (tipo === "storage") handlers.push(fn as never);
    },
  };
}

async function novaLoja(): Promise<Store> {
  n += 1;
  return (await import(`@/lib/store?persist=${n}`)) as Store;
}

async function comStorage(inicial: Record<string, string> = {}): Promise<Store> {
  instalar(inicial);
  const store = await novaLoja();
  store.hydrate();
  return store;
}

afterEach(() => {
  delete g.window;
  delete g.localStorage;
});

describe("T-05.1 — falha de gravação visível (RF-14)", () => {
  test("setItem que lança: status vira 'falhou', o estado em memória segue correto", async () => {
    const store = await comStorage();
    expect(store.getRuntimeStatus().persist).toBe("ok");
    ls.falhar = true;
    store.setState((s) => {
      s.progress.xp = 120;
      return s;
    });
    expect(store.getRuntimeStatus().persist).toBe("falhou");
    expect(store.getState().progress.xp).toBe(120); // memória correta
    expect(ls.getItem(KEY)).toBeNull(); // nada foi gravado, e nada finge que foi
  });

  test("retryPersist devolve false enquanto falha e true (status 'ok') quando volta a gravar", async () => {
    const store = await comStorage();
    ls.falhar = true;
    store.setState((s) => {
      s.progress.xp = 50;
      return s;
    });
    expect(store.retryPersist()).toBe(false);
    expect(store.getRuntimeStatus().persist).toBe("falhou");

    ls.falhar = false;
    expect(store.retryPersist()).toBe(true);
    expect(store.getRuntimeStatus().persist).toBe("ok");
    expect(JSON.parse(ls.getItem(KEY)!).progress.xp).toBe(50); // o que estava só em memória foi gravado
  });

  test("a próxima gravação automática que der certo também limpa o status", async () => {
    const store = await comStorage();
    ls.falhar = true;
    store.setState((s) => {
      s.progress.xp = 10;
      return s;
    });
    expect(store.getRuntimeStatus().persist).toBe("falhou");
    ls.falhar = false;
    store.setState((s) => {
      s.progress.xp = 20;
      return s;
    });
    expect(store.getRuntimeStatus().persist).toBe("ok");
    expect(JSON.parse(ls.getItem(KEY)!).progress.xp).toBe(20);
  });

  test("falha já na gravação do boot (migração de volta) também aparece", async () => {
    instalar({ [KEY]: JSON.stringify({ progress: { xp: 30 } }) });
    ls.falhar = true;
    const store = await novaLoja();
    store.hydrate();
    expect(store.getRuntimeStatus().persist).toBe("falhou");
    expect(store.getState().progress.xp).toBe(30);
  });

  test("storage de versão futura: status 'versao-futura', memória muda, chave principal intacta (RU-6)", async () => {
    const futuro = JSON.stringify({ schemaVersion: 99, progress: { xp: 777 }, campoDaVersaoNova: { a: 1 } });
    const store = await comStorage({ [KEY]: futuro });
    expect(store.getRuntimeStatus().persist).toBe("versao-futura");
    const gravacoesAntes = ls.gravacoes;

    store.setState((s) => {
      s.progress.xp += 5;
      return s;
    });
    expect(store.getState().progress.xp).toBe(782); // a sessão segue funcionando em memória
    expect(ls.getItem(KEY)).toBe(futuro); // nada por cima da versão futura
    expect(ls.gravacoes).toBe(gravacoesAntes);
    expect(store.retryPersist()).toBe(false);
    expect(store.getRuntimeStatus().persist).toBe("versao-futura");
  });
});

describe("T-05.2 — duas abas (RF-15)", () => {
  test("evento 'storage' da nossa chave: a aba adota o estado gravado pela outra, sem regravar", async () => {
    const store = await comStorage();
    store.setState((s) => {
      s.progress.xp = 100;
      return s;
    });
    expect(handlers.length).toBe(1);
    const gravacoes = ls.gravacoes;

    // A outra aba concluiu mais coisa e gravou.
    const daOutraAba = JSON.stringify({ ...JSON.parse(ls.getItem(KEY)!), progress: { ...store.getState().progress, xp: 900, streak: 4 } });
    handlers[0]!({ key: KEY, newValue: daOutraAba });

    expect(store.getState().progress.xp).toBe(900);
    expect(store.getState().progress.streak).toBe(4);
    expect(ls.gravacoes).toBe(gravacoes); // adotar NÃO grava (senão as abas trocariam escritas para sempre)
  });

  test("a mutação seguinte parte do estado adotado e não apaga o progresso da outra aba", async () => {
    const store = await comStorage();
    const daOutraAba = await (async () => {
      const bruto = JSON.parse(ls.getItem(KEY) ?? "{}");
      return JSON.stringify({ ...bruto, progress: { ...store.getState().progress, xp: 900 } });
    })();
    handlers[0]!({ key: KEY, newValue: daOutraAba });
    store.setState((s) => {
      s.progress.xp += 1;
      return s;
    });
    expect(store.getState().progress.xp).toBe(901);
    expect(JSON.parse(ls.getItem(KEY)!).progress.xp).toBe(901);
  });

  test("ignora outra chave, newValue nulo (outra aba limpou o storage) e JSON ilegível", async () => {
    const store = await comStorage();
    store.setState((s) => {
      s.progress.xp = 42;
      return s;
    });
    handlers[0]!({ key: "outra.chave", newValue: JSON.stringify({ progress: { xp: 1 } }) });
    handlers[0]!({ key: KEY, newValue: null });
    handlers[0]!({ key: null, newValue: null }); // localStorage.clear() em outra aba
    handlers[0]!({ key: KEY, newValue: "{quebrado" });
    handlers[0]!({ key: KEY, newValue: "[1,2]" });
    expect(store.getState().progress.xp).toBe(42);
  });

  test("estado de UI local (balão aberto e foco) sobrevive à adoção", async () => {
    const store = await comStorage();
    store.setState((s) => {
      s.tutor.open = true;
      s.tutor.autoSend = "oi";
      return s;
    });
    const daOutraAba = JSON.stringify({ progress: { xp: 5 }, tutor: { open: false, messages: [] } });
    handlers[0]!({ key: KEY, newValue: daOutraAba });
    expect(store.getState().progress.xp).toBe(5);
    expect(store.getState().tutor.open).toBe(true);
    expect(store.getState().tutor.autoSend).toBe("oi");
  });

  test("a outra aba gravou versão futura: não adota e trava as gravações desta aba (RU-6)", async () => {
    const store = await comStorage();
    store.setState((s) => {
      s.progress.xp = 8;
      return s;
    });
    handlers[0]!({ key: KEY, newValue: JSON.stringify({ schemaVersion: 99, progress: { xp: 1000 } }) });
    expect(store.getState().progress.xp).toBe(8);
    expect(store.getRuntimeStatus().persist).toBe("versao-futura");
  });

  test("listener registrado uma única vez por página, mesmo com hydrate() repetido", async () => {
    const store = await comStorage();
    store.hydrate();
    store.hydrate();
    expect(handlers.length).toBe(1);
  });
});

describe("T-05.3 — JSON corrompido (RF-16)", () => {
  test("bruto ilegível é copiado para foca.state.corrupt.<ISO> ANTES de qualquer gravação", async () => {
    const store = await comStorage({ [KEY]: "{quebrado" });
    const copias = [...ls.data.keys()].filter((k) => k.startsWith("foca.state.corrupt."));
    expect(copias.length).toBe(1);
    expect(ls.getItem(copias[0]!)).toBe("{quebrado");
    expect(ls.getItem(KEY)).toBe("{quebrado"); // a chave principal ainda não foi tocada
    expect(store.getRuntimeStatus().recuperouCorrompido).toBe(true);
    // A cópia é uma chave ISO válida, à parte do `foca.state.v3`.
    expect(copias[0]!.slice("foca.state.corrupt.".length)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("recargas com o mesmo bruto ilegível não acumulam cópias (achado D-001 da revisão de segurança)", async () => {
    await comStorage({ [KEY]: "{quebrado" });
    const copiasAntes = [...ls.data.keys()].filter((k) => k.startsWith("foca.state.corrupt."));
    expect(copiasAntes.length).toBe(1);
    // Nova carga com o mesmo storage (recarga sem interação): a cópia idêntica já existe.
    const dados = Object.fromEntries(ls.data.entries());
    await comStorage(dados);
    const copiasDepois = [...ls.data.keys()].filter((k) => k.startsWith("foca.state.corrupt."));
    expect(copiasDepois.length).toBe(1);
  });

  test("estado padrão em memória; a 1ª mutação grava na chave principal e a cópia continua lá", async () => {
    const store = await comStorage({ [KEY]: "{quebrado" });
    expect(store.getState().onboarded).toBe(false);
    store.setState((s) => {
      s.progress.xp = 15;
      return s;
    });
    expect(JSON.parse(ls.getItem(KEY)!).progress.xp).toBe(15);
    const copia = [...ls.data.keys()].find((k) => k.startsWith("foca.state.corrupt."));
    expect(copia && ls.getItem(copia)).toBe("{quebrado");
  });

  test("forma inesperada (array) também é guardada", async () => {
    await comStorage({ [KEY]: "[1,2,3]" });
    const copia = [...ls.data.keys()].find((k) => k.startsWith("foca.state.corrupt."));
    expect(copia && ls.getItem(copia)).toBe("[1,2,3]");
  });

  test("'Ok' dispensa o aviso; storage vazio ou válido não cria cópia nem aviso", async () => {
    const store = await comStorage({ [KEY]: "{quebrado" });
    store.dismissCorruptRecoveryNotice();
    expect(store.getRuntimeStatus().recuperouCorrompido).toBe(false);

    const vazio = await comStorage();
    expect(vazio.getRuntimeStatus().recuperouCorrompido).toBe(false);
    expect([...ls.data.keys()].some((k) => k.startsWith("foca.state.corrupt."))).toBe(false);

    const valido = await comStorage({ [KEY]: JSON.stringify({ progress: { xp: 1 } }) });
    expect(valido.getRuntimeStatus().recuperouCorrompido).toBe(false);
    expect([...ls.data.keys()].some((k) => k.startsWith("foca.state.corrupt."))).toBe(false);
  });

  test("se nem a cópia couber, o aviso sai e o app não quebra", async () => {
    instalar({ [KEY]: "{quebrado" });
    ls.falhar = true;
    const store = await novaLoja();
    store.hydrate();
    expect(store.getRuntimeStatus().recuperouCorrompido).toBe(true);
    expect(store.getState().progress.xp).toBe(0);
  });
});

describe("sem window (SSR e testes de motor)", () => {
  beforeEach(() => {
    delete g.window;
    delete g.localStorage;
  });
  test("gravar não acusa falha onde nunca houve tentativa", async () => {
    const store = await novaLoja();
    store.setState((s) => {
      s.progress.xp = 3;
      return s;
    });
    expect(store.getRuntimeStatus().persist).toBe("ok");
    expect(store.getState().progress.xp).toBe(3);
  });
});

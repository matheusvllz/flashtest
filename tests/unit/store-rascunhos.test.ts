import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { reiniciarParaTestes } from "@/lib/conta/usuario-da-sessao";

/**
 * Rascunhos das tarefas de escrita no store único (spec 50 §5.10.1, T-50.11.1): campo opcional e aditivo
 * (`rascunhosDeEscrita`, sem subir o schema, como `today.combo`), salvo no aparelho, lido sem confiar no formato,
 * apagado ao enviar e ao sair da conta. Nunca vai no documento sincronizado. Mesmo ambiente falso de
 * `store-conta.test.ts`: `localStorage` num Map e um módulo de store novo por teste.
 */

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
  const store = (await import(`@/lib/store?rascunhos=${n}`)) as Store;
  store.hydrate();
  return store;
}

const salvo = () => JSON.parse(dados.get(KEY) ?? "{}");

// Sem isto, o `window` falso vaza para os testes de servidor (o PGlite lê `window.location`).
beforeEach(() => reiniciarParaTestes());
afterEach(() => {
  delete g.window;
  delete g.localStorage;
  reiniciarParaTestes();
});

describe("rascunhos de escrita no store", () => {
  test("salva, mantém a versão do schema, sobrevive a recarregar e sai ao enviar", async () => {
    const s = await loja();
    const versao = s.getState().schemaVersion;
    s.salvarRascunhoDeEscrita("argumentacao-coesao", "Meu começo de texto", new Date("2026-10-15T12:00:00Z"));
    expect(salvo().rascunhosDeEscrita).toEqual({ "argumentacao-coesao": { texto: "Meu começo de texto", salvoEm: "2026-10-15T12:00:00.000Z" } });
    expect(salvo().schemaVersion).toBe(versao);

    const s2 = await loja(Object.fromEntries(dados));
    expect(s2.getState().rascunhosDeEscrita?.["argumentacao-coesao"]?.texto).toBe("Meu começo de texto");
    s2.apagarRascunhoDeEscrita("argumentacao-coesao");
    expect(s2.getState().rascunhosDeEscrita).toBeUndefined();
  });

  test("texto vazio apaga; id inválido é ignorado; texto longo é cortado", async () => {
    const s = await loja();
    s.salvarRascunhoDeEscrita("Id Ruim!", "x");
    expect(s.getState().rascunhosDeEscrita).toBeUndefined();
    s.salvarRascunhoDeEscrita("estrutura-texto-completo", "a".repeat(9000));
    expect(s.getState().rascunhosDeEscrita?.["estrutura-texto-completo"]?.texto.length).toBe(s.LIMITE_TEXTO_RASCUNHO);
    s.salvarRascunhoDeEscrita("estrutura-texto-completo", "   ");
    expect(s.getState().rascunhosDeEscrita).toBeUndefined();
  });

  test("lixo no storage vira 'sem rascunho' sem quebrar o boot; o rascunho não vai no documento do servidor", async () => {
    const s = await loja({
      [KEY]: JSON.stringify({ onboarded: true, rascunhosDeEscrita: { "ok-id": { texto: "bom", salvoEm: "2026-10-01" }, "<script>": { texto: "x" }, ruim: 3 } }),
    });
    expect(s.getState().rascunhosDeEscrita).toEqual({ "ok-id": { texto: "bom", salvoEm: "2026-10-01" } });
    expect(s.normalizarRascunhos("lixo")).toBeUndefined();
    expect(s.normalizarRascunhos([])).toBeUndefined();
    s.vincularConta("user-1");
    s.salvarRascunhoDeEscrita("ok-id", "bom de novo");
    const d = s.documentoParaSincronizar();
    expect(d).not.toBeNull();
    expect(JSON.stringify(d!.doc)).not.toContain("bom de novo");
  });

  test("sair da conta (limparAparelho) apaga os rascunhos", async () => {
    const s = await loja();
    s.salvarRascunhoDeEscrita("argumentacao-coesao", "texto");
    s.limparAparelho();
    expect(s.getState().rascunhosDeEscrita).toBeUndefined();
    expect(salvo().rascunhosDeEscrita).toBeUndefined();
  });
});

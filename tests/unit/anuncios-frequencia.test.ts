import { beforeEach, describe, expect, test } from "bun:test";

/** Frequência do retângulo depois da lição (spec 49 §5.4): nunca na 1ª do dia, 1 a cada 2, no máximo 3 por dia. */
const memoria = new Map<string, string>();
beforeEach(() => {
  memoria.clear();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => memoria.get(k) ?? null,
    setItem: (k: string, v: string) => void memoria.set(k, v),
    removeItem: (k: string) => void memoria.delete(k),
    clear: () => memoria.clear(),
    key: () => null,
    length: 0,
  } as Storage;
});

describe("retanguloNestaConclusao", () => {
  test("lições 1..10 do dia: aparece na 2ª, 4ª e 6ª e para em 3", async () => {
    const { retanguloNestaConclusao } = await import("@/lib/anuncios");
    const vistas = Array.from({ length: 10 }, () => retanguloNestaConclusao());
    expect(vistas).toEqual([false, true, false, true, false, true, false, false, false, false]);
  });
});

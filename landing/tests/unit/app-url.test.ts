import { describe, expect, test } from "bun:test";
import { appUrl, APP_DESTINOS } from "../../src/lib/app-url";

describe("appUrl", () => {
  test("monta o link a partir da base", () => {
    expect(appUrl("/quiz", "http://localhost:8080")).toBe("http://localhost:8080/quiz");
    expect(appUrl("quiz", "https://app.exemplo.com/")).toBe("https://app.exemplo.com/quiz");
  });

  test("preserva prefixo de caminho da base (topologia /app)", () => {
    expect(appUrl("/quiz", "https://exemplo.com/app")).toBe("https://exemplo.com/app/quiz");
  });

  test("a raiz do app termina em /", () => {
    expect(appUrl("/", "https://app.exemplo.com")).toBe("https://app.exemplo.com/");
  });

  test("base inválida falha cedo", () => {
    expect(() => appUrl("/quiz", "não é url")).toThrow();
  });

  test("destinos usados pela landing", () => {
    expect(APP_DESTINOS.comecar).toBe("/quiz");
    expect(APP_DESTINOS.entrar).toBe("/");
  });
});

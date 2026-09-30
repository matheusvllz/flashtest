import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { APP_DESTINOS } from "../../../src/marketing/lib/app-url";

// CTAs da landing levam a fluxos REAIS do produto (docs/44 §3): cada destino é uma rota que existe.
const ROTAS = resolve(import.meta.dir, "../../../src/routes");
const arquivoDaRota = (path: string) => `${path.slice(1).replace(/\//g, ".") || "index"}.tsx`;

describe("destinos da landing", () => {
  test("começar → /quiz, entrar → /login, quem já tem conta → /app", () => {
    expect(APP_DESTINOS).toEqual({ comecar: "/quiz", entrar: "/login", continuar: "/app" });
  });

  test("toda rota de destino existe em src/routes", () => {
    const arquivos = readdirSync(ROTAS);
    for (const destino of Object.values(APP_DESTINOS)) expect(arquivos).toContain(arquivoDaRota(destino));
  });

  test("/app decide pela sessão entre a home, o login e o onboarding; /welcome redireciona para a landing", () => {
    // Estudar exige conta (decisão 0006): com sessão vai para a home; sem, quem já estudou aqui vai ao login.
    const app = readFileSync(resolve(ROTAS, "app.tsx"), "utf8");
    expect(app).toContain('s.autenticado ? HOME_ROUTE : local.onboarded ? "/login" : "/quiz"');
    const welcome = readFileSync(resolve(ROTAS, "welcome.tsx"), "utf8");
    expect(welcome).toContain('redirect({ to: "/"');
  });

  test("nenhum link da landing aponta para # vazio ou URL absoluta do app", () => {
    const pasta = resolve(import.meta.dir, "../../../src/marketing");
    const tsx = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? tsx(resolve(dir, e.name)) : e.name.endsWith(".tsx") ? [resolve(dir, e.name)] : []));
    for (const f of tsx(pasta)) {
      const t = readFileSync(f, "utf8");
      expect(t, f).not.toMatch(/href="#"|localhost:8080|VITE_APP_URL/);
    }
  });
});

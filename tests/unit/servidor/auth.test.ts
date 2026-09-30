/**
 * Autenticação real sobre PGlite (docs/specs/46-producao T-05.8; modelo de ameaças T1–T4).
 * Nada é simulado aqui além do envio de e-mail (caixa de saída em memória).
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { user } from "../../../src/server/db/schema";
import { caixaDeSaida } from "../../../src/server/email";
import { ambiente, alunoVerificado, cadastroValido, cookieDe, ultimoLink, type Ambiente } from "./ajuda";

let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
});

describe("cadastro e verificação de e-mail", () => {
  test("cadastro manda o e-mail de verificação e não entra antes de verificar (403)", async () => {
    const r = await amb.post("/sign-up/email", cadastroValido("ana@teste.dev"));
    expect(r.status).toBe(200);
    expect(caixaDeSaida().at(-1)?.assunto).toBe("Confirme seu e-mail no Foca");
    const login = await amb.post("/sign-in/email", { email: "ana@teste.dev", password: "senha-bem-forte-123" });
    expect(login.status).toBe(403);
  });

  test("depois de verificar, entra; a sessão dura 30 dias e o cookie é HttpOnly e SameSite=Lax", async () => {
    await amb.post("/sign-up/email", cadastroValido("bia@teste.dev"));
    const v = await amb.get(ultimoLink("bia@teste.dev"));
    expect([200, 302]).toContain(v.status);
    const login = await amb.post("/sign-in/email", { email: "bia@teste.dev", password: "senha-bem-forte-123" });
    expect(login.status).toBe(200);
    const sessao = login.headers.getSetCookie().find((c) => c.includes("session_token"))!;
    expect(sessao).toContain("HttpOnly");
    expect(sessao).toContain("SameSite=Lax");
    expect(sessao).toContain(`Max-Age=${30 * 24 * 60 * 60}`);
    const s = await amb.auth.api.getSession({ headers: new Headers({ cookie: cookieDe(login) }) });
    expect(s?.user.email).toBe("bia@teste.dev");
  });

  // Com verificação de e-mail ligada, o Better Auth responde sucesso sintético a qualquer falha do
  // cadastro (anti-enumeração). A regra vale no servidor (a conta não é criada nem recebe e-mail);
  // o formulário confere a idade antes de enviar e mostra a mensagem explícita.
  test("idade abaixo da mínima (17): o servidor não cria a conta nem manda e-mail", async () => {
    const r = await amb.post("/sign-up/email", cadastroValido("nova@teste.dev", { birthYear: new Date().getFullYear() - 15 }));
    expect(r.status).toBe(200);
    expect(await amb.db.select().from(user).where(eq(user.email, "nova@teste.dev"))).toHaveLength(0);
    expect(caixaDeSaida().some((m) => m.para === "nova@teste.dev")).toBe(false);
  });

  test("sem aceitar a versão vigente dos termos, a conta não é criada", async () => {
    await amb.post("/sign-up/email", cadastroValido("sem@teste.dev", { termsVersion: "antiga" }));
    expect(await amb.db.select().from(user).where(eq(user.email, "sem@teste.dev"))).toHaveLength(0);
  });
});

describe("enumeração e força bruta (T1, T2)", () => {
  test("cadastro repetido responde igual a um cadastro novo (não revela que o e-mail existe)", async () => {
    const a = await amb.post("/sign-up/email", cadastroValido("rep@teste.dev"));
    const b = await amb.post("/sign-up/email", cadastroValido("rep@teste.dev", { password: "outra-senha-forte-9" }));
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
  });

  test("e-mail inexistente e senha errada dão a mesma resposta", async () => {
    await alunoVerificado(amb, "cris@teste.dev");
    const inexistente = await amb.post("/sign-in/email", { email: "ninguem@teste.dev", password: "qualquer-coisa-1" });
    const errada = await amb.post("/sign-in/email", { email: "cris@teste.dev", password: "qualquer-coisa-1" });
    expect(inexistente.status).toBe(errada.status);
    expect(await inexistente.text()).toBe(await errada.text());
  });

  test("a 4ª tentativa de login em 10 s do mesmo IP recebe 429", async () => {
    const ip = { "x-forwarded-for": "10.9.9.9" };
    const status: number[] = [];
    for (let i = 0; i < 5; i++) status.push((await amb.post("/sign-in/email", { email: "x@teste.dev", password: "errada-000000" }, ip)).status);
    expect(status.slice(0, 3)).toEqual([401, 401, 401]);
    expect(status[3]).toBe(429);
  });
});

describe("recuperação e sessões (T4)", () => {
  test("redefinir a senha revoga as sessões abertas", async () => {
    const { cookie } = await alunoVerificado(amb, "dani@teste.dev");
    const pedido = await amb.post("/request-password-reset", { email: "dani@teste.dev", redirectTo: "/redefinir-senha" });
    expect(pedido.status).toBe(200);
    expect(caixaDeSaida().at(-1)?.assunto).toBe("Redefina sua senha do Foca");
    const link = ultimoLink("dani@teste.dev");
    const token = new URL(link).pathname.split("/").pop()!;
    const r = await amb.post("/reset-password", { newPassword: "nova-senha-forte-456", token });
    expect(r.status).toBe(200);
    const s = await amb.auth.api.getSession({ headers: new Headers({ cookie }) });
    expect(s).toBeNull();
    const login = await amb.post("/sign-in/email", { email: "dani@teste.dev", password: "nova-senha-forte-456" });
    expect(login.status).toBe(200);
  });

  test("sair revoga a sessão no servidor", async () => {
    const { cookie } = await alunoVerificado(amb, "eva@teste.dev");
    const r = await amb.post("/sign-out", {}, { cookie });
    expect(r.status).toBe(200);
    expect(await amb.auth.api.getSession({ headers: new Headers({ cookie }) })).toBeNull();
  });
});

describe("configuração de produção", () => {
  test("em produção o rate limit fica ligado mesmo com AUTH_RATE_LIMIT_DESLIGADO", async () => {
    const antes = { ...process.env };
    try {
      Object.assign(process.env, {
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        DATABASE_URL: "pglite:memoria",
        BETTER_AUTH_SECRET: "x".repeat(48),
        BETTER_AUTH_URL: "https://foca.exemplo",
        AUTH_RATE_LIMIT_DESLIGADO: "true",
      });
      const { redefinirEnv, env } = await import("../../../src/server/env");
      redefinirEnv();
      expect(env().producao).toBe(true);
      const { authDeTeste } = await import("../../../src/server/auth");
      const a = authDeTeste(amb.db);
      expect(a.options.rateLimit?.enabled).toBe(true);
      expect(a.options.advanced?.useSecureCookies).toBe(true);
      expect(a.options.emailAndPassword?.enabled).toBe(false); // sem domínio, e-mail desligado em produção (D-10)
    } finally {
      process.env = antes;
      const { redefinirEnv } = await import("../../../src/server/env");
      redefinirEnv();
    }
  });

  test("produção sem banco e segredo: contas desligadas (modo de demonstração, D-15), sem abrir banco nem sessão", async () => {
    const antes = { ...process.env };
    try {
      for (const k of ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"]) delete process.env[k];
      Object.assign(process.env, { NODE_ENV: "production", VERCEL_ENV: "production" });
      const { redefinirEnv, env } = await import("../../../src/server/env");
      redefinirEnv();
      const e = env();
      expect(e.contasAtivas).toBe(false);
      expect(e.faltandoParaContas).toEqual(["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"]);
      expect(e.DATABASE_URL.startsWith("pglite:")).toBe(false); // nunca PGlite em disco na produção
      const { banco, definirBanco } = await import("../../../src/server/db/client");
      definirBanco(undefined);
      await expect(banco()).rejects.toThrow(/contas desligadas/);
      const { sessaoAtual } = await import("../../../src/server/http");
      expect(await sessaoAtual(new Headers({ cookie: "better-auth.session_token=qualquer" }))).toBeNull();

      // Preview da Vercel sem as variáveis: também modo de demonstração (disco só de leitura, sem PGlite).
      Object.assign(process.env, { VERCEL_ENV: "preview" });
      redefinirEnv();
      expect(env().producao).toBe(false);
      expect(env().contasAtivas).toBe(false);
      expect(env().DATABASE_URL.startsWith("pglite:")).toBe(false);
    } finally {
      process.env = antes;
      const { redefinirEnv } = await import("../../../src/server/env");
      redefinirEnv();
    }
  });
});

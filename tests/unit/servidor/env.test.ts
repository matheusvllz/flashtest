/**
 * Ambiente que não derruba o app (spec 48 D48-08, T-48.0.3). Incidente de 30/09/2026: em produção, uma variável
 * vazia ou inválida na Vercel fazia `env()` lançar e toda função de servidor responder 500.
 */
import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { env, redefinirEnv } from "../../../src/server/env";

const original = { ...process.env };
const CONTA = ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"];

function implantado(vars: Record<string, string>) {
  for (const k of CONTA) delete process.env[k];
  Object.assign(process.env, { NODE_ENV: "production", VERCEL_ENV: "production" }, vars);
  redefinirEnv();
}

afterEach(() => {
  process.env = { ...original };
  redefinirEnv();
});

const SEGREDO = "0123456789abcdef0123456789abcdef";
const BANCO = "postgresql://u:p@ep-x.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

describe("env em ambiente implantado", () => {
  test("variável opcional vazia conta como ausente (não derruba)", () => {
    implantado({ OPENAI_API_KEY: "", RESEND_API_KEY: "  ", AI_TETO_DIARIO_USD: "" });
    const e = env();
    expect(e.OPENAI_API_KEY).toBeUndefined();
    expect(e.RESEND_API_KEY).toBeUndefined();
    expect(e.AI_TETO_DIARIO_USD).toBe(1); // padrão
    expect(e.variaveisInvalidas).toEqual([]);
  });

  test("variável opcional inválida é ignorada, com aviso só do nome", () => {
    const aviso = spyOn(console, "warn").mockImplementation(() => {});
    implantado({ CRON_SECRET: "curto", MIN_ACCOUNT_AGE: "abc", AUTH_EMAIL_HABILITADO: "talvez" });
    const e = env();
    expect(e.CRON_SECRET).toBeUndefined();
    expect(e.MIN_ACCOUNT_AGE).toBe(17);
    expect(e.variaveisInvalidas).toEqual(["AUTH_EMAIL_HABILITADO", "MIN_ACCOUNT_AGE", "CRON_SECRET"]); // ordem do esquema
    const linhas = aviso.mock.calls.map((c) => String(c[0])).join("\n");
    expect(linhas).toContain("CRON_SECRET");
    expect(linhas).not.toContain("curto"); // nunca o valor
    aviso.mockRestore();
  });

  test("variável de conta inválida desliga as contas em vez de lançar", () => {
    const aviso = spyOn(console, "warn").mockImplementation(() => {});
    implantado({ DATABASE_URL: BANCO, BETTER_AUTH_SECRET: SEGREDO, BETTER_AUTH_URL: "focaedu.com" });
    const e = env();
    expect(e.contasAtivas).toBe(false);
    expect(e.faltandoParaContas).toEqual(["BETTER_AUTH_URL"]);
    expect(e.variaveisInvalidas).toEqual(["BETTER_AUTH_URL"]);
    aviso.mockRestore();
  });

  test("segredo curto desliga as contas", () => {
    const aviso = spyOn(console, "warn").mockImplementation(() => {});
    implantado({ DATABASE_URL: BANCO, BETTER_AUTH_SECRET: "curto", BETTER_AUTH_URL: "https://focaedu.com" });
    expect(env().contasAtivas).toBe(false);
    expect(env().faltandoParaContas).toEqual(["BETTER_AUTH_SECRET"]);
    aviso.mockRestore();
  });

  test("espaços em volta são removidos; tudo válido liga as contas", () => {
    implantado({ DATABASE_URL: ` ${BANCO} `, BETTER_AUTH_SECRET: SEGREDO, BETTER_AUTH_URL: "https://focaedu.com/ " });
    const e = env();
    expect(e.contasAtivas).toBe(true);
    expect(e.DATABASE_URL).toBe(BANCO);
    expect(e.BETTER_AUTH_URL).toBe("https://focaedu.com"); // sem barra no fim
  });
});

describe("produção mesmo com NODE_ENV estranho (revisão L2)", () => {
  test("VERCEL_ENV=production com NODE_ENV inválido continua produção (rate limit e origem não afrouxam)", () => {
    const aviso = spyOn(console, "warn").mockImplementation(() => {});
    implantado({ NODE_ENV: "producao" });
    expect(env().producao).toBe(true);
    expect(env().variaveisInvalidas).toContain("NODE_ENV");
    expect(env().AUTH_EMAIL_HABILITADO).toBe(false);
    aviso.mockRestore();
  });
});

describe("env em desenvolvimento", () => {
  test("variável inválida continua sendo erro claro (feedback imediato para quem desenvolve)", () => {
    for (const k of CONTA) delete process.env[k];
    delete process.env.VERCEL_ENV;
    Object.assign(process.env, { NODE_ENV: "development", BETTER_AUTH_URL: "focaedu.com" });
    redefinirEnv();
    expect(() => env()).toThrow(/BETTER_AUTH_URL/);
  });

  test("vazio também é ausente em desenvolvimento", () => {
    delete process.env.VERCEL_ENV;
    Object.assign(process.env, { NODE_ENV: "development", OPENAI_API_KEY: "" });
    redefinirEnv();
    expect(env().OPENAI_API_KEY).toBeUndefined();
  });
});

describe("origens confiáveis da autenticação", () => {
  test("apex e www do mesmo domínio, mais as extras válidas", async () => {
    const { origensConfiaveis } = await import("../../../src/server/env");
    expect(origensConfiaveis({ BETTER_AUTH_URL: "https://focaedu.com", AUTH_TRUSTED_ORIGINS: "https://foca-git-x.vercel.app/, lixo" })).toEqual([
      "https://focaedu.com",
      "https://www.focaedu.com",
      "https://foca-git-x.vercel.app",
    ]);
    expect(origensConfiaveis({ BETTER_AUTH_URL: "https://www.focaedu.com", AUTH_TRUSTED_ORIGINS: undefined })).toEqual([
      "https://www.focaedu.com",
      "https://focaedu.com",
    ]);
    expect(origensConfiaveis({ BETTER_AUTH_URL: "http://localhost:8080", AUTH_TRUSTED_ORIGINS: undefined })).toEqual(["http://localhost:8080"]);
  });
});

describe("venda (spec 49 §13)", () => {
  const CONTAS = { DATABASE_URL: BANCO, BETTER_AUTH_SECRET: SEGREDO, BETTER_AUTH_URL: "https://www.focaedu.com" };
  const ASAAS = { ASAAS_API_URL: "https://api-sandbox.asaas.com/v3", ASAAS_API_KEY: "chave-de-teste", ASAAS_WEBHOOK_TOKEN: "token-de-teste-com-16" };

  test("desligada por padrão, mesmo com as credenciais do Asaas", () => {
    implantado({ ...CONTAS, ...ASAAS });
    expect(env().pagamentosAtivos).toBe(false);
  });
  test("ligada só com a flag e as três variáveis do Asaas", () => {
    implantado({ ...CONTAS, ...ASAAS, PAGAMENTOS_HABILITADO: "true" });
    expect(env().pagamentosAtivos).toBe(true);
    process.env = { ...original }; // sem o token
    implantado({ ...CONTAS, ASAAS_API_URL: ASAAS.ASAAS_API_URL, ASAAS_API_KEY: "x", PAGAMENTOS_HABILITADO: "true" });
    expect(env().pagamentosAtivos).toBe(false);
  });
  test("sem contas (modo de demonstração) a venda nunca liga", () => {
    implantado({ ...ASAAS, PAGAMENTOS_HABILITADO: "true" });
    expect(env().pagamentosAtivos).toBe(false);
  });
});

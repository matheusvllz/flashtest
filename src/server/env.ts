/**
 * Variáveis de ambiente do servidor (docs/specs/46-producao T-04.4; lista em
 * docs/operacao/ambientes-e-deploy.md §3). Só o servidor importa este módulo — `src/server/**`
 * é bloqueado no bundle do navegador pelo `importProtection` do `vite.config.ts`.
 *
 * Regras: nada secreto com prefixo `VITE_`; em produção, falta de variável obrigatória derruba a
 * inicialização com uma mensagem clara (nunca com o valor); em desenvolvimento e teste há padrões
 * seguros (banco PGlite local, segredo de desenvolvimento, e-mail em caixa de saída local).
 */
import { z } from "zod";

const booleano = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");

const esquema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** "production" | "preview" | "development" — a Vercel define VERCEL_ENV. */
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),

  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),

  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET precisa de pelo menos 32 caracteres").optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  /** Origens extras aceitas (separadas por vírgula), ex.: o alias de staging na Vercel. */
  AUTH_TRUSTED_ORIGINS: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  /** Liga o login por e-mail e senha. Desligado em produção até existir domínio para e-mail (D-10). */
  AUTH_EMAIL_HABILITADO: booleano.optional(),
  /**
   * Desliga o rate limit do login (só fora de produção; em produção é ignorado). Usado pelos E2E, em que todos os
   * testes saem do mesmo IP. O rate limit é coberto pelos testes de integração (tests/unit/servidor/auth.test.ts).
   */
  AUTH_RATE_LIMIT_DESLIGADO: booleano.optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(3).optional(),

  MIN_ACCOUNT_AGE: z.coerce.number().int().min(13).max(21).default(17),
  /** Idade a partir da qual a Foca IA dispensa o consentimento do responsável (OpenAI OSA §3.3(c)). */
  TUTOR_IDADE_SEM_CONSENTIMENTO: z.coerce.number().int().min(13).max(21).default(18),

  OPENAI_API_KEY: z.string().min(1).optional(),
  AI_COTA_GRATIS_MENSAGENS: z.coerce.number().int().min(0).max(100).default(3),
  AI_COTA_PRO_MENSAGENS: z.coerce.number().int().min(0).max(500).default(20),
  AI_COTA_PRO_FOTOS: z.coerce.number().int().min(0).max(100).default(5),
  AI_TETO_DIARIO_USD: z.coerce.number().min(0).max(1000).default(1),

  /** Segredo das rotinas agendadas (Vercel Cron manda `Authorization: Bearer <CRON_SECRET>`). */
  CRON_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof esquema> & {
  producao: boolean;
  teste: boolean;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  AUTH_EMAIL_HABILITADO: boolean;
};

let cache: Env | undefined;

/** Lê e valida o ambiente uma vez por processo. Em teste, `redefinirEnv()` limpa o cache. */
export function env(): Env {
  if (cache) return cache;
  const lido = esquema.safeParse(process.env);
  if (!lido.success) {
    const campos = lido.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`[env] variáveis de ambiente inválidas — ${campos}`);
  }
  const e = lido.data;
  const producao = e.NODE_ENV === "production" && e.VERCEL_ENV !== "preview" && e.VERCEL_ENV !== "development";
  const teste = e.NODE_ENV === "test";

  const faltando: string[] = [];
  if (producao && !e.DATABASE_URL) faltando.push("DATABASE_URL");
  if (producao && !e.BETTER_AUTH_SECRET) faltando.push("BETTER_AUTH_SECRET");
  if (producao && !e.BETTER_AUTH_URL) faltando.push("BETTER_AUTH_URL");
  if (faltando.length) throw new Error(`[env] faltam variáveis obrigatórias em produção: ${faltando.join(", ")}`);

  cache = {
    ...e,
    producao,
    teste,
    // Desenvolvimento e teste: banco PGlite local (arquivo em .data/, ou memória nos testes).
    DATABASE_URL: e.DATABASE_URL ?? (teste ? "pglite:memoria" : "pglite:.data/pglite"),
    // Segredo fixo só fora de produção (produção exige o seu, acima).
    BETTER_AUTH_SECRET: e.BETTER_AUTH_SECRET ?? "segredo-de-desenvolvimento-nao-usar-em-producao-0000",
    BETTER_AUTH_URL: e.BETTER_AUTH_URL ?? "http://localhost:8080",
    // Sem domínio não há e-mail em produção (D-10): desligado por padrão lá, ligado no resto.
    AUTH_EMAIL_HABILITADO: e.AUTH_EMAIL_HABILITADO ?? !producao,
  };
  return cache;
}

/** Só para testes: força reler `process.env`. */
export function redefinirEnv(): void {
  cache = undefined;
}

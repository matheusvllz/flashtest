/**
 * Autenticação (docs/specs/46-producao T-05.2; ADR 0005, 0006; modelo de ameaças T1–T4).
 *
 * - E-mail e senha com verificação obrigatória (desligado em produção até haver domínio — D-10).
 * - Google, quando as credenciais existem.
 * - Sessão de 30 dias com renovação diária (D-14); redefinir a senha revoga todas as sessões.
 * - Vínculo de conta Google ↔ e-mail só com e-mail verificado dos dois lados; nenhum provedor
 *   "confiável" que pule a verificação (T3).
 * - Rate limit em banco (serverless), com regras mais duras nas rotas sensíveis (T1).
 * - Idade mínima (`MIN_ACCOUNT_AGE`) conferida no servidor na criação da conta (ADR 0006).
 */
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { APIError, betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { LEGAL, idadePeloAno } from "@/lib/legal";
import { banco, type Banco } from "../db/client";
import * as schema from "../db/schema";
import { enviarEmail } from "../email";
import { emailContaExcluida, emailRedefinicaoSenha, emailVerificacao } from "../email/modelos";
import { registrarExclusao } from "../conta/exclusao";
import { env, origensConfiaveis } from "../env";

const HORA = 60 * 60;
const DIA = 24 * HORA;
export const VALIDADE_LINK_HORAS = 1;

function criar(db: Banco) {
  const e = env();
  const google =
    e.GOOGLE_CLIENT_ID && e.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: e.GOOGLE_CLIENT_ID, clientSecret: e.GOOGLE_CLIENT_SECRET, prompt: "select_account" as const } }
      : {};
  return betterAuth({
    appName: "Foca",
    baseURL: e.BETTER_AUTH_URL,
    secret: e.BETTER_AUTH_SECRET,
    trustedOrigins: origensConfiaveis(e),
    database: drizzleAdapter(db, { provider: "pg", schema }),
    user: {
      additionalFields: {
        birthYear: { type: "number", required: false, input: true },
        termsVersion: { type: "string", required: false, input: true },
        privacyVersion: { type: "string", required: false, input: true },
      },
      // Exclusão (46 T-09.2; spec 48 T-48.3.2): cascata no banco; depois, auditoria sem o id em claro e e-mail.
      deleteUser: {
        enabled: true,
        afterDelete: async (u) => {
          await registrarExclusao(db, u.id);
          // Retenção de histórico do Neon no plano atual: 6 h (ADR 0007) — "em até 1 dia" no e-mail.
          await enviarEmail(emailContaExcluida({ para: u.email, diasBackup: 1, urlPrivacidade: `${e.BETTER_AUTH_URL}/privacidade` }));
        },
      },
    },
    emailAndPassword: {
      enabled: e.AUTH_EMAIL_HABILITADO,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: false,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: VALIDADE_LINK_HORAS * HORA,
      sendResetPassword: async ({ user, url }) => {
        await enviarEmail(emailRedefinicaoSenha({ para: user.email, url, validadeHoras: VALIDADE_LINK_HORAS }));
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: VALIDADE_LINK_HORAS * HORA,
      sendVerificationEmail: async ({ user, url }) => {
        await enviarEmail(emailVerificacao({ para: user.email, nome: user.name, url, validadeHoras: VALIDADE_LINK_HORAS }));
      },
    },
    socialProviders: google,
    account: {
      accountLinking: { enabled: true, trustedProviders: [], allowDifferentEmails: false },
    },
    session: { expiresIn: 30 * DIA, updateAge: DIA },
    rateLimit: {
      enabled: e.producao || !e.AUTH_RATE_LIMIT_DESLIGADO,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 10, max: 3 },
        "/sign-up/email": { window: 60, max: 5 },
        "/request-password-reset": { window: 60, max: 3 },
        "/forget-password": { window: 60, max: 3 },
        "/send-verification-email": { window: 60, max: 3 },
        "/delete-user": { window: 60, max: 3 },
      },
    },
    advanced: {
      useSecureCookies: e.producao || e.BETTER_AUTH_URL.startsWith("https://"),
      ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (dados) => {
            const ano = (dados as { birthYear?: number | null }).birthYear;
            // Conta pelo Google chega sem o ano: o cadastro é completado depois (/cadastro/completar).
            if (ano != null) {
              if (!Number.isInteger(ano) || ano < 1900 || ano > new Date().getFullYear()) {
                throw new APIError("BAD_REQUEST", { message: "Ano de nascimento inválido.", code: "ANO_INVALIDO" });
              }
              if (idadePeloAno(ano) < e.MIN_ACCOUNT_AGE) {
                throw new APIError("FORBIDDEN", { message: "Idade abaixo da mínima.", code: "IDADE_MINIMA" });
              }
              const d = dados as { termsVersion?: string | null; privacyVersion?: string | null };
              if (d.termsVersion !== LEGAL.termos.versao || d.privacyVersion !== LEGAL.privacidade.versao) {
                throw new APIError("BAD_REQUEST", { message: "Aceite dos termos pendente.", code: "ACEITE_PENDENTE" });
              }
            }
            return { data: dados };
          },
          // Cadastro por e-mail já traz ano e aceite: registra o histórico do aceite e cria o perfil.
          // (Conta pelo Google faz isso em /cadastro/completar.)
          after: async (criado) => {
            const u = criado as { id: string; birthYear?: number | null; termsVersion?: string | null; privacyVersion?: string | null };
            if (u.birthYear == null || !u.termsVersion || !u.privacyVersion) return;
            await db.insert(schema.profile).values({ userId: u.id }).onConflictDoNothing();
            for (const [documento, versao] of [
              ["termos", u.termsVersion],
              ["privacidade", u.privacyVersion],
            ] as const) {
              await db
                .insert(schema.legalAcceptance)
                .values({ id: crypto.randomUUID(), userId: u.id, document: documento, version: versao })
                .onConflictDoNothing();
            }
          },
        },
      },
    },
    plugins: [tanstackStartCookies()],
  });
}

export type Auth = ReturnType<typeof criar>;

let instancia: Promise<Auth> | undefined;

/** A instância do processo (criada na primeira chamada, depois da conexão com o banco). */
export function auth(): Promise<Auth> {
  instancia ??= banco().then(criar);
  return instancia;
}

/** Só para testes: instância sobre um banco específico. */
export function authDeTeste(db: Banco): Auth {
  return criar(db);
}

/** Só para testes: esquece a instância do processo. */
export function redefinirAuth(): void {
  instancia = undefined;
}

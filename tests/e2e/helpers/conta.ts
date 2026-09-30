/**
 * Contas reais nos E2E (docs/specs/46-producao T-04.6/T-05.8). O servidor de desenvolvimento usa PGlite em
 * `.data/pglite` e grava os e-mails em `.data/emails/` (docs/operacao/ambientes-e-deploy.md); o teste lê o link
 * de verificação de lá — nada é simulado no servidor.
 */
import { expect, type APIRequestContext } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const ORIGEM = "http://localhost:8080";
export const SENHA = "senha-bem-forte-123";
const PASTA_EMAILS = join(process.cwd(), ".data", "emails");

export function emailUnico(prefixo = "aluno"): string {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@teste.dev`;
}

/** Link mais recente enviado para `email` (espera até chegar). */
export async function linkDoEmail(email: string, assunto?: RegExp): Promise<string> {
  let url: string | undefined;
  await expect
    .poll(
      () => {
        let arquivos: string[] = [];
        try {
          arquivos = readdirSync(PASTA_EMAILS).map((n) => join(PASTA_EMAILS, n));
        } catch {
          return undefined;
        }
        const doAluno = arquivos
          .map((p) => ({ p, t: statSync(p).mtimeMs, m: JSON.parse(readFileSync(p, "utf8")) as { para: string; assunto: string; texto: string } }))
          .filter((x) => x.m.para === email && (!assunto || assunto.test(x.m.assunto)))
          .sort((a, b) => b.t - a.t);
        url = doAluno[0]?.m.texto.match(/https?:\/\/\S+/)?.[0];
        return url;
      },
      { timeout: 15_000 },
    )
    .toBeTruthy();
  return url!;
}

/** Cria uma conta verificada pela API real (cadastro → link do e-mail). Devolve o e-mail. */
export async function criarContaVerificada(api: APIRequestContext, email = emailUnico(), ano = 2006): Promise<string> {
  const { LEGAL } = await import("../../../src/lib/legal");
  const r = await api.post(`${ORIGEM}/api/auth/sign-up/email`, {
    headers: { origin: ORIGEM },
    data: { email, password: SENHA, name: "Ana", birthYear: ano, termsVersion: LEGAL.termos.versao, privacyVersion: LEGAL.privacidade.versao },
  });
  expect(r.status()).toBe(200);
  const link = await linkDoEmail(email, /Confirme/);
  const v = await api.get(link, { maxRedirects: 0 });
  expect([200, 302]).toContain(v.status());
  return email;
}

/** Entra pela API (grava o cookie de sessão no contexto). */
export async function entrarPelaApi(api: APIRequestContext, email: string): Promise<void> {
  const r = await api.post(`${ORIGEM}/api/auth/sign-in/email`, { headers: { origin: ORIGEM }, data: { email, password: SENHA } });
  expect(r.status()).toBe(200);
}

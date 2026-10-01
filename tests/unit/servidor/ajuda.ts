/**
 * Ajuda dos testes de servidor (docs/specs/46-producao T-04.6): banco PGlite em memória, migrado,
 * e a autenticação real do Foca por cima dele. Cada `ambiente()` é isolado.
 */
import { eq } from "drizzle-orm";
import { LEGAL } from "../../../src/lib/legal";
import { authDeTeste, type Auth } from "../../../src/server/auth";
import { bancoDeTeste, definirBanco, type Banco } from "../../../src/server/db/client";
import { user } from "../../../src/server/db/schema";
import { caixaDeSaida, limparCaixaDeSaida } from "../../../src/server/email";
import { redefinirEnv } from "../../../src/server/env";

export const ORIGEM = "http://localhost:8080";
let ipSeq = 0;

export interface Ambiente {
  db: Banco;
  auth: Auth;
  post: (caminho: string, corpo: unknown, extra?: Record<string, string>) => Promise<Response>;
  get: (url: string, extra?: Record<string, string>) => Promise<Response>;
}

/** `url`: outro Postgres em vez do PGlite em memória (suíte `tests/neon`). */
export async function ambiente(url?: string): Promise<Ambiente> {
  redefinirEnv();
  limparCaixaDeSaida();
  const db = await bancoDeTeste(url);
  definirBanco(db);
  const auth = authDeTeste(db);
  const cabecalhos = (extra: Record<string, string> = {}) =>
    new Headers({ "content-type": "application/json", origin: ORIGEM, "x-forwarded-for": `10.1.${Math.floor(ipSeq / 250)}.${(ipSeq++ % 250) + 1}`, ...extra });
  return {
    db,
    auth,
    post: (caminho, corpo, extra) =>
      auth.handler(new Request(`${ORIGEM}/api/auth${caminho}`, { method: "POST", headers: cabecalhos(extra), body: JSON.stringify(corpo) })),
    get: (url, extra) => auth.handler(new Request(url, { headers: cabecalhos(extra) })),
  };
}

export const cadastroValido = (email: string, extra: Record<string, unknown> = {}) => ({
  email,
  password: "senha-bem-forte-123",
  name: "Ana",
  birthYear: 2006,
  termsVersion: LEGAL.termos.versao,
  privacyVersion: LEGAL.privacidade.versao,
  ...extra,
});

/** Link mais recente enviado para `email` (verificação ou redefinição). */
export function ultimoLink(email: string): string {
  const m = [...caixaDeSaida()].reverse().find((x) => x.para === email);
  if (!m) throw new Error(`nenhum e-mail para ${email}`);
  const url = m.texto.match(/https?:\/\/\S+/)?.[0];
  if (!url) throw new Error("e-mail sem link");
  return url;
}

/** Cookie `nome=valor` de sessão a partir das respostas do Better Auth. */
export function cookieDe(r: Response): string {
  return r.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

/** Cria, verifica e entra: devolve o id do usuário e o cookie da sessão. */
export async function alunoVerificado(amb: Ambiente, email: string): Promise<{ userId: string; cookie: string }> {
  const r = await amb.post("/sign-up/email", cadastroValido(email));
  if (r.status !== 200) throw new Error(`cadastro falhou: ${r.status} ${await r.text()}`);
  await amb.get(ultimoLink(email));
  const login = await amb.post("/sign-in/email", { email, password: "senha-bem-forte-123" });
  if (login.status !== 200) throw new Error(`login falhou: ${login.status}`);
  const [u] = await amb.db.select({ id: user.id }).from(user).where(eq(user.email, email));
  return { userId: u.id, cookie: cookieDe(login) };
}

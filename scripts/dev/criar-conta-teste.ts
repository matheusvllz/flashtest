/**
 * Cria (ou confere) a conta de teste do ambiente LOCAL, pela API real do servidor de desenvolvimento: cadastro →
 * link de verificação lido de `.data/emails/` → e-mail confirmado. Só aceita `localhost` — nunca produção.
 *
 *   bun run dev                                 # em outro terminal
 *   bun scripts/dev/criar-conta-teste.ts        # usa http://localhost:8080
 *
 * Credenciais fixas (só valem no banco local, `.data/pglite`): TESTE_EMAIL / TESTE_SENHA abaixo.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { LEGAL } from "../../src/lib/legal";

export const TESTE_EMAIL = "teste@foca.dev";
export const TESTE_SENHA = "foca-teste-123";
const ORIGEM = process.env.FOCA_URL ?? "http://localhost:8080";
const PASTA_EMAILS = join(process.cwd(), ".data", "emails");

if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(ORIGEM)) {
  console.error(`Recusado: ${ORIGEM} não é o servidor local.`);
  process.exit(1);
}

const post = (caminho: string, corpo: unknown) =>
  fetch(`${ORIGEM}${caminho}`, { method: "POST", headers: { "content-type": "application/json", origin: ORIGEM }, body: JSON.stringify(corpo) });

async function entrar(): Promise<number> {
  return (await post("/api/auth/sign-in/email", { email: TESTE_EMAIL, password: TESTE_SENHA })).status;
}

function linkDeVerificacao(): string | undefined {
  let arquivos: string[] = [];
  try {
    arquivos = readdirSync(PASTA_EMAILS).map((n) => join(PASTA_EMAILS, n));
  } catch {
    return undefined;
  }
  const doTeste = arquivos
    .map((p) => ({ t: statSync(p).mtimeMs, m: JSON.parse(readFileSync(p, "utf8")) as { para: string; assunto: string; texto: string } }))
    .filter((x) => x.m.para === TESTE_EMAIL && /Confirme/.test(x.m.assunto))
    .sort((a, b) => b.t - a.t);
  return doTeste[0]?.m.texto.match(/https?:\/\/\S+/)?.[0];
}

if ((await entrar()) === 200) {
  console.log(`A conta de teste já existe e entra normalmente: ${TESTE_EMAIL} / ${TESTE_SENHA}`);
  process.exit(0);
}

const cadastro = await post("/api/auth/sign-up/email", {
  email: TESTE_EMAIL,
  password: TESTE_SENHA,
  name: "Teste",
  birthYear: 2006,
  termsVersion: LEGAL.termos.versao,
  privacyVersion: LEGAL.privacidade.versao,
});
if (cadastro.status !== 200) {
  console.error(`Cadastro falhou (HTTP ${cadastro.status}). O servidor está com as contas ligadas? Veja /api/saude.`);
  process.exit(1);
}

let link: string | undefined;
for (let i = 0; i < 30 && !link; i++) {
  link = linkDeVerificacao();
  if (!link) await Bun.sleep(500);
}
if (!link) {
  console.error("O e-mail de confirmação não chegou em .data/emails/ (a conta pode já existir com outra senha).");
  process.exit(1);
}
await fetch(link, { redirect: "manual" });

const status = await entrar();
if (status !== 200) {
  console.error(`A conta foi criada, mas o login respondeu HTTP ${status}.`);
  process.exit(1);
}
console.log(`Conta de teste pronta: ${TESTE_EMAIL} / ${TESTE_SENHA} (só no banco local)`);

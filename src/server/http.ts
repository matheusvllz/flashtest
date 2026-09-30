/**
 * Convenções das funções de servidor (docs/specs/46-producao T-04.5; docs/seguranca/README.md §4).
 *
 * Toda função de servidor que lê ou escreve dado do aluno:
 *   1. chama `exigirSessao()` — o `userId` vem SÓ da sessão, nunca do cliente (T6);
 *   2. se muda estado, chama `checarOrigem()` — CSRF (T5);
 *   3. valida a entrada com zod e limita tamanhos;
 *   4. devolve erros por `ErroApp` (código + status), sem stack, SQL ou existência de recurso alheio.
 */
import { getRequest, getRequestHeaders, setResponseStatus } from "@tanstack/react-start/server";
import { auth } from "./auth";
import { env } from "./env";

export class ErroApp extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem?: string,
  ) {
    super(mensagem ?? codigo);
    this.name = "ErroApp";
  }
}

export interface Sessao {
  userId: string;
  email: string;
  emailVerificado: boolean;
  nome: string;
  anoNascimento: number | null;
  termosVersao: string | null;
  privacidadeVersao: string | null;
}

/** A sessão da requisição atual, ou `null`. */
export async function sessaoAtual(headers: Headers = getRequestHeaders() as unknown as Headers): Promise<Sessao | null> {
  const a = await auth();
  const s = await a.api.getSession({ headers });
  if (!s) return null;
  const u = s.user as typeof s.user & { birthYear?: number | null; termsVersion?: string | null; privacyVersion?: string | null };
  return {
    userId: u.id,
    email: u.email,
    emailVerificado: u.emailVerified,
    nome: u.name,
    anoNascimento: u.birthYear ?? null,
    termosVersao: u.termsVersion ?? null,
    privacidadeVersao: u.privacyVersion ?? null,
  };
}

/** Exige sessão; sem ela, 401. */
export async function exigirSessao(): Promise<Sessao> {
  const s = await sessaoAtual();
  if (!s) throw new ErroApp(401, "SEM_SESSAO");
  return s;
}

/**
 * CSRF: requisição que muda estado precisa vir da própria origem. Navegadores atuais mandam
 * `Sec-Fetch-Site`; os antigos, `Origin`. Sem nenhum dos dois (ex.: curl), recusa em produção.
 */
export function checarOrigem(request: Request = getRequest()): void {
  const site = request.headers.get("sec-fetch-site");
  if (site) {
    if (site === "same-origin") return;
    throw new ErroApp(403, "ORIGEM_INVALIDA");
  }
  const origem = request.headers.get("origin");
  const esperada = new URL(env().BETTER_AUTH_URL).origin;
  const propria = new URL(request.url).origin;
  if (origem && (origem === esperada || origem === propria)) return;
  if (!origem && !env().producao) return; // ferramentas locais e testes sem navegador
  throw new ErroApp(403, "ORIGEM_INVALIDA");
}

/** Converte um erro em resposta segura para o cliente (e marca o status HTTP). */
export function respostaDeErro(erro: unknown): { ok: false; codigo: string } {
  if (erro instanceof ErroApp) {
    try {
      setResponseStatus(erro.status);
    } catch {
      /* fora de uma requisição (testes) */
    }
    return { ok: false, codigo: erro.codigo };
  }
  log("erro", "erro_interno", { mensagem: erro instanceof Error ? erro.message.slice(0, 200) : "desconhecido" });
  try {
    setResponseStatus(500);
  } catch {
    /* fora de uma requisição */
  }
  return { ok: false, codigo: "ERRO_INTERNO" };
}

const CAMPOS_PROIBIDOS = /(email|senha|password|token|secret|cookie|mensagem_aluno|conteudo|foto|image)/i;

/**
 * Log estruturado sem dado pessoal (T15): uma linha JSON. Campos com nome sensível são recusados
 * (viram "[omitido]"), para um descuido não vazar e-mail, token ou conversa.
 */
export function log(nivel: "info" | "aviso" | "erro", evento: string, campos: Record<string, unknown> = {}): void {
  const limpo: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(campos)) limpo[k] = CAMPOS_PROIBIDOS.test(k) ? "[omitido]" : v;
  const linha = JSON.stringify({ nivel, evento, em: new Date().toISOString(), ...limpo });
  if (nivel === "erro") console.error(linha);
  else if (nivel === "aviso") console.warn(linha);
  else if (!env().teste) console.log(linha);
}

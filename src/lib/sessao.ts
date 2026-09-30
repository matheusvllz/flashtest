/**
 * Sessão no cliente e guarda das rotas (docs/specs/46-producao T-05.6; decisão 0006: estudar exige
 * conta). Negar por padrão: toda rota que não está em `ROTAS_PUBLICAS` exige conta.
 */
import { obterSessao, type EstadoDaSessao } from "@/lib/api/sessao";

/** Rotas abertas sem conta: landing, onboarding de perfil, acesso e documentos legais. */
const ROTAS_PUBLICAS = new Set([
  "/",
  "/app",
  "/welcome",
  "/quiz",
  "/signup",
  "/onboarding",
  "/forgot",
  "/login",
  "/cadastro",
  "/verificar-email",
  "/esqueci-a-senha",
  "/redefinir-senha",
  "/termos",
  "/privacidade",
]);

/** Exigem sessão, mas não cadastro completo (é onde ele se completa). */
const ROTAS_DE_CADASTRO = new Set(["/cadastro/completar"]);

function normalizar(caminho: string): string {
  return caminho.length > 1 ? caminho.replace(/\/+$/, "") : caminho;
}

export function ehRotaPublica(caminho: string): boolean {
  const c = normalizar(caminho);
  return ROTAS_PUBLICAS.has(c) || c.startsWith("/api/");
}

export function ehRotaDeCadastro(caminho: string): boolean {
  return ROTAS_DE_CADASTRO.has(normalizar(caminho));
}

/**
 * Destino de volta depois do login, só dentro do próprio app (evita redirecionamento aberto):
 * precisa começar com "/" e não com "//" nem "/\\".
 */
export function destinoSeguro(volta: unknown, padrao = "/trilha"): string {
  if (typeof volta !== "string" || volta.length > 500) return padrao;
  if (!volta.startsWith("/") || volta.startsWith("//") || volta.startsWith("/\\")) return padrao;
  if (ehRotaPublica(volta.split("?")[0]) || ehRotaDeCadastro(volta.split("?")[0])) return padrao;
  return volta;
}

const VALIDADE_MS = 60_000;
let cache: { valor: EstadoDaSessao; em: number } | undefined;
/** Última sessão confirmada nesta aba — o que vale quando a rede cai (o estudo é local; o servidor segue exigindo sessão). */
let ultimaConfirmada: EstadoDaSessao | undefined;
let primeiraCargaLembrada = false;

/**
 * Sessão atual. No navegador, guarda por 1 minuto para não consultar o servidor a cada navegação. Sem rede, segue com
 * a última sessão confirmada nesta aba em vez de derrubar a tela: a guarda é só de navegação, e toda chamada ao
 * servidor confere a sessão de novo.
 */
export async function sessao(forcar = false): Promise<EstadoDaSessao> {
  const noNavegador = typeof window !== "undefined";
  if (noNavegador && !forcar && cache && Date.now() - cache.em < VALIDADE_MS) return cache.valor;
  let valor: EstadoDaSessao;
  try {
    valor = await obterSessao();
  } catch (e) {
    if (noNavegador && ultimaConfirmada) return ultimaConfirmada;
    throw e;
  }
  if (noNavegador) {
    cache = { valor, em: Date.now() };
    ultimaConfirmada = valor.autenticado ? valor : undefined;
  }
  return valor;
}

/**
 * Primeira carga: a guarda rodou no servidor e deixou passar para uma rota de estudo, então havia sessão com cadastro
 * completo. Fica como a última conhecida (só para o caso de a rede cair antes da primeira consulta nesta aba).
 */
export function lembrarSessaoDaPrimeiraCarga(guarda: { userId: string | null; modo: EstadoDaSessao["modo"] } | null): void {
  // Uma vez por página: depois de sair, a raiz ainda re-renderiza com o dado da carga anterior, e ele não vale mais.
  if (primeiraCargaLembrada || !guarda) return;
  primeiraCargaLembrada = true;
  if (ultimaConfirmada || cache) return;
  ultimaConfirmada = {
    autenticado: true,
    userId: guarda.userId,
    modo: guarda.modo,
    cadastroCompleto: true,
    emailVerificado: true,
    nome: null,
    email: null,
    reaceitePendente: false,
  };
}

/** Depois de entrar, sair ou completar o cadastro: a próxima consulta vai ao servidor. */
export function esquecerSessao(): void {
  cache = undefined;
  ultimaConfirmada = undefined;
}

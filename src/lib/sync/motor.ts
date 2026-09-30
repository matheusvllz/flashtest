/**
 * Motor da sincronização no navegador (docs/specs/46-producao §E.4, T-06.4/T-06.5).
 *
 * Local-first: o estudo nunca espera a rede. Cada ação que já existia grava no store e enfileira um evento na
 * outbox (`src/lib/store.ts`); este motor manda a outbox em lotes, tira dela o que o servidor aplicou ou recusou,
 * e aplica o agregado do servidor (XP e sequência vêm SEMPRE do servidor). Falha de rede: tenta de novo com espera
 * crescente (1 s … 5 min). Roda só nas telas do produto (montado pelo AppShell), nunca na landing.
 */
import { enviarEventos, obterEstado, salvarDocumento } from "@/lib/api/estudo";
import { LIMITE_EVENTOS_POR_ENVIO } from "@/lib/sync/contrato";
import {
  aplicarAgregadoDoServidor,
  aplicarDocumentoDoServidor,
  assinarMudancas,
  documentoParaSincronizar,
  getState,
  marcarDocumentoSalvo,
  removerDaOutbox,
} from "@/lib/store";

const ESPERA_MIN = 1_000;
const ESPERA_MAX = 5 * 60_000;
const INTERVALO_PULL = 5 * 60_000;
const ATRASO_DEPOIS_DE_MUDANCA = 2_000;

let espera = ESPERA_MIN;
let temporizador: ReturnType<typeof setTimeout> | undefined;
let enviando = false;
let ultimoPull = 0;
let iniciado = false;

export type EstadoDaSync = "em-dia" | "pendente" | "sem-conexao";

function agendar(ms: number) {
  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(() => void ciclo(), ms);
}

/** Um ciclo: envia a outbox (em lotes) e, de tempos em tempos, puxa o estado do servidor. */
async function ciclo(): Promise<void> {
  if (enviando || typeof navigator === "undefined") return;
  const conta = getState().account;
  if (!conta?.userId) return;
  if (!navigator.onLine) return;
  enviando = true;
  try {
    let lote = getState().account?.outbox.slice(0, LIMITE_EVENTOS_POR_ENVIO) ?? [];
    while (lote.length) {
      const r = await enviarEventos({ data: { eventos: lote } });
      if (!r.ok) throw new Error(r.codigo);
      removerDaOutbox([...r.aplicados, ...r.rejeitados.map((x) => x.id)]);
      aplicarAgregadoDoServidor(r.agregado);
      lote = getState().account?.outbox.slice(0, LIMITE_EVENTOS_POR_ENVIO) ?? [];
    }
    await salvarDocumentoSeMudou();
    if (Date.now() - ultimoPull > INTERVALO_PULL) await puxar();
    espera = ESPERA_MIN;
  } catch {
    espera = Math.min(ESPERA_MAX, espera * 2);
    agendar(espera);
  } finally {
    enviando = false;
  }
}

async function salvarDocumentoSeMudou(): Promise<void> {
  const d = documentoParaSincronizar();
  if (!d) return;
  const r = await salvarDocumento({ data: { rev: d.rev, schemaVersion: d.schemaVersion, doc: d.doc } });
  if (r.ok) marcarDocumentoSalvo(r.rev, d.assinatura);
  else if (r.codigo === "CONFLITO") await puxar(); // outro aparelho gravou antes: adota o do servidor e segue
}

/** Puxa agregado e documento do servidor (login, abrir o app, voltar à aba, e a cada 5 min). */
export async function puxar(): Promise<void> {
  if (!getState().account?.userId) return; // sem conta vinculada (ou modo de demonstração): nada a puxar
  const r = await obterEstado();
  if (!r.ok) return;
  ultimoPull = Date.now();
  aplicarAgregadoDoServidor(r.agregado);
  if (r.documento) aplicarDocumentoDoServidor(r.documento);
}

/** Tenta mandar tudo agora (antes de sair da conta). Devolve quantos eventos ainda ficaram pendentes. */
export async function sincronizarAgora(): Promise<number> {
  await ciclo();
  return getState().account?.outbox.length ?? 0;
}

export function estadoDaSync(): EstadoDaSync {
  const pendentes = getState().account?.outbox.length ?? 0;
  if (typeof navigator !== "undefined" && !navigator.onLine && pendentes) return "sem-conexao";
  return pendentes ? "pendente" : "em-dia";
}

/**
 * Só no servidor de desenvolvimento: os E2E que testam o estudo local (todos com a mesma conta de teste) pausam o
 * motor, senão o agregado e o documento de um teste entrariam no outro. A sincronização tem E2E próprios, com contas
 * separadas e o motor ligado. Em produção esta chave é ignorada.
 */
export const CHAVE_SYNC_PAUSADA_DEV = "foca.sync.pausadaDev";

function pausadoEmDesenvolvimento(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    return localStorage.getItem(CHAVE_SYNC_PAUSADA_DEV) === "1";
  } catch {
    return false;
  }
}

/** Liga o motor (uma vez por página). */
export function iniciarSincronizacao(): void {
  if (iniciado || typeof window === "undefined" || pausadoEmDesenvolvimento()) return;
  iniciado = true;
  window.addEventListener("online", () => agendar(0));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") agendar(0);
  });
  setInterval(() => agendar(0), INTERVALO_PULL);
  // Evento novo na outbox → manda daqui a pouco (junta respostas seguidas num lote só).
  let vistos = getState().account?.outbox.length ?? 0;
  assinarMudancas(() => {
    const n = getState().account?.outbox.length ?? 0;
    if (n > vistos) agendar(ATRASO_DEPOIS_DE_MUDANCA);
    vistos = n;
  });
  void puxar()
    .catch(() => undefined)
    .finally(() => agendar(0));
}

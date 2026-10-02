/**
 * Registro do worker único `/sw.js` (spec 50 §5.2.5, T-50.15.2): lembrete por push sempre; estudo sem internet
 * (spec 49 §5.9 item 6, T-49.9.3) só com o **modo offline** ligado — bandeira no IndexedDB `foca-sw` que o worker lê.
 *
 * - "Baixar a semana" (só /offline, Basic/Pro) liga o modo e registra o worker; "Apagar o que foi baixado", perder o
 *   plano (`useMinhasFuncoes`) e sair da conta desligam o modo e apagam o cache.
 * - Ligar o lembrete registra o mesmo worker sem tocar no modo: quem só tem o lembrete (inclusive no Free) não ganha
 *   cache offline.
 * - O worker antigo (`/sw-offline.js`) é trocado pelo novo no primeiro registro (mesmo escopo) ou se desregistra sozinho.
 * - Sem modo offline e sem lembrete, o worker sai do aparelho.
 *
 * Módulo sem dependências: `usuario-da-sessao.ts` (carregado pela raiz) o importa (regra dura 9).
 */
export const SW_URL = "/sw.js";
const SW_ANTIGO = "/sw-offline.js";
const PREFIXO_CACHE = "foca-offline-";
const BANCO = "foca-sw";
const LOJA = "ajustes";
const CHAVE_MODO = "modoOffline";

export function suportaOffline(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator && typeof caches !== "undefined";
}

function suportaWorker(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

const doScript = (r: ServiceWorkerRegistration, url: string) => [r.active, r.waiting, r.installing].some((w) => w?.scriptURL.endsWith(url));

/** Registro do worker do Foca neste aparelho (o novo ou o antigo), se houver. */
export async function registroDoWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!suportaWorker()) return null;
  const regs = await navigator.serviceWorker.getRegistrations().catch(() => [] as readonly ServiceWorkerRegistration[]);
  return regs.find((r) => doScript(r, SW_URL)) ?? regs.find((r) => doScript(r, SW_ANTIGO)) ?? null;
}

/** Registra `/sw.js` (trocando o antigo, se houver) e espera ele ficar ativo. */
export async function registrarWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!suportaWorker()) return null;
  await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  return navigator.serviceWorker.ready;
}

/* ---------- bandeira do modo offline ---------- */

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(LOJA);
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

export async function modoOfflineLigado(): Promise<boolean> {
  if (typeof indexedDB === "undefined") return false;
  try {
    const db = await abrirBanco();
    return await new Promise<boolean>((resolve) => {
      const tx = db.transaction(LOJA, "readonly");
      const pedido = tx.objectStore(LOJA).get(CHAVE_MODO);
      pedido.onsuccess = () => resolve(pedido.result === true);
      pedido.onerror = () => resolve(false);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return false;
  }
}

async function gravarModo(ligado: boolean): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await abrirBanco();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(LOJA, "readwrite");
      tx.objectStore(LOJA).put(ligado, CHAVE_MODO);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    /* sem IndexedDB: o worker não liga o modo sozinho */
  }
}

/** Liga/desliga o modo offline: grava a bandeira e avisa o worker ativo (que apaga o cache ao desligar). */
export async function definirModoOffline(ligado: boolean): Promise<void> {
  await gravarModo(ligado);
  const reg = await registroDoWorker();
  reg?.active?.postMessage({ tipo: "modo-offline", ligado });
}

/** Registro do estudo sem internet: só existe com o worker registrado **e** o modo offline ligado. */
export async function registroDoOffline(): Promise<ServiceWorkerRegistration | null> {
  if (!suportaOffline()) return null;
  const reg = await registroDoWorker();
  if (!reg || !doScript(reg, SW_URL)) return null;
  return (await modoOfflineLigado()) ? reg : null;
}

/** Arquivos que esta aba já carregou e que o service worker pode guardar (código com hash, fontes, conteúdo). */
export function arquivosCarregados(): string[] {
  if (typeof performance === "undefined") return [];
  const urls = new Set<string>();
  for (const e of performance.getEntriesByType("resource")) {
    try {
      const u = new URL(e.name);
      if (u.origin !== location.origin) continue;
      if (/^\/(assets|fonts|content)\//.test(u.pathname)) urls.add(u.pathname + u.search);
    } catch {
      /* entrada sem URL válida */
    }
  }
  return [...urls];
}

/** Liga o modo offline, registra (se preciso) e pede ao worker para guardar `urls`. Devolve quantos ficaram guardados. */
export async function baixarParaOffline(urls: string[]): Promise<number> {
  if (!suportaOffline()) return 0;
  await gravarModo(true);
  const reg = await registrarWorker();
  const sw = reg?.active;
  if (!sw) return 0;
  return new Promise<number>((resolve) => {
    const prazo = setTimeout(() => {
      navigator.serviceWorker.removeEventListener("message", ouvir);
      resolve(0);
    }, 60_000);
    function ouvir(ev: MessageEvent) {
      if (ev.data?.tipo !== "guardado") return;
      clearTimeout(prazo);
      navigator.serviceWorker.removeEventListener("message", ouvir);
      resolve(Number(ev.data.guardados) || 0);
    }
    navigator.serviceWorker.addEventListener("message", ouvir);
    sw.postMessage({ tipo: "guardar", urls });
  });
}

async function assinaturaDePush(reg: ServiceWorkerRegistration | null): Promise<PushSubscription | null> {
  if (!reg || !("pushManager" in reg)) return null;
  return reg.pushManager.getSubscription().catch(() => null);
}

/**
 * Apaga o que foi baixado (modo offline desligado e cache removido). O worker só sai do aparelho se também não houver
 * lembrete ligado nele.
 */
export async function removerOffline(): Promise<void> {
  if (!suportaOffline()) return;
  const reg = await registroDoWorker();
  if (reg) {
    // Chamado a cada carga de quem não tem a função (useMinhasFuncoes): só grava quando há o que desligar.
    if (await modoOfflineLigado()) await definirModoOffline(false);
    if (!doScript(reg, SW_URL) || !(await assinaturaDePush(reg))) await reg.unregister().catch(() => false);
  }
  const nomes = await caches.keys().catch(() => [] as string[]);
  await Promise.all(nomes.filter((n) => n.startsWith(PREFIXO_CACHE)).map((n) => caches.delete(n)));
}

/**
 * Sair da conta ou trocar de conta no aparelho (spec 50 §5.2.5; 49 T-49.9.3): cancela a assinatura de push deste
 * aparelho (o serviço de push passa a recusar o endereço e o servidor apaga a linha no próximo envio, ou pela
 * retenção), desliga o modo offline, apaga o cache e tira o worker.
 */
export async function limparAparelho(): Promise<void> {
  if (!suportaWorker()) return;
  const reg = await registroDoWorker();
  const assinatura = await assinaturaDePush(reg);
  if (assinatura) await assinatura.unsubscribe().catch(() => false);
  await removerOffline();
  if (reg) await reg.unregister().catch(() => false);
}

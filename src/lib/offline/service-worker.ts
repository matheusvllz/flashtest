/**
 * Registro do service worker do estudo sem internet (spec 49 §5.9 item 6, T-49.9.3). Só /offline registra, no toque
 * de "Baixar a semana"; quem perde a função (plano sem `semInternet`) tem o registro e o cache removidos.
 */
export const SW_URL = "/sw-offline.js";
const PREFIXO_CACHE = "foca-offline-";

export function suportaOffline(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator && typeof caches !== "undefined";
}

export async function registroDoOffline(): Promise<ServiceWorkerRegistration | null> {
  if (!suportaOffline()) return null;
  const regs = await navigator.serviceWorker.getRegistrations().catch(() => []);
  return regs.find((r) => [r.active, r.waiting, r.installing].some((w) => w?.scriptURL.endsWith(SW_URL))) ?? null;
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

/** Registra (se preciso) e pede ao service worker para guardar `urls`. Devolve quantos arquivos ficaram guardados. */
export async function baixarParaOffline(urls: string[]): Promise<number> {
  if (!suportaOffline()) return 0;
  await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  const reg = await navigator.serviceWorker.ready;
  const sw = reg.active;
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

export async function removerOffline(): Promise<void> {
  if (!suportaOffline()) return;
  const reg = await registroDoOffline();
  if (reg) await reg.unregister().catch(() => false);
  const nomes = await caches.keys().catch(() => [] as string[]);
  await Promise.all(nomes.filter((n) => n.startsWith(PREFIXO_CACHE)).map((n) => caches.delete(n)));
}

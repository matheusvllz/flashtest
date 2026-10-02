/*
 * Worker único do Foca (spec 50 §5.2.5, T-50.15.2): o lembrete diário (push) sempre; o estudo sem internet da 49
 * (§5.9 item 6, T-49.9.3) **só com o modo offline ligado**. Substitui `/sw-offline.js`, que agora só se desregistra.
 *
 * Modo offline: a página grava a bandeira `modoOffline` no IndexedDB `foca-sw` ao tocar em "Baixar a semana"
 * (Basic/Pro) e a apaga ao remover o baixado, ao perder o plano e ao sair da conta (`src/lib/offline/service-worker.ts`).
 * Sem a bandeira, o worker não intercepta nada e não guarda nada: quem só ligou o lembrete (inclusive no Free) não
 * ganha cache offline.
 *
 * Regras do cache (revisão L2, as mesmas da 49):
 * - Nunca intercepta o que não é GET, o que é de outra origem, nem /api/ ou /_serverFn (dados, conta, pagamento,
 *   Foca IA sempre vão à rede; offline, falham como já falhavam e as respostas ficam na fila de sincronização).
 * - Páginas: só as de estudo, sem query string; rede primeiro; sem rede, a cópia guardada da mesma página ou da trilha.
 *   As páginas guardadas levam a conta da sessão: sair da conta ou trocar de conta apaga o cache (usuario-da-sessao.ts).
 * - Arquivos com hash (/assets/) e pacotes de conteúdo (/content/): guardados ao passar; cada "Baixar a semana" tira os
 *   arquivos com hash que não são da versão atual (o cache não cresce a cada deploy). `VERSAO` muda só se a lógica mudar.
 *
 * Push: mostra a notificação com o ícone institucional e o texto recebido do servidor (neutro, de `voz.ts`, slot
 * `lembrete`); o toque abre (ou traz para a frente) a trilha. Nada de conta, nome ou dado do aluno na notificação.
 */
const VERSAO = "foca-offline-v2";
const PAGINAS_BASE = ["/trilha", "/app"];
/** Só páginas de estudo são guardadas, sem a query string (nunca /login, /redefinir-senha?token=…, /planos…). */
const PAGINAS_DE_ESTUDO = /^\/(app|trilha|plan|offline|study|flashcards|caderno|progress|redacao(\/[\w-]+)?|atividade\/[\w:.-]+|learn\/[\w:.-]+|video\/[\w-]+)\/?$/;
const ICONE = "/branding/foca/icon-192.png";
const ABRIR = "/trilha";
const TEXTO_PADRAO = "Sua lição de hoje está pronta.";

/* ---------- bandeira do modo offline (IndexedDB) ---------- */

const BANCO = "foca-sw";
const LOJA = "ajustes";
const CHAVE_MODO = "modoOffline";

function abrirBanco() {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(LOJA);
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

async function lerModo() {
  try {
    const db = await abrirBanco();
    return await new Promise((resolve) => {
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

async function gravarModo(ligado) {
  try {
    const db = await abrirBanco();
    await new Promise((resolve) => {
      const tx = db.transaction(LOJA, "readwrite");
      tx.objectStore(LOJA).put(ligado === true, CHAVE_MODO);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    /* sem IndexedDB: vale o que está em memória */
  }
}

/** `null` = ainda não lido neste ciclo de vida do worker. */
let modoOffline = null;
let leitura = null;
function modo() {
  if (modoOffline !== null) return Promise.resolve(modoOffline);
  if (!leitura) {
    leitura = lerModo().then((v) => {
      if (modoOffline === null) modoOffline = v;
      return modoOffline;
    });
  }
  return leitura;
}
modo();

async function apagarCaches() {
  const nomes = await caches.keys();
  await Promise.all(nomes.filter((n) => n.startsWith("foca-offline-")).map((n) => caches.delete(n)));
}

/* ---------- ciclo de vida ---------- */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const nomes = await caches.keys();
      // Cache do worker antigo (`sw-offline.js`, v1) e versões anteriores saem; sem modo offline, nenhum cache fica.
      const ligado = await modo();
      await Promise.all(nomes.filter((n) => n.startsWith("foca-offline-") && (n !== VERSAO || !ligado)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

/* ---------- estudo sem internet (só com o modo ligado) ---------- */

function ignorar(request, url) {
  if (request.method !== "GET") return true;
  if (url.origin !== self.location.origin) return true;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn")) return true;
  if (url.pathname === "/sw.js" || url.pathname === "/sw-offline.js") return true;
  return false;
}

async function guardar(request, response) {
  if (!response || !response.ok || response.type !== "basic") return;
  const cache = await caches.open(VERSAO);
  await cache.put(request, response.clone());
}

async function pagina(request) {
  const url = new URL(request.url);
  const deEstudo = PAGINAS_DE_ESTUDO.test(url.pathname);
  try {
    const resposta = await fetch(request);
    if (deEstudo && !resposta.redirected) await guardar(new Request(url.origin + url.pathname), resposta);
    return resposta;
  } catch (erro) {
    if (!deEstudo) throw erro;
    const cache = await caches.open(VERSAO);
    const mesma = await cache.match(url.origin + url.pathname);
    if (mesma) return mesma;
    for (const base of PAGINAS_BASE) {
      const copia = await cache.match(base);
      if (copia) return copia;
    }
    throw erro;
  }
}

async function arquivo(request) {
  const cache = await caches.open(VERSAO);
  const guardado = await cache.match(request);
  if (guardado) return guardado;
  const resposta = await fetch(request);
  await guardar(request, resposta);
  return resposta;
}

/** Conteúdo pode mudar sem mudar de nome: rede primeiro, cópia guardada sem rede. */
async function conteudo(request) {
  try {
    const resposta = await fetch(request);
    await guardar(request, resposta);
    return resposta;
  } catch (erro) {
    const guardado = await (await caches.open(VERSAO)).match(request);
    if (guardado) return guardado;
    throw erro;
  }
}

/** O que o modo offline faria com o pedido (ou `null`: não intercepta). */
function estrategia(request, url) {
  if (request.mode === "navigate") return pagina;
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/fonts/")) return arquivo;
  if (url.pathname.startsWith("/content/")) return conteudo;
  return null;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (ignorar(request, url)) return;
  const fazer = estrategia(request, url);
  if (!fazer) return;
  if (modoOffline === false) return; // modo desligado: o navegador segue sozinho, sem passar pelo worker
  if (modoOffline === true) return event.respondWith(fazer(request));
  // Worker acabou de acordar e a bandeira ainda está sendo lida: decide depois de ler (sem modo, rede pura).
  event.respondWith(modo().then((ligado) => (ligado ? fazer(request) : fetch(request))));
});

/* ---------- mensagens da página ---------- */

async function guardarLista(urls, origem) {
  const cache = await caches.open(VERSAO);
  // Arquivos com hash de uma versão anterior do app (fora da lista atual) saem: o cache não cresce a cada deploy.
  const atuais = new Set(urls.map((u) => new URL(u, self.location.origin).href));
  for (const req of await cache.keys()) {
    const caminho = new URL(req.url).pathname;
    if (caminho.startsWith("/assets/") && !atuais.has(req.url)) await cache.delete(req);
  }
  let guardados = 0;
  for (const bruto of urls.slice(0, 400)) {
    try {
      const url = new URL(bruto, self.location.origin);
      if (url.origin !== self.location.origin || ignorar({ method: "GET" }, url)) continue;
      const ehArquivo = /^\/(assets|fonts|content)\//.test(url.pathname);
      if (!ehArquivo && !PAGINAS_DE_ESTUDO.test(url.pathname)) continue;
      const resposta = await fetch(url.href, { credentials: "same-origin" });
      // Resposta redirecionada não serve para navegação (o navegador recusa): não guarda.
      if (resposta.ok && !resposta.redirected) {
        await cache.put(url.href, resposta);
        guardados += 1;
      }
    } catch {
      /* um arquivo que falhou não impede os outros */
    }
  }
  if (origem) origem.postMessage({ tipo: "guardado", guardados });
}

self.addEventListener("message", (event) => {
  const dados = event.data;
  if (!dados || typeof dados !== "object") return;
  // A página já gravou a bandeira no IndexedDB; aqui só a memória do worker acompanha.
  if (dados.tipo === "modo-offline") {
    modoOffline = dados.ligado === true;
    if (!modoOffline) event.waitUntil(apagarCaches());
    return;
  }
  // "Baixar a semana": a página manda a lista do que guardar (páginas-base e arquivos já carregados).
  if (dados.tipo === "guardar" && Array.isArray(dados.urls)) {
    modoOffline = true;
    event.waitUntil(gravarModo(true).then(() => guardarLista(dados.urls, event.source)));
  }
});

/* ---------- lembrete diário (push) ---------- */

self.addEventListener("push", (event) => {
  let corpo = TEXTO_PADRAO;
  try {
    const dados = event.data ? event.data.json() : null;
    if (dados && typeof dados.corpo === "string" && dados.corpo.trim()) corpo = dados.corpo.trim().slice(0, 160);
  } catch {
    /* corpo ilegível: texto padrão */
  }
  event.waitUntil(
    self.registration.showNotification("Foca", {
      body: corpo,
      icon: ICONE,
      badge: ICONE,
      tag: "foca-lembrete",
      lang: "pt-BR",
      data: { abrir: ABRIR },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const destino = new URL(ABRIR, self.location.origin).href;
      const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const janela of janelas) {
        if (new URL(janela.url).origin !== self.location.origin) continue;
        await janela.focus();
        if ("navigate" in janela && janela.url !== destino) await janela.navigate(destino).catch(() => undefined);
        return;
      }
      await self.clients.openWindow(destino);
    })(),
  );
});

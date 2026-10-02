/*
 * Estudo sem internet (spec 49 §5.9 item 6, T-49.9.3; B-072). Só é registrado quando um aluno Basic/Pro toca em
 * "Baixar a semana" em /offline, e é removido quando o plano deixa de incluir a função.
 *
 * Regras (revisão L2):
 * - Nunca intercepta o que não é GET, o que é de outra origem, nem /api/ ou /_serverFn (dados, conta, pagamento,
 *   Foca IA sempre vão à rede; offline, falham como já falhavam e as respostas ficam na fila de sincronização).
 * - Páginas: só as de estudo, sem query string; rede primeiro; sem rede, a cópia guardada da mesma página ou da trilha.
 *   As páginas guardadas levam a conta da sessão: sair da conta ou trocar de conta apaga o cache (usuario-da-sessao.ts).
 * - Arquivos com hash (/assets/) e pacotes de conteúdo (/content/): guardados ao passar; cada "Baixar a semana" tira os
 *   arquivos com hash que não são da versão atual (o cache não cresce a cada deploy). `VERSAO` muda só se a lógica mudar.
 */
const VERSAO = "foca-offline-v1";
const PAGINAS_BASE = ["/trilha", "/app"];
/** Só páginas de estudo são guardadas, sem a query string (nunca /login, /redefinir-senha?token=…, /planos…). */
const PAGINAS_DE_ESTUDO = /^\/(app|trilha|plan|offline|study|flashcards|caderno|progress|redacao(\/[\w-]+)?|atividade\/[\w:.-]+|learn\/[\w:.-]+|video\/[\w-]+)\/?$/;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const nomes = await caches.keys();
      await Promise.all(nomes.filter((n) => n.startsWith("foca-offline-") && n !== VERSAO).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

function ignorar(request, url) {
  if (request.method !== "GET") return true;
  if (url.origin !== self.location.origin) return true;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn")) return true;
  if (url.pathname === "/sw-offline.js") return true;
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

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (ignorar(request, url)) return;
  if (request.mode === "navigate") return event.respondWith(pagina(request));
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/fonts/")) return event.respondWith(arquivo(request));
  if (url.pathname.startsWith("/content/")) return event.respondWith(conteudo(request));
});

/** "Baixar a semana": a página manda a lista do que guardar (páginas-base e arquivos já carregados). */
self.addEventListener("message", (event) => {
  const dados = event.data;
  if (!dados || dados.tipo !== "guardar" || !Array.isArray(dados.urls)) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSAO);
      // Arquivos com hash de uma versão anterior do app (fora da lista atual) saem: o cache não cresce a cada deploy.
      const atuais = new Set(dados.urls.map((u) => new URL(u, self.location.origin).href));
      for (const req of await cache.keys()) {
        const caminho = new URL(req.url).pathname;
        if (caminho.startsWith("/assets/") && !atuais.has(req.url)) await cache.delete(req);
      }
      let guardados = 0;
      for (const bruto of dados.urls.slice(0, 400)) {
        try {
          const url = new URL(bruto, self.location.origin);
          if (url.origin !== self.location.origin || ignorar({ method: "GET" }, url)) continue;
          const arquivo = /^\/(assets|fonts|content)\//.test(url.pathname);
          if (!arquivo && !PAGINAS_DE_ESTUDO.test(url.pathname)) continue;
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
      if (event.source) event.source.postMessage({ tipo: "guardado", guardados });
    })(),
  );
});

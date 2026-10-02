/*
 * Aposentado pela spec 50 (§5.2.5, T-50.15.2): o estudo sem internet e o lembrete vivem no worker único `/sw.js`.
 * Este arquivo continua publicado só para os aparelhos que ainda têm o worker antigo: quando o navegador busca a
 * atualização, esta versão apaga o cache antigo e se desregistra. Na próxima vez que o aluno tocar em "Baixar a
 * semana", o app registra `/sw.js`. Não intercepta nada.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await caches.delete("foca-offline-v1");
      await self.registration.unregister();
    })(),
  );
});

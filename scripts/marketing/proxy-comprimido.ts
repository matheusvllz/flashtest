// Proxy local com compressão (brotli/gzip) na frente do build de produção (docs/44 §9). O servidor `node-server` do
// Nitro não comprime; a Vercel comprime na borda. Sem isto o Lighthouse local mede bytes que ninguém baixa de verdade.
// Uso: PORT=3100 node .output/server/index.mjs  &  bun scripts/marketing/proxy-comprimido.ts   (porta 3200 → 3100)
import { brotliCompressSync, gzipSync, constants } from "node:zlib";

const ALVO = process.env.ALVO ?? "http://localhost:3100";
const PORTA = Number(process.env.PORTA ?? 3200);
const TEXTO = /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg)/;

Bun.serve({
  port: PORTA,
  async fetch(req) {
    const url = new URL(req.url);
    const resp = await fetch(ALVO + url.pathname + url.search, { method: req.method, headers: req.headers, redirect: "manual" });
    const tipo = resp.headers.get("content-type") ?? "";
    const aceita = req.headers.get("accept-encoding") ?? "";
    const headers = new Headers(resp.headers);
    headers.delete("content-length");
    if (!TEXTO.test(tipo) || resp.status === 304) return new Response(resp.body, { status: resp.status, headers });
    const corpo = Buffer.from(await resp.arrayBuffer());
    if (aceita.includes("br")) {
      headers.set("content-encoding", "br");
      return new Response(brotliCompressSync(corpo, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } }), { status: resp.status, headers });
    }
    if (aceita.includes("gzip")) {
      headers.set("content-encoding", "gzip");
      return new Response(gzipSync(corpo), { status: resp.status, headers });
    }
    return new Response(corpo, { status: resp.status, headers });
  },
});
console.log(`proxy comprimido: http://localhost:${PORTA} → ${ALVO}`);

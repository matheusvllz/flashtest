// Pré-render estático (docs/40 §15.2): pega o HTML gerado pelo build do cliente (dist/index.html),
// injeta o corpo renderizado pelo build SSR (dist-ssr/entry-server.js) e o <head> final.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dir, "..");
const distIndex = join(root, "dist", "index.html");
const ssrEntry = join(root, "dist-ssr", "entry-server.js");

if (!existsSync(distIndex)) throw new Error("dist/index.html não existe. Rode `vite build` antes.");
if (!existsSync(ssrEntry)) throw new Error("dist-ssr/entry-server.js não existe. Rode o build SSR antes.");

const mod = (await import(pathToFileURL(ssrEntry).href)) as {
  render: () => string;
  renderHead: () => string;
  renderRobots: () => string;
  renderSitemap: () => string | null;
};

// Em deploy (Vercel) a landing não pode sair apontando para localhost.
const appUrl = process.env.VITE_APP_URL ?? "";
if ((process.env.VERCEL || process.env.LP_STRICT === "1") && (!appUrl || /localhost|127\.0\.0\.1/.test(appUrl))) {
  throw new Error(`VITE_APP_URL inválida para produção: "${appUrl}". Defina a URL pública do app.`);
}

let html = readFileSync(distIndex, "utf8");

if (!html.includes("<!--app-html-->")) throw new Error("Marcador <!--app-html--> ausente no dist/index.html.");
html = html.replace("<!--app-html-->", mod.render());

const headRe = /<!--app-head-start-->[\s\S]*?<!--app-head-end-->/;
if (!headRe.test(html)) throw new Error("Marcadores de head ausentes no dist/index.html.");
html = html.replace(headRe, mod.renderHead());

// CSS crítico inline: a página é uma só e o CSS tem ~8 kB gz; poupa uma ida ao servidor antes do primeiro pixel.
const cssLink = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
if (cssLink) {
  const css = readFileSync(join(root, "dist", cssLink[1].replace(/^\//, "")), "utf8");
  html = html.replace(cssLink[0], `<style>${css}</style>`);
}

// JS do app DEPOIS do load (docs/40 §16): o HTML pré-renderizado e o CSS inline já são a página; o React só hidrata a demo, a FAQ
// e o movimento. Puxar 79 kB de JS antes disso só disputa banda com as fontes e o retrato do hero (o LCP). O <link rel="modulepreload">
// é omitido de propósito. Sem JS, nada muda: a página inteira já está no HTML.
const scriptTag = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
if (scriptTag) {
  html = html.replace(scriptTag[0], "");
  const loader = `<script>addEventListener("load",function(){var s=document.createElement("script");s.type="module";s.crossOrigin="";s.src="${scriptTag[1]}";document.body.appendChild(s)})</script>`;
  html = html.replace("</body>", `${loader}\n  </body>`);
}

// Content-Security-Policy por <meta>, com o hash de cada script inline calculado AGORA (nunca fica velho).
// frame-ancestors não funciona em <meta>: fica no cabeçalho de landing/vercel.json. Estilos inline continuam liberados
// (o React emite atributos style; não há entrada de usuário na página).
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const hashes = inlineScripts.map((s) => `'sha256-${createHash("sha256").update(s).digest("base64")}'`);
const csp = [
  "default-src 'self'",
  `script-src 'self' ${hashes.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");
html = html.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`);

writeFileSync(distIndex, html);
writeFileSync(join(root, "dist", "robots.txt"), mod.renderRobots());
const sitemap = mod.renderSitemap();
if (sitemap) writeFileSync(join(root, "dist", "sitemap.xml"), sitemap);
rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`prerender: dist/index.html gravado (${(html.length / 1024).toFixed(1)} kB).`);

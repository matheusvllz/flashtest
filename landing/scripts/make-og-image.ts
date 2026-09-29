// Imagem de compartilhamento 1200x630 (docs/40 §18): papel com pauta, o H1 da landing com o marca-texto, a Foca em
// contorno e o retrato REAL do hero. Renderizada com o Chromium do Playwright a partir de um HTML local que usa
// os mesmos tokens (lidos de src/styles/tokens.css) e as mesmas fontes da página. Só o H1 e "Foca" viram texto.
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { LP } from "../src/content/copy";
import { blockBody, extractBlock, parseVars } from "./lib/css-blocks";

const ROOT = resolve(import.meta.dir, "..");
const tokens = readFileSync(resolve(ROOT, "src/styles/tokens.css"), "utf8");
const v = parseVars(blockBody(extractBlock(tokens, /^:root\s*\{/m)!));
const cor = (n: string) => v.get(`--${n}`)!;
const url = (p: string) => pathToFileURL(resolve(ROOT, p)).href;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<style>
@font-face{font-family:"Space Grotesk";font-weight:300 700;src:url("${url("public/lp/fonts/space-grotesk-latin-wght.woff2")}") format("woff2")}
@font-face{font-family:"Plus Jakarta Sans";font-weight:200 800;src:url("${url("public/lp/fonts/plus-jakarta-sans-latin-wght.woff2")}") format("woff2")}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:${cor("neve")};color:#26262a;font-family:"Plus Jakarta Sans",sans-serif;position:relative;overflow:hidden}
.pauta{position:absolute;right:0;top:0;bottom:0;width:470px;background-image:repeating-linear-gradient(to bottom,transparent 0 27px,${cor("gelo")} 27px 28px);opacity:.75}
.txt{position:absolute;left:72px;top:96px;width:650px}
.eyebrow{font:700 20px "Space Grotesk";letter-spacing:.1em;text-transform:uppercase;color:${cor("mar-fundo")}}
h1{font:700 76px/1.04 "Space Grotesk";letter-spacing:-.03em;margin-top:22px;text-wrap:balance}
h1 span{display:block}
.hl{position:relative;display:inline-block;isolation:isolate;color:${cor("on-alert")}}
.hl::before{content:"";position:absolute;inset:.1em -.14em -.02em -.14em;z-index:-1;background:${cor("alert")};border-radius:6px;transform:rotate(-1.5deg)}
.marca{position:absolute;left:72px;bottom:60px;display:flex;align-items:center;gap:14px;font:700 34px "Space Grotesk";color:${cor("abismo")}}
.marca img{width:56px;height:56px}
.phone{position:absolute;right:92px;top:120px;width:330px;border:4px solid ${cor("abismo")};border-bottom:0;border-radius:32px 32px 0 0;background:${cor("neve")};overflow:hidden;bottom:0}
.phone img{display:block;width:100%}
.foca{position:absolute;right:388px;bottom:46px;width:150px;height:150px}
</style></head><body>
<div class="pauta"></div>
<div class="txt">
  <p class="eyebrow">${LP.hero.eyebrow}</p>
  <h1><span>${LP.hero.linha1}</span><span>${LP.hero.linha2Antes}<b class="hl" style="font-weight:700">${LP.hero.tituloDestaque}</b></span></h1>
</div>
<div class="marca"><img src="${url("public/lp/brand/foca-line-dark-192.png")}" alt="" />${LP.marca}</div>
<div class="phone"><img src="${url("public/lp/shots/hero-atividade-light-720.webp")}" alt="" /></div>
<img class="foca" src="${url("public/lp/brand/foca-color-240.webp")}" alt="" />
</body></html>`;

mkdirSync(resolve(ROOT, "assets-src"), { recursive: true });
const tmp = resolve(ROOT, "assets-src/og.html");
writeFileSync(tmp, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(tmp).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
const png = await page.screenshot({ type: "png" });
await browser.close();

mkdirSync(resolve(ROOT, "public/lp/og"), { recursive: true });
// Paleta reduzida: a arte é chapada, então o PNG cai para uma fração do tamanho sem perda visível.
await sharp(png).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(resolve(ROOT, "public/lp/og/og-landing.png"));
const meta = await sharp(resolve(ROOT, "public/lp/og/og-landing.png")).metadata();
console.log(`og OK: public/lp/og/og-landing.png ${meta.width}x${meta.height}`);

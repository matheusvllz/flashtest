// Imagem de compartilhamento 1200x630 (docs/40 §18): papel com pauta, o H1 da landing com o marca-texto e a logo
// oficial (Foca de frente colorida, 29/09/2026). Renderizada com o Chromium do Playwright a partir de um HTML local que usa
// os mesmos tokens (lidos do :root de src/styles.css) e as mesmas fontes da página. Só o H1 e "Foca" viram texto.
//
// Uso: bun scripts/marketing/og-image.ts   → public/og/og-landing.png (caminhos da landing integrada ao app, docs/44).
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { LP } from "../../src/marketing/content/copy";
import { blockBody, extractBlock, parseVars, readAppStyles } from "./css-blocks";

const ROOT = resolve(import.meta.dir, "..", "..");
const tokens = readAppStyles().css;
const v = parseVars(blockBody(extractBlock(tokens, /^:root\s*\{/m)!));
const cor = (n: string) => v.get(`--${n}`)!;
const url = (p: string) => pathToFileURL(resolve(ROOT, p)).href;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<style>
@font-face{font-family:"Space Grotesk";font-weight:300 700;src:url("${url("public/fonts/space-grotesk-latin-wght.woff2")}") format("woff2")}
@font-face{font-family:"Plus Jakarta Sans";font-weight:200 800;src:url("${url("public/fonts/plus-jakarta-sans-latin-wght.woff2")}") format("woff2")}
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
.marca img{width:60px;height:60px}
.foca{position:absolute;right:70px;top:125px;width:380px;height:380px}
</style></head><body>
<div class="pauta"></div>
<div class="txt">
  <p class="eyebrow">${LP.hero.eyebrow}</p>
  <h1><span>${LP.hero.pergunta}</span><span>${LP.hero.respostaAntes}<b class="hl" style="font-weight:700">${LP.hero.respostaDestaque}</b></span></h1>
</div>
<div class="marca"><img src="${url("public/branding/foca/foca-color-96.png")}" alt="" />${LP.marca}</div>
<img class="foca" src="${url("public/branding/foca/foca-color-320.png")}" alt="" />
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

mkdirSync(resolve(ROOT, "public/og"), { recursive: true });
// Paleta reduzida: a arte é chapada, então o PNG cai para uma fração do tamanho sem perda visível.
await sharp(png).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(resolve(ROOT, "public/og/og-landing.png"));
const meta = await sharp(resolve(ROOT, "public/og/og-landing.png")).metadata();
console.log(`og OK: public/og/og-landing.png ${meta.width}x${meta.height}`);

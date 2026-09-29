// Snapshot dos tokens e utilities do app (docs/40 §15.4). LÊ ../src/styles.css, ESCREVE landing/src/styles/*.
// A landing nunca importa o CSS do app: o app está mudando em paralelo e a landing escolhe quando sincronizar.
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { blockBody, extractBlock, readAppStyles } from "./lib/css-blocks";

const OUT = resolve(import.meta.dir, "../src/styles");
mkdirSync(OUT, { recursive: true });
const { css, hash } = readAppStyles();
const data = new Date().toISOString().slice(0, 10);

function need(name: string, block: string | null): string {
  if (!block) throw new Error(`Bloco não encontrado no styles.css do app: ${name}`);
  return block;
}

// ---- tokens.css ------------------------------------------------------------------------------
const theme = need("@theme inline", extractBlock(css, /^@theme inline\s*\{/m));
const root = need(":root", extractBlock(css, /^:root\s*\{/m));
const dark = need(".dark", extractBlock(css, /^\.dark\s*\{/m));

// Layout do app (--app-col etc.) não interessa à landing: sai do :root copiado.
const rootSemLayout = root
  .replace(/\n\s*\/\* Layout \(docs\/36[\s\S]*?\*\/\n/, "\n")
  .replace(/^\s*--(app-col|reading-col|path-col|nav-rail|bottom-nav-h):[^\n]*\n/gm, "");

// Modo escuro sem JS e sem flash: as mesmas variáveis do `.dark`, sob prefers-color-scheme.
const darkVars = blockBody(dark);

const tokens = `/* SNAPSHOT de src/styles.css (app) em ${data}, sha1 ${hash}.
   NAO edite valores aqui: rode "bun run sync:tokens" (le o app, escreve so em landing/).
   Regra do design system mantida: variavel base em :root/.dark, --color-* referenciando var()
   no @theme inline, nunca hex literal no @theme (docs/40 §12.4; CLAUDE.md, Design system). */
${theme}

${rootSemLayout}

/* Classe .dark (mesmas variaveis do app): util para testes e para um futuro seletor manual. */
${dark}

/* Tema do sistema, sem JS: espelho do bloco .dark acima (gerado). ".light" no <html> forca claro. */
@media (prefers-color-scheme: dark) {
  :root:not(.light) {${darkVars}}
}
`;
writeFileSync(resolve(OUT, "tokens.css"), tokens);

// ---- utilities.css ---------------------------------------------------------------------------
const UTILITIES = [
  "btn-primary",
  "btn-ghost",
  "card-soft",
  "chip",
  "chip-on",
  "surface-pauta",
  "mark-texto",
  "ds-label",
  "sheet",
  "anim-pop-in",
  "anim-slide-up",
  "anim-shake",
  "anim-bump",
  "anim-float-in",
];
const KEYFRAMES = ["ft-pop-in", "ft-slide-up", "ft-shake", "ft-bump", "ft-float-in"];

const parts: string[] = [];
for (const k of KEYFRAMES) parts.push(need(`@keyframes ${k}`, extractBlock(css, new RegExp(`^@keyframes ${k}\\s*\\{`, "m"))));
for (const u of UTILITIES) parts.push(need(`@utility ${u}`, extractBlock(css, new RegExp(`^@utility ${u}\\s*\\{`, "m"))));
parts.push(need("prefers-reduced-motion", extractBlock(css, /^@media \(prefers-reduced-motion: reduce\)\s*\{/m)));

const utilities = `/* SNAPSHOT das @utility e @keyframes usadas pela landing, copiadas de src/styles.css (app) em ${data}, sha1 ${hash}.
   NAO edite aqui: rode "bun run sync:tokens". */
${parts.join("\n\n")}
`;
writeFileSync(resolve(OUT, "utilities.css"), utilities);

console.log(`sync:tokens OK (app sha1 ${hash}): tokens.css e utilities.css gravados.`);

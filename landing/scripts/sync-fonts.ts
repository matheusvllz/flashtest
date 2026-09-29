// Copia os woff2 (subset latin) das dependências fontsource para public/lp/fonts, com URL estável
// (necessária para o <link rel="preload"> do head pré-renderizado). Docs/40 §15.2, §16.
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const nm = resolve(import.meta.dir, "../node_modules");
const out = resolve(import.meta.dir, "../public/lp/fonts");
mkdirSync(out, { recursive: true });

const FILES: [string, string][] = [
  ["@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2", "space-grotesk-latin-wght.woff2"],
  ["@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2", "plus-jakarta-sans-latin-wght.woff2"],
  ["@fontsource/space-mono/files/space-mono-latin-700-normal.woff2", "space-mono-latin-700.woff2"],
  ["@fontsource/caveat/files/caveat-latin-600-normal.woff2", "caveat-latin-600.woff2"],
];
for (const [from, to] of FILES) copyFileSync(resolve(nm, from), resolve(out, to));
console.log(`sync:fonts OK: ${FILES.length} arquivos em public/lp/fonts.`);

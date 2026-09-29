// Deriva de tokens (docs/40 §15.4): compara as variáveis do snapshot (landing) com as do app agora.
// SÓ AVISA (exit 0): o app muda em paralelo e a landing escolhe quando rodar `sync:tokens`.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { blockBody, extractBlock, parseVars, readAppStyles } from "./lib/css-blocks";

export interface TokenDrift {
  bloco: ":root" | ".dark";
  variavel: string;
  landing: string | undefined;
  app: string | undefined;
}

const SKIP = /^--(app-col|reading-col|path-col|nav-rail|bottom-nav-h)$/;

export function compareTokens(appCss: string, landingCss: string): TokenDrift[] {
  const out: TokenDrift[] = [];
  for (const [bloco, re] of [
    [":root", /^:root\s*\{/m],
    [".dark", /^\.dark\s*\{/m],
  ] as const) {
    const a = extractBlock(appCss, re);
    const l = extractBlock(landingCss, re);
    const av = a ? parseVars(blockBody(a)) : new Map<string, string>();
    const lv = l ? parseVars(blockBody(l)) : new Map<string, string>();
    for (const nome of new Set([...av.keys(), ...lv.keys()])) {
      if (SKIP.test(nome)) continue;
      if (av.get(nome) !== lv.get(nome)) out.push({ bloco, variavel: nome, landing: lv.get(nome), app: av.get(nome) });
    }
  }
  return out;
}

if (import.meta.main) {
  const { css } = readAppStyles();
  const snap = readFileSync(resolve(import.meta.dir, "../src/styles/tokens.css"), "utf8");
  const drift = compareTokens(css, snap);
  if (!drift.length) console.log("check:tokens OK: tokens da landing iguais aos do app.");
  else {
    console.warn(`check:tokens AVISO: ${drift.length} variavel(is) diferem do app. Rode "bun run sync:tokens" quando quiser sincronizar.`);
    for (const d of drift) console.warn(` - ${d.bloco} ${d.variavel}: landing=${d.landing ?? "(ausente)"} app=${d.app ?? "(ausente)"}`);
  }
}

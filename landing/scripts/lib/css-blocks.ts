// Utilidades de leitura do src/styles.css do app. SÓ LEITURA do app; a escrita é sempre em landing/.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const APP_STYLES = resolve(import.meta.dir, "../../../src/styles.css");

export function readAppStyles(): { css: string; hash: string } {
  const css = readFileSync(APP_STYLES, "utf8");
  const hash = createHash("sha1").update(css).digest("hex").slice(0, 10);
  return { css, hash };
}

/** Texto do primeiro bloco `{ ... }` que começa em `startRe`, com chaves balanceadas. `null` se não achar. */
export function extractBlock(css: string, startRe: RegExp): string | null {
  const m = startRe.exec(css);
  if (!m) return null;
  const open = css.indexOf("{", m.index);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    const c = css[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return css.slice(m.index, i + 1);
    }
  }
  return null;
}

/** Corpo entre as chaves externas de um bloco extraído. */
export function blockBody(block: string): string {
  return block.slice(block.indexOf("{") + 1, block.lastIndexOf("}"));
}

/** Declarações `--nome: valor;` de um corpo de bloco (ignora comentários). */
export function parseVars(body: string): Map<string, string> {
  const clean = body.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = new Map<string, string>();
  for (const m of clean.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) out.set(m[1], m[2].trim().replace(/\s+/g, " "));
  return out;
}

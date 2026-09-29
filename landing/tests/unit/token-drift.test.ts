import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { blockBody, extractBlock, parseVars, APP_STYLES } from "../../scripts/lib/css-blocks";
import { compareTokens } from "../../scripts/check-token-drift";

const tokensCss = readFileSync(resolve(import.meta.dir, "../../src/styles/tokens.css"), "utf8");

describe("tokens da landing (snapshot do app, docs/40 §15.4)", () => {
  test("@theme inline não tem hex literal (regra do design system: dark mode propaga por var())", () => {
    const theme = extractBlock(tokensCss, /^@theme inline\s*\{/m)!;
    const cores = theme.split("\n").filter((l) => /--color-/.test(l) && !l.trim().startsWith("/*"));
    expect(cores.length).toBeGreaterThan(10);
    for (const l of cores) expect(l).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  test("toda variável de cor do :root tem par no .dark", () => {
    const root = parseVars(blockBody(extractBlock(tokensCss, /^:root\s*\{/m)!));
    const dark = parseVars(blockBody(extractBlock(tokensCss, /^\.dark\s*\{/m)!));
    const semPar = [...root.keys()].filter((k) => /^--(abismo|mar|mar-fundo|gelo|neve|coral-claro|pelo|pelo-sombra|nevoa|cards|success|success-texto|alert|error|on-mar|on-success|on-error|on-alert)$/.test(k) && !dark.has(k));
    expect(semPar).toEqual([]);
  });

  test("o espelho prefers-color-scheme existe e repete o .dark", () => {
    expect(tokensCss).toContain("@media (prefers-color-scheme: dark)");
    const media = tokensCss.slice(tokensCss.indexOf("@media (prefers-color-scheme: dark)"));
    expect(media).toContain("--neve: #1c1b18");
    expect(media).toContain("--mar: #5c8cff");
  });

  test("deriva em relação ao app: só avisa (o app muda em paralelo)", () => {
    if (!existsSync(APP_STYLES)) return;
    const drift = compareTokens(readFileSync(APP_STYLES, "utf8"), tokensCss);
    if (drift.length) {
      console.warn(`[aviso] ${drift.length} variável(is) do app diferem do snapshot; rode "bun run sync:tokens" quando quiser sincronizar:`);
      for (const d of drift) console.warn(`  ${d.bloco} ${d.variavel}: landing=${d.landing} app=${d.app}`);
    }
    expect(Array.isArray(drift)).toBe(true);
  });
});

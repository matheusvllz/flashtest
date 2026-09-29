// Isolamento (docs/40 §15.8, G-2): nada em landing/ importa código de fora de landing/.
// Scripts podem LER arquivos do app (fs) para copiar tokens/assets, mas nunca importá-los.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const IMPORT_RE =
  /(?:import|export)\s[^"'`;]*?from\s*["']([^"']+)["']|import\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;

const IGNORED_DIRS = new Set(["node_modules", "dist", "dist-ssr", "assets-src", "test-results", "playwright-report"]);
const EXTS = [".ts", ".tsx", ".js", ".mjs", ".css"];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (IGNORED_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXTS.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

export interface IsolationViolation {
  file: string;
  specifier: string;
  reason: string;
}

/** Devolve as violações de isolamento em `landingRoot`. Vazio = isolado. */
export function findIsolationViolations(landingRoot: string): IsolationViolation[] {
  const root = resolve(landingRoot);
  const violations: IsolationViolation[] = [];
  const files = walk(root).filter((f) => !f.endsWith("check-isolation.ts") && !f.includes(`${sep}tests${sep}unit${sep}isolation.test.ts`));

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const specs: string[] = [];
    if (file.endsWith(".css")) {
      for (const m of text.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) specs.push(m[1]);
      for (const m of text.matchAll(/@source\s+["']([^"']+)["']/g)) specs.push(m[1]);
    } else {
      for (const m of text.matchAll(IMPORT_RE)) specs.push(m[1] ?? m[2] ?? m[3] ?? m[4]);
    }
    for (const spec of specs) {
      const rel = relative(root, file);
      if (spec.startsWith("@/") || spec === "@") {
        violations.push({ file: rel, specifier: spec, reason: 'alias "@/" pertence ao app' });
      } else if (spec.startsWith(".")) {
        const resolved = resolve(dirname(file), spec);
        const back = relative(root, resolved);
        if (back.startsWith("..") || resolve(root, back) !== resolved) {
          violations.push({ file: rel, specifier: spec, reason: "caminho relativo escapa de landing/" });
        }
      } else if (/^[a-zA-Z]:[\\/]/.test(spec) || spec.startsWith("/")) {
        // absoluto: só é ok se o arquivo estiver dentro de landing/ (assets públicos servidos pelo Vite usam /lp/...)
        if (!spec.startsWith("/lp/") && !spec.startsWith("/src/") && !spec.startsWith("/lp-assets/")) {
          const abs = resolve(spec);
          if (!abs.startsWith(root)) violations.push({ file: rel, specifier: spec, reason: "caminho absoluto fora de landing/" });
        }
      }
    }
  }
  return violations;
}

if (import.meta.main) {
  const v = findIsolationViolations(resolve(import.meta.dir, ".."));
  if (v.length) {
    console.error("Violações de isolamento:");
    for (const x of v) console.error(` - ${x.file}: "${x.specifier}" (${x.reason})`);
    process.exit(1);
  }
  console.log("check:isolation OK: nenhum import sai de landing/.");
}

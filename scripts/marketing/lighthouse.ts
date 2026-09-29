// Lighthouse contra o preview (docs/40 §16, G-18): 3 execuções mobile e 1 desktop, mediana por métrica.
// Usa o Chromium do Playwright (não exige Chrome instalado) e o `bunx lighthouse` (sem dependência no projeto).
// Uso: bun run lighthouse            (mobile x3 + desktop x1, contra http://localhost:4322)
//      bun scripts/lighthouse-run.ts --url=http://localhost:4322 --runs=3 --indexable   (SEO com build indexável)
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const arg = (n: string, d: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
const URL_ALVO = arg("url", "http://localhost:3100/"); // build de produção local: NITRO_PRESET=node-server (docs/44 §9)
const RUNS = Number(arg("runs", "3"));
const OUT = resolve(import.meta.dir, "../../test-results");
mkdirSync(OUT, { recursive: true });
const chrome = chromium.executablePath();

async function rodar(nome: string, preset: "mobile" | "desktop") {
  const arquivo = resolve(OUT, `lh-${nome}.json`);
  const args = [
    "lighthouse",
    URL_ALVO,
    `--chrome-path=${chrome}`,
    "--chrome-flags=--headless=new --no-sandbox",
    "--only-categories=performance,accessibility,best-practices,seo",
    ...(preset === "desktop" ? ["--preset=desktop"] : ["--form-factor=mobile", "--screenEmulation.mobile=true"]),
    "--output=json",
    `--output-path=${arquivo}`,
    "--quiet",
  ];
  const p = Bun.spawn(["bunx", ...args], { stdout: "ignore", stderr: "ignore" });
  await p.exited;
  const r = JSON.parse(readFileSync(arquivo, "utf8"));
  const a = r.audits;
  return {
    perf: Math.round(r.categories.performance.score * 100),
    a11y: Math.round(r.categories.accessibility.score * 100),
    bp: Math.round(r.categories["best-practices"].score * 100),
    seo: Math.round(r.categories.seo.score * 100),
    fcp: a["first-contentful-paint"].numericValue as number,
    lcp: a["largest-contentful-paint"].numericValue as number,
    cls: a["cumulative-layout-shift"].numericValue as number,
    tbt: a["total-blocking-time"].numericValue as number,
  };
}

const mediana = (v: number[]) => [...v].sort((x, y) => x - y)[Math.floor(v.length / 2)];
async function resumo(nome: string, preset: "mobile" | "desktop", n: number) {
  const rs: Awaited<ReturnType<typeof rodar>>[] = [];
  for (let i = 1; i <= n; i++) rs.push(await rodar(`${nome}-${i}`, preset));
  const m = (k: keyof (typeof rs)[number]) => mediana(rs.map((r) => r[k]));
  console.log(
    `${nome.padEnd(8)} n=${n}  perf ${m("perf")}  a11y ${m("a11y")}  bp ${m("bp")}  seo ${m("seo")}  |  FCP ${(m("fcp") / 1000).toFixed(2)}s  LCP ${(m("lcp") / 1000).toFixed(2)}s  CLS ${m("cls").toFixed(3)}  TBT ${Math.round(m("tbt"))}ms   (perf de cada rodada: ${rs.map((r) => r.perf).join(", ")})`,
  );
}

await resumo("mobile", "mobile", RUNS);
await resumo("desktop", "desktop", 1);

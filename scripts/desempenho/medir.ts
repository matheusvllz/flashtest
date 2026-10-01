/**
 * Medição de desempenho no celular (spec 48 T-48.9.1/T-48.9.2, RF-19). Cenário fixo e repetível:
 * - viewport 390×844, toque, CPU 4× mais lenta (CDP `Emulation.setCPUThrottlingRate`);
 * - rede "4G lenta": 150 ms de latência, 1,6 Mbit/s de descida, 750 kbit/s de subida (CDP `Network.emulateNetworkConditions`);
 * - cache vazio a cada medição (contexto novo);
 * - build de PRODUÇÃO local com compressão: `NITRO_PRESET=node-server bun run build`, `PORT=3100 node .output/server/index.mjs`
 *   e `bun scripts/marketing/proxy-comprimido.ts` (porta 3200). Sem variáveis de conta = modo de demonstração; a
 *   entrada local é o cookie `foca_demo=1`, e o estado do aluno é semeado no `localStorage`.
 *
 * Mede por rota: FCP, LCP, JS transferido (bytes comprimidos de scripts), total de bytes, soma de tarefas longas
 * (> 50 ms) até a carga estabilizar, e — na atividade — a latência de uma interação (toque na alternativa → feedback na
 * tela). Mediana de N execuções.
 *
 *   bun scripts/desempenho/medir.ts --url=http://localhost:3200 --runs=3 --saida=docs/specs/48-integracao-e-evolucao/desempenho-medicao.json
 *
 * Limitação: emulação no desktop não é um celular real (memória, GPU, rede real); serve para comparar antes e depois
 * no MESMO cenário, não como número absoluto.
 */
import { chromium, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";

const arg = (n: string, d: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
const BASE = arg("url", "http://localhost:3200");
const RUNS = Number(arg("runs", "3"));
const SAIDA = arg("saida", "");

const ESTADO_ALUNO = {
  authed: true,
  onboarded: true,
  prefs: { name: "Ana", sound: false, haptics: false, theme: "light", dailyLessons: 3, onboardingVersion: 2 },
  progress: { xp: 120, streak: 3, lessonsCompleted: 1, completedQuestions: [] },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

interface Medida {
  fcp: number;
  lcp: number;
  jsKB: number;
  totalKB: number;
  tarefasLongasMs: number;
  interacaoMs?: number;
}

async function novaPagina(comAluno: boolean) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  if (comAluno) {
    await context.addCookies([{ name: "foca_demo", value: "1", url: BASE }]);
    await context.addInitScript((estado) => {
      if (!localStorage.getItem("foca.state.v3")) localStorage.setItem("foca.state.v3", JSON.stringify(estado));
    }, ESTADO_ALUNO);
  }
  await context.addInitScript(() => {
    const w = window as unknown as { __lcp: number; __longas: number };
    w.__lcp = 0;
    w.__longas = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) w.__lcp = e.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) w.__longas += e.duration - 50;
    }).observe({ type: "longtask", buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const bytes = { js: 0, total: 0 };
  const tipos = new Map<string, string>();
  cdp.on("Network.responseReceived", (e) => tipos.set(e.requestId, e.type));
  cdp.on("Network.loadingFinished", (e) => {
    bytes.total += e.encodedDataLength;
    if (tipos.get(e.requestId) === "Script") bytes.js += e.encodedDataLength;
  });
  return { browser, page, bytes };
}

async function coletar(page: Page, bytes: { js: number; total: number }): Promise<Medida> {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  const m = await page.evaluate(() => {
    const w = window as unknown as { __lcp: number; __longas: number };
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
    return { fcp, lcp: w.__lcp, longas: w.__longas };
  });
  return { fcp: Math.round(m.fcp), lcp: Math.round(m.lcp), jsKB: Math.round(bytes.js / 1024), totalKB: Math.round(bytes.total / 1024), tarefasLongasMs: Math.round(m.longas) };
}

const ROTAS: Array<{ nome: string; caminho: string; aluno: boolean; interacao?: (p: Page) => Promise<number> }> = [
  { nome: "landing", caminho: "/", aluno: false },
  { nome: "quiz", caminho: "/quiz", aluno: false },
  { nome: "trilha", caminho: "/trilha", aluno: true },
  {
    nome: "atividade (aula de 60s)",
    caminho: "/study",
    aluno: true,
    interacao: async (p) => {
      await p.getByRole("button", { name: "Responder" }).waitFor({ timeout: 60_000 });
      const alternativa = p.locator("div.mt-5.flex.flex-col.gap-3 > button").first();
      await alternativa.waitFor();
      const t0 = await p.evaluate(() => performance.now());
      await alternativa.click();
      await p.getByRole("button", { name: "Responder" }).click();
      await p.locator('[role="status"]').first().waitFor();
      return Math.round((await p.evaluate(() => performance.now())) - t0);
    },
  },
];

const mediana = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const resultado: Record<string, Medida> = {};
for (const rota of ROTAS) {
  const medidas: Medida[] = [];
  for (let i = 0; i < RUNS; i++) {
    const { browser, page, bytes } = await novaPagina(rota.aluno);
    try {
      await page.goto(BASE + rota.caminho, { waitUntil: "domcontentloaded", timeout: 120_000 });
      const m = await coletar(page, bytes);
      if (rota.interacao) m.interacaoMs = await rota.interacao(page);
      medidas.push(m);
    } finally {
      await browser.close();
    }
  }
  const chaves = Object.keys(medidas[0]) as (keyof Medida)[];
  resultado[rota.nome] = Object.fromEntries(chaves.map((k) => [k, mediana(medidas.map((m) => m[k] ?? 0))])) as unknown as Medida;
  console.log(rota.nome.padEnd(26), JSON.stringify(resultado[rota.nome]));
}
if (SAIDA) writeFileSync(SAIDA, JSON.stringify({ base: BASE, runs: RUNS, cenario: "390x844, CPU 4x, 4G lenta (150 ms, 1,6 Mbit/s)", medidoEm: new Date().toISOString(), resultado }, null, 2) + "\n");

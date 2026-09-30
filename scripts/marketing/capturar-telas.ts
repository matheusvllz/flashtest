// Retratos REAIS do produto (docs/40 §14). Roda o app de verdade (já iniciado em APP_URL, padrão :8080),
// semeia o estado local do jeito que o motor gravaria, tira screenshots de cada tela em claro e escuro
// e gera AVIF/WebP em 2 larguras. Nada é desenhado à mão: cada pixel vem da interface do app.
//
// Uso:  bun run shots            (todos)    |    bun scripts/marketing/capturar-telas.ts --only=hero-atividade,quiz-prova
//
// O app NÃO é iniciado nem alterado por este script. Os PNGs mestres ficam em assets-src/ (gitignorado);
// os derivados vão para assets-src/shots-web/ e as dimensões para assets-src/shots-meta.ts (referência visual das
// telas refeitas em HTML, src/components/app/screens.tsx; docs/42 §7).
import { chromium, type BrowserContext, type Page } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const APP = (process.env.APP_URL ?? "http://localhost:8080").replace(/\/+$/, "");
const ROOT = resolve(import.meta.dir, "..", "..");
// v2 (docs/42 §7): a página não usa mais imagens das telas (elas são HTML). Os retratos viram referência visual.
const OUT = resolve(ROOT, "assets-src/shots-web");
const MASTER = resolve(ROOT, "assets-src/shots");
const MANIFEST = resolve(OUT, "manifest.json");
mkdirSync(OUT, { recursive: true });
mkdirSync(MASTER, { recursive: true });

const STORAGE_KEY = "foca.state.v3";
const VIEWPORT = { width: 390, height: 844 };
const WIDTHS = [360, 720];
const THEMES = ["light", "dark"] as const;
type Theme = (typeof THEMES)[number];

interface ShotMeta {
  /** Dimensões CSS da captura (razão de aspecto para o <img>). */
  width: number;
  height: number;
  widths: number[];
}

/* ------------------------------------------------------------------ estado semeado */

// Usuário onboarded mínimo. Mesma forma que o app grava; o nome é fictício.
const USUARIO = {
  authed: true,
  onboarded: true,
  prefs: { name: "Luan", sound: false, haptics: false, theme: "auto", dailyLessons: 3 },
  progress: { xp: 100, streak: 2, lessonsCompleted: 1, completedQuestions: [] },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

interface AtividadeSeed {
  id: string;
  kind: "aula" | "pratica" | "revisao" | "desafio" | "reforco";
  reason: string;
}

/** Atividades planejadas com a forma que o motor grava (docs/36 `estado.ts` mostra o contrato). */
function comAtividades(atividades: AtividadeSeed[]) {
  return {
    ...USUARIO,
    learning: {
      journey: {
        committed: atividades.map((a) => ({
          id: a.id,
          kind: a.kind,
          skillIds: ["mat:porcentagem-conceito"],
          subjectId: "mat",
          estimatedMinutes: 2,
          reasons: [a.reason],
          score: 1,
          scoreBreakdown: {},
          targetP: 0.7,
        })),
        upcoming: [],
        history: [],
        activeActivity: null,
        sinceCheckpoint: 0,
        lastCheckpointDate: null,
        planVersion: 2,
      },
    },
  };
}

/* ------------------------------------------------------------------ infraestrutura */

async function novoContexto(browser: import("@playwright/test").Browser, estado?: unknown): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 3,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    colorScheme: "light",
    reducedMotion: "reduce", // sem animação no meio da captura
  });
  if (estado) {
    await ctx.addInitScript(
      ({ k, raw }) => {
        try {
          if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(raw));
        } catch {
          /* storage bloqueado */
        }
      },
      { k: STORAGE_KEY, raw: estado },
    );
  }
  return ctx;
}

async function setTheme(page: Page, theme: Theme) {
  await page.evaluate((t) => document.documentElement.classList.toggle("dark", t === "dark"), theme);
  await page.waitForTimeout(250);
}

const manifest: Record<string, ShotMeta> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};

/** Tira o retrato em claro e escuro, grava o PNG mestre e os derivados AVIF/WebP. */
async function salvar(page: Page, id: string, clip: { x: number; y: number; width: number; height: number }) {
  for (const theme of THEMES) {
    await setTheme(page, theme);
    const png = await page.screenshot({ clip, type: "png" });
    writeFileSync(resolve(MASTER, `${id}-${theme}.png`), png);
    for (const w of WIDTHS) {
      const base = sharp(png).resize({ width: w });
      await base.clone().avif({ quality: 55 }).toFile(resolve(OUT, `${id}-${theme}-${w}.avif`));
      await base.clone().webp({ quality: 72 }).toFile(resolve(OUT, `${id}-${theme}-${w}.webp`));
    }
  }
  await setTheme(page, "light");
  manifest[id] = { width: clip.width, height: clip.height, widths: WIDTHS };
  console.log(`  ${id}: ${clip.width}x${clip.height} css px, ${THEMES.length * WIDTHS.length * 2} arquivos`);
}

/* ------------------------------------------------------------------ respostas certas (pacotes do app) */

type Pacote = { items?: { id: string; exercise?: { type?: string; opcoes?: string[]; correta?: number } }[] };
let mapaOpcoes: Map<string, string> | null = null;

/** Mapa "conjunto de alternativas" → texto da alternativa certa, lido dos pacotes de conteúdo servidos pelo app. */
async function carregarGabaritos(): Promise<Map<string, string>> {
  if (mapaOpcoes) return mapaOpcoes;
  const mapa = new Map<string, string>();
  const man = (await (await fetch(`${APP}/content/v1/manifest.json`)).json()) as { subjects: Record<string, { path: string }> };
  for (const s of Object.values(man.subjects)) {
    const pack = (await (await fetch(`${APP}${s.path}`)).json()) as Pacote;
    for (const it of pack.items ?? []) {
      const ex = it.exercise;
      if (ex?.type === "multipla-escolha" && ex.opcoes && typeof ex.correta === "number") {
        mapa.set([...ex.opcoes].map((o) => o.trim()).sort().join("||"), ex.opcoes[ex.correta].trim());
      }
    }
  }
  mapaOpcoes = mapa;
  return mapa;
}

async function alternativas(page: Page): Promise<string[]> {
  return (await page.locator("[role=radio]").allInnerTexts()).map((t) => t.trim());
}

/** Clica na alternativa certa (se o item está nos pacotes), errada ("errada") ou devolve `false` se não achou o gabarito. */
async function escolher(page: Page, quero: "certa" | "errada"): Promise<boolean> {
  const gab = await carregarGabaritos();
  const opts = await alternativas(page);
  const certa = gab.get([...opts].sort().join("||"));
  if (!certa) return false;
  const alvo = quero === "certa" ? certa : opts.find((o) => o !== certa)!;
  await page.locator("[role=radio]").filter({ hasText: alvo }).first().click();
  return true;
}

/* ------------------------------------------------------------------ retratos */

async function quizProva(browser: import("@playwright/test").Browser) {
  const ctx = await novoContexto(browser);
  const page = await ctx.newPage();
  await page.goto(`${APP}/quiz`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500); // hidratação (dev)
  await page.locator("input").first().fill("Luan");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByText("Em que ponto você está?").waitFor();
  await page.waitForTimeout(700); // transição entre passos
  await page.getByRole("button", { name: "3º ano do ensino médio" }).click(); // escolha única: avança sozinho
  await page.getByText("Qual prova você está estudando pra fazer?").waitFor();
  await page.getByRole("button", { name: "ENEM", exact: true }).click();
  await page.waitForTimeout(400);
  // Recorte acima do campo de data: o placeholder nativo do headless sai em inglês (dd/mm/yyyy), que o aluno não vê.
  await salvar(page, "quiz-prova", { x: 0, y: 0, width: 390, height: 432 });
  await ctx.close();
}

/** Tela de abertura de uma atividade sintética: a Foca diz o motivo. */
async function aberturaAtividade(browser: import("@playwright/test").Browser, id: string, atividade: AtividadeSeed, textoEsperado: string) {
  const ctx = await novoContexto(browser, comAtividades([atividade, { id: "atv-2", kind: "pratica", reason: "consolidar" }, { id: "atv-3", kind: "pratica", reason: "consolidar" }]));
  const page = await ctx.newPage();
  await page.goto(`${APP}/atividade/${atividade.id}`, { waitUntil: "networkidle" });
  await page.getByText(textoEsperado).first().waitFor({ timeout: 15_000 });
  await page.waitForTimeout(500);
  await salvar(page, id, { x: 0, y: 0, width: 390, height: 380 });
  await ctx.close();
}

/** Lição com resposta errada: folha de feedback com "Explicar melhor". Repete até a Foca dizer a fala escolhida (todas são reais). */
async function feedbackEExplicar(browser: import("@playwright/test").Browser, quais: Set<string>) {
  const FALA = "Marquei aqui. Bora ver onde travou.";
  for (let tentativa = 1; tentativa <= 15; tentativa++) {
    const ctx = await novoContexto(browser, comAtividades([{ id: "atv-fb", kind: "pratica", reason: "consolidar" }, { id: "atv-2", kind: "pratica", reason: "consolidar" }, { id: "atv-3", kind: "pratica", reason: "consolidar" }]));
    const page = await ctx.newPage();
    await page.goto(`${APP}/atividade/atv-fb`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Começar" }).click();
    await page.locator("[role=radio]").first().waitFor();
    const achou = await escolher(page, "errada");
    if (!achou) {
      console.log("  aviso: item fora dos pacotes; escolhendo a última alternativa");
      await page.locator("[role=radio]").last().click();
    }
    await page.getByRole("button", { name: "Verificar" }).click();
    const status = page.locator('[role="status"]');
    await status.waitFor();
    await page.waitForTimeout(600);
    const texto = (await status.innerText()).trim();
    const eErro = (await page.getByRole("button", { name: "Explicar melhor" }).count()) > 0;
    if (eErro && texto.includes(FALA)) {
      if (quais.has("feedback-explicar")) await salvar(page, "feedback-explicar", { x: 0, y: 0, width: 390, height: 745 });
      if (quais.has("tutor-balao")) {
        await page.getByRole("button", { name: "Explicar melhor" }).click();
        await page.getByText("Você marcou").waitFor({ timeout: 15_000 });
        await page.waitForTimeout(800);
        await salvar(page, "tutor-balao", { x: 0, y: 0, width: 390, height: 844 });
      }
      await ctx.close();
      return;
    }
    await ctx.close();
  }
  throw new Error(`Não consegui a fala "${FALA}" em 15 tentativas.`);
}

/** Nivelamento até o resultado (respostas determinísticas: ~2/3 certas, algumas "Não sei"). /progress não vira retrato: ainda usa "Dominado"/"Lacuna"/% (docs/41). */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uma rodada de nivelamento até o resultado. Respostas pseudo-aleatórias com semente (~60% certas, algumas "Não sei"). */
async function rodarNivelamento(browser: import("@playwright/test").Browser, semente: number) {
  const rnd = mulberry32(semente);
  const ctx = await novoContexto(browser, USUARIO);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("  pageerror:", e.message));
  await page.goto(`${APP}/nivelamento`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const naoSei = page.getByRole("button", { name: "Não sei" });
  let i = 0;
  for (; i < 80; i++) {
    if (await page.getByText("Sua trilha foi ajustada").count()) break;
    if ((await page.locator("[role=radio]").count()) > 0 && (await page.locator("[role=radio]").first().isEnabled())) {
      const r = rnd();
      const politica = r < 0.12 ? "naosei" : r < 0.55 ? "errada" : "certa";
      if (politica === "naosei") await naoSei.click();
      else {
        const ok = await escolher(page, politica);
        if (!ok) await naoSei.click();
        else await page.getByRole("button", { name: "Verificar" }).click();
      }
      await page.waitForTimeout(350);
      continue;
    }
    const avancar = page.getByRole("button", { name: /^(Continuar|Próxima|Próximo|Ver resultado|Concluir|Começar|Ver a trilha)/ }).first();
    if (await avancar.isVisible().catch(() => false)) {
      await avancar.click();
      await page.waitForTimeout(500);
    } else await page.waitForTimeout(500);
  }
  await page.getByText("Sua trilha foi ajustada").waitFor({ timeout: 10_000 });
  await page.waitForTimeout(600);
  return { ctx, page, passos: i };
}

/**
 * Nivelamento até o resultado. Repete com outra semente até o resultado mostrar variedade real de faixas
 * (pelo menos "Base em construção" e "No caminho"): mostrar só uma faixa não explicaria o que a tela faz.
 * Todas as rodadas são usos reais do app; só escolhemos a que ilustra melhor. /progress não vira retrato:
 * ainda usa "Dominado"/"Lacuna"/% (docs/41, F6).
 */
async function nivelamento(browser: import("@playwright/test").Browser) {
  for (let tentativa = 0; tentativa < 8; tentativa++) {
    const { ctx, page, passos } = await rodarNivelamento(browser, 7000 + tentativa);
    const corpo = await page.evaluate(() => document.body.innerText);
    const variado = corpo.includes("Base em construção") && corpo.includes("No caminho");
    console.log(`  nivelamento (semente ${7000 + tentativa}): ${passos} passos, variado=${variado}`);
    if (!variado) {
      await ctx.close();
      continue;
    }
    await page.setViewportSize({ width: 390, height: 1100 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const titulo = await page.getByText("Sua trilha foi ajustada").boundingBox();
    const botao = await page.getByRole("button", { name: "Começar" }).boundingBox();
    if (!titulo || !botao) throw new Error("não achei título/botão do resultado");
    const y = Math.max(0, Math.floor(titulo.y - 28));
    const height = Math.ceil(botao.y + botao.height + 28 - y);
    await salvar(page, "nivelamento-resultado", { x: 0, y, width: 390, height });
    await ctx.close();
    return;
  }
  throw new Error("Nenhuma rodada de nivelamento mostrou faixas variadas em 8 tentativas.");
}

/* ------------------------------------------------------------------ main */

const ALL = ["quiz-prova", "hero-atividade", "atividade-consolidar", "atividade-motivo", "feedback-explicar", "tutor-balao", "nivelamento-resultado"];
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const quais = new Set(onlyArg ? onlyArg.slice(7).split(",") : ALL);

/** O dev server do app recarrega a página quando outra sessão edita src/: cada retrato tem até 3 tentativas. */
async function comRetentativa(nome: string, fn: () => Promise<void>) {
  for (let t = 1; t <= 3; t++) {
    try {
      await fn();
      return;
    } catch (e) {
      console.log(`  tentativa ${t}/3 de ${nome} falhou: ${(e as Error).message.split("\n")[0]}`);
      if (t === 3) throw e;
    }
  }
}

const browser = await chromium.launch();
try {
  const r = await fetch(APP).catch(() => null);
  if (!r || !r.ok) throw new Error(`O app não responde em ${APP}. Inicie o app (bun run dev na raiz) antes de capturar.`);
  console.log(`Capturando de ${APP}: ${[...quais].join(", ")}`);

  if (quais.has("quiz-prova")) await comRetentativa("quiz-prova", () => quizProva(browser));
  if (quais.has("hero-atividade"))
    await comRetentativa("hero-atividade", () => aberturaAtividade(browser, "hero-atividade", { id: "atv-hero", kind: "reforco", reason: "reforco-erros" }, "Essa travou duas vezes. Vamos por partes, com calma."));
  if (quais.has("atividade-consolidar"))
    await comRetentativa("atividade-consolidar", () => aberturaAtividade(browser, "atividade-consolidar", { id: "atv-consolidar", kind: "pratica", reason: "consolidar" }, "Você foi bem nesse assunto. Antes de avançar, mais umas questões pra firmar."));
  if (quais.has("atividade-motivo"))
    await comRetentativa("atividade-motivo", () => aberturaAtividade(browser, "atividade-motivo", { id: "atv-motivo", kind: "revisao", reason: "revisao-atrasada" }, "Já faz um tempo que você não revisa isso. Vamos recuperar antes que esfrie."));
  if (quais.has("feedback-explicar") || quais.has("tutor-balao")) await comRetentativa("feedback", () => feedbackEExplicar(browser, quais));
  if (quais.has("nivelamento-resultado")) await nivelamento(browser);
} finally {
  await browser.close();
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  // src/content/shots.ts: dimensões (razão de aspecto → zero CLS). Textos alternativos vivem em copy.ts.
  const linhas = Object.entries(manifest)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, m]) => `  "${id}": { width: ${m.width}, height: ${m.height}, widths: [${m.widths.join(", ")}] },`)
    .join("\n");
  writeFileSync(
    resolve(ROOT, "assets-src/shots-meta.ts"),
    `// AUTOGERADO por scripts/marketing/capturar-telas.ts (bun run shots). Não edite à mão.\n// Dimensões CSS de cada retrato real do app; arquivos em /lp/shots/<id>-<tema>-<largura>.<avif|webp>.\nexport interface ShotMeta {\n  width: number;\n  height: number;\n  widths: number[];\n}\n\nexport const SHOTS = {\n${linhas}\n} as const satisfies Record<string, ShotMeta>;\n\nexport type ShotId = keyof typeof SHOTS;\n`,
  );
}

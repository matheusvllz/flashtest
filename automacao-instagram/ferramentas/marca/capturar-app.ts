/**
 * Retratos REAIS do app para os stories (tutorial com anotacao).
 *
 *   bun ferramentas/marca/capturar-app.ts                 todas as telas
 *   bun ferramentas/marca/capturar-app.ts --so=a,b        so algumas
 *   APP_URL=http://localhost:8080 (padrao)                o app precisa estar rodando (bun run dev na raiz)
 *
 * Roda o app de verdade, semeia o estado local do jeito que o motor grava e fotografa cada tela.
 * Nada e desenhado a mao: cada pixel vem da interface. Alem do PNG, grava as caixas dos elementos
 * que o story vai circular ("alvos"), em px CSS da captura — assim a anotacao cai exatamente
 * em cima do botao real, e nao num lugar chutado.
 *
 * Saida: marca/telas-app/<nome>.png (DSF 3) + <nome>.json { largura, altura, dsf, alvos }.
 * So LE o app; nao escreve nada fora desta pasta.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser, type Locator, type Page } from "playwright-core";
import { acharChromium } from "../lib/chromium.ts";
import { P } from "../lib/paths.ts";

const APP = (process.env.APP_URL ?? "http://localhost:8080").replace(/\/+$/, "");
export const TELAS_APP = join(P.marca, "telas-app");
const DSF = 3;
const CEL = { width: 390, height: 844 };
const CHAVE = "foca.state.v3";

type Caixa = { x: number; y: number; w: number; h: number };
export type RetratoMeta = {
  nome: string;
  largura: number;
  altura: number;
  dsf: number;
  capturadoEm: string;
  rota: string;
  alvos: Record<string, Caixa>;
};

// Aluno ficticio, com a mesma forma que o app grava (nome ficticio).
const USUARIO = {
  authed: true,
  onboarded: true,
  prefs: { name: "Luan", sound: false, haptics: false, theme: "light", dailyLessons: 3 },
  progress: { xp: 140, streak: 3, lessonsCompleted: 4, completedQuestions: [] },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

type Atv = { id: string; kind: "aula" | "pratica" | "revisao" | "desafio" | "reforco"; reason: string };

function comAtividades(atvs: Atv[]) {
  return {
    ...USUARIO,
    learning: {
      journey: {
        committed: atvs.map((a) => ({
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

const FILA_PADRAO: Atv[] = [
  { id: "atv-1", kind: "revisao", reason: "revisao-atrasada" },
  { id: "atv-2", kind: "pratica", reason: "consolidar" },
  { id: "atv-3", kind: "pratica", reason: "consolidar" },
];

async function contexto(b: Browser, estado?: unknown, viewport = CEL, dsf = DSF) {
  const ctx = await b.newContext({
    viewport,
    deviceScaleFactor: dsf,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  if (estado)
    await ctx.addInitScript(
      ({ k, v }) => {
        try {
          if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(v));
        } catch {
          /* storage bloqueado */
        }
      },
      { k: CHAVE, v: estado },
    );
  return ctx;
}

async function caixa(l: Locator): Promise<Caixa | null> {
  const b = await l.boundingBox().catch(() => null);
  return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
}

/** Fotografa a pagina inteira (ate `altura` px CSS) e grava PNG + caixas dos alvos. */
async function retratar(page: Page, nome: string, alvos: Record<string, Locator>, altura?: number) {
  const vp = page.viewportSize()!;
  const h = altura ?? vp.height;
  if (h > vp.height) await page.setViewportSize({ width: vp.width, height: h });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const caixas: Record<string, Caixa> = {};
  for (const [k, l] of Object.entries(alvos)) {
    const c = await caixa(l.first());
    if (c) caixas[k] = c;
    else console.log(`  aviso: alvo "${k}" nao encontrado em ${nome}`);
  }
  mkdirSync(TELAS_APP, { recursive: true });
  await page.screenshot({ path: join(TELAS_APP, `${nome}.png`), clip: { x: 0, y: 0, width: vp.width, height: h } });
  const meta: RetratoMeta = {
    nome,
    largura: vp.width,
    altura: h,
    dsf: DSF,
    capturadoEm: new Date().toISOString(),
    rota: new URL(page.url()).pathname,
    alvos: caixas,
  };
  writeFileSync(join(TELAS_APP, `${nome}.json`), JSON.stringify(meta, null, 2) + "\n");
  console.log(`  ${nome}: ${vp.width}x${h}, alvos: ${Object.keys(caixas).join(", ") || "-"}`);
}

/* ------------------------------------------------------------------ gabarito (para errar/acertar de proposito) */

type Pacote = { items?: { exercise?: { type?: string; opcoes?: string[]; correta?: number } }[] };
let gabaritos: Map<string, string> | null = null;
async function gabarito() {
  if (gabaritos) return gabaritos;
  const m = new Map<string, string>();
  const man = (await (await fetch(`${APP}/content/v1/manifest.json`)).json()) as {
    subjects: Record<string, { path: string }>;
  };
  for (const s of Object.values(man.subjects)) {
    const pack = (await (await fetch(`${APP}${s.path}`)).json()) as Pacote;
    for (const it of pack.items ?? []) {
      const ex = it.exercise;
      if (ex?.type === "multipla-escolha" && ex.opcoes && typeof ex.correta === "number")
        m.set([...ex.opcoes].map((o) => o.trim()).sort().join("||"), ex.opcoes[ex.correta].trim());
    }
  }
  gabaritos = m;
  return m;
}
async function escolher(page: Page, quero: "certa" | "errada") {
  const opts = (await page.locator("[role=radio]").allInnerTexts()).map((t) => t.trim());
  const certa = (await gabarito()).get([...opts].sort().join("||"));
  if (!certa) return false;
  const alvo = quero === "certa" ? certa : opts.find((o) => o !== certa)!;
  await page.locator("[role=radio]").filter({ hasText: alvo }).first().click();
  return true;
}

/* ------------------------------------------------------------------ telas */

const botao = (page: Page, nome: string | RegExp) => page.getByRole("button", { name: nome });

const TELAS: Record<string, (b: Browser) => Promise<void>> = {
  async "quiz-nome"(b) {
    const ctx = await contexto(b);
    const page = await ctx.newPage();
    await page.goto(`${APP}/quiz`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await page.locator("input").first().fill("Luan");
    await retratar(page, "quiz-nome", { campo: page.locator("input"), continuar: botao(page, "Continuar") });
    await ctx.close();
  },

  async "quiz-prova"(b) {
    const ctx = await contexto(b);
    const page = await ctx.newPage();
    await page.goto(`${APP}/quiz`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await page.locator("input").first().fill("Luan");
    await botao(page, "Continuar").click();
    await page.getByText("Em que ponto você está?").waitFor();
    await page.waitForTimeout(700);
    await botao(page, "3º ano do ensino médio").click();
    await page.getByText("Qual prova você está estudando pra fazer?").waitFor();
    await page.waitForTimeout(700);
    await retratar(page, "quiz-prova", { enem: page.getByRole("button", { name: "ENEM", exact: true }) });
    await ctx.close();
  },

  async "trilha-home"(b) {
    const ctx = await contexto(b, comAtividades(FILA_PADRAO));
    const page = await ctx.newPage();
    await page.goto(`${APP}/trilha`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await retratar(page, "trilha-home", {
      cta: page.getByRole("link", { name: /Começar|Continuar/ }).or(botao(page, /Começar|Continuar/)),
      card: page.getByText("Começar por aqui", { exact: false }).first().locator("xpath=ancestor::*[contains(@class,'rounded')][1]"),
      falaFoca: page.getByText("Voltou.", { exact: false }),
      tituloCard: page.getByText(/^Revisão · /).first(),
      motivoCard: page.getByText("Já faz um tempo", { exact: false }),
      // "~N min" e estimativa do plano, nao medicao: nunca pode aparecer num recorte de marketing (docs/copy/01 §6)
      minutos: page.getByText(/~\s?\d+\s?min/),
      nivelamento: botao(page, "Fazer nivelamento"),
      agoraNao: botao(page, "Agora não"),
      caminho: page.getByText("Atual", { exact: true }),
      nav: page.getByRole("navigation").last(),
      aprender: page.getByRole("link", { name: "Aprender" }),
      praticar: page.getByRole("link", { name: "Praticar" }),
      progresso: page.getByRole("link", { name: "Progresso" }),
      perfil: page.getByRole("link", { name: "Perfil" }),
    });
    await ctx.close();
  },

  async "trilha-desktop"(b) {
    const ctx = await contexto(b, comAtividades(FILA_PADRAO), { width: 1440, height: 900 }, 2);
    const page = await ctx.newPage();
    await page.goto(`${APP}/trilha`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await retratar(page, "trilha-desktop", {});
    await ctx.close();
  },

  async "atividade-revisao"(b) {
    await abertura(b, "atividade-revisao", { id: "atv-r", kind: "revisao", reason: "revisao-atrasada" });
  },
  async "atividade-reforco"(b) {
    await abertura(b, "atividade-reforco", { id: "atv-f", kind: "reforco", reason: "reforco-erros" });
  },
  async "atividade-consolidar"(b) {
    await abertura(b, "atividade-consolidar", { id: "atv-c", kind: "pratica", reason: "consolidar" });
  },

  async questao(b) {
    const { ctx, page } = await abrirQuestao(b);
    await retratar(page, "questao", {
      alternativa: page.locator("[role=radio]").first(),
      alternativas: page.locator("[role=radiogroup]"),
      naoSei: botao(page, "Não sei"),
      verificar: botao(page, "Verificar"),
      contador: page.getByText(/^\d+\/\d+$/),
      progresso: page.getByRole("progressbar"),
    });
    await ctx.close();
  },

  async "questao-marcada"(b) {
    const { ctx, page } = await abrirQuestao(b);
    if (!(await escolher(page, "certa"))) await page.locator("[role=radio]").nth(1).click();
    await page.waitForTimeout(300);
    await retratar(page, "questao-marcada", {
      marcada: page.locator("[role=radio][aria-checked=true]"),
      verificar: botao(page, "Verificar"),
      naoSei: botao(page, "Não sei"),
    });
    await ctx.close();
  },

  async "feedback-certo"(b) {
    // O item da atividade e deterministico: tenta cada alternativa ate a folha dizer que acertou.
    for (let k = 0; k < 5; k++) {
      const { ctx, page } = await abrirQuestao(b);
      const radios = page.locator("[role=radio]");
      if (k >= (await radios.count())) {
        await ctx.close();
        break;
      }
      await radios.nth(k).click();
      await botao(page, "Verificar").click();
      await page.locator('[role="status"]').waitFor();
      await page.waitForTimeout(700);
      if (await botao(page, "Explicar melhor").count()) {
        await ctx.close();
        continue;
      }
      await retratar(page, "feedback-certo", {
        folha: page.locator('[role="status"]'),
        continuar: botao(page, /Continuar|Próxima/),
      });
      await ctx.close();
      return;
    }
    throw new Error("nao achei item com gabarito para acertar");
  },

  async "feedback-errado"(b) {
    const FALA = "Marquei aqui. Bora ver onde travou.";
    for (let t = 0; t < 15; t++) {
      const { ctx, page } = await abrirQuestao(b);
      if (!(await escolher(page, "errada"))) await page.locator("[role=radio]").last().click();
      await botao(page, "Verificar").click();
      await page.locator('[role="status"]').waitFor();
      await page.waitForTimeout(700);
      const texto = await page.locator('[role="status"]').innerText();
      if ((await botao(page, "Explicar melhor").count()) && texto.includes(FALA)) {
        await retratar(page, "feedback-errado", {
          folha: page.locator('[role="status"]'),
          explicar: botao(page, "Explicar melhor"),
          continuar: botao(page, /Continuar|Próxima/),
        });
        await botao(page, "Explicar melhor").click();
        await page.getByText("Você marcou").waitFor({ timeout: 15_000 });
        await page.waitForTimeout(900);
        await retratar(page, "tutor", {
          painel: page.locator("[data-tutor-painel]"),
          campo: page.getByPlaceholder(/Pergunta qualquer coisa/),
          sugestoes: page.getByRole("button", { name: /Por que minha resposta/ }),
        });
        await ctx.close();
        return;
      }
      await ctx.close();
    }
    throw new Error(`nao consegui a fala "${FALA}"`);
  },

  /** Desktop: a mesma questao, errada, com a Foca IA aberta como painel lateral (docs/44 §5). */
  async "tutor-desktop"(b) {
    const FALA = "Marquei aqui. Bora ver onde travou.";
    for (let t = 0; t < 15; t++) {
      const ctx = await contexto(b, comAtividades([{ id: "atv-q", kind: "pratica", reason: "consolidar" }, ...FILA_PADRAO.slice(1)]), { width: 1440, height: 900 }, 2);
      const page = await ctx.newPage();
      await page.goto(`${APP}/atividade/atv-q`, { waitUntil: "networkidle" });
      await botao(page, "Começar").click();
      await page.locator("[role=radio]").first().waitFor();
      await page.waitForTimeout(400);
      await page.locator("[role=radio]").last().click();
      await botao(page, "Verificar").click();
      await page.locator('[role="status"]').waitFor();
      await page.waitForTimeout(600);
      if ((await botao(page, "Explicar melhor").count()) && (await page.locator('[role="status"]').innerText()).includes(FALA)) {
        await botao(page, "Explicar melhor").click();
        await page.getByText("Você marcou").waitFor({ timeout: 15_000 });
        await page.waitForTimeout(900);
        await retratar(page, "tutor-desktop", { painel: page.locator("[data-tutor-painel]") });
        await ctx.close();
        return;
      }
      await ctx.close();
    }
    throw new Error("nao consegui o tutor no desktop");
  },

  async progresso(b) {
    const ctx = await contexto(b, comAtividades(FILA_PADRAO));
    const page = await ctx.newPage();
    await page.goto(`${APP}/progress`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await retratar(page, "progresso", {});
    await ctx.close();
  },
};

async function abertura(b: Browser, nome: string, atv: Atv) {
  const ctx = await contexto(b, comAtividades([atv, ...FILA_PADRAO.slice(1)]));
  const page = await ctx.newPage();
  await page.goto(`${APP}/atividade/${atv.id}`, { waitUntil: "networkidle" });
  await botao(page, "Começar").waitFor({ timeout: 15_000 });
  await page.waitForTimeout(600);
  await retratar(page, nome, {
    comecar: botao(page, "Começar"),
    motivo: page.locator("p").filter({ hasText: /\./ }).first(),
  });
  await ctx.close();
}

async function abrirQuestao(b: Browser) {
  const ctx = await contexto(b, comAtividades([{ id: "atv-q", kind: "pratica", reason: "consolidar" }, ...FILA_PADRAO.slice(1)]));
  const page = await ctx.newPage();
  await page.goto(`${APP}/atividade/atv-q`, { waitUntil: "networkidle" });
  await botao(page, "Começar").click();
  await page.locator("[role=radio]").first().waitFor();
  await page.waitForTimeout(500);
  return { ctx, page };
}

if (import.meta.main) {
  const so = process.argv.find((a) => a.startsWith("--so="))?.slice(5).split(",");
  const r = await fetch(APP).catch(() => null);
  if (!r?.ok) throw new Error(`o app nao responde em ${APP}; rode 'bun run dev' na raiz do repo`);
  const b = await chromium.launch({ executablePath: acharChromium() });
  try {
    for (const [nome, fn] of Object.entries(TELAS)) {
      if (so && !so.includes(nome) && !(nome === "feedback-errado" && so.includes("tutor"))) continue;
      for (let t = 1; t <= 3; t++) {
        try {
          await fn(b);
          break;
        } catch (e) {
          console.log(`  ${nome}: tentativa ${t}/3 falhou: ${(e as Error).message.split("\n")[0]}`);
          if (t === 3) throw e;
        }
      }
    }
  } finally {
    await b.close();
  }
}

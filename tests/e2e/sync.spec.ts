/**
 * Sincronização com a conta, de ponta a ponta (docs/specs/46-producao T-06.6, T-07.3, T-07.4; modelo de ameaças
 * T6/T7/T14). Servidor e banco reais (PGlite do servidor de desenvolvimento); cada teste cria as próprias contas e
 * roda com o motor de sincronização ligado (sem a sessão compartilhada dos outros E2E).
 *
 * Cobre: dois aparelhos, aparelho compartilhado, sair e entrar de novo, falha de rede, importação e "começar do zero".
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { QUESTIONS } from "../../src/data/questions";
import { criarContaVerificada, entrarPelaApi, SENHA } from "./helpers/conta";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 120_000 });

interface EstadoLocal {
  prefs: { name: string };
  progress: { xp: number };
  learning: { recentAttempts: unknown[] };
  account?: { userId: string | null; outbox: unknown[] };
}

async function estado(page: Page): Promise<EstadoLocal | null> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("foca.state.v3");
    return raw ? (JSON.parse(raw) as EstadoLocal) : null;
  });
}

async function contaComSessao(ctx: BrowserContext, email?: string): Promise<string> {
  const e = email ?? (await criarContaVerificada(ctx.request));
  await entrarPelaApi(ctx.request, e);
  return e;
}

/** Responde a primeira questão do /study (a aula de 60 s). */
async function responderUmaQuestao(page: Page) {
  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Responder" }).waitFor({ timeout: 30_000 });
  await page.locator("[data-opcao]").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.locator('[role="status"]').first().waitFor();
}

/** Espera a outbox esvaziar (o servidor aplicou tudo) e devolve o estado. */
async function esperarSincronizar(page: Page): Promise<EstadoLocal> {
  await expect
    .poll(async () => {
      const s = await estado(page);
      return s?.account?.userId && s.account.outbox.length === 0 ? "ok" : "pendente";
    }, { timeout: 30_000 })
    .toBe("ok");
  return (await estado(page))!;
}

const SERVER_FN = "**/_serverFn/**";

test("dois aparelhos: o que um estuda aparece no outro (XP vem do servidor)", async ({ browser }) => {
  const a = await browser.newContext();
  const email = await contaComSessao(a);
  const pa = await a.newPage();
  await responderUmaQuestao(pa);
  const s1 = await esperarSincronizar(pa);
  expect(s1.progress.xp).toBeGreaterThan(0);

  const b = await browser.newContext();
  await contaComSessao(b, email);
  const pb = await b.newPage();
  await pb.goto("/trilha");
  await expect.poll(async () => (await estado(pb))?.progress.xp, { timeout: 30_000 }).toBe(s1.progress.xp);
  await a.close();
  await b.close();
});

test("aparelho compartilhado: entrar com outra conta nunca mostra o estado da anterior", async ({ context, page }) => {
  await contaComSessao(context);
  await responderUmaQuestao(page);
  const deA = await esperarSincronizar(page);
  expect(deA.learning.recentAttempts.length).toBe(1);

  await contaComSessao(context); // outra conta, mesmo navegador (a sessão de A é substituída)
  await page.goto("/trilha");
  await expect.poll(async () => (await estado(page))?.account?.userId, { timeout: 20_000 }).not.toBe(deA.account!.userId);
  const deB = (await estado(page))!;
  expect(deB.learning.recentAttempts).toEqual([]);
  expect(deB.progress.xp).toBe(0);
});

test("sair apaga o aparelho; entrar de novo traz o progresso da conta", async ({ context, page }) => {
  const email = await contaComSessao(context);
  await responderUmaQuestao(page);
  const antes = await esperarSincronizar(page);

  await page.getByRole("link", { name: "Perfil" }).first().click();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
  const depoisDeSair = await estado(page);
  expect(depoisDeSair?.learning.recentAttempts ?? []).toEqual([]);
  expect(depoisDeSair?.account).toBeUndefined();

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/trilha/, { timeout: 20_000 });
  await expect.poll(async () => (await estado(page))?.progress.xp, { timeout: 30_000 }).toBe(antes.progress.xp);
});

test("sem conexão com o servidor: o estudo continua, fica na fila e sobe quando a conexão volta", async ({ context, page }) => {
  await contaComSessao(context);
  await page.goto("/trilha");
  await expect.poll(async () => (await estado(page))?.account?.userId, { timeout: 20_000 }).toBeTruthy();

  await page.route(SERVER_FN, (r) => r.abort("internetdisconnected"));
  await responderUmaQuestao(page);
  await expect.poll(async () => (await estado(page))?.account?.outbox.length, { timeout: 10_000 }).toBeGreaterThan(0);

  await page.unroute(SERVER_FN);
  const s = await esperarSincronizar(page);
  expect(s.progress.xp).toBeGreaterThan(0);
});

test("sair com estudo ainda não enviado pede confirmação antes de apagar", async ({ context, page }) => {
  await contaComSessao(context);
  await page.goto("/trilha");
  await expect.poll(async () => (await estado(page))?.account?.userId, { timeout: 20_000 }).toBeTruthy();
  await page.route(SERVER_FN, (r) => r.abort("internetdisconnected"));
  await responderUmaQuestao(page);

  await page.getByRole("link", { name: "Perfil" }).first().click();
  await expect(page.getByText("Parte do seu estudo ainda está só neste aparelho.")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.getByText("Parte do seu estudo ainda não chegou à conta.")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Continuar na conta" }).click();
  await expect(page.getByRole("button", { name: "Sair", exact: true })).toBeVisible();
});

/** Estado de antes da conta: uma resposta certa da q1 e o XP que o aparelho mostrava. */
function estadoSemConta() {
  const q1 = QUESTIONS.find((q) => q.id === "q1")!;
  const agora = new Date();
  const dia = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
  return {
    authed: true,
    onboarded: true,
    schemaVersion: 6,
    prefs: { name: "Lia" },
    progress: { xp: 15, answered: 1, correct: 1, activityDays: [dia] },
    learning: {
      recentAttempts: [
        {
          id: "at-antes-da-conta-1",
          sessionId: null,
          exerciseId: "q1",
          exerciseVersion: 1,
          skillIds: [],
          role: "pratica",
          answer: q1.correct,
          correct: true,
          hintUsed: false,
          tutorUsed: false,
          firstSubmission: true,
          submittedAt: agora.toISOString(),
          localDate: dia,
          durationMs: 1000,
          source: "estudo",
        },
      ],
    },
  };
}

async function semearSemConta(page: Page) {
  await page.addInitScript((raw) => {
    if (!localStorage.getItem("foca.state.v3")) localStorage.setItem("foca.state.v3", JSON.stringify(raw));
  }, estadoSemConta());
}

test("estudo de antes da conta: levar para a conta (o servidor recorrige e recalcula o XP)", async ({ context, page }) => {
  await semearSemConta(page);
  await contaComSessao(context);
  await page.goto("/trilha");
  await expect(page).toHaveURL(/\/importar-progresso/, { timeout: 20_000 });
  await expect(page.getByText("1 resposta · 0 lições concluídas")).toBeVisible();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  await page.getByRole("button", { name: "Levar para a conta" }).click();
  await expect(page).toHaveURL(/\/trilha/, { timeout: 20_000 });
  const s = await esperarSincronizar(page);
  expect(s.progress.xp).toBe(15);
  expect(s.learning.recentAttempts).toHaveLength(1);
});

test("estudo de antes da conta: começar do zero apaga só depois de confirmar", async ({ context, page }) => {
  await semearSemConta(page);
  await contaComSessao(context);
  await page.goto("/trilha");
  await expect(page).toHaveURL(/\/importar-progresso/, { timeout: 20_000 });
  await page.getByRole("button", { name: "Começar do zero" }).click();
  await expect(page.getByText("Isso apaga o estudo deste aparelho.")).toBeVisible();
  await page.getByRole("button", { name: "Apagar e começar do zero" }).click();
  await expect(page).toHaveURL(/\/trilha/, { timeout: 20_000 });
  const s = (await estado(page))!;
  expect(s.learning.recentAttempts).toEqual([]);
  expect(s.account?.userId).toBeTruthy();
});

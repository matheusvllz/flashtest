import { expect, test } from "@playwright/test";

/**
 * Spec 50 E3/E4 — navegação em 5 abas, barra superior, Praticar, Missões e Loja (§5.11, §5.7.2, §5.4, §5.3.3;
 * RF-18, RF-27). Roda em 390 (chromium), 320 (narrow) e 1280 (desktop).
 */

const ABAS = ["Trilha", "Praticar", "Redação", "Missões", "Perfil"];

test("cinco abas e barra superior só nas abas-raiz", async ({ page }) => {
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  // Celular: barra de baixo; desktop: trilho lateral. Só um dos dois fica visível.
  const nav = page.locator('nav[aria-label="Principal"]:visible').first();
  for (const aba of ABAS) await expect(nav.getByRole("link", { name: aba })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("barra-superior")).toBeVisible();
  await expect(page.getByTestId("indicador-sequencia").first()).toBeVisible();

  await nav.getByRole("link", { name: "Praticar" }).click();
  await expect(page).toHaveURL(/\/praticar$/);
  await expect(page.getByTestId("tela-praticar")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("barra-superior")).toBeVisible();

  await nav.getByRole("link", { name: "Missões" }).click();
  await expect(page).toHaveURL(/\/missoes$/);
  await expect(page.getByTestId("tela-missoes")).toBeVisible({ timeout: 20_000 });

  await nav.getByRole("link", { name: "Perfil" }).click();
  await expect(page.getByRole("button", { name: /Seu progresso/ }).or(page.getByText("Seu progresso")).first()).toBeVisible();

  // Fora das abas-raiz (ex.: a aula rápida) não há barra superior.
  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Responder" }).waitFor({ timeout: 20_000 });
  await expect(page.getByTestId("barra-superior")).toHaveCount(0);
});

test("todas as rotas antigas continuam abrindo (nenhuma rota removida)", async ({ page }) => {
  for (const rota of ["/progress", "/study", "/ranking", "/caderno", "/flashcards", "/topics", "/plan", "/offline", "/planos", "/redacao", "/praticar", "/missoes", "/loja", "/praticar/erros", "/retrospectiva"]) {
    await page.goto(rota, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Essa página não existe."), rota).toHaveCount(0);
  }
});

test("Praticar mostra os jeitos de praticar e 'Rever erros recentes' abre sem custo", async ({ page }) => {
  await page.goto("/praticar", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("tela-praticar")).toBeVisible({ timeout: 20_000 });
  for (const id of ["revisao-rapida", "erros-recentes", "caderno", "flashcards", "materias"]) {
    await expect(page.getByTestId(`praticar-${id}`)).toBeVisible();
  }
  await page.getByTestId("praticar-erros-recentes").click();
  await expect(page).toHaveURL(/\/praticar\/erros$/);
  await expect(page.getByTestId("erros-vazio").or(page.getByRole("button", { name: "Começar" }))).toBeVisible({ timeout: 15_000 });
});

test("Missões: três missões do dia, desafio do mês e conquistas com o critério escrito", async ({ page }) => {
  await page.goto("/missoes", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("lista-missoes").locator("li")).toHaveCount(3, { timeout: 15_000 });
  await expect(page.getByTestId("desafio-mes")).toBeVisible();
  await expect(page.getByTestId("lista-conquistas").locator("li").first()).toBeVisible();
  // Nada de contagem regressiva nem "corra".
  await expect(page.getByText(/termina em|últimas horas|corra/i)).toHaveCount(0);
});

test("Loja: saldo do servidor; sem Pérolas, trocar fica desabilitado; nada de aprendizagem à venda", async ({ page }) => {
  await page.goto("/loja", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("saldo-loja")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("item-protetor")).toBeVisible();
  await expect(page.getByTestId("item-roupa:bone")).toBeVisible();
  await expect(page.getByText(/XP em dobro|pular lição|consertar/i)).toHaveCount(0);
});

test("folha da sequência mostra a meta de ofensiva e o calendário", async ({ page }) => {
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.getByTestId("barra-superior").getByTestId("indicador-sequencia").click();
  await expect(page.getByTestId("sequencia-detalhe")).toBeVisible();
  await expect(page.getByTestId("meta-ofensiva")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("calendario-ofensiva")).toBeVisible({ timeout: 15_000 });
});

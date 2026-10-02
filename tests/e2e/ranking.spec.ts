/**
 * Ranking semanal só para maiores de 18 (spec 49 D49-06, T-49.8.2; RF-11). No servidor local o ranking está ligado.
 */
import { expect, test, type Page } from "@playwright/test";
import { criarContaVerificada, emailUnico, entrarPelaApi } from "./helpers/conta";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 90_000 });

async function conta(page: Page, ano: number) {
  const email = await criarContaVerificada(page.context().request, emailUnico("rk"), ano);
  await entrarPelaApi(page.context().request, email);
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } });
}

test("adulto entra com apelido, vê a posição e sai; sem a turma fictícia", async ({ page }) => {
  await conta(page, 2000);
  await page.goto("/ranking", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Quer entrar no ranking da semana?")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Turma de demonstração")).toHaveCount(0);
  await page.getByLabel("Seu apelido").fill("zap 11987654321");
  await page.getByRole("button", { name: "Entrar no ranking" }).click();
  await expect(page.getByRole("alert")).toHaveText("O apelido não pode ter telefone, e-mail ou link.");
  const apelido = `Foca${Date.now().toString(36).slice(-6)}`;
  await page.getByLabel("Seu apelido").fill(apelido);
  await page.getByRole("button", { name: "Entrar no ranking" }).click();
  await expect(page.getByText(/^Você está em \d+º nesta semana\.$/)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("ranking-grupo")).toContainText(`${apelido} · Você`);
  await expect(page.getByText(/último|caiu/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Sair do ranking" }).click();
  await expect(page.getByText("Quer entrar no ranking da semana?")).toBeVisible();
});

test("menor de 18 só vê o aviso", async ({ page }) => {
  await conta(page, 2009);
  await page.goto("/ranking", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("ranking-menor")).toHaveText("O ranking é para maiores de 18. O resto do Foca continua igual para você.", { timeout: 20_000 });
  await expect(page.getByLabel("Seu apelido")).toHaveCount(0);
});

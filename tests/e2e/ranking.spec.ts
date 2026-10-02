/**
 * Ranking semanal só para maiores de 18 (spec 49 D49-06, T-49.8.2; RF-11), que vira a Liga da semana com as ligas
 * ligadas (spec 50 §5.5, T-50.13.4). No servidor local o ranking e as ligas estão ligados.
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

// Spec 50 §5.5: no servidor local as ligas estão ligadas, então /ranking é a "Liga da semana". O ranking da 49 (sem
// divisões, com `LIGAS_HABILITADO=false`) segue coberto por tests/unit/servidor/ranking.test.ts.
test("adulto entra na liga com apelido, vê a divisão e sai; sem a turma fictícia e sem zona de descida", async ({ page }) => {
  await conta(page, 2000);
  await page.goto("/ranking", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Quer entrar na liga da semana?")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Turma de demonstração")).toHaveCount(0);
  await page.getByLabel("Seu apelido").fill("zap 11987654321");
  await page.getByRole("button", { name: "Entrar na liga" }).click();
  await expect(page.getByRole("alert")).toHaveText("O apelido não pode ter telefone, e-mail ou link.");
  const apelido = `Foca${Date.now().toString(36).slice(-6)}`;
  await page.getByLabel("Seu apelido").fill(apelido);
  await page.getByRole("button", { name: "Entrar na liga" }).click();
  await expect(page.getByTestId("liga-divisao")).toHaveText("Divisão Areia", { timeout: 20_000 });
  await expect(page.getByTestId("liga-selo")).toHaveText("Maior divisão: Areia");
  // Sozinho na divisão, a liga está se formando; com mais gente (outros E2E), aparece o grupo com a posição.
  await expect(page.getByTestId("liga-formando").or(page.getByTestId("ranking-grupo"))).toBeVisible();
  if (await page.getByTestId("ranking-grupo").count()) {
    await expect(page.getByTestId("ranking-grupo")).toContainText(`${apelido} · Você`);
    await expect(page.getByText(/^Você está em \d+º nesta semana\.$/)).toBeVisible();
  }
  await expect(page.getByText(/último|caiu|descida|rebaixa/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Sair da liga" }).click();
  await expect(page.getByText("Quer entrar na liga da semana?")).toBeVisible();
});

test("menor de 18 só vê o aviso", async ({ page }) => {
  await conta(page, 2009);
  await page.goto("/ranking", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("ranking-menor")).toHaveText("O ranking é para maiores de 18. O resto do Foca continua igual para você.", { timeout: 20_000 });
  await expect(page.getByLabel("Seu apelido")).toHaveCount(0);
});

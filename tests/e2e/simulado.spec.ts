/**
 * Simulado (spec 50 §5.9.4, F10): mini da semana para o Free, ponta a ponta (responder, mapa, rever depois, terminar,
 * resultado sem nota, gabarito e reporte), e provas do ENEM liberadas no Pro. As regras do servidor têm testes
 * próprios em tests/unit/servidor/simulado.test.ts.
 */
import { expect, test, type Page } from "@playwright/test";
import { criarContaVerificada, entrarPelaApi } from "./helpers/conta";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 150_000 });

async function entrar(page: Page) {
  const email = await criarContaVerificada(page.context().request);
  await entrarPelaApi(page.context().request, email);
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } });
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await expect
    .poll(
      () => page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}").account?.userId ?? null).catch(() => null),
      { timeout: 30_000 },
    )
    .not.toBeNull();
}

test("Free: mini-simulado do começo ao resultado, com o simulado completo fechado", async ({ page }) => {
  await entrar(page);
  await page.goto("/simulado", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("mini-simulado")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("simulado-convite")).toContainText("plano Pro");
  await expect(page.getByTestId("provas-enem")).toHaveCount(0);

  await page.getByTestId("mini-simulado").getByRole("button", { name: "Começar" }).click();
  await expect(page).toHaveURL(/\/simulado\/mini/, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Questão 1 de 15" })).toBeVisible({ timeout: 30_000 });

  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Rever depois" }).click();
  await expect(page.getByRole("button", { name: "Marcada para rever" })).toBeVisible();
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page.getByRole("button", { name: "Questão 2 de 15" })).toBeVisible();

  // Retomada: recarregar volta na primeira em branco, com a resposta salva.
  await page.waitForTimeout(800);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Questão 2 de 15" })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Questão 2 de 15" }).click();
  await expect(page.getByTestId("mapa-simulado").getByRole("button")).toHaveCount(15);

  await page.getByRole("button", { name: "Terminar" }).last().click();
  await expect(page.getByTestId("confirmar-fim")).toContainText("14 questões estão em branco.");
  await page.getByRole("button", { name: "Terminar e ver o resultado" }).click();

  const resultado = page.getByTestId("resultado-simulado");
  await expect(resultado).toBeVisible({ timeout: 30_000 });
  await expect(resultado).toContainText(/Você acertou [01] de 15\./);
  await expect(resultado).toContainText("não a sua nota no ENEM");
  await resultado.getByRole("button", { name: /Questão 1 de 15/ }).click();
  await expect(resultado).toContainText("Gabarito:");
  await resultado.getByRole("button", { name: "Reportar problema nesta questão" }).click();
  await resultado.getByRole("button", { name: "Gabarito" }).click();
  await expect(resultado.getByText("Obrigado. Vamos conferir esta questão.")).toBeVisible();

  await page.goto("/simulado", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("mini-simulado").getByRole("link", { name: "Ver resultado" })).toBeVisible({ timeout: 30_000 });
});

test("Pro: provas do ENEM por ano e simulado nível ENEM", async ({ page }) => {
  await entrar(page);
  await page.goto("/planos", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Assinar Pro" }).click({ timeout: 20_000 });
  await page.getByTestId("antes-de-pagar").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ir para o pagamento" }).click();
  await page.getByRole("button", { name: "Simular pagamento aprovado" }).click({ timeout: 20_000 });
  await expect(page.getByRole("status")).toHaveText("Pronto, seu plano Pro está ativo.", { timeout: 20_000 });

  await page.goto("/simulado", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("provas-enem")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("provas-enem")).toContainText("ENEM 2025");
  await expect(page.getByTestId("nivel-enem")).toContainText("Não é uma prova oficial.");
  await page.getByTestId("nivel-enem").getByRole("button", { name: "Matemática" }).click();
  await expect(page).toHaveURL(/\/simulado\/sim-/, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Questão 1 de 45" })).toBeVisible({ timeout: 30_000 });
});

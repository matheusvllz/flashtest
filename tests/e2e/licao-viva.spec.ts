import { expect, test, type Page } from "@playwright/test";

/**
 * Spec 50 E1 — lição viva (§5.1): combo com raio e selo, Foca do combo, revisão de erros no fim sem custo de vida,
 * cartões do fim e um momento principal. Lição `porcentagem-valor`: 5 questões, a 1ª é checagem (não pontuada);
 * gabaritos: 1, 3, 2, 1, 2 (mesmos do `lesson-v2.spec.ts`).
 */
const GABARITO = [1, 3, 2, 1, 2];

async function abrir(page: Page) {
  await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Começar" }).click({ timeout: 15_000 });
}

/** Avança passos de ensino até a próxima questão. */
async function ateAQuestao(page: Page) {
  for (let i = 0; i < 5; i++) {
    if (await page.getByRole("button", { name: "Verificar" }).isVisible()) return;
    await page.getByRole("button", { name: "Continuar" }).click();
  }
  await page.getByRole("button", { name: "Verificar" }).waitFor();
}

async function responder(page: Page, indice: number) {
  await ateAQuestao(page);
  await page.locator('[role="radio"]').nth(indice).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').first().waitFor();
}

test("acertos seguidos: raio e selo no 3º; fim com cartões e lição perfeita", async ({ page }) => {
  await abrir(page);
  for (let q = 0; q < 5; q++) {
    await responder(page, GABARITO[q]);
    // A 1ª é checagem (não conta); a 4ª questão é o 3º acerto pontuado seguido.
    if (q === 3) {
      await expect(page.getByTestId("selo-combo")).toContainText("3 seguidas");
      await expect(page.getByTestId("selo-combo")).toHaveAttribute("data-marco", "3");
    }
    if (q < 3) await expect(page.getByTestId("selo-combo")).toHaveCount(0);
    // Continuar está sempre clicável: não espera animação.
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
  }
  // Sem erros pontuados: não há revisão; vai direto ao resumo.
  await expect(page.getByTestId("oferta-revisao")).toHaveCount(0);
  await page.getByRole("button", { name: "Concluir lição" }).click();
  await expect(page.getByTestId("cartoes-fim")).toBeVisible();
  await expect(page.getByTestId("cartoes-fim")).toContainText("4 de 4");
  await expect(page.getByTestId("momento-principal")).toBeVisible();
  // Um só momento principal; os outros viram selos.
  await expect(page.getByTestId("momento-principal")).toHaveCount(1);
});

test("errar oferece 'Rever o que errou' no fim, sem custo de vida, e o resultado separa a revisão", async ({ page }) => {
  await abrir(page);
  for (let q = 0; q < 5; q++) {
    const indice = q === 2 ? (GABARITO[q] + 1) % 4 : GABARITO[q]; // erra a 3ª
    await responder(page, indice);
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
  }
  const oferta = page.getByTestId("oferta-revisao");
  await expect(oferta).toBeVisible();
  await expect(oferta).toContainText("Rever o que errou (1)");
  await oferta.getByRole("button", { name: "Rever" }).click();
  await expect(page.getByText("Revisão 1 de 1")).toBeVisible();
  await page.locator('[role="radio"]').nth(GABARITO[2]).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').first().waitFor();
  await page.getByRole("button", { name: "Ver resultado" }).click();
  await page.getByRole("button", { name: "Concluir lição" }).click();
  await expect(page.getByTestId("resultado-revisao")).toContainText("Na revisão: 1 de 1");
  await expect(page.getByTestId("cartoes-fim")).toContainText("3 de 4");
});

test("'Ver resultado' pula a revisão", async ({ page }) => {
  await abrir(page);
  for (let q = 0; q < 5; q++) {
    const indice = q === 4 ? (GABARITO[q] + 1) % 4 : GABARITO[q];
    await responder(page, indice);
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
  }
  await page.getByTestId("oferta-revisao").getByRole("button", { name: "Ver resultado" }).click();
  await page.getByRole("button", { name: "Concluir lição" }).click();
  await expect(page.getByTestId("resultado-revisao")).toHaveCount(0);
});

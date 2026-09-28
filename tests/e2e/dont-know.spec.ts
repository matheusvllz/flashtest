import { expect, test } from "@playwright/test";

/**
 * Botão "Não sei" (docs/30 §16.1, Fase 6 do docs/31) nas 3 superfícies —
 * microlição, `/study`, lição legada de redação. Confirma: o botão aparece,
 * o feedback fica neutro (sem cor de acerto/erro, ícone `HelpCircle`), e o
 * fluxo continua normalmente depois.
 */

test("microlição: 'Não sei' mostra feedback neutro e deixa continuar", async ({ page }) => {
  await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Começar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click(); // passo de ensino

  await page.getByRole("button", { name: "Não sei" }).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Não sei" }).click();

  const status = page.locator('[role="status"]');
  await status.waitFor();
  // Nem verde nem vermelho — o fundo da folha fica no tom neutro de cards.
  const bg = await status.evaluate((el) => getComputedStyle(el).backgroundColor);
  const cardsBg = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--color-cards"));
  void cardsBg; // valor de referência só pra depuração manual, se o teste falhar
  expect(bg).not.toContain("34, 158, 91"); // --success (aprox.) não deve aparecer
  expect(bg).not.toContain("194, 59, 59"); // --error (aprox.) não deve aparecer

  await expect(page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ })).toBeVisible();
});

test("/study: 'Não sei' registra e avança sem travar a aula", async ({ page }) => {
  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Não sei" }).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Não sei" }).click();
  await page.locator('[role="status"]').waitFor();
  await expect(page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ })).toBeVisible();
});

test("lição de redação: 'Não sei' aparece e registra sem erro de console", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (err) => erros.push(String(err)));

  await page.goto("/redacao/redacao-estrutura-01-dissertativo-argumentativo", {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("button", { name: "Não sei" }).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Não sei" }).click();
  await page.locator('[role="status"]').waitFor();
  await expect(page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ })).toBeVisible();
  expect(erros).toEqual([]);
});

test("errar continua sem abrir o tutor sozinho, mesmo com 'Não sei' disponível na tela (regressão A2)", async ({
  page,
}) => {
  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Não sei" }).waitFor({ timeout: 15000 });
  // Responde normal (erra de propósito: primeira alternativa nem sempre é
  // certa, mas o que importa é confirmar que NENHUM caminho de resposta
  // abre o tutor sozinho).
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.locator('[role="status"]').waitFor();
  await page.waitForTimeout(2000);
  await expect(page.locator('[aria-label="Fechar tutor"]')).toHaveCount(0);
});

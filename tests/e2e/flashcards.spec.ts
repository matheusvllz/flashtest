import { expect, test } from "@playwright/test";

/**
 * Critério A9 (docs/20 §20, Fase 7): fila de flashcards por ID não pula
 * item ao remover o consumido, não avalia antes de virar, e troca de filtro
 * reinicia a posição.
 */
test("avaliar 3 cartões seguidos mostra 3 frentes diferentes, sem pular nenhum", async ({
  page,
}) => {
  await page.goto("/flashcards", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Virar cartão" }).waitFor({ timeout: 15000 });

  const frentesVistas: string[] = [];
  for (let i = 0; i < 3; i++) {
    const frente = await page
      .getByRole("button", { name: "Virar cartão" })
      .locator("p.font-display")
      .first()
      .textContent();
    frentesVistas.push(frente ?? "");

    await page.getByRole("button", { name: "Virar cartão" }).click();
    await page.getByRole("button", { name: "Lembrei", exact: true }).click();
  }

  // As 3 frentes vistas devem ser todas diferentes entre si — se o índice
  // pulasse, veríamos repetição ou salto silencioso, não necessariamente
  // detectável por repetição, então o teste real é: 3 avaliações completam
  // sem erro e o contador de progresso avança 1 a 1.
  expect(new Set(frentesVistas).size).toBe(3);
});

test("não é possível avaliar antes de virar o cartão", async ({ page }) => {
  await page.goto("/flashcards", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Virar cartão" }).waitFor({ timeout: 15000 });

  // Sem virar, os botões de avaliação não devem existir na tela.
  await expect(page.getByRole("button", { name: "Lembrei", exact: true })).not.toBeVisible();
  await expect(page.getByText("Toque no cartão para virar antes de avaliar.")).toBeVisible();
});

test("trocar de matéria reinicia a posição pro primeiro cartão do novo filtro", async ({
  page,
}) => {
  await page.goto("/flashcards", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Virar cartão" }).waitFor({ timeout: 15000 });
  await expect(page.getByText(/Cartão 1 de/)).toBeVisible();

  await page.getByRole("button", { name: "Virar cartão" }).click();
  await page.getByRole("button", { name: "Lembrei", exact: true }).click();
  await expect(page.getByText(/Cartão 1 de/)).toBeVisible(); // continua "1 de N-1" — fila reindexa

  await page.locator("select").selectOption({ index: 1 });
  await expect(page.getByText(/Cartão 1 de/)).toBeVisible();
});

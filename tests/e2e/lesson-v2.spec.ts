import { expect, test } from "@playwright/test";

/**
 * Player de lição v2 (docs/25 §9/§12.2, §18 T-11/T-27) — percorre
 * `porcentagem-valor` inteira contando as 5 questões (G4: 4-8 questões
 * intercaladas com ensino), confere o breadcrumb "capítulo › lição" e prova
 * G6: errar não abre o tutor sozinho, só o CTA "Explicar melhor" abre, e
 * nenhuma chamada de rede acontece até um envio explícito.
 */
test("percorre porcentagem-valor: 5 questões, breadcrumb e tutor só abre pelo CTA", async ({ page }) => {
  const chamadasApi: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("_serverFn")) chamadasApi.push(req.url());
  });

  let statusCount = 0;

  await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Começar" }).waitFor({ timeout: 15000 });

  // Breadcrumb "capítulo › lição" (`MicroLessonPlayer.tsx`: `${chapter.title} › ${lesson.title}`).
  await expect(page.getByText("Porcentagem › O que é porcentagem")).toBeVisible();
  await expect(page.getByRole("button", { name: "Começar" })).toBeInViewport();
  await page.getByRole("button", { name: "Começar" }).click();

  await page.getByRole("button", { name: "Continuar" }).click(); // teach: "Porcentagem é fração de 100"

  // ---- questão 1/5: checkpoint — erra de propósito (gabarito real: 1; escolhe 0).
  await page.getByRole("button", { name: "Verificar" }).waitFor();
  await page.locator('[role="radio"]').nth(0).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').waitFor();
  statusCount++;

  // G6: errar não abre o tutor sozinho — nem depois de esperar.
  await page.waitForTimeout(3000);
  await expect(page.locator('[aria-label="Fechar tutor"]')).toHaveCount(0);

  // Só o CTA explícito abre — e sem nenhuma chamada de rede até enviar.
  await page.getByRole("button", { name: "Explicar melhor" }).click();
  await expect(page.locator('[aria-label="Fechar tutor"]')).toBeVisible();
  expect(chamadasApi).toHaveLength(0);
  await page.locator('[aria-label="Fechar tutor"]').click(); // fecha pra seguir a lição

  await page.getByRole("button", { name: "Continuar" }).click(); // segue do checkpoint

  await page.getByRole("button", { name: "Continuar" }).click(); // teach: "Exemplo: 15% de 500"

  // ---- questão 2/5: q10 (banco geral, gabarito D = índice 3) — acerta.
  await page.getByRole("button", { name: "Verificar" }).waitFor();
  await page.locator('[role="radio"]').nth(3).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').waitFor();
  statusCount++;
  await page.getByRole("button", { name: "Continuar" }).click();

  // ---- questão 3/5: prática-2 (gabarito real: 2) — acerta.
  await page.getByRole("button", { name: "Verificar" }).waitFor();
  await page.locator('[role="radio"]').nth(2).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').waitFor();
  statusCount++;
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByRole("button", { name: "Continuar" }).click(); // tip

  // ---- questão 4/5: prática-3 (gabarito real: 1) — acerta.
  await page.getByRole("button", { name: "Verificar" }).waitFor();
  await page.locator('[role="radio"]').nth(1).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').waitFor();
  statusCount++;
  await page.getByRole("button", { name: "Continuar" }).click();

  // ---- questão 5/5: desafio (gabarito real: 2), última pontuada -> "Ver resultado".
  await page.getByRole("button", { name: "Verificar" }).waitFor();
  await page.locator('[role="radio"]').nth(2).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').waitFor();
  statusCount++;
  await page.getByRole("button", { name: "Ver resultado" }).click();

  expect(statusCount).toBe(5);
  await expect(page.getByRole("button", { name: "Concluir lição" })).toBeVisible();

  // Nenhuma chamada de rede aconteceu em NENHUM momento da lição — o tutor
  // só chama a API num envio explícito, que este teste nunca fez.
  expect(chamadasApi).toHaveLength(0);
});

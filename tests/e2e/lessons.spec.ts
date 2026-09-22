import { expect, test } from "@playwright/test";

/**
 * Smoke do player de redação (`LessonPlayer`) depois da migração pra
 * `useExerciseSession` (Fase 2): mesma máquina de resposta do `/study`, então
 * os mesmos critérios A1 (frase estável) e B5 (avanço único) valem aqui.
 * B3 (som na redação) não é observável via DOM — a integração está coberta
 * por não lançar erro de console ao verificar a resposta.
 */
test("lição de redação: feedback estável e sem erro de console ao verificar", async ({ page }) => {
  const erros: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") erros.push(msg.text());
  });
  page.on("pageerror", (err) => erros.push(String(err)));

  await page.goto("/redacao/redacao-estrutura-01-dissertativo-argumentativo", {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("button", { name: "Verificar" }).waitFor();

  // O primeiro exercício da lição pode ser qualquer um dos 7 formatos — só
  // precisamos selecionar ALGUMA resposta pra habilitar "Verificar".
  const opcao = page.locator('[role="radio"], button:has(> span)').first();
  await opcao.click();
  await page.getByRole("button", { name: "Verificar" }).click();

  await page.locator('[role="status"]').waitFor({ timeout: 5000 });
  const titulo = page.locator('[role="status"] p.font-display').first();
  const inicial = (await titulo.textContent())?.trim();
  expect(inicial?.length ?? 0).toBeGreaterThan(0);

  await page.waitForTimeout(1500);
  await expect(titulo).toHaveText(inicial ?? "");

  expect(erros).toEqual([]);
});

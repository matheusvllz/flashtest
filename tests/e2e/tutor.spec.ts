import { expect, test } from "@playwright/test";

/**
 * Critério A2 (docs/20 §20) + regressão do B2 (§3): errar não pode abrir o
 * balão nem enviar mensagem sozinho — só o CTA explícito abre.
 *
 * "Explicar melhor" virou o nível 3 da explicação em camadas na Fase 7
 * (docs/30 §17.2, AC-7.2): o CLIQUE em si já é a ação explícita do aluno
 * ("me ensina isso do começo"), então ele agora abre o balão E dispara UM
 * envio automático — não é o mesmo "auto-envio ao errar" que este teste
 * prova que continua proibido (linhas antes do clique).
 */
test("A2 — tutor não abre nem envia mensagem automaticamente ao errar", async ({ page }) => {
  const chamadasApi: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("_serverFn")) chamadasApi.push(req.url());
  });

  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Responder" }).waitFor();
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.locator('[role="status"]').waitFor();

  // Balão fechado logo após errar — nenhum autoenvio no ato de responder.
  await expect(page.locator('header:has-text("Foca")')).not.toBeVisible();
  expect(chamadasApi).toHaveLength(0);

  const explicar = page.getByRole("button", { name: "Explicar melhor" });
  if (!(await explicar.isVisible())) test.skip(true, "resposta escolhida era a correta");

  await explicar.click();
  await expect(page.locator('header:has-text("Foca")')).toBeVisible();

  // Nível 3 (docs/30 §17.2): abre JÁ com a mensagem "me ensina do começo"
  // enviada — uma vez só, disparada pelo próprio clique (autoSend do store).
  await expect(page.locator(".bg-mar.px-4.py-2\\.5")).toHaveCount(1);
  await expect(page.locator(".bg-mar.px-4.py-2\\.5")).toContainText("Me ensina isso do começo");
  await expect.poll(() => chamadasApi.length).toBe(1);
});

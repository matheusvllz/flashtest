import { expect, test } from "@playwright/test";

/**
 * Critério A2 (docs/20 §20) + regressão do B2 (§3): errar não pode abrir o
 * balão nem enviar mensagem sozinho — só o CTA explícito abre, e só um envio
 * explícito (clique/Enter) chama a API.
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

  // Abriu com contexto fixado, mas SEM mensagem nenhuma na conversa — só o
  // aluno decide se e o que perguntar (docs/20 §4.2 item 6).
  await expect(page.locator(".bg-mar.px-4.py-2\\.5")).toHaveCount(0);
  expect(chamadasApi).toHaveLength(0);
});

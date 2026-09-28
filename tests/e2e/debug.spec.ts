import { expect, test } from "@playwright/test";

/**
 * Painel `/debug` (docs/30 §27, Fase 8 do docs/31 F8.9).
 *
 * Nota de cobertura: o E2E roda contra `bun run dev` (`import.meta.env.DEV`
 * sempre `true`), então "sem `?debug=1` redireciona em produção" não é
 * testável aqui — só se manifesta num build de produção de verdade. A
 * lógica em si (`autorizado()`) é simples o bastante pra não precisar de
 * E2E dedicado: `import.meta.env.DEV || query.debug === "1"`.
 */
test("/debug?debug=1 abre e mostra as abas", async ({ page }) => {
  await page.goto("/debug?debug=1", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("tab", { name: "plano" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "habilidades" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "tentativas" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "audio" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "flags" })).toBeVisible();
});

test("aba Habilidades mostra a tabela de Mastery/Confidence", async ({ page }) => {
  await page.goto("/debug?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: "habilidades" }).click();
  await expect(page.getByText("Mastery")).toBeVisible();
  await expect(page.getByText("Confidence")).toBeVisible();
});

test("aba Flags mostra o JSON de FEATURES", async ({ page }) => {
  await page.goto("/debug?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: "flags" }).click();
  await expect(page.getByText(/"contextoPedagogicoIA"/)).toBeVisible();
});

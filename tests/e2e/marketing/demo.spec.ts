import { expect, test } from "@playwright/test";
import item from "../../../src/marketing/content/demo-item.json" with { type: "json" };

// Demo "Tenta uma" (S-4): estados, teclado, texto idêntico ao do app, sem rede (docs/40 §11 S-4, G-13).
const certa = item.opcoes[item.correta];
const errada = item.opcoes.find((_, i) => i !== item.correta)!;

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator("#tenta-uma").scrollIntoViewIfNeeded();
});

test("estado inicial: enunciado e alternativas do item real, Verificar desabilitado, sem CTA ainda", async ({ page }) => {
  const sec = page.locator("#tenta-uma");
  await expect(sec).toContainText(item.pergunta);
  await expect(sec.getByRole("radio")).toHaveCount(item.opcoes.length);
  await expect(sec.getByRole("button", { name: "Verificar" })).toBeDisabled();
  await expect(sec.locator("a[data-cta]")).toHaveCount(0);
});

test("resposta certa: verde, explicação original, CTA e 'Tentar de novo'", async ({ page }) => {
  const sec = page.locator("#tenta-uma");
  await sec.getByRole("radio", { name: certa }).click();
  await expect(sec.getByRole("radio", { name: certa })).toHaveAttribute("aria-checked", "true");
  await sec.getByRole("button", { name: "Verificar" }).click();
  const status = sec.getByRole("status");
  await expect(status).toContainText("Certa.");
  await expect(status).toContainText(item.explicacao); // texto pedagógico idêntico ao do app
  await expect(sec.getByRole("radio", { name: certa })).toHaveAttribute("data-resultado", "certa");
  await expect(sec.locator("a[data-cta]")).toHaveAttribute("href", "/quiz");
  await sec.getByRole("button", { name: "Tentar de novo" }).click();
  await expect(sec.getByRole("status")).toHaveCount(0);
  await expect(sec.getByRole("button", { name: "Verificar" })).toBeDisabled();
});

test("resposta errada: mostra a certa em verde e a escolhida em vermelho, com a fala do app", async ({ page }) => {
  const sec = page.locator("#tenta-uma");
  await sec.getByRole("radio", { name: errada }).click();
  await sec.getByRole("button", { name: "Verificar" }).click();
  await expect(sec.getByRole("status")).toContainText("Marquei aqui. Bora ver onde travou.");
  await expect(sec.getByRole("radio", { name: errada })).toHaveAttribute("data-resultado", "errada");
  await expect(sec.getByRole("radio", { name: certa })).toHaveAttribute("data-resultado", "certa");
  await expect(sec.getByRole("radio").first()).toBeDisabled();
});

test("'Não sei' é neutro: sem vermelho, mostra o caminho", async ({ page }) => {
  const sec = page.locator("#tenta-uma");
  await sec.getByRole("button", { name: "Não sei a resposta desta questão" }).click();
  await expect(sec.getByRole("status")).toContainText("Tudo bem. Veja como resolve:");
  await expect(sec.getByRole("status")).toContainText(item.explicacao);
  await expect(sec.locator("[data-resultado='errada']")).toHaveCount(0);
  await expect(sec.getByRole("status")).toHaveAttribute("data-tom", "neutro");
});

test("só com teclado: setas escolhem, Tab vai a Verificar, Enter responde e o foco vai ao resultado", async ({ page }) => {
  const sec = page.locator("#tenta-uma");
  await sec.getByRole("radio").first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(sec.getByRole("radio").nth(1)).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Tab");
  await expect(sec.getByRole("button", { name: "Verificar" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(sec.getByRole("status")).toBeFocused();
  await expect(sec.getByRole("status")).toBeVisible();
});

test("a demo não faz nenhuma requisição de rede", async ({ page }) => {
  const reqs: string[] = [];
  page.on("request", (r) => reqs.push(r.url()));
  const sec = page.locator("#tenta-uma");
  await sec.getByRole("radio", { name: certa }).click();
  await sec.getByRole("button", { name: "Verificar" }).click();
  await expect(sec.getByRole("status")).toBeVisible();
  expect(reqs.filter((u) => !u.startsWith("data:") && !/\/(branding\/foca|fonts)\//.test(u))).toEqual([]);
});

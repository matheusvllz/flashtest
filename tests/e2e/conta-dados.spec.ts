import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { criarContaVerificada, entrarPelaApi, ORIGEM, SENHA } from "./helpers/conta";

/**
 * Seus dados (spec 48 T-48.3.1/T-48.3.2; 46 T-09.1/T-09.2): baixar os dados e excluir a conta, com uma conta própria
 * de cada teste (nunca a conta compartilhada dos outros E2E).
 */
test.use({ storageState: { cookies: [], origins: [] } });

test("baixar meus dados: um JSON com a conta do aluno, sem senha nem token", async ({ context, page }) => {
  const email = await criarContaVerificada(context.request);
  await entrarPelaApi(context.request, email);
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  const secao = page.getByTestId("dados-da-conta");
  await expect(secao).toBeVisible({ timeout: 20_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), secao.getByRole("button", { name: "Baixar meus dados" }).click()]);
  expect(download.suggestedFilename()).toMatch(/^foca-meus-dados-\d{4}-\d{2}-\d{2}\.json$/);
  const conteudo = readFileSync(await download.path(), "utf8");
  const dados = JSON.parse(conteudo);
  expect(dados.conta.email).toBe(email);
  expect(conteudo).not.toMatch(/password|senha|token|hash/i);
  const axe = await new AxeBuilder({ page }).include('[data-testid="dados-da-conta"]').analyze();
  expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
});

test("excluir conta: pede confirmação com a consequência, apaga e o login deixa de funcionar", async ({ context, page }) => {
  const email = await criarContaVerificada(context.request);
  await entrarPelaApi(context.request, email);
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  const secao = page.getByTestId("dados-da-conta");
  await secao.getByRole("button", { name: "Excluir conta" }).click();
  await expect(secao.getByText("Isso apaga sua conta e todo o estudo salvo nela, sem volta.")).toBeVisible();

  // Senha errada não exclui.
  await secao.getByLabel("Senha").fill("nao-e-essa");
  await secao.getByRole("button", { name: "Excluir minha conta" }).click();
  await expect(secao.getByText("Senha incorreta. Confira e tente de novo.")).toBeVisible({ timeout: 15_000 });

  await secao.getByLabel("Senha").fill(SENHA);
  await secao.getByRole("button", { name: "Excluir minha conta" }).click();
  await expect(page).toHaveURL(`${ORIGEM}/`, { timeout: 20_000 });
  // O aparelho volta ao estado vazio padrão (o mesmo de "Sair", 46 D-14): sem conta, sem estudo, sem e-mail.
  const local = await page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"));
  expect(local.account?.userId).toBeUndefined();
  expect(local.learning?.recentAttempts ?? []).toEqual([]);
  expect(local.prefs?.email ?? "").toBe("");
  expect(JSON.stringify(local)).not.toContain(email);

  const login = await context.request.post(`${ORIGEM}/api/auth/sign-in/email`, { data: { email, password: SENHA }, headers: { origin: ORIGEM } });
  expect(login.status()).not.toBe(200);
});

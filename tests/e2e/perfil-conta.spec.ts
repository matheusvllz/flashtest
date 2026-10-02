/**
 * Perfil com conta (spec 49 D49-13, RF-15): nome e e-mail vêm da conta — não do aparelho —, o nome é editável e
 * gravado no servidor, e "Resetar demonstração" não aparece para quem tem conta.
 */
import { expect, test } from "@playwright/test";
import { criarContaVerificada, entrarPelaApi } from "./helpers/conta";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 90_000 });

test("com conta e sem nome no aparelho: mostra o nome e o e-mail da conta, sem 'Resetar demonstração'", async ({ page, context }) => {
  const email = await criarContaVerificada(context.request);
  await entrarPelaApi(context.request, email);
  // Quem entrou pelo Google nunca preencheu o nome no aparelho: o estado local vem sem nome.
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, name: "", onboardingVersion: 2 } });
  await page.goto("/profile", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("perfil-nome")).toHaveText("Ana", { timeout: 20_000 });
  await expect(page.getByTestId("perfil-email")).toHaveText(email);
  await expect(page.getByText("Sem nome")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Resetar demonstração/ })).toHaveCount(0);
});

test("editar o nome grava na conta e continua depois de recarregar", async ({ page, context }) => {
  const email = await criarContaVerificada(context.request);
  await entrarPelaApi(context.request, email);
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } });
  await page.goto("/profile", { waitUntil: "domcontentloaded" });

  // Com a sessão carregada o nome vira botão (antes é só texto).
  await page.getByRole("button", { name: /^Editar nome:/ }).click({ timeout: 20_000 });
  const campo = page.getByLabel("Seu nome");
  await campo.fill("A");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("alert")).toHaveText("Escreva pelo menos 2 letras.");
  await campo.fill("Mariana Souza");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByTestId("perfil-nome")).toHaveText("Mariana Souza");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("perfil-nome")).toHaveText("Mariana Souza", { timeout: 20_000 });
  const sessao = await context.request.get("/api/auth/get-session");
  expect((await sessao.json()).user.name).toBe("Mariana Souza");
});

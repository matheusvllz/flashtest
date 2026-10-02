/**
 * Conta nova passa pelo quiz (spec 49 D49-12, RF-14): "Criar conta" no login leva ao quiz quando este aparelho ainda
 * não o fez; conta nova do Google (chega sem ano de nascimento) completa o cadastro e vai para o quiz.
 */
import { expect, test } from "@playwright/test";
import { emailUnico, entrarPelaApi, linkDoEmail, ORIGEM, SENHA } from "./helpers/conta";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 90_000 });

test("login sem quiz neste aparelho: 'Criar conta' leva ao quiz", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByTestId("criar-conta-quiz").click({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/quiz/);
});

test("login com o quiz já feito aqui: 'Criar conta' vai direto ao cadastro", async ({ page }) => {
  await seedOnce(page, { ...USUARIO_ONBOARDED, authed: false, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } });
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Criar conta" }).click({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/cadastro/);
});

test("conta nova sem ano (como a do Google): completa o cadastro e vai para o quiz", async ({ page, context }) => {
  const email = emailUnico("google");
  // O Google entrega nome e e-mail, sem ano nem aceite: a conta nasce incompleta.
  const r = await context.request.post(`${ORIGEM}/api/auth/sign-up/email`, {
    headers: { origin: ORIGEM },
    data: { email, password: SENHA, name: "Gabi" },
  });
  expect(r.status()).toBe(200);
  await context.request.get(await linkDoEmail(email, /Confirme/), { maxRedirects: 0 });
  await entrarPelaApi(context.request, email);

  await page.goto("/cadastro/completar", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Ano de nascimento").fill("2006", { timeout: 20_000 });
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/quiz/, { timeout: 20_000 });
});

/**
 * Planos, checkout e assinatura (spec 49 T-49.3.4, T-49.3.5; RF-2, RF-4). Servidor de desenvolvimento com o provedor
 * de pagamento falso: o "checkout" volta direto para /planos/retorno com botões de simulação. O caminho real (Asaas
 * sandbox) é testado à mão no preview (preparacao.md, Passo 6).
 */
import { expect, test, type Page } from "@playwright/test";
import { criarContaVerificada, entrarPelaApi } from "./helpers/conta";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 90_000 });

async function entrar(page: Page) {
  const email = await criarContaVerificada(page.context().request);
  await entrarPelaApi(page.context().request, email);
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } });
  return email;
}

test("planos: preços do catálogo no mensal e no anual, e o que ainda não existe aparece como em breve", async ({ page }) => {
  await entrar(page);
  await page.goto("/planos", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("cartao-basic")).toContainText("R$ 24,90 por mês", { timeout: 20_000 });
  await expect(page.getByTestId("cartao-pro")).toContainText("R$ 39,90 por mês");
  await expect(page.getByTestId("cartao-gratis")).toContainText("Seu plano", { timeout: 20_000 });
  // E1–E3 publicadas: vidas aparecem como benefício; simulado e corretor seguem "em breve" (DV49-08, DV49-09).
  await expect(page.getByTestId("cartao-gratis")).toContainText("5 vidas por dia");
  await expect(page.getByTestId("cartao-gratis")).not.toContainText("(em breve)");
  await expect(page.getByTestId("cartao-pro")).toContainText("Simulados cronometrados (em breve)");
  await expect(page.getByTestId("cartao-pro")).toContainText("Corretor de redação: 10 por mês (em breve)");
  await expect(page.getByTestId("cartao-pro")).toContainText("Explica de outro jeito e treino de redação por partes");
  await page.getByRole("radio", { name: "Anual" }).click();
  await expect(page.getByTestId("cartao-basic")).toContainText("R$ 209,90 por ano");
  await expect(page.getByTestId("cartao-basic")).toContainText("Equivale a R$ 17,49 por mês, 29,8% a menos que 12 mensais.");
  await expect(page.getByTestId("cartao-pro")).toContainText("Equivale a R$ 27,49 por mês, 31,1% a menos que 12 mensais.");
  // Sem urgência nem contagem regressiva.
  await expect(page.getByText(/últimas|só hoje|termina em|restam/i)).toHaveCount(0);
});

test("assinar Basic: declaração obrigatória, pagamento aprovado ativa o plano; cancelar e reembolsar no perfil", async ({ page }) => {
  await entrar(page);
  await page.goto("/planos", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Assinar Basic" }).click({ timeout: 20_000 });
  const folha = page.getByTestId("antes-de-pagar");
  await expect(folha).toContainText("Basic: R$ 24,90 por mês, renova sozinho todo mês.");
  await expect(folha).toContainText("Nos primeiros 7 dias, o reembolso é integral.");
  await page.getByRole("button", { name: "Ir para o pagamento" }).click();
  await expect(folha.getByRole("alert")).toHaveText("Para continuar, confirme a declaração acima.");
  await folha.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ir para o pagamento" }).click();

  await expect(page).toHaveURL(/\/planos\/retorno\?compra=/, { timeout: 20_000 });
  await page.getByRole("button", { name: "Simular pagamento aprovado" }).click();
  await expect(page.getByRole("status")).toHaveText("Pronto, seu plano Basic está ativo.", { timeout: 20_000 });

  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  const secao = page.getByTestId("secao-assinatura");
  await expect(secao.getByTestId("plano-atual")).toHaveText("Plano Basic", { timeout: 20_000 });
  await expect(secao).toContainText("Renova em");

  await secao.getByRole("button", { name: "Cancelar assinatura" }).click();
  await secao.getByRole("button", { name: "Sim, cancelar" }).click();
  await expect(secao.getByRole("status")).toContainText("Cancelada. Você continua com o plano até");
  await expect(secao.getByTestId("plano-atual")).toHaveText("Plano Basic");

  await secao.getByRole("button", { name: "Pedir reembolso" }).click();
  await secao.getByRole("button", { name: "Sim, pedir reembolso" }).click();
  await expect(secao.getByRole("status")).toHaveText("Reembolso pedido. A conta voltou ao Free.");
  await expect(secao.getByTestId("plano-atual")).toHaveText("Plano Free");
});

test("pagamento recusado não muda o plano", async ({ page }) => {
  await entrar(page);
  await page.goto("/planos", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Assinar Pro" }).click({ timeout: 20_000 });
  await page.getByTestId("antes-de-pagar").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ir para o pagamento" }).click();
  await page.getByRole("button", { name: "Simular pagamento recusado" }).click({ timeout: 20_000 });
  await expect(page.getByRole("status")).toHaveText("O pagamento não foi aprovado. Nada foi cobrado.");
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("plano-atual")).toHaveText("Plano Free", { timeout: 20_000 });
});

test("/premium leva aos planos", async ({ page }) => {
  await entrar(page);
  await page.goto("/premium", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/planos$/, { timeout: 20_000 });
});

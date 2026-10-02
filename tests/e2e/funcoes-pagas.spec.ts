/**
 * Funções pagas (spec 49 §5.9, F9; RF-12). Servidor de desenvolvimento: provedor de pagamento falso e sem chave da
 * OpenAI, então o corretor fica "indisponível" (nunca nota inventada) e o treino comenta de forma automática.
 * As regras do servidor (portões, limites, isolamento) têm testes próprios em tests/unit/servidor/funcoes-pagas.
 */
import { expect, test, type Page } from "@playwright/test";
import { QUESTIONS } from "../../src/data/questions";
import { criarContaVerificada, entrarPelaApi } from "./helpers/conta";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 150_000 });

async function entrar(page: Page) {
  const email = await criarContaVerificada(page.context().request);
  await entrarPelaApi(page.context().request, email);
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } });
  // O aparelho precisa saber que há conta (o sincronizador vincula na primeira página).
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await expect
    .poll(
      () => page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}").account?.userId ?? null).catch(() => null),
      { timeout: 30_000 },
    )
    .not.toBeNull();
  return email;
}

async function assinar(page: Page, plano: "Basic" | "Pro") {
  await page.goto("/planos", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: `Assinar ${plano}` }).click({ timeout: 20_000 });
  await page.getByTestId("antes-de-pagar").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ir para o pagamento" }).click();
  await page.getByRole("button", { name: "Simular pagamento aprovado" }).click({ timeout: 20_000 });
  await expect(page.getByRole("status")).toHaveText(`Pronto, seu plano ${plano} está ativo.`, { timeout: 20_000 });
}

test("Free: caderno, cronograma, offline e redação com IA aparecem fechados, com caminho para os planos", async ({ page }) => {
  await entrar(page);
  await page.goto("/caderno", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("caderno-fechado")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("caderno-fechado").getByRole("link", { name: "Ver planos" })).toBeVisible();

  await page.goto("/plan", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("secao-cronograma")).toContainText("Com o Basic ou o Pro", { timeout: 20_000 });

  await page.goto("/offline", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("offline-fechado")).toBeVisible({ timeout: 20_000 });

  await page.goto("/redacao/corretor", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("redacao-bloqueio")).toHaveAttribute("data-bloqueio", "fechado", { timeout: 20_000 });
});

test("Basic: cronograma monta a semana e o caderno guarda a questão errada", async ({ page }) => {
  await entrar(page);
  await assinar(page, "Basic");

  await page.goto("/plan", { waitUntil: "domcontentloaded" });
  const secao = page.getByTestId("secao-cronograma");
  await secao.getByRole("button", { name: "Montar meu cronograma" }).click({ timeout: 20_000 });
  await secao.getByRole("radio", { name: "4" }).first().click();
  await secao.getByRole("button", { name: "Salvar cronograma" }).click();
  await expect(secao.getByTestId("cronograma-faltam")).toContainText(/Falta|A prova é hoje/, { timeout: 20_000 });
  await expect(secao.getByTestId("cronograma-meta")).toContainText("de 16 blocos");
  await expect(secao.getByTestId("cronograma-areas")).toContainText("Redação");

  // Erra uma questão do /study (fonte questao-geral) e espera a sincronização levar ao caderno.
  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.locator("[data-opcao]").first().waitFor({ timeout: 30_000 });
  const texto = await page.locator("main").innerText();
  const q = QUESTIONS.find((x) => texto.includes(x.statement.slice(0, 60)));
  if (!q) throw new Error("questão não encontrada no banco");
  const errada = q.alternatives.find((a) => a.key !== q.correct)!;
  await page.locator("[data-opcao]").filter({ hasText: errada.text.slice(0, 40) }).first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.locator('[role="status"]').first().waitFor();
  // Basic não tem "Explica de outro jeito" (é do Pro).
  await expect(page.getByTestId("outro-jeito")).toHaveCount(0);

  await expect(async () => {
    await page.goto("/caderno", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("caderno-lista").locator("li")).toHaveCount(1, { timeout: 5_000 });
  }).toPass({ timeout: 60_000 });
  await expect(page.getByTestId("caderno-para-hoje")).toHaveText("Nada para revisar hoje.");
  await expect(page.getByTestId("caderno-lista")).toContainText("Volta em");
  await page.getByRole("button", { name: "Ver explicação" }).click();
  await expect(page.getByRole("button", { name: "Pedir para a Foca IA explicar" })).toBeVisible();
});

test("Pro: explica de outro jeito só no toque; treino comenta cada parte; corretor sem IA fica indisponível; baixar a semana", async ({ page }) => {
  await entrar(page);
  await assinar(page, "Pro");

  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.locator("[data-opcao]").first().waitFor({ timeout: 30_000 });
  await page.locator("[data-opcao]").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  const outro = page.getByTestId("outro-jeito");
  await expect(outro).toBeVisible({ timeout: 20_000 });
  // Nada abre sozinho (regra dura 7): o balão só aparece depois do toque.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await outro.getByRole("button", { name: "Exemplo do dia a dia" }).click();
  await expect(page.getByText("Me explica essa questão com um exemplo do dia a dia.")).toBeVisible({ timeout: 20_000 });

  await page.goto("/redacao/treino", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("treino-tema")).not.toBeEmpty({ timeout: 20_000 });
  const tese = page.getByTestId("treino-parte-tese");
  await tese.getByRole("textbox").fill("A falta de bibliotecas nas escolas afasta os jovens da leitura.");
  await tese.getByRole("button", { name: "Pedir comentário" }).click();
  await expect(page.getByTestId("treino-comentario-tese")).not.toBeEmpty({ timeout: 20_000 });
  await expect(tese).toContainText("Comentário automático");

  await page.goto("/redacao/corretor", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("redacao-bloqueio")).toHaveAttribute("data-bloqueio", "indisponivel", { timeout: 20_000 });

  await page.goto("/offline", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Baixar a semana" }).click({ timeout: 20_000 });
  await expect(page.getByTestId("offline-pronto")).toBeVisible({ timeout: 60_000 });
  const registrado = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).some((r) => r.active?.scriptURL.endsWith("/sw.js")));
  expect(registrado).toBe(true);
  await page.getByRole("button", { name: "Apagar o que foi baixado" }).click();
  await expect(page.getByTestId("offline-pronto")).toHaveCount(0);
});

/**
 * Ofensiva com amigos 18+ (spec 50 §5.6, T-50.14.4; RF-16), com duas contas reais. No servidor local a função está
 * ligada. Convite por link, aceite mútuo, o que cada um vê, encerrar; conta de 17 anos só vê o aviso genérico.
 */
import { expect, test, type Browser, type Page } from "@playwright/test";
import { criarContaVerificada, emailUnico, entrarPelaApi } from "./helpers/conta";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.describe.configure({ timeout: 120_000 });

async function abrirConta(browser: Browser, ano: number): Promise<Page> {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] }, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const email = await criarContaVerificada(ctx.request, emailUnico("am"), ano);
  await entrarPelaApi(ctx.request, email);
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } });
  return page;
}

const apelidoUnico = (p: string) => `${p}${Date.now().toString(36).slice(-5)}${Math.random().toString(36).slice(2, 4)}`;

async function definirApelido(page: Page, apelido: string) {
  await page.getByLabel("Seu apelido").fill(apelido);
  await page.getByRole("button", { name: "Salvar apelido" }).click();
}

async function gerarConvite(page: Page): Promise<string> {
  await page.goto("/amigos", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Convidar alguém" }).click();
  const link = page.getByTestId("link-convite");
  await expect(link).toBeVisible({ timeout: 15_000 });
  return new URL(await link.inputValue()).pathname;
}

test.describe("duas contas adultas", () => {
  test("convite por link, pedido, aceite mútuo; cada um vê só apelido, dias e hoje; encerrar mostra o aviso neutro", async ({ browser }) => {
    const ana = await abrirConta(browser, 2000);
    const bia = await abrirConta(browser, 2001);
    const apelidoAna = apelidoUnico("Ana");
    const apelidoBia = apelidoUnico("Bia");

    await ana.goto("/amigos", { waitUntil: "domcontentloaded" });
    await expect(ana.getByRole("heading", { name: "Escolha um apelido" })).toBeVisible({ timeout: 20_000 });
    await definirApelido(ana, apelidoAna);
    await expect(ana.getByRole("heading", { name: "Convidar alguém" })).toBeVisible({ timeout: 15_000 });
    const caminho = await gerarConvite(ana);
    expect(caminho).toMatch(/^\/amigos\/convite\/[A-Za-z0-9_-]{22}$/);

    // Bia abre o link: precisa de apelido antes; só então vê o apelido de quem convidou.
    await bia.goto(caminho, { waitUntil: "domcontentloaded" });
    await expect(bia.getByRole("heading", { name: "Escolha um apelido" })).toBeVisible({ timeout: 20_000 });
    await expect(bia.getByText(apelidoAna)).toHaveCount(0);
    await definirApelido(bia, apelidoBia);
    await expect(bia.getByTestId("convite-pergunta")).toHaveText(`${apelidoAna} quer começar uma ofensiva em dupla. Começar?`, { timeout: 15_000 });
    await bia.getByRole("button", { name: "Pedir" }).click();
    await expect(bia.getByText("Pedido enviado. A dupla começa quando a outra pessoa aceitar.")).toBeVisible();

    // O link é de uso único.
    await bia.goto(caminho, { waitUntil: "domcontentloaded" });
    await expect(bia.getByTestId("convite-indisponivel")).toHaveText("Convite indisponível.", { timeout: 15_000 });

    // Ana aceita o pedido.
    await ana.goto("/amigos", { waitUntil: "domcontentloaded" });
    const pedidos = ana.getByTestId("pedidos-recebidos");
    await expect(pedidos).toContainText(apelidoBia, { timeout: 15_000 });
    await pedidos.getByRole("button", { name: "Aceitar" }).click();
    const dupla = ana.getByTestId("dupla");
    await expect(dupla).toContainText(apelidoBia, { timeout: 15_000 });
    await expect(dupla.getByTestId("dupla-dias")).toHaveText("0 dias");
    await expect(dupla).toContainText("Recorde: 0 dias");

    // Bia vê a dupla; nada de pressão nem "dar um toque".
    await bia.goto("/amigos", { waitUntil: "domcontentloaded" });
    await expect(bia.getByTestId("dupla")).toContainText(apelidoAna, { timeout: 15_000 });
    await expect(bia.getByText(/esperando|toque|vai perder|corra/i)).toHaveCount(0);

    // Bia encerra (2 toques); Ana vê só o aviso neutro, sem o apelido.
    await bia.getByRole("button", { name: "Encerrar dupla" }).click();
    await bia.getByRole("button", { name: "Encerrar mesmo?" }).click();
    await expect(bia.getByTestId("dupla")).toHaveCount(0, { timeout: 15_000 });
    await ana.goto("/amigos", { waitUntil: "domcontentloaded" });
    await expect(ana.getByTestId("dupla-encerrada").first()).toHaveText("Essa ofensiva em dupla foi encerrada.", { timeout: 15_000 });
    await expect(ana.getByTestId("dupla")).toHaveCount(0);

    await ana.context().close();
    await bia.context().close();
  });
});

test("conta de 17 anos: link de convite genérico, sem o apelido de quem convidou; /amigos só com o aviso", async ({ browser }) => {
  const ana = await abrirConta(browser, 2000);
  const apelidoAna = apelidoUnico("Ana");
  await ana.goto("/amigos", { waitUntil: "domcontentloaded" });
  await expect(ana.getByRole("heading", { name: "Escolha um apelido" })).toBeVisible({ timeout: 20_000 });
  await definirApelido(ana, apelidoAna);
  await expect(ana.getByRole("heading", { name: "Convidar alguém" })).toBeVisible({ timeout: 15_000 });
  const caminho = await gerarConvite(ana);

  const menor = await abrirConta(browser, 2009);
  await menor.goto(caminho, { waitUntil: "domcontentloaded" });
  await expect(menor.getByTestId("tela-convite")).toHaveAttribute("data-estado", "indisponivel", { timeout: 20_000 });
  await expect(menor.getByTestId("convite-indisponivel")).toHaveText("Convite indisponível.");
  await expect(menor.getByText(apelidoAna)).toHaveCount(0);
  await expect(menor.getByRole("button", { name: "Pedir" })).toHaveCount(0);

  await menor.goto("/amigos", { waitUntil: "domcontentloaded" });
  await expect(menor.getByTestId("amigos-menor")).toHaveText("A ofensiva com amigos é para maiores de 18. O resto do Foca continua igual para você.", { timeout: 20_000 });
  await expect(menor.getByRole("button", { name: "Convidar alguém" })).toHaveCount(0);

  await ana.context().close();
  await menor.context().close();
});

test("Missões: para adulto, a seção social leva à Liga da semana e aos Amigos", async ({ page }) => {
  // Conta padrão dos E2E (sessão do projeto "setup", ano 2006: adulta).
  await page.goto("/missoes", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("missoes-liga")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("missoes-amigos")).toBeVisible();
  await page.getByTestId("missoes-amigos").click();
  await expect(page).toHaveURL(/\/amigos$/);
  await expect(page.getByTestId("tela-amigos")).toBeVisible({ timeout: 15_000 });
});

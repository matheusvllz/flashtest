/**
 * "Pular para cá" (spec 50 §5.7.1, T-50.12.3) ponta a ponta, com conta real: o nó do capítulo-alvo, a entrada com os
 * limites, o teste sem vida e sem a Foca IA, e os dois resultados — passou ("Capítulo liberado", lições "Puladas" na
 * trilha, alvo andando) e não passou ("Comece por <lição>", "Vale revisar", nada marcado). As regras do servidor têm
 * testes próprios em tests/unit/servidor/pulo.test.ts.
 */
import { expect, test, type Page } from "@playwright/test";
import { criarContaVerificada, entrarPelaApi } from "./helpers/conta";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 180_000 });

async function entrar(page: Page, materia: string) {
  const email = await criarContaVerificada(page.context().request);
  await entrarPelaApi(page.context().request, email);
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2, trailSubjectId: materia } });
  await page.goto("/trilha?vista=mapa", { waitUntil: "domcontentloaded" });
  await expect
    .poll(
      () => page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}").account?.userId ?? null).catch(() => null),
      { timeout: 30_000 },
    )
    .not.toBeNull();
}

/** Índice da alternativa certa, lido do mesmo módulo de conteúdo que o app usa (servidor de desenvolvimento do Vite). */
async function indiceCerto(page: Page, itemId: string): Promise<number | null> {
  return page.evaluate(async (id) => {
    const m = (await import(/* @vite-ignore */ "/src/content/microlicoes/index.ts")) as {
      resolveExercise: (id: string) => { type: string; correta?: number; erroIndex?: number; verdadeiro?: boolean };
    };
    const ex = m.resolveExercise(id);
    if (ex.type === "multipla-escolha" || ex.type === "complete-lacuna" || ex.type === "interpretacao") return ex.correta ?? null;
    if (ex.type === "encontre-o-erro") return ex.erroIndex ?? null;
    if (ex.type === "verdadeiro-falso") return ex.verdadeiro ? 0 : 1; // botões: Verdadeiro, Falso
    return null;
  }, itemId);
}

async function responderTudo(page: Page, modo: "certo" | "nao-sei") {
  const teste = page.getByTestId("pulo-teste");
  for (let i = 0; i < 12; i++) {
    const fim = page.getByTestId("pulo-resultado");
    await expect(teste.or(fim)).toBeVisible({ timeout: 30_000 });
    if (await fim.isVisible()) return;
    const itemId = (await teste.getAttribute("data-item-id"))!;
    const indice = modo === "certo" ? await indiceCerto(page, itemId) : null;
    if (indice === null) {
      await page.getByRole("button", { name: "Não sei" }).click();
    } else {
      await teste.locator('[role="radio"]').nth(indice).click();
      await page.getByRole("button", { name: "Verificar" }).click();
    }
    await expect(page.locator(`[data-testid="pulo-teste"][data-item-id="${itemId}"]`)).toHaveCount(0, { timeout: 30_000 });
  }
}

test("passa: lições do caminho ficam Puladas, +20 XP, e o pulo anda para o próximo capítulo", async ({ page }) => {
  await entrar(page, "mat");
  const botao = page.getByTestId("pular-para-ca");
  await expect(botao).toHaveCount(1, { timeout: 30_000 });
  await botao.click();
  await expect(page).toHaveURL(/\/pulo\//);

  const entrada = page.getByTestId("pulo-entrada");
  await expect(entrada).toBeVisible({ timeout: 30_000 });
  await expect(entrada.getByRole("heading", { level: 1 })).toContainText("Pular para");
  await expect(page.getByTestId("pulo-limites")).toHaveText("Uma tentativa por capítulo por dia e até 3 testes por dia. Hoje: 0 de 3.");
  await expect(page.getByTestId("pulo-licoes").getByRole("listitem")).toHaveCount(2);
  await page.getByRole("button", { name: "Começar o teste" }).click();

  // Sem a Foca IA durante o teste.
  await expect(page.getByTestId("pulo-teste")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("[data-tutor-fab]")).toHaveCount(0);
  await responderTudo(page, "certo");

  const resultado = page.getByTestId("pulo-resultado");
  await expect(resultado).toHaveAttribute("data-passou", "true", { timeout: 30_000 });
  await expect(resultado).toContainText("Capítulo liberado");
  await expect(resultado).toContainText("+20 XP");
  await expect(page.getByTestId("pulo-puladas").getByRole("listitem")).toHaveCount(2);

  await resultado.getByRole("link", { name: "Ir para a trilha" }).click();
  await expect(page.locator('[aria-label$="— Pulada"]').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("pular-para-ca")).toHaveCount(1);
  const estado = await page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"));
  const puladas = Object.values(estado.learning.completedLessons as Record<string, { pulo?: boolean }>).filter((l) => l.pulo);
  expect(puladas).toHaveLength(2);
});

test("não passa: 'Comece por', 'Vale revisar', nada marcado; o limite do dia aparece no outro capítulo", async ({ page }) => {
  await entrar(page, "por");
  const botao = page.getByTestId("pular-para-ca");
  await expect(botao).toHaveCount(1, { timeout: 30_000 });
  const href = await botao.getAttribute("href");
  await botao.click();
  await expect(page.getByTestId("pulo-entrada")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Começar o teste" }).click();
  await responderTudo(page, "nao-sei");

  const resultado = page.getByTestId("pulo-resultado");
  await expect(resultado).toHaveAttribute("data-passou", "false", { timeout: 30_000 });
  await expect(resultado.getByRole("heading", { level: 1 })).toContainText("Comece por");
  await expect(page.getByTestId("pulo-vale-revisar").getByRole("listitem").first()).toBeVisible();
  await expect(resultado).not.toContainText(/errou|fracass|reprov|nota/i);
  await expect(resultado.getByRole("link", { name: "Abrir a lição" })).toBeVisible();

  const estado = await page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"));
  expect(Object.keys(estado.learning.completedLessons ?? {})).toHaveLength(0);

  // Mesmo capítulo hoje: mostra o resultado de hoje de novo (uma tentativa por capítulo por dia).
  await page.goto(href!, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("pulo-resultado")).toContainText("Amanhã dá para tentar o teste deste capítulo de novo.", { timeout: 30_000 });

  // Outra matéria: a entrada mostra quantos testes já foram feitos hoje.
  await page.goto("/trilha?vista=mapa", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Matemática/ }).first().click();
  await page.getByTestId("pular-para-ca").click({ timeout: 30_000 });
  await expect(page.getByTestId("pulo-limites")).toHaveText(/Hoje: 1 de 3\./, { timeout: 30_000 });
});

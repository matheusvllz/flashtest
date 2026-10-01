import { expect, test } from "@playwright/test";
import { lerEstado, seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

/**
 * Tópicos e plano funcionais (spec 48 T-48.4.1/T-48.4.2, RF-10/RF-11; B-065, B-066). Roda em 390 (chromium), 320
 * (narrow) e 1280 (desktop, B-074).
 */
const ALUNO = { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2, difficultSubjects: ["Matemática"] } };

test("plano: mostra a fila real do motor, sem tarefas fixas, e abre a mesma atividade da trilha", async ({ page }) => {
  await seedOnce(page, ALUNO);
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).first().waitFor({ timeout: 15_000 });
  await expect.poll(async () => (await lerEstado(page))?.learning?.journey?.committed?.length ?? 0, { timeout: 15_000 }).toBeGreaterThan(0);
  const primeira = (await lerEstado(page)).learning.journey.committed[0];

  await page.goto("/plan", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("plano-atual")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/5 flashcards|1 videoaula|montadas pelas suas lacunas/)).toHaveCount(0);
  await expect(page.getByTestId("plano-meta")).toContainText(/Meta de hoje: \d+ de \d+/);
  // Fila na ordem do motor: o mesmo id que a trilha comprometeu em primeiro lugar.
  const estado = await lerEstado(page);
  expect(estado.learning.journey.committed[0].id).toBe(primeira.id);
  await expect(page.getByTestId("plano-fila").locator("li")).not.toHaveCount(0);

  // Sem rolagem horizontal em nenhum tamanho.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  await page.getByRole("link", { name: /^(Começar|Continuar)$/ }).click();
  await expect(page).toHaveURL(/\/(atividade|learn|redacao)\//, { timeout: 15_000 });
});

test("tópicos: escolher assuntos explica o efeito, persiste e muda a assinatura do plano", async ({ page }) => {
  await seedOnce(page, ALUNO);
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await expect.poll(async () => (await lerEstado(page))?.learning?.journey?.focusSignature ?? null, { timeout: 15_000 }).not.toBeNull();
  const antes = (await lerEstado(page)).learning.journey.focusSignature as string;

  await page.goto("/topics", { waitUntil: "domcontentloaded" });
  await page.getByRole("radio", { name: "Quero escolher os assuntos" }).click();
  await expect(page.getByText("Os assuntos marcados aparecem mais cedo")).toBeVisible();
  await page.getByRole("button", { name: "Probabilidade" }).click();
  await expect(page.getByRole("button", { name: "Probabilidade" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("1 assunto marcado")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  // O plano é refeito com a escolha (a assinatura persistida passa a incluir o assunto).
  await page.goto("/plan", { waitUntil: "domcontentloaded" });
  await expect.poll(async () => (await lerEstado(page)).learning.journey.focusSignature as string, { timeout: 15_000 }).toContain("|t:mat=prob");
  expect(antes).not.toContain("|t:");
  const estado = await lerEstado(page);
  expect(estado.prefs.topicMode).toBe("chose");
  expect(estado.prefs.selectedTopics.mat).toEqual(["prob"]);
  await expect(page.getByText(/Assuntos escolhidos: Probabilidade/)).toBeVisible();
});

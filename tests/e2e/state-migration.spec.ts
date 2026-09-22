import { expect, test } from "@playwright/test";

/**
 * Fase 5 (docs/20 §15, §2.5): usuário retornando com progresso salvo não pode
 * cair em `/welcome` porque o splash leu o estado antes de hidratar. Também
 * cobre o backup automático e a migração de um estado v3 legado (sem
 * `schemaVersion`/`learning`) que ainda pode existir em produção.
 */

const V3_LEGADO = JSON.stringify({
  authed: true,
  onboarded: true,
  prefs: { name: "Ana", sound: true, haptics: true, theme: "auto", dailyLessons: 3 },
  progress: { xp: 250, streak: 5, lessonsCompleted: 4, completedQuestions: ["q1", "q2"] },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
});

test("usuário com progresso salvo (estado v3 legado) é hidratado e vai pra home (/trilha), não pro /welcome", async ({
  page,
}) => {
  // Semeia o localStorage ANTES de qualquer script da página rodar.
  await page.addInitScript((v3) => {
    localStorage.setItem("foca.state.v3", v3);
  }, V3_LEGADO);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/trilha", { timeout: 5000 });

  // Confirma que o XP/streak salvos sobreviveram à migração (nada foi perdido).
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Ana", { exact: true })).toBeVisible();
});

test("migração cria backup v4 uma única vez e adiciona schemaVersion sem apagar XP", async ({
  page,
}) => {
  await page.addInitScript((v3) => {
    localStorage.setItem("foca.state.v3", v3);
  }, V3_LEGADO);

  // `/dashboard` redireciona pra `/trilha` com a flag ligada (docs/25 §18
  // T-20) — a home nova não tem mais um heading com o nome (§12.1: quem
  // cumpre esse papel é a fala da Foca), então o sinal de "hidratou e
  // renderizou" passa a ser o card "Continuar" (ContinueCard).
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/trilha", { timeout: 15000 });
  // Espera um elemento real renderizar — não um timeout fixo. O primeiro nav
  // de rota no Vite dev server pode levar bem mais que uns poucos ms pra
  // compilar (mais ainda com workers em paralelo competindo pelo mesmo
  // servidor), e só depois disso o `hydrate()`/`load()` roda.
  await page.getByText("Continuar").first().waitFor({ timeout: 15000 });

  const armazenado = await page.evaluate(() => ({
    backup: localStorage.getItem("foca.state.backup.before-learning-v4"),
    atual: localStorage.getItem("foca.state.v3"),
  }));

  expect(armazenado.backup).not.toBeNull();
  const backupParsed = JSON.parse(armazenado.backup!);
  expect(backupParsed.progress.xp).toBe(250); // backup é o v3 ORIGINAL, sem os campos novos

  const atualParsed = JSON.parse(armazenado.atual!);
  expect(atualParsed.schemaVersion).toBe(5);
  expect(atualParsed.progress.xp).toBe(250); // XP preservado no estado migrado também
  expect(atualParsed.learning).toBeDefined();
});

test("usuário novo (sem storage nenhum) ainda vai pro /welcome normalmente", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/welcome", { timeout: 5000 });
});

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
  // renderizou" passa a ser o CTA principal do card do topo (`ContinueCard`
  // no mapa, `SessionCard` na jornada — docs/32 F15.1: o rótulo varia entre
  // "Continuar" e "Começar por aqui" conforme ter algo em andamento, então
  // o sinal estável é o `.btn-primary`, não o texto).
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/trilha", { timeout: 15000 });
  // Espera um elemento real renderizar — não um timeout fixo. O primeiro nav
  // de rota no Vite dev server pode levar bem mais que uns poucos ms pra
  // compilar (mais ainda com workers em paralelo competindo pelo mesmo
  // servidor), e só depois disso o `hydrate()`/`load()` roda.
  await page.locator(".btn-primary").first().waitFor({ timeout: 15000 });

  const armazenado = await page.evaluate(() => ({
    backup: localStorage.getItem("foca.state.backup.before-learning-v4"),
    atual: localStorage.getItem("foca.state.v3"),
  }));

  expect(armazenado.backup).not.toBeNull();
  const backupParsed = JSON.parse(armazenado.backup!);
  expect(backupParsed.progress.xp).toBe(250); // backup é o v3 ORIGINAL, sem os campos novos

  const atualParsed = JSON.parse(armazenado.atual!);
  // Schema atual (docs/30 §21.1/§24.1, Fase 4 do docs/31) — v3 legado migra
  // direto pra v6, não passa por 4/5 como versão intermediária gravada.
  expect(atualParsed.schemaVersion).toBe(6);
  expect(atualParsed.progress.xp).toBe(250); // XP preservado no estado migrado também
  expect(atualParsed.learning).toBeDefined();
});

test("usuário novo (sem storage nenhum) ainda vai pro /welcome normalmente", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/welcome", { timeout: 5000 });
});

const V5_COM_PROGRESSO = JSON.stringify({
  authed: true,
  onboarded: true,
  schemaVersion: 5,
  prefs: { name: "Bia", sound: true, haptics: true, theme: "auto", dailyLessons: 3, trailSubjectId: "mat" },
  progress: { xp: 480, streak: 9, lessonsCompleted: 6, completedQuestions: ["q1", "q2", "q3"] },
  learning: {
    activeSession: null,
    completedLessons: { "porcentagem-valor": { version: 2, completedAt: "2026-09-01T00:00:00.000Z", stars: 3, bestPct: 100 } },
    skillEvidence: {},
    reviewSchedule: {},
    recentAttempts: [],
    rewardLedger: {},
    tipHistory: [],
    celebratedChapterIds: ["mat-porcentagem"],
  },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
});

test("schema v6 (docs/30 §21.1/§24.1): estado v5 migra pra v6 preservando tudo, cria backup 'before-v6' uma única vez", async ({
  page,
}) => {
  await page.addInitScript((v5) => {
    localStorage.setItem("foca.state.v3", v5);
  }, V5_COM_PROGRESSO);

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/trilha", { timeout: 15000 });
  // `.btn-primary`, não o texto — ver comentário no teste de migração v4 acima (docs/32 F15.1).
  await page.locator(".btn-primary").first().waitFor({ timeout: 15000 });

  const armazenado = await page.evaluate(() => ({
    backupV6: localStorage.getItem("foca.state.backup.before-v6"),
    atual: localStorage.getItem("foca.state.v3"),
  }));

  expect(armazenado.backupV6).not.toBeNull();
  const backupParsed = JSON.parse(armazenado.backupV6!);
  expect(backupParsed.schemaVersion).toBe(5); // backup é o v5 ORIGINAL, antes dos campos do v6

  const atualParsed = JSON.parse(armazenado.atual!);
  expect(atualParsed.schemaVersion).toBe(6);
  expect(atualParsed.progress.xp).toBe(480); // XP preservado
  expect(atualParsed.progress.streak).toBe(9); // streak preservado
  expect(atualParsed.learning.completedLessons["porcentagem-valor"]).toBeDefined(); // lição concluída preservada
  expect(atualParsed.learning.celebratedChapterIds).toEqual(["mat-porcentagem"]); // v5 preservado
  // Campos aditivos do v6 presentes com o padrão vazio (não populados ainda — Fases 5/12/13).
  expect(atualParsed.learning.skillModel).toEqual({});
  expect(atualParsed.learning.journey).toBeDefined();
  expect(atualParsed.prefs.studyFocus).toEqual({ mode: "todas", subjectIds: [], areas: [] });
  expect(atualParsed.prefs.onboardingVersion).toBe(1); // já era `onboarded: true` -> fluxo antigo
});

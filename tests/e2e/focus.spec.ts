import { expect, test } from "@playwright/test";

/**
 * Modo foco (docs/30 §15, Fase 12 do docs/31 F12.5) — "Só hoje" (sessão
 * temporária) vs. "Daqui pra frente" (preferência permanente) vs. "Voltar a
 * todas". A expiração do "só hoje" no dia seguinte já é testada na camada de
 * parser (`state-migrations.test.ts`, F4.2 do docs/32: `parseFocusSession`
 * expira sozinha se `expiresOn < hoje`) — aqui testamos o RESULTADO visível
 * (um `focusSession` já vencido não aparece na `FocusLine`), não um
 * relógio simulado ao vivo, pra não depender de uma API de clock sem
 * precedente nesta suíte.
 */

const USUARIO_ONBOARDED = {
  authed: true,
  onboarded: true,
  prefs: { name: "Ana", sound: true, haptics: true, theme: "auto", dailyLessons: 3 },
  progress: { xp: 100, streak: 2, lessonsCompleted: 1, completedQuestions: [] },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

async function ligarJornada(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("foca.flags", JSON.stringify({ jornadaAdaptativa: true }));
  });
}

async function seedEstado(
  page: import("@playwright/test").Page,
  extra: { prefs?: Record<string, unknown>; learning?: Record<string, unknown> } = {},
) {
  const estado = {
    ...USUARIO_ONBOARDED,
    prefs: { ...USUARIO_ONBOARDED.prefs, ...extra.prefs },
    ...(extra.learning ? { learning: extra.learning } : {}),
  };
  // `addInitScript` roda de novo em CADA navegação da página, inclusive
  // `page.reload()` (documentado assim no Playwright) — sem a checagem
  // "só semeia se ainda não existir", um teste que recarrega a página pra
  // provar persistência apagaria sozinho o que acabou de escrever, disfarçado
  // de "não persistiu" (achado real ao escrever o teste "Daqui pra frente
  // persiste depois de recarregar").
  await page.addInitScript((raw) => {
    if (!localStorage.getItem("foca.state.v3")) {
      localStorage.setItem("foca.state.v3", JSON.stringify(raw));
    }
  }, estado);
}

test.beforeEach(async ({ page }) => {
  await ligarJornada(page);
});

test("'Só hoje' com Física: FocusLine mostra o foco e grava a sessão temporária", async ({
  page,
}) => {
  await seedEstado(page);
  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });

  await page.getByRole("button", { name: "Mudar" }).click();
  await page.getByRole("button", { name: "Física" }).click();
  await page.getByRole("button", { name: "Só hoje" }).click();

  await expect(page.getByText("Foco: Física")).toBeVisible();

  const estado = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"),
  );
  expect(estado.learning.focusSession.subjectIds).toEqual(["fis"]);
  expect(estado.prefs.studyFocus.mode).toBe("todas"); // sessão temporária não mexe no permanente
});

test("sessão de foco vencida (expiresOn de ontem) não aparece — 'volta pra todas' sozinha", async ({
  page,
}) => {
  await seedEstado(page, {
    learning: {
      focusSession: {
        subjectIds: ["fis"],
        startedAt: "2026-01-01T08:00:00.000Z",
        expiresOn: "2020-01-01",
      },
    },
  });
  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });
  await expect(page.getByText("Todas as matérias")).toBeVisible();
  await expect(page.getByText(/^Foco:/)).toHaveCount(0);
});

test("'Daqui pra frente' persiste depois de recarregar a página", async ({ page }) => {
  await seedEstado(page);
  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });

  await page.getByRole("button", { name: "Mudar" }).click();
  await page.getByRole("button", { name: "Física" }).click();
  await page.getByRole("button", { name: "Daqui pra frente" }).click();
  await expect(page.getByText("Foco: Física")).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });
  await expect(page.getByText("Foco: Física")).toBeVisible();

  const estado = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"),
  );
  expect(estado.prefs.studyFocus).toEqual({ mode: "materias", subjectIds: ["fis"], areas: [] });
});

test("'Voltar a todas' limpa foco permanente e sessão temporária", async ({ page }) => {
  await seedEstado(page, {
    prefs: { studyFocus: { mode: "materias", subjectIds: ["fis"], areas: [] } },
    learning: {
      focusSession: {
        subjectIds: ["fis"],
        startedAt: "2026-01-01T08:00:00.000Z",
        expiresOn: "2099-01-01",
      },
    },
  });
  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });
  await expect(page.getByText("Foco: Física")).toBeVisible();

  await page.getByRole("button", { name: "Mudar" }).click();
  await page.getByRole("button", { name: "Voltar a todas" }).click();

  await expect(page.getByText("Todas as matérias")).toBeVisible();
  const estado = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"),
  );
  expect(estado.learning.focusSession).toBeNull();
  expect(estado.prefs.studyFocus.mode).toBe("todas");
});

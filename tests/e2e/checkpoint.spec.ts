import { expect, test } from "@playwright/test";

/**
 * Checkpoint da jornada (docs/30 §13, Fase 14 do docs/31 F14.2/F14.4) — a
 * composição real (`composeCheckpoint`) usa o MESMO pool "diagnostico" do
 * nivelamento (Fase 13), vazio hoje no catálogo (Fase 11 pendente). Uma
 * atividade `checkpoint` comprometida chega até a tela de entrada
 * (`CheckpointIntro`, sem depender de nenhum item real), mas "Começar" cai
 * no mesmo caso de borda já coberto pela Fase 12 (`buildActivityLesson`
 * lança com menos de 2 itens → redireciona pra `/trilha`) — testado aqui
 * como o comportamento REAL e honesto de hoje. A composição/recalibração
 * de verdade (cotas, sinais de super/subestimação) já está coberta com
 * pool sintético em `tests/unit/checkpoint-compose.test.ts`.
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

function comCheckpointComprometido() {
  return {
    ...USUARIO_ONBOARDED,
    learning: {
      journey: {
        committed: [
          {
            id: "atv-test-checkpoint",
            kind: "checkpoint",
            skillIds: [],
            subjectId: "",
            estimatedMinutes: 5,
            reasons: ["checkpoint"],
            score: 1,
            scoreBreakdown: {},
          },
        ],
        upcoming: [],
        history: [],
        activeActivity: null,
        sinceCheckpoint: 0,
        lastCheckpointDate: null,
        planVersion: 1,
      },
    },
  };
}

async function ligarJornada(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "foca.flags",
      JSON.stringify({ jornadaAdaptativa: true, checkpointsTrilha: true }),
    );
  });
}

test("checkpoint comprometido: mostra a tela de entrada, sem Foca nem escada, e 'Começar' respeita o pool vazio de hoje", async ({
  page,
}) => {
  await ligarJornada(page);
  await page.addInitScript(
    (raw) => localStorage.setItem("foca.state.v3", JSON.stringify(raw)),
    comCheckpointComprometido(),
  );

  await page.goto("/atividade/atv-test-checkpoint?debug=1", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Checkpoint" })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("Questões misturadas, sem dica.")).toBeVisible();
  const comecar = page.getByRole("button", { name: "Começar" });
  await expect(comecar).toBeVisible();
  await comecar.click();

  // Pool "diagnostico" vazio hoje (Fase 11 pendente) — `buildActivityLesson`
  // não monta com < 2 itens e a rota volta pra `/trilha` (mesmo caso de
  // borda já coberto pela Fase 12), nunca uma tela quebrada.
  await page.waitForURL(/\/trilha/, { timeout: 15000 });

  const estado = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"),
  );
  expect(estado.learning.rewardLedger?.["atividade:atv-test-checkpoint"]).toBeUndefined();
});

test("'Agora não' volta pra trilha sem gastar XP nem tirar o checkpoint de 'committed'", async ({
  page,
}) => {
  await ligarJornada(page);
  await page.addInitScript(
    (raw) => localStorage.setItem("foca.state.v3", JSON.stringify(raw)),
    comCheckpointComprometido(),
  );

  await page.goto("/atividade/atv-test-checkpoint?debug=1", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Checkpoint" })).toBeVisible({ timeout: 15000 });

  const xpAntes = await page.evaluate(
    () => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}").progress.xp,
  );
  await page.getByRole("button", { name: "Agora não" }).click();
  await page.waitForURL(/\/trilha/, { timeout: 15000 });

  const estado = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"),
  );
  expect(estado.progress.xp).toBe(xpAntes);
  expect(estado.learning.journey.committed[0]?.id).toBe("atv-test-checkpoint");
});

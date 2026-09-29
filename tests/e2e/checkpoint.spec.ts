import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PLANNER_VERSION } from "../../src/lib/adaptive/constants";
import { lerEstado } from "./helpers/estado";

/**
 * Checkpoint da jornada (docs/30 §13, Fase 14 do docs/31 F14.2/F14.4) — a
 * composição real (`composeCheckpoint`) usa o pool "diagnostico" (Fase 11/F15.1)
 * das habilidades PRATICADAS desde o último checkpoint. Desde o docs/36 (T-02.1/
 * T-02.2) a rota `/atividade` escolhe os itens ao ABRIR (proprietária única):
 * com histórico, a tela de entrada aparece e "Começar" abre a 1ª questão; sem nada
 * a compor (histórico vazio), o checkpoint é DESCARTADO na abertura com aviso —
 * não mais "mostra a entrada e cai em /trilha depois do Começar". A composição de
 * verdade (cotas, sinais de super/subestimação) está coberta com pool sintético
 * em `tests/unit/checkpoint-compose.test.ts`.
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

/** `comHistorico`: 4 habilidades de matemática praticadas desde o último checkpoint — o que ele tem pra compor. */
function comCheckpointComprometido(comHistorico = true) {
  const skills = ["mat:porcentagem-conceito", "mat:operacoes-fundamentais", "mat:razao-proporcao", "mat:equacao-primeiro-grau"];
  const history = comHistorico
    ? skills.map((skillId, i) => ({
        activityId: `hist-${i}`,
        kind: "pratica",
        skillIds: [skillId],
        subjectId: "mat",
        completedAt: "2026-09-27T10:00:00.000Z",
        scorePct: 80,
        attemptKey: `hist-${i}@sem-inicio`,
      }))
    : [];
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
        history,
        activeActivity: null,
        sinceCheckpoint: 0,
        lastCheckpointDate: null,
        planVersion: PLANNER_VERSION,
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

test("checkpoint comprometido: mostra a tela de entrada, sem Foca nem escada, e 'Começar' abre a 1ª questão", async ({
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

  // Itens compostos ao abrir (docs/36 RF-2): a 1ª questão aparece e o estado guarda itemIds + startedAt.
  const abertura = page.getByRole("button", { name: "Começar" });
  if (await abertura.isVisible().catch(() => false)) await abertura.click();
  await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 15000 });
  const estado = await page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"));
  const ativa = estado.learning.journey.activeActivity;
  expect(ativa.id).toBe("atv-test-checkpoint");
  expect(ativa.itemIds.length).toBeGreaterThanOrEqual(2);
  expect(ativa.startedAt).toBeTruthy();
  expect(estado.learning.rewardLedger?.["atividade:atv-test-checkpoint"]).toBeUndefined();
});

test("checkpoint sem nada a compor (histórico vazio): descartado na abertura, volta pra /trilha, sem XP (docs/36 RF-3)", async ({
  page,
}) => {
  await ligarJornada(page);
  await page.addInitScript(
    (raw) => localStorage.setItem("foca.state.v3", JSON.stringify(raw)),
    comCheckpointComprometido(false),
  );

  await page.goto("/atividade/atv-test-checkpoint?debug=1", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/trilha/, { timeout: 15000 });

  const estado = await page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"));
  expect(estado.learning.rewardLedger ?? {}).toEqual({});
  expect(estado.learning.journey.history).toHaveLength(0);
  expect(estado.learning.journey.committed.map((a: { id: string }) => a.id)).not.toContain("atv-test-checkpoint");
  expect(
    estado.learning.events.filter((e: { type: string; activityId?: string }) => e.type === "activity-skipped" && e.activityId === "atv-test-checkpoint"),
  ).toHaveLength(1);
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

/* -------------------------------------------------------------------------
 * docs/36 T-04.4 (RP-4, G-9) — concluir o checkpoint recalibra: errar onde o
 * modelo previa acerto antecipa a revisão para amanhã; acertar onde previa erro
 * deixa a habilidade elegível a desafio por 7 dias. Usa o pacote real de
 * matemática (gabarito lido de public/content/v1) e um modelo semeado com θ
 * extremo (previsões ≥ 0,8 / ≤ 0,4 garantidas).
 * ---------------------------------------------------------------------- */

interface ItemPacote {
  id: string;
  skill: string;
  opcoes: string[];
  correta: number;
}

function itensDoPacote(materia: string): ItemPacote[] {
  const manifest = JSON.parse(readFileSync(join("public", "content", "v1", "manifest.json"), "utf-8"));
  const caminho = manifest.subjects[materia].path as string; // "/content/v1/mat.<hash>.json"
  const pacote = JSON.parse(readFileSync(join("public", caminho), "utf-8"));
  return pacote.items.map((i: { id: string; meta: { skillIds: string[] }; exercise: { opcoes: string[]; correta: number } }) => ({
    id: i.id,
    skill: i.meta.skillIds[0],
    opcoes: i.exercise.opcoes,
    correta: i.exercise.correta,
  }));
}

/** Data local `YYYY-MM-DD` + `dias` (mesma conta do app, fuso da máquina). */
function dataLocalMais(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function entradaModelo(skillId: string, theta: number) {
  return {
    skillId, theta, sigma: 0.5, nEff: 4, difficultiesSeen: [2, 3], recent: [1, 1, 1, 1], independentShare: 1,
    lastEvidenceDate: "2026-09-20", lapses: 0, dontKnowRecent: 0, helpHeavyRecent: 0,
    source: "evidencia", algoVersion: 1, updatedAt: "2026-09-20T10:00:00.000Z",
  };
}

test("checkpoint concluído recalibra: superestimada antecipa a revisão para amanhã; subestimada fica elegível a desafio (RP-4)", async ({
  page,
}) => {
  const itens = itensDoPacote("mat");
  const habilidades = [...new Set(itens.map((i) => i.skill))];
  // As 2 primeiras praticadas: o modelo "acha que sabe" (θ alto); as 2 últimas: "acha que não sabe" (θ baixo). O resto (antigas/firmes): alto.
  const baixas = new Set(["mat:razao-proporcao", "mat:equacao-primeiro-grau"]);
  const skillModel: Record<string, unknown> = {};
  const reviewSchedule: Record<string, unknown> = {};
  for (const sk of habilidades) {
    const baixa = baixas.has(sk);
    skillModel[sk] = entradaModelo(sk, baixa ? -4 : 3.5);
    if (!baixa) reviewSchedule[sk] = { skillId: sk, intervalDays: 14, dueDate: dataLocalMais(30), lastResult: "correct" };
  }

  const base = comCheckpointComprometido();
  const estado = {
    ...base,
    learning: {
      ...base.learning,
      skillModel,
      reviewSchedule,
      modelMeta: { algoVersion: 1, bootstrappedAt: "2026-09-20T10:00:00.000Z" },
    },
  };
  await ligarJornada(page);
  await page.addInitScript((raw) => {
    if (!localStorage.getItem("foca.state.v3")) localStorage.setItem("foca.state.v3", JSON.stringify(raw));
  }, estado);

  await page.goto("/atividade/atv-test-checkpoint?debug=1", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Checkpoint" })).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Começar" }).click();
  const abertura = page.getByRole("button", { name: "Começar" });
  if (await abertura.isVisible().catch(() => false)) await abertura.click();

  // Responde pelo GABARITO: item de habilidade "alta" -> erra (superestimada); de "baixa" -> acerta (subestimada).
  for (let i = 0; i < 12; i++) {
    const concluir = page.getByRole("button", { name: "Concluir lição" });
    if (await concluir.isVisible().catch(() => false)) {
      await concluir.click();
      break;
    }
    await page.getByRole("radio").first().waitFor({ timeout: 15000 });
    const textos = await page.getByRole("radio").allTextContents();
    const item = itens.find((it) => it.opcoes.length === textos.length && it.opcoes.every((o) => textos.includes(o)));
    expect(item, `questão desconhecida: ${textos.join(" | ")}`).toBeTruthy();
    const acertar = baixas.has(item!.skill);
    const alvo = acertar ? item!.opcoes[item!.correta] : item!.opcoes.find((_, idx) => idx !== item!.correta)!;
    await page.getByRole("radio", { name: alvo, exact: true }).click();
    await page.getByRole("button", { name: "Verificar" }).click();
    await page.locator('[role="status"]').waitFor();
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
  }

  await expect.poll(async () => (await lerEstado(page))?.learning?.journey?.history?.length ?? 0, { timeout: 10000 }).toBe(base.learning.journey.history.length + 1);
  const s = await lerEstado(page);
  const tentativas = (s.learning.recentAttempts as Array<{ skillIds: string[]; correct: boolean; predictedP?: number; role: string }>).filter(
    (a) => a.role === "checkpoint",
  );
  expect(tentativas.length).toBeGreaterThanOrEqual(2);
  const super_ = tentativas.filter((a) => a.predictedP !== undefined && a.predictedP >= 0.8 && !a.correct);
  const sub = tentativas.filter((a) => a.predictedP !== undefined && a.predictedP <= 0.4 && a.correct);
  expect(super_.length + sub.length).toBeGreaterThan(0);
  test.info().annotations.push({ type: "sinais", description: `superestimadas=${super_.length} subestimadas=${sub.length} tentativas=${tentativas.length}` });

  const amanha = dataLocalMais(1);
  for (const a of super_) expect(s.learning.reviewSchedule[a.skillIds[0]].dueDate).toBe(amanha);
  for (const a of sub) expect(s.learning.journey.challengeEligible?.[a.skillIds[0]]).toBe(dataLocalMais(7));
  // sem sinal, sem mudança: habilidades não sinalizadas mantêm a data original (30 dias)
  const sinalizadas = new Set([...super_, ...sub].map((a) => a.skillIds[0]));
  for (const [sk, ent] of Object.entries(s.learning.reviewSchedule as Record<string, { dueDate: string }>)) {
    if (!sinalizadas.has(sk) && reviewSchedule[sk]) expect(ent.dueDate).toBe(dataLocalMais(30));
  }
  expect(s.learning.events.filter((e: { type: string }) => e.type === "checkpoint-recalibrated")).toHaveLength(1);
});

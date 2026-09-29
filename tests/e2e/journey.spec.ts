import { expect, test } from "@playwright/test";

/**
 * Jornada única (docs/30 §14, Fase 12 do docs/31 F12.2/F12.3/F12.4/F12.6) —
 * `jornadaAdaptativa` fica desligada em produção até a Fase 15 (`31`), então
 * estes testes ligam ela via o override local `localStorage["foca.flags"]`
 * (docs/30 §25, lido só em dev — `bun run dev` é o servidor do Playwright
 * aqui) sem tocar em `src/lib/features.ts`.
 */

import { comAtividades, definirFlags, lerEstado, seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

/**
 * Estado com uma atividade de prática JÁ comprometida (`mat:porcentagem-conceito`,
 * que tem 2 itens reais no banco geral — `q10`/`q21`, docs/32 Fase 3) —
 * `committed` com exatamente 3 entradas e `planVersion` em dia faz
 * `ensurePlan` não substituir o seed por um plano do motor (que dependeria
 * de pontuação entre ~65 habilidades, não determinístico o bastante pra um
 * E2E). Desde o docs/36 (T-01.2) o fixture vem de `helpers/estado.ts`
 * (`comAtividades`), e o storage é semeado por `seedOnce` — nunca por um
 * `addInitScript` incondicional, que apagaria o que o app gravou a cada
 * navegação completa.
 */
function comAtividadeComprometida() {
  return comAtividades(["pratica", "pratica", "pratica"]);
}

async function ligarJornada(page: import("@playwright/test").Page) {
  await definirFlags(page, { jornadaAdaptativa: true });
}

/** `jornadaAdaptativa` é `true` em `BASE_FEATURES` desde a F15.1 (docs/32) — testar
 * o estado "flag desligada" agora precisa de um override explícito (`readFlagOverrides`,
 * `?debug=1`), não mais do padrão. */
async function desligarJornada(page: import("@playwright/test").Page) {
  await definirFlags(page, { jornadaAdaptativa: false });
}

async function responderComNaoSeiAteConcluir(page: import("@playwright/test").Page) {
  for (let i = 0; i < 10; i++) {
    const concluir = page.getByRole("button", { name: "Concluir lição" });
    if (await concluir.isVisible().catch(() => false)) {
      await concluir.click();
      return;
    }
    await page.getByRole("button", { name: "Não sei" }).waitFor({ timeout: 15000 });
    await page.getByRole("button", { name: "Não sei" }).click();
    await page.locator('[role="status"]').waitFor();
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
  }
  throw new Error("lição não concluiu depois de 10 questões — loop de segurança estourou");
}

test.describe("flag desligada — /trilha idêntica a hoje (AC-12.5)", () => {
  test("sem 'Sessão de hoje': mapa por matéria de sempre", async ({ page }) => {
    await desligarJornada(page);
    await seedOnce(page, USUARIO_ONBOARDED);
    await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
    await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /^Matemática/ })).toBeVisible();
  });
});

test.describe("flag ligada — jornada (AC-12.1, AC-12.2, AC-12.6)", () => {
  test.beforeEach(async ({ page }) => {
    await ligarJornada(page);
    await seedOnce(page, USUARIO_ONBOARDED);
  });

  test("card 'Sessão de hoje': um CTA primário, motivo e minutos visíveis", async ({ page }) => {
    // Sem isso, a migração assume `onboardingVersion: 1` (usuário legado) pra
    // este fixture minimalista, e o card "Quer ajustar a trilha ao seu nível?"
    // (F13.7, independente da jornada) soma um 2º `.btn-primary` — este teste
    // é só sobre o card da jornada em si (docs/32 F15.1).
    await page.addInitScript(() => {
      const raw = localStorage.getItem("foca.state.v3");
      if (!raw) return;
      const s = JSON.parse(raw);
      s.prefs = { ...s.prefs, onboardingVersion: 2 };
      localStorage.setItem("foca.state.v3", JSON.stringify(s));
    });
    await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
    await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });

    // Único `btn-primary` da tela (RF-3/docs/22 "um CTA primário por tela").
    const primarios = page.locator(".btn-primary");
    await expect(primarios).toHaveCount(1);
    await expect(primarios.first()).toBeVisible();

    // Minutos somados (docs/30 §14.1: "~N min").
    await expect(page.getByText(/~\d+ min/)).toBeVisible();

    // Linha de foco: sem foco nenhum ainda, "Todas as matérias".
    await expect(page.getByText("Todas as matérias")).toBeVisible();
  });

  test("320px sem rolagem horizontal, alvos ≥44px (AC-12.6)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
    await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });
    await expect(page.getByText(/~\d+ min/)).toBeVisible();

    const semRolagem = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(semRolagem).toBe(true);

    const mudarBox = await page.getByRole("button", { name: "Mudar" }).boundingBox();
    expect(mudarBox?.height).toBeGreaterThanOrEqual(44);

    // Rótulo textual de estado no caminho (docs/31 F12.4, critério de acessibilidade).
    await expect(page.getByText("Atual", { exact: true }).first()).toBeVisible();
  });

  test("'Ver mapa das matérias' alterna pra vista secundária e volta", async ({ page }) => {
    await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
    await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });

    await page.getByRole("button", { name: "Ver mapa das matérias" }).click();
    await page.waitForURL(/vista=mapa/);
    await expect(page.getByRole("button", { name: /^Matemática/ })).toBeVisible();

    await page.getByRole("button", { name: /Voltar pra jornada/ }).click();
    await expect(page).not.toHaveURL(/vista=mapa/);
    await expect(page.getByText(/~\d+ min/)).toBeVisible();
  });
});

test.describe("atividade dinâmica — /atividade/$activityId (AC-12.3)", () => {
  test("prática do começo ao fim: paga XP uma vez, não entra em completedLessons, entra no histórico da jornada", async ({
    page,
  }) => {
    await ligarJornada(page);
    await seedOnce(page, comAtividadeComprometida());

    await page.goto("/atividade/atv-test-pratica?debug=1", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Começar" }).click();

    await responderComNaoSeiAteConcluir(page);

    // Tela de conclusão: CTA "Continuar" pra /trilha, sem `?concluida=`
    // (docs/30 §14.4 — a lição é sintética, não um nó de trilha por matéria).
    const continuar = page.getByRole("link", { name: "Continuar" });
    await expect(continuar).toBeVisible();
    await expect(continuar).toHaveAttribute("href", "/trilha");
    await continuar.click();
    await page.waitForURL(/\/trilha/);

    const estado = await page.evaluate(() => {
      const raw = localStorage.getItem("foca.state.v3");
      return raw ? JSON.parse(raw) : null;
    });
    expect(estado.learning.completedLessons["atividade--atv-test-pratica"]).toBeUndefined();
    expect(
      estado.learning.journey.history.some(
        (h: { activityId: string }) => h.activityId === "atv-test-pratica",
      ),
    ).toBe(true);
    // Ledger por TENTATIVA (docs/36 RF-6): `atividade:<id>@<startedAt>`, pois a rota inicia a tentativa.
    expect(
      Object.keys(estado.learning.rewardLedger).some((k: string) => k.startsWith("atividade:atv-test-pratica")),
    ).toBe(true);
  });

  test("id que não é a atividade ativa nem a comprometida atual redireciona pra /trilha", async ({
    page,
  }) => {
    await ligarJornada(page);
    await seedOnce(page, USUARIO_ONBOARDED);
    await page.goto("/atividade/id-que-nao-existe?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/trilha/, { timeout: 10000 });
  });
});

test.describe("harness — seedOnce não resemeia (docs/36 T-01.2)", () => {
  test("uma mutação gravada pelo app/teste sobrevive a page.reload()", async ({ page }) => {
    await ligarJornada(page);
    await seedOnce(page, comAtividadeComprometida());
    await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
    await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });

    // Mutação simulando "o app gravou algo depois do seed".
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("foca.state.v3")!);
      s.progress.xp = 4242;
      localStorage.setItem("foca.state.v3", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });

    const estado = await lerEstado(page);
    expect(estado.progress.xp).toBe(4242);
  });
});

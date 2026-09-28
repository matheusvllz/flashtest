import { expect, test } from "@playwright/test";

/**
 * Rota `/nivelamento` (docs/30 §12, Fase 13 do docs/31 F13.4/F13.6). Desde a
 * Onda 1 (docs/31 F11.6, 27/09/2026) as 4 áreas medidas têm pool diagnóstico
 * revisado por humano acima do mínimo (`PLACEMENT_MIN_ITENS_ELEGIVEIS_AREA`
 * = 4; `bun scripts/content/promover-diagnostico.ts` reportou 40-45 itens
 * por área) — E `pacotesProntos`/`carregarTodosOsPacotes` (F13.4) já
 * pré-carrega o pacote antes de abrir a rota. Isso muda o que dá pra testar
 * aqui de ponta a ponta: em vez do estado "pool vazio" (histórico, coberto
 * só por unidade com pools sintéticos em `placement.test.ts`), o teste
 * agora RESPONDE um CAT real (`responderCicloReal`) e confere que pelo
 * menos uma área é medida de verdade. O motor em si (EAP, seleção por
 * informação, pausar/retomar) continua coberto por unidade; aqui é o fio
 * ponta a ponta com o catálogo publicado.
 */

async function pronto(page: import("@playwright/test").Page): Promise<boolean> {
  return page
    .getByText("Pronto.")
    .waitFor({ state: "visible", timeout: 500 })
    .then(() => true)
    .catch(() => false);
}

/** Responde o nivelamento clicando na primeira opção de cada questão, até 'Pronto.' aparecer
 * (correção da resposta não importa pra este teste de fluxo — quem confere isso é `placement.test.ts`).
 * O ÚLTIMO item pode fechar o placement (`shouldStopArea`/orçamento) assim que verificado, pulando
 * direto pro resultado sem passar pela tela "Resposta registrada." — por isso confere de novo
 * logo depois do "Verificar", antes de procurar o botão "Continuar" que talvez nunca apareça. */
async function responderCicloReal(page: import("@playwright/test").Page) {
  for (let i = 0; i < 30; i++) {
    if (await pronto(page)) return;
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Verificar" }).click();
    if (await pronto(page)) return;
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
  }
  throw new Error("nivelamento não chegou em 'Pronto.' depois de 30 rodadas");
}

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

async function ligarNivelamento(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("foca.flags", JSON.stringify({ nivelamento: true }));
  });
}

/**
 * `addInitScript` roda de novo em CADA navegação (documentado no
 * Playwright) — sem a checagem "só semeia se ainda não existir", navegar
 * pra uma segunda página apagaria o `learning.placement` que a primeira
 * página acabou de gravar, disfarçado de "o botão não mudou de texto"
 * (achado real ao escrever o teste de "Refazer nivelamento", mesmo padrão
 * já documentado em `focus.spec.ts`).
 */
async function seedEstado(page: import("@playwright/test").Page) {
  await page.addInitScript((raw) => {
    if (!localStorage.getItem("foca.state.v3")) {
      localStorage.setItem("foca.state.v3", JSON.stringify(raw));
    }
  }, USUARIO_ONBOARDED);
}

test("flag desligada: /nivelamento redireciona pra /trilha", async ({ page }) => {
  // `nivelamento` é `true` em `BASE_FEATURES` desde a F15.1 (docs/32) — testar
  // o estado "flag desligada" agora precisa do override explícito.
  await page.addInitScript(() => {
    localStorage.setItem("foca.flags", JSON.stringify({ nivelamento: false }));
  });
  await seedEstado(page);
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/trilha/, { timeout: 15000 });
});

test("flag ligada, pool real (Onda 1, F11.6): CAT responde de ponta a ponta e mede pelo menos uma área", async ({
  page,
}) => {
  test.setTimeout(90_000); // até 24 itens reais (PLACEMENT_MAX_ITENS_TOTAL) — o default de 30s não alcança.
  await ligarNivelamento(page);
  await seedEstado(page);
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });

  await page.getByRole("radio").first().waitFor({ timeout: 15000 }); // pacotesProntos + primeiro item
  await responderCicloReal(page);
  await expect(page.getByText("Pronto.")).toBeVisible();

  // Nenhuma nota, nenhum "Nível N" (docs/30 §12.5) mesmo com área medida de verdade.
  await expect(page.getByText(/nível \d/i)).toHaveCount(0);
  // Pelo menos uma área tem faixa real (não é mais garantido "nenhuma", como no pool vazio de antes da F11.6).
  const semFaixaNenhuma = await page.getByText(/Ainda não temos questões suficientes/).count();
  expect(semFaixaNenhuma).toBeLessThan(4);

  const estado = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"),
  );
  expect(estado.learning.placement?.status).toBe("concluido");
  // Com área medida de verdade, `applyPlacement` grava Mastery/Confidence de pelo menos uma habilidade.
  expect(Object.keys(estado.learning.skillModel ?? {}).length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Ir para a trilha" }).click();
  await page.waitForURL(/\/trilha/, { timeout: 15000 });
});

test("refazer nivelamento (perfil) começa um placement novo quando o anterior já estava concluído", async ({
  page,
}) => {
  test.setTimeout(120_000); // 2 CATs reais nesta única prova (o de antes + o refeito).
  await ligarNivelamento(page);
  await seedEstado(page);
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByRole("radio").first().waitFor({ timeout: 15000 });
  await responderCicloReal(page);
  await expect(page.getByText("Pronto.")).toBeVisible();

  await page.goto("/profile?debug=1", { waitUntil: "domcontentloaded" });
  const botao = page.getByRole("button", { name: /Refazer nivelamento/ });
  await expect(botao).toBeVisible({ timeout: 15000 });
  await botao.click();
  await page.waitForURL(/\/nivelamento/, { timeout: 15000 });
  await page.getByRole("radio").first().waitFor({ timeout: 15000 });
});

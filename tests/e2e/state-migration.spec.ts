import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { comAtividades, definirFlags, lerEstado, seedOnce, USUARIO_ONBOARDED, type EstadoSeed } from "./helpers/estado";
import { COPY } from "../../src/lib/copy";
import { clicarComecarSeHouver, esperarHome, responderComNaoSeiAteConcluir, tituloDoNo } from "./helpers/jornada";
import { avancarAteRecap } from "./helpers/licao";

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

/* ------------------------------------------------------------------------- *
 * docs/36 Fase 5 — persistência sem perda silenciosa (RF-14, RF-15, RF-16).
 * `seedOnce`: o storage NÃO é resemeado a cada navegação completa.
 * ------------------------------------------------------------------------- */

const FILA_PRATICA = () => comAtividades(["pratica", "pratica", "pratica"]);

async function abrirTrilha(page: Page, estado: EstadoSeed = FILA_PRATICA()) {
  await definirFlags(page, { jornadaAdaptativa: true });
  await seedOnce(page, estado);
  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  await esperarHome(page);
}

test.describe("RF-14 — falha de gravação nunca é anunciada como salva (docs/36 T-05.1)", () => {
  test("setItem que lança durante o estudo: faixa RU-4 aparece, 'Tentar de novo' volta a gravar e a faixa some", async ({
    page,
  }) => {
    await abrirTrilha(page);
    await page.locator("a.btn-primary").first().click();
    await clicarComecarSeHouver(page, 1);
    await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("persistence-banner")).toHaveCount(0);

    // O storage "enche" DEPOIS do boot: toda gravação passa a lançar QuotaExceededError.
    await page.evaluate(() => {
      const w = window as unknown as { __setItemOriginal?: Storage["setItem"] };
      w.__setItemOriginal = Storage.prototype.setItem;
      Storage.prototype.setItem = function () {
        throw new DOMException("cheio", "QuotaExceededError");
      };
    });

    // Responder é o que precisa ser gravado (tentativa + evidência).
    await page.getByRole("button", { name: "Não sei" }).click();
    await page.locator('[role="status"]').first().waitFor();

    const faixa = page.getByRole("alert").filter({ hasText: "Não consegui salvar neste aparelho" });
    await expect(faixa).toBeVisible();
    await expect(faixa).toContainText("O que você fez agora pode se perder se fechar o app.");
    // Nenhuma tela afirma que está salvo enquanto a gravação falha.
    await expect(page.locator("body")).not.toContainText(/\bsalvo\b/i);

    // Tentar de novo com o storage ainda cheio: a faixa continua.
    await faixa.getByRole("button", { name: "Tentar de novo" }).click();
    await expect(faixa).toBeVisible();

    // O storage volta: "Tentar de novo" regrava o que estava só em memória e a faixa some.
    await page.evaluate(() => {
      const w = window as unknown as { __setItemOriginal?: Storage["setItem"] };
      Storage.prototype.setItem = w.__setItemOriginal!;
    });
    await faixa.getByRole("button", { name: "Tentar de novo" }).click();
    await expect(page.getByTestId("persistence-banner")).toHaveCount(0);
    const estado = await lerEstado(page);
    expect(estado.learning.recentAttempts.length).toBeGreaterThanOrEqual(1); // a resposta feita com a faixa no ar foi gravada
  });

  test("RU-6: storage de versão mais nova avisa e não é sobrescrito", async ({ page }) => {
    const futuro = JSON.stringify({ ...USUARIO_ONBOARDED, schemaVersion: 99, campoDaVersaoNova: { a: 1 } });
    await page.addInitScript((raw) => {
      if (!localStorage.getItem("foca.state.v3")) localStorage.setItem("foca.state.v3", raw);
    }, futuro);
    await page.goto("/trilha", { waitUntil: "domcontentloaded" });

    const faixa = page.getByRole("alert").filter({ hasText: "Seus dados são de uma versão mais nova do app." });
    await expect(faixa).toBeVisible({ timeout: 15_000 });
    await expect(faixa).toContainText("Até lá, nada do que você fizer aqui fica salvo.");
    await expect(faixa.getByRole("button")).toHaveCount(0); // não há "tentar de novo": a saída é recarregar

    // Navegar e mutar não grava por cima.
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("alert").filter({ hasText: "versão mais nova" })).toBeVisible({ timeout: 15_000 });
    const bruto = await page.evaluate(() => localStorage.getItem("foca.state.v3"));
    expect(bruto).toBe(futuro);
  });
});

/* ------------------------------------------------------------------------- *
 * docs/36 RF-14 / G-15 (achado A1 do spec-verifier): as frases estáticas que
 * prometem "salvo" (recap da atividade, "Sair da lição?", erro da trilha, saída
 * da lição legada) trocam para uma variante neutra quando a gravação falha.
 * ------------------------------------------------------------------------- */

/** "salvo"/"salva"/"salvou" como palavra — não casa "salvar" (a faixa RU-4 diz "Não consegui salvar"). */
const PROMETE_SALVO = /\bsalv(o|a|ou)\b/i;

/** Faz toda gravação do localStorage lançar (o storage "enche"). Vale para a página inteira, também depois de navegar. */
async function encherStorage(page: Page) {
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("cheio", "QuotaExceededError");
    };
  });
}

/** Da Home até o recap de uma atividade de prática (o "Concluir lição" fica visível, não é clicado). */
async function chegarAoRecap(page: Page, comFalha: boolean) {
  await abrirTrilha(page);
  await page.locator("a.btn-primary").first().click();
  await clicarComecarSeHouver(page, 1);
  await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
  if (comFalha) await encherStorage(page);
  await avancarAteRecap(page);
  await expect(page.getByRole("button", { name: "Concluir lição" })).toBeVisible();
}

test.describe("RF-14 — nenhuma tela promete 'salvo' com a gravação falhando (docs/36, achado A1)", () => {
  test("com a gravação falhando: recap e 'Sair da lição?' da atividade não dizem 'salvo'", async ({ page }) => {
    test.setTimeout(90_000);
    await chegarAoRecap(page, true);

    await expect(page.getByRole("alert").filter({ hasText: "Não consegui salvar neste aparelho" })).toBeVisible();
    await expect(page.getByText(COPY.jornada.recapSemSalvo, { exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(PROMETE_SALVO);

    await page.getByRole("button", { name: "Sair da lição", exact: true }).click();
    const dialogo = page.getByRole("dialog");
    await expect(dialogo).toBeVisible();
    await expect(dialogo).toContainText(COPY.licao.sairCorpoSemSalvo);
    await expect(page.locator("body")).not.toContainText(PROMETE_SALVO);
  });

  test("com a gravação ok: recap e 'Sair da lição?' mantêm o texto original", async ({ page }) => {
    test.setTimeout(90_000);
    await chegarAoRecap(page, false);

    await expect(page.getByText(COPY.jornada.recap, { exact: true })).toBeVisible();
    await expect(page.getByTestId("persistence-banner")).toHaveCount(0);

    await page.getByRole("button", { name: "Sair da lição", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText(COPY.licao.sairCorpo);
  });

  test("com a gravação falhando: 'Sair da lição?' da lição legada de redação não diz 'salvo'", async ({ page }) => {
    await definirFlags(page, { jornadaAdaptativa: true });
    await seedOnce(page, USUARIO_ONBOARDED);
    await page.goto("/redacao/redacao-estrutura-01-dissertativo-argumentativo", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Verificar" }).waitFor({ timeout: 15_000 });
    await encherStorage(page);
    // O status só vira "falhou" numa gravação que falha: vem da resposta do aluno.
    // O 1º exercício pode ser de qualquer um dos 7 formatos: basta marcar ALGUMA resposta.
    await page.locator('[role="radio"], button:has(> span)').first().click();
    await page.getByRole("button", { name: "Verificar" }).click();
    await page.locator('[role="status"]').first().waitFor({ timeout: 10_000 });
    await expect(page.getByRole("alert").filter({ hasText: "Não consegui salvar neste aparelho" })).toBeVisible();
    await page.getByRole("button", { name: "Sair da lição" }).click();
    const dialogo = page.getByRole("dialog");
    await expect(dialogo).toBeVisible();
    await expect(dialogo).toContainText(COPY.licao.sairCorpoLegadoSemSalvo);
    await expect(dialogo).not.toContainText(PROMETE_SALVO);
  });

  test("com a gravação falhando: a tela de erro da trilha não diz 'salvo'; com a gravação ok mantém o texto original", async ({
    browser,
  }) => {
    // `progress.lessons` nulo faz o `buildTrail` lançar na renderização de /trilha (só este teste depende disso).
    const legadoQuebrado = JSON.stringify({ ...JSON.parse(V3_LEGADO), progress: { xp: 250, streak: 5, lessons: null } });

    async function abrirErro(falha: boolean) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      await page.addInitScript(
        ({ raw, falha }) => {
          try {
            if (!localStorage.getItem("foca.state.v3")) localStorage.setItem("foca.state.v3", raw);
          } catch {
            /* idem */
          }
          // Semeado; agora, se pedido, toda gravação do app lança — a migração do boot já falha.
          if (falha) {
            Storage.prototype.setItem = function () {
              throw new DOMException("cheio", "QuotaExceededError");
            };
          }
        },
        { raw: legadoQuebrado, falha },
      );
      await page.goto("/trilha", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: COPY.trilha.erroTitulo })).toBeVisible({ timeout: 20_000 });
      return { ctx, page };
    }

    const falhando = await abrirErro(true);
    await expect(falhando.page.getByText(COPY.trilha.erroCorpoSemSalvo, { exact: true })).toBeVisible();
    await expect(falhando.page.locator("body")).not.toContainText(PROMETE_SALVO);
    await falhando.ctx.close();

    const ok = await abrirErro(false);
    await expect(ok.page.getByText(COPY.trilha.erroCorpo)).toBeVisible();
    await ok.ctx.close();
  });
});

test.describe("RF-16 — JSON corrompido guarda cópia e avisa uma vez (docs/36 T-05.3)", () => {
  test("bruto ilegível: cópia foca.state.corrupt.<ISO>, faixa RU-5 com 'Ok', app segue do padrão", async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("foca.state.v3")) localStorage.setItem("foca.state.v3", "{quebrado");
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForURL("**/welcome", { timeout: 15_000 });

    const faixa = page.getByRole("status").filter({ hasText: "Não consegui ler seu progresso salvo." });
    await expect(faixa).toBeVisible();
    await expect(faixa).toContainText("Guardei uma cópia e comecei do zero neste aparelho.");

    const copias = await page.evaluate(() =>
      Object.keys(localStorage)
        .filter((k) => k.startsWith("foca.state.corrupt."))
        .map((k) => ({ k, v: localStorage.getItem(k) })),
    );
    expect(copias).toHaveLength(1);
    expect(copias[0]!.v).toBe("{quebrado");

    await faixa.getByRole("button", { name: "Ok" }).click();
    await expect(faixa).toHaveCount(0);
  });
});

test.describe("RF-15 — duas abas no mesmo navegador (docs/36 T-05.2)", () => {
  test("concluir na aba 1 aparece na aba 2 sem recarregar, e uma mutação da aba 2 não apaga a conclusão", async ({
    context,
  }) => {
    test.setTimeout(90_000); // 2 páginas + uma atividade inteira: ~10 s sozinho, ~30 s com 4 workers disputando o dev server.
    const aba1 = await context.newPage();
    // Habilidades diferentes: o título de A, B e C precisa diferir para o card provar a adoção.
    await abrirTrilha(
      aba1,
      comAtividades(["pratica", "pratica", "pratica"], {
        1: { skillIds: ["mat:operacoes-fundamentais"] },
        2: { skillIds: ["mat:razao-proporcao"] },
      }),
    );
    const aba2 = await context.newPage();
    await definirFlags(aba2, { jornadaAdaptativa: true });
    await aba2.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
    await esperarHome(aba2);

    const tituloB = await tituloDoNo(aba2, "atv-test-pratica-2");
    const tituloA = await aba2.locator("h2").first().textContent();
    expect(tituloA).not.toBe(tituloB);

    // Aba 1: conclui a atividade A.
    await aba1.locator("a.btn-primary").first().click();
    await clicarComecarSeHouver(aba1, 1);
    await expect(aba1.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
    await responderComNaoSeiAteConcluir(aba1);
    await expect(aba1.getByRole("link", { name: "Continuar" })).toBeVisible();
    const gravado = await lerEstado(aba1);
    expect(gravado.learning.journey.history).toHaveLength(1);

    // Aba 2 (que continua em /trilha, sem reload): o card agora é o da B.
    await expect(aba2.locator("h2").first()).toHaveText(tituloB, { timeout: 15_000 });
    const naAba2 = await lerEstado(aba2);
    expect(naAba2.learning.journey.history).toHaveLength(1);

    // Mutação na aba 2 (iniciar a B grava `activeActivity`/`startedAt`) parte do estado adotado.
    await aba2.locator("a.btn-primary").first().click();
    await expect(aba2).toHaveURL(/\/atividade\/atv-test-pratica-2/, { timeout: 10_000 });
    // A rota /atividade grava o início DEPOIS de carregar os pacotes (assíncrono): espera, não lê na hora.
    await expect
      .poll(async () => (await lerEstado(aba2)).learning.journey.activeActivity?.id, { timeout: 15_000 })
      .toBe("atv-test-pratica-2");
    const depois = await lerEstado(aba2);
    expect(depois.learning.journey.history).toHaveLength(1); // a conclusão da aba 1 sobreviveu
    expect(depois.learning.journey.seq).toBe(1);
    expect(depois.progress.xp).toBe(gravado.progress.xp);
    expect(depois.learning.journey.activeActivity?.id).toBe("atv-test-pratica-2");
  });
});

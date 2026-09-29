import { expect, test, type Locator, type Page } from "@playwright/test";
import { comAtividades, comAulaConcluida, seedOnce } from "./helpers/estado";

/**
 * Diálogos acessíveis (docs/36 T-08.5, RA-1, riscos B4/N5): `BottomSheet`
 * ("Sair da lição?", `FocusSheet`, `ChapterCompleteSheet`) e o painel do tutor.
 *
 * Para cada um: `role="dialog"` + `aria-modal` + rótulo; foco inicial no título;
 * foco CONTIDO (10× Tab e 5× Shift+Tab nunca saem); Escape fecha; o foco VOLTA ao
 * disparador; o fundo fica `inert`; o scroll do fundo fica travado; tudo é desfeito ao fechar.
 */

const ESTADO = comAtividades(["pratica", "aula", "revisao"]);

/** Descrição curta do elemento focado (para mensagens de erro legíveis). */
async function focoAtual(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return "(nada)";
    return `${el.tagName.toLowerCase()}${el.getAttribute("aria-label") ? `[${el.getAttribute("aria-label")}]` : ""} "${(el.textContent ?? "").trim().slice(0, 40)}"`;
  });
}

async function focoEstaDentro(page: Page, dialog: Locator): Promise<boolean> {
  return dialog.evaluate((d) => d.contains(document.activeElement));
}

/** 10× Tab e 5× Shift+Tab: o foco circula dentro do diálogo e nunca sai. Devolve quantos elementos distintos foram focados. */
async function foCoContido(page: Page, dialog: Locator): Promise<number> {
  const vistos = new Set<string>();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    expect(await focoEstaDentro(page, dialog), `Tab #${i + 1}: foco em ${await focoAtual(page)}`).toBe(true);
    vistos.add(await focoAtual(page));
  }
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Shift+Tab");
    expect(await focoEstaDentro(page, dialog), `Shift+Tab #${i + 1}: foco em ${await focoAtual(page)}`).toBe(true);
    vistos.add(await focoAtual(page));
  }
  return vistos.size;
}

/** Estado do resto da página com o diálogo aberto/fechado. */
async function estadoDoFundo(page: Page) {
  return page.evaluate(() => ({
    overflow: document.body.style.overflow,
    inertCount: document.querySelectorAll("[inert]").length,
  }));
}

async function expectAberto(page: Page, dialog: Locator, disparador?: Locator) {
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toHaveAttribute("aria-labelledby", /.+/);
  const nome = (await dialog.getAttribute("aria-labelledby"))!;
  const titulo = page.locator(`[id="${nome}"]`);
  await expect(titulo).toBeVisible();
  // Foco inicial: no título do diálogo.
  await expect.poll(() => titulo.evaluate((el) => el === document.activeElement), { message: "foco inicial no título" }).toBe(true);
  const fundo = await estadoDoFundo(page);
  expect(fundo.overflow, "scroll do fundo travado").toBe("hidden");
  expect(fundo.inertCount, "fundo inert").toBeGreaterThan(0);
  // O diálogo em si NÃO fica inerte.
  expect(await dialog.evaluate((d) => !!d.closest("[inert]")), "diálogo fora do inert").toBe(false);
  if (disparador) expect(await disparador.evaluate((el) => !!el.closest("[inert]")), "disparador dentro do inert").toBe(true);
}

async function expectFechadoEFocoDevolvido(page: Page, dialog: Locator, disparador: Locator) {
  await expect(dialog).toHaveCount(0);
  const fundo = await estadoDoFundo(page);
  expect(fundo.overflow, "scroll destravado").toBe("");
  expect(fundo.inertCount, "nenhum inert sobrando").toBe(0);
  await expect.poll(() => disparador.evaluate((el) => el === document.activeElement), { message: "foco de volta ao disparador" }).toBe(true);
}

test.describe("diálogos acessíveis (docs/36 T-08.5)", () => {
  test.beforeEach(async ({ page }) => {
    await seedOnce(page, ESTADO);
  });

  test('"Sair da lição?": foco contido, Escape fecha e devolve o foco ao botão "Sair da lição"', async ({ page }) => {
    await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
    const sair = page.getByRole("button", { name: "Sair da lição", exact: true });
    await expect(sair).toBeVisible({ timeout: 20_000 });
    await sair.click();

    const dialog = page.getByRole("dialog", { name: "Sair da lição?" });
    await expectAberto(page, dialog, sair);
    expect(await foCoContido(page, dialog)).toBeGreaterThanOrEqual(2); // "Ficar" e "Sair mesmo" (+ o título)

    await page.keyboard.press("Escape");
    await expectFechadoEFocoDevolvido(page, dialog, sair);
  });

  test('"Sair da lição?": fechar pelo botão "Ficar" também devolve o foco e solta o fundo', async ({ page }) => {
    await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
    const sair = page.getByRole("button", { name: "Sair da lição", exact: true });
    await expect(sair).toBeVisible({ timeout: 20_000 });
    await sair.click();
    const dialog = page.getByRole("dialog", { name: "Sair da lição?" });
    await expectAberto(page, dialog, sair);
    await dialog.getByRole("button").first().click();
    await expectFechadoEFocoDevolvido(page, dialog, sair);
  });

  test('FocusSheet (/trilha): foco contido, scroll do fundo travado, Escape devolve o foco a "Mudar"', async ({ page }) => {
    await page.goto("/trilha", { waitUntil: "domcontentloaded" });
    const mudar = page.getByRole("button", { name: "Mudar", exact: true });
    await expect(mudar).toBeVisible({ timeout: 20_000 });

    // Controle: sem diálogo, a roda do mouse rola a página (senão "não rola" abaixo não provaria nada).
    await page.mouse.move(200, 400);
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await mudar.click();
    const dialog = page.getByRole("dialog");
    await expectAberto(page, dialog, mudar);
    await page.mouse.move(200, 100); // sobre o scrim
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY), "o fundo não rola com o diálogo aberto").toBe(0);
    expect(await foCoContido(page, dialog)).toBeGreaterThanOrEqual(3); // muitas matérias focáveis

    await page.keyboard.press("Escape");
    await expectFechadoEFocoDevolvido(page, dialog, mudar);
    // Solto o scroll: a roda volta a rolar.
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
  });

  test("clicar no scrim fecha a folha e solta o fundo (o scrim não fica inert)", async ({ page }) => {
    await page.goto("/trilha", { waitUntil: "domcontentloaded" });
    const mudar = page.getByRole("button", { name: "Mudar", exact: true });
    await expect(mudar).toBeVisible({ timeout: 20_000 });
    await mudar.click();
    const dialog = page.getByRole("dialog");
    await expectAberto(page, dialog, mudar);
    await page.mouse.click(10, 40); // canto superior: só o scrim
    await expectFechadoEFocoDevolvido(page, dialog, mudar);
  });

  test("painel do tutor: role=dialog rotulado, foco contido, Escape fecha e o foco volta ao botão flutuante", async ({ page }) => {
    await page.goto("/trilha", { waitUntil: "domcontentloaded" });
    const fab = page.locator("[data-tutor-fab]");
    await expect(fab).toBeVisible({ timeout: 20_000 });
    await fab.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Foca" });
    await expectAberto(page, dialog);
    expect(await foCoContido(page, dialog)).toBeGreaterThanOrEqual(3); // fechar, sugestões, anexar, texto, enviar…

    await page.keyboard.press("Escape");
    // O botão flutuante é DESMONTADO com o painel aberto e remontado ao fechar: o foco vai para o novo.
    await expect(dialog).toHaveCount(0);
    await expect(page.locator("[data-tutor-fab]")).toBeVisible();
    await expect
      .poll(() => page.locator("[data-tutor-fab]").evaluate((el) => el === document.activeElement), { message: "foco no botão flutuante" })
      .toBe(true);
    const fundo = await estadoDoFundo(page);
    expect(fundo.overflow).toBe("");
    expect(fundo.inertCount).toBe(0);
  });

  test("painel do tutor dentro de uma lição: abre, o fundo fica inert e fechar devolve a lição ao normal", async ({ page }) => {
    await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
    const fab = page.locator("[data-tutor-fab]");
    await expect(fab).toBeVisible({ timeout: 20_000 });
    await fab.click();
    const dialog = page.getByRole("dialog", { name: "Foca" });
    await expectAberto(page, dialog);
    await expect(page.getByRole("button", { name: "Sair da lição", exact: true })).toBeVisible(); // visível, mas inerte
    expect(await page.getByRole("button", { name: "Sair da lição", exact: true }).evaluate((el) => !!el.closest("[inert]"))).toBe(true);
    await page.locator('[aria-label="Fechar tutor"]').click();
    await expect(dialog).toHaveCount(0);
    // A lição volta a responder: "Começar" clicável de novo.
    await page.getByRole("button", { name: "Começar" }).click();
    await expect(page.getByRole("button", { name: /^(Continuar|Verificar)$/ }).first()).toBeVisible();
  });

  // T-08.4 / B4: o scrim é PRETO com alfa (0,4 claro, 0,55 escuro), nunca um véu claro.
  for (const [tema, alfaEsperado] of [
    ["light", 0.4],
    ["dark", 0.55],
  ] as const) {
    test(`scrim no tema ${tema}: preto com alfa ${alfaEsperado} (nunca claro)`, async ({ page }) => {
      const base = ESTADO as { prefs: Record<string, unknown> };
      await page.addInitScript(
        ({ chave, raw }) => {
          // Sobrescreve UMA vez o estado do beforeEach com o tema desejado (mesma técnica do teste do capítulo).
          if (!sessionStorage.getItem("__tema_semeado")) {
            localStorage.setItem(chave, JSON.stringify(raw));
            sessionStorage.setItem("__tema_semeado", "1");
          }
        },
        { chave: "foca.state.v3", raw: { ...base, prefs: { ...base.prefs, theme: tema } } },
      );
      await page.goto("/trilha", { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveClass(tema === "dark" ? /dark/ : /^(?!.*dark).*$/);
      const mudar = page.getByRole("button", { name: "Mudar", exact: true });
      await expect(mudar).toBeVisible({ timeout: 20_000 });
      await mudar.click();
      const scrim = page.getByRole("button", { name: "Fechar", exact: true });
      await expect(scrim).toBeVisible();
      const cor = await scrim.evaluate((el) => getComputedStyle(el).backgroundColor);
      // Formatos possíveis do Chromium: "rgba(0, 0, 0, 0.4)", "oklab(0 0 0 / 0.4)", "color(srgb 0 0 0 / 0.4)".
      const [c1, c2, c3, alfa] = (cor.match(/-?\d*\.?\d+/g) ?? []).map(Number);
      expect([c1, c2, c3], `canais de ${cor}: preto`).toEqual([0, 0, 0]);
      expect(alfa, `alfa de ${cor}`).toBeCloseTo(alfaEsperado, 2);
    });
  }

  test("ChapterCompleteSheet: foco contido e Escape fecha (abre por URL, sem disparador) e solta o fundo", async ({ page }) => {
    // As duas lições de "Citologia" concluídas => o capítulo fecha e a folha de celebração abre via `?capitulo=`.
    let estado = comAulaConcluida("citologia-membrana", "2026-09-28T10:00:00.000Z", ESTADO);
    estado = comAulaConcluida("citologia-organelas", "2026-09-28T10:05:00.000Z", estado);
    await page.addInitScript((raw) => {
      // Semeia por cima do `seedOnce` do beforeEach (a chave já foi criada por ele, então sobrescreve UMA vez).
      if (!sessionStorage.getItem("__semeado_capitulo")) {
        localStorage.setItem("foca.state.v3", JSON.stringify(raw));
        sessionStorage.setItem("__semeado_capitulo", "1");
      }
    }, estado);
    await page.goto("/trilha?capitulo=bio-citologia", { waitUntil: "domcontentloaded" });
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 20_000 });
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(await foCoContido(page, dialog)).toBeGreaterThanOrEqual(1); // um só CTA nesta folha
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    const fundo = await estadoDoFundo(page);
    expect(fundo.overflow).toBe("");
    expect(fundo.inertCount).toBe(0);
  });
});

import { expect, test, type Locator, type Page } from "@playwright/test";
import { comAtividades, seedOnce } from "./helpers/estado";
import { alvosPequenos, formatarAlvos, ALVO_MIN } from "./helpers/alvos";

/**
 * Layout responsivo (docs/36 §F.6, RU-30, T-08.1/T-08.2, risco N9).
 *
 * Contrato dos tokens de `styles.css` (não muda com o tema):
 *   < 768 px  → --app-col 440 · --reading-col 440 · --nav-rail 0
 *   768–1023  → --app-col 560 · --reading-col 560 · --nav-rail 0
 *   ≥ 1024    → --app-col 600 · --reading-col 640 · --nav-rail 96
 * (`--path-col` fica em 440 em todas as larguras.)
 *
 * Roda em três projetos (`playwright.config.ts`):
 *  - `chromium` 390×844 — o teste "da largura do projeto" + a matriz de larguras via `setViewportSize`;
 *  - `desktop`  1280×800 — o teste "da largura do projeto";
 *  - `narrow`   320×700 — o teste "da largura do projeto".
 * A matriz só roda no `chromium` (senão cada largura rodaria 3×).
 */

const APP_COL = (w: number) => (w >= 1024 ? 600 : w >= 768 ? 560 : 440);
const READING_COL = (w: number) => (w >= 1024 ? 640 : w >= 768 ? 560 : 440);
const NAV_RAIL = (w: number) => (w >= 1024 ? 96 : 0);
const LARGURAS = [320, 360, 440, 640, 768, 1024, 1440];
const TOL = 1.5; // px — arredondamento de subpixel

const ESTADO = comAtividades(["pratica", "aula", "revisao"]);

async function caixa(l: Locator) {
  const b = await l.boundingBox();
  if (!b) throw new Error("elemento sem caixa (invisível?)");
  return b;
}

async function semRolagemHorizontal(page: Page) {
  const r = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    inner: window.innerWidth,
  }));
  expect(r.scroll, "scrollWidth do documento").toBeLessThanOrEqual(r.inner + 1);
  expect(r.body, "scrollWidth do body").toBeLessThanOrEqual(r.inner + 1);
}

/** O `<nav aria-label="Principal">` visível: um só (BottomNav < 1024, NavRail ≥ 1024), nunca os dois. */
async function conferirNav(page: Page, w: number, vh: number) {
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav).toHaveCount(1);
  await expect(nav).toBeVisible();
  const b = await caixa(nav);
  if (w >= 1024) {
    // NavRail: coluna fixa à esquerda, altura toda, largura = --nav-rail.
    expect(b.x).toBeCloseTo(0, 0);
    expect(b.width).toBeCloseTo(NAV_RAIL(w), 0);
    expect(b.y).toBeCloseTo(0, 0);
    expect(b.height).toBeGreaterThanOrEqual(vh - TOL);
  } else {
    // BottomNav: colada embaixo, largura da coluna (min(viewport, --app-col)) e centrada.
    const largura = Math.min(w, APP_COL(w));
    expect(b.width).toBeCloseTo(largura, 0);
    expect(b.x).toBeCloseTo((w - largura) / 2, 0);
    expect(b.y + b.height).toBeCloseTo(vh, 0);
  }
}

/** A coluna de conteúdo (`PhoneFrame`): largura e centralização no espaço à direita do trilho. */
async function conferirColuna(page: Page, w: number, larguraToken: number, comTrilho = true) {
  const frame = page.locator(".frame-border").first();
  const b = await caixa(frame);
  // Telas imersivas não usam AppShell: sem NavRail, a coluna centraliza na tela toda.
  const rail = comTrilho ? NAV_RAIL(w) : 0;
  const livre = w - rail;
  const esperada = Math.min(livre, larguraToken);
  expect(b.width).toBeCloseTo(esperada, 0);
  expect(b.x).toBeCloseTo(rail + (livre - esperada) / 2, 0);
  return b;
}

async function abrirFolhaDeFoco(page: Page) {
  // "Mudar" (FocusLine) abre a FocusSheet (BottomSheet).
  await page.getByRole("button", { name: "Mudar", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // A folha sobe com `anim-slide-up`: só mede depois da animação (senão y+height passa da tela).
  await dialog.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)).then(() => undefined));
  return dialog;
}

/** Tudo o que o contrato de layout exige numa largura `w`, na `/trilha`. */
async function verificarLayoutDaTrilha(page: Page, w: number, vh: number) {
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  const cta = page.getByRole("button", { name: "Começar por aqui" }).or(page.getByRole("link", { name: "Começar por aqui" })).first();
  await expect(cta).toBeVisible({ timeout: 20_000 });

  await semRolagemHorizontal(page);
  await conferirNav(page, w, vh);
  const coluna = await conferirColuna(page, w, APP_COL(w));

  // Caminho da trilha (zigue-zague calibrado para 440): nunca mais largo que --path-col.
  const caminho = page.locator(".path-list").first();
  if (await caminho.count()) {
    const p = await caixa(caminho);
    expect(p.width).toBeLessThanOrEqual(440 + TOL);
  }

  // FAB do tutor: dentro da coluna, a 1rem da borda direita (ou o piso de 1rem da tela).
  const fab = page.locator("[data-tutor-fab]");
  await expect(fab).toBeVisible();
  const f = await caixa(fab);
  expect(f.x).toBeGreaterThanOrEqual(coluna.x - TOL);
  expect(f.x + f.width).toBeLessThanOrEqual(coluna.x + coluna.width + TOL);
  expect(f.x + f.width).toBeCloseTo(coluna.x + coluna.width - 16, 0);
  // Em ≥ 1024 o FAB desce (não há BottomNav a evitar): bottom-8 = 32 px.
  expect(f.y + f.height).toBeCloseTo(vh - (w >= 1024 ? 32 : 96), 0);

  // O FAB não engole o CTA primário: o centro do CTA continua sendo o CTA.
  await cta.scrollIntoViewIfNeeded();
  const c = await caixa(cta);
  const acertaCta = await cta.evaluate((el, [x, y]) => {
    const alvo = document.elementFromPoint(x, y);
    return !!alvo && (el === alvo || el.contains(alvo));
  }, [c.x + c.width / 2, c.y + c.height / 2] as const);
  expect(acertaCta, "centro do CTA primário acessível (não coberto pelo FAB)").toBe(true);

  // Folha de baixo: largura da coluna, centrada no espaço à direita do trilho, colada embaixo; scrim cobre a tela toda.
  const dialog = await abrirFolhaDeFoco(page);
  const s = await caixa(dialog);
  const rail = NAV_RAIL(w);
  const livre = w - rail;
  const esperada = Math.min(livre, APP_COL(w));
  expect(s.width).toBeCloseTo(esperada, 0);
  expect(s.x).toBeCloseTo(rail + (livre - esperada) / 2, 0);
  expect(s.y + s.height).toBeCloseTo(vh, 0);
  const scrim = await caixa(page.getByRole("button", { name: "Fechar", exact: true }));
  expect(scrim.x).toBeCloseTo(0, 0);
  expect(scrim.width).toBeCloseTo(w, 0);
  expect(scrim.height).toBeCloseTo(vh, 0);
  await semRolagemHorizontal(page);
}

test.describe("layout responsivo (docs/36 §F.6)", () => {
  test.beforeEach(async ({ page }) => {
    await seedOnce(page, ESTADO);
  });

  test("trilha na largura do projeto: sem rolagem horizontal, nav certa, FAB e folha ancorados à coluna", async ({ page }) => {
    const vp = page.viewportSize()!;
    await verificarLayoutDaTrilha(page, vp.width, vp.height);
  });

  test("player imersivo usa --reading-col e o trilho/BottomNav não aparece nele", async ({ page }) => {
    const vp = page.viewportSize()!;
    await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Começar" })).toBeVisible({ timeout: 20_000 });
    await semRolagemHorizontal(page);
    // Tela imersiva: sem nav nenhuma (nem BottomNav, nem NavRail) — só a coluna de leitura.
    await expect(page.getByRole("navigation", { name: "Principal" })).toHaveCount(0);
    const coluna = await conferirColuna(page, vp.width, READING_COL(vp.width), false);

    // O FAB do tutor e a folha "Sair da lição?" se ancoram à coluna de LEITURA (herdam --frame-col do PhoneFrame).
    const f = await caixa(page.locator("[data-tutor-fab]"));
    expect(f.x + f.width).toBeCloseTo(coluna.x + coluna.width - 16, 0);
    await page.getByRole("button", { name: "Sair da lição", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Sair da lição?" });
    await expect(dialog).toBeVisible();
    await dialog.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)).then(() => undefined));
    const sheet = await caixa(dialog);
    expect(sheet.width).toBeCloseTo(coluna.width, 0);
    expect(sheet.x).toBeCloseTo(coluna.x, 0);
  });

  // ---- a matriz de larguras roda uma vez só (no projeto `chromium`).
  for (const w of LARGURAS) {
    test(`matriz ${w}px: trilha`, async ({ page }, info) => {
      test.skip(info.project.name !== "chromium", "a matriz roda só no projeto chromium");
      const vh = w >= 768 ? 800 : 844;
      await page.setViewportSize({ width: w, height: vh });
      await verificarLayoutDaTrilha(page, w, vh);
    });

    test(`matriz ${w}px: player imersivo, /quiz e /aha`, async ({ page }, info) => {
      test.skip(info.project.name !== "chromium", "a matriz roda só no projeto chromium");
      const vh = w >= 768 ? 800 : 844;
      await page.setViewportSize({ width: w, height: vh });

      await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("button", { name: "Começar" })).toBeVisible({ timeout: 20_000 });
      await semRolagemHorizontal(page);
      await conferirColuna(page, w, READING_COL(w), false);

      // Rodapés fixos de /aha e /quiz: largura da coluna de leitura, centrados na tela (sem trilho: não usam AppShell).
      for (const rota of ["/aha", "/quiz"]) {
        await page.goto(rota, { waitUntil: "domcontentloaded" });
        const rodape = page.locator("footer.fixed");
        await expect(rodape).toBeVisible({ timeout: 20_000 });
        await semRolagemHorizontal(page);
        const r = await caixa(rodape);
        const esperada = Math.min(w, READING_COL(w));
        expect(r.width, `${rota}: largura do rodapé`).toBeCloseTo(esperada, 0);
        expect(r.x, `${rota}: rodapé centrado`).toBeCloseTo((w - esperada) / 2, 0);
        expect(r.y + r.height, `${rota}: rodapé colado embaixo`).toBeCloseTo(vh, 0);
      }
    });
  }

  test("mobile 390 px idêntico ao de antes (números do CSS antigo: 13.75rem = 220 px = 440/2)", async ({ page }, info) => {
    test.skip(info.project.name !== "chromium", "gate de regressão do mobile: só no projeto de 390 px");
    await page.goto("/trilha", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-tutor-fab]")).toBeVisible({ timeout: 20_000 });

    // Coluna = a tela toda (390), sem borda lateral (a borda só existe ≥ 768).
    const frame = page.locator(".frame-border").first();
    const fb = await caixa(frame);
    expect([fb.x, fb.width]).toEqual([0, 390]);
    const borda = await frame.evaluate((el) => getComputedStyle(el).borderInlineStartWidth);
    expect(borda).toBe("0px");

    // FAB: `right: max(1rem, calc(50% - 13.75rem + 1rem))` = 16 px em 390 → borda direita em 374; `bottom-24` = 96 px.
    const f = await caixa(page.locator("[data-tutor-fab]"));
    expect([f.x + f.width, f.y + f.height, f.width, f.height]).toEqual([374, 844 - 96, 56, 56]);

    // BottomNav: 390 de largura, colada embaixo.
    const n = await caixa(page.getByRole("navigation", { name: "Principal" }));
    expect([n.x, n.width, n.y + n.height]).toEqual([0, 390, 844]);

    // Folha: 390 de largura, colada embaixo.
    const dialog = await abrirFolhaDeFoco(page);
    const s = await caixa(dialog);
    expect([s.x, s.width, s.y + s.height]).toEqual([0, 390, 844]);
    // Scrim: a tela toda.
    const scrim = await caixa(page.getByRole("button", { name: "Fechar", exact: true }));
    expect([scrim.x, scrim.y, scrim.width, scrim.height]).toEqual([0, 0, 390, 844]);
  });
});

/**
 * Alvos de toque ≥ 44×44 px (docs/36 RA-2, T-08.8). O visual do `chip` (36 px) e dos botões de
 * texto pequenos fica como está; a área de toque vem do `::after` de `chip`/`tap-area`. A medida é
 * `alvosPequenos` (retângulo OU área expandida confirmada por `elementFromPoint`, ver o helper).
 * Roda nos três projetos (390, 1280 e 320): o layout estreito é onde os alvos se apertam.
 *
 * Falha que detecta: um controle novo (ou um `chip` sem o `::after`) com menos de 44 px de acerto.
 */
async function conferirAlvos(page: Page, onde: string, opts?: { escopo?: string }) {
  await page.waitForTimeout(400); // animações de entrada (anim-slide-up/pop-in) mudam o retângulo
  const lista = await alvosPequenos(page, opts);
  expect(lista, `${onde}: controles com área de toque < ${ALVO_MIN} px\n${formatarAlvos(lista)}`).toEqual([]);
}

/** O ponto (dx, dy) a partir do centro do controle ainda é o controle (a área expandida existe de verdade). */
async function acertaAPartirDoCentro(l: Locator, dx: number, dy: number) {
  return l.evaluate(
    (el, [ox, oy]) => {
      const b = el.getBoundingClientRect();
      const alvo = document.elementFromPoint(b.left + b.width / 2 + ox, b.top + b.height / 2 + oy);
      return !!alvo && (alvo === el || el.contains(alvo));
    },
    [dx, dy] as const,
  );
}

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test.describe("alvos de toque ≥ 44 px (docs/36 RA-2, T-08.8)", () => {
  test.beforeEach(async ({ page }) => {
    await seedOnce(page, ESTADO);
  });

  // Telas estáticas (sem interação): a lista cobre toda tela que tem chip, link de texto ou botão pequeno.
  for (const rota of ["/trilha", "/progress", "/profile", "/topics", "/flashcards", "/redacao", "/nivelamento", "/login", "/aha", "/quiz", "/plan", "/ranking", "/dashboard"]) {
    test(`${rota}: todos os controles têm ≥ 44 px de área de toque`, async ({ page }) => {
      await page.goto(rota, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1, h2, [role=heading], button, a[href]").first()).toBeVisible({ timeout: 20_000 });
      await conferirAlvos(page, rota);
    });
  }

  test("/profile: os chips (36 px de visual) têm área de 44", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    const chip = page.locator("button.chip").first();
    await expect(chip).toBeVisible({ timeout: 20_000 });
    const r = await chip.boundingBox();
    expect(r!.height, "visual do chip continua 36 px").toBeLessThan(ALVO_MIN);
    expect(await acertaAPartirDoCentro(chip, 0, -21), "21 px acima do centro ainda é o chip").toBe(true);
    expect(await acertaAPartirDoCentro(chip, 0, 21), "21 px abaixo do centro ainda é o chip").toBe(true);
    await conferirAlvos(page, "/profile");
  });

  test("/nivelamento: 'Pausar e continuar depois' tem ≥ 44 px", async ({ page }) => {
    await page.goto("/nivelamento", { waitUntil: "domcontentloaded" });
    const pausar = page.getByRole("button", { name: "Pausar e continuar depois" });
    await expect(pausar).toBeVisible({ timeout: 20_000 });
    await conferirAlvos(page, "/nivelamento pausar");
    expect(await acertaAPartirDoCentro(pausar, 0, -21), "21 px acima do centro ainda aciona o botão").toBe(true);
  });

  test("player: passo, questão marcada, feedback e 'Sair da lição?'", async ({ page }) => {
    await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Começar" }).click({ timeout: 20_000 });
    await conferirAlvos(page, "player: primeiro passo");
    for (let i = 0; i < 8; i++) {
      const radios = page.locator('[role="radio"]');
      if (await radios.count()) {
        await radios.first().click();
        await conferirAlvos(page, "player: questão com opção marcada");
        await page.getByRole("button", { name: "Verificar" }).click();
        await page.locator('[role="status"]').waitFor();
        await conferirAlvos(page, "player: folha de feedback");
        break;
      }
      await page.getByRole("button", { name: /^(Continuar|Começar)$/ }).click();
    }
    await page.getByRole("button", { name: "Sair da lição", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Sair da lição?" })).toBeVisible();
    await conferirAlvos(page, "folha 'Sair da lição?'", { escopo: '[role="dialog"]' });
  });

  test("/study: 'Fechar dica' e 'Ver resolução' têm ≥ 44 px", async ({ page }) => {
    await page.goto("/study", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Responder" }).waitFor({ timeout: 20_000 });
    await conferirAlvos(page, "/study: pergunta");
    await page.getByRole("button", { name: "Pedir dica" }).click();
    const fechar = page.getByRole("button", { name: "Fechar dica" });
    await expect(fechar).toBeVisible();
    await conferirAlvos(page, "/study: com dica aberta");
    expect(await acertaAPartirDoCentro(fechar, 20, 20), "20 px na diagonal do centro ainda fecha a dica").toBe(true);
    await fechar.click();
    // Responde para abrir o FeedbackSheet com "Ver resolução".
    await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
    await page.getByRole("button", { name: "Responder" }).click();
    const ver = page.getByRole("button", { name: /^(Ver|Ocultar) resolução$/ });
    await expect(ver).toBeVisible({ timeout: 15_000 });
    await conferirAlvos(page, "/study: feedback com 'Ver resolução'");
    await ver.click();
    await conferirAlvos(page, "/study: resolução aberta");
  });

  test("painel do tutor: sugestões (chip) e 'Remover foto' têm ≥ 44 px", async ({ page }) => {
    await page.goto("/trilha", { waitUntil: "domcontentloaded" });
    await page.locator("[data-tutor-fab]").click({ timeout: 20_000 });
    const dialog = page.getByRole("dialog", { name: "Foca" });
    await expect(dialog).toBeVisible();
    await conferirAlvos(page, "painel do tutor (sugestões)", { escopo: '[role="dialog"]' });
    await page.locator('input[type="file"]').setInputFiles({ name: "questao.png", mimeType: "image/png", buffer: PNG_1X1 });
    const remover = page.getByRole("button", { name: "Remover foto" });
    await expect(remover).toBeVisible({ timeout: 10_000 });
    await conferirAlvos(page, "painel do tutor com foto anexada", { escopo: '[role="dialog"]' });
    expect(await acertaAPartirDoCentro(remover, 20, 0), "20 px ao lado do centro ainda remove a foto").toBe(true);
    await remover.click();
    await expect(remover).toHaveCount(0);
  });

  test("folha 'Foco de estudo' na trilha", async ({ page }) => {
    await page.goto("/trilha", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Mudar", exact: true }).click({ timeout: 20_000 });
    await expect(page.getByRole("dialog")).toBeVisible();
    await conferirAlvos(page, "FocusSheet", { escopo: '[role="dialog"]' });
  });

  test("/profile: folha 'Curso pretendido' (docs/36 T-09.3) — área aberta e sem rolagem horizontal", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Mudar", exact: true }).click({ timeout: 20_000 });
    const folha = page.getByRole("dialog", { name: "Curso pretendido" });
    await expect(folha).toBeVisible();
    await folha.getByRole("button", { name: "Saúde", exact: true }).click();
    await expect(folha.locator("button.card-press").first()).toBeVisible();
    await conferirAlvos(page, "folha de curso", { escopo: '[role="dialog"]' });
    const semRolagem = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(semRolagem).toBe(true);
  });
});

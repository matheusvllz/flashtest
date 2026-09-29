import { expect, test, type Page } from "@playwright/test";

// Movimento (docs/40 §13, G-14, G-15): tudo visível sem JS e com movimento reduzido; com movimento, os blocos
// entram no scroll e o GSAP chega DEPOIS da primeira pintura, em chunk separado.

async function opacidadesEscondidas(page: Page) {
  return page.locator("[data-reveal]").evaluateAll((els) => els.filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length);
}

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("nada fica escondido e o layout empilhado assume", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).not.toHaveClass(/lp-motion/);
    expect(await opacidadesEscondidas(page)).toBe(0);
    await expect(page.locator(".lp-scrolly-phone")).toBeHidden();
    // Os cinco retratos do "Como funciona" estão no fluxo, um por passo.
    await expect(page.locator(".lp-step-inline-shot")).toHaveCount(5);
    // O retrato do último passo repete a tela do hero e do passo 3: abaixo de 768 px fica só o texto.
    const largura = page.viewportSize()!.width;
    const todos = await page.locator(".lp-step-inline-shot").all();
    for (const [i, el] of todos.entries()) {
      if (i === todos.length - 1 && largura < 768) await expect(el).toBeHidden();
      else await expect(el).toBeVisible();
    }
  });

  test("o chunk do GSAP nem é pedido", async ({ page }) => {
    const pedidos: string[] = [];
    page.on("request", (r) => pedidos.push(r.url()));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    expect(pedidos.filter((u) => /lp-assets\/scroll-/.test(u))).toEqual([]);
  });
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("o HTML pré-renderizado mostra todo o conteúdo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Você abre. O próximo passo já está escolhido.");
    expect(await opacidadesEscondidas(page)).toBe(0);
    for (const id of ["cena", "como-funciona", "tenta-uma", "recomeco", "ja-tem", "foca", "duvidas", "fechamento"]) {
      await expect(page.locator(`[data-section='${id}']`)).toBeVisible();
    }
    // FAQ nativa abre sem JS.
    await page.locator("#duvidas summary").first().click();
    await expect(page.locator("#duvidas details").first()).toHaveAttribute("open", "");
    // A demo avisa que precisa do app. (O Playwright não liga o parser de <noscript> ao desligar o JS,
    // então conferimos o HTML servido: um navegador sem JS mostra esse aviso.)
    const html = await (await page.request.get("/")).text();
    expect(html).toMatch(/<noscript>[\s\S]*Para responder, abre no app\.[\s\S]*Começar agora[\s\S]*<\/noscript>/);
  });
});

test.describe("com movimento", () => {
  test.use({ reducedMotion: "no-preference" });

  test("blocos abaixo da dobra começam escondidos e entram ao rolar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(page.locator("html")).toHaveClass(/lp-motion/);
    const antes = await page.locator("#fechamento [data-reveal]").evaluate((e) => Number(getComputedStyle(e).opacity));
    expect(antes).toBeLessThan(0.5);
    await page.locator("#fechamento").scrollIntoViewIfNeeded();
    await expect(page.locator("#fechamento [data-reveal]")).toHaveClass(/is-in/);
    await expect
      .poll(async () => page.locator("#fechamento [data-reveal]").evaluate((e) => Number(getComputedStyle(e).opacity)))
      .toBeGreaterThan(0.99);
  });

  test("o GSAP chega depois do load, em chunk separado do JS inicial", async ({ page }) => {
    const pedidos: { url: string; depoisDoLoad: boolean }[] = [];
    let loadDisparado = false;
    page.on("load", () => (loadDisparado = true));
    page.on("request", (r) => pedidos.push({ url: r.url(), depoisDoLoad: loadDisparado }));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const scroll = pedidos.find((p) => /lp-assets\/scroll-/.test(p.url));
    expect(scroll, "chunk do GSAP deveria ser pedido").toBeTruthy();
    expect(scroll!.depoisDoLoad).toBe(true);
    // O pedido do JS inicial vem antes do chunk do movimento.
    const idxInicial = pedidos.findIndex((p) => /lp-assets\/index-/.test(p.url));
    expect(idxInicial).toBeGreaterThanOrEqual(0);
    expect(idxInicial).toBeLessThan(pedidos.indexOf(scroll!));
  });

  test("com o chunk do GSAP bloqueado, o fallback por IntersectionObserver revela os blocos", async ({ page }) => {
    await page.route("**/lp-assets/scroll-*.js", (r) => r.abort());
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(600);
    await expect(page.locator("html")).toHaveClass(/lp-motion/);
    await page.locator("#fechamento").scrollIntoViewIfNeeded();
    await expect(page.locator("#fechamento [data-reveal]")).toHaveClass(/is-in/);
    await expect
      .poll(async () => page.locator("#fechamento [data-reveal]").evaluate((e) => Number(getComputedStyle(e).opacity)))
      .toBeGreaterThan(0.99);
  });
});

test.describe("Como funciona com movimento em desktop", () => {
  test.use({ reducedMotion: "no-preference", viewport: { width: 1280, height: 800 } });

  test("o celular fica fixo e o retrato acompanha o passo que cruza o meio da tela", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const fixo = page.locator(".lp-scrolly-phone");
    await expect(fixo).toBeVisible();
    await expect(page.locator(".lp-step-inline-shot").first()).toBeHidden();
    await expect(page.locator(".lp-shot-layer[data-active='true']")).toHaveCount(1);

    await page.locator("#passo-atividade").scrollIntoViewIfNeeded();
    await page.locator("#passo-atividade").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(page.locator("#passo-atividade")).toHaveAttribute("data-active", "true");
    const camadas = page.locator(".lp-shot-layer");
    await expect(camadas.nth(2)).toHaveAttribute("data-active", "true");
    await expect(camadas.nth(0)).toHaveAttribute("data-active", "false");
    // Nunca sequestra o scroll: sem pin (nenhum elemento com pin-spacer) e sem snap.
    expect(await page.locator(".pin-spacer").count()).toBe(0);
  });

  test("a margem azul se preenche conforme a leitura avança", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const fill = page.locator("[data-margin-fill]");
    const escala = () => fill.evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).d);
    await page.locator("#como-funciona").evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(500);
    const inicio = await escala();
    await page.locator("#passo-revisao").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(900);
    const fim = await escala();
    expect(fim).toBeGreaterThan(inicio);
    expect(fim).toBeGreaterThan(0.5);
  });
});

test.describe("Como funciona com movimento em tablet", () => {
  test.use({ reducedMotion: "no-preference", viewport: { width: 768, height: 1024 } });

  test("abaixo de 1024 px o layout é empilhado, com um retrato por passo", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".lp-scrolly-phone")).toBeHidden();
    await expect(page.locator(".lp-step-inline-shot").first()).toBeVisible();
  });
});

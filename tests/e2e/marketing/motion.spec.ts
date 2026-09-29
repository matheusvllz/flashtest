import { expect, test, type Page } from "@playwright/test";

// Movimento (docs/40 §13, G-14, G-15; v2: docs/42 §6): tudo visível sem JS e com movimento reduzido; com movimento, os blocos
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
    // A história fica empilhada: sem cena presa, sem palco, cada cena com legenda e tela à vista (docs/42 §7).
    await expect(page.locator("html")).not.toHaveClass(/lp-story-on/);
    await expect(page.locator(".lp-story__stage")).toBeHidden();
    await expect(page.locator(".lp-scene")).toHaveCount(5);
    for (const vis of await page.locator(".lp-scene__vis").all()) await expect(vis).toBeVisible();
    for (const cap of await page.locator(".lp-scene__cap").all()) await expect(cap).toBeVisible();
    // A sequência do erro mostra o estado final: a conversa aberta, com a resposta da Foca.
    await expect(page.locator(".lp-errou-phone .app-tutor__foca-msg")).toBeVisible();
  });

  test("o chunk do GSAP nem é pedido", async ({ page }) => {
    const pedidos: string[] = [];
    page.on("request", (r) => pedidos.push(r.url()));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    expect(pedidos.filter((u) => /marketing\/motion\/scroll\.ts|\/assets\/scroll-[\w-]+\.js/.test(u))).toEqual([]);
  });
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("o HTML pré-renderizado mostra todo o conteúdo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Por onde eu começo? O Foca já escolheu.");
    expect(await opacidadesEscondidas(page)).toBe(0);
    for (const id of ["cena", "como-funciona", "tenta-uma", "errou", "recomeco", "duvidas", "fechamento"]) {
      await expect(page.locator(`[data-section='${id}']`)).toBeVisible();
    }
    // FAQ nativa abre sem JS.
    await page.locator("#duvidas summary").first().click();
    await expect(page.locator("#duvidas details").first()).toHaveAttribute("open", "");
    // A demo avisa que precisa do app. (O Playwright não liga o parser de <noscript> ao desligar o JS,
    // então conferimos o HTML servido: um navegador sem JS mostra esse aviso.)
    const html = await (await page.request.get("/")).text();
    expect(html).toMatch(/<noscript[^>]*>[\s\S]*Para responder, abre no app\.[\s\S]*Começar grátis[\s\S]*<\/noscript>/);
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
    const scroll = pedidos.find((p) => /marketing\/motion\/scroll\.ts|\/assets\/scroll-[\w-]+\.js/.test(p.url));
    expect(scroll, "chunk do GSAP deveria ser pedido").toBeTruthy();
    expect(scroll!.depoisDoLoad).toBe(true);
  });

  test("com o chunk do GSAP bloqueado, o fallback por IntersectionObserver revela os blocos", async ({ page }) => {
    await page.route(/marketing\/motion\/scroll\.ts|\/assets\/scroll-[\w-]+\.js/, (r) => r.abort());
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

/** Leva o scroll a uma fração do trecho preso da história e espera o scrub (0,5 s) assentar. */
async function historiaEm(page: Page, f: number) {
  await page.evaluate((ff) => {
    const s = document.getElementById("como-funciona")!;
    const topo = s.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: topo + (s.offsetHeight - window.innerHeight) * ff, behavior: "instant" as ScrollBehavior });
  }, f);
  await page.waitForTimeout(900);
}
const legendaVisivel = (page: Page) =>
  page.locator(".lp-scene__cap").evaluateAll((els) => els.findIndex((e) => Number(getComputedStyle(e).opacity) > 0.9));

for (const [nome, viewport] of [
  ["desktop", { width: 1280, height: 800 }],
  ["celular", { width: 390, height: 844 }],
] as const) {
  test.describe(`História presa (HM-2) no ${nome}`, () => {
    test.use({ reducedMotion: "no-preference", viewport });

    test("a seção fica presa pelo sticky nativo e o scroll avança e recua as cenas", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("html")).toHaveClass(/lp-story-on/);
      // Sem pin do GSAP (nenhum pin-spacer): quem prende é position: sticky.
      expect(await page.locator(".pin-spacer").count()).toBe(0);
      await expect(page.locator(".lp-story__stage")).toBeVisible();

      await historiaEm(page, 0.02);
      expect(await legendaVisivel(page)).toBe(0);
      const pinTopo = () => page.locator(".lp-story__pin").evaluate((e) => Math.round(e.getBoundingClientRect().top));
      expect(await pinTopo()).toBe(0);

      await historiaEm(page, 0.5);
      expect(await legendaVisivel(page)).toBe(2);
      expect(await pinTopo()).toBe(0);

      await historiaEm(page, 0.97);
      expect(await legendaVisivel(page)).toBe(4);
      await expect(page.locator(".lp-story__dot[data-state='on']")).toHaveCount(1);

      // Voltando, a timeline recua: a cena anterior volta.
      await historiaEm(page, 0.3);
      expect(await legendaVisivel(page)).toBe(1);
    });

    test("quem abre a página já na história não ganha cena presa (nada pula)", async ({ page }) => {
      await page.goto("/#como-funciona");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(800);
      await expect(page.locator("html")).not.toHaveClass(/lp-story-on/);
      for (const cap of await page.locator(".lp-scene__cap").all()) await expect(cap).toBeVisible();
    });
  });
}

test.describe("Errou? (HM-3)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a sequência do Explicar melhor toca ao entrar e termina com a resposta da Foca", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const resposta = page.locator(".lp-errou-phone .app-tutor__foca-msg");
    await page.locator("#errou").evaluate((el) => el.scrollIntoView({ block: "start" }));
    await expect.poll(async () => resposta.evaluate((e) => Number(getComputedStyle(e).opacity)), { timeout: 8000 }).toBeGreaterThan(0.99);
  });
});
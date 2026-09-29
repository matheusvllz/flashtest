import { expect, test } from "@playwright/test";

// Responsividade (docs/40 F11, G-16, G-17): 7 larguras, sem rolagem horizontal, CTA do hero na primeira tela,
// navbar em uma linha, alvos de toque de 44 px. Roda só num projeto: os tamanhos vêm do próprio teste.
const TAMANHOS: [number, number][] = [
  [320, 700],
  [360, 740],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
];

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== "lp-desktop", "os tamanhos são varridos dentro do teste");
});

for (const [w, h] of TAMANHOS) {
  test(`${w}x${h}: sem rolagem horizontal, CTA do hero na primeira tela e navbar em uma linha`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(sobra, "rolagem horizontal").toBeLessThanOrEqual(0);

    // CTA principal inteiro dentro da primeira tela (sem rolar).
    const cta = page.locator("#cta-hero");
    const box = (await cta.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height, "CTA do hero abaixo da dobra").toBeLessThanOrEqual(h);

    // Navbar: uma linha, dentro do teto de 80 px.
    const nav = (await page.locator("header.lp-nav").boundingBox())!;
    expect(nav.height).toBeLessThanOrEqual(80);
    // Uma linha = os centros verticais dos filhos diretos coincidem (o layout centraliza cada um).
    const desvio = await page.locator("header.lp-nav nav > *").evaluateAll((els) => {
      const centros = els.filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getBoundingClientRect().top + e.getBoundingClientRect().height / 2);
      return Math.max(...centros) - Math.min(...centros);
    });
    expect(desvio, "navbar em mais de uma linha").toBeLessThanOrEqual(4);

    // Nenhum texto do H1 cortado: a caixa do título cabe na largura da tela.
    const h1 = (await page.locator("h1").boundingBox())!;
    expect(h1.x + h1.width).toBeLessThanOrEqual(w);
  });
}

for (const [w, h] of [
  [390, 844],
  [1280, 800],
] as const) {
test(`alvos de toque de 44 x 44 px em todo controle visível (${w})`, async ({ page }) => {
  await page.setViewportSize({ width: w, height: h });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Abre tudo que pode estar fechado e rola para carregar o que é preguiçoso.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  const pequenos = await page.locator("a[href], button, summary, [role='radio']").evaluateAll((els) =>
    els
      .filter((e) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !e.closest("[inert]") && !e.classList.contains("lp-skip");
      })
      .map((e) => ({ t: (e.textContent ?? "").trim().slice(0, 30) || e.getAttribute("aria-label") || e.tagName, h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) }))
      .filter((x) => x.h < 44 || x.w < 44),
  );
  expect(pequenos).toEqual([]);
});
}

test("nenhuma imagem sem dimensões (zero CLS) e todas com alt (vazio só nas decorativas)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sem = await page.locator("img").evaluateAll((els) => els.filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).map((i) => (i as HTMLImageElement).src));
  expect(sem).toEqual([]);
  const semAlt = await page.locator("img").evaluateAll((els) => els.filter((i) => i.getAttribute("alt") === null).map((i) => (i as HTMLImageElement).src));
  expect(semAlt).toEqual([]);
});

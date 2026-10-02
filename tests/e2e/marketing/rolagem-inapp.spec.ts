/**
 * Rolagem da landing no navegador interno do Instagram (spec 49 T-49.1.1/T-49.1.2, §5.7). O Instagram não pode ser
 * automatizado; este teste EMULA o que ele faz: user agent com "Instagram", toque, e a barra do app que muda a altura
 * da janela a cada inversão de direção (844 ↔ 760 px). Afirma que a página nunca "teleporta" e que o modo da história
 * não liga e desliga sozinho. A validação final continua sendo o roteiro manual em iPhone e Android (preparacao.md,
 * Passo 10), com o painel `?diagnostico-rolagem=1`.
 */
import { expect, test, type Page } from "@playwright/test";

const UA_INSTAGRAM =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 Instagram 389.0.0.29.80 (iPhone15,3; iOS 18_5; pt_BR; pt; scale=3.00; 1290x2796; 0)";
const ALTA = 844;
const BAIXA = 760;
const PASSO = 140;
/** Tolerância de um passo: a posição pode andar o passo + o ajuste de uma barra, nunca um salto de tela. */
const TOLERANCIA = 120;

test.use({ userAgent: UA_INSTAGRAM, hasTouch: true, isMobile: true, viewport: { width: 390, height: ALTA }, reducedMotion: "no-preference" });

async function rolar(page: Page, dy: number) {
  await page.evaluate((d) => window.scrollBy({ top: d, behavior: "instant" as ScrollBehavior }), dy);
  await page.waitForTimeout(120);
}

test("inverter a rolagem com a barra do Instagram mudando a altura não faz a página pular nem trocar de modo", async ({ page }) => {
  test.skip(test.info().project.name !== "lp-mobile", "emulação de celular: um projeto basta");
  await page.goto("/?diagnostico-rolagem=1");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("[data-diagnostico-rolagem]")).toBeVisible();
  const modoInicial = await page.locator("html").evaluate((h) => h.classList.contains("lp-story-on"));

  // Começa um pouco antes da história e atravessa até o fim da página.
  const inicio = await page.evaluate(() => {
    const s = document.getElementById("como-funciona")!;
    return Math.max(0, s.getBoundingClientRect().top + window.scrollY - window.innerHeight);
  });
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior }), inicio);
  await page.waitForTimeout(300);

  const saltos: { passo: number; esperado: number; obtido: number }[] = [];
  let altura = ALTA;
  let y = await page.evaluate(() => window.scrollY);
  const fim = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  let direcao = 1;
  for (let passo = 0; passo < 120 && y < fim - PASSO; passo++) {
    // A cada 4 passos inverte por 2 passos, como quem confere uma cena; a barra aparece/some a cada inversão.
    const novaDirecao = passo % 6 === 4 ? -1 : passo % 6 === 0 ? 1 : direcao;
    if (novaDirecao !== direcao) {
      altura = altura === ALTA ? BAIXA : ALTA;
      await page.setViewportSize({ width: 390, height: altura });
      direcao = novaDirecao;
    }
    const antes = await page.evaluate(() => window.scrollY);
    await rolar(page, direcao * PASSO);
    const depois = await page.evaluate(() => window.scrollY);
    const esperado = Math.min(Math.max(antes + direcao * PASSO, 0), fim);
    if (Math.abs(depois - esperado) > TOLERANCIA) saltos.push({ passo, esperado: Math.round(esperado), obtido: Math.round(depois) });
    y = depois;
  }

  const diagnostico = await page.locator("[data-diagnostico-rolagem]").innerText();
  test.info().annotations.push({ type: "diagnostico", description: diagnostico.replace(/\n/g, " | ") });
  expect(saltos, `saltos de posição ao inverter a rolagem:\n${JSON.stringify(saltos)}`).toEqual([]);
  expect(await page.locator("html").evaluate((h) => h.classList.contains("lp-story-on"))).toBe(modoInicial);
});

test("sem o parâmetro, o painel de diagnóstico não existe nem é baixado", async ({ page }) => {
  test.skip(test.info().project.name !== "lp-mobile", "um projeto basta");
  const pedidos: string[] = [];
  page.on("request", (r) => pedidos.push(r.url()));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("[data-diagnostico-rolagem]")).toHaveCount(0);
  expect(pedidos.filter((u) => /diagnostico/.test(u))).toEqual([]);
});

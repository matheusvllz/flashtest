import { expect, test, type Page } from "@playwright/test";

// Estrutura, links e ausência de requisições externas (docs/40 §26.1, G-4, G-11, G-22).
const SECOES = ["hero", "cena", "como-funciona", "tenta-uma", "errou", "recomeco", "duvidas", "fechamento"]; // docs/42 §4

async function abrir(page: Page) {
  const externas: string[] = [];
  const erros: string[] = [];
  const origem = new URL(process.env.LP_BASE_URL ?? "http://localhost:8080").origin;
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith(origem) && !u.startsWith("data:") && !u.startsWith("blob:")) externas.push(u);
  });
  page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
  page.on("pageerror", (e) => erros.push(e.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  return { externas, erros };
}

test("estrutura: um h1, landmarks e as oito seções na ordem do plano v2", async ({ page }) => {
  await abrir(page);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Por onde eu começo? O Foca já escolheu.");
  await expect(page.locator("header nav[aria-label='Principal']")).toHaveCount(1);
  await expect(page.locator("main#conteudo")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  const ids = await page.locator("main [data-section]").evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.section));
  expect(ids).toEqual(SECOES);
  // Todo h2 pertence a uma seção e nenhum nível é pulado (h1 > h2 > h3).
  const niveis = await page.locator("h1, h2, h3").evaluateAll((els) => els.map((e) => Number(e.tagName[1])));
  for (let i = 1; i < niveis.length; i++) expect(niveis[i] - niveis[i - 1]).toBeLessThanOrEqual(1);
});

test("links para o app: 'Começar grátis' vai para /quiz e 'Entrar' para /login", async ({ page }) => {
  await abrir(page);
  const ctas = page.locator("a[data-cta]");
  const n = await ctas.count();
  expect(n).toBe(4); // navbar, hero, fechamento e a barra fixa do mobile (o CTA da demo só aparece depois de responder)
  for (const href of await ctas.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href))) {
    expect(new URL(href).pathname).toBe("/quiz"); // a[href] resolvido pelo navegador
  }
  const entrar = page.getByRole("link", { name: "Entrar" }).first();
  await expect(entrar).toHaveAttribute("href", "/login");
  // Um único rótulo para a ação principal.
  const rotulos = await ctas.evaluateAll((els) => [...new Set(els.map((e) => (e.textContent ?? "").trim()))]);
  expect(rotulos).toEqual(["Começar grátis"]);
});

test("âncoras da navegação levam às seções certas", async ({ page }) => {
  await abrir(page);
  await expect(page.locator("#como-funciona")).toHaveCount(1);
  await expect(page.locator("#duvidas")).toHaveCount(1);
  for (const href of ["#como-funciona", "#duvidas", "#conteudo", "#topo"]) {
    await expect(page.locator(`a[href='${href}']`).first()).toBeAttached();
  }
});

test("nenhuma requisição para fora da origem e nenhum erro no console", async ({ page }) => {
  const { externas, erros } = await abrir(page);
  // Rola a página inteira para carregar imagens preguiçosas e revelações.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await page.waitForLoadState("networkidle");
  expect(externas).toEqual([]);
  expect(erros).toEqual([]);
});

test("FAQ abre e fecha pelo teclado e a primeira pergunta é 'É grátis?'", async ({ page }) => {
  await abrir(page);
  const primeira = page.locator("#duvidas summary").first();
  await expect(primeira).toContainText("É grátis?");
  await primeira.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#duvidas details").first()).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(page.locator("#duvidas details").first()).not.toHaveAttribute("open", "");
});

test("sem rolagem horizontal", async ({ page }) => {
  await abrir(page);
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});

test("CTA fixo só existe no mobile e aparece depois do hero", async ({ page, viewport }) => {
  await abrir(page);
  const barra = page.locator(".lp-sticky");
  if (viewport!.width >= 768) {
    await expect(barra).toBeHidden();
    return;
  }
  await expect(barra).toHaveAttribute("data-visible", "false");
  await page.locator("[data-section='cena'] h2").scrollIntoViewIfNeeded();
  await expect(barra).toHaveAttribute("data-visible", "true");
  // Durante a demo o CTA próprio dela (depois da resposta) é o certo: a barra some para não competir com "Verificar".
  await page.locator("#tenta-uma").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(barra).toHaveAttribute("data-visible", "false");
  // Depois da demo, no recomeço, ela volta.
  await page.locator("[data-section='recomeco'] h2").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(barra).toHaveAttribute("data-visible", "true");
  await page.locator("#fechamento").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(barra).toHaveAttribute("data-visible", "false");
});

test("a barra fixa some enquanto o foco do teclado está nas Dúvidas (nunca cobre o item focado)", async ({ page, viewport }) => {
  test.skip(viewport!.width >= 768, "a barra só existe no mobile");
  await abrir(page);
  const barra = page.locator(".lp-sticky");
  await page.locator("[data-section='recomeco'] h2").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(barra).toHaveAttribute("data-visible", "true");
  await page.locator("#duvidas summary").nth(2).focus();
  await expect(barra).toHaveAttribute("data-visible", "false");
});

test("eventos locais: página vista, seção vista, cliques por atributo, dúvida aberta e resposta da demo", async ({ page }) => {
  // Sem navegação de verdade para o app: só interessa o evento.
  await page.addInitScript(() => {
    (window as unknown as { __eventos: { name: string; props: Record<string, string> }[] }).__eventos = [];
    window.addEventListener("foca-lp:track", (e) => (window as unknown as { __eventos: unknown[] }).__eventos.push((e as CustomEvent).detail));
    document.addEventListener("click", (e) => (e.target as Element).closest("a[data-cta], a[data-track]") && e.preventDefault(), true);
  });
  await abrir(page);
  const eventos = () => page.evaluate(() => (window as unknown as { __eventos: { name: string; props: Record<string, string> }[] }).__eventos);

  await page.locator("#cta-hero").click();
  await page.getByRole("link", { name: "Dúvidas" }).first().evaluate((a) => (a as HTMLElement).click());
  await page.locator("#duvidas").scrollIntoViewIfNeeded();
  await page.locator("#duvidas summary").first().click();
  await page.locator("#tenta-uma").scrollIntoViewIfNeeded();
  const demo = page.locator("#tenta-uma");
  await demo.getByRole("radio").first().click();
  await demo.getByRole("button", { name: "Verificar" }).click();

  await expect.poll(async () => (await eventos()).map((e) => e.name)).toEqual(expect.arrayContaining(["landing_view", "section_view", "hero_cta_click", "faq_open", "demo_answer"]));
  const todos = await eventos();
  expect(todos.find((e) => e.name === "hero_cta_click")!.props.cta).toBe("hero");
  expect(todos.find((e) => e.name === "faq_open")!.props.id).toBe("gratis");
  // Nenhum evento carrega texto livre, e-mail ou identificador: só rótulos curtos.
  for (const e of todos) for (const v of Object.values(e.props)) expect(String(v).length).toBeLessThan(40);
});

test("a v2 não fala em conta, e-mail ou senha, nem lista o que o Foca não faz (docs/42 §1, U-1 e U-2)", async ({ page }) => {
  await abrir(page);
  const texto = (await page.locator("body").innerText()).toLowerCase();
  for (const proibido of ["sem e-mail", "sem senha", "criar conta", "o que o foca não faz", "não promete", "não corrige", "neste aparelho"]) {
    expect(texto).not.toContain(proibido);
  }
});
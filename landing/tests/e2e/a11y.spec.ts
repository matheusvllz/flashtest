import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Acessibilidade (docs/40 §17, G-20): axe em claro e escuro, em vários estados da página, teclado, foco visível,
// zoom e texto grandes. Alvo declarado: WCAG 2.2 AA.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function axe(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

async function carregar(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Rola tudo para carregar as imagens preguiçosas e liberar as revelações.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

for (const esquema of ["light", "dark"] as const) {
  test.describe(`axe, tema ${esquema}`, () => {
    test.use({ colorScheme: esquema });

    test("página inicial", async ({ page }) => {
      await carregar(page);
      expect(await axe(page)).toEqual([]);
    });

    test("com a demo respondida (certa, errada e Não sei)", async ({ page }) => {
      await carregar(page);
      const sec = page.locator("#tenta-uma");
      await sec.scrollIntoViewIfNeeded();
      for (const escolha of ["900 reais", "750 reais", null]) {
        if (escolha) {
          await sec.getByRole("radio", { name: escolha }).click();
          await sec.getByRole("button", { name: "Verificar" }).click();
        } else {
          await sec.getByRole("button", { name: "Não sei a resposta desta questão" }).click();
        }
        await expect(sec.getByRole("status")).toBeVisible();
        await page.waitForTimeout(500); // o feedback sobe em 280 ms; o axe mede contraste com a opacidade final
        expect(await axe(page), `estado da demo: ${escolha ?? "nao sei"}`).toEqual([]);
        await sec.getByRole("button", { name: "Tentar de novo" }).click();
      }
    });

    test("com a FAQ inteira aberta", async ({ page }) => {
      await carregar(page);
      await page.locator("#duvidas summary").evaluateAll((els) => els.forEach((e) => (e.parentElement as HTMLDetailsElement).setAttribute("open", "")));
      expect(await axe(page)).toEqual([]);
    });
  });
}

test.describe("axe com movimento e sticky", () => {
  test.use({ reducedMotion: "no-preference", viewport: { width: 1280, height: 800 } });

  test("desktop com o celular fixo do Como funciona", async ({ page }) => {
    await carregar(page);
    await page.locator("#passo-erro").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(800);
    expect(await axe(page)).toEqual([]);
  });

  test("mobile com a barra fixa visível", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await carregar(page);
    await page.locator("[data-section='recomeco'] h2").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(page.locator(".lp-sticky")).toHaveAttribute("data-visible", "true");
    expect(await axe(page)).toEqual([]);
  });
});

test("teclado: a ordem de foco segue a leitura, todo foco é visível e nada o cobre", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await carregar(page);
  const passos: { rotulo: string; visivel: boolean; coberto: boolean }[] = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const emVista = r.bottom > 0 && r.top < window.innerHeight;
      // O centro do elemento não pode estar debaixo da navbar nem da barra fixa.
      const topo = document.elementFromPoint(r.left + r.width / 2, Math.min(Math.max(r.top + r.height / 2, 1), window.innerHeight - 1));
      const coberto = emVista && !!topo && !el.contains(topo) && !topo.contains(el);
      const contorno = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2;
      return { rotulo: (el.textContent ?? el.getAttribute("aria-label") ?? el.tagName).trim().slice(0, 40), contorno, coberto };
    });
    if (!info) break;
    passos.push({ rotulo: info.rotulo, visivel: info.contorno, coberto: info.coberto });
    if (passos.length > 3 && info.rotulo === passos[0].rotulo) break;
  }
  expect(passos.length).toBeGreaterThan(15);
  expect(passos.filter((p) => !p.visivel).map((p) => p.rotulo), "foco sem contorno de 2 px ou mais").toEqual([]);
  expect(passos.filter((p) => p.coberto).map((p) => p.rotulo), "foco coberto por navbar ou barra fixa").toEqual([]);
  // O primeiro foco é o link "Pular para o conteúdo".
  expect(passos[0].rotulo).toBe("Pular para o conteúdo");
});

test("o link 'Pular para o conteúdo' leva ao main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#conteudo$/);
});

test("zoom de 200% (viewport de 640 px) e texto do sistema em 200%: sem rolagem horizontal nem texto cortado", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 800 });
  await carregar(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), "texto 200%: rolagem horizontal").toBeLessThanOrEqual(0);
  // Nenhum controle com texto cortado (scrollWidth > clientWidth com overflow escondido).
  const cortados = await page.locator("a, button, summary, h1, h2, h3, p, li").evaluateAll((els) =>
    els
      .filter((e) => {
        const cs = getComputedStyle(e);
        return (cs.overflow === "hidden" || cs.overflowX === "hidden") && e.scrollWidth > e.clientWidth + 1;
      })
      .map((e) => (e.textContent ?? "").trim().slice(0, 30)),
  );
  expect(cortados).toEqual([]);
});

test("estrutura para leitor de tela: landmarks únicos, idioma, títulos de seção e nomes acessíveis", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  for (const sel of ["header", "main", "footer", "nav"]) await expect(page.locator(sel)).toHaveCount(1);
  // Toda seção tem um título que a nomeia.
  const sem = await page.locator("main [data-section]").evaluateAll((els) => els.filter((e) => !e.getAttribute("aria-labelledby") || !document.getElementById(e.getAttribute("aria-labelledby")!)).map((e) => (e as HTMLElement).dataset.section));
  expect(sem).toEqual([]);
  // Links e botões têm nome; imagens decorativas têm alt vazio.
  const semNome = await page.locator("a, button").evaluateAll((els) => els.filter((e) => !(e.textContent ?? "").trim() && !e.getAttribute("aria-label")).map((e) => e.outerHTML.slice(0, 80)));
  expect(semNome).toEqual([]);
});

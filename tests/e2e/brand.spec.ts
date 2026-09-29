import { expect, test, type Page } from "@playwright/test";
import { STORAGE_KEY, USUARIO_ONBOARDED } from "./helpers/estado";

/**
 * Marca (docs/36 §G.8, T-08.6): variante da marca d'água por tema em `/aha`, fallback do
 * `FocaMark` quando a imagem não carrega, e os assets que o `<head>` referencia respondem.
 * (A arte da logo foi trocada pelo usuário em 28/09/2026; aqui só se consolida o uso.)
 */

async function abrirAha(page: Page, tema: "light" | "dark") {
  await page.addInitScript(
    ({ chave, raw }) => {
      try {
        if (!localStorage.getItem(chave)) localStorage.setItem(chave, JSON.stringify(raw));
      } catch {
        /* sem storage */
      }
    },
    { chave: STORAGE_KEY, raw: { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, theme: tema } } },
  );
  await page.goto("/aha", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(tema === "dark" ? /dark/ : /^(?!.*dark).*$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
}

/** srcs das imagens da marca d'água que têm caixa (ou seja, visíveis: `display: none` não tem). */
async function marcaVisivel(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>("[data-aha-marca] img")]
      .filter((img) => img.getClientRects().length > 0)
      .map((img) => new URL(img.src).pathname),
  );
}

test.describe("marca por tema em /aha (docs/36 T-08.6)", () => {
  test("tema escuro: a marca visível é o contorno CLARO (line-light)", async ({ page }) => {
    await abrirAha(page, "dark");
    expect(await marcaVisivel(page)).toEqual(["/branding/foca/foca-line-light-720.png"]);
  });

  test("tema claro: a marca visível é o contorno ESCURO (line-dark)", async ({ page }) => {
    await abrirAha(page, "light");
    expect(await marcaVisivel(page)).toEqual(["/branding/foca/foca-line-dark-720.png"]);
  });

  test("trocar o tema em tempo de execução troca a imagem visível", async ({ page }) => {
    await abrirAha(page, "light");
    expect(await marcaVisivel(page)).toEqual(["/branding/foca/foca-line-dark-720.png"]);
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    expect(await marcaVisivel(page)).toEqual(["/branding/foca/foca-line-light-720.png"]);
  });
});

test.describe("FocaMark sem imagem (docs/36 T-08.6)", () => {
  test("imagem que falha some sem quebrar o layout (caixa mantida, sem rolagem horizontal)", async ({ page }) => {
    // Desde docs/44 §6 a arte sai em WebP (com PNG de reserva no <picture>): os dois formatos falham aqui.
    await page.route("**/branding/foca/foca-line-*.png", (r) => r.abort());
    await page.route(/\/branding\/foca\/foca-color-\d+\.(png|webp)$/, (r) => r.abort());
    await page.route(/\/branding\/foca\/expressoes\/[a-z]+-\d+\.(png|webp)$/, (r) => r.abort());
    await abrirAha(page, "light");
    const img = page.locator("[data-aha-marca] img").first();
    // O `error` dispara depois da montagem: espera a marca ficar oculta.
    await expect.poll(() => img.evaluate((el) => getComputedStyle(el).visibility)).toBe("hidden");
    const caixa = await img.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    expect(caixa).toEqual({ w: 280, h: 280 });
    // As marcas pequenas (fala da Foca, XP inicial) também ficam ocultas, mantendo a caixa.
    const pequena = page.locator('img[width="64"]').first();
    await expect.poll(() => pequena.evaluate((el) => getComputedStyle(el).visibility)).toBe("hidden");
    expect(await pequena.evaluate((el) => (el as HTMLElement).offsetWidth)).toBe(64);
    // Nada de rolagem horizontal e o CTA continua ali.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(page.getByRole("link", { name: "Entrar no meu plano" })).toBeVisible();
  });

  test("imagem que carrega fica visível (controle do teste anterior)", async ({ page }) => {
    await abrirAha(page, "light");
    const pequena = page.locator('img[width="64"]').first();
    await expect(pequena).toBeVisible();
    await expect.poll(() => pequena.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    expect(await pequena.evaluate((el) => getComputedStyle(el).visibility)).toBe("visible");
  });
});

test.describe("assets do <head> respondem (docs/36 §G.8)", () => {
  test("favicon, ícone 192, apple-touch e og:image existem e são imagens", async ({ page, request }) => {
    // Numa rota do produto (a landing, `/`, tem og:image própria; docs/44 §7).
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const urls = await page.evaluate(() => {
      const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]')].map((l) => l.getAttribute("href")!);
      const og = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content;
      return [...links, ...(og ? [og] : [])];
    });
    expect(urls).toEqual(
      expect.arrayContaining([
        "/favicon.ico",
        "/branding/foca/icon-192.png",
        "/branding/foca/apple-touch-icon.png",
        "/branding/foca/og-image.png",
      ]),
    );
    for (const url of urls) {
      const r = await request.get(url);
      expect(r.status(), url).toBe(200);
      expect(r.headers()["content-type"] ?? "", url).toMatch(/^image\//);
      expect((await r.body()).length, `${url} não vazio`).toBeGreaterThan(200);
    }
  });

  test("título e descrição usam a copy de marca (RU-20)", async ({ page }) => {
    // O produto usa a copy de marca; a landing (`/`) tem título e descrição de marketing (docs/44 §7).
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle("Foca — Estudo curto, todo dia.");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Preparação para o ENEM em aulas curtas. A Foca acompanha o que você já sabe e escolhe o próximo passo.",
    );
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", "Estudo curto, todo dia.");
  });
});

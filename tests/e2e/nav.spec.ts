import { expect, test } from "@playwright/test";
import { FEATURES } from "../../src/lib/features";

/**
 * Bottom nav (docs/25 §12.5, §18 T-21/T-27, critério G11: "nav com 4 itens").
 * `FEATURES.trilhaComoHome` ainda está `false` neste ponto do plano — T-22
 * é quem liga a flag em definitivo, depois deste arquivo já existir. Escrito
 * pra se adaptar sozinho quando isso acontecer: a contagem e os hrefs
 * esperados vêm da PRÓPRIA flag (`FEATURES.trilhaComoHome`), lida em vez de
 * fixada em "5" — passa hoje (nav v1, 5 itens) e passa depois de T-22 sem
 * precisar editar este arquivo.
 */
test("bottom nav mostra os itens certos pro estado atual da flag, com aria-current correto", async ({
  page,
}) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  const nav = page.getByRole("navigation");
  await nav.waitFor({ timeout: 15000 });

  const expectedHrefs = FEATURES.trilhaComoHome
    ? ["/trilha", "/study", "/progress", "/profile"]
    : ["/dashboard", "/study", "/redacao", "/progress", "/profile"];

  await expect(nav.getByRole("link")).toHaveCount(expectedHrefs.length);
  for (const href of expectedHrefs) {
    await expect(page.locator(`nav a[href="${href}"]`)).toHaveCount(1);
  }

  // O item "início" (Início na v1, Aprender na v2) tem `aria-current="page"`
  // na tela atual (`/dashboard`, que a nav v1 trata como raiz).
  const homeHref = FEATURES.trilhaComoHome ? "/trilha" : "/dashboard";
  await expect(page.locator(`nav a[href="${homeHref}"]`)).toHaveAttribute("aria-current", "page");

  // Em `/redacao`: na v2, "Aprender" (`/trilha`) acende porque `isNavActive`
  // trata redação como parte do mesmo pilar (docs/25 §12.5); na v1, é o
  // próprio item "Redação" que acende — G11 só exige o comportamento v2, mas
  // testamos o que está de fato ativo hoje.
  await page.goto("/redacao", { waitUntil: "domcontentloaded" });
  const redacaoActiveHref = FEATURES.trilhaComoHome ? "/trilha" : "/redacao";
  await expect(page.locator(`nav a[href="${redacaoActiveHref}"]`)).toHaveAttribute(
    "aria-current",
    "page",
    { timeout: 15000 },
  );
});

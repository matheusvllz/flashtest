import { expect, test, type Page } from "@playwright/test";

/**
 * T-23 (docs/25 §12.4, §18): prova mínima de que `ChapterCompleteSheet`
 * aparece uma vez por capítulo, que fechar grava `celebratedChapterIds` (o
 * guard sozinho segura um reload com a MESMA url, não só a limpeza feita por
 * `navigate({ search: {} })`) e que o nó de revisão do capítulo desbloqueia.
 * Percorre as duas lições de "Citologia" (bio-citologia:
 * citologia-membrana + citologia-organelas) até o fim, acertando sempre.
 *
 * Versão básica — a tarefa completa de E2E é do T-27 (`chapter-complete.spec.ts`
 * é o nome que ele também usaria); este arquivo é o ponto de partida que T-27
 * pode estender, não a suíte inteira.
 */

async function responderQuestao(page: Page, radioIndex: number, isLast: boolean) {
  await page.getByRole("radio").nth(radioIndex).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').waitFor();
  await page.getByRole("button", { name: isLast ? "Ver resultado" : "Continuar" }).click();
}

test("concluir as 2 lições de Citologia mostra a folha do capítulo uma vez, não reabre no reload e desbloqueia a revisão", async ({
  page,
}) => {
  test.setTimeout(90_000);

  // ---------------------------------------------------------- lição 1/2
  await page.goto("/learn/citologia-membrana", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Começar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click(); // teach: bicamada
  await responderQuestao(page, 2, false); // checkpoint — gabarito índice 2
  await page.getByRole("button", { name: "Continuar" }).click(); // teach: mosaico fluido
  await responderQuestao(page, 1, false); // prática 1 — gabarito índice 1
  await responderQuestao(page, 1, false); // prática 2 — gabarito índice 1
  await page.getByRole("button", { name: "Continuar" }).click(); // tip
  await page.getByRole("button", { name: "Continuar" }).click(); // teach: diagrama
  await responderQuestao(page, 0, false); // prática 3 (V/F) — "Verdadeiro" é o índice 0
  await responderQuestao(page, 1, true); // desafio — gabarito índice 1, última pontuada
  await page.getByRole("button", { name: "Concluir lição" }).click();

  // Capítulo ainda NÃO fechou (só 1 das 2 lições concluída) — "Continuar"
  // apenas volta pra trilha, sem folha de celebração.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("link", { name: "Continuar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // ---------------------------------------------------------- lição 2/2
  await page.goto("/learn/citologia-organelas", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Começar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click(); // teach: ribossomo
  await responderQuestao(page, 0, false); // checkpoint — gabarito índice 0
  await page.getByRole("button", { name: "Continuar" }).click(); // teach: complexo de Golgi
  await responderQuestao(page, 2, false); // q6 (banco geral) — gabarito "C" = índice 2
  await responderQuestao(page, 3, false); // q47 (banco geral) — gabarito "D" = índice 3
  await page.getByRole("button", { name: "Continuar" }).click(); // tip
  await page.getByRole("button", { name: "Continuar" }).click(); // teach: mitocôndria x cloroplasto
  await responderQuestao(page, 1, false); // prática 3 — gabarito índice 1
  await responderQuestao(page, 1, true); // desafio — gabarito índice 1, última pontuada
  await page.getByRole("button", { name: "Concluir lição" }).click();

  // Esta conclusão FECHA o capítulo — "Continuar" leva pra `/trilha` com
  // `?capitulo=bio-citologia`, e a folha de celebração deve abrir sozinha lá.
  await page.getByRole("link", { name: "Continuar" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 15000 });
  // A seção "A célula" só tem o capítulo "Citologia" — fechar o capítulo
  // fecha a seção também, então o título real é "Seção concluída"
  // (`sectionCompleted`, docs/25 §12.4), não "Capítulo concluído" (esse é o
  // título de um capítulo cuja seção continua aberta).
  await expect(dialog.getByText("Seção concluída")).toBeVisible();
  await expect(dialog.getByText("Citologia")).toBeVisible();

  const celebrationUrl = page.url();
  expect(celebrationUrl).toContain("capitulo=bio-citologia");

  // Fechar — seja qual for o rótulo do CTA ("Continuar" ou "Fazer a
  // revisão", dependendo de a revisão já estar disponível), o clique passa
  // por `onClose`, que grava `celebratedChapterIds` (critério de aceite T-23).
  await dialog.locator(".btn-primary").click();
  await expect(dialog).toBeHidden();

  // "reload não reabre": revisitar a MESMA url (como um bookmark stale, ou
  // um F5 antes de `navigate` trocar a URL) tem que respeitar o guard em
  // `celebratedChapterIds` sozinho — não só a limpeza de `?capitulo=` feita
  // por `navigate({ search: {} })` no fechamento normal.
  await page.goto(celebrationUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // O nó de revisão do capítulo agora está acessível: só é um `<Link>` (e
  // não um `<div aria-disabled>`) quando destravado.
  await expect(page.getByRole("link", { name: /Revisão · Citologia/ })).toBeVisible({
    timeout: 15000,
  });
});

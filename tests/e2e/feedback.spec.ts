import { expect, test } from "@playwright/test";

/**
 * Critério A1 (docs/20 §20) + regressão dos bugs B1/B4/B5 (§3). Cada teste
 * abre seu próprio contexto de navegador (config `fullyParallel`), então
 * `/study` sempre começa com o storage vazio, sem precisar de fixture própria.
 */

async function answerFirstQuestion(page: import("@playwright/test").Page) {
  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Responder" }).waitFor();
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.locator('[role="status"]').waitFor();
}

test("A1 — a frase do feedback não muda enquanto o relógio da aula continua rodando", async ({
  page,
}) => {
  await answerFirstQuestion(page);
  const titulo = page.locator('[role="status"] p.font-display').first();
  const inicial = (await titulo.textContent())?.trim();

  // O relógio de `study.tsx` re-renderiza a cada 1s — 10s é tempo de sobra
  // pra reproduzir o B1 (frase sorteada de novo a cada render) se ele voltar.
  await page.waitForTimeout(10_000);

  await expect(titulo).toHaveText(inicial ?? "");
});

test("A5/B4 — alternativas neutras após responder ficam totalmente opacas e legíveis", async ({
  page,
}) => {
  await answerFirstQuestion(page);
  const alternativas = page.locator("div.mt-5.flex.flex-col.gap-3 > button");
  const opacities = await alternativas.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).opacity),
  );
  for (const o of opacities) expect(o).toBe("1");
});

test("B5 — clique duplo em Continuar avança só uma questão", async ({ page }) => {
  await answerFirstQuestion(page);
  const continuar = page.getByRole("button", { name: /Continuar|Ver resultado/ });
  await continuar.waitFor();

  // Dois eventos de clique despachados no MESMO handle, sem re-consultar o
  // DOM entre um e outro — é o cenário síncrono que expõe o avanço duplo se
  // a guarda regredir. Usar `locator.click()` duas vezes não serve: a
  // segunda chamada re-busca o elemento e trava esperando um botão
  // "Continuar" que a resposta correta já fez sumir (ele virou "Responder"
  // da próxima questão), o que é o comportamento CERTO, não um bug do teste.
  await continuar.evaluate((el) => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  // Aula tem 2 questões (LESSON_SIZE): se pulou 2, a tela de fechamento
  // aparece direto sem nunca mostrar a segunda pergunta em "answer".
  await expect(page.getByText("Nível", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Fechar por hoje")).not.toBeVisible();
});

import { expect, test } from "@playwright/test";
import { percorrerLicao } from "./helpers/licao";

/**
 * Fase 6 (docs/20 §8.1, critérios A7/A8) + docs/25 §18 T-27: percorre uma
 * microlição v2 inteira — intro → ensino intercalado com questões → recap →
 * conclusão — e prova a retomada sem duplicação depois de um reload no meio
 * do feedback. Atualizado pro player por passos (T-11): "Testar o que
 * aprendi" não existe mais; os botões agora são "Começar"/"Continuar"/
 * "Verificar"/"Concluir lição" (`COPY.licao.*`).
 */
test("percorre a microlição inteira e conclui com XP", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (err) => erros.push(String(err)));

  await page.goto("/learn/citologia-membrana", { waitUntil: "domcontentloaded" });

  // Gabarito real de `citologia-membrana` (docs/25 §18 T-13, radios na
  // ORDEM de `opcoes`/`verdadeiroFalso`, sem embaralhamento pra esses
  // tipos): checkpoint=2, prática-1=1, prática-2=1, prática-3 (V/F)=0
  // ("Verdadeiro" é o índice 0), desafio=1. Checkpoint não conta pra
  // estrela, mas acertar todas as 4 pontuadas dá 100% -> 3 estrelas -> 30 XP
  // (docs/20 §12, Fase 11 — `XP_BY_STARS`).
  await percorrerLicao(page, { acertarIndices: [2, 1, 1, 0, 1] });

  // O título da tela de fechamento é sorteado (`fala("fimbom"/"fimruim")`,
  // `CelebracaoAula.tsx`) — "Você aprendeu" é o marcador estável de que a
  // lição terminou (rótulo fixo, `COPY.licao.voceAprendeu`).
  await expect(page.getByText("Você aprendeu")).toBeVisible();
  await expect(page.getByLabel("3 de 3 estrelas")).toBeVisible();
  await expect(page.getByText("+30 XP")).toBeVisible();

  expect(erros).toEqual([]);
});

test("A8 — reload no meio do feedback mantém resposta e não duplica avanço", async ({ page }) => {
  await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Começar" }).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Começar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click(); // teach: "Porcentagem é fração de 100"

  // 1ª questão da lição = o checkpoint (docs/25 §18 T-27: "passo de
  // referência é a 1ª questão após o intro e o teach"). Gabarito real: 1.
  await page.getByRole("button", { name: "Verificar" }).waitFor();
  await page.locator('[role="radio"]').nth(1).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').waitFor();

  const tituloAntes = await page
    .locator('[role="status"] p.font-display')
    .first()
    .textContent();

  await page.reload({ waitUntil: "domcontentloaded" });

  // Continua no checkpoint, com o MESMO feedback — não voltou pra tela de ensino.
  await page.locator('[role="status"]').waitFor({ timeout: 15000 });
  const tituloDepois = await page
    .locator('[role="status"] p.font-display')
    .first()
    .textContent();
  expect(tituloDepois).toBe(tituloAntes);

  // Continuar avança só UMA vez, mesmo clicando rápido.
  const continuar = page.getByRole("button", { name: "Continuar" });
  await continuar.evaluate((el) => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  // Se tivesse pulado um passo, cairia direto na próxima QUESTÃO
  // ("Verificar" visível) em vez do 2º bloco de ensino ("Exemplo: 15% de
  // 500", o próximo passo real depois do checkpoint).
  await expect(page.getByText("Exemplo: 15% de 500")).toBeVisible();
  await expect(page.getByRole("button", { name: "Verificar" })).toHaveCount(0);
});

test("lição inexistente mostra estado vazio, não tela branca", async ({ page }) => {
  await page.goto("/learn/nao-existe", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/não existe ou ainda não foi publicada/)).toBeVisible();
});

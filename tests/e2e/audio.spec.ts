import { expect, test } from "@playwright/test";

/**
 * Fase 4 (docs/20 §6.4): o motor de áudio real só roda num `AudioContext` de
 * navegador de verdade — `bun:test` (tests/unit/audio.test.ts) cobre a lógica
 * pura (prioridade, partitura), mas o caminho de criação de contexto,
 * `resume()` e agendamento só se prova aqui, com um gesto de usuário real.
 */
test("responder e alternar o som não lança erro de console (engine real do navegador)", async ({
  page,
}) => {
  const erros: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") erros.push(msg.text());
  });
  page.on("pageerror", (err) => erros.push(String(err)));

  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Responder" }).waitFor();

  // Responde a primeira questão — gesto real, dispara `playFeedbackSound`.
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.locator('[role="status"]').waitFor();

  // Alterna som desligado/ligado — gesto real, exercita `setAudioEnabled` +
  // `stopAllFeedbackSounds` (desligar) e `unlockAudioFromGesture` (ligar).
  const toggleSom = page.getByRole("button", { name: /Desligar som|Ligar som/ });
  await toggleSom.click();
  await toggleSom.click();

  // Fecha a aula (2 questões) pra exercitar `playClosingSound` também.
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.getByRole("button", { name: "Ver resultado" }).click();
  await expect(page.getByText("Fechar por hoje")).toBeVisible();

  expect(erros).toEqual([]);
});

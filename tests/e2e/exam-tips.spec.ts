import { expect, test } from "@playwright/test";
import { avancarAteRecap } from "./helpers/licao";

/**
 * Critério A11 (docs/20 §20, Fase 8): sem perfil escolhido, nenhuma dica
 * aparece; escolhendo ENEM no perfil, a dica aparece inline no recap, sem
 * modal/timer, e dispensar não trava o avanço. Atualizado pro player por
 * passos (docs/25 §18 T-27): "Testar o que aprendi" não existe mais.
 */
test("sem perfil de vestibular escolhido, o recap não mostra nenhuma dica", async ({ page }) => {
  await page.goto("/learn/citologia-membrana", { waitUntil: "domcontentloaded" });
  await avancarAteRecap(page, { acertarIndices: [2, 1, 1, 0, 1] });

  await page.getByRole("button", { name: "Concluir lição" }).waitFor();
  await expect(page.getByText("Dica de prova")).not.toBeVisible();
});

test("escolhendo ENEM no perfil, a dica aparece no recap e dispensar não trava a conclusão", async ({
  page,
}) => {
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "ENEM" }).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "ENEM" }).click();
  await expect(page.getByRole("button", { name: "ENEM" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
  // Gabarito real de `porcentagem-valor` (docs/25 §18 T-13): checkpoint=1,
  // q10 (banco geral, gabarito D)=3, prática-2=2, prática-3=1, desafio=2.
  await avancarAteRecap(page, { acertarIndices: [1, 3, 2, 1, 2] });

  await page.getByRole("button", { name: "Concluir lição" }).waitFor();
  await expect(page.getByText("Dica de prova")).toBeVisible();

  // Dispensar não impede concluir a lição (regra A11: sem timer, sem travar avanço).
  await page.getByRole("button", { name: "Dispensar dica" }).click();
  await expect(page.getByText("Dica de prova")).not.toBeVisible();
  await page.getByRole("button", { name: "Concluir lição" }).click();
  // Título sorteado (`CelebracaoAula.tsx`) — "Você aprendeu" é o marcador estável.
  await expect(page.getByText("Você aprendeu")).toBeVisible();
});

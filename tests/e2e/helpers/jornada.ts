import { expect, type Page } from "@playwright/test";

/**
 * Passos comuns dos E2E da jornada (docs/36 Fase 2). Sem estado próprio: o
 * semeador é `seedOnce` (helpers/estado.ts).
 */

/** Espera a Home da jornada (o cabeçalho "Nível N" da trilha) aparecer. */
export async function esperarHome(page: Page): Promise<void> {
  await page.getByText(/Nível \d/).waitFor({ timeout: 15_000 });
}

/** "Começar" do passo de abertura do player (aula, atividade sintética e checkpoint têm um). */
export async function clicarComecarSeHouver(page: Page, tentativas = 2): Promise<void> {
  for (let i = 0; i < tentativas; i++) {
    const comecar = page.getByRole("button", { name: "Começar" });
    try {
      await comecar.waitFor({ state: "visible", timeout: 8_000 });
    } catch {
      return;
    }
    await comecar.click();
  }
}

/** Responde tudo com "Não sei" (sem punição) até "Concluir lição" — fecha qualquer atividade sintética. */
export async function responderComNaoSeiAteConcluir(page: Page): Promise<void> {
  for (let i = 0; i < 12; i++) {
    const concluir = page.getByRole("button", { name: "Concluir lição" });
    if (await concluir.isVisible().catch(() => false)) {
      await concluir.click();
      return;
    }
    await page.getByRole("button", { name: "Não sei" }).waitFor({ timeout: 15_000 });
    await page.getByRole("button", { name: "Não sei" }).click();
    await page.locator('[role="status"]').waitFor();
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
  }
  throw new Error("lição não concluiu depois de 12 questões — loop de segurança estourou");
}

/** Título de uma atividade planejada, lido do `aria-label` do nó do caminho ("<título> — <estado>"). */
export async function tituloDoNo(page: Page, activityId: string): Promise<string> {
  const label = await page.locator(`[data-path-node="${activityId}"]`).getAttribute("aria-label");
  expect(label, `nó ${activityId} sem aria-label`).toBeTruthy();
  return label!.split(" — ")[0];
}

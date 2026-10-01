import { expect, test } from "@playwright/test";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

/**
 * Sequência com foguinho e proteção visível (spec 48 T-48.6.1, RF-15). Nenhuma regra nova: a tela mostra a R-GAM-3.
 */
function hojeLocal(offsetDias = 0): string {
  const d = new Date(Date.now() + offsetDias * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

test("indicador: fogo, dias, estudo de hoje, proteções, dia protegido e de onde vêm os números", async ({ page }) => {
  await seedOnce(page, {
    ...USUARIO_ONBOARDED,
    prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 },
    progress: {
      ...USUARIO_ONBOARDED.progress,
      streak: 5,
      bestStreak: 5,
      streakFreezes: 1,
      activityDays: [hojeLocal()],
      lastStudyDate: new Date().toDateString(),
      diaProtegido: hojeLocal(-2),
    },
  });
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  const botao = page.getByTestId("indicador-sequencia");
  await expect(botao).toBeVisible({ timeout: 15_000 });
  await expect(botao).toHaveAttribute("aria-label", /Sequência de 5 dias\. Hoje já tem estudo\. 1 proteção guardada/);
  await botao.click();
  const detalhe = page.getByTestId("sequencia-detalhe");
  await expect(detalhe).toContainText("5 dias seguidos");
  await expect(detalhe).toContainText("Hoje já tem estudo.");
  await expect(detalhe).toContainText("Proteções guardadas: 1 de 2");
  await expect(detalhe).toContainText("Uma proteção cobriu o dia");
  await expect(detalhe).toContainText("A cada 7 dias com estudo você ganha uma proteção");
  // Fonte dita com honestidade: com a conta vinculada e sem confirmação do servidor, "atualizando"; sem conta, "neste aparelho".
  const estado = await page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"));
  await expect(page.getByTestId("sequencia-fonte")).toHaveText(estado.account?.userId ? "Atualizando com a sua conta." : "Contado neste aparelho.");
  // Sem culpa, ameaça nem contagem regressiva.
  await expect(detalhe.getByText(/vai perder|não perca|últimas horas|restam \d+ horas/i)).toHaveCount(0);
});

test("depois de uma pausa: acolhe e mostra o recorde como meta", async ({ page }) => {
  await seedOnce(page, {
    ...USUARIO_ONBOARDED,
    prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 },
    progress: { ...USUARIO_ONBOARDED.progress, streak: 1, bestStreak: 9, streakFreezes: 0, activityDays: [hojeLocal()], lastStudyDate: new Date().toDateString() },
  });
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.getByTestId("indicador-sequencia").click();
  await expect(page.getByTestId("sequencia-detalhe")).toContainText("Bom te ver de volta. Seu recorde é de 9 dias");
});

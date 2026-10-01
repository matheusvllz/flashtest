import { expect, test } from "@playwright/test";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

/**
 * Diagnóstico honesto (spec 48 T-48.4.3, RF-12; B-068) e resultado visual do nivelamento (T-48.5.2, RF-14; B-070).
 * Sem nivelamento, nada aparece como medido; com nivelamento, as faixas vêm do que foi medido, com estados
 * distintos por texto e forma.
 */
const PERFIL = { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2, difficultSubjects: ["Matemática", "Física"], easySubjects: ["Português"] };

test("sem nivelamento: nada aparece como medido, o que o aluno disse é rotulado e dá para medir agora", async ({ page }) => {
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: PERFIL });
  await page.goto("/aha", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("diagnostico-corpo")).toContainText("Você pulou o nivelamento");
  await expect(page.getByText(/Lacuna alta|Lacuna média|A confirmar|Severidade|Três lacunas|Já entendi você/)).toHaveCount(0);
  await expect(page.getByTestId("diagnostico-declarado")).toContainText("Mais dificuldade em: Matemática, Física.");
  await expect(page.getByTestId("diagnostico-declarado")).toContainText("Vai bem em: Português.");
  await expect(page.getByText("Isso é o que você disse, não uma medição.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Fazer o nivelamento agora" })).toHaveAttribute("href", /\/nivelamento/);
  await expect(page.getByText("Medido no nivelamento")).toHaveCount(0);
});

test("com nivelamento aplicado: faixas medidas, evidência insuficiente e área não medida são distintas, sem número", async ({ page }) => {
  const area = (theta: number | null, se: number | null, n: number) => ({
    itemIds: Array.from({ length: n }, (_, i) => `item-${i}`),
    responses: [],
    theta,
    se,
    done: true,
  });
  await seedOnce(page, {
    ...USUARIO_ONBOARDED,
    prefs: PERFIL,
    learning: {
      placement: {
        status: "concluido",
        startedAt: "2026-09-30T10:00:00.000Z",
        finishedAt: "2026-09-30T10:10:00.000Z",
        appliedAt: "2026-09-30T10:10:01.000Z",
        appliedVersion: 1,
        seed: "s",
        areas: { MT: area(0.9, 0.4, 6), LC: area(-0.8, 0.9, 2), CN: area(null, null, 0) },
      },
    },
  });
  await page.goto("/aha", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Medido no nivelamento")).toBeVisible();
  await expect(page.getByTestId("placement-legenda")).toBeVisible();
  const cartoes = page.getByTestId("placement-area");
  await expect(cartoes).toHaveCount(3);
  await expect(page.locator('[data-estado="medida"]')).toContainText("Base firme");
  await expect(page.locator('[data-estado="insuficiente"]')).toContainText("(a confirmar)");
  await expect(page.locator('[data-estado="nao-medida"]')).toContainText("Não medida");
  // Leitura por texto (aria-label), nunca só a cor; e nenhuma porcentagem ou θ.
  await expect(page.getByRole("img", { name: /Matemática.*: Base firme\. Estimativa firme\./ })).toBeVisible();
  await expect(page.locator("body").getByText(/\d+\s?%|θ/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Fazer o nivelamento agora" })).toHaveCount(0);
});

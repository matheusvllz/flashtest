import { expect, test } from "@playwright/test";

/**
 * `/trilha` (docs/25 §12.1, §18 T-17/T-18/T-27) — G1 ("onde estudo/progresso/
 * próximo passo acima da dobra") e a persistência de `prefs.trailSubjectId`
 * entre reloads (T-18: "trocar chip persiste... após reload").
 */

/**
 * Estado v3 legado mínimo pra um usuário autenticado e onboardado — mesmo
 * formato de `state-migration.spec.ts` (`V3_LEGADO`), a "fixture autenticada
 * realista" seguida aqui via `page.addInitScript` pra semear o localStorage
 * antes de qualquer script da página rodar.
 */
const USUARIO_AUTENTICADO = JSON.stringify({
  authed: true,
  onboarded: true,
  prefs: { name: "Ana", sound: true, haptics: true, theme: "auto", dailyLessons: 3 },
  progress: { xp: 250, streak: 5, lessonsCompleted: 4, completedQuestions: ["q1", "q2"] },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
});

/**
 * `FEATURES.trilhaComoHome` está `true` (docs/25 §18 T-22) — o splash agora
 * vai pra `/trilha`, não mais pra `/dashboard`. Assertion que ficava marcada
 * "SKIP" enquanto a flag estava desligada (ver histórico do arquivo).
 */
test("splash leva usuário autenticado/onboardado pra /trilha (T-22)", async ({ page }) => {
  await page.addInitScript((v3) => {
    localStorage.setItem("foca.state.v3", v3);
  }, USUARIO_AUTENTICADO);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/trilha", { timeout: 5000 });
  await expect(page).not.toHaveURL(/welcome/);
});

test("header com meta, card de continuar e persistência da matéria selecionada", async ({ page }) => {
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });

  // (a) Header com "onde estou": nível e streak, acima da dobra (G1).
  await page.getByText(/Nível \d/).waitFor({ timeout: 15000 });
  await expect(page.getByText(/\d+ dias?$/).first()).toBeVisible();

  // (b) Card "Continuar" aponta pra `porcentagem-valor` — 1ª vez (nenhuma
  // lição concluída no storage limpo deste teste), então o rótulo pequeno é
  // "Começar por aqui" (`ContinueCard.tsx`), mas o CTA em si sempre diz
  // "Continuar" (`COPY.trilha.continuar`, o único `btn-primary` do
  // viewport — G2).
  await expect(page.getByText("Começar por aqui")).toBeVisible();
  // `getByText` sozinho bateria em 3 elementos (título do card, texto da
  // explicação da recomendação E o nó "O que é porcentagem" na trilha logo
  // abaixo) — o `<h2>` do card é o único título de verdade.
  await expect(page.getByRole("heading", { name: "O que é porcentagem" })).toBeVisible();
  // `exact: true` — sem isso bate também no nó "O que é porcentagem" da
  // trilha logo abaixo, cujo `aria-label` CONTÉM a palavra "Continuar"
  // ("... — Continuar daqui").
  const cta = page.getByRole("link", { name: "Continuar", exact: true });
  await expect(cta).toHaveAttribute("href", "/learn/porcentagem-valor");
  await expect(cta).toBeInViewport();

  // (c) Trocar de matéria persiste no reload (`setTrailSubject` ->
  // `prefs.trailSubjectId`, docs/25 §18 T-18).
  const chipBiologia = page.getByRole("button", { name: /^Biologia/ });
  await chipBiologia.click();
  await expect(chipBiologia).toHaveAttribute("aria-pressed", "true");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: /^Biologia/ })).toHaveAttribute("aria-pressed", "true", {
    timeout: 15000,
  });
});

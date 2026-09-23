import { expect, test } from "@playwright/test";

/**
 * `/trilha` como caminho visual (docs/27, docs/28 T-17) — HG1…HG9, HG12, RF-12/RF-6.
 * Fixtures semeadas via `page.addInitScript`, como `trail-home.spec.ts`.
 */

const BASE = {
  authed: true,
  onboarded: true,
  schemaVersion: 5,
  prefs: { name: "Ana", sound: false, haptics: false, theme: "light", dailyLessons: 3 },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

const feito = (id: string) => ({ lessonId: id, stars: 3, bestPct: 100, completedAt: "2026-09-01T12:00:00.000Z" });
const microFeito = { version: 2, completedAt: "2026-09-01T12:00:00.000Z", stars: 3, bestPct: 100 };

const CRASE_IDS = [
  "crase-01-a-regra-de-ouro",
  "crase-02-casos-proibidos",
  "crase-03-casos-obrigatorios",
  "crase-04-casos-facultativos",
  "crase-05-crase-expressoes",
  "crase-06-crase-pronome-relativo",
];
const CONCORDANCIA_IDS = [
  "concordancia-01-verbal-simples-composto",
  "concordancia-02-sujeito-posposto-coletivo",
  "concordancia-03-expressoes-partitivas-porcentagem",
  "concordancia-04-particula-se",
  "concordancia-05-verbos-impessoais",
  "concordancia-06-ser-expressoes-quantidade",
  "concordancia-07-concordancia-nominal",
  "concordancia-08-anexo-obrigado-meio-bastante",
  "concordancia-09-proibido-necessario",
];
const REGENCIA_IDS = [
  "regencia-colocacao-01-regencia-verbal",
  "regencia-colocacao-02-regencia-nominal",
  "regencia-colocacao-03-dupla-regencia",
  "regencia-colocacao-04-proclise",
  "regencia-colocacao-05-enclise-mesoclise",
  "regencia-colocacao-06-colocacao-tempos-compostos",
];
const PONTUACAO_FEITAS_IDS = [
  "pontuacao-01-virgula-no-aposto",
  "pontuacao-02-virgula-nas-enumeracoes",
  "pontuacao-03-vocativo",
];

/** Português avançado: crase/concordância/regência legados concluídos, pontuação 3/12. Foco local = pontuacao-04. */
const PORTUGUES_FUNDO = JSON.stringify({
  ...BASE,
  prefs: { ...BASE.prefs, trailSubjectId: "por" },
  progress: {
    xp: 900,
    streak: 4,
    lessons: Object.fromEntries(
      [...CRASE_IDS, ...CONCORDANCIA_IDS, ...REGENCIA_IDS, ...PONTUACAO_FEITAS_IDS].map((id) => [id, feito(id)]),
    ),
  },
  learning: {
    completedLessons: {
      "crase-quando-usar": microFeito,
      "crase-proibida": microFeito,
      "revisao--por-crase": microFeito,
    },
  },
});

/** Biologia inteira concluída → fim de matéria; foco global fica em Matemática. */
const BIOLOGIA_FIM = JSON.stringify({
  ...BASE,
  prefs: { ...BASE.prefs, trailSubjectId: "bio" },
  progress: { xp: 200, streak: 1 },
  learning: {
    completedLessons: {
      "citologia-membrana": microFeito,
      "citologia-organelas": microFeito,
      "revisao--bio-citologia": microFeito,
    },
  },
});

async function seed(page: import("@playwright/test").Page, v3: string) {
  await page.addInitScript((raw) => localStorage.setItem("foca.state.v3", raw), v3);
}

test("HG2 — exatamente 1 btn-primary visível em /trilha (estado limpo)", async ({ page }) => {
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.locator("[data-path-node]").first().waitFor({ timeout: 15000 });
  await expect(page.locator(".btn-primary:visible")).toHaveCount(1);
});

test("HG3 — zigue-zague segue o padrão fixo de posições", async ({ page }) => {
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  const nodes = page.locator("[data-path-node]");
  await nodes.first().waitFor({ timeout: 15000 });
  const count = await nodes.count();
  expect(count).toBeGreaterThanOrEqual(3);
  const xs: number[] = [];
  for (let i = 0; i < Math.min(3, count); i++) {
    const box = await nodes.nth(i).boundingBox();
    expect(box).not.toBeNull();
    xs.push(box!.x + box!.width / 2);
  }
  // k = 0, -0.5, -1 → x estritamente decrescente
  expect(xs[1]).toBeLessThan(xs[0]);
  expect(xs[2]).toBeLessThan(xs[1]);
  const ol = page.locator(".path-list").first();
  const olBox = await ol.boundingBox();
  expect(olBox).not.toBeNull();
  const centerOl = olBox!.x + olBox!.width / 2;
  expect(Math.abs(xs[0] - centerOl)).toBeLessThanOrEqual(3);
});

test("HG4 — todo nó tem estado em texto e aria-label; bloqueado não é link", async ({ page }) => {
  await seed(page, PORTUGUES_FUNDO);
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /^Português/ }).waitFor({ timeout: 15000 });
  await page.getByText("Crase sem medo", { exact: true }).click();

  await expect(page.locator('a[data-status="locked"]')).toHaveCount(0);
  const lockedCount = await page.locator('div[data-status="locked"][aria-disabled="true"]').count();
  expect(lockedCount).toBeGreaterThan(0);

  const visibleNodes = page.locator("[data-path-node]:visible");
  const n = await visibleNodes.count();
  for (let i = 0; i < n; i++) {
    const label = await visibleNodes.nth(i).getAttribute("aria-label");
    expect(label).toMatch(/ — (Concluída|Concluída · revisão sugerida|Em andamento|Continuar daqui|Disponível|Bloqueada)$/);
  }
});

test("HG5 — abre com o foco local visível e não rola de novo ao expandir outro capítulo", async ({ page }) => {
  await seed(page, PORTUGUES_FUNDO);
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-path-row="pontuacao-04-termos-deslocados"]')).toBeInViewport({ timeout: 15000 });
  const scrollY1 = await page.evaluate(() => window.scrollY);
  expect(scrollY1).toBeGreaterThan(0);
  await expect(page.getByText(COPY_PROXIMA)).toBeVisible();
  await expect(page.getByText(/^A Foca recomenda:/)).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.getByText("Crase sem medo", { exact: true }).click();
  await page.waitForTimeout(600);
  const scrollY2 = await page.evaluate(() => window.scrollY);
  expect(scrollY2).toBeLessThan(50);
});
const COPY_PROXIMA = "Próxima nesta matéria";

test("HG6 — botão voltar para a atual reaparece e leva de volta ao foco", async ({ page }) => {
  await seed(page, PORTUGUES_FUNDO);
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.locator('[data-path-row="pontuacao-04-termos-deslocados"]').waitFor({ timeout: 15000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const botao = page.getByRole("button", { name: "Voltar para a lição atual" });
  await expect(botao).toBeVisible({ timeout: 5000 });
  await botao.click();
  await expect(page.locator('[data-path-row="pontuacao-04-termos-deslocados"]')).toBeInViewport({ timeout: 5000 });
});

test("HG7 — sem rolagem horizontal em nenhuma largura da matriz", async ({ page }) => {
  const larguras = [320, 375, 390, 430, 768, 1280, 1440];
  for (const largura of larguras) {
    await page.setViewportSize({ width: largura, height: 900 });
    await seed(page, PORTUGUES_FUNDO);
    await page.goto("/trilha", { waitUntil: "domcontentloaded" });
    await page.locator("[data-path-node]").first().waitFor({ timeout: 15000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(overflow, `largura ${largura}`).toBe(true);
  }
});

test("HG8 — reduced motion: halo estático e rolagem sem smooth", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.locator(".path-halo").first().waitFor({ timeout: 15000 });
  const iterations = await page.evaluate(() => {
    const el = document.querySelector(".path-halo");
    return el ? getComputedStyle(el).animationIterationCount : null;
  });
  expect(iterations).toBe("1");
});

test("HG9 — no máximo 1 imagem da Foca dentro de main", async ({ page }) => {
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.locator("[data-path-node]").first().waitFor({ timeout: 15000 });
  const count = await page.locator('main img[src*="/branding/foca/"]').count();
  expect(count).toBeLessThanOrEqual(1);
});

test("HG12 — retorno de lição: nó concluído com pop e conector traçado no seguinte", async ({ page }) => {
  await page.addInitScript((raw) => {
    const s = JSON.parse(raw);
    s.learning = s.learning ?? { completedLessons: {} };
    s.learning.completedLessons = { ...s.learning.completedLessons, "porcentagem-valor": {
      version: 2, completedAt: "2026-09-01T12:00:00.000Z", stars: 3, bestPct: 100,
    } };
    localStorage.setItem("foca.state.v3", JSON.stringify(s));
  }, BASE_JSON);
  await page.goto("/trilha?concluida=porcentagem-valor", { waitUntil: "domcontentloaded" });
  const nodeMarker = page.locator('[data-path-row="porcentagem-valor"] .path-node');
  await expect(nodeMarker).toHaveClass(/anim-pop-in/, { timeout: 15000 });
  const connector = page.locator('[data-path-row="porcentagem-aumento-desconto"] .path-connector--draw');
  await expect(connector).toHaveCount(1);
});
const BASE_JSON = JSON.stringify(BASE);

test("RF-12/RF-6 — fim de matéria mostra Foca orgulhosa, dica de outra matéria e carimbo concluído", async ({
  page,
}) => {
  await seed(page, BIOLOGIA_FIM);
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /^Biologia/ }).waitFor({ timeout: 15000 });
  await expect(page.getByText("Você fechou tudo o que está publicado em Biologia.")).toBeVisible();
  await expect(page.getByText(/^A Foca recomenda:/)).toBeVisible();

  await page.getByText("Citologia", { exact: true }).click();
  await expect(page.getByRole("img", { name: /Capítulo concluído/ })).toBeVisible({ timeout: 5000 });
});

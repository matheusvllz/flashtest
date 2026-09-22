import type { Locator, Page } from "@playwright/test";

/**
 * Helper E2E de T-27 (docs/25 §18) — percorre o player universal de lição
 * (`MicroLessonPlayer`/`useLearningSession`) passo a passo, sem assumir a
 * forma de nenhuma lição específica: funciona pra v1 e v2, piloto ou revisão
 * de capítulo. Substitui a cópia manual do mesmo loop que `microlicoes.spec.ts`/
 * `exam-tips.spec.ts`/`trilha.spec.ts` faziam contra o texto antigo ("Testar
 * o que aprendi"), hoje trocado por "Começar"/"Continuar"/"Verificar"/
 * "Concluir lição" (`COPY.licao.*`).
 */

const STEP_TIMEOUT = 15_000;

type PassoVisivel = "comecar" | "verificar" | "continuar" | "concluir";

/** Primeiro dos quatro botões terminais a aparecer — nunca mais de um por vez, porque o player só mostra um passo. */
async function primeiroPassoVisivel(page: Page): Promise<{ passo: PassoVisivel; locator: Locator }> {
  const candidatos: { passo: PassoVisivel; locator: Locator }[] = [
    { passo: "concluir", locator: page.getByRole("button", { name: "Concluir lição" }) },
    { passo: "verificar", locator: page.getByRole("button", { name: "Verificar" }) },
    { passo: "comecar", locator: page.getByRole("button", { name: "Começar" }) },
    { passo: "continuar", locator: page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }) },
  ];
  const passo = await Promise.any(
    candidatos.map(async (c) => {
      await c.locator.waitFor({ state: "visible", timeout: STEP_TIMEOUT });
      return c.passo;
    }),
  );
  return candidatos.find((c) => c.passo === passo)!;
}

async function percorrerPassos(
  page: Page,
  opts: { acertarIndices?: number[]; pararNoRecap?: boolean },
): Promise<void> {
  let questionCount = 0;
  // Guarda contra loop infinito — nenhuma lição do catálogo hoje passa de ~15 passos.
  for (let i = 0; i < 60; i++) {
    const { passo, locator } = await primeiroPassoVisivel(page);

    if (passo === "concluir") {
      if (opts.pararNoRecap) return;
      await locator.click();
      return;
    }

    if (passo === "verificar") {
      const radios = page.locator('[role="radio"]');
      const indice = opts.acertarIndices?.[questionCount];
      await (indice !== undefined ? radios.nth(indice) : radios.first()).click();
      questionCount++;
      await locator.click();
      await page.locator('[role="status"]').waitFor({ timeout: STEP_TIMEOUT });
      await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
      continue;
    }

    // "comecar" (intro) ou "continuar" (teach/tip) — só avança.
    await locator.click();
  }
  throw new Error("percorrerLicao: nenhum passo terminal (Concluir lição) em 60 iterações");
}

/**
 * Percorre a lição inteira, do intro até clicar "Concluir lição". Sem
 * `opts.acertarIndices`, clica sempre o primeiro `[role="radio"]` — serve
 * pra testes que só precisam terminar a lição, não pro gabarito exato. Com
 * `acertarIndices`, usa `acertarIndices[n]` (índice do radio) pra a n-ésima
 * questão respondida, na ORDEM em que aparecem (contando o checkpoint).
 */
export async function percorrerLicao(page: Page, opts?: { acertarIndices?: number[] }): Promise<void> {
  await percorrerPassos(page, { acertarIndices: opts?.acertarIndices });
}

/**
 * Mesmo percurso, mas para ANTES de clicar "Concluir lição" — devolve o
 * controle assim que o recap fica visível, pra o teste inspecionar a tela
 * (ex.: dica de prova em `exam-tips.spec.ts`) antes de fechar a lição.
 */
export async function avancarAteRecap(page: Page, opts?: { acertarIndices?: number[] }): Promise<void> {
  await percorrerPassos(page, { acertarIndices: opts?.acertarIndices, pararNoRecap: true });
}

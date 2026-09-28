import { expect, test } from "@playwright/test";

/**
 * Onboarding progressivo (docs/30 §12.2, Fase 13 do docs/31 F13.1/F13.2) — 9
 * passos (`name`/`level`/`exam`/`state`/`target`/`course`/`subjects`/`time`/
 * `focus`) agrupados em 3 blocos ("Você"/"Sua prova"/"Seu ritmo"), sem
 * conteúdo/pool nenhum envolvido — totalmente testável ponta a ponta, ao
 * contrário do nivelamento em si (ver `placement.spec.ts`).
 */

async function ligarNivelamento(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("foca.flags", JSON.stringify({ nivelamento: true }));
  });
}

/** `nivelamento` é `true` em `BASE_FEATURES` desde a F15.1 (docs/32) — testar o
 * fluxo "flag desligada" (sem oferta de nivelamento, direto pro `/aha`) agora
 * precisa do override explícito. */
async function desligarNivelamento(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("foca.flags", JSON.stringify({ nivelamento: false }));
  });
}

async function preencherAte(page: import("@playwright/test").Page, ateSubjects: boolean) {
  await page.goto("/quiz?debug=1", { waitUntil: "domcontentloaded" });

  // name
  await page.getByPlaceholder("Seu primeiro nome").fill("Ana");
  await page.getByRole("button", { name: "Continuar" }).click();

  // level
  await page.getByText("1º ano do ensino médio").click();

  // exam (novo — F13.1)
  await expect(page.getByText("Qual prova você está estudando pra fazer?")).toBeVisible();
  await page.getByRole("button", { name: "ENEM", exact: true }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // state
  await page.locator("select").selectOption("SP");
  await page.getByRole("button", { name: "Continuar" }).click();

  // target
  await page.getByRole("button", { name: "Ainda não decidi" }).click();

  // course
  await page.getByRole("button", { name: "Ainda não decidi" }).click();

  if (!ateSubjects) return;

  // subjects
  await page.getByRole("button", { name: "Matemática" }).click();
}

test("percorre os 9 passos em 320px e chega no diagnóstico (flag desligada = fluxo atual)", async ({
  page,
}) => {
  await desligarNivelamento(page);
  await page.setViewportSize({ width: 320, height: 700 });
  await preencherAte(page, true);
  await page.getByRole("button", { name: "Continuar" }).click();

  // time (novo — F13.1)
  await expect(page.getByText("Quanto tempo por dia você consegue estudar?")).toBeVisible();
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // focus (novo — F13.1)
  await expect(page.getByText("Quer focar em alguma matéria?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Todas as matérias" })).toBeVisible();

  const semRolagem = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(semRolagem).toBe(true);

  await page.getByRole("button", { name: "Ver meu diagnóstico" }).click();
  await page.waitForURL(/\/aha/, { timeout: 15000 });
});

test("seção 'Alguma você já manda bem?' fica recolhida até o aluno abrir (docs/30 §12.2)", async ({
  page,
}) => {
  await preencherAte(page, true);
  await page.getByRole("button", { name: "Continuar" }).click(); // subjects -> time

  // "← Voltar" é o controle DO APP (o passo não tem URL própria, é um
  // índice local — `page.goBack()` sairia do `/quiz` inteiro, achado real
  // ao escrever este teste).
  await page.getByRole("button", { name: "← Voltar" }).click(); // time -> subjects
  await expect(page.getByRole("button", { name: "Alguma você já manda bem?" })).toBeVisible();
  await page.getByRole("button", { name: "Alguma você já manda bem?" }).click();
  // "Português" aparece 2x na tela agora (matérias difíceis + fáceis) — a 2ª é a nova seção.
  await expect(page.getByRole("button", { name: "Português" })).toHaveCount(2);
});

test("com a flag 'nivelamento' ligada, o último passo oferece o nivelamento (F13.2)", async ({
  page,
}) => {
  await ligarNivelamento(page);
  await preencherAte(page, true);
  await page.getByRole("button", { name: "Continuar" }).click(); // subjects -> time
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Continuar" }).click(); // time -> focus
  await page.getByRole("button", { name: "Ver meu diagnóstico" }).click();

  await expect(page.getByText("Quer começar no seu nível?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Fazer o nivelamento" })).toBeVisible();

  await page.getByRole("button", { name: "Começar sem nivelamento" }).click();
  await page.waitForURL(/\/aha/, { timeout: 15000 });
});

test("oferta ligada, 'Fazer o nivelamento' vai pra /nivelamento e já fechou o quiz", async ({
  page,
}) => {
  await ligarNivelamento(page);
  await preencherAte(page, true);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Ver meu diagnóstico" }).click();
  await page.getByRole("button", { name: "Fazer o nivelamento" }).click();
  await page.waitForURL(/\/nivelamento/, { timeout: 15000 });

  const estado = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"),
  );
  expect(estado.onboarded).toBe(true); // completeQuiz já rodou antes de navegar
});

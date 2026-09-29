import { expect, test, type Page } from "@playwright/test";
import { alvosPequenos, formatarAlvos } from "./helpers/alvos";
import { lerEstado, seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

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

/** Preenche o quiz até o passo "course" (sem escolher curso). */
async function chegarNoCurso(page: Page) {
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

}

async function preencherAte(page: import("@playwright/test").Page, ateSubjects: boolean) {
  await chegarNoCurso(page);

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

/* ----------------------------------------------------------------------------
 * Seleção de curso (docs/36 §F.7, T-09.2/T-09.3, RU-40, RA-5, G-19).
 * Falha que detecta: lista com viés para o primeiro grupo, busca sensível a acento,
 * curso fora do catálogo sem saída, Enter que não seleciona, valor legado perdido.
 * ------------------------------------------------------------------------- */

const resultados = (page: Page) => page.locator("button.card-press");

test.describe("passo 'Curso' (RU-40)", () => {
  test("sem busca: 13 áreas, nenhuma lista e a dica; tocar 'Saúde' lista 13 cursos", async ({ page }) => {
    await chegarNoCurso(page);
    await expect(page.getByText("Qual curso você quer?")).toBeVisible();
    const areas = page.getByRole("group", { name: "Áreas" }).getByRole("button");
    await expect(areas).toHaveCount(13);
    for (const nome of ["Saúde", "Engenharias", "Computação e Tecnologia", "Arquitetura e Design"]) {
      await expect(page.getByRole("button", { name: nome, exact: true })).toHaveAttribute("aria-pressed", "false");
    }
    await expect(resultados(page)).toHaveCount(0);
    await expect(page.getByText("Escolha uma área ou busque pelo nome.")).toBeVisible();

    const saude = page.getByRole("button", { name: "Saúde", exact: true });
    await saude.click();
    await expect(saude).toHaveAttribute("aria-pressed", "true");
    await expect(resultados(page)).toHaveCount(13);
    await expect(page.locator("[aria-live=polite]").filter({ hasText: "13 cursos" })).toBeVisible();
    await expect(page.getByText("Escolha uma área ou busque pelo nome.")).toHaveCount(0);

    // Tocar de novo na mesma área desmarca e volta ao estado sem viés.
    await saude.click();
    await expect(saude).toHaveAttribute("aria-pressed", "false");
    await expect(resultados(page)).toHaveCount(0);
  });

  test("escolher um curso de uma área grava o nome literal e avança", async ({ page }) => {
    await chegarNoCurso(page);
    await page.getByRole("button", { name: "Engenharias", exact: true }).click();
    await resultados(page).filter({ hasText: "Engenharia de Software" }).click();
    await expect(page.getByText("O que mais te trava hoje?")).toBeVisible();
    expect((await lerEstado(page)).prefs.targetCourse).toBe("Engenharia de Software");
  });

  test("busca 'psico' acha Psicologia, com rótulo 'Curso' e contagem anunciada; selecionar grava e avança", async ({ page }) => {
    await chegarNoCurso(page);
    const campo = page.getByLabel("Curso", { exact: true });
    await expect(campo).toBeVisible();
    await campo.fill("psico");
    await expect(resultados(page)).toHaveCount(1);
    await expect(page.locator("[aria-live=polite]").filter({ hasText: "1 curso" })).toBeVisible();
    await page.getByRole("button", { name: /^Psicologia/ }).click();
    await expect(page.getByText("O que mais te trava hoje?")).toBeVisible();
    expect((await lerEstado(page)).prefs.targetCourse).toBe("Psicologia");
  });

  test("busca sem acento, com sinônimo e em maiúsculas", async ({ page }) => {
    await chegarNoCurso(page);
    const campo = page.getByLabel("Curso", { exact: true });
    await campo.fill("computacao");
    await expect(resultados(page)).toHaveCount(2);
    await expect(resultados(page).first()).toContainText("Ciência da Computação");
    await campo.fill("ADS");
    await expect(resultados(page).first()).toContainText("Análise e Desenvolvimento de Sistemas");
    await campo.fill("VET");
    await expect(resultados(page).first()).toContainText("Veterinária");
  });

  test("texto inexistente: 'Não achei esse curso.' e 'Usar “…”' grava o texto", async ({ page }) => {
    await chegarNoCurso(page);
    await page.getByLabel("Curso", { exact: true }).fill("  Zoologia marinha  ");
    await expect(page.getByText("Não achei esse curso.")).toBeVisible();
    await expect(resultados(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Usar “Zoologia marinha”" }).click();
    await expect(page.getByText("O que mais te trava hoje?")).toBeVisible();
    expect((await lerEstado(page)).prefs.targetCourse).toBe("Zoologia marinha");
  });

  test("teclado: Tab até o campo, digitar e Enter com 1 resultado seleciona", async ({ page }) => {
    await chegarNoCurso(page);
    const campo = page.getByLabel("Curso", { exact: true });
    for (let i = 0; i < 6 && !(await campo.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(campo).toBeFocused();
    await page.keyboard.type("psico");
    await expect(resultados(page)).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(page.getByText("O que mais te trava hoje?")).toBeVisible();
    expect((await lerEstado(page)).prefs.targetCourse).toBe("Psicologia");
  });

  test("Enter com mais de 1 resultado não seleciona nada", async ({ page }) => {
    await chegarNoCurso(page);
    await page.getByLabel("Curso", { exact: true }).fill("engenharia");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Qual curso você quer?")).toBeVisible();
    expect((await lerEstado(page)).prefs.targetCourse ?? "").toBe("");
  });

  test("'Ainda não decidi' continua gravando o valor literal", async ({ page }) => {
    await chegarNoCurso(page);
    await page.getByRole("button", { name: "Ainda não decidi" }).click();
    await expect(page.getByText("O que mais te trava hoje?")).toBeVisible();
    expect((await lerEstado(page)).prefs.targetCourse).toBe("Ainda não decidi");
  });

  test("320 px: sem rolagem horizontal e alvos ≥ 44 px, com área aberta e com busca", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await chegarNoCurso(page);
    await page.getByRole("button", { name: "Sociais Aplicadas e Direito", exact: true }).click();
    await expect(resultados(page).first()).toBeVisible();
    const semRolagem = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(await semRolagem()).toBe(true);
    let pequenos = await alvosPequenos(page);
    expect(pequenos, formatarAlvos(pequenos)).toEqual([]);

    await page
      .getByLabel("Curso", { exact: true })
      .fill("Um nome de curso muito comprido que não existe no catálogo de jeito nenhum");
    await expect(page.getByText("Não achei esse curso.")).toBeVisible();
    expect(await semRolagem()).toBe(true);
    pequenos = await alvosPequenos(page);
    expect(pequenos, formatarAlvos(pequenos)).toEqual([]);
  });
});

/* T-09.3 — editar depois, no Perfil (BottomSheet com o mesmo componente). */
test.describe("Perfil: curso pretendido (T-09.3)", () => {
  test("Mudar abre a folha, escolher fecha, e o valor novo sobrevive ao reload", async ({ page }) => {
    await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, targetCourse: "Direito" } });
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Curso pretendido:")).toContainText("Direito");

    await page.getByRole("button", { name: "Mudar", exact: true }).click();
    const folha = page.getByRole("dialog", { name: "Curso pretendido" });
    await expect(folha).toBeVisible();
    await expect(folha.getByText("Escolhido: Direito")).toBeVisible();
    await folha.getByLabel("Curso", { exact: true }).fill("odonto");
    await folha.getByRole("button", { name: /^Odontologia/ }).click();
    await expect(folha).toHaveCount(0);
    await expect(page.getByText("Curso pretendido:")).toContainText("Odontologia");
    expect((await lerEstado(page)).prefs.targetCourse).toBe("Odontologia");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Curso pretendido:")).toContainText("Odontologia");
  });

  test("valor legado fora do catálogo aparece como está e a busca abre vazia", async ({ page }) => {
    await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, targetCourse: "Engenharia Espacial" } });
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Curso pretendido:")).toContainText("Engenharia Espacial");
    await page.getByRole("button", { name: "Mudar", exact: true }).click();
    const folha = page.getByRole("dialog", { name: "Curso pretendido" });
    await expect(folha.getByText("Escolhido: Engenharia Espacial")).toBeVisible();
    await expect(folha.getByLabel("Curso", { exact: true })).toHaveValue("");
    await expect(folha.locator("button.card-press")).toHaveCount(0);
    // Fechar sem escolher não mexe no valor salvo.
    await page.keyboard.press("Escape");
    await expect(folha).toHaveCount(0);
    expect((await lerEstado(page)).prefs.targetCourse).toBe("Engenharia Espacial");
  });

  test("'Ainda não decidi' também é oferecido no Perfil e grava o literal", async ({ page }) => {
    await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, targetCourse: "Direito" } });
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Mudar", exact: true }).click();
    await page.getByRole("dialog", { name: "Curso pretendido" }).getByRole("button", { name: "Ainda não decidi" }).click();
    expect((await lerEstado(page)).prefs.targetCourse).toBe("Ainda não decidi");
  });
});

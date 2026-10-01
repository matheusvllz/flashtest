import { expect, test, type Page } from "@playwright/test";
import {
  comAtividades,
  definirFlags,
  lerEstado,
  seedOnce,
  USUARIO_ONBOARDED,
  type ActivityKindSeed,
  type EstadoSeed,
} from "./helpers/estado";
import { clicarComecarSeHouver, esperarHome, responderComNaoSeiAteConcluir, tituloDoNo } from "./helpers/jornada";
import { percorrerLicao } from "./helpers/licao";

/**
 * Início, conclusão e reposição da jornada pela Home (docs/36 §F.2 RF-1…RF-8,
 * bugs B2/C2/C4 — S1). Estes testes eram os vermelhos intencionais da T-01.5
 * (`test.fail`); a T-02.1 os destravou. Cada teste cita o requisito e o bug que
 * detecta.
 *
 * Reproduzido em 28/09/2026 (docs/36 §D B2.1): com `committed[0]` de prática, o
 * card E o nó atual levavam a `/atividade/atv-test-pratica`, mas o clique só
 * gravava `activeActivity` SEM `itemIds` e a rota caía no ramo "retomada" com
 * zero itens — a URL voltava a `/trilha` e nenhum radio aparecia.
 *
 * `seedOnce` (helpers/estado.ts): o storage NÃO é resemeado a cada navegação.
 * Fixtures com habilidades REAIS do catálogo (registradas no docs/37): a prática
 * padrão é `mat:porcentagem-conceito`; o caso "sem questões" usa uma habilidade
 * que não existe no catálogo (`mat:sem-itens-e2e`) porque, com os pacotes
 * carregados, NENHUMA habilidade ativa fica com < 2 itens.
 */

const PRATICA_x3 = () => comAtividades(["pratica", "pratica", "pratica"]);

async function abrirHome(page: Page, estado: EstadoSeed = PRATICA_x3()) {
  await definirFlags(page, { jornadaAdaptativa: true });
  await seedOnce(page, estado);
  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  await esperarHome(page);
}

/** Depois do clique: a rota `/atividade/…` fica, "Começar" (abertura do player) e a 1ª questão aparece em até 10 s. */
async function esperarPrimeiraQuestao(page: Page, id = "atv-test-pratica") {
  await expect(page).toHaveURL(new RegExp(`/atividade/${id}`), { timeout: 10_000 });
  await clicarComecarSeHouver(page, 1);
  await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });

  // Estado, não só UI (docs/36 T-02.1, aceitação): itens escolhidos e início gravados.
  const estado = await lerEstado(page);
  const ativa = estado.learning.journey.activeActivity;
  expect(ativa?.id).toBe(id);
  expect(ativa?.itemIds?.length ?? 0).toBeGreaterThanOrEqual(2);
  expect(ativa?.startedAt).toBeTruthy();
  return ativa as { itemIds: string[]; startedAt: string };
}

test.describe("RF-1/RF-2 — atividade dinâmica abre pelo card e pelo nó (docs/36 T-02.1)", () => {
  test("CTA do card 'Sessão de hoje' abre a prática comprometida", async ({ page }) => {
    await abrirHome(page);
    await page.locator("a.btn-primary").first().click();
    await esperarPrimeiraQuestao(page);
  });

  test("nó atual do caminho abre a prática comprometida", async ({ page }) => {
    await abrirHome(page);
    await page.locator('[data-path-node="atv-test-pratica"]').click();
    await esperarPrimeiraQuestao(page);
  });

  test("RF-2: recarregar no meio da atividade mantém os MESMOS itemIds e o mesmo startedAt", async ({ page }) => {
    await abrirHome(page);
    await page.locator("a.btn-primary").first().click();
    const antes = await esperarPrimeiraQuestao(page);

    // Responde a 1ª e avança pra 2ª questão (o "meio" da atividade).
    await page.getByRole("button", { name: "Não sei" }).click();
    await page.locator('[role="status"]').waitFor();
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();

    await page.reload({ waitUntil: "domcontentloaded" });
    await clicarComecarSeHouver(page, 1);
    await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
    const depois = (await lerEstado(page)).learning.journey.activeActivity;
    expect(depois.itemIds).toEqual(antes.itemIds);
    expect(depois.startedAt).toBe(antes.startedAt);
  });

  test("retomada (spec 48 T-48.8.1): recarregar depois de confirmar uma resposta volta na questão seguinte, sem duplicar a resposta", async ({ page }) => {
    await abrirHome(page);
    await page.locator("a.btn-primary").first().click();
    await esperarPrimeiraQuestao(page);
    await page.getByRole("button", { name: "Não sei" }).click();
    await page.locator('[role="status"]').waitFor();
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
    await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
    const antes = await lerEstado(page);
    const passo = antes.learning.activeSession.stepIndex as number;
    const respostas = antes.learning.recentAttempts.length as number;

    await page.reload({ waitUntil: "domcontentloaded" });
    await clicarComecarSeHouver(page, 1);
    await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
    const depois = await lerEstado(page);
    expect(depois.learning.activeSession.stepIndex).toBe(passo);
    expect(depois.learning.activeSession.answers).toEqual(antes.learning.activeSession.answers);
    expect(depois.learning.recentAttempts.length).toBe(respostas);
  });

  test("entrar 2x pelo card não troca os itens nem reescreve startedAt (RF-2)", async ({ page }) => {
    await abrirHome(page);
    await page.locator("a.btn-primary").first().click();
    const primeira = await esperarPrimeiraQuestao(page);
    await page.goBack();
    await esperarHome(page);
    await page.locator("a.btn-primary").first().click();
    await clicarComecarSeHouver(page, 1);
    await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
    const segunda = (await lerEstado(page)).learning.journey.activeActivity;
    expect(segunda.itemIds).toEqual(primeira.itemIds);
    expect(segunda.startedAt).toBe(primeira.startedAt);
  });
});

test.describe("RF-3 — atividade sem questões é descartada, nunca em loop (docs/36 T-02.2)", () => {
  test("pool vazio: aviso RU-1, próxima atividade, sem histórico/XP e sem repetir a descartada", async ({ page }) => {
    const estado = comAtividades(["pratica", "pratica", "pratica"], { 0: { skillIds: ["mat:sem-itens-e2e"] } });
    await abrirHome(page, estado);
    const xpAntes = (await lerEstado(page)).progress.xp;

    await page.locator("a.btn-primary").first().click();
    await expect(page.getByText("Essa atividade ficou sem questões agora. Segui com a próxima.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page).toHaveURL(/\/trilha/);

    const depois = await lerEstado(page);
    expect(depois.learning.journey.committed[0].id).toBe("atv-test-pratica-2");
    expect(depois.learning.journey.committed.map((a: { id: string }) => a.id)).not.toContain("atv-test-pratica");
    expect(depois.learning.journey.history).toHaveLength(0);
    expect(depois.progress.xp).toBe(xpAntes);
    expect(depois.learning.journey.activeActivity).toBeNull();
    expect(
      depois.learning.events.filter((e: { type: string; meta?: { reason?: string } }) => e.type === "activity-skipped"),
    ).toHaveLength(1);

    // Tocar de novo abre a PRÓXIMA (a descartada não volta).
    await page.locator("a.btn-primary").first().click();
    await expect(page).toHaveURL(/\/atividade\/atv-test-pratica-2/, { timeout: 10_000 });
  });
});

test.describe("RU-3 — pacote indisponível: erro com 'Tentar de novo', nunca descarta (docs/36 T-02.2)", () => {
  test("rede bloqueada mostra o erro; liberar a rede e tentar de novo abre a questão", async ({ page }) => {
    await abrirHome(page);
    await page.route("**/content/v1/**", (rota) => rota.abort());
    await page.locator("a.btn-primary").first().click();

    await expect(page.getByRole("heading", { name: "Não deu pra carregar agora." })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Confere a internet e tenta de novo.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Voltar à trilha" })).toBeVisible();

    // Não descartou: a atividade continua na fila e nada foi pago.
    const meio = await lerEstado(page);
    expect(meio.learning.journey.committed[0].id).toBe("atv-test-pratica");
    expect(meio.learning.journey.history).toHaveLength(0);

    await page.unroute("**/content/v1/**");
    await page.getByRole("button", { name: "Tentar de novo" }).click();
    await clicarComecarSeHouver(page, 1);
    await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("RF-6/RF-8 — concluir avança a fila e conta uma vez (docs/36 T-02.5/T-02.7)", () => {
  /** 3 práticas de habilidades DIFERENTES (o título do card precisa distinguir a 1ª da 2ª). */
  const FILA_ABC = () =>
    comAtividades(["pratica", "pratica", "pratica"], {
      1: { skillIds: ["mat:operacoes-fundamentais"] },
      2: { skillIds: ["mat:razao-proporcao"] },
    });

  test("fila A,B,C: ao concluir A, o card mostra B e o caminho mantém C; histórico com 1 entrada", async ({ page }) => {
    await abrirHome(page, FILA_ABC());
    const tituloB = await tituloDoNo(page, "atv-test-pratica-2");
    const tituloC = await tituloDoNo(page, "atv-test-pratica-3");
    expect(tituloB).not.toBe(tituloC);

    await page.locator("a.btn-primary").first().click();
    await esperarPrimeiraQuestao(page);
    await responderComNaoSeiAteConcluir(page);
    const continuar = page.getByRole("link", { name: "Continuar" });
    await expect(continuar).toHaveAttribute("href", "/trilha");
    await continuar.click();
    await esperarHome(page);

    // O card agora é B (nunca recalculou as 3 do zero) e C continua na fila.
    await expect(page.locator("h2").first()).toHaveText(tituloB);
    // RU-12 (T-06.2): o card também diz o que vem DEPOIS de B — a C que já estava comprometida.
    await expect(page.getByTestId("session-card-depois")).toHaveText("Depois: " + tituloC);
    await expect.poll(async () => (await lerEstado(page)).learning.journey.committed.map((a: { id: string }) => a.id).slice(0, 2)).toEqual([
      "atv-test-pratica-2",
      "atv-test-pratica-3",
    ]);
    const estado = await lerEstado(page);
    expect(estado.learning.journey.committed).toHaveLength(3); // a vaga da A foi reposta
    expect(estado.learning.journey.history).toHaveLength(1);
    expect(estado.learning.journey.history[0].attemptKey).toMatch(/^atv-test-pratica@/);
    expect(estado.learning.journey.seq).toBe(1);
  });

  test("RU-12: o card mostra 'Depois: {2ª comprometida}', um único CTA primário e a borda vem da classe border-mar", async ({ page }) => {
    // `onboardingVersion: 2`: sem isso a migração trata o fixture como usuário legado e o card "Quer ajustar a
    // trilha ao seu nível?" (F13.7, independente da jornada) soma um 2º `.btn-primary` (mesmo cuidado de journey.spec.ts).
    const baseV2 = { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } };
    await abrirHome(
      page,
      comAtividades(["pratica", "pratica", "pratica"], { 1: { skillIds: ["mat:operacoes-fundamentais"] }, 2: { skillIds: ["mat:razao-proporcao"] } }, baseV2),
    );
    const tituloB = await tituloDoNo(page, "atv-test-pratica-2");
    await expect(page.getByTestId("session-card-depois")).toHaveText("Depois: " + tituloB);
    await expect(page.locator(".btn-primary")).toHaveCount(1);

    // A borda do card é `border-mar` (classe), não `style={{ borderColor: "var(--color-mar)" }}` — o token
    // inline pode resolver pra nada (memória do projeto: tokens do `@theme inline`). Compara com elementos
    // de referência que só têm a classe: a borda do card tem que ser a de `border-mar` e NÃO a de `border-gelo`.
    const cores = await page.evaluate(() => {
      const card = document.querySelector("h2")!.closest(".card-soft") as HTMLElement;
      const ref = (classe: string) => {
        const el = document.createElement("div");
        el.className = "border-2 border-solid " + classe;
        document.body.appendChild(el);
        const cor = getComputedStyle(el).borderTopColor;
        el.remove();
        return cor;
      };
      return { card: getComputedStyle(card).borderTopColor, mar: ref("border-mar"), gelo: ref("border-gelo") };
    });
    expect(cores.mar).not.toBe(cores.gelo);
    expect(cores.card).toBe(cores.mar);
  });

  test("RF-6: recarregar na celebração e voltar não duplica histórico, bloco do dia nem XP", async ({ page }) => {
    await abrirHome(page, FILA_ABC());
    await page.locator("a.btn-primary").first().click();
    await esperarPrimeiraQuestao(page);
    await responderComNaoSeiAteConcluir(page);
    await expect(page.getByRole("link", { name: "Continuar" })).toBeVisible();
    const antes = await lerEstado(page);

    await page.reload({ waitUntil: "domcontentloaded" });
    await esperarHome(page);

    const depois = await lerEstado(page);
    expect(depois.learning.journey.history).toHaveLength(1);
    expect(depois.progress.xp).toBe(antes.progress.xp);
    expect(depois.progress.today.completedBlockIds).toHaveLength(antes.progress.today.completedBlockIds.length);
    expect(depois.learning.events.filter((e: { type: string }) => e.type === "activity-completed")).toHaveLength(1);
  });
});

/* -------------------------------------------------- famílias de atividade (RF-1) */

interface Familia {
  nome: string;
  kinds: ActivityKindSeed[];
  over?: Record<number, Record<string, unknown>>;
  /** Ajuste do estado semeado (ex.: histórico pro checkpoint ter o que compor). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- estado local dinâmico de fixture E2E
  ajustar?: (e: any) => void;
  /** O que precisa aparecer em até 10 s depois do clique no CTA. */
  esperar: (page: Page) => Promise<void>;
}

async function primeiraQuestaoDeAtividade(page: Page) {
  await expect(page).toHaveURL(/\/atividade\//, { timeout: 10_000 });
  await clicarComecarSeHouver(page, 2);
  await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
}

const FAMILIAS: Familia[] = [
  {
    nome: "aula embarcada",
    kinds: ["aula", "pratica", "pratica"],
    esperar: async (page) => {
      await expect(page).toHaveURL(/\/learn\/porcentagem-valor/, { timeout: 10_000 });
      await expect(page.getByRole("button", { name: "Começar" })).toBeVisible({ timeout: 10_000 });
    },
  },
  {
    nome: "aula de pacote (gerada)",
    kinds: ["aula", "pratica", "pratica"],
    over: { 0: { lessonId: "aula-mat-razao-proporcao", skillIds: ["mat:razao-proporcao"] } },
    esperar: async (page) => {
      await expect(page).toHaveURL(/\/learn\/aula-mat-razao-proporcao/, { timeout: 10_000 });
      await expect(page.getByRole("button", { name: "Começar" })).toBeVisible({ timeout: 10_000 });
    },
  },
  {
    nome: "legado (redação)",
    kinds: ["legado", "pratica", "pratica"],
    esperar: async (page) => {
      await expect(page).toHaveURL(/\/redacao\/crase-01-a-regra-de-ouro/, { timeout: 10_000 });
      await expect(page.getByRole("button", { name: "Verificar" })).toBeVisible({ timeout: 10_000 });
    },
  },
  { nome: "revisão", kinds: ["revisao", "pratica", "pratica"], esperar: primeiraQuestaoDeAtividade },
  { nome: "desafio", kinds: ["desafio", "pratica", "pratica"], esperar: primeiraQuestaoDeAtividade },
  { nome: "reforço sem aula própria", kinds: ["reforco", "pratica", "pratica"], esperar: primeiraQuestaoDeAtividade },
  {
    nome: "reforço com aula própria",
    kinds: ["reforco", "pratica", "pratica"],
    over: { 0: { lessonId: "porcentagem-valor" } },
    esperar: async (page) => {
      await expect(page).toHaveURL(/\/learn\/porcentagem-valor/, { timeout: 10_000 });
      await expect(page.getByRole("button", { name: "Começar" })).toBeVisible({ timeout: 10_000 });
    },
  },
  {
    nome: "checkpoint",
    kinds: ["checkpoint", "pratica", "pratica"],
    over: { 0: { skillIds: [], subjectId: "" } },
    // O checkpoint compõe questões das habilidades praticadas desde o último: semeia 4 entradas de histórico.
    ajustar: (e) => {
      const skills = ["mat:porcentagem-conceito", "mat:operacoes-fundamentais", "mat:razao-proporcao", "mat:equacao-primeiro-grau"];
      e.learning.journey.history = skills.map((skillId, i) => ({
        activityId: `hist-${i}`,
        kind: "pratica",
        skillIds: [skillId],
        subjectId: "mat",
        completedAt: "2026-09-27T10:00:00.000Z",
        scorePct: 80,
        attemptKey: `hist-${i}@sem-inicio`,
      }));
    },
    esperar: async (page) => {
      await expect(page).toHaveURL(/\/atividade\/atv-test-checkpoint/, { timeout: 10_000 });
      await expect(page.getByRole("heading", { name: "Checagem" })).toBeVisible({ timeout: 10_000 });
      await clicarComecarSeHouver(page, 2);
      await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
    },
  },
];

test.describe("RF-1 — toda família abre pelo CTA do card em ≤ 10 s (docs/36 L.2)", () => {
  for (const familia of FAMILIAS) {
    test(`CTA abre: ${familia.nome}`, async ({ page }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- estado local dinâmico de fixture E2E
      const estado = comAtividades(familia.kinds, familia.over ?? {}) as any;
      familia.ajustar?.(estado);
      await abrirHome(page, estado);
      await page.locator("a.btn-primary").first().click();
      await familia.esperar(page);
    });
  }
});

/* ---------------------------------------- G-1: toda família abre pelo NÓ atual */

test.describe("G-1 — toda família abre pelo NÓ atual do caminho em ≤ 10 s (docs/36 L.2, achado do spec-verifier)", () => {
  for (const familia of FAMILIAS) {
    test(`nó atual abre: ${familia.nome}`, async ({ page }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- estado local dinâmico de fixture E2E
      const estado = comAtividades(familia.kinds, familia.over ?? {}) as any;
      familia.ajustar?.(estado);
      await abrirHome(page, estado);
      // O 1º comprometido tem id `atv-test-<kind>` (helpers/estado.ts).
      await page.locator(`[data-path-node="atv-test-${familia.kinds[0]}"]`).click();
      await familia.esperar(page);
    });
  }
});

/* ------------------------- G-2: concluir pela UI avança a fila (aula e legado) */

/** Responde a lição legada de redação até a tela final ("Voltar à trilha"), qualquer que seja o formato dos exercícios. */
async function concluirLicaoLegada(page: Page) {
  const voltar = page.getByRole("link", { name: "Voltar à trilha" });
  for (let i = 0; i < 40; i++) {
    if (await voltar.isVisible().catch(() => false)) return voltar;
    await page.getByRole("button", { name: "Verificar" }).waitFor({ timeout: 15_000 }).catch(() => {});
    const naoSei = page.getByRole("button", { name: "Não sei" });
    if (await naoSei.isVisible().catch(() => false)) {
      await naoSei.click();
    } else {
      await page.locator('[role="radio"], button:has(> span)').first().click();
      await page.getByRole("button", { name: "Verificar" }).click();
    }
    await page.locator('[role="status"]').first().waitFor({ timeout: 10_000 });
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
  }
  throw new Error("lição legada não terminou em 40 exercícios — loop de segurança estourou");
}

test.describe("G-2 — concluir aula/legado pela UI avança a fila, grava 1 histórico e nunca volta a ser oferecida", () => {
  /** A é a atividade testada; B e C são práticas de habilidades diferentes (o título do card precisa distinguir B de C). */
  const fila = (primeira: ActivityKindSeed) =>
    comAtividades([primeira, "pratica", "pratica"], {
      1: { skillIds: ["mat:operacoes-fundamentais"] },
      2: { skillIds: ["mat:razao-proporcao"] },
    });

  type Ativ = { id: string; kind: string; lessonId?: string };
  const ids = (l: Ativ[]) => l.map((a) => a.id);

  async function conferirFilaAvancou(page: Page, kind: "aula" | "legado", lessonId: string, idA: string) {
    await esperarHome(page);
    await expect
      .poll(async () => (await lerEstado(page)).learning.journey.history.length, { timeout: 15_000 })
      .toBe(1);
    const estado = await lerEstado(page);
    const j = estado.learning.journey;
    // 1 entrada no histórico, da atividade certa
    expect(j.history).toHaveLength(1);
    expect(j.history[0].activityId).toBe(idA);
    expect(j.history[0].kind).toBe(kind);
    // a fila avançou: B no topo, A fora, e a vaga reposta (3 comprometidas)
    expect(ids(j.committed).slice(0, 2)).toEqual(["atv-test-pratica", "atv-test-pratica-2"]);
    expect(j.committed).toHaveLength(3);
    // a concluída não volta a ser oferecida (nem como comprometida nem como a seguir)
    for (const a of [...j.committed, ...j.upcoming] as Ativ[]) {
      expect(a.id).not.toBe(idA);
      expect(a.kind === kind && a.lessonId === lessonId, `${a.id} repete a lição concluída`).toBe(false);
    }
    expect(j.activeActivity).toBeNull();
    return estado;
  }

  test("aula embarcada: fila avança, histórico ganha 1 entrada e a aula concluída não é reoferecida (nem depois de recarregar)", async ({ page }) => {
    test.setTimeout(120_000);
    await abrirHome(page, fila("aula"));
    const xpAntes = (await lerEstado(page)).progress.xp;
    await page.locator("a.btn-primary").first().click();
    await expect(page).toHaveURL(/\/learn\/porcentagem-valor/, { timeout: 10_000 });
    await percorrerLicao(page);
    await page.getByRole("link", { name: "Continuar" }).click();

    const estado = await conferirFilaAvancou(page, "aula", "porcentagem-valor", "atv-test-aula");
    expect(estado.learning.completedLessons["porcentagem-valor"]).toBeTruthy();
    expect(estado.progress.xp).toBeGreaterThan(xpAntes); // pagou uma vez

    // Recarregar: nada volta, nada duplica.
    await page.reload({ waitUntil: "domcontentloaded" });
    await esperarHome(page);
    const depois = await lerEstado(page);
    expect(depois.learning.journey.history).toHaveLength(1);
    expect(depois.progress.xp).toBe(estado.progress.xp);
    for (const a of [...depois.learning.journey.committed, ...depois.learning.journey.upcoming] as Ativ[]) {
      expect(a.kind === "aula" && a.lessonId === "porcentagem-valor").toBe(false);
    }
  });

  test("lição legada de redação: fila avança, histórico ganha 1 entrada e a lição concluída não é reoferecida (nem depois de recarregar)", async ({ page }) => {
    test.setTimeout(150_000);
    await abrirHome(page, fila("legado"));
    const xpAntes = (await lerEstado(page)).progress.xp;
    await page.locator("a.btn-primary").first().click();
    await expect(page).toHaveURL(/\/redacao\/crase-01-a-regra-de-ouro/, { timeout: 10_000 });
    const voltar = await concluirLicaoLegada(page);
    await voltar.click();

    const estado = await conferirFilaAvancou(page, "legado", "crase-01-a-regra-de-ouro", "atv-test-legado");
    expect(estado.progress.lessons["crase-01-a-regra-de-ouro"]).toBeTruthy();
    expect(estado.progress.xp).toBeGreaterThan(xpAntes);

    await page.reload({ waitUntil: "domcontentloaded" });
    await esperarHome(page);
    const depois = await lerEstado(page);
    expect(depois.learning.journey.history).toHaveLength(1);
    expect(depois.progress.xp).toBe(estado.progress.xp);
    for (const a of [...depois.learning.journey.committed, ...depois.learning.journey.upcoming] as Ativ[]) {
      expect(a.kind === "legado" && a.lessonId === "crase-01-a-regra-de-ouro").toBe(false);
    }
  });
});

/* ------------------------------ A2: a fila que o aluno vê não repete atividade */

test.describe("A2 — a fila do motor não repete a mesma aula/prática (docs/36, achado do spec-verifier)", () => {
  test("plano real (sem seed de fila): committed + upcoming têm identidades únicas, no estado e no caminho", async ({ page }) => {
    await definirFlags(page, { jornadaAdaptativa: true });
    await seedOnce(page, USUARIO_ONBOARDED);
    await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
    await esperarHome(page);
    await expect
      .poll(async () => (await lerEstado(page))?.learning?.journey?.committed?.length ?? 0, { timeout: 15_000 })
      .toBeGreaterThan(0);

    const j = (await lerEstado(page)).learning.journey;
    const todas = [...j.committed, ...j.upcoming] as { id: string; kind: string; lessonId?: string; skillIds: string[] }[];
    const identidade = (a: (typeof todas)[number]) => `${a.kind}:${a.lessonId ?? a.skillIds[0]}`;
    const chaves = todas.map(identidade);
    expect(new Set(chaves).size, `repetidas na fila: ${chaves.join(" | ")}`).toBe(chaves.length);

    // O que o aluno vê: um nó por atividade planejada, sem nó duplicado.
    const nos = await page.locator("[data-path-node]").evaluateAll((els) => els.map((e) => e.getAttribute("data-path-node")));
    expect(new Set(nos).size).toBe(nos.length);
  });
});

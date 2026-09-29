import { expect, test } from "@playwright/test";
import {
  comAtividades,
  comPlacementConcluidoNaoAplicado,
  definirFlags,
  lerEstado,
  seedOnce,
  USUARIO_ONBOARDED as USUARIO_ONBOARDED_HELPER,
} from "./helpers/estado";
import { clicarComecarSeHouver } from "./helpers/jornada";

/**
 * Rota `/nivelamento` (docs/30 §12, Fase 13 do docs/31 F13.4/F13.6). Desde a
 * Onda 1 (docs/31 F11.6, 27/09/2026) as 4 áreas medidas têm pool diagnóstico
 * revisado por humano acima do mínimo (`PLACEMENT_MIN_ITENS_ELEGIVEIS_AREA`
 * = 4; `bun scripts/content/promover-diagnostico.ts` reportou 40-45 itens
 * por área) — E `pacotesProntos`/`carregarTodosOsPacotes` (F13.4) já
 * pré-carrega o pacote antes de abrir a rota. Isso muda o que dá pra testar
 * aqui de ponta a ponta: em vez do estado "pool vazio" (histórico, coberto
 * só por unidade com pools sintéticos em `placement.test.ts`), o teste
 * agora RESPONDE um CAT real (`responderCicloReal`) e confere que pelo
 * menos uma área é medida de verdade. O motor em si (EAP, seleção por
 * informação, pausar/retomar) continua coberto por unidade; aqui é o fio
 * ponta a ponta com o catálogo publicado.
 */

async function pronto(page: import("@playwright/test").Page): Promise<boolean> {
  return page
    .getByText("Pronto.")
    .waitFor({ state: "visible", timeout: 500 })
    .then(() => true)
    .catch(() => false);
}

/** Responde o nivelamento clicando na primeira opção de cada questão, até 'Pronto.' aparecer
 * (correção da resposta não importa pra este teste de fluxo — quem confere isso é `placement.test.ts`).
 * O ÚLTIMO item fecha o placement assim que verificado, pulando a tela "Resposta registrada." — e, desde
 * a T-03.3 (docs/36), o resultado só aparece DEPOIS de aplicar o nivelamento ("Montando sua trilha…" no
 * meio). Por isso, depois do "Verificar", espera ou o botão de seguir ou o "Pronto." (o que vier). */
async function responderCicloReal(page: import("@playwright/test").Page) {
  for (let i = 0; i < 30; i++) {
    if (await pronto(page)) return;
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Verificar" }).click();
    const seguir = page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ });
    await seguir.or(page.getByText("Pronto.")).first().waitFor({ state: "visible", timeout: 15_000 });
    if (await pronto(page)) return;
    await seguir.click();
  }
  throw new Error("nivelamento não chegou em 'Pronto.' depois de 30 rodadas");
}

/**
 * RP-6 (docs/36 §F.5): a tela de resultado não mostra porcentagem, "nível N" nem nota. A copy do plano
 * NEGA a nota ("…um ponto de partida, não uma nota."), então essa frase — e só ela — sai do texto
 * antes de procurar `nota` (divergência registrada no docs/37, D-29).
 */
async function textoDoResultadoSemNegacao(page: import("@playwright/test").Page): Promise<string> {
  const texto = await page.locator("body").innerText();
  return texto.replace("não uma nota", "");
}

async function esperarAtividadeAberta(page: import("@playwright/test").Page) {
  await page.waitForURL(/\/(atividade|learn|redacao)\//, { timeout: 15_000 });
  // A URL muda antes de o resultado sair do DOM: sem esperar, o "Começar" da atividade seria confundido
  // com o "Começar" do próprio resultado.
  await expect(page.getByRole("heading", { name: "Pronto. Sua trilha foi ajustada." })).toHaveCount(0);
  await clicarComecarSeHouver(page, 1);
  // Atividade dinâmica mostra o radio da 1ª questão; aula mostra o 1º passo (botão "Continuar"/"Começar").
  await expect(
    page.getByRole("radio").or(page.getByRole("button", { name: /^(Continuar|Começar|Verificar)$/ })).first(),
  ).toBeVisible({ timeout: 15_000 });
}

const USUARIO_ONBOARDED = {
  authed: true,
  onboarded: true,
  prefs: { name: "Ana", sound: true, haptics: true, theme: "auto", dailyLessons: 3 },
  progress: { xp: 100, streak: 2, lessonsCompleted: 1, completedQuestions: [] },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

async function ligarNivelamento(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("foca.flags", JSON.stringify({ nivelamento: true }));
  });
}

/**
 * `addInitScript` roda de novo em CADA navegação (documentado no
 * Playwright) — sem a checagem "só semeia se ainda não existir", navegar
 * pra uma segunda página apagaria o `learning.placement` que a primeira
 * página acabou de gravar, disfarçado de "o botão não mudou de texto"
 * (achado real ao escrever o teste de "Refazer nivelamento", mesmo padrão
 * já documentado em `focus.spec.ts`).
 */
async function seedEstado(page: import("@playwright/test").Page) {
  await page.addInitScript((raw) => {
    if (!localStorage.getItem("foca.state.v3")) {
      localStorage.setItem("foca.state.v3", JSON.stringify(raw));
    }
  }, USUARIO_ONBOARDED);
}

test("flag desligada: /nivelamento redireciona pra /trilha", async ({ page }) => {
  // `nivelamento` é `true` em `BASE_FEATURES` desde a F15.1 (docs/32) — testar
  // o estado "flag desligada" agora precisa do override explícito.
  await page.addInitScript(() => {
    localStorage.setItem("foca.flags", JSON.stringify({ nivelamento: false }));
  });
  await seedEstado(page);
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/trilha/, { timeout: 15000 });
});

test("flag ligada, pool real (Onda 1, F11.6): CAT responde de ponta a ponta e mede pelo menos uma área", async ({
  page,
}) => {
  test.setTimeout(90_000); // até 24 itens reais (PLACEMENT_MAX_ITENS_TOTAL) — o default de 30s não alcança.
  await ligarNivelamento(page);
  await seedEstado(page);
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });

  await page.getByRole("radio").first().waitFor({ timeout: 15000 }); // pacotesProntos + primeiro item
  await responderCicloReal(page);
  await expect(page.getByRole("heading", { name: "Pronto. Sua trilha foi ajustada." })).toBeVisible();

  // RP-6 (docs/36 T-06.1): nenhuma porcentagem, "Nível N" ou nota (docs/30 §12.5) mesmo com área medida de verdade.
  expect(await textoDoResultadoSemNegacao(page)).not.toMatch(/\d+ ?%|nível \d|nota/i);
  await expect(page.getByText(/nível \d/i)).toHaveCount(0);
  // Indicador acessível por área medida: role="img" com aria-label "{Área}: {faixa}. {precisão}."
  const indicadores = page.getByRole("img", { name: /: (Base em construção|No caminho|Base firme)\. / });
  expect(await indicadores.count()).toBeGreaterThanOrEqual(1);
  // Pelo menos uma área tem faixa real (não é mais garantido "nenhuma", como no pool vazio de antes da F11.6).
  const semFaixaNenhuma = await page.getByText(/Ainda não temos questões suficientes/).count();
  expect(semFaixaNenhuma).toBeLessThan(4);

  const estado = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}"),
  );
  expect(estado.learning.placement?.status).toBe("concluido");
  // Com área medida de verdade, `applyPlacement` grava Mastery/Confidence de pelo menos uma habilidade.
  expect(Object.keys(estado.learning.skillModel ?? {}).length).toBeGreaterThan(0);

  // "Por onde começamos" (F.5 item 4): a fila foi recomposta ANTES da tela aparecer, então já há atividade.
  await expect(page.getByText("Por onde começamos")).toBeVisible();
  await expect(page.getByText(/^Sua primeira atividade: .+/)).toBeVisible();
  // CTA primário único; "Começar" abre a atividade (UI de questão ou 1º passo de aula) — RF-1, mesmo caminho do card.
  await expect(page.locator(".btn-primary")).toHaveCount(1);
  await page.getByRole("button", { name: "Começar" }).click();
  await esperarAtividadeAberta(page);
});

test("refazer nivelamento (perfil) começa um placement novo quando o anterior já estava concluído", async ({
  page,
}) => {
  test.setTimeout(120_000); // 2 CATs reais nesta única prova (o de antes + o refeito).
  await ligarNivelamento(page);
  await seedEstado(page);
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByRole("radio").first().waitFor({ timeout: 15000 });
  await responderCicloReal(page);
  await expect(page.getByText("Pronto.")).toBeVisible();

  await page.goto("/profile?debug=1", { waitUntil: "domcontentloaded" });
  const botao = page.getByRole("button", { name: /Refazer nivelamento/ });
  await expect(botao).toBeVisible({ timeout: 15000 });
  await botao.click();
  await page.waitForURL(/\/nivelamento/, { timeout: 15000 });
  await page.getByRole("radio").first().waitFor({ timeout: 15000 });
});

/**
 * docs/36 RF-10 (bug C1/B3 — S1, corrigido na T-03.3).
 *
 * Reproduzido em 28/09/2026 (docs/36 §D B3): storage onboarded, fila pré-
 * existente, CAT completo pela última resposta → `placement.status
 * "concluido"`, MAS `applyPlacement`/`finishPlacement`/`invalidateJourneyPlan`
 * só rodavam no ramo raro "pool acabou antes do teto" — no término normal a
 * rota derivava `emAndamento = false` e o efeito saía antes. Resultado: nenhum
 * `appliedAt`, nenhum prior gravado e a fila (`committed`) idêntica. Agora
 * `usePlacementReconciliation` aplica por qualquer caminho.
 */
test("término normal aplica priors, grava appliedAt e replaneja a fila (docs/36 RF-10; T-03.3)", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await definirFlags(page, { nivelamento: true });
  await seedOnce(page, USUARIO_ONBOARDED_HELPER);

  // Fila pré-existente que o motor grava ao abrir a Home.
  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).waitFor({ timeout: 15_000 });
  const antes = await lerEstado(page);
  const idsAntes: string[] = antes.learning.journey.committed.map((a: { id: string }) => a.id);
  expect(idsAntes.length).toBeGreaterThan(0);

  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByRole("radio").first().waitFor({ timeout: 15_000 });
  await responderCicloReal(page);
  await expect(page.getByText("Pronto.")).toBeVisible();
  // A rota recompôs a fila com o nivelamento aplicado ANTES de mostrar o resultado (T-06.1).
  await expect(page.getByText("Por onde começamos")).toBeVisible();

  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).waitFor({ timeout: 15_000 });

  const depois = await lerEstado(page);
  // 1) aplicado uma vez, com marca de idempotência
  expect(depois.learning.placement.status).toBe("concluido");
  expect(depois.learning.placement.appliedAt).toBeTruthy();
  // 2) priors gravados (≥ 1 entrada `prior-nivelamento`) além da evidência medida
  const fontes = Object.values(depois.learning.skillModel ?? {}).map((e) => (e as { source: string }).source);
  expect(fontes.filter((f) => f === "prior-nivelamento").length).toBeGreaterThanOrEqual(1);
  // 3) a fila mudou OU já reflete habilidade nova das áreas medidas
  const committed: Array<{ id: string; reasons: string[] }> = depois.learning.journey.committed;
  const idsDepois = committed.map((a) => a.id);
  const mudou = JSON.stringify(idsDepois) !== JSON.stringify(idsAntes);
  const comMotivoNovaHabilidade = committed.some((a) => a.reasons.includes("nova-habilidade"));
  expect(mudou || comMotivoNovaHabilidade).toBe(true);
});

/**
 * docs/36 RF-10/RF-11 (T-03.3) — interrupção entre "concluído" e "aplicado".
 *
 * Estado em que ficou toda conta que terminou o nivelamento desde 28/09: placement
 * `concluido` SEM `appliedAt`, com fila pré-existente. Abrir `/trilha` repara uma vez
 * (RF-11): grava `appliedAt`, aplica priors, recompõe a fila e registra 1 evento — e
 * recarregar depois NÃO aplica de novo (idempotência que sobrevive a reload).
 */
test("reparo: placement concluído sem appliedAt é aplicado na 1ª abertura de /trilha, uma vez só (docs/36 RF-11; T-03.3)", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await definirFlags(page, { nivelamento: true });
  await seedOnce(page, comPlacementConcluidoNaoAplicado(comAtividades(["pratica", "pratica", "pratica"])));

  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).waitFor({ timeout: 20_000 }); // o esqueleto sai quando o nivelamento foi aplicado

  const depois = await lerEstado(page);
  expect(depois.learning.placement.status).toBe("concluido");
  expect(depois.learning.placement.appliedAt).toBeTruthy();
  expect(depois.learning.placement.appliedVersion).toBe(1);
  // Evidência preservada (o seed não tem skillModel; o que existe agora são os priors da área medida, MT).
  const fontes = Object.values(depois.learning.skillModel ?? {}).map((e) => (e as { source: string }).source);
  expect(fontes.filter((f) => f === "prior-nivelamento").length).toBeGreaterThanOrEqual(1);
  // A fila pré-existente (atv-test-*) foi recomposta pelo motor.
  const idsDepois: string[] = depois.learning.journey.committed.map((a: { id: string }) => a.id);
  expect(idsDepois.length).toBeGreaterThan(0);
  expect(idsDepois.some((id) => id.startsWith("atv-test-"))).toBe(false);
  const aplicados = depois.learning.events.filter((e: { type: string }) => e.type === "placement-applied");
  expect(aplicados).toHaveLength(1);

  // Idempotente e persistido: recarregar não reaplica nem muda a marca.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText(/Nível \d/).waitFor({ timeout: 20_000 });
  const aposReload = await lerEstado(page);
  expect(aposReload.learning.placement.appliedAt).toBe(depois.learning.placement.appliedAt);
  expect(aposReload.learning.events.filter((e: { type: string }) => e.type === "placement-applied")).toHaveLength(1);
});

/**
 * docs/36 §F.5 / T-06.1 (RU-10, RP-6) — resultado do nivelamento determinístico, sem rodar um CAT.
 * Placement `concluido` JÁ aplicado (`appliedAt`), com `committed` cheio (3 práticas) para a rota não
 * recompor nada: o que aparece é exatamente o que o estado diz.
 */
function comResultadoAplicado(areas: Record<string, unknown>, base = comAtividades(["pratica", "pratica", "pratica"])) {
  const learning = base.learning as Record<string, unknown>;
  return {
    ...base,
    learning: {
      ...learning,
      placement: {
        status: "concluido",
        startedAt: "2026-09-28T10:00:00.000Z",
        finishedAt: "2026-09-28T10:08:00.000Z",
        seed: "plc-seed-e2e",
        appliedAt: "2026-09-28T10:08:05.000Z",
        appliedVersion: 1,
        areas,
      },
    },
  };
}

const area = (theta: number, se: number, n: number) => ({
  itemIds: Array.from({ length: n }, (_, i) => `gen:mat:x:${i}`),
  responses: [],
  theta,
  se,
  done: true,
});

test("resultado (F.5): faixas por área medida, precisão pela SE, área não medida sem indicador, 'Começar' abre a atividade", async ({
  page,
}) => {
  await definirFlags(page, { nivelamento: true });
  await seedOnce(
    page,
    comResultadoAplicado({
      MT: area(1.0, 0.4, 5), //  firme + estimativa firme
      LC: area(-1.0, 0.85, 2), // em construção + poucas questões (2)
      CN: area(0.0, 0.6, 4), //  no caminho + estimativa inicial
      // CH ausente = não medida
    }),
  );
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Pronto. Sua trilha foi ajustada." })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Isso é um ponto de partida, não uma nota. Muda conforme você estuda.")).toBeVisible();

  // Um indicador acessível por área medida, na ordem do escopo (LC, MT, CN, CH → sem prioridade = ordem declarada).
  await expect(
    page.getByRole("img", { name: "Matemática e suas Tecnologias: Base firme. Estimativa firme." }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Linguagens, Códigos e suas Tecnologias: Base em construção. Poucas questões. Vamos confirmar estudando.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Ciências da Natureza e suas Tecnologias: No caminho. Estimativa inicial." }),
  ).toBeVisible();
  await expect(page.getByTestId("placement-area")).toHaveCount(3);
  // A quantidade de questões só aparece quando a estimativa tem poucas.
  await expect(page.getByText("Poucas questões. Vamos confirmar estudando. 2 questões")).toBeVisible();
  // Rótulo visível (cor nunca é o único sinal) ao lado do indicador.
  await expect(page.getByTestId("placement-area").filter({ hasText: "Base firme" })).toHaveCount(1);
  // Área não medida: sem indicador, com o texto próprio.
  await expect(page.getByText("Ainda não temos questões suficientes de Ciências Humanas e suas Tecnologias para medir.")).toBeVisible();

  // RP-6: nada de %, "nível N", nota (fora da negação), θ/SE numéricos.
  const texto = await textoDoResultadoSemNegacao(page);
  expect(texto).not.toMatch(/\d+ ?%|nível \d|nota/i);
  expect(texto).not.toMatch(/θ|theta|0[.,]\d/i);

  // "Por onde começamos": a atividade do topo da fila e o motivo.
  await expect(page.getByText("Por onde começamos")).toBeVisible();
  await expect(page.getByText(/^Sua primeira atividade: Prática/)).toBeVisible();

  await expect(page.locator(".btn-primary")).toHaveCount(1);
  await page.getByRole("button", { name: "Começar" }).click();
  await expect(page).toHaveURL(/\/atividade\/atv-test-pratica/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Pronto. Sua trilha foi ajustada." })).toHaveCount(0); // saiu do resultado
  await clicarComecarSeHouver(page, 1);
  await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 15_000 });
  const estado = await lerEstado(page);
  expect(estado.learning.journey.activeActivity?.id).toBe("atv-test-pratica");
  expect(estado.learning.journey.activeActivity?.itemIds?.length ?? 0).toBeGreaterThanOrEqual(2);
});

test("resultado (F.5): nenhuma área medida troca o corpo, sem indicadores", async ({ page }) => {
  await definirFlags(page, { nivelamento: true });
  await seedOnce(page, comResultadoAplicado({}));
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Pronto. Sua trilha foi ajustada." })).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByText(
      "Não tivemos questões suficientes para medir agora. Sua trilha começa pelo básico e se ajusta enquanto você estuda.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Isso é um ponto de partida, não uma nota. Muda conforme você estuda.")).toHaveCount(0);
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(page.getByTestId("placement-area")).toHaveCount(0);
  // Nunca inventa faixa: as 4 áreas aparecem como não medidas.
  await expect(page.getByText(/Ainda não temos questões suficientes de/)).toHaveCount(4);
});

test("resultado (F.5): com a jornada desligada não há 'Por onde começamos' e o CTA leva à trilha", async ({ page }) => {
  await definirFlags(page, { nivelamento: true, jornadaAdaptativa: false });
  await seedOnce(page, comResultadoAplicado({ MT: area(1.0, 0.4, 5) }));
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Pronto. Sua trilha foi ajustada." })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Por onde começamos")).toHaveCount(0);
  await page.getByRole("button", { name: "Ir para a trilha" }).click();
  await page.waitForURL(/\/trilha/, { timeout: 15_000 });
});

/**
 * docs/36 T-06.2 (RU-11) — enquanto o nivelamento pendente é aplicado a Home mostra "Montando sua
 * trilha…" com o esqueleto do caminho, e NUNCA o card/fila velhos. Os pacotes de conteúdo demoram de
 * propósito (a aplicação espera por eles) para o estado ser observável.
 */
test("Home aplicando o nivelamento: RU-11 + esqueleto, sem card nem fila velhos; depois aparece a fila nova", async ({ page }) => {
  test.setTimeout(60_000);
  await definirFlags(page, { nivelamento: true });
  await seedOnce(page, comPlacementConcluidoNaoAplicado(comAtividades(["pratica", "pratica", "pratica"])));
  await page.route("**/content/v1/**", async (rota) => {
    await new Promise((r) => setTimeout(r, 2_500));
    await rota.continue();
  });

  await page.goto("/trilha?debug=1", { waitUntil: "domcontentloaded" });
  const aviso = page.getByText("Montando sua trilha…");
  await expect(aviso).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("[data-path-skeleton]")).toBeVisible();
  await expect(page.locator(".btn-primary")).toHaveCount(0); // sem o card da fila velha
  await expect(page.locator('[data-path-node="atv-test-pratica"]')).toHaveCount(0);

  // Aplicado: o aviso e o esqueleto saem e a fila nova (do motor) aparece.
  await expect(aviso).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".btn-primary").first()).toBeVisible({ timeout: 15_000 });
  const depois = await lerEstado(page);
  expect(depois.learning.placement.appliedAt).toBeTruthy();
});

test("resultado (F.5) a 320 px: sem rolagem horizontal e CTA com alvo ≥ 44 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await definirFlags(page, { nivelamento: true });
  await seedOnce(
    page,
    comResultadoAplicado({ MT: area(1.0, 0.4, 5), LC: area(-1.0, 0.85, 2), CN: area(0.0, 0.6, 4) }),
  );
  await page.goto("/nivelamento?debug=1", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Pronto. Sua trilha foi ajustada." })).toBeVisible({ timeout: 20_000 });

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const cta = await page.getByRole("button", { name: "Começar" }).boundingBox();
  expect(cta?.height).toBeGreaterThanOrEqual(44);
  // Os nomes longos de área quebram linha em vez de estourar o cartão.
  for (const cartao of await page.getByTestId("placement-area").all()) {
    const box = await cartao.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
});

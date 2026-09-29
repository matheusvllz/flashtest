import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { comAtividades, definirFlags, seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";
import { QUESTIONS } from "../../src/data/questions";
import { clicarComecarSeHouver } from "./helpers/jornada";

/**
 * Critério A1 (docs/20 §20) + regressão dos bugs B1/B4/B5 (§3). Cada teste
 * abre seu próprio contexto de navegador (config `fullyParallel`), então
 * `/study` sempre começa com o storage vazio, sem precisar de fixture própria.
 */

async function answerFirstQuestion(page: import("@playwright/test").Page) {
  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Responder" }).waitFor();
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.locator('[role="status"]').waitFor();
}

test("A1 — a frase do feedback não muda enquanto o relógio da aula continua rodando", async ({
  page,
}) => {
  await answerFirstQuestion(page);
  const titulo = page.locator('[role="status"] p.font-display').first();
  const inicial = (await titulo.textContent())?.trim();

  // O relógio de `study.tsx` re-renderiza a cada 1s — 10s é tempo de sobra
  // pra reproduzir o B1 (frase sorteada de novo a cada render) se ele voltar.
  await page.waitForTimeout(10_000);

  await expect(titulo).toHaveText(inicial ?? "");
});

test("A5/B4 — alternativas neutras após responder ficam totalmente opacas e legíveis", async ({
  page,
}) => {
  await answerFirstQuestion(page);
  const alternativas = page.locator("div.mt-5.flex.flex-col.gap-3 > button");
  const opacities = await alternativas.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).opacity),
  );
  for (const o of opacities) expect(o).toBe("1");
});

test("B5 — clique duplo em Continuar avança só uma questão", async ({ page }) => {
  await answerFirstQuestion(page);
  const continuar = page.getByRole("button", { name: /Continuar|Ver resultado/ });
  await continuar.waitFor();

  // Dois eventos de clique despachados no MESMO handle, sem re-consultar o
  // DOM entre um e outro — é o cenário síncrono que expõe o avanço duplo se
  // a guarda regredir. Usar `locator.click()` duas vezes não serve: a
  // segunda chamada re-busca o elemento e trava esperando um botão
  // "Continuar" que a resposta correta já fez sumir (ele virou "Responder"
  // da próxima questão), o que é o comportamento CERTO, não um bug do teste.
  await continuar.evaluate((el) => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  // Aula tem 2 questões (LESSON_SIZE): se pulou 2, a tela de fechamento
  // aparece direto sem nunca mostrar a segunda pergunta em "answer".
  await expect(page.getByText("Nível", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Fechar por hoje")).not.toBeVisible();
});

/**
 * RP-10 (docs/36 T-07.5, docs/34): a atribuição oficial (ano + prova) aparece no enunciado E na
 * folha de feedback. Atividade semeada com 2 itens oficiais reais de biologia (ids lidos do JSON
 * publicado — nenhum texto de questão é copiado pro teste).
 */
function itensOficiaisDeBiologia(): Array<{ id: string; skill: string }> {
  const json = JSON.parse(readFileSync("src/content/banco/oficial/2023-bio.json", "utf-8")) as {
    items: Array<{ id: string; meta: { skillIds: string[] } }>;
  };
  return json.items.map((i) => ({ id: i.id, skill: i.meta.skillIds[0] }));
}

async function abrirAtividadeSemeada(page: import("@playwright/test").Page, estado: Record<string, unknown>) {
  await definirFlags(page, { jornadaAdaptativa: true });
  await seedOnce(page, estado);
  await page.goto("/atividade/atv-test-pratica", { waitUntil: "domcontentloaded" });
  await clicarComecarSeHouver(page, 1);
  await expect(page.getByRole("radio").first()).toBeVisible({ timeout: 10_000 });
}

async function verificarPrimeiraAlternativa(page: import("@playwright/test").Page) {
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('div.sheet[role="status"]').waitFor();
}

test("RP-10 — item oficial: 'ENEM 2023' no enunciado e 'Questão do ENEM 2023' na folha de feedback", async ({ page }) => {
  const [a, b] = itensOficiaisDeBiologia();
  await abrirAtividadeSemeada(
    page,
    comAtividades(["pratica"], {
      0: { skillIds: [a.skill], subjectId: "bio", itemIds: [a.id, b.id], startedAt: "2026-09-28T12:00:00.000Z" },
    }),
  );

  // Antes de responder: a atribuição já está abaixo do enunciado; a folha ainda não existe.
  await expect(page.getByText("ENEM 2023", { exact: true })).toBeVisible();
  await expect(page.getByText("Questão do ENEM 2023")).toHaveCount(0);

  await verificarPrimeiraAlternativa(page);
  const folha = page.locator('div.sheet[role="status"]');
  await expect(folha.getByText("Questão do ENEM 2023", { exact: true })).toBeVisible();
  // O enunciado continua atribuído depois de responder.
  await expect(page.getByText("ENEM 2023", { exact: true })).toBeVisible();
});

test("RP-10 (negativo) — item que NÃO é oficial não ganha atribuição nenhuma na folha", async ({ page }) => {
  await abrirAtividadeSemeada(page, comAtividades(["pratica"]));
  await verificarPrimeiraAlternativa(page);
  await expect(page.getByText(/Questão do /)).toHaveCount(0);
  await expect(page.getByText("ENEM 2023")).toHaveCount(0);
});

/**
 * B1/B4 permanentes (docs/36 T-08.10): a folha de feedback é OPACA (alfa 1) em todos os fluxos,
 * resultados e temas — o "véu esbranquiçado" do dark mode (B4) e a "explicação transparente" (B1)
 * eram fundos com alfa < 1 ou por cima de outra camada. Aqui o que vale é o valor COMPUTADO pelo
 * navegador, não a classe: 4 fluxos (aula, atividade dinâmica, /study, lição legada de redação)
 * × 3 resultados (acerto, erro, "Não sei") × 2 temas.
 *
 * Para cada combinação: (1) `backgroundColor` da folha tem alfa 1 e o matiz certo (verde no acerto,
 * vermelho no erro, neutro no "Não sei"); (2) nenhuma camada por cima: o elemento no topo do centro
 * da folha é a própria folha ou um descendente; (3) a opacidade efetiva (produto dos ancestrais) é 1;
 * (4) "Continuar" está na janela e recebe o toque, inclusive com "Ver resolução" expandida.
 * Falha que detecta: um fundo translúcido (`bg-*` com alfa, `color-mix` com token que sumiu do CSS),
 * um `opacity` herdado ou um overlay novo sobre a folha.
 */
type FluxoFeedback = "aula" | "atividade" | "study" | "legado";
type ResultadoFeedback = "acerto" | "erro" | "nao-sei";
type TemaFeedback = "light" | "dark";

const FOLHA = 'div.sheet[role="status"]';

async function prepararFluxo(page: Page, fluxo: FluxoFeedback, tema: TemaFeedback) {
  const base = (fluxo === "atividade" ? comAtividades(["pratica"]) : USUARIO_ONBOARDED) as { prefs: Record<string, unknown> };
  await seedOnce(page, { ...base, prefs: { ...base.prefs, theme: tema } });
  if (fluxo === "atividade") await definirFlags(page, { jornadaAdaptativa: true });
  const rota = {
    aula: "/learn/porcentagem-valor",
    atividade: "/atividade/atv-test-pratica",
    study: "/study",
    legado: "/redacao/redacao-estrutura-01-dissertativo-argumentativo",
  }[fluxo];
  await page.goto(rota, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(tema === "dark" ? /dark/ : /^(?!.*dark).*$/);
}

/** Avança passos de ensino ("Começar"/"Continuar") até haver uma pergunta ("Não sei" visível). */
async function ateAPergunta(page: Page, fluxo: FluxoFeedback) {
  if (fluxo === "study") {
    await page.getByRole("button", { name: "Responder" }).waitFor({ timeout: 20_000 });
    return;
  }
  const naoSei = page.getByRole("button", { name: "Não sei" });
  const avancar = page.getByRole("button", { name: /^(Começar|Continuar)$/ });
  for (let i = 0; i < 8; i++) {
    // Espera (sem pressa: o dev server compila a rota na 1ª vez) o que vier primeiro: a pergunta ou um passo de ensino.
    await naoSei.or(avancar).first().waitFor({ state: "visible", timeout: 20_000 });
    if (await naoSei.isVisible()) return;
    await avancar.first().click();
  }
  await naoSei.waitFor({ state: "visible", timeout: 5_000 });
}

/** Índice da alternativa correta lido das props do React (`exercise.correta`), ou null se não for múltipla escolha. */
async function gabaritoDoPlayer(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- estado local dinâmico de fixture E2E
    const radio = document.querySelector('[role="radio"]') as (Element & Record<string, any>) | null;
    if (!radio) return null;
    const chave = Object.keys(radio).find((k) => k.startsWith("__reactFiber$"));
    let fiber = chave ? radio[chave] : null;
    while (fiber) {
      const ex = fiber.memoizedProps?.exercise;
      if (ex && typeof ex.correta === "number") return ex.correta as number;
      fiber = fiber.return;
    }
    return null;
  });
}

/** Responde até a folha exibir o `resultado` pedido (procura ao longo das questões, no máximo 10). */
async function responderAte(page: Page, fluxo: FluxoFeedback, resultado: ResultadoFeedback) {
  const folha = page.locator(FOLHA);
  for (let q = 0; q < 10; q++) {
    if (resultado === "nao-sei") {
      await page.getByRole("button", { name: "Não sei" }).click();
      await folha.waitFor({ timeout: 15_000 });
      return;
    }
    if (fluxo === "study") {
      const corpo = await page.locator("body").innerText();
      const item = QUESTIONS.find((x) => corpo.includes(x.statement));
      expect(item, "questão do /study encontrada em src/data/questions.ts").toBeTruthy();
      const botoes = page.locator("div.mt-5.flex.flex-col.gap-3 > button");
      const n = await botoes.count();
      const certa = item!.alternatives.findIndex((a) => a.key === item!.correct);
      await botoes.nth(resultado === "acerto" ? certa : (certa + 1) % n).click();
      await page.getByRole("button", { name: "Responder" }).click();
    } else {
      const radios = page.locator('[role="radio"]');
      if ((await radios.count()) >= 2) {
        const certa = await gabaritoDoPlayer(page);
        const n = await radios.count();
        const alvo = certa === null ? 0 : resultado === "acerto" ? certa : (certa + 1) % n;
        await radios.nth(alvo).click();
        await page.getByRole("button", { name: "Verificar" }).click();
      } else {
        // Exercício que não é múltipla escolha (ordenar, parear…): pula com "Não sei" e tenta a próxima.
        await page.getByRole("button", { name: "Não sei" }).click();
      }
    }
    await folha.waitFor({ timeout: 15_000 });
    if ((await folha.getAttribute("data-resultado")) === resultado) return;
    await page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ }).click();
    await ateAPergunta(page, fluxo);
  }
  throw new Error(`não obtive a folha de "${resultado}" em 10 questões do fluxo ${fluxo}`);
}

/** Canais RGB (0–255) e alfa (0–1) de um `getComputedStyle().backgroundColor` (rgb/rgba/color(srgb…)). */
function lerCor(css: string): { r: number; g: number; b: number; a: number } {
  const n = (css.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
  const srgb = css.startsWith("color(srgb");
  const k = srgb ? 255 : 1;
  return { r: n[0] * k, g: n[1] * k, b: n[2] * k, a: n.length > 3 ? n[3] : 1 };
}

async function conferirFolhaOpaca(page: Page, resultado: ResultadoFeedback, onde: string) {
  const folha = page.locator(FOLHA);
  // A folha sobe com `anim-slide-up`: mede só depois dela.
  await folha.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)).then(() => undefined));
  const m = await folha.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const topo = document.elementsFromPoint(r.left + r.width / 2, Math.min(r.top + r.height / 2, innerHeight - 2));
    const antes: string[] = [];
    for (const t of topo) {
      if (t === el) break;
      if (!el.contains(t)) antes.push(`<${t.tagName.toLowerCase()} class="${(t.getAttribute("class") ?? "").slice(0, 60)}">`);
      else break; // descendente: ainda é a folha
    }
    let opac = 1;
    for (let n: Element | null = el; n; n = n.parentElement) opac *= Number(getComputedStyle(n).opacity);
    return { fundo: getComputedStyle(el).backgroundColor, cobertoPor: antes, opac, naLista: topo.includes(el) };
  });
  const c = lerCor(m.fundo);
  expect(c.a, `${onde}: alfa do fundo da folha (${m.fundo})`).toBe(1);
  expect(m.naLista, `${onde}: a folha está no ponto central`).toBe(true);
  expect(m.cobertoPor, `${onde}: nada por cima da folha`).toEqual([]);
  expect(m.opac, `${onde}: opacidade efetiva da folha e dos ancestrais`).toBe(1);
  if (resultado === "acerto") expect(c.g, `${onde}: matiz de acerto (${m.fundo})`).toBeGreaterThan(c.r);
  if (resultado === "erro") expect(c.r, `${onde}: matiz de erro (${m.fundo})`).toBeGreaterThan(c.g);
  if (resultado === "nao-sei") {
    expect(Math.abs(c.r - c.g), `${onde}: "Não sei" neutro (${m.fundo})`).toBeLessThanOrEqual(4);
    expect(Math.abs(c.g - c.b), `${onde}: "Não sei" neutro (${m.fundo})`).toBeLessThanOrEqual(4);
  }
}

async function continuarAcessivel(page: Page, onde: string) {
  const continuar = page.getByRole("button", { name: /^(Continuar|Ver resultado)$/ });
  await expect(continuar, `${onde}: botão de avançar`).toBeVisible();
  await continuar.scrollIntoViewIfNeeded();
  const r = await continuar.evaluate((el) => {
    const b = el.getBoundingClientRect();
    const alvo = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return { dentro: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, recebe: !!alvo && (alvo === el || el.contains(alvo)) };
  });
  expect(r.dentro, `${onde}: "Continuar" inteiro dentro da janela`).toBe(true);
  expect(r.recebe, `${onde}: "Continuar" recebe o toque (nada por cima)`).toBe(true);
}

test.describe("folha de feedback: fundo computado opaco (docs/36 T-08.10, B1/B4)", () => {
  for (const fluxo of ["aula", "atividade", "study", "legado"] as const) {
    for (const resultado of ["acerto", "erro", "nao-sei"] as const) {
      for (const tema of ["light", "dark"] as const) {
        test(`${fluxo} · ${resultado} · ${tema}: alfa 1, nada por cima, "Continuar" acessível`, async ({ page }) => {
          await prepararFluxo(page, fluxo, tema);
          await ateAPergunta(page, fluxo);
          await responderAte(page, fluxo, resultado);
          const onde = `${fluxo}/${resultado}/${tema}`;
          await conferirFolhaOpaca(page, resultado, onde);
          await continuarAcessivel(page, onde);

          // Explicação expandida: continua opaca e o botão de avançar continua acessível.
          const ver = page.getByRole("button", { name: /^Ver resolução$/ });
          if (await ver.count()) {
            await ver.click();
            await expect(page.getByRole("button", { name: /^Ocultar resolução$/ })).toBeVisible();
            await conferirFolhaOpaca(page, resultado, `${onde} (resolução aberta)`);
            await continuarAcessivel(page, `${onde} (resolução aberta)`);
          }
        });
      }
    }
  }
});

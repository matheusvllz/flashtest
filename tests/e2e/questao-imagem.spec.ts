import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Questão com imagem e tabela (spec 50 §5.9.3, §8; T-50.9.2, RF-21) e página `/creditos` (T-50.9.7, RF-28).
 *
 * A questão é um item de TESTE, não um item oficial: o pacote real de biologia é interceptado e a primeira questão
 * da aula `aula-bio-ecologia-relacoes-ecossistema` é trocada por um exercício com imagem marcada, imagem sem marcador,
 * tabela e uma alternativa-imagem — renderizado pelos componentes reais do player. Nada disso existe no app; as
 * imagens vêm de `tests/e2e/fixtures/questao-imagem.webp` via `page.route`.
 */

const AULA = "aula-bio-ecologia-relacoes-ecossistema";
const IMAGEM = readFileSync(join(process.cwd(), "tests", "e2e", "fixtures", "questao-imagem.webp"));

const ALT_GRAFICO = "Gráfico de barras de teste com cinco colunas";
const ALT_SEM_MARCADOR = "Quadro de teste desenhado acima do enunciado";
const ALT_ALTERNATIVA = "Gráfico de teste da alternativa B";

const EXERCICIO_DE_TESTE = {
  type: "multipla-escolha",
  pergunta: [
    "Primeiro trecho de teste do enunciado.",
    "[[imagem:0]]",
    "Segundo trecho de teste, entre a figura e a tabela.",
    "[[tabela:0]]",
    "Qual alternativa é a de teste?",
  ].join("\n"),
  imagens: [
    {
      url: "/content/img/teste/grafico.webp",
      alt: ALT_GRAFICO,
      credito: "Imagem de teste do Foca",
      largura: 960,
      altura: 480,
      descricao: "Cinco barras cinzas de alturas diferentes sobre um eixo horizontal.",
      altAutomatico: true,
    },
    {
      url: "/content/img/teste/sem-marcador.webp",
      alt: ALT_SEM_MARCADOR,
      largura: 480,
      altura: 480,
    },
  ],
  tabelas: [
    {
      legenda: "Tabela de teste",
      cabecalho: ["Ano", "Valor", "Observação"],
      linhas: [
        ["2019", "10", "Primeira linha de teste"],
        ["2020", "12", "Segunda linha de teste"],
      ],
    },
  ],
  opcoes: [
    "Alternativa de texto",
    "Alternativa B (imagem)",
    "Outra de texto",
    "Mais uma de texto",
    "Última de texto",
  ],
  opcoesImagem: [
    null,
    {
      url: "/content/img/teste/alternativa-b.webp",
      alt: ALT_ALTERNATIVA,
      largura: 960,
      altura: 480,
    },
    null,
    null,
    null,
  ],
  correta: 0,
  explicacao: "Explicação de teste.",
};

interface Pacote {
  items: Array<{ id: string; exercise: unknown }>;
  lessons: Array<{ id: string; steps: Array<{ kind: string; exerciseId?: string }> }>;
}

/** Serve a imagem de fixture e troca a primeira questão da aula pelo exercício de teste. */
async function prepararQuestaoDeTeste(page: Page) {
  await page.route("**/content/img/**", (rota) =>
    rota.fulfill({ status: 200, contentType: "image/webp", body: IMAGEM }),
  );
  await page.route(/\/content\/v1\/bio\.[^/]+\.json$/, async (rota) => {
    const resposta = await rota.fetch();
    const pacote = (await resposta.json()) as Pacote;
    const aula = pacote.lessons.find((l) => l.id === AULA);
    const primeira = aula?.steps.find((s) => s.kind === "question")?.exerciseId;
    const item = pacote.items.find((i) => i.id === primeira);
    if (!item)
      throw new Error(`questao-imagem: a aula ${AULA} mudou; escolha outra aula com questão`);
    item.exercise = EXERCICIO_DE_TESTE;
    await rota.fulfill({ response: resposta, json: pacote });
  });
}

/** Abre a aula e avança (Começar/Continuar) até a primeira questão. */
async function abrirQuestao(page: Page) {
  await prepararQuestaoDeTeste(page);
  await page.goto(`/learn/${AULA}`, { waitUntil: "domcontentloaded" });
  const verificar = page.getByRole("button", { name: "Verificar" });
  for (let i = 0; i < 10 && !(await verificar.isVisible()); i++) {
    const avancar = page.getByRole("button", { name: /^(Começar|Continuar)$/ });
    await expect(avancar.or(verificar).first()).toBeVisible({ timeout: 15_000 });
    if (await verificar.isVisible()) break;
    await avancar.first().click();
  }
  await expect(verificar).toBeVisible();
}

function seriasOuCriticas(violacoes: Array<{ id: string; impact?: string | null }>) {
  return violacoes
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => v.id);
}

test.describe("questão com imagem e tabela (spec 50 §5.9.3)", () => {
  test("figura, descrição, tabela e alternativa-imagem acessíveis, na posição do original", async ({
    page,
  }) => {
    await abrirQuestao(page);

    // Alt presente; a imagem carregou (fixture) com as dimensões reservadas.
    const grafico = page.locator(`img[alt="${ALT_GRAFICO}"]`);
    await expect(grafico).toHaveCount(1);
    await expect(grafico).toHaveAttribute("width", "960");
    await expect(grafico).toHaveAttribute("height", "480");
    await expect(grafico).toHaveAttribute("loading", "lazy");
    await expect
      .poll(() => grafico.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);

    // Ordem do original: a imagem sem marcador vem acima do texto; a marcada, entre os dois trechos; depois a tabela.
    const ordem = await page.evaluate(
      ([semMarcador, marcada]) => {
        const alvos = [
          document.querySelector(`img[alt="${semMarcador}"]`),
          [...document.querySelectorAll("p")].find((p) =>
            p.textContent?.startsWith("Primeiro trecho de teste"),
          ),
          document.querySelector(`img[alt="${marcada}"]`),
          [...document.querySelectorAll("p")].find((p) =>
            p.textContent?.startsWith("Segundo trecho de teste"),
          ),
          document.querySelector("table"),
          [...document.querySelectorAll("p")].find(
            (p) => p.textContent === "Qual alternativa é a de teste?",
          ),
        ];
        if (alvos.some((a) => !a)) return "faltou elemento";
        return alvos.every(
          (a, i) =>
            i === 0 || alvos[i - 1]!.compareDocumentPosition(a!) & Node.DOCUMENT_POSITION_FOLLOWING,
        );
      },
      [ALT_SEM_MARCADOR, ALT_GRAFICO],
    );
    expect(ordem).toBe(true);

    // Crédito e "Ver descrição" (disclosure), com o aviso de descrição automática.
    await expect(page.getByText("Imagem de teste do Foca")).toBeVisible();
    const verDescricao = page.getByRole("button", { name: "Ver descrição" });
    await expect(verDescricao).toHaveAttribute("aria-expanded", "false");
    await verDescricao.click();
    const esconder = page.getByRole("button", { name: "Esconder descrição" });
    await expect(esconder).toHaveAttribute("aria-expanded", "true");
    const painel = page.locator(`[id="${await esconder.getAttribute("aria-controls")}"]`);
    await expect(painel).toBeVisible();
    await expect(painel).toContainText("Cinco barras cinzas");
    await expect(painel).toContainText("Descrição gerada automaticamente.");

    // Imagem larga em retrato: o aviso aparece uma vez.
    await expect(page.getByText("Gire o celular para ver melhor")).toHaveCount(1);

    // Tabela: caption, cabeçalhos de coluna e contêiner rolável focável com nome.
    const tabela = page.locator("table");
    await expect(tabela.locator("caption")).toHaveText("Tabela de teste");
    await expect(tabela.locator('th[scope="col"]')).toHaveCount(3);
    const regiao = page.getByRole("region", { name: "Tabela de teste" });
    await expect(regiao).toHaveAttribute("tabindex", "0");

    // Alternativa-imagem: o leitor de tela ouve o rótulo e o alt; a imagem aparece no botão.
    const alternativa = page.getByRole("radio", {
      name: /Alternativa B \(imagem\).*Gráfico de teste da alternativa B/,
    });
    await expect(alternativa).toBeVisible();
    await expect(alternativa.locator(`img[alt="${ALT_ALTERNATIVA}"]`)).toBeVisible();
    await alternativa.click();
    await expect(alternativa).toHaveAttribute("aria-checked", "true");

    const axe = await new AxeBuilder({ page })
      .include("figure")
      .include("table")
      .include('[role="radiogroup"]')
      .analyze();
    expect(seriasOuCriticas(axe.violations)).toEqual([]);
  });

  test("tema escuro: a imagem fica sobre papel claro, sem inverter", async ({ page }) => {
    await abrirQuestao(page);
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    const botao = page.getByRole("button", { name: `Ampliar imagem: ${ALT_GRAFICO}` });
    const fundo = await botao.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(fundo).toBe("rgb(246, 245, 241)");
    const filtro = await page
      .locator(`img[alt="${ALT_GRAFICO}"]`)
      .evaluate((el) => getComputedStyle(el).filter);
    expect(filtro).toBe("none");
  });

  test("visualizador: abre por teclado, amplia por botão, teclado e pinça; Esc fecha e devolve o foco", async ({
    page,
  }) => {
    await abrirQuestao(page);
    const botaoImagem = page.getByRole("button", { name: `Ampliar imagem: ${ALT_GRAFICO}` });
    const anterior = page.getByRole("button", { name: `Ampliar imagem: ${ALT_SEM_MARCADOR}` });

    // Teclado: Tab a partir da imagem anterior chega ao botão da imagem; Enter abre.
    await anterior.focus();
    await page.keyboard.press("Tab");
    await expect(botaoImagem).toBeFocused();
    await page.keyboard.press("Enter");

    const dialogo = page.getByRole("dialog", { name: "Imagem da questão" });
    await expect(dialogo).toBeVisible();
    await expect(dialogo).toHaveAttribute("aria-modal", "true");
    await expect(dialogo.locator(`img[alt="${ALT_GRAFICO}"]`)).toBeVisible();
    const nivel = dialogo.locator('[aria-live="polite"]');
    await expect(nivel).toHaveText("Zoom 1×");

    // Botões: + e 2×.
    await dialogo.getByRole("button", { name: "Aumentar zoom" }).click();
    await expect(nivel).toHaveText("Zoom 1,5×");
    await dialogo.getByRole("button", { name: "2×", exact: true }).click();
    await expect(nivel).toHaveText("Zoom 2×");
    await expect(dialogo.getByRole("button", { name: "2×", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // Teclado: + amplia, setas movem, − reduz, 0 volta a 1×.
    await page.keyboard.press("+");
    await expect(nivel).toHaveText("Zoom 2,5×");
    const img = dialogo.locator("img");
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => img.evaluate((el) => (el as HTMLElement).style.transform))
      .toMatch(/translate3d\(-\d/);
    await page.keyboard.press("-");
    await expect(nivel).toHaveText("Zoom 2×");
    await page.keyboard.press("0");
    await expect(nivel).toHaveText("Zoom 1×");

    // Axe com o visualizador aberto.
    const axe = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(seriasOuCriticas(axe.violations)).toEqual([]);

    // Esc fecha e o foco volta ao botão da imagem.
    await page.keyboard.press("Escape");
    await expect(dialogo).toHaveCount(0);
    await expect(botaoImagem).toBeFocused();
  });

  test("visualizador: abre por clique, pinça com dois dedos amplia, Fechar devolve o foco", async ({
    page,
  }) => {
    await abrirQuestao(page);
    const botaoImagem = page.getByRole("button", { name: `Ampliar imagem: ${ALT_GRAFICO}` });
    await botaoImagem.click();
    const dialogo = page.getByRole("dialog", { name: "Imagem da questão" });
    await expect(dialogo).toBeVisible();
    const nivel = dialogo.locator('[aria-live="polite"]');

    // Pinça: dois ponteiros de toque se afastam do centro (100 px → 200 px de distância = 2×).
    const area = dialogo.getByTestId("visualizador-area");
    const caixa = (await area.boundingBox())!;
    const cx = caixa.x + caixa.width / 2;
    const cy = caixa.y + caixa.height / 2;
    const toque = (tipo: string, id: number, x: number) =>
      area.dispatchEvent(tipo, {
        pointerId: id,
        pointerType: "touch",
        isPrimary: id === 1,
        clientX: x,
        clientY: cy,
        button: 0,
        buttons: 1,
      });
    await toque("pointerdown", 1, cx - 50);
    await toque("pointerdown", 2, cx + 50);
    await toque("pointermove", 1, cx - 75);
    await toque("pointermove", 2, cx + 75);
    await toque("pointermove", 1, cx - 100);
    await toque("pointermove", 2, cx + 100);
    await toque("pointerup", 1, cx - 100);
    await toque("pointerup", 2, cx + 100);
    await expect(nivel).toHaveText("Zoom 2×");

    await dialogo.getByRole("button", { name: "Fechar" }).click();
    await expect(dialogo).toHaveCount(0);
    await expect(botaoImagem).toBeFocused();
  });

  test("alternativa-imagem: botão de ampliar separado abre o visualizador com o nome da alternativa", async ({
    page,
  }) => {
    await abrirQuestao(page);
    const ampliar = page.getByRole("button", { name: "Ampliar imagem: Alternativa B (imagem)" });
    await ampliar.click();
    const dialogo = page.getByRole("dialog", { name: "Alternativa B (imagem)" });
    await expect(dialogo.locator(`img[alt="${ALT_ALTERNATIVA}"]`)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialogo).toHaveCount(0);
    await expect(ampliar).toBeFocused();
    // Ampliar não escolhe a alternativa.
    await expect(page.getByRole("radio", { name: /Alternativa B \(imagem\)/ })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });
});

test.describe("página de créditos (spec 50 §5.9.2)", () => {
  // Pública: abre sem conta.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("/creditos carrega com a licença do INEP, os links oficiais e sem violação séria de acessibilidade", async ({
    page,
  }) => {
    await page.goto("/creditos", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/creditos$/);
    await expect(page.getByRole("heading", { level: 1, name: "Créditos e fontes" })).toBeVisible();
    await expect(page).toHaveTitle("Créditos e fontes — Foca");
    await expect(
      page.getByText("Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Provas e gabaritos no site do INEP/ }),
    ).toHaveAttribute(
      "href",
      "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos",
    );
    await expect(page.getByRole("link", { name: /Licença CC BY-ND 3.0/ })).toHaveAttribute(
      "href",
      "https://creativecommons.org/licenses/by-nd/3.0/deed.pt_BR",
    );
    await expect(page.getByRole("heading", { name: "Questões do Foca" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Pedir a retirada de uma questão" }),
    ).toBeVisible();

    const axe = await new AxeBuilder({ page }).analyze();
    expect(seriasOuCriticas(axe.violations)).toEqual([]);
  });
});

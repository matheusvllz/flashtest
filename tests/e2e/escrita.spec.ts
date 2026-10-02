/**
 * Tarefas de escrita (spec 50 §5.10, RF-24): o Free abre o nó "Escreva" depois da lição, escreve (rascunho salvo no
 * aparelho a cada 5 s, sobrevive a recarregar), envia e recebe a checagem automática e o texto-modelo, sem nenhum
 * comentário da IA. As regras do servidor (bloco, XP da primeira vez, nenhuma chamada à IA para Free e Basic) têm
 * testes próprios em tests/unit/servidor/escrita.test.ts.
 */
import { expect, test, type Page } from "@playwright/test";
import { criarContaVerificada, entrarPelaApi } from "./helpers/conta";
import { comLicaoLegadaConcluida, seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 150_000 });

const TAREFA = "argumentacao-complete-paragrafo";
const TEXTO =
  "Isso acontece porque o celular fica na cama até tarde e cada vídeo novo convida a ficar acordado. Por isso, o estudante chega cansado à escola e presta menos atenção. Dessa forma, o excesso de telas afeta a saúde mental.";

async function entrar(page: Page) {
  const email = await criarContaVerificada(page.context().request);
  await entrarPelaApi(page.context().request, email);
  const base = { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } };
  await seedOnce(page, comLicaoLegadaConcluida("redacao-argumentacao-01-tipos-argumento", base));
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  // A lição semeada é progresso local: leva para a conta (a tela pergunta antes de vincular).
  await page.getByRole("button", { name: "Levar para a conta" }).click({ timeout: 30_000 });
  await expect
    .poll(
      () => page.evaluate(() => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}").account?.userId ?? null).catch(() => null),
      { timeout: 30_000 },
    )
    .not.toBeNull();
}

test("Free: abre o nó Escreva, o rascunho sobrevive a recarregar, envia e recebe a checagem automática sem IA", async ({ page }) => {
  await entrar(page);

  // Pedidos de servidor feitos pela tela: nenhum vai a um provedor de IA (o navegador nunca fala com a OpenAI).
  const externos: string[] = [];
  page.on("request", (r) => {
    if (/openai\.com/.test(r.url())) externos.push(r.url());
  });

  await page.goto("/redacao", { waitUntil: "domcontentloaded" });
  const no = page.getByTestId(`no-escreva-${TAREFA}`);
  await expect(no).toBeVisible({ timeout: 30_000 });
  await no.click();
  await expect(page).toHaveURL(new RegExp(`/redacao/escreva/${TAREFA}`), { timeout: 20_000 });
  await expect(page.getByTestId("tarefa-tema")).toContainText("excesso de telas");
  await expect(page.getByText("Não é tema oficial nem previsão de prova.")).toBeVisible();
  await expect(page.getByTestId("tarefa-apoio")).toContainText("O uso excessivo de telas prejudica o sono");

  const caixa = page.getByTestId("tarefa-texto");
  await caixa.fill(TEXTO);
  await expect(page.getByText("Rascunho salvo neste aparelho.")).toBeVisible({ timeout: 15_000 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("tarefa-texto")).toHaveValue(TEXTO, { timeout: 30_000 });

  await page.getByRole("button", { name: "Enviar texto" }).click();
  await expect(page.getByTestId("tarefa-enviada")).toContainText("Texto enviado.", { timeout: 30_000 });
  await expect(page.getByTestId("tarefa-enviada")).toContainText("+10 XP");
  const checagem = page.getByTestId("tarefa-checagem");
  await expect(checagem).toContainText("Checagem automática: olha a estrutura, não dá nota");
  await expect(checagem.locator("[data-item]")).not.toHaveCount(0);
  await expect(page.getByTestId("tarefa-modelo")).toContainText("Texto-modelo comentado");
  await expect(page.getByTestId("tarefa-comentario-ia")).toHaveCount(0);
  await expect(page.getByTestId("tarefa-convite-ia")).toContainText("No Pro, a Foca IA também comenta o seu trecho.");
  expect(externos).toEqual([]);

  // O rascunho saiu do aparelho ao enviar.
  const rascunho = await page.evaluate((id) => JSON.parse(localStorage.getItem("foca.state.v3") ?? "{}").rascunhosDeEscrita?.[id] ?? null, TAREFA);
  expect(rascunho).toBeNull();

  // De volta à trilha de redação: o nó mostra "Enviada".
  await page.goto("/redacao", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId(`no-escreva-${TAREFA}`)).toContainText("Enviada", { timeout: 30_000 });
  // Nó de uma lição ainda não feita fica fechado.
  await expect(page.getByTestId("no-escreva-argumentacao-coesao")).toContainText("Termine a lição anterior para abrir");
});

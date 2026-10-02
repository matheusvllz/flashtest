/**
 * Vidas, anúncio recompensado e protetores avulsos (spec 49 T-49.5.2, T-49.6.2–6.4, T-49.7.3; RF-5–RF-10).
 * No servidor local, vidas e anúncios (provedor falso) ligam só para contas `e2e-vidas…`; as outras suítes seguem
 * sem vidas. A regra do servidor (perder, renovar, +1 por dia) tem testes próprios em tests/unit/servidor.
 */
import { expect, test, type Page } from "@playwright/test";
import { QUESTIONS } from "../../src/data/questions";
import { CHAVE_SYNC_PAUSADA_DEV } from "../../src/lib/sync/motor";
import { criarContaVerificada, emailUnico, entrarPelaApi } from "./helpers/conta";
import { USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 120_000 });

function hoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function contaComVidas(page: Page, restantes: number, pausarSync: boolean) {
  const email = emailUnico("e2e-vidas");
  await criarContaVerificada(page.context().request, email);
  await entrarPelaApi(page.context().request, email);
  const sessao = await (await page.context().request.get("/api/auth/get-session")).json();
  const userId = sessao.user.id as string;
  const estado = {
    ...USUARIO_ONBOARDED,
    prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 },
    account: { userId, outbox: [], docRev: 0, docAssinatura: null, aparelhoId: "e2e", plano: "gratis", protetoresMax: 2, vidas: { dia: hoje(), restantes, anuncioUsado: false } },
  };
  await page.addInitScript(
    ({ raw, pausar, chave }) => {
      if (!localStorage.getItem("foca.state.v3")) localStorage.setItem("foca.state.v3", JSON.stringify(raw));
      if (pausar) localStorage.setItem(chave, "1");
    },
    { raw: estado, pausar: pausarSync, chave: CHAVE_SYNC_PAUSADA_DEV },
  );
  return email;
}

/** Na aula de 60 s, marca uma alternativa ERRADA da questão na tela. */
async function marcarErrada(page: Page) {
  await page.locator("[data-opcao]").first().waitFor({ timeout: 30_000 });
  const texto = await page.locator("main").innerText();
  const q = QUESTIONS.find((x) => texto.includes(x.statement.slice(0, 60)));
  if (!q) throw new Error("questão da aula não encontrada no banco");
  const errada = q.alternatives.find((a) => a.key !== q.correct)!;
  await page.locator("[data-opcao]").filter({ hasText: errada.text.slice(0, 40) }).first().click();
}

test("Free sem vidas: a próxima resposta abre a folha; o anúncio de teste dá 1 vida", async ({ page }) => {
  await contaComVidas(page, 1, true);
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("indicador-vidas")).toContainText("1", { timeout: 20_000 });

  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await marcarErrada(page);
  await page.getByRole("button", { name: "Responder" }).click();
  // A explicação aparece inteira mesmo perdendo a última vida.
  await page.locator('[role="status"]').first().waitFor();
  await page.getByRole("button", { name: /^(Continuar|Próxima)/ }).first().click();

  await marcarErrada(page);
  await page.getByRole("button", { name: "Responder" }).click();
  const folha = page.getByTestId("folha-sem-vidas");
  await expect(folha).toBeVisible();
  await expect(folha).toContainText("Elas voltam amanhã.");
  await expect(page.getByText(/você perdeu|cuidado|restam/i)).toHaveCount(0);

  await folha.getByRole("button", { name: "Assistir e ganhar 1 vida" }).click();
  // Primeira vez: a decisão de cookies vem antes, com os dois botões do mesmo peso.
  const cookies = page.getByTestId("folha-cookies-anuncio");
  await expect(cookies).toBeVisible();
  await cookies.getByRole("button", { name: "Recusar" }).click();
  await page.getByRole("button", { name: "Concluir anúncio de teste" }).click();
  await expect(folha).toBeHidden({ timeout: 15_000 });
  // A vida do anúncio vem do servidor (o motor está pausado neste teste, então o servidor ainda não viu os erros).
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("indicador-vidas")).toContainText(/[1-9]/, { timeout: 20_000 });
});

test("Free compra 1 protetor: pagamento simulado entra no estoque", async ({ page }) => {
  await contaComVidas(page, 5, false);
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.getByTestId("indicador-sequencia").click({ timeout: 20_000 });
  await page.getByTestId("comprar-protetores").click();
  const compra = page.getByTestId("compra-protetores");
  await expect(compra).toContainText("Seu plano guarda até 2.");
  await expect(compra.getByRole("radio", { name: /3 protetores por R\$ 12,90/ })).toBeDisabled();
  await compra.getByRole("radio", { name: /1 protetor por R\$ 5,90/ }).check();
  await compra.getByRole("checkbox").check();
  await compra.getByRole("button", { name: "Ir para o pagamento" }).click();
  await page.getByRole("button", { name: "Simular pagamento aprovado" }).click({ timeout: 20_000 });
  await expect(page.getByRole("status")).toHaveText("Pronto, os protetores entraram no seu estoque.", { timeout: 20_000 });
});

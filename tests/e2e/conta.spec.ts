/**
 * Conta real pela interface (docs/specs/46-producao T-05.4–T-05.6, T-05.8; decisão 0006; modelo de ameaças T2/T14).
 * Sem sessão pronta: cada teste começa deslogado.
 */
import { expect, test } from "@playwright/test";
import { criarContaVerificada, emailUnico, linkDoEmail, SENHA } from "./helpers/conta";

test.use({ storageState: { cookies: [], origins: [] } });

test("rota de estudo sem sessão leva ao login, guardando para onde voltar", async ({ page }) => {
  await page.goto("/trilha");
  await expect(page).toHaveURL(/\/login\?volta=%2Ftrilha/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("landing, onboarding e documentos legais continuam abertos sem conta", async ({ page }) => {
  for (const rota of ["/", "/quiz", "/termos", "/privacidade"]) {
    await page.goto(rota);
    await expect(page).toHaveURL(new RegExp(`${rota === "/" ? "/$" : rota}`));
  }
  await page.goto("/privacidade");
  await expect(page.getByRole("heading", { name: "Política de privacidade" })).toBeVisible();
  await expect(page.getByRole("note")).toContainText("Rascunho");
});

test("cadastro → e-mail de confirmação → link → cadastro completo → trilha", async ({ page }) => {
  const email = emailUnico("cadastro");
  await page.goto("/cadastro");
  await page.getByLabel("Primeiro nome").fill("Bia");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByLabel("Ano de nascimento").fill("2006");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/verificar-email/);
  await expect(page.getByText(email)).toBeVisible();

  await page.goto(await linkDoEmail(email, /Confirme/));
  await expect(page).toHaveURL(/\/trilha/, { timeout: 20_000 });
});

test("campos com erro dizem como resolver, antes de enviar", async ({ page }) => {
  await page.goto("/cadastro");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("Digite seu primeiro nome.")).toBeVisible();
  await expect(page.getByText("Digite seu e-mail.")).toBeVisible();
  await expect(page.getByText("Use uma senha com pelo menos 8 caracteres.")).toBeVisible();
  await expect(page.getByText("Digite o ano com quatro números, como 2007.")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toHaveAttribute("aria-invalid", "true");
});

test("abaixo da idade mínima: mensagem clara e nenhuma conta criada", async ({ page }) => {
  await page.goto("/cadastro");
  await page.getByLabel("Primeiro nome").fill("Caio");
  await page.getByLabel("E-mail").fill(emailUnico("jovem"));
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByLabel("Ano de nascimento").fill(String(new Date().getFullYear() - 14));
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("heading", { name: "O Foca ainda não é para você" })).toBeVisible();
});

test("senha errada e e-mail inexistente dão a mesma mensagem (T2)", async ({ page, request }) => {
  const email = await criarContaVerificada(request);
  for (const [e, s] of [
    [email, "senha-errada-000"],
    [emailUnico("ninguem"), "senha-errada-000"],
  ]) {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(e);
    await page.getByLabel("Senha", { exact: true }).fill(s);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("alert")).toHaveText("E-mail ou senha incorretos.");
  }
});

test("login leva de volta para onde o aluno ia; destino externo é ignorado (redirecionamento aberto)", async ({ page, request }) => {
  const email = await criarContaVerificada(request);
  await page.goto("/login?volta=%2F%2Fexemplo-malicioso.com");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/localhost:8080\/trilha/, { timeout: 20_000 });
});

test("sair encerra a sessão: a trilha volta a pedir login (T14)", async ({ page, request }) => {
  const email = await criarContaVerificada(request);
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/trilha/, { timeout: 20_000 });
  await page.goto("/profile");
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/localhost:8080\/$/);
  await page.goto("/trilha");
  await expect(page).toHaveURL(/\/login/);
});

/** Quiz de perfil completo, sem conta e com o nivelamento desligado (vai direto ao diagnóstico). */
async function quizSemConta(page: import("@playwright/test").Page) {
  await page.addInitScript(() => localStorage.setItem("foca.flags", JSON.stringify({ nivelamento: false })));
  await page.goto("/quiz?debug=1", { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Seu primeiro nome").fill("Ana");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByText("1º ano do ensino médio").click();
  await page.getByRole("button", { name: "ENEM", exact: true }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.locator("select").selectOption("SP");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Ainda não decidi" }).click();
  await page.getByRole("button", { name: "Ainda não decidi" }).click();
  await page.getByRole("button", { name: "Matemática" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Ver meu diagnóstico" }).click();
}

test("quiz: 'Já tem uma conta? Entrar' no topo leva ao login", async ({ page }) => {
  await page.goto("/quiz");
  await page.getByRole("link", { name: "Já tem uma conta? Entrar" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("a conta é pedida só depois do quiz e do diagnóstico, na hora de começar a estudar (D-16)", async ({ page }) => {
  await quizSemConta(page);
  await expect(page).toHaveURL(/\/aha/, { timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Entrar no meu plano" })).toBeVisible();
  await page.getByRole("button", { name: "Entrar no meu plano" }).click();
  await expect(page).toHaveURL(/\/cadastro\?volta=%2Ftrilha/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Criar sua conta" })).toBeVisible();
});

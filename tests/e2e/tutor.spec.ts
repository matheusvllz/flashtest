import { expect, test } from "@playwright/test";

/**
 * Critério A2 (docs/20 §20) + regressão do B2 (§3): errar não pode abrir o
 * balão nem enviar mensagem sozinho — só o CTA explícito abre.
 *
 * "Explicar melhor" virou o nível 3 da explicação em camadas na Fase 7
 * (docs/30 §17.2, AC-7.2): o CLIQUE em si já é a ação explícita do aluno
 * ("me ensina isso do começo"), então ele agora abre o balão E dispara UM
 * envio automático — não é o mesmo "auto-envio ao errar" que este teste
 * prova que continua proibido (linhas antes do clique).
 */
test("A2 — tutor não abre nem envia mensagem automaticamente ao errar", async ({ page }) => {
  const chamadasApi: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("_serverFn")) chamadasApi.push(req.url());
  });

  await page.goto("/study", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Responder" }).waitFor();
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.locator('[role="status"]').waitFor();

  // Balão fechado logo após errar — nenhum autoenvio no ato de responder.
  await expect(page.locator('header:has-text("Foca")')).not.toBeVisible();
  expect(chamadasApi).toHaveLength(0);

  const explicar = page.getByRole("button", { name: "Explicar melhor" });
  if (!(await explicar.isVisible())) test.skip(true, "resposta escolhida era a correta");

  await explicar.click();
  await expect(page.locator('header:has-text("Foca")')).toBeVisible();

  // Nível 3 (docs/30 §17.2): abre JÁ com a mensagem "me ensina do começo"
  // enviada — uma vez só, disparada pelo próprio clique (autoSend do store).
  await expect(page.locator(".bg-mar.px-4.py-2\\.5")).toHaveCount(1);
  await expect(page.locator(".bg-mar.px-4.py-2\\.5")).toContainText("Me ensina isso do começo");
  await expect.poll(() => chamadasApi.length).toBe(1);
});

/**
 * RF-18 / G13 (docs/36 T-05.5) — tutor sem rede não trava o estudo nem a
 * correção. Padrão de URL da server function conferido no dev server
 * (28/09/2026): `POST /_serverFn/<id>` — o que o resto da suíte já casa com
 * `req.url().includes("_serverFn")`; aqui toda rota que casa com `_serverFn` (glob no `page.route`) é abortada.
 *
 * Comportamento real (registrado no docs/37): quando a CHAMADA em si falha, o
 * balão mostra `COPY.tutor.falhaResposta` ("Não consegui responder agora.
 * Tente de novo."); o `localFallback` de `tutor-prompt.ts` é o fallback do
 * SERVIDOR (sem chave/erro upstream) e só chega ao cliente quando o servidor
 * responde — não é exercido com a rede cortada. Nenhuma mudança de código foi
 * necessária: o tutor continua estritamente manual.
 */
test("RF-18 — sem rede: errar não abre o tutor, 'Explicar melhor' mostra o aviso local e a aula continua", async ({ page }) => {
  const tentativasApi: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("_serverFn")) tentativasApi.push(req.url());
  });
  await page.route("**/_serverFn/**", (rota) => rota.abort());

  await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Começar" }).waitFor({ timeout: 15_000 });
  await page.getByRole("button", { name: "Começar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click(); // teach

  // Questão 1: erra de propósito (gabarito real: 1; escolhe 0) — mesmo caminho de lesson-v2.spec.ts.
  await page.getByRole("button", { name: "Verificar" }).waitFor();
  await page.locator('[role="radio"]').nth(0).click();
  await page.getByRole("button", { name: "Verificar" }).click();
  await page.locator('[role="status"]').waitFor();

  // Errar NÃO abre o tutor nem tenta rede — nem depois de esperar.
  await page.waitForTimeout(2_000);
  await expect(page.locator('[aria-label="Fechar tutor"]')).toHaveCount(0);
  expect(tentativasApi).toHaveLength(0);

  // Só o CTA explícito abre; o envio automático dele falha na rede e vira o aviso local.
  await page.getByRole("button", { name: "Explicar melhor" }).click();
  await expect(page.locator('[aria-label="Fechar tutor"]')).toBeVisible();
  await expect(page.getByText("Não consegui responder agora. Tente de novo.")).toHaveCount(1, { timeout: 10_000 });
  expect(tentativasApi.length).toBeGreaterThanOrEqual(1);

  // O balão continua usável: uma pergunta manual também falha com o mesmo aviso, sem travar.
  await page.getByPlaceholder("Pergunta qualquer coisa...").fill("Pode explicar de outro jeito?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Não consegui responder agora. Tente de novo.")).toHaveCount(2, { timeout: 10_000 });

  // A correção e o estudo seguem: fecha o balão, a folha de feedback continua, "Continuar" avança
  // pro próximo passo e a lição chega na questão seguinte.
  await page.locator('[aria-label="Fechar tutor"]').click();
  await page.getByRole("button", { name: "Continuar" }).click(); // segue do checkpoint
  await page.getByRole("button", { name: "Continuar" }).click(); // teach: "Exemplo: 15% de 500"
  await page.getByRole("button", { name: "Verificar" }).waitFor({ timeout: 10_000 });
  await expect(page.locator('[role="radio"]').first()).toBeVisible();
});

/**
 * Lembrete do dia no Perfil (spec 50 §5.2.5, T-50.15.3). O Chromium de teste não alcança o serviço de push de
 * verdade (FCM), então a assinatura do navegador é trocada por uma falsa (`PushManager` no `addInitScript`); o resto
 * é real: permissão (`grantPermissions`), worker `/sw.js`, funções de servidor e banco. As regras de envio têm teste
 * com relógio falso em tests/unit/servidor/lembretes.test.ts. Teste em aparelho real: T-50.15.5 (proprietário).
 *
 * O servidor de teste liga o lembrete com chaves descartáveis (playwright.config.ts). Se um servidor já aberto não
 * tiver o lembrete ligado, a seção não aparece e os testes são pulados.
 */
import { expect, test, type Page } from "@playwright/test";
import { criarContaVerificada, entrarPelaApi } from "./helpers/conta";
import { seedOnce, USUARIO_ONBOARDED } from "./helpers/estado";

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 120_000 });

async function entrar(page: Page) {
  const email = await criarContaVerificada(page.context().request);
  await entrarPelaApi(page.context().request, email);
  await seedOnce(page, { ...USUARIO_ONBOARDED, prefs: { ...USUARIO_ONBOARDED.prefs, onboardingVersion: 2 } });
}

/** Abre o Perfil e devolve a seção, ou pula o teste se o servidor não tiver o lembrete ligado. */
async function secao(page: Page) {
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("perfil-nome")).toBeVisible({ timeout: 30_000 });
  const s = page.getByTestId("secao-lembrete");
  const apareceu = await s.waitFor({ timeout: 20_000 }).then(
    () => true,
    () => false,
  );
  test.skip(!apareceu, "servidor sem LEMBRETES_HABILITADO/VAPID (servidor reaproveitado)");
  return s;
}

/** Assinatura de push falsa (sem rede), guardada na aba para sobreviver ao recarregar. */
async function pushFalso(page: Page) {
  await page.addInitScript(() => {
    const CHAVE = "e2e.push";
    const criar = (endpoint: string, chave: number[]) => ({
      endpoint,
      options: { applicationServerKey: new Uint8Array(chave).buffer },
      toJSON: () => ({ endpoint, keys: { p256dh: "B".repeat(87), auth: "a".repeat(22) } }),
      unsubscribe: async () => {
        sessionStorage.removeItem(CHAVE);
        return true;
      },
    });
    const ler = () => {
      const bruto = sessionStorage.getItem(CHAVE);
      if (!bruto) return null;
      const { endpoint, chave } = JSON.parse(bruto) as { endpoint: string; chave: number[] };
      return criar(endpoint, chave);
    };
    PushManager.prototype.getSubscription = async function () {
      return ler() as unknown as PushSubscription;
    };
    PushManager.prototype.subscribe = async function (opcoes?: PushSubscriptionOptionsInit) {
      const chave = Array.from(new Uint8Array(opcoes?.applicationServerKey as ArrayBuffer));
      const endpoint = `https://fcm.googleapis.com/fcm/send/e2e-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(CHAVE, JSON.stringify({ endpoint, chave }));
      return ler() as unknown as PushSubscription;
    };
  });
}

/**
 * Permissão de notificação simulada: no Chromium sem janela, `Notification.permission` continua "denied" mesmo com
 * `context.grantPermissions(["notifications"])`. `inicial` é o estado antes do toque; `resposta`, o do pedido.
 */
async function permissao(page: Page, inicial: NotificationPermission, resposta: NotificationPermission) {
  await page.addInitScript(
    ([ini, res]) => {
      let atual = ini;
      Object.defineProperty(Notification, "permission", { configurable: true, get: () => atual });
      Notification.requestPermission = async () => {
        atual = res;
        return res;
      };
    },
    [inicial, resposta] as const,
  );
}

test("desligado por padrão; ligar pede permissão e assina; trocar o horário; desligar", async ({ page, context }) => {
  await context.grantPermissions(["notifications"]);
  await permissao(page, "default", "granted");
  await pushFalso(page);
  await entrar(page);
  const s = await secao(page);

  await expect(s).toHaveAttribute("data-estado", "desligado");
  await expect(s.getByRole("button", { name: "Fim de tarde · 18h" })).toHaveAttribute("aria-pressed", "true");
  await s.getByRole("button", { name: "Ligar lembrete" }).click();
  await expect(s).toHaveAttribute("data-estado", "ligado", { timeout: 20_000 });
  await expect(s.getByTestId("lembrete-ligado")).toHaveText("Ligado neste aparelho. O aviso chega por volta das 18h.");
  const worker = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).some((r) => r.active?.scriptURL.endsWith("/sw.js")));
  expect(worker).toBe(true);

  await s.getByRole("button", { name: "Noite · 20h" }).click();
  await expect(s.getByTestId("lembrete-ligado")).toContainText("20h", { timeout: 20_000 });

  // O servidor guardou: depois de recarregar, continua ligado na janela da noite.
  await page.reload({ waitUntil: "domcontentloaded" });
  const s2 = page.getByTestId("secao-lembrete");
  await expect(s2).toHaveAttribute("data-estado", "ligado", { timeout: 30_000 });
  await expect(s2.getByRole("button", { name: "Noite · 20h" })).toHaveAttribute("aria-pressed", "true");
  // Free com lembrete não ganha estudo offline: com o worker controlando a página, nada vai para o cache.
  await page.goto("/trilha", { waitUntil: "load" });
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await expect(s2).toHaveAttribute("data-estado", "ligado", { timeout: 30_000 });
  expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? null)).toMatch(/\/sw\.js$/);
  expect(await page.evaluate(async () => (await caches.keys()).filter((n) => n.startsWith("foca-offline-")))).toEqual([]);

  await s2.getByRole("button", { name: "Desligar lembrete" }).click();
  await expect(s2).toHaveAttribute("data-estado", "desligado", { timeout: 20_000 });
  // Sem estudo offline ligado, o worker sai do aparelho junto com a assinatura.
  await expect
    .poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), { timeout: 10_000 })
    .toBe(0);
});

test("o aluno recusa a permissão: o lembrete fica desligado, com o motivo", async ({ page }) => {
  await permissao(page, "default", "denied");
  await entrar(page);
  const s = await secao(page);
  await s.getByRole("button", { name: "Ligar lembrete" }).click();
  await expect(s.getByRole("alert")).toHaveText("Sem permissão para notificações, o lembrete fica desligado.");
  await expect(s).toHaveAttribute("data-estado", "bloqueado");
  await expect(s.getByRole("button", { name: "Ligar lembrete" })).toBeDisabled();
});

test("notificações já bloqueadas no navegador: opção desabilitada com o caminho para liberar", async ({ page }) => {
  await permissao(page, "denied", "denied");
  await entrar(page);
  const s = await secao(page);
  await expect(s).toHaveAttribute("data-estado", "bloqueado");
  await expect(s).toContainText("libere nas configurações do navegador");
  await expect(s.getByRole("button", { name: "Ligar lembrete" })).toBeDisabled();
});

test("navegador sem push: opção desabilitada com o motivo", async ({ page }) => {
  await page.addInitScript(() => {
    delete (window as { PushManager?: unknown }).PushManager;
  });
  await entrar(page);
  const s = await secao(page);
  await expect(s).toHaveAttribute("data-estado", "sem-suporte");
  await expect(s).toContainText("Este navegador não recebe notificações.");
  await expect(s.getByRole("button", { name: "Ligar lembrete" })).toBeDisabled();
});

test.describe("iPhone fora da Tela de Início", () => {
  test.use({
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  });

  test("mostra o passo a passo e deixa a opção desabilitada", async ({ page }) => {
    await entrar(page);
    const s = await secao(page);
    await expect(s).toHaveAttribute("data-estado", "iphone");
    await expect(s.getByTestId("lembrete-iphone")).toContainText("só funciona com o Foca na Tela de Início");
    await expect(s.getByTestId("lembrete-iphone").getByRole("listitem")).toHaveCount(4);
    await expect(s.getByRole("button", { name: "Ligar lembrete" })).toBeDisabled();
  });
});

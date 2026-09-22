import { expect, test } from "@playwright/test";

test("WAVs reais: cache, prioridade, mute, expiração e cancelamento", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/sfx/v2/")) requests.push(r.url());
  });
  await page.goto("/study");
  await page.getByRole("button", { name: "Responder" }).waitFor();
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await expect.poll(() => requests.length).toBe(12);

  const result = await page.evaluate(async () => {
    // Reuse Vite's actual module URL (including its HMR timestamp), not a second instance.
    const path = performance
      .getEntriesByType("resource")
      .find((entry) => new URL(entry.name).pathname === "/src/lib/audio/engine.ts")!.name;
    const engine = await import(/* @vite-ignore */ path);
    const starts: { duration: number; start: number }[] = [];
    const stops: number[] = [];
    const originalStart = AudioBufferSourceNode.prototype.start;
    const originalStop = AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.start = function (when = 0, offset = 0) {
      starts.push({ duration: this.buffer?.duration ?? 0, start: when });
      originalStart.call(this, when, offset);
    };
    AudioBufferSourceNode.prototype.stop = function (when = 0) {
      stops.push(when - this.context.currentTime);
      originalStop.call(this, when);
    };
    try {
      engine.setAudioEnabled(true);
      await engine.playFeedbackSound("resposta-correta");
      const first = starts.length;
      await engine.playFeedbackSound("resposta-incorreta"); // Queue would exceed 300ms.
      const afterQueue = starts.length;
      engine.setAudioEnabled(false);
      await engine.playFeedbackSound("resposta-correta");
      const afterMute = starts.length;
      engine.setAudioEnabled(true);
      await engine.playFeedbackSound("resposta-correta", Date.now() - 1000);
      const afterExpiry = starts.length;
      await engine.playClosingSound(["streak-diario", "level-up", "conclusao-licao"]);
      engine.stopAllFeedbackSounds();
      const pending = engine.playFeedbackSound("resposta-incorreta");
      engine.stopAllFeedbackSounds();
      await pending;
      return { first, afterQueue, afterMute, afterExpiry, starts, stops };
    } finally {
      engine.stopAllFeedbackSounds();
      AudioBufferSourceNode.prototype.start = originalStart;
      AudioBufferSourceNode.prototype.stop = originalStop;
    }
  });
  expect(result.first).toBe(1);
  expect(result.afterQueue).toBe(1);
  expect(result.afterMute).toBe(1);
  expect(result.afterExpiry).toBe(1);
  expect(result.starts).toHaveLength(2);
  expect(result.starts[0].duration).toBeCloseTo(0.36, 2);
  expect(result.starts[1].duration).toBeCloseTo(0.78, 2);
  expect(result.stops.length).toBeGreaterThan(0);
  expect(result.stops.every((s) => s <= 0.05)).toBe(true);
  expect(requests).toHaveLength(12);
});

test("carregamento atrasado não toca ao terminar", async ({ page }) => {
  await page.route("**/sfx/v2/*.wav", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
  await page.goto("/study");
  await page.getByRole("button", { name: "Responder" }).waitFor();
  await page.evaluate(() => {
    const original = AudioBufferSourceNode.prototype.start;
    (window as unknown as { audioStarts: number }).audioStarts = 0;
    AudioBufferSourceNode.prototype.start = function (when = 0) {
      (window as unknown as { audioStarts: number }).audioStarts++;
      original.call(this, when);
    };
  });
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await page.waitForTimeout(1000);
  expect(
    await page.evaluate(() => (window as unknown as { audioStarts: number }).audioStarts),
  ).toBe(0);
});

test("navegação cancela o som ativo", async ({ page }) => {
  await page.goto("/study");
  await page.getByRole("button", { name: "Responder" }).waitFor();
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.evaluate(async () => {
    const path = performance
      .getEntriesByType("resource")
      .find((entry) => new URL(entry.name).pathname === "/src/lib/audio/engine.ts")!.name;
    const engine = await import(/* @vite-ignore */ path);
    const originalStop = AudioBufferSourceNode.prototype.stop;
    (window as unknown as { audioStops: number }).audioStops = 0;
    AudioBufferSourceNode.prototype.stop = function (when = 0) {
      (window as unknown as { audioStops: number }).audioStops++;
      originalStop.call(this, when);
    };
    await engine.playClosingSound(["recompensa-especial"]);
  });
  await page.locator('a[href="/trilha"]').first().click();
  await expect(page).toHaveURL(/trilha/);
  expect(
    await page.evaluate(() => (window as unknown as { audioStops: number }).audioStops),
  ).toBeGreaterThan(0);
});

test("WAV indisponível não impede responder", async ({ page }) => {
  await page.route("**/sfx/v2/*.wav", (route) => route.fulfill({ status: 503, body: "offline" }));
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/study");
  await page.locator("div.mt-5.flex.flex-col.gap-3 > button").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await expect(page.locator('[role="status"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
  expect(errors).toEqual([]);
});

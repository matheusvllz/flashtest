import { defineConfig, devices } from "@playwright/test";

// E2E da landing (docs/40 §26.1). Roda contra o BUILD de produção (pré-renderizado) servido em :4322.
// Os projetos cobrem os viewports do plano: 320, 390, 768, 1280 e 1440.
const PORT = 4322;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"]],
  outputDir: "./test-results",
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices["Desktop Chrome"],
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "off",
  },
  webServer: {
    command: "bun run build && bun run preview",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [
    { name: "narrow", use: { viewport: { width: 320, height: 700 }, hasTouch: true } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "wide", use: { viewport: { width: 1440, height: 900 } } },
  ],
});

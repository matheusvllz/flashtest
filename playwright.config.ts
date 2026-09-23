import { defineConfig, devices } from "@playwright/test";

/**
 * Config mínima da Fase 0 (docs/20 §19.1/§19.3): servidor local, projeto
 * desktop Chromium, fixtures isoladas (cada teste usa seu próprio contexto de
 * navegador, então `localStorage` nunca vaza entre testes) e captura em falha.
 * A matriz completa de dispositivos/temas/acessibilidade (§19.2) fica para
 * execução manual/CI dedicado — Chrome desktop aqui só prova o comportamento,
 * não substitui teste em Safari iOS/Android reais.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 390, height: 844 }, // largura mínima da matriz (§19.2)
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Largura mínima real da matriz (docs/25 §12/§21, §18 T-27, G12) — só
    // roda os specs que a tarefa aponta como críticos de layout na trilha e
    // no player novo; o resto do app já é coberto no viewport padrão acima.
    {
      name: "narrow",
      use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 700 } },
      testMatch: ["**/trail-home.spec.ts", "**/lesson-v2.spec.ts", "**/trail-path.spec.ts"],
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});

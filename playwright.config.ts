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
    // Mobile de verdade (docs/36 T-01.4): o `viewport` global (390×844) era
    // ANULADO pelo spread de `devices["Desktop Chrome"]` (que traz 1280×720),
    // então o projeto "chromium" sempre rodou em 1280×720. Aqui o viewport
    // vem DEPOIS do spread, de propósito.
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    // Layout em tela larga (docs/36 §F.6, RU-30) — só os specs marcados como
    // "desktop" no §L.2 do plano (layout.spec.ts, criado na T-08.1/T-08.2).
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
      testMatch: ["**/layout.spec.ts"],
    },
    // Largura mínima real da matriz (docs/25 §12/§21, §18 T-27, G12) — só
    // roda os specs que a tarefa aponta como críticos de layout na trilha e
    // no player novo; o resto do app já é coberto no viewport padrão acima.
    // docs/36 T-01.4: ganha também o spec novo de layout.
    {
      name: "narrow",
      use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 700 } },
      testMatch: ["**/trail-home.spec.ts", "**/lesson-v2.spec.ts", "**/trail-path.spec.ts", "**/layout.spec.ts"],
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});

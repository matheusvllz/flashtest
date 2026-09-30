import { defineConfig, devices } from "@playwright/test";

/**
 * Estudar exige conta (decisão 0006): o projeto "setup" cria uma conta real e verificada e grava a sessão; os projetos
 * que visitam rotas de estudo reusam essa sessão (docs/specs/46-producao T-04.6). A landing não precisa de conta.
 */
const SESSAO_ALUNO = "tests/e2e/.auth/aluno.json";
const comConta = { dependencies: ["setup"] as string[] };

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
    { name: "setup", testMatch: /.*.setup.ts/ },
    // Mobile de verdade (docs/36 T-01.4): o `viewport` global (390×844) era
    // ANULADO pelo spread de `devices["Desktop Chrome"]` (que traz 1280×720),
    // então o projeto "chromium" sempre rodou em 1280×720. Aqui o viewport
    // vem DEPOIS do spread, de propósito.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, storageState: SESSAO_ALUNO },
      ...comConta,
      // A landing tem os próprios projetos, com as cinco larguras dela (docs/44 §9).
      testIgnore: ["**/marketing/**"],
    },
    // Landing integrada (rota `/`, docs/44): as mesmas cinco larguras da landing isolada (docs/40 §26).
    ...(
      [
        ["lp-narrow", 320, 700],
        ["lp-mobile", 390, 844],
        ["lp-tablet", 768, 1024],
        ["lp-desktop", 1280, 800],
        ["lp-wide", 1440, 900],
      ] as const
    ).map(([name, width, height]) => ({
      name,
      // `LP_BASE_URL` roda a landing contra o build de produção (NITRO_PRESET=node-server, docs/44 §9).
      use: { ...devices["Desktop Chrome"], viewport: { width, height }, baseURL: process.env.LP_BASE_URL ?? "http://localhost:8080" },
      testMatch: ["**/marketing/*.spec.ts"],
    })),
    // Layout em tela larga (docs/36 §F.6, RU-30) — só os specs marcados como
    // "desktop" no §L.2 do plano (layout.spec.ts, criado na T-08.1/T-08.2).
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, storageState: SESSAO_ALUNO },
      ...comConta,
      testMatch: ["**/layout.spec.ts"],
    },
    // Largura mínima real da matriz (docs/25 §12/§21, §18 T-27, G12) — só
    // roda os specs que a tarefa aponta como críticos de layout na trilha e
    // no player novo; o resto do app já é coberto no viewport padrão acima.
    // docs/36 T-01.4: ganha também o spec novo de layout.
    {
      name: "narrow",
      use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 700 }, storageState: SESSAO_ALUNO },
      ...comConta,
      testMatch: ["**/trail-home.spec.ts", "**/lesson-v2.spec.ts", "**/trail-path.spec.ts", "**/layout.spec.ts"],
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    // Todos os testes saem do mesmo IP: sem isto o rate limit do login barraria os E2E (ignorado em produção).
    env: { AUTH_RATE_LIMIT_DESLIGADO: "true" },
    timeout: 30_000,
  },
});

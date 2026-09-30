// Configuração do Vite escrita à mão (docs/specs/46-producao T-03.1). Até 29/09/2026 ela vinha
// do wrapper `@lovable.dev/vite-tanstack-config`; aqui estão só as partes que valiam fora do
// editor da Lovable, com as mesmas opções. Não duplicar plugins: cada um aparece uma vez.
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // src/server.ts: o wrapper de erro do SSR.
      server: { entry: "server" },
      // Segurança: código em `**/server/**` e o especificador `server-only` nunca entram no
      // bundle do navegador — importar um deles no cliente quebra o build.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Só no build. Preset por ambiente (ADR 0001): a Vercel define VERCEL=1 → Build Output API
    // (.vercel/output). Fora dela, um servidor Node local (`node .output/server/index.mjs`), usado
    // para testar o build de produção e medir a landing. NITRO_PRESET sobrepõe os dois.
    command === "build"
      ? nitro({ preset: process.env.NITRO_PRESET ?? (process.env.VERCEL ? "vercel" : "node-server") })
      : null,
    viteReact(),
  ],
  css: { transformer: "lightningcss" },
  resolve: {
    alias: { "@": src },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
    // Herdado do wrapper antigo: sem isto, quando o Vite reotimiza dependências no meio da primeira
    // navegação, as requisições pendentes recebem 504 e a página recarrega (instável nos E2E).
    ignoreOutdatedRequests: true,
  },
  // Porta fixa: playwright.config.ts, README e scripts de captura usam a 8080.
  server: {
    host: "::",
    port: 8080,
    watch: { awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 } },
  },
}));

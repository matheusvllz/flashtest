// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Hospedagem (docs/27 §14): o Vercel define VERCEL=1 no build → Build Output
  // API (.vercel/output) com a função SSR que também serve o tutor. Fora do
  // Vercel continua gerando para Netlify. Sem isso o Vercel publicava `dist/`,
  // que não tem index.html num app SSR → 404 em todas as rotas.
  nitro: { preset: process.env.VERCEL ? "vercel" : "netlify" },
});

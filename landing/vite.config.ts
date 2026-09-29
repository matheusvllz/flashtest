// Vite PURO. Não importar @lovable.dev/vite-tanstack-config: ele injeta TanStack Start,
// nitro, alias "@" e porta 8080, que são do app (docs/40 §2 A-1, §15.2).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 4321, strictPort: true },
  preview: { port: 4322, strictPort: true },
  build: {
    // Prefixo próprio para nunca colidir com /assets do app numa futura integração (docs/40 §22).
    assetsDir: "lp-assets",
    target: "es2022",
    cssCodeSplit: false,
  },
});

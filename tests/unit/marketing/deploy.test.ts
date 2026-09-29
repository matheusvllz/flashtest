import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Publicação do produto integrado (docs/44 §9): um build, um deploy, os cabeçalhos de segurança que eram da landing
// valendo para o site inteiro, e nenhuma fonte ou script de terceiros no head.
const RAIZ = resolve(import.meta.dir, "../../..");
const vercel = JSON.parse(readFileSync(resolve(RAIZ, "vercel.json"), "utf8")) as {
  installCommand: string;
  buildCommand: string;
  headers?: { source: string; headers: { key: string; value: string }[] }[];
};

describe("vercel.json", () => {
  test("instala com lockfile congelado e builda o app (landing incluída)", () => {
    expect(vercel.installCommand).toBe("bun install --frozen-lockfile");
    expect(vercel.buildCommand).toBe("bun run build");
  });

  test("cabeçalhos de segurança em todas as rotas", () => {
    const g = Object.fromEntries(vercel.headers!.find((h) => h.source === "/(.*)")!.headers.map((h) => [h.key, h.value]));
    expect(g["X-Content-Type-Options"]).toBe("nosniff");
    expect(g["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(g["Permissions-Policy"]).toContain("microphone=()");
    expect(g["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  });

  test("fontes autohospedadas com cache longo", () => {
    const fontes = vercel.headers!.find((h) => h.source === "/fonts/(.*)")!;
    expect(fontes.headers[0].value).toContain("max-age=31536000");
  });
});

describe("head da raiz", () => {
  const raiz = readFileSync(resolve(RAIZ, "src/routes/__root.tsx"), "utf8");
  test("sem Google Fonts nem outra origem: fontes em /fonts (docs/44 §4)", () => {
    expect(raiz).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
    expect(raiz).toContain("/fonts/space-grotesk-latin-wght.woff2");
  });
  test("manifest e ícones institucionais declarados", () => {
    expect(raiz).toContain(`rel: "manifest", href: "/site.webmanifest"`);
    expect(raiz).toContain("/branding/foca/apple-touch-icon.png");
    expect(raiz).toContain("/branding/foca/favicon-32.png");
  });
});

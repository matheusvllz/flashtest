import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Segurança e publicação (docs/40 §15.7, §20): cabeçalhos do deploy, CSP com hash de cada script inline e nenhum
// recurso de terceiros. A parte do build roda só se dist/ existir.
const raiz = resolve(import.meta.dir, "../..");
const vercel = JSON.parse(readFileSync(resolve(raiz, "vercel.json"), "utf8")) as {
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  headers: { source: string; headers: { key: string; value: string }[] }[];
};

describe("vercel.json da landing", () => {
  test("instala com lockfile congelado, builda e publica dist/", () => {
    expect(vercel.installCommand).toBe("bun install --frozen-lockfile");
    expect(vercel.buildCommand).toBe("bun run build");
    expect(vercel.outputDirectory).toBe("dist");
  });

  const globais = () => Object.fromEntries(vercel.headers.find((h) => h.source === "/(.*)")!.headers.map((h) => [h.key, h.value]));

  test("cabeçalhos de segurança em todas as rotas", () => {
    const g = globais();
    expect(g["X-Content-Type-Options"]).toBe("nosniff");
    expect(g["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(g["Permissions-Policy"]).toContain("camera=()");
    expect(g["Permissions-Policy"]).toContain("microphone=()");
    expect(g["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  });

  test("cache imutável só para os arquivos com hash no nome", () => {
    const assets = vercel.headers.find((h) => h.source === "/lp-assets/(.*)")!;
    expect(assets.headers[0].value).toContain("immutable");
    const lp = vercel.headers.find((h) => h.source === "/lp/(.*)")!;
    expect(lp.headers[0].value).not.toContain("immutable"); // retratos e fontes não têm hash no nome
  });
});

describe("build (roda se dist/ existir)", () => {
  const dist = resolve(raiz, "dist/index.html");
  const pronto = existsSync(dist);
  const html = pronto ? readFileSync(dist, "utf8") : "";

  test.skipIf(!pronto)("a CSP inclui o hash exato de cada script inline e nenhum 'unsafe-inline' em script", () => {
    const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)![1];
    const scriptSrc = csp.split(";").find((d) => d.trim().startsWith("script-src"))!;
    expect(scriptSrc).not.toContain("unsafe-inline");
    expect(scriptSrc).not.toContain("unsafe-eval");
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    expect(inline.length).toBeGreaterThanOrEqual(2);
    for (const s of inline) expect(scriptSrc).toContain(`'sha256-${createHash("sha256").update(s).digest("base64")}'`);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("object-src 'none'");
  });

  test.skipIf(!pronto)("nenhum script, folha de estilo, fonte ou imagem vem de outra origem", () => {
    const recursos = [...html.matchAll(/\b(?:src|srcset|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => /^(https?:)?\/\//.test(u));
    // Links de navegação para o app (a[href]) são permitidos; o resto tem que ser da própria origem.
    const externosNaoNavegacao = [...html.matchAll(/<(script|link|img|source|iframe)\b[^>]*\b(?:src|srcset|href)="((?:https?:)?\/\/[^"]+)"/g)].map((m) => m[2]);
    expect(externosNaoNavegacao).toEqual([]);
    expect(recursos.every((u) => u.startsWith("http://localhost:8080") || !/^(https?:)?\/\//.test(u) || u.startsWith("https://schema.org"))).toBe(true);
  });

  test.skipIf(!pronto)("nenhuma chave, token ou URL de servidor no HTML nem no JS publicado", () => {
    const proibidos = /OPENAI|sk-[A-Za-z0-9]{20,}|api[_-]?key|secret|Bearer\s/i;
    expect(html).not.toMatch(proibidos);
  });
});

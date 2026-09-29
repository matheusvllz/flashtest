import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Marca: todo asset referenciado existe (docs/36 §G.8, T-08.6). Cobre o que o `<head>`
 * de `__root.tsx` aponta (favicon, ícones, apple-touch, og:image) e as imagens que o
 * `FocaMark` monta (3 variantes + 8 expressões × 2 tamanhos). O E2E `brand.spec.ts`
 * confere que o servidor de fato responde 200 a cada um; aqui é o arquivo em `public/`.
 *
 * Falha que detecta: apagar/renomear um PNG do `public/branding/foca/` (ou trocar o caminho
 * em código) e só descobrir em produção como ícone quebrado.
 */
const RAIZ = join(import.meta.dir, "..", "..");
const PUBLIC = join(RAIZ, "public");
const ler = (rel: string) => readFileSync(join(RAIZ, rel), "utf8");

const ASSINATURA_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Largura × altura lidas do cabeçalho IHDR do PNG. */
function dimensoesPng(caminho: string): { w: number; h: number; assinaturaOk: boolean } {
  const b = readFileSync(caminho);
  return {
    w: b.readUInt32BE(16),
    h: b.readUInt32BE(20),
    assinaturaOk: ASSINATURA_PNG.every((v, i) => b[i] === v),
  };
}

function assetsDoHead(): string[] {
  const src = ler("src/routes/__root.tsx");
  const achados = new Set<string>();
  for (const m of src.matchAll(/["'`](\/(?:branding\/[^"'`]+|favicon\.ico))["'`]/g)) achados.add(m[1]);
  return [...achados];
}

function assetsDoFocaMark(): string[] {
  const src = ler("src/components/brand/FocaMark.tsx");
  const literais = [...src.matchAll(/"(\/branding\/foca\/[^"]+\.png)"/g)].map((m) => m[1]);
  const uniao = src.match(/export type FocaExpression =([\s\S]*?);/)?.[1] ?? "";
  const expressoes = [...uniao.matchAll(/"(\w+)"/g)].map((m) => m[1]);
  const deExpressoes = expressoes.flatMap((e) => [
    `/branding/foca/expressoes/${e}-96.png`,
    `/branding/foca/expressoes/${e}-320.png`,
  ]);
  return [...new Set([...literais, ...deExpressoes])];
}

describe("assets da marca existem em public/ (docs/36 T-08.6)", () => {
  test("o <head> referencia favicon, ícone 192, apple-touch e og:image", () => {
    const head = assetsDoHead();
    for (const esperado of [
      "/favicon.ico",
      "/branding/foca/icon-192.png",
      "/branding/foca/apple-touch-icon.png",
      "/branding/foca/og-image.png",
    ]) {
      expect(head, `__root.tsx deve referenciar ${esperado}`).toContain(esperado);
    }
  });

  test("todo asset do <head> existe, não está vazio e PNG tem assinatura e proporção corretas", () => {
    const dimEsperada: Record<string, [number, number]> = {
      "/branding/foca/icon-192.png": [192, 192],
      "/branding/foca/apple-touch-icon.png": [180, 180],
      "/branding/foca/og-image.png": [1200, 630],
    };
    for (const url of assetsDoHead()) {
      const arquivo = join(PUBLIC, url);
      expect(existsSync(arquivo), `${url} deve existir em public/`).toBe(true);
      expect(statSync(arquivo).size, `${url} não pode estar vazio`).toBeGreaterThan(200);
      if (url.endsWith(".png")) {
        const { w, h, assinaturaOk } = dimensoesPng(arquivo);
        expect(assinaturaOk, `${url} é PNG`).toBe(true);
        if (dimEsperada[url]) expect([w, h], `dimensões de ${url}`).toEqual(dimEsperada[url]);
      }
    }
  });

  test("todo asset que o FocaMark monta existe e é quadrado", () => {
    const urls = assetsDoFocaMark();
    // 3 variantes (2 tamanhos de `color` + 2 linhas) e 8 expressões × 2: sem lista vazia por regex quebrado.
    expect(urls.length).toBeGreaterThanOrEqual(18);
    for (const url of urls) {
      const arquivo = join(PUBLIC, url);
      expect(existsSync(arquivo), `${url} deve existir em public/`).toBe(true);
      const { w, h, assinaturaOk } = dimensoesPng(arquivo);
      expect(assinaturaOk, `${url} é PNG`).toBe(true);
      expect(w, `${url} quadrado`).toBe(h);
    }
  });

  test("as duas linhas usadas por tema em /aha existem (line-dark no claro, line-light no escuro)", () => {
    const aha = ler("src/routes/aha.tsx");
    expect(aha).toContain('variant="line-dark"');
    expect(aha).toContain('variant="line-light"');
    expect(aha).toContain("dark:hidden");
    expect(aha).toContain("hidden dark:block");
    for (const f of ["foca-line-dark-720.png", "foca-line-light-720.png"]) {
      expect(existsSync(join(PUBLIC, "branding", "foca", f))).toBe(true);
    }
  });
});

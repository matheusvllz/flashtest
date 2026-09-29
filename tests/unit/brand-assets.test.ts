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

/**
 * Tudo que o `FocaMark` monta (docs/44 §6): as linhas (literais no componente) e, pelo registro oficial
 * (`src/lib/brand/foca-expressions.ts`), a logo e as 8 expressões em 96 e 320 px, PNG e WebP.
 */
function assetsDoFocaMark(): string[] {
  const src = ler("src/components/brand/FocaMark.tsx");
  const literais = [...src.matchAll(/"(\/branding\/foca\/[^"]+\.png)"/g)].map((m) => m[1]);
  const registro = ler("src/lib/brand/foca-expressions.ts");
  const lista = registro.match(/export const FOCA_EXPRESSIONS = \[([\s\S]*?)\] as const/)?.[1] ?? "";
  const expressoes = [...lista.matchAll(/"(\w+)"/g)].map((m) => m[1]);
  const deExpressoes = expressoes.flatMap((e) => [96, 320].flatMap((l) => [`/branding/foca/expressoes/${e}-${l}.png`, `/branding/foca/expressoes/${e}-${l}.webp`]));
  const logo = [96, 320].flatMap((l) => [`/branding/foca/foca-color-${l}.png`, `/branding/foca/foca-color-${l}.webp`]);
  return [...new Set([...literais, ...logo, ...deExpressoes])];
}

/** Dimensões de um WebP (VP8, VP8L ou VP8X). */
function dimensoesWebp(caminho: string): { w: number; h: number; ok: boolean } {
  const b = readFileSync(caminho);
  const ok = b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP";
  const tipo = b.toString("ascii", 12, 16);
  if (tipo === "VP8X") return { ok, w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (tipo === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { ok, w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { ok, w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
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
    // 2 linhas + logo (2 tamanhos × PNG/WebP) + 8 expressões × 2 tamanhos × 2 formatos: sem lista vazia por regex quebrado.
    expect(urls.length).toBeGreaterThanOrEqual(38);
    for (const url of urls) {
      const arquivo = join(PUBLIC, url);
      expect(existsSync(arquivo), `${url} deve existir em public/`).toBe(true);
      if (url.endsWith(".webp")) {
        const { w, h, ok } = dimensoesWebp(arquivo);
        expect(ok, `${url} é WebP`).toBe(true);
        expect(w, `${url} quadrado`).toBe(h);
        continue;
      }
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

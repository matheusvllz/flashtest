import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Ilhas de hidratação (docs/40 §16, G-19): só o que tem estado no cliente vai para o JS; o resto é HTML estático.
const raiz = resolve(import.meta.dir, "../..");
const main = readFileSync(resolve(raiz, "src/main.tsx"), "utf8");

describe("ilhas", () => {
  test("o cliente nunca importa a página inteira em produção (só sob import.meta.env.DEV)", () => {
    expect(main).not.toMatch(/from\s+["']\.\/Landing["']/);
    expect(main).toMatch(/import\.meta\.env\.DEV[\s\S]*import\(["']\.\/Landing["']\)/);
  });

  const assets = resolve(raiz, "dist/lp-assets");
  const pronto = existsSync(assets);
  const arquivos = pronto ? readdirSync(assets) : [];
  const ler = (prefixo: string) => readFileSync(resolve(assets, arquivos.find((f) => f.startsWith(prefixo) && f.endsWith(".js"))!), "utf8");

  test.skipIf(!pronto)("o HTML tem exatamente as três ilhas: Como funciona, demo e dúvidas", () => {
    const html = readFileSync(resolve(raiz, "dist/index.html"), "utf8");
    const ilhas = [...html.matchAll(/data-island="([a-z-]+)"/g)].map((m) => m[1]);
    expect(ilhas).toEqual(["como-funciona", "tenta-uma", "duvidas"]);
  });

  test.skipIf(!pronto)("o texto das seções estáticas não está no JS do cliente", () => {
    const todo = arquivos.filter((f) => f.endsWith(".js") && !f.startsWith("scroll-")).map((f) => readFileSync(resolve(assets, f), "utf8")).join("\n");
    for (const estatico of ["Domingo você monta o cronograma", "Enquanto isso, eu volto pra minha pedra", "Continua usando o que você já usa", "Você abre. O próximo passo"]) {
      expect(todo).not.toContain(estatico);
    }
  });

  test.skipIf(!pronto)("o código de cada ilha está no chunk certo: Como funciona no inicial; demo e dúvidas em chunks próprios", () => {
    // (O texto vive em content/copy.ts, módulo compartilhado; o que separa os chunks é o código dos componentes.)
    expect(ler("index-")).toContain("lp-shot-layer");
    expect(ler("index-")).not.toContain("lp-choice");
    expect(ler("index-")).not.toContain("lp-faq__chev");
    expect(ler("TryOne-")).toContain("lp-choice");
    expect(ler("Faq-")).toContain("lp-faq__chev");
  });
});

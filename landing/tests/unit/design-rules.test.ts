import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

// Regras do design system e da direção visual no código (docs/40 §12, G-8, G-12). Estáticas: o que a régua de
// marca proíbe não pode entrar por descuido de um componente.
function arquivos(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) arquivos(f, out);
    else if (/\.(tsx?|css)$/.test(f)) out.push(f);
  }
  return out;
}
const SRC = resolve(import.meta.dir, "../../src");
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const todos = arquivos(SRC).map((f) => ({ f: f.replace(SRC, "src").replaceAll("\\", "/"), t: semComentarios(readFileSync(f, "utf8")) }));
// tokens.css e utilities.css são snapshots do app (têm os valores oficiais); o resto usa só variáveis.
const proprios = todos.filter(({ f }) => !/styles\/(tokens|utilities)\.css$/.test(f));
// <meta name="theme-color"> não aceita var(): as duas cores literais moram só em seo.ts e um teste as compara com o token --neve.
const semSeo = proprios.filter(({ f }) => f !== "src/content/seo.ts");

describe("design system (docs/40 §12)", () => {
  test("nenhuma cor em hex ou rgb() fora dos snapshots de tokens (tudo por variável)", () => {
    const ruins = semSeo.filter(({ t }) => /#[0-9a-fA-F]{3,8}\b(?![-\w])|\brgba?\(/.test(t)).map((c) => c.f);
    expect(ruins).toEqual([]);
  });

  test("sem raio arbitrário em px, sem sombra difusa, sem blur, sem gradiente decorativo, sem preto puro", () => {
    const proibidos = /rounded-\[\d+px\]|shadow-(sm|md|lg|xl|2xl)\b|backdrop-blur|bg-clip-text|bg-gradient|linear-gradient\(\s*to (right|left)|text-black|bg-black/;
    const ruins = proprios.filter(({ t }) => proibidos.test(t)).map((c) => c.f);
    expect(ruins).toEqual([]);
  });

  test("sem z-index solto: escala documentada (nav 30, barra fixa 40, skip link 50); só -1, 0 e 1 dentro de contextos isolados", () => {
    const solto = /\bz-\[?\d+\]?\b|z-index:\s*(?!var\(--lp-z-|-?[01]\b)\d+/;
    const ruins = proprios.filter(({ t }) => solto.test(t)).map((c) => c.f);
    expect(ruins).toEqual([]);
  });

  test("sem h-screen (viewport estável), sem tabela e sem carrossel/marquee", () => {
    const ruins = proprios.filter(({ t }) => /\bh-screen\b|<table|carousel|marquee/i.test(t)).map((c) => c.f);
    expect(ruins).toEqual([]);
  });

  test("o azul-caneta não é usado por classe direta em componente (só pelos utilitários de ação, seleção e progresso)", () => {
    // text-mar / bg-mar / border-mar em TSX: nenhum. Tudo passa por btn-primary, .lp-choice, .lp-node, .lp-margin, lp-label etc.
    const usos = proprios
      .filter(({ f }) => f.endsWith(".tsx"))
      .flatMap(({ f, t }) => [...t.matchAll(/\b(?:text|bg|border)-mar(?:-fundo)?\b/g)].map(() => f));
    expect([...new Set(usos)]).toEqual([]);
  });

  test("marca-texto só onde o plano permite: palavra-chave do H1 e do H2 final e chip da sequência", () => {
    const usos = proprios
      .filter(({ t }) => /HighlightStroke|--color-recompensa|var\(--color-alert\)|bg-alert|bg-recompensa/.test(t))
      .map((c) => c.f)
      .sort();
    expect(usos).toEqual(["src/components/doodles/index.tsx", "src/sections/Closing.tsx", "src/sections/Comeback.tsx", "src/sections/Hero.tsx", "src/styles/components.css"]);
  });

  test("verde e vermelho só no feedback da demo", () => {
    const usos = proprios
      .filter(({ t }) => /\b(?:text|bg|border)-(?:success|error)\b|--color-(?:success|error)\b/.test(t))
      .map((c) => c.f)
      .sort();
    expect(usos).toEqual(["src/sections/TryOne.tsx", "src/styles/components.css"]);
  });

  test("uma só família de ícones (lucide-react)", () => {
    const ruins = proprios.filter(({ t }) => /from\s+["'](@phosphor-icons|@tabler|react-icons|heroicons|@radix-ui\/react-icons|hugeicons)/.test(t)).map((c) => c.f);
    expect(ruins).toEqual([]);
  });
});

describe("theme-color", () => {
  test("as duas cores literais do <meta theme-color> são o --neve do claro e do escuro", () => {
    const tokens = readFileSync(resolve(SRC, "styles/tokens.css"), "utf8");
    const seo = readFileSync(resolve(SRC, "content/seo.ts"), "utf8").toLowerCase();
    const claro = tokens.match(/:root\s*\{[\s\S]*?--neve:\s*(#[0-9a-f]{6})/i)![1].toLowerCase();
    const escuro = tokens.match(/\.dark\s*\{[\s\S]*?--neve:\s*(#[0-9a-f]{6})/i)![1].toLowerCase();
    expect(seo).toContain(`content="${claro}" media="(prefers-color-scheme: light)"`);
    expect(seo).toContain(`content="${escuro}" media="(prefers-color-scheme: dark)"`);
  });
});

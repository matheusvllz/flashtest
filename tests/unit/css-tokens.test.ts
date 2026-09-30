import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Tokens de CSS que não podem sumir em silêncio (docs/36 T-08.3, T-08.4, T-08.10; riscos N9/B1).
 *
 * Contexto do bug B1: `var(--color-success)` num `style` inline/`color-mix()` depende de o alias
 * `--color-*` do `@theme inline` sobreviver ao CSS compilado — e ele só sobrevive quando alguma
 * classe Tailwind o usa (proteção acidental). Sumiu -> o fundo da folha de feedback virava
 * transparente. A regra do projeto (CLAUDE.md): em `style`/valor arbitrário, sempre a variável
 * BASE (`--success`, `--mar`, `--gelo`…), declarada em `:root`/`.dark`.
 *
 * Duas camadas:
 *  1) só código-fonte (sempre roda): sem `var(--color-*)` em `src/**`; sem `13.75rem`/`440px`
 *     soltos (a largura da coluna e o recuo dos elementos fixos vêm dos tokens de layout);
 *  2) CSS compilado (roda quando há `styles-*.css` de um build em `.output`, `.vercel` ou `dist` — no gate, depois de
 *     `bun run build`): toda variável base referenciada em `src` existe no CSS, as de cor têm
 *     valor em `:root` E em `.dark`, e toda `var(--x)` do CSS compilado tem declaração.
 */

const RAIZ = join(import.meta.dir, "..", "..");
const SRC = join(RAIZ, "src");

function listar(dir: string, exts: string[], saida: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) listar(p, exts, saida);
    else if (exts.some((e) => nome.endsWith(e))) saida.push(p);
  }
  return saida;
}

/** Tira comentários de bloco e de linha (aproximação suficiente: `//` só conta fora de `://`). */
function semComentarios(codigo: string): string {
  return codigo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const ARQUIVOS_TS = listar(SRC, [".ts", ".tsx"]).filter((p) => !p.endsWith("routeTree.gen.ts"));
const CODIGO = ARQUIVOS_TS.map((p) => ({ arquivo: relative(RAIZ, p).replace(/\\/g, "/"), texto: semComentarios(readFileSync(p, "utf8")) }));

describe("código-fonte", () => {
  test("nenhum var(--color-*) em src (style inline, color-mix, valor arbitrário, atributo SVG)", () => {
    const achados: string[] = [];
    for (const { arquivo, texto } of CODIGO) {
      texto.split("\n").forEach((linha, i) => {
        if (/var\(\s*--color-/.test(linha)) achados.push(`${arquivo}:${i + 1}: ${linha.trim().slice(0, 120)}`);
      });
    }
    expect(
      achados,
      "use a variável BASE (var(--mar), var(--gelo), var(--alert), var(--cards), var(--success), var(--error)…) ou a classe Tailwind equivalente — o alias --color-* pode sumir do CSS compilado (docs/36 B1)",
    ).toEqual([]);
  });

  test("color-mix() só usa variáveis base ou cores literais de sistema", () => {
    const achados: string[] = [];
    for (const { arquivo, texto } of CODIGO) {
      for (const m of texto.matchAll(/color-mix\([^)]*(?:\([^)]*\)[^)]*)*\)/g)) {
        if (m[0].includes("--color-")) achados.push(`${arquivo}: ${m[0]}`);
      }
    }
    expect(achados).toEqual([]);
  });

  test("nenhum 13.75rem em src (recuo do elemento fixo vem de anchor-col-*/--frame-col — risco N9)", () => {
    const achados = CODIGO.filter(({ texto }) => texto.includes("13.75rem")).map((c) => c.arquivo);
    const css = semComentarios(readFileSync(join(SRC, "styles.css"), "utf8"));
    if (css.includes("13.75rem")) achados.push("src/styles.css");
    expect(achados).toEqual([]);
  });

  test("440px só aparece na declaração dos tokens de layout de styles.css (risco N9)", () => {
    const fora = CODIGO.filter(({ texto }) => /\b440px\b/.test(texto)).map((c) => c.arquivo);
    expect(fora, "largura de coluna vem de --app-col/--reading-col/--path-col").toEqual([]);

    const css = semComentarios(readFileSync(join(SRC, "styles.css"), "utf8"));
    const linhas = css.split("\n").filter((l) => /\b440px\b/.test(l));
    for (const l of linhas) {
      expect(l.trim(), "440px em styles.css fora de um token de layout").toMatch(/^--(app|reading|path)-col:\s*440px;/);
    }
    expect(linhas.length).toBe(3);
  });

  test("tokens de layout e scrim existem em :root (e o scrim também em .dark)", () => {
    const css = readFileSync(join(SRC, "styles.css"), "utf8");
    for (const t of ["--app-col", "--reading-col", "--path-col", "--nav-rail"]) {
      expect(css, t).toMatch(new RegExp(`:root\\s*\\{[^}]*${t}:`));
    }
    expect(css).toMatch(/:root\s*\{[^}]*--scrim:/);
    expect(css).toMatch(/\.dark\s*\{[^}]*--scrim:/);
  });
});

/* ------------------------------------------------------------------ CSS compilado */

// Onde o build deixa o CSS: `.output/public/assets` (preset node-server, o padrão fora da Vercel),
// `.vercel/output/static/assets` (VERCEL=1) ou `dist/assets` (preset antigo). Usa o mais recente.
const CANDIDATOS = [
  join(RAIZ, ".output", "public", "assets"),
  join(RAIZ, ".vercel", "output", "static", "assets"),
  join(RAIZ, "dist", "assets"),
].filter((d) => existsSync(d) && readdirSync(d).some((n) => /^styles-.*\.css$/.test(n)));
const DIST = CANDIDATOS.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0] ?? "";
const CSS_COMPILADO = DIST ? readdirSync(DIST).find((n) => /^styles-.*\.css$/.test(n)) : undefined;
// Os outros CSS do build (ex.: `marketing-*.css`, carregado só na landing, docs/44 §3): as
// variáveis declaradas neles contam como declaradas para quem as usa.
const OUTROS_CSS = DIST ? readdirSync(DIST).filter((n) => n.endsWith(".css") && n !== CSS_COMPILADO) : [];
const compilado = test.skipIf(!CSS_COMPILADO);

interface Regra {
  seletor: string;
  decls: Map<string, string>;
}

/** Regras "folha" do CSS (sem `{` no corpo), inclusive as dentro de @media/@layer. */
function regras(css: string): Regra[] {
  const saida: Regra[] = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = new Map<string, string>();
    for (const d of m[2].split(";")) {
      const i = d.indexOf(":");
      if (i > 0) decls.set(d.slice(0, i).trim(), d.slice(i + 1).trim());
    }
    saida.push({ seletor: m[1].trim(), decls });
  }
  return saida;
}

/**
 * Variáveis que nascem em runtime ou em componente shadcn que o app não usa:
 * `--radix-*` (Radix define ao montar o popper), `--tw-*` (internas do Tailwind) e
 * `--sidebar-*` (`ui/sidebar.tsx` referencia tokens que o `styles.css` nunca declarou — o
 * componente não é usado por nenhuma rota).
 */
const RUNTIME_OU_NAO_USADA = /^--(tw-|tw_|radix-|sidebar-)/;

const EH_COR = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|oklch\(|oklab\()/i;

describe("CSS compilado (roda depois de `bun run build`)", () => {
  const css = CSS_COMPILADO ? readFileSync(join(DIST, CSS_COMPILADO), "utf8") : "";
  const declaradasEmOutros = new Set<string>();
  for (const n of OUTROS_CSS) {
    for (const m of readFileSync(join(DIST, n), "utf8").matchAll(/(--[\w-]+)\s*:/g)) declaradasEmOutros.add(m[1]);
  }
  const todas = regras(css);
  const doRaiz = new Map<string, string>();
  const doDark = new Map<string, string>();
  for (const r of todas) {
    const seletores = r.seletor.split(",").map((s) => s.trim());
    if (seletores.includes(":root")) for (const [k, v] of r.decls) doRaiz.set(k, v);
    if (seletores.includes(".dark")) for (const [k, v] of r.decls) doDark.set(k, v);
  }

  // Variáveis atribuídas em runtime, no próprio código (`style={{ "--k": … }}`, `[--frame-col:…]`).
  const definidasNoCodigo = new Set<string>();
  for (const { texto } of CODIGO) {
    for (const m of texto.matchAll(/["'`[](--[a-z][\w-]*)\s*["'`]?\s*:/g)) definidasNoCodigo.add(m[1]);
    for (const m of texto.matchAll(/["'](--[a-z][\w-]*)["']\s*[:\]]/g)) definidasNoCodigo.add(m[1]);
  }

  compilado("o CSS compilado tem os tokens base de cor em :root e em .dark", () => {
    const base = ["--abismo", "--mar", "--mar-fundo", "--gelo", "--neve", "--nevoa", "--cards", "--success", "--success-texto", "--alert", "--error", "--pelo"];
    for (const t of base) {
      expect(doRaiz.has(t), `${t} em :root`).toBe(true);
      expect(doDark.has(t), `${t} em .dark`).toBe(true);
      expect(EH_COR.test(doRaiz.get(t)!), `${t} em :root é uma cor (${doRaiz.get(t)})`).toBe(true);
      expect(EH_COR.test(doDark.get(t)!), `${t} em .dark é uma cor (${doDark.get(t)})`).toBe(true);
    }
  });

  compilado("toda variável referenciada em src existe no CSS compilado; as de cor têm :root e .dark", () => {
    const referenciadas = new Map<string, string>();
    for (const { arquivo, texto } of CODIGO) {
      for (const m of texto.matchAll(/var\(\s*(--[\w-]+)/g)) if (!referenciadas.has(m[1])) referenciadas.set(m[1], arquivo);
    }
    expect(referenciadas.size).toBeGreaterThan(5); // o teste não pode passar vazio

    const faltando: string[] = [];
    for (const [nome, arquivo] of referenciadas) {
      const valor = doRaiz.get(nome);
      if (valor === undefined) {
        if (definidasNoCodigo.has(nome) || RUNTIME_OU_NAO_USADA.test(nome)) continue; // atribuída em runtime por quem a usa (ex.: --frame-col)
        if (declaradasEmOutros.has(nome)) continue; // declarada no CSS da própria área (ex.: --lp-* em marketing-*.css)
        faltando.push(`${nome} (usada em ${arquivo}) não está declarada em :root no CSS compilado`);
      } else if (EH_COR.test(valor) && !doDark.has(nome)) {
        faltando.push(`${nome} (usada em ${arquivo}) é cor em :root mas não tem valor em .dark`);
      }
    }
    expect(faltando).toEqual([]);
  });

  compilado("toda var(--x) do próprio CSS compilado tem declaração (nenhum alias --color-* sumiu)", () => {
    const declaradas = new Set<string>();
    for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) declaradas.add(m[1]);
    for (const nome of definidasNoCodigo) declaradas.add(nome);
    for (const nome of declaradasEmOutros) declaradas.add(nome);

    const usadas = new Set<string>();
    for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) if (m[2] === ")") usadas.add(m[1]); // sem fallback

    const sem = [...usadas].filter((n) => !declaradas.has(n) && !RUNTIME_OU_NAO_USADA.test(n));
    expect(sem, "var() do CSS compilado sem declaração — provável alias --color-* removido pelo Lightning CSS").toEqual([]);
  });

  compilado("scrim: preto com alfa 0,4 no claro e 0,55 no escuro (nunca claro)", () => {
    // O Lightning CSS reescreve `rgb(0 0 0 / .4)` como hex de 4/8 dígitos (`#0006`, `#0000008c`).
    const preto = (v: string): { alfa: number } | null => {
      let m = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/i);
      if (m) return m[1] === "0" && m[2] === "0" && m[3] === "0" ? { alfa: parseInt(m[4] + m[4], 16) / 255 } : null;
      m = v.match(/^#([0-9a-f]{6})([0-9a-f]{2})$/i);
      if (m) return m[1] === "000000" ? { alfa: parseInt(m[2], 16) / 255 } : null;
      m = v.match(/^rgba?\(\s*0(?:\s*,\s*|\s+)0(?:\s*,\s*|\s+)0\s*(?:[,/]\s*([\d.]+)\s*)?\)$/);
      if (m) return { alfa: m[1] === undefined ? 1 : Number(m[1]) };
      return null;
    };
    const claro = doRaiz.get("--scrim");
    const escuro = doDark.get("--scrim");
    expect(claro, "--scrim em :root").toBeDefined();
    expect(escuro, "--scrim em .dark").toBeDefined();
    const c = preto(claro!);
    const e = preto(escuro!);
    expect(c, `--scrim claro (${claro}) é preto com alfa`).not.toBeNull();
    expect(e, `--scrim escuro (${escuro}) é preto com alfa`).not.toBeNull();
    expect(c!.alfa).toBeCloseTo(0.4, 2);
    expect(e!.alfa).toBeCloseTo(0.55, 2);
  });
});

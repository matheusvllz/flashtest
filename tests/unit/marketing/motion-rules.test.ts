import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

// Regras de movimento no código (docs/40 §13, G-15). O E2E não consegue separar o que é da página do que é o
// delegador de eventos do React, então a garantia de "sem listener de scroll" é estática.
function arquivos(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) arquivos(f, out);
    else if (/\.(tsx?|css)$/.test(f)) out.push(f);
  }
  return out;
}
const SRC = resolve(import.meta.dir, "../../../src/marketing");
// Comentários explicam a regra ("sem pin, sem snap"), então não podem contar como violação dela.
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const codigo = arquivos(SRC).map((f) => ({ f: f.replace(SRC, "src"), t: semComentarios(readFileSync(f, "utf8")) }));

describe("movimento (docs/40 §13, §13.3)", () => {
  test("nenhum addEventListener('scroll' | 'wheel' | 'touchmove') nem onscroll no código da landing", () => {
    const ruins = codigo.filter(({ t }) => /addEventListener\(\s*["'](scroll|wheel|touchmove)["']|\bonscroll\b|\bonWheel\b|\bonTouchMove\b/.test(t)).map((c) => c.f);
    expect(ruins).toEqual([]);
  });

  test("sem window.scrollY em estado e sem loop de requestAnimationFrame", () => {
    const ruins = codigo.filter(({ t }) => /scrollY|pageYOffset|requestAnimationFrame\(\s*function\s+\w+|setInterval\(/.test(t)).map((c) => c.f);
    expect(ruins).toEqual([]);
  });

  test("sem parallax, pin, snap, marquee, loop infinito nem cursor customizado", () => {
    const proibidos = /parallax|pin\s*:|snap\s*:|marquee|animation-iteration-count:\s*infinite|\binfinite\b|cursor:\s*url|SplitText/i;
    const ruins = codigo.filter(({ f, t }) => proibidos.test(t)).map((c) => c.f);
    // utilities.css e tokens.css são snapshots do app (têm anim-breathe etc. que a landing não usa).
    expect(ruins).toEqual([]);
  });

  test("a landing só anima transform, opacity, clip-path e stroke-dashoffset nos próprios arquivos de movimento", () => {
    const meus = codigo.filter(({ f }) => /marketing\.css/.test(f));
    const ruins = meus.filter(({ t }) => /transition(-property)?:\s*[^;]*\b(width|height|top|left|right|bottom|margin|padding)\b/.test(t)).map((c) => c.f);
    expect(ruins).toEqual([]);
  });

  test("todo estado inicial escondido fica sob html.lp-motion (conteúdo visível sem JS)", () => {
    const css = codigo.filter(({ f }) => f.endsWith(".css") && true).map((c) => c.t).join("\n");
    // Regras que zeram opacity ou clip-path têm de estar sob html.lp-motion.
    const blocos = css.split("}").filter((b) => /opacity:\s*0\b/.test(b) || /transform:\s*translateY\(var\(--lp-rise\)\)/.test(b));
    for (const b of blocos) {
      if (/@keyframes|from\s*\{|^\s*to\s*\{/.test(b)) continue; // keyframes começam em 0 por definição
      expect(b, `regra que esconde sem lp-motion: ${b.trim().slice(0, 80)}`).toContain("html.lp-motion");
    }
  });
});

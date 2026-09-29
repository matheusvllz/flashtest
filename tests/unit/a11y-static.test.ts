import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { botoesDe } from "./helpers/jsx-botoes";

/**
 * Acessibilidade estática (docs/36 RA-2/RA-3, T-08.8).
 *
 * RA-3: todo `<button>` fora de `src/components/ui/` (shadcn, não usado pelas telas) tem
 * `type=` explícito — sem ele, dentro de um `<form>` o botão vira submit sem querer — e todo
 * botão que só tem ícone tem `aria-label`.
 *
 * O teste lê o JSX como texto e extrai a tag de abertura respeitando `{…}` e strings (um `>`
 * dentro de `onClick={() => …}` não fecha a tag).
 */
const RAIZ = join(import.meta.dir, "..", "..");

function arquivos(dir: string, acc: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) {
      if (nome === "ui") continue; // shadcn: fora do escopo (docs/36 T-08.8)
      arquivos(p, acc);
    } else if (/\.tsx$/.test(nome)) acc.push(p);
  }
  return acc;
}

const temType = (tag: string) => /\stype=/.test(tag);
const temRotuloAria = (tag: string) => /\saria-label(ledby)?=/.test(tag) || /\stitle=/.test(tag);
/**
 * Botão "só ícone": depois de tirar ícones (`<X … />`, `<svg>`, `<img>` sem alt) não sobra nada —
 * nem texto, nem expressão `{…}` (que pode ser texto). `<img alt="algo">` dá nome ao botão.
 */
function soIcone(corpo: string): boolean {
  if (/<img\b[^>]*\balt="[^"]+"/s.test(corpo)) return false;
  const semIcones = corpo
    .replace(/<img\b[^>]*\/?>/gs, "")
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/<[A-Z]\w*(?:\s(?:[^<>{}]|\{[^{}]*\})*)?\/>/gs, ""); // <X size={16} className="…" />
  return semIcones.trim() === "" && semIcones !== corpo;
}

const FONTES = [join(RAIZ, "src", "routes"), join(RAIZ, "src", "components")].flatMap((d) => arquivos(d));
const TODOS = FONTES.flatMap((f) => botoesDe(readFileSync(f, "utf8"), relative(RAIZ, f).replaceAll("\\", "/")));

describe("extrator de <button> (sanidade do próprio teste)", () => {
  test("respeita > dentro de {…} e distingue com/sem type", () => {
    const src = `<button\n  onClick={() => a > b && f()}\n  className="x"\n>Oi</button>\n<button type="button" aria-label="Fechar"><X size={16} /></button>`;
    const [a, b] = botoesDe(src, "x.tsx");
    expect(a.texto).toContain("className");
    expect(temType(a.texto)).toBe(false);
    expect(a.corpo).toBe("Oi");
    expect(temType(b.texto)).toBe(true);
    expect(soIcone(b.corpo)).toBe(true);
    expect(temRotuloAria(b.texto)).toBe(true);
    expect(soIcone("Fechar")).toBe(false);
  });

  test("acha botões de verdade nas telas (guarda contra regex quebrado)", () => {
    expect(FONTES.length).toBeGreaterThan(50);
    expect(TODOS.length).toBeGreaterThan(80);
  });
});

describe("RA-3: type= e rótulo nos botões (docs/36 T-08.8)", () => {
  test("nenhum <button> em src/routes|src/components (fora de ui/) sem type=", () => {
    const sem = TODOS.filter((b) => !temType(b.texto)).map((b) => `${b.arquivo}:${b.linha}`);
    expect(sem, `botões sem type: ${sem.join(", ")}`).toEqual([]);
  });

  test("todo type= é 'button', 'submit' ou 'reset'", () => {
    const ruins = TODOS.filter((b) => /\stype=/.test(b.texto) && !/\stype=(?:"(?:button|submit|reset)"|\{[^}]*\})/.test(b.texto)).map(
      (b) => `${b.arquivo}:${b.linha}`,
    );
    expect(ruins).toEqual([]);
  });

  test("botão que só tem ícone tem aria-label (ou title)", () => {
    const sem = TODOS.filter((b) => soIcone(b.corpo) && !temRotuloAria(b.texto)).map((b) => `${b.arquivo}:${b.linha}`);
    expect(sem, `botões só de ícone sem rótulo: ${sem.join(", ")}`).toEqual([]);
  });
});

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Contraste dos pares de token realmente usados (docs/36 RA-4, T-08.9, risco N12), nos dois
 * temas. Lê os hex de `:root` e `.dark` em `src/styles.css` (uma fonte só) e calcula a
 * razão de luminância WCAG 2.x, inclusive de fundos que são mistura (`color-mix(…)`).
 *
 * Limiares: texto 4,5:1; gráficos/ícones/bordas de controle selecionado 3:1.
 * Falha que detecta: alguém mexer num token e deixar um par usado no app abaixo do limiar
 * (foi assim que o botão primário do escuro ficou com branco sobre azul-claro, 3,16:1).
 */
const CSS = readFileSync(join(import.meta.dir, "..", "..", "src", "styles.css"), "utf8");

/** Variáveis base `--nome: #rrggbb;` de um bloco (`:root {` ou `.dark {`), o primeiro que aparecer. */
function bloco(seletor: RegExp): Record<string, string> {
  const ini = CSS.search(seletor);
  if (ini < 0) throw new Error(`bloco ${seletor} não encontrado em styles.css`);
  const abre = CSS.indexOf("{", ini);
  let prof = 0;
  let fim = abre;
  for (let i = abre; i < CSS.length; i++) {
    if (CSS[i] === "{") prof++;
    else if (CSS[i] === "}" && --prof === 0) {
      fim = i;
      break;
    }
  }
  const vars: Record<string, string> = {};
  for (const m of CSS.slice(abre, fim).matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) vars[m[1]] = m[2].toLowerCase();
  return vars;
}

const CLARO = bloco(/^:root\s*\{/m);
const ESCURO = { ...CLARO, ...bloco(/^\.dark\s*\{/m) }; // `.dark` só redefine o que muda; o resto herda de `:root`

const canal = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const rgb = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
const luminancia = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
};
export function contraste(a: string, b: string): number {
  const x = luminancia(a);
  const y = luminancia(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** `color-mix(in srgb, frente P%, fundo)` — mesma conta do navegador em sRGB. */
export function misturar(frente: string, fundo: string, p: number): string {
  const f = rgb(frente);
  const g = rgb(fundo);
  return "#" + f.map((v, i) => Math.round(v * p + g[i] * (1 - p)).toString(16).padStart(2, "0")).join("");
}

type Tema = Record<string, string>;
type Par = { nome: string; onde: string; fg: (t: Tema) => string; bg: (t: Tema) => string; min: number };
const T = 4.5; // texto
const G = 3; // gráfico / ícone / borda de controle selecionado

const PARES: Par[] = [
  // ---- texto sobre as superfícies de papel
  { nome: "abismo / neve", onde: "texto forte sobre a página", fg: (t) => t.abismo, bg: (t) => t.neve, min: T },
  { nome: "abismo / cards", onde: "texto sobre card", fg: (t) => t.abismo, bg: (t) => t.cards, min: T },
  { nome: "abismo / gelo", onde: "chip e marcador inativos", fg: (t) => t.abismo, bg: (t) => t.gelo, min: T },
  { nome: "nevoa / neve", onde: "texto secundário sobre a página", fg: (t) => t.nevoa, bg: (t) => t.neve, min: T },
  { nome: "nevoa / cards", onde: "texto secundário sobre card", fg: (t) => t.nevoa, bg: (t) => t.cards, min: T },
  { nome: "nevoa / mistura success 10% + cards", onde: "fonte oficial na folha de acerto", fg: (t) => t.nevoa, bg: (t) => misturar(t.success, t.cards, 0.1), min: T },
  { nome: "nevoa / mistura error 10% + cards", onde: "fonte oficial na folha de erro", fg: (t) => t.nevoa, bg: (t) => misturar(t.error, t.cards, 0.1), min: T },
  { nome: "mar-fundo / neve", onde: "link e rótulo de seção", fg: (t) => t["mar-fundo"], bg: (t) => t.neve, min: T },
  { nome: "mar-fundo / cards", onde: "link e número sobre card", fg: (t) => t["mar-fundo"], bg: (t) => t.cards, min: T },
  { nome: "mar-fundo / mistura mar 12% + neve", onde: "chip selecionado, badge de lacuna alta", fg: (t) => t["mar-fundo"], bg: (t) => misturar(t.mar, t.neve, 0.12), min: T },
  // ---- texto sobre preenchimentos de cor (tokens `on-*`)
  { nome: "on-mar / mar", onde: "btn-primary, balão do aluno, marcador selecionado", fg: (t) => t["on-mar"], bg: (t) => t.mar, min: T },
  { nome: "on-success / success-texto", onde: "marcador de alternativa certa, par correto", fg: (t) => t["on-success"], bg: (t) => t["success-texto"], min: T },
  { nome: "on-error / error", onde: "marcador de alternativa errada, par errado", fg: (t) => t["on-error"], bg: (t) => t.error, min: T },
  { nome: "on-alert / alert", onde: "texto sobre o marca-texto de XP/streak/marco", fg: (t) => t["on-alert"], bg: (t) => t.alert, min: T },
  { nome: "cards / abismo", onde: "btn-abismo", fg: (t) => t.cards, bg: (t) => t.abismo, min: T },
  // ---- feedback de resposta
  { nome: "success-texto / cards", onde: "título de acerto", fg: (t) => t["success-texto"], bg: (t) => t.cards, min: T },
  { nome: "success-texto / neve", onde: "título de acerto sobre a página", fg: (t) => t["success-texto"], bg: (t) => t.neve, min: T },
  { nome: "error / cards", onde: "mensagem de erro (formulário, tutor)", fg: (t) => t.error, bg: (t) => t.cards, min: T },
  { nome: "error / neve", onde: "mensagem de erro sobre a página", fg: (t) => t.error, bg: (t) => t.neve, min: T },
  { nome: "abismo / mistura success 10% + cards", onde: "explicação na folha de acerto", fg: (t) => t.abismo, bg: (t) => misturar(t.success, t.cards, 0.1), min: T },
  { nome: "abismo / mistura error 10% + cards", onde: "explicação na folha de erro", fg: (t) => t.abismo, bg: (t) => misturar(t.error, t.cards, 0.1), min: T },
  // ---- gráficos, ícones e bordas de controle selecionado (3:1)
  { nome: "mar / neve", onde: "borda de seleção, anel de foco, barra de progresso", fg: (t) => t.mar, bg: (t) => t.neve, min: G },
  { nome: "mar / cards", onde: "borda de seleção sobre card", fg: (t) => t.mar, bg: (t) => t.cards, min: G },
  { nome: "ring / neve", onde: "anel de foco (`:focus-visible`)", fg: (t) => t.ring, bg: (t) => t.neve, min: G },
  { nome: "ring / cards", onde: "anel de foco sobre card", fg: (t) => t.ring, bg: (t) => t.cards, min: G },
  { nome: "success / cards", onde: "ícone de acerto", fg: (t) => t.success, bg: (t) => t.cards, min: G },
  { nome: "error / cards (ícone)", onde: "ícone de erro", fg: (t) => t.error, bg: (t) => t.cards, min: G },
  { nome: "nevoa / gelo", onde: "ícone de nó bloqueado", fg: (t) => t.nevoa, bg: (t) => t.gelo, min: G },
];

describe("extração dos tokens de styles.css", () => {
  test("acha as variáveis base nos dois temas (guarda contra regex quebrado)", () => {
    for (const nome of ["abismo", "neve", "cards", "nevoa", "mar", "mar-fundo", "success-texto", "error", "alert", "on-mar", "on-success", "on-error", "on-alert", "ring"]) {
      expect(CLARO[nome], `--${nome} em :root`).toMatch(/^#[0-9a-f]{6}$/);
      expect(ESCURO[nome], `--${nome} em .dark`).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(CLARO.neve).toBe("#f6f5f1");
    expect(ESCURO.neve).toBe("#1c1b18");
  });

  test("a calculadora bate com valores conhecidos", () => {
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contraste("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
    expect(misturar("#ff0000", "#000000", 0.5)).toBe("#800000");
  });
});

for (const [tema, tokens] of [
  ["claro", CLARO],
  ["escuro", ESCURO],
] as const) {
  describe(`contraste dos pares usados — tema ${tema} (docs/36 RA-4)`, () => {
    for (const par of PARES) {
      test(`${par.nome} ≥ ${par.min}:1 (${par.onde})`, () => {
        const razao = contraste(par.fg(tokens), par.bg(tokens));
        expect(razao, `${par.nome} no tema ${tema}: ${par.fg(tokens)} sobre ${par.bg(tokens)} = ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(par.min);
      });
    }
  });
}

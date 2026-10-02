import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FocaCorpo } from "@/components/brand/FocaCorpo";
import { FocaMark } from "@/components/brand/FocaMark";
import { IconePerola, LogoPerolas } from "@/components/economia/IconePerola";
import {
  aparelhoFraco,
  focaCorpoExpressao,
  focaPose,
  focaRoupa,
  FOCA_CORPO_EXPRESSOES,
  FOCA_POSES,
  FOCA_ROUPAS,
} from "@/lib/brand/foca-corpo";

/**
 * Foca de corpo inteiro e ícone das Pérolas (spec 50 §5.8, §5.3.6; T-50.3.1, T-50.3.3, T-50.3.5, T-50.4.5).
 * Falhas que detecta: uma expressão ou pose que quebra o render; o CSS de movimento girando a Foca inteira
 * ou sem bloco de movimento reduzido; o `FocaMark` padrão (cabeça) mudando de markup; o corpo vazando para a
 * raiz ou a landing (regra dura 9).
 */
const RAIZ = join(import.meta.dir, "..", "..");
const ler = (rel: string) => readFileSync(join(RAIZ, rel), "utf8").replace(/\r\n/g, "\n");
const corpo = (props: Record<string, unknown>) => renderToStaticMarkup(h(FocaCorpo, props));

const PARTES = [
  "figura",
  "corpo",
  "barriga",
  "cabeca",
  "manchas",
  "olho-esq",
  "olho-dir",
  "focinho",
  "boca",
  "nadadeira-esq",
  "nadadeira-dir",
  "cauda",
];

describe("FocaCorpo — render", () => {
  for (const expressao of FOCA_CORPO_EXPRESSOES) {
    for (const pose of FOCA_POSES) {
      test(`${expressao} × ${pose} renderiza com todas as camadas`, () => {
        const html = corpo({ expressao, pose, size: 120 });
        for (const parte of PARTES) expect(html).toContain(`data-parte="${parte}"`);
        expect(html).toContain(`data-pose="${pose}"`);
        expect(html).toContain('width="120"');
        // A pose dormindo fecha os olhos seja qual for a expressão.
        expect(html).toContain(`data-rosto="${pose === "dormindo" ? "dormindo" : expressao}"`);
      });
    }
  }

  test("boca aberta tem língua; dormindo tem o z", () => {
    for (const e of ["empolgada", "orgulhosa", "surpresa"] as const) {
      expect(corpo({ expressao: e })).toContain('data-parte="lingua"');
    }
    expect(corpo({ expressao: "neutra" })).not.toContain('data-parte="lingua"');
    expect(corpo({ pose: "dormindo" })).toContain('data-parte="z"');
    expect(corpo({ pose: "parada" })).not.toContain('data-parte="z"');
  });

  test("cores só por token (nenhum hex no SVG)", () => {
    for (const r of FOCA_ROUPAS) {
      const html = corpo({ expressao: "empolgada", roupa: r.id });
      expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
      expect(html).toContain("var(--foca-pele)");
    }
  });

  test("acessível: título por padrão, fora da árvore com decorative", () => {
    const comTitulo = corpo({ title: "Foca comemorando" });
    expect(comTitulo).toContain('role="img"');
    expect(comTitulo).toContain(">Foca comemorando</title>");
    const decorativa = corpo({ decorative: true });
    expect(decorativa).toContain('aria-hidden="true"');
    expect(decorativa).not.toContain("<title");
  });

  test("antes de hidratar fica parada (sem data-ativa): nada anima no SSR", () => {
    const html = corpo({ pose: "aceno" });
    expect(html).not.toContain("data-ativa");
  });

  test("roupas: 6 camadas com nome em pt-BR, ancoradas na cabeça ou no pescoço", () => {
    expect(FOCA_ROUPAS.map((r) => r.id)).toEqual([
      "bone",
      "oculos",
      "cachecol",
      "fone",
      "mochila",
      "coroa-conchas",
    ]);
    expect(FOCA_ROUPAS.map((r) => r.nome)).toEqual([
      "Boné",
      "Óculos",
      "Cachecol",
      "Fone",
      "Mochila",
      "Coroa de conchas",
    ]);
    for (const r of FOCA_ROUPAS) {
      expect(corpo({ roupa: r.id })).toContain(`data-roupa="${r.id}"`);
      expect(["cabeca", "pescoco"]).toContain(r.ancora);
    }
    expect(corpo({})).not.toContain("data-roupa");
    expect(corpo({ roupa: "chapeu-que-nao-existe" })).not.toContain("data-roupa");
  });
});

describe("regras puras do corpo", () => {
  test("o corpo não tem desapontada, cobrando nem entediada: viram neutra", () => {
    expect(FOCA_CORPO_EXPRESSOES as readonly string[]).not.toContain("desapontada");
    expect(FOCA_CORPO_EXPRESSOES as readonly string[]).not.toContain("cobrando");
    for (const v of ["desapontada", "cobrando", "entediada", "qualquer", undefined, 3]) {
      expect(focaCorpoExpressao(v)).toBe("neutra");
    }
    expect(focaCorpoExpressao("surpresa")).toBe("surpresa");
  });

  test("pose e roupa desconhecidas não quebram", () => {
    expect(focaPose("voando")).toBe("parada");
    expect(focaPose("pulo")).toBe("pulo");
    expect(focaRoupa("bone")).toBe("bone");
    expect(focaRoupa("capa")).toBeUndefined();
  });

  test("aparelho fraco: deviceMemory ≤ 2 ou hardwareConcurrency ≤ 4", () => {
    expect(aparelhoFraco({ deviceMemory: 2, hardwareConcurrency: 8 })).toBe(true);
    expect(aparelhoFraco({ deviceMemory: 4, hardwareConcurrency: 4 })).toBe(true);
    expect(aparelhoFraco({ deviceMemory: 8, hardwareConcurrency: 8 })).toBe(false);
    expect(aparelhoFraco({ hardwareConcurrency: 8 })).toBe(false); // Safari: sem deviceMemory
    expect(aparelhoFraco(undefined)).toBe(false);
  });
});

/* ------------------------------------------------------------------ CSS de movimento */
const CSS_MOV = ler("src/styles/foca-corpo.css").replace(/\/\*[\s\S]*?\*\//g, "");

/** Regras `seletor { corpo }` de primeiro nível e de dentro de @media (sem aninhamento mais fundo). */
function regras(css: string): { seletor: string; corpo: string; media: string | null }[] {
  const saida: { seletor: string; corpo: string; media: string | null }[] = [];
  let i = 0;
  const ler = (fim: number, media: string | null) => {
    while (i < fim) {
      const abre = css.indexOf("{", i);
      if (abre < 0 || abre >= fim) break;
      const cabeca = css.slice(i, abre).trim();
      let prof = 1;
      let j = abre + 1;
      for (; j < css.length && prof > 0; j++) {
        if (css[j] === "{") prof++;
        else if (css[j] === "}") prof--;
      }
      const corpo = css.slice(abre + 1, j - 1);
      if (cabeca.startsWith("@media")) {
        const salvo = i;
        i = abre + 1;
        ler(j - 1, cabeca);
        i = Math.max(salvo, j);
      } else {
        saida.push({ seletor: cabeca, corpo, media });
        i = j;
      }
    }
  };
  ler(css.length, null);
  return saida;
}
const TODAS = regras(CSS_MOV);
const KEYFRAMES = Object.fromEntries(
  TODAS.filter((r) => r.seletor.startsWith("@keyframes")).map((r) => [
    r.seletor.replace("@keyframes", "").trim(),
    r.corpo,
  ]),
);
/** O sujeito do seletor (último composto) é a Foca inteira? */
const miraARaiz = (seletor: string) =>
  seletor.split(",").some((s) => {
    const partes = s.trim().split(/\s+/);
    const sujeito = partes[partes.length - 1];
    return (
      /^(\.foca-corpo|\.fc-svg|\.fc-respira)(\[|:|$|\.)/.test(sujeito) &&
      !sujeito.includes("data-parte")
    );
  });

describe("movimento (src/styles/foca-corpo.css)", () => {
  test("o arquivo é importado por styles.css", () => {
    expect(ler("src/styles.css")).toMatch(/@import\s+"\.\/styles\/foca-corpo\.css";/);
  });

  test("nenhuma regra gira a Foca inteira (raiz, svg ou grupo de respiração)", () => {
    const daRaiz = TODAS.filter((r) => !r.seletor.startsWith("@") && miraARaiz(r.seletor));
    expect(daRaiz.length).toBeGreaterThan(3); // guarda contra o parser não achar nada
    for (const r of daRaiz) {
      expect(r.corpo, r.seletor).not.toMatch(/rotate/);
      for (const m of r.corpo.matchAll(/animation(?:-name)?\s*:\s*([a-z0-9-]+)/g)) {
        const kf = KEYFRAMES[m[1]];
        if (kf === undefined) continue; // "none"
        expect(kf, `@keyframes ${m[1]} usado em ${r.seletor}`).not.toMatch(/rotate/);
      }
    }
  });

  test("só transform e opacity animam (nada de layout)", () => {
    for (const [nome, corpo] of Object.entries(KEYFRAMES)) {
      const props = [...corpo.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
      for (const p of props) {
        expect(["transform", "opacity", "animation-timing-function"], `${nome}: ${p}`).toContain(p);
      }
    }
  });

  test("os movimentos da spec existem (§5.8.3)", () => {
    for (const nome of [
      "fc-respirar",
      "fc-piscar",
      "fc-acenar",
      "fc-pular",
      "fc-palma-esq",
      "fc-palma-dir",
      "fc-abanar",
      "fc-z",
    ]) {
      expect(KEYFRAMES[nome], nome).toBeDefined();
    }
    expect(KEYFRAMES["fc-acenar"]).toContain("rotate(-25deg)");
    expect(KEYFRAMES["fc-abanar"]).toContain("rotate(-20deg)");
    expect(KEYFRAMES["fc-pular"]).toContain("translateY(-12px)");
    expect(KEYFRAMES["fc-pular"]).toContain("scale(1.04, 0.94)");
    expect(KEYFRAMES["fc-respirar"]).toContain("scale(1.02)");
    expect(CSS_MOV).toContain("fc-respirar 3200ms");
    expect(CSS_MOV).toContain("fc-acenar 900ms ease-out 2");
    expect(CSS_MOV).toContain("fc-palma-esq 300ms ease-in-out 2");
    expect(CSS_MOV).toContain("fc-abanar 800ms ease-in-out 3");
    expect(CSS_MOV).toContain("fc-pular 600ms var(--ease-bounce)");
    expect(CSS_MOV).toContain("fc-z 4000ms linear infinite");
  });

  test("movimento reduzido: bloco próprio que desliga toda animação do corpo", () => {
    const reduzido = TODAS.filter((r) => r.media?.includes("prefers-reduced-motion: reduce"));
    expect(reduzido.length).toBeGreaterThan(0);
    expect(
      reduzido.some((r) => r.seletor.includes(".foca-corpo") && /animation:\s*none/.test(r.corpo)),
    ).toBe(true);
  });

  test("fora da tela pausa; aparelho fraco fica na pose final", () => {
    expect(CSS_MOV).toMatch(
      /\.foca-corpo:not\(\[data-ativa\]\)[^{]*\{\s*animation-play-state:\s*paused/,
    );
    expect(CSS_MOV).toMatch(/\.foca-corpo\[data-leve\][^{]*\{\s*animation:\s*none/);
  });
});

/* ------------------------------------------------------------------ FocaMark */
describe("FocaMark", () => {
  // Markup do FocaMark ANTES da spec 50 (capturado em 02/10/2026): sem `forma`, nada pode mudar.
  const ANTES = {
    padrao:
      '<picture style="display:contents"><source srcSet="/branding/foca/foca-color-96.webp" type="image/webp"/><img src="/branding/foca/foca-color-96.png" alt="Foca" width="32" height="32" draggable="false" decoding="async" style="width:32px;height:32px;object-fit:contain;display:block;flex-shrink:0"/></picture>',
    expressao:
      '<picture style="display:contents"><source srcSet="/branding/foca/expressoes/acolhedora-320.webp" type="image/webp"/><img src="/branding/foca/expressoes/acolhedora-320.png" alt="Foca" width="64" height="64" draggable="false" decoding="async" style="width:64px;height:64px;object-fit:contain;display:block;flex-shrink:0"/></picture>',
    linha:
      '<link rel="preload" as="image" href="/branding/foca/foca-line-dark-720.png"/><img src="/branding/foca/foca-line-dark-720.png" alt="Foca" width="160" height="160" draggable="false" decoding="async" style="width:160px;height:160px;object-fit:contain;display:block;flex-shrink:0"/>',
    decorativa:
      '<picture style="display:contents"><source srcSet="/branding/foca/expressoes/orgulhosa-320.webp" type="image/webp"/><img src="/branding/foca/expressoes/orgulhosa-320.png" alt="" aria-hidden="true" width="120" height="120" draggable="false" decoding="async" class="x anim-pop-in" style="width:120px;height:120px;object-fit:contain;display:block;flex-shrink:0"/></picture>',
  };

  test("sem `forma`: markup idêntico ao de antes da spec 50", () => {
    expect(renderToStaticMarkup(h(FocaMark))).toBe(ANTES.padrao);
    expect(renderToStaticMarkup(h(FocaMark, { expression: "acolhedora", size: 64 }))).toBe(
      ANTES.expressao,
    );
    expect(renderToStaticMarkup(h(FocaMark, { variant: "line-dark", size: 160 }))).toBe(
      ANTES.linha,
    );
    expect(
      renderToStaticMarkup(
        h(FocaMark, {
          expression: "orgulhosa",
          size: 120,
          motion: "pop",
          decorative: true,
          className: "x",
        }),
      ),
    ).toBe(ANTES.decorativa);
  });

  test("a cabeça nunca recebe roupa nem pose", () => {
    expect(
      renderToStaticMarkup(h(FocaMark, { forma: "cabeca", roupa: "bone", pose: "pulo" })),
    ).toBe(ANTES.padrao);
  });

  test("forma corpo: reserva do mesmo tamanho enquanto o módulo chega (sem pulo de layout)", () => {
    const html = renderToStaticMarkup(h(FocaMark, { forma: "corpo", size: 96, pose: "aceno" }));
    expect(html).toContain("width:96px;height:96px");
    expect(html).not.toContain("<img");
  });

  test("FocaMark importa o corpo só por import() (chunk próprio)", () => {
    const fonte = ler("src/components/brand/FocaMark.tsx");
    expect(fonte).toMatch(/import\(\s*["']\.\/FocaCorpo["']\s*\)/);
    expect(fonte).not.toMatch(/from\s+["'][^"']*FocaCorpo["']/);
  });
});

/* ------------------------------------------------------------------ code splitting (regra dura 9) */
function arquivos(dir: string): string[] {
  return readdirSync(join(RAIZ, dir)).flatMap((nome) => {
    const rel = `${dir}/${nome}`;
    return statSync(join(RAIZ, rel)).isDirectory()
      ? arquivos(rel)
      : /\.(tsx?|jsx?)$/.test(nome)
        ? [rel]
        : [];
  });
}

test("a raiz e a landing não importam o corpo da Foca (regra dura 9)", () => {
  for (const rel of [
    "src/routes/__root.tsx",
    "src/routes/index.tsx",
    ...arquivos("src/marketing"),
  ]) {
    let fonte = "";
    try {
      fonte = ler(rel);
    } catch {
      continue;
    }
    expect(fonte, rel).not.toMatch(/FocaCorpo|foca-corpo|roupas\/RoupaFoca/);
  }
});

/* ------------------------------------------------------------------ Pérolas */
describe("IconePerola", () => {
  test("renderiza com título acessível", () => {
    const html = renderToStaticMarkup(h(IconePerola, { size: 24, title: "Pérolas: 120" }));
    expect(html).toContain('role="img"');
    expect(html).toContain("<title>Pérolas: 120</title>");
    expect(html).toContain('width="24"');
    expect(html).toContain("var(--perola)");
    expect(html).toContain("var(--perola-brilho)");
  });

  test("decorativo sai da árvore; abaixo de 24 px perde os detalhes", () => {
    const pequeno = renderToStaticMarkup(h(IconePerola, { size: 16, decorative: true }));
    expect(pequeno).toContain('aria-hidden="true"');
    expect(pequeno).not.toContain("<title");
    expect(pequeno.match(/<path/g)?.length).toBe(1);
    const grande = renderToStaticMarkup(h(IconePerola, { size: 48 }));
    expect(grande.match(/<path/g)?.length).toBe(2);
  });

  test("logotipo: ícone decorativo + a palavra", () => {
    const html = renderToStaticMarkup(h(LogoPerolas, { size: 24 }));
    expect(html).toContain("Pérolas</span>");
    expect(html).toContain('aria-hidden="true"');
  });
});

/* ------------------------------------------------------------------ tokens */
describe("tokens novos (AGENTS.md: base em :root e .dark, @theme inline só com var())", () => {
  const css = ler("src/styles.css");
  const bloco = (re: RegExp) => {
    const ini = css.search(re);
    const abre = css.indexOf("{", ini);
    let prof = 0;
    for (let i = abre; i < css.length; i++) {
      if (css[i] === "{") prof++;
      else if (css[i] === "}" && --prof === 0) return css.slice(abre, i);
    }
    return "";
  };
  const root = bloco(/^:root\s*\{/m);
  const dark = bloco(/^\.dark\s*\{/m);
  const tema = bloco(/^@theme inline\s*\{/m);
  const NOVOS = [
    "perola",
    "perola-brilho",
    "foca-pele",
    "foca-pele-escura",
    "foca-barriga",
    "foca-tinta",
    "foca-lingua",
    "foca-branco",
    "foca-roupa-azul",
    "foca-roupa-ouro",
  ];
  for (const t of NOVOS) {
    test(`--${t} em :root, em .dark e referenciado por --color-${t}`, () => {
      expect(root).toMatch(new RegExp(`--${t}:\\s*#[0-9a-f]{6};`));
      expect(dark).toMatch(new RegExp(`--${t}:\\s*#[0-9a-f]{6};`));
      expect(tema).toContain(`--color-${t}: var(--${t});`);
    });
  }
  test("a mascote não muda de cor com o tema", () => {
    for (const t of NOVOS.filter((n) => n.startsWith("foca-"))) {
      const claro = root.match(new RegExp(`--${t}:\\s*(#[0-9a-f]{6});`))?.[1];
      const escuro = dark.match(new RegExp(`--${t}:\\s*(#[0-9a-f]{6});`))?.[1];
      expect(escuro, t).toBe(claro);
    }
  });
});

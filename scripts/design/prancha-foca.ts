// Pranchas de aprovação do dono (spec 50 §5.8.1 portão T-50.3.2; §5.3.6 T-50.4.5). Rodar da raiz:
//   bun scripts/design/prancha-foca.ts
//
// Gera:
//  - docs/design/brand/foca-corpo-prancha.html — original × SVG (64/120/200 px, claro e escuro), expressões,
//    poses no quadro de pico e roupas.
//  - docs/design/brand/perolas-prancha.html — ícone das Pérolas em 16–48 px e o logotipo, claro e escuro.
//  - docs/design/brand/previas/*.png — PNGs de conferência (sharp) para comparar com a arte original.
//
// Cores NUNCA digitadas aqui: vêm dos tokens de src/styles.css (`:root` e `.dark`). O HTML sai estático e
// autocontido (tokens resolvidos e o CSS de movimento embutidos), para abrir direto no navegador.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement as h, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { FocaCorpo } from "../../src/components/brand/FocaCorpo";
import { IconePerola, LogoPerolas } from "../../src/components/economia/IconePerola";
import {
  FOCA_CORPO_EXPRESSOES,
  FOCA_POSES,
  FOCA_ROUPAS,
  type FocaCorpoExpressao,
  type FocaPose,
  type FocaRoupaId,
} from "../../src/lib/brand/foca-corpo";

const ROOT = resolve(import.meta.dir, "../..");
const OUT = resolve(ROOT, "docs/design/brand");
const PREVIAS = resolve(OUT, "previas");
mkdirSync(PREVIAS, { recursive: true });

/* ------------------------------------------------------------------ tokens */
const css = readFileSync(resolve(ROOT, "src/styles.css"), "utf8").replace(/\r\n/g, "\n");
function bloco(seletor: RegExp): Record<string, string> {
  const corpo = css.match(seletor)?.[1];
  if (!corpo) throw new Error(`bloco ${seletor} não encontrado em src/styles.css`);
  const vars: Record<string, string> = {};
  for (const m of corpo.matchAll(
    /--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6}|cubic-bezier\([^)]*\))\s*;/g,
  )) {
    vars[m[1]] = m[2].toLowerCase();
  }
  return vars;
}
const CLARO = bloco(/\n:root\s*\{([\s\S]*?)\n\}/);
const ESCURO = { ...CLARO, ...bloco(/\n\.dark\s*\{([\s\S]*?)\n\}/) };
const USADOS = [
  "neve",
  "cards",
  "abismo",
  "nevoa",
  "gelo",
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
  "ease-bounce",
];
for (const t of USADOS) {
  if (!CLARO[t] || !ESCURO[t]) throw new Error(`token --${t} ausente em :root ou .dark`);
}
const declarar = (tema: Record<string, string>) =>
  USADOS.map((t) => `--${t}: ${tema[t]};`).join(" ");
/** Para o sharp (librsvg não resolve `var()`): troca cada `var(--x)` pelo valor do tema. */
const resolver = (svg: string, tema: Record<string, string>) =>
  svg.replace(/var\(--([a-z0-9-]+)\)/g, (_, nome: string) => {
    const v = tema[nome];
    if (!v) throw new Error(`token --${nome} sem valor resolvido`);
    return v;
  });

const movimentoCss = readFileSync(resolve(ROOT, "src/styles/foca-corpo.css"), "utf8");

/* ------------------------------------------------------------------ peças */
const foca = (p: {
  expressao?: FocaCorpoExpressao;
  pose?: FocaPose;
  roupa?: FocaRoupaId;
  size: number;
}): string =>
  renderToStaticMarkup(
    h(FocaCorpo, { ...p, animar: false, title: `Foca ${p.expressao ?? "neutra"}` }) as ReactElement,
  );

/** Quadro de pico de cada pose, para a prancha (no app o pico é um instante da animação). */
const PICO_CSS = `
.pico[data-pose="aceno"] [data-parte="nadadeira-dir"] { animation: none; transform: rotate(-25deg); }
.pico[data-pose="pulo"] .fc-svg { animation: none; transform: translateY(-12px) scale(0.98, 1.03); }
.pico[data-pose="palmas"] [data-parte="nadadeira-esq"] { animation: none; transform: rotate(28deg); }
.pico[data-pose="palmas"] [data-parte="nadadeira-dir"] { animation: none; transform: rotate(-28deg); }
.pico[data-pose="cauda"] [data-parte="cauda"] { animation: none; transform: rotate(-20deg); }
.foca-corpo [data-parte="z"] { animation: none; }
`;
/** Mesmo pico para o PNG, em atributo SVG (articulações em coordenadas da arte). */
function picoSvg(svg: string, pose: FocaPose): string {
  const gira = (parte: string, graus: number, x: number, y: number) =>
    svg.replace(
      `data-parte="${parte}">`,
      `data-parte="${parte}" transform="rotate(${graus} ${x} ${y})">`,
    );
  if (pose === "aceno") return gira("nadadeira-dir", -25, 866, 805);
  if (pose === "cauda") return gira("cauda", -20, 898, 1050);
  if (pose === "palmas") {
    svg = gira("nadadeira-esq", 28, 372, 805);
    return gira("nadadeira-dir", -28, 866, 805);
  }
  return svg;
}

const ORIGINAL = "../../../src/assets/branding/foca/corpo/foca-corpo-original.jpg";

function painel(tema: "claro" | "escuro", conteudo: string) {
  return `<div class="painel ${tema}"><p class="rotulo">${tema === "claro" ? "Claro (--neve)" : "Escuro (.dark --neve)"}</p>${conteudo}</div>`;
}
const celula = (legenda: string, miolo: string) =>
  `<figure><div class="palco">${miolo}</div><figcaption>${legenda}</figcaption></figure>`;

/* ------------------------------------------------------------------ prancha da Foca */
function paginaFoca(): string {
  const tamanhos = [64, 120, 200];
  const comparacao = (tema: "claro" | "escuro") =>
    painel(
      tema,
      `<div class="linha">${celula("original (arte de 02/10)", `<img src="${ORIGINAL}" width="200" height="200" alt="Arte original da Foca de corpo inteiro">`)}${tamanhos
        .map((s) => celula(`SVG ${s} px · empolgada`, foca({ expressao: "empolgada", size: s })))
        .join(
          "",
        )}${tamanhos.map((s) => celula(`SVG ${s} px · neutra`, foca({ size: s }))).join("")}</div>`,
    );
  const expressoes = (tema: "claro" | "escuro") =>
    painel(
      tema,
      `<div class="linha">${FOCA_CORPO_EXPRESSOES.map((e) => celula(e, foca({ expressao: e, size: 120 }))).join("")}</div>`,
    );
  const poses = (tema: "claro" | "escuro") =>
    painel(
      tema,
      `<div class="linha">${FOCA_POSES.map((p) =>
        celula(
          p === "parada" || p === "dormindo" ? p : `${p} (pico)`,
          `<div class="pico" data-pose="${p}">${foca({ pose: p, expressao: p === "parada" ? "neutra" : "empolgada", size: 120 }).replace('class="foca-corpo"', 'class="foca-corpo pico"')}</div>`,
        ),
      ).join("")}</div>`,
    );
  const roupas = (tema: "claro" | "escuro") =>
    painel(
      tema,
      `<div class="linha">${FOCA_ROUPAS.map((r) =>
        celula(`${r.nome} (${r.id})`, foca({ roupa: r.id, expressao: "acolhedora", size: 120 })),
      ).join("")}</div><div class="linha">${FOCA_ROUPAS.map((r) =>
        celula(`${r.nome} · 64 px`, foca({ roupa: r.id, size: 64 })),
      ).join("")}</div>`,
    );

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Foca de corpo inteiro — prancha</title>
<style>
:root { ${declarar(CLARO)} }
body { margin: 0; padding: 24px 16px 48px; font-family: system-ui, sans-serif; background: ${CLARO.neve}; color: ${CLARO.abismo}; }
h1 { font-size: 24px; margin: 0 0 4px; } h2 { font-size: 18px; margin: 32px 0 8px; }
p.nota { max-width: 760px; color: ${CLARO.nevoa}; font-size: 14px; line-height: 1.5; }
.painel { border-radius: 16px; padding: 16px; margin: 8px 0; border: 2px solid ${CLARO.gelo}; }
.painel.claro { ${declarar(CLARO)} background: var(--neve); color: var(--abismo); }
.painel.escuro { ${declarar(ESCURO)} background: var(--neve); color: var(--abismo); border-color: ${ESCURO.gelo}; }
.rotulo { margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.linha { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; }
figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.palco { display: flex; align-items: flex-end; justify-content: center; min-height: 64px; }
figcaption { font-size: 12px; }
img { border-radius: 8px; }
${movimentoCss}
${PICO_CSS}
</style></head><body>
<h1>Foca de corpo inteiro — prancha para aprovação</h1>
<p class="nota">Spec 50 §5.8.1 (portão T-50.3.2). SVG vetorial redesenhado da arte original, em camadas
(corpo, barriga, cabeça, manchas, olhos com brilho, focinho, boca, língua, nadadeiras, cauda), cores pelos tokens
<code>--foca-*</code> de <code>src/styles.css</code> (iguais nos dois temas). A arte original tem fundo preto
porque o JPG não guarda transparência. Gerado por <code>bun scripts/design/prancha-foca.ts</code>.</p>
<h2>1. Original × SVG (64, 120 e 200 px)</h2>
${comparacao("claro")}${comparacao("escuro")}
<h2>2. Expressões do corpo (120 px)</h2>
<p class="nota">5 expressões de momento + dormindo. O corpo não tem <code>desapontada</code> nem <code>cobrando</code>
(nem <code>entediada</code>): o <code>FocaMark</code> manda essas para <code>neutra</code>.</p>
${expressoes("claro")}${expressoes("escuro")}
<h2>3. Poses no quadro de pico (120 px)</h2>
<p class="nota">No app cada pose é um movimento curto (§5.8.3); aqui aparece o instante de maior amplitude:
aceno 25°, pulo −12 px, palmas 28°, cauda 20°. A Foca inteira nunca gira, só as partes.</p>
${poses("claro")}${poses("escuro")}
<h2>4. Roupas (T-50.3.5)</h2>
<p class="nota">Camadas ancoradas na cabeça ou no pescoço. Só o corpo veste roupa; a cabeça, a logo e o ícone nunca.</p>
${roupas("claro")}${roupas("escuro")}
</body></html>
`;
}

/* ------------------------------------------------------------------ prancha das Pérolas */
function paginaPerolas(): string {
  const tamanhos = [16, 20, 24, 32, 48];
  const bloco = (tema: "claro" | "escuro") =>
    painel(
      tema,
      `<div class="linha">${tamanhos
        .map((s) => celula(`${s} px`, renderToStaticMarkup(h(IconePerola, { size: s }))))
        .join("")}</div>
      <div class="linha" style="margin-top:16px">${[20, 24, 32]
        .map((s) => celula(`logotipo ${s} px`, renderToStaticMarkup(h(LogoPerolas, { size: s }))))
        .join("")}</div>
      <div class="linha" style="margin-top:16px">${celula(
        "no cartão (--cards)",
        `<span style="background:var(--cards);padding:8px 12px;border-radius:12px;display:inline-flex;gap:6px;align-items:center;font-weight:700">${renderToStaticMarkup(h(IconePerola, { size: 20, decorative: true }))} 120</span>`,
      )}</div>`,
    );
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pérolas — prancha</title>
<style>
body { margin: 0; padding: 24px 16px 48px; font-family: system-ui, sans-serif; background: ${CLARO.neve}; color: ${CLARO.abismo}; }
h1 { font-size: 24px; margin: 0 0 4px; }
p.nota { max-width: 760px; color: ${CLARO.nevoa}; font-size: 14px; line-height: 1.5; }
.painel { border-radius: 16px; padding: 16px; margin: 8px 0; border: 2px solid ${CLARO.gelo}; }
.painel.claro { ${declarar(CLARO)} background: var(--neve); color: var(--abismo); }
.painel.escuro { ${declarar(ESCURO)} background: var(--neve); color: var(--abismo); border-color: ${ESCURO.gelo}; }
.rotulo { margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.linha { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; }
figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; }
figcaption { font-size: 12px; }
.font-display { font-family: "Space Grotesk", system-ui, sans-serif; } .font-bold { font-weight: 700; }
.inline-flex { display: inline-flex; } .items-center { align-items: center; } .text-abismo { color: var(--abismo); }
</style></head><body>
<h1>Pérolas — ícone e logotipo</h1>
<p class="nota">Spec 50 §5.3.6 (T-50.4.5). Pérola com brilho e contorno de grafite (traço do sistema rabisco).
Corpo <code>--perola</code> ${CLARO.perola} no claro (3,7:1 sobre --neve) e ${ESCURO.perola} no escuro (8,0:1 sobre o fundo);
brilho <code>--perola-brilho</code>. Abaixo de 24 px some o brilho secundário e a faísca.
Gerado por <code>bun scripts/design/prancha-foca.ts</code>.</p>
${bloco("claro")}${bloco("escuro")}
</body></html>
`;
}

writeFileSync(resolve(OUT, "foca-corpo-prancha.html"), paginaFoca());
writeFileSync(resolve(OUT, "perolas-prancha.html"), paginaPerolas());

/* ------------------------------------------------------------------ PNGs de conferência */
async function svgPng(svg: string, tema: Record<string, string>, lado: number): Promise<Buffer> {
  // Só o <svg> (sem o <span> de layout), com xmlns e cores resolvidas, para o librsvg.
  const so = svg
    .slice(svg.indexOf("<svg"), svg.lastIndexOf("</svg>") + 6)
    .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  return sharp(Buffer.from(resolver(so, tema)), { density: 300 })
    .resize(lado, lado)
    .png()
    .toBuffer();
}
async function folha(
  arquivo: string,
  itens: Buffer[],
  lado: number,
  fundo: string,
  colunas = itens.length,
) {
  const linhas = Math.ceil(itens.length / colunas);
  await sharp({
    create: { width: lado * colunas, height: lado * linhas, channels: 4, background: fundo },
  })
    .composite(
      itens.map((input, i) => ({
        input,
        left: (i % colunas) * lado,
        top: Math.floor(i / colunas) * lado,
      })),
    )
    .png()
    .toFile(resolve(PREVIAS, arquivo));
}

const LADO = 320;
const original = await sharp(
  resolve(ROOT, "src/assets/branding/foca/corpo/foca-corpo-original.jpg"),
)
  .resize(LADO, LADO)
  .png()
  .toBuffer();
await folha(
  "foca-corpo-comparacao.png",
  [
    original,
    await svgPng(foca({ expressao: "empolgada", size: LADO }), CLARO, LADO),
    await svgPng(foca({ expressao: "empolgada", size: LADO }), ESCURO, LADO),
  ],
  LADO,
  "#000000",
);
await folha(
  "foca-corpo-expressoes.png",
  await Promise.all(
    FOCA_CORPO_EXPRESSOES.map((e) => svgPng(foca({ expressao: e, size: 240 }), CLARO, 240)),
  ),
  240,
  CLARO.neve,
);
await folha(
  "foca-corpo-poses.png",
  await Promise.all(
    FOCA_POSES.map((p) =>
      svgPng(picoSvg(foca({ pose: p, expressao: "empolgada", size: 240 }), p), CLARO, 240),
    ),
  ),
  240,
  CLARO.neve,
);
await folha(
  "foca-corpo-roupas.png",
  await Promise.all(
    FOCA_ROUPAS.map((r) =>
      svgPng(foca({ roupa: r.id, expressao: "acolhedora", size: 240 }), CLARO, 240),
    ),
  ),
  240,
  CLARO.neve,
);
await folha(
  "foca-corpo-tamanhos-escuro.png",
  await Promise.all([64, 120, 200].map((s) => svgPng(foca({ size: s }), ESCURO, 200))),
  200,
  ESCURO.neve,
);
const icone = (s: number, tema: Record<string, string>) =>
  sharp(
    Buffer.from(
      resolver(
        renderToStaticMarkup(h(IconePerola, { size: s })).replace(
          "<svg",
          '<svg xmlns="http://www.w3.org/2000/svg"',
        ),
        tema,
      ),
    ),
    { density: 600 },
  )
    .resize(s, s)
    .png()
    .toBuffer();
for (const [nome, tema] of [
  ["claro", CLARO],
  ["escuro", ESCURO],
] as const) {
  const tamanhos = [16, 20, 24, 32, 48];
  const passo = 64;
  await sharp({
    create: { width: passo * tamanhos.length, height: passo, channels: 4, background: tema.neve },
  })
    .composite(
      await Promise.all(
        tamanhos.map(async (s, i) => ({
          input: await icone(s, tema),
          left: i * passo + (passo - s) / 2,
          top: (passo - s) / 2,
        })),
      ),
    )
    .png()
    .toFile(resolve(PREVIAS, `perolas-${nome}.png`));
}
console.log("pranchas e prévias geradas em docs/design/brand/");

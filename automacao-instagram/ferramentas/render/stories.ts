/**
 * Destaques do Instagram: stories 9:16 (1080x1920) + capa 1:1 (1080x1080).
 *
 *   bun run render <id>      (renderizar.ts delega para ca quando formato = "story")
 *
 * Linguagem: tutorial desenhado na margem do caderno. A tela e SEMPRE um retrato real do app
 * (marca/telas-app, gerado por ferramentas/marca/capturar-app.ts, ou assets-src/marketing/shots),
 * e a anotacao a mao (circulo + seta + nota em Caveat) cai em cima do elemento real, pela caixa
 * medida na captura. Nada da interface e redesenhado.
 *
 * Areas seguras do story: 250 px no topo (barra de progresso e perfil) e 260 px embaixo (resposta).
 * Capa de destaque: o Instagram recorta em circulo; o desenho fica no miolo (~62% do lado).
 *
 * Saida em conteudos/<id>/: fonte/stories.html, export/s01..sNN.{png,jpg}, export/capa.{png,jpg},
 * export/ordem.json, preview/contato.png e preview/index.html. Renderizar NAO publica nada.
 */
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright-core";
import { acharChromium } from "../lib/chromium.ts";
import { lerConfig } from "../lib/config.ts";
import { P, pastaConteudo } from "../lib/paths.ts";
import type { RetratoMeta } from "../marca/capturar-app.ts";
import { css, lerSnapshot, rabisco, url } from "./base.ts";
import { rico, type Expressao } from "./templates.ts";
import type { Snapshot } from "../marca/sincronizar.ts";

export const STORY = { largura: 1080, altura: 1920 } as const;
export const CAPA = { largura: 1080, altura: 1080 } as const;
const M = 88;
const TOPO = 250; // area segura de cima
const LIMITE = 1660; // nada essencial abaixo disto (barra de resposta)

type Caixa = { x: number; y: number; w: number; h: number };
export type Anotacao = {
  /** nome do alvo medido na captura (marca/telas-app/<tela>.json) */
  alvo?: string;
  caixa?: Caixa;
  nota?: string;
};
type Recorte = { y: number; h: number };

export type Story =
  | { modelo: "abertura"; manchete: string; apoio?: string; expressao?: Expressao; dica?: string }
  | {
      modelo: "tela";
      passo?: number;
      titulo: string;
      tela: string;
      recorte?: Recorte;
      anotacoes?: Anotacao[];
      legenda?: string;
    }
  | {
      modelo: "tela-larga";
      titulo: string;
      tela: string;
      recorte?: { x: number; y: number; w: number; h: number };
      legenda?: string;
    }
  | {
      modelo: "pergunta";
      pergunta: string;
      resposta: string;
      tela?: string;
      recorte?: Recorte;
      anotacoes?: Anotacao[];
    }
  | { modelo: "fala"; expressao: Expressao; fala: string; apoio?: string; rotuloFala?: string }
  | { modelo: "fechamento"; manchete: string; apoio?: string; cta: string; nota?: string };

export type Glifo = "logo" | "pergunta" | "passos" | "seta";

export type ConteudoStory = {
  id: string;
  formato: "story";
  pilar: string;
  tema: string;
  gancho: string;
  argumento: string;
  publico?: string;
  objetivo?: string;
  conceitoVisual?: string;
  cta?: string;
  destaque: { titulo: string; capa: Glifo };
  /** Ordem de publicacao = ordem deste array. Chama "paginas" para o validador e o historico lerem igual ao feed. */
  paginas: Story[];
  legenda?: string;
  fontesFato?: { afirmacao: string; fonte: string }[];
  revisita?: { de: string; diferenca: string };
};

/** Textos que NUNCA podem aparecer num recorte de marketing (ex.: "~6 min" e estimativa, nao medicao). */
const ALVOS_PROIBIDOS = ["minutos"];

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ------------------------------------------------------------------ telas reais */

type Tela = { arquivo: string; largura: number; altura: number; alvos: Record<string, Caixa> };

async function tela(nome: string): Promise<Tela> {
  const app = join(P.marca, "telas-app", `${nome}.png`);
  if (existsSync(app)) {
    const meta = JSON.parse(readFileSync(app.replace(/\.png$/, ".json"), "utf8")) as RetratoMeta;
    return { arquivo: app, largura: meta.largura, altura: meta.altura, alvos: meta.alvos };
  }
  const shot = join(P.telas, `${nome}.png`);
  if (!existsSync(shot))
    throw new Error(`tela real nao encontrada: ${nome} (rode 'bun ferramentas/marca/capturar-app.ts')`);
  const m = await sharp(shot).metadata();
  // os retratos de assets-src/marketing/shots sao 390 px CSS com DSF 3
  return { arquivo: shot, largura: 390, altura: Math.round(((m.height ?? 0) / (m.width ?? 1)) * 390), alvos: {} };
}

function caixaDe(t: Tela, a: Anotacao, nomeTela: string): Caixa {
  if (a.caixa) return a.caixa;
  const c = a.alvo ? t.alvos[a.alvo] : undefined;
  if (!c) throw new Error(`alvo "${a.alvo}" nao existe em ${nomeTela} (alvos: ${Object.keys(t.alvos).join(", ")})`);
  return c;
}

/** Garante que o recorte nao mostra nada proibido (ex.: estimativa de minutos). */
function conferirRecorte(t: Tela, r: Recorte, nome: string) {
  for (const k of ALVOS_PROIBIDOS) {
    const c = t.alvos[k];
    if (c && c.y < r.y + r.h && c.y + c.h > r.y)
      throw new Error(`o recorte ${r.y}..${r.y + r.h} de ${nome} mostra "${k}" (${c.y}..${c.y + c.h}); ajuste o recorte`);
  }
}

/**
 * Celular com a tela real recortada + anotacoes a mao. Devolve o bloco HTML (posicao relativa):
 * o celular a esquerda e a coluna de notas a direita; sem anotacao, o celular fica centralizado.
 */
async function celular(
  nome: string,
  recorte: Recorte | undefined,
  anotacoes: Anotacao[] = [],
  larguraInterna = 600,
): Promise<string> {
  const t = await tela(nome);
  const r = recorte ?? { y: 0, h: t.altura };
  conferirRecorte(t, r, nome);
  const s = larguraInterna / t.largura;
  const borda = 10;
  const alturaVis = Math.round(r.h * s);
  const larguraCel = larguraInterna + borda * 2;
  const alturaCel = alturaVis + borda * 2;
  const temNota = anotacoes.some((a) => a.nota);
  const xCel = temNota ? 0 : Math.round((STORY.largura - M * 2 - larguraCel) / 2);
  const colNotaX = larguraCel + 44;
  const colNotaW = STORY.largura - M * 2 - colNotaX + 12;

  const desenhos: string[] = [];
  const notas: string[] = [];
  let ultimoY = -999;
  const itens = anotacoes
    .map((a) => ({ a, c: caixaDe(t, a, nome) }))
    .sort((p, q) => p.c.y - q.c.y);
  for (const { a, c } of itens) {
    if (c.y < r.y || c.y + c.h > r.y + r.h)
      throw new Error(`alvo "${a.alvo}" de ${nome} fica fora do recorte ${r.y}..${r.y + r.h}`);
    const pad = 14;
    const x = xCel + borda + c.x * s - pad;
    const y = borda + (c.y - r.y) * s - pad;
    const w = c.w * s + pad * 2;
    const h = c.h * s + pad * 2;
    const cx = x + w / 2;
    const cy = y + h / 2;
    // "circulado a caneta": dois contornos levemente girados, como feito a mao
    desenhos.push(`<g fill="none" stroke="var(--mar)" stroke-linecap="round">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(34, h / 2)}" stroke-width="7" transform="rotate(-1.4 ${cx} ${cy})"/>
      <rect x="${x + 3}" y="${y - 2}" width="${w - 4}" height="${h + 3}" rx="${Math.min(34, h / 2)}" stroke-width="3.5" opacity=".45" transform="rotate(0.9 ${cx} ${cy})"/>
    </g>`);
    if (a.nota) {
      let ny = Math.max(cy, ultimoY + 170);
      ny = Math.min(Math.max(ny, 60), alturaCel - 40);
      ultimoY = ny;
      notas.push(
        `<div class="nota-mao" style="left:${colNotaX}px;top:${ny}px;width:${colNotaW}px">${rico(a.nota)}</div>`,
      );
      // seta da nota ate a borda direita do contorno
      const x0 = colNotaX - 14;
      const y0 = ny;
      const x1 = Math.min(x + w + 10, colNotaX - 30);
      const y1 = cy;
      const mx = (x0 + x1) / 2;
      const ang = Math.atan2(y1 - (y0 + y1) / 2, x1 - mx);
      const cab = 22;
      const a1 = ang + Math.PI - 0.5;
      const a2 = ang + Math.PI + 0.5;
      desenhos.push(`<g fill="none" stroke="var(--mar)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M ${x0} ${y0} Q ${mx} ${y0 - (y1 === y0 ? 40 : 0)}, ${x1} ${y1}"/>
        <path d="M ${x1 + cab * Math.cos(a1)} ${y1 + cab * Math.sin(a1)} L ${x1} ${y1} L ${x1 + cab * Math.cos(a2)} ${y1 + cab * Math.sin(a2)}"/>
      </g>`);
    }
  }

  return `<div class="bloco-cel" style="height:${alturaCel}px">
  <div class="aparelho" style="position:absolute;left:${xCel}px;top:0;width:${larguraCel}px;height:${alturaCel}px">
    <img src="${url(t.arquivo)}" style="width:${larguraInterna}px;margin-top:-${Math.round(r.y * s)}px" alt="">
  </div>
  <svg class="anot" width="${STORY.largura - M * 2}" height="${alturaCel}" viewBox="0 0 ${STORY.largura - M * 2} ${alturaCel}">${desenhos.join("")}</svg>
  ${notas.join("")}
  <div class="selo-real" style="position:absolute;left:${xCel}px;top:${alturaCel + 18}px;font-size:22px">tela real do app</div>
</div>`;
}

/** Notebook/monitor para a tela de desktop. */
async function computador(nome: string, rec?: { x: number; y: number; w: number; h: number }) {
  const t = await tela(nome);
  const r = rec ?? { x: 0, y: 0, w: t.largura, h: t.altura };
  const larguraTela = STORY.largura - M * 2 - 28;
  const s = larguraTela / r.w;
  const alturaTela = Math.round(r.h * s);
  return `<div style="position:relative;margin-top:8px">
  <div style="background:var(--abismo);border-radius:26px;padding:14px;box-shadow:0 8px 0 color-mix(in srgb, var(--abismo) 45%, transparent)">
    <div style="width:${larguraTela}px;height:${alturaTela}px;overflow:hidden;border-radius:12px;background:var(--cards)">
      <img src="${url(t.arquivo)}" style="width:${Math.round(t.largura * s)}px;margin-left:-${Math.round(r.x * s)}px;margin-top:-${Math.round(r.y * s)}px" alt="">
    </div>
  </div>
  <div style="margin:0 auto;width:${larguraTela * 0.34}px;height:22px;background:color-mix(in srgb, var(--abismo) 80%, transparent);border-radius:0 0 18px 18px"></div>
  <div class="selo-real" style="margin-top:14px;font-size:22px">tela real do app</div>
</div>`;
}

/* ------------------------------------------------------------------ foca */

function focaSrc(s: Snapshot, expressao?: Expressao) {
  if (expressao) {
    const alta = join(P.logosOrigem, "expressoes", `${expressao}.png`);
    if (existsSync(alta)) return url(alta);
    const b = s.expressoes[expressao]?.arquivo;
    if (b) return url(b);
  }
  const oficial = join(P.logosOrigem, "Logo Oficial.png");
  return url(existsSync(oficial) ? oficial : s.logos.oficialColorida.arquivo!);
}

/* ------------------------------------------------------------------ stories */

async function story(p: Story, s: Snapshot, c: ConteudoStory, i: number): Promise<string> {
  const cab = `<div class="cabeca">
    <div class="rotulo">${esc(c.destaque.titulo)}</div>
    ${"passo" in p && p.passo ? `<div class="pilula pilula-azul" style="font-size:26px;padding:10px 24px">Passo ${p.passo}</div>` : ""}
  </div>`;

  switch (p.modelo) {
    case "abertura":
      return `${cab}
  <div class="col">
    <div class="empurra" style="flex:.6"></div>
    <h1 class="manchete m-xl" data-medir>${rico(p.manchete)}</h1>
    ${p.apoio ? `<p class="corpo" style="margin-top:40px;font-size:44px;max-width:860px" data-medir>${rico(p.apoio)}</p>` : ""}
    <div class="empurra"></div>
    <div class="linha" style="justify-content:space-between;align-items:flex-end">
      <div class="mao" style="font-size:54px;transform:rotate(-3deg);margin-bottom:30px">${esc(p.dica ?? "toca pra passar →")}</div>
      <img src="${focaSrc(s, p.expressao)}" style="width:400px;height:400px;object-fit:contain;margin-right:-24px" alt="" data-medir>
    </div>
  </div>`;

    case "tela":
      return `${cab}
  <div class="col">
    <h2 class="manchete m-m titulo-story" data-medir>${rico(p.titulo)}</h2>
    <div style="margin:auto 0">
      <div style="margin-top:48px">${await celular(p.tela, p.recorte, p.anotacoes)}</div>
      ${p.legenda ? `<p class="corpo legenda-story" data-medir>${rico(p.legenda)}</p>` : ""}
    </div>
  </div>`;

    case "tela-larga":
      return `${cab}
  <div class="col">
    <h2 class="manchete m-m titulo-story" data-medir>${rico(p.titulo)}</h2>
    <div class="empurra" style="flex:.5"></div>
    ${await computador(p.tela, p.recorte)}
    ${p.legenda ? `<p class="corpo legenda-story" data-medir>${rico(p.legenda)}</p>` : ""}
    <div class="empurra"></div>
  </div>`;

    case "pergunta":
      return `${cab}
  <div class="col">
    ${p.tela ? "" : `<div class="empurra" style="flex:.55"></div>`}
    <div class="caixa-pergunta" data-medir>
      <div class="mao" style="font-size:46px;margin-bottom:8px">pergunta</div>
      <h2 class="manchete" style="font-size:78px;line-height:1.02">${rico(p.pergunta)}</h2>
    </div>
    <p class="corpo" style="margin-top:52px;font-size:46px;line-height:1.34;color:var(--abismo)" data-medir>${rico(p.resposta)}</p>
    ${p.tela ? `<div style="margin:auto 0">${await celular(p.tela, p.recorte, p.anotacoes, 540)}</div>` : `<div style="display:flex;justify-content:flex-end;margin-top:90px"><img src="${focaSrc(s, "neutra")}" style="width:340px;height:340px;object-fit:contain" alt=""></div><div class="empurra"></div>`}
  </div>`;

    case "fala":
      return `${cab}
  <div class="col">
    <div class="empurra" style="flex:.7"></div>
    <div class="cartao balao" data-medir>
      ${p.rotuloFala ? `<div class="rotulo" style="font-size:22px;margin-bottom:14px">${esc(p.rotuloFala)}</div>` : ""}
      <p class="manchete" style="font-size:72px;line-height:1.08">${rico(p.fala)}</p>
      <svg width="80" height="52" viewBox="0 0 80 52" style="position:absolute;left:96px;bottom:-50px"><path d="M2 0 H78 L30 50 Z" fill="var(--cards)" stroke="var(--gelo)" stroke-width="3"/><path d="M5 0 H75" stroke="var(--cards)" stroke-width="6"/></svg>
    </div>
    <img src="${focaSrc(s, p.expressao)}" style="width:420px;height:420px;object-fit:contain;margin:70px 0 0 -10px" alt="">
    ${p.apoio ? `<p class="corpo" style="font-size:42px;margin-top:10px;max-width:860px" data-medir>${rico(p.apoio)}</p>` : ""}
    <div class="empurra"></div>
  </div>`;

    case "fechamento":
      return `${cab}
  <div class="col">
    <div class="empurra"></div>
    <div class="icone-azul" style="width:196px;height:196px;border-radius:44px"><img src="${focaSrc(s)}" style="width:156px;height:156px;object-fit:contain" alt=""></div>
    <h2 class="manchete m-l" style="margin-top:64px;max-width:880px" data-medir>${rico(p.manchete)}</h2>
    ${p.apoio ? `<p class="corpo" style="margin-top:32px;font-size:44px;max-width:860px" data-medir>${rico(p.apoio)}</p>` : ""}
    <div style="margin-top:64px"><span class="botao" style="height:118px;font-size:46px;padding:0 60px" data-medir>${esc(p.cta)}</span></div>
    ${p.nota ? `<div class="mao" style="font-size:54px;margin-top:40px;transform:rotate(-2deg)" data-medir>${rico(p.nota)}</div>` : ""}
    <div class="empurra"></div>
  </div>`;
  }
}

/** Capa 1:1 do destaque: azul oficial (--mar) e um desenho branco a caneta no miolo. */
function capa(g: Glifo, s: Snapshot) {
  const traco = `fill="none" stroke="var(--on-mar)" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"`;
  const desenhos: Record<Glifo, string> = {
    // O icone da marca e a logo oficial sobre o --mar (regra permanente); nenhuma expressao aqui.
    logo: `<img src="${focaSrc(s)}" style="width:760px;height:760px;object-fit:contain" alt="">`,
    pergunta: `<svg width="560" height="560" viewBox="0 0 560 560"><path ${traco} d="M176 196 C176 120, 236 88, 290 90 C352 92, 400 136, 396 196 C392 258, 330 270, 298 312 C282 334, 280 352, 280 382"/><circle cx="280" cy="462" r="26" fill="var(--on-mar)"/></svg>`,
    // tres nos da trilha em S, como o caminho do app: pontilhado POR TRAS, nos preenchidos
    // com --mar por cima (o pontilhado so aparece entre eles); o ultimo, concluido
    passos: (() => {
      const [n1, n2, n3]: [number, number][] = [[190, 100], [400, 290], [190, 480]];
      const r = 60;
      const linha = `<path d="M ${n1[0]} ${n1[1]} L ${n2[0]} ${n2[1]} L ${n3[0]} ${n3[1]}" stroke="var(--on-mar)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 38" fill="none"/>`;
      const no = (n: [number, number]) =>
        `<circle cx="${n[0]}" cy="${n[1]}" r="${r + 34}" fill="var(--mar)"/><circle cx="${n[0]}" cy="${n[1]}" r="${r}" ${traco}/>`;
      return `<svg width="620" height="600" viewBox="0 0 620 600">${linha}${no(n1)}${no(n2)}
      <circle cx="${n3[0]}" cy="${n3[1]}" r="${r + 34}" fill="var(--mar)"/><circle cx="${n3[0]}" cy="${n3[1]}" r="${r + 14}" fill="var(--on-mar)"/>
      <path d="M ${n3[0] - 32} ${n3[1] + 2} L ${n3[0] - 8} ${n3[1] + 26} L ${n3[0] + 34} ${n3[1] - 24}" fill="none" stroke="var(--mar)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    })(),
    seta: `<svg width="580" height="560" viewBox="0 0 580 560"><path ${traco} d="M90 430 C150 250, 300 170, 470 170"/><path ${traco} d="M390 90 L482 170 L396 256"/><circle cx="92" cy="432" r="30" fill="var(--on-mar)"/></svg>`,
  };
  return `<section class="capa" id="capa"><div style="position:absolute;inset:0;display:grid;place-items:center"><div style="transform:scale(${g === "logo" ? 1 : 1.32})">${desenhos[g]}</div></div></section>`;
}

function cssStory() {
  return `
.story{position:relative;width:${STORY.largura}px;height:${STORY.altura}px;overflow:hidden;background:var(--neve);
  background-image:repeating-linear-gradient(to bottom, transparent 0 63px, color-mix(in srgb, var(--gelo) 82%, transparent) 63px 65px);}
.story .margem-esq{position:absolute;top:0;bottom:0;left:${M - 24}px;width:3px;background:color-mix(in srgb, var(--coral-claro) 55%, transparent);}
.story .cabeca{position:absolute;left:${M}px;right:${M}px;top:${TOPO - 20}px;height:64px;display:flex;align-items:center;justify-content:space-between;z-index:3}
.story .col{position:absolute;left:${M}px;right:${M}px;top:${TOPO + 90}px;bottom:${STORY.altura - LIMITE}px;display:flex;flex-direction:column;z-index:3}
.titulo-story{font-size:80px;line-height:1.02;max-width:904px}
.legenda-story{margin-top:78px;font-size:40px;line-height:1.36;max-width:904px}
.bloco-cel{position:relative;width:100%}
.anot{position:absolute;left:0;top:0;overflow:visible;z-index:5;pointer-events:none}
.nota-mao{position:absolute;transform:translateY(-50%) rotate(-3deg);font-family:"Caveat",cursive;font-weight:600;font-size:56px;line-height:1.02;color:var(--mar);z-index:6}
.caixa-pergunta{background:var(--cards);border:3px solid var(--gelo);border-radius:var(--r-folha);box-shadow:0 6px 0 var(--gelo);padding:40px 48px 50px}
.balao{position:relative;border-radius:var(--r-folha);padding:48px 52px}
.story .traco-base{position:absolute;left:0;right:0;top:${LIMITE + 110}px;z-index:1;opacity:.9}
.capa{position:relative;width:${CAPA.largura}px;height:${CAPA.altura}px;background:var(--mar);overflow:hidden}
`;
}

function tracoBase(semente: number) {
  // mais largo que a pagina e deslocado para a esquerda: o traco sempre sai pelas duas bordas
  let d = "M -20 40";
  for (let k = 0; k < 7; k++) {
    const x = 180 * (k + 1);
    d += ` C ${x - 120} ${k % 2 ? 10 : 70}, ${x - 60} ${k % 2 ? 70 : 10}, ${x} 40`;
  }
  return `<svg class="traco-base" width="1260" height="90" viewBox="0 0 1260 90" style="transform:translateX(-${60 + ((semente * 37) % 90)}px)"><path d="${d}" stroke="var(--mar)" stroke-width="26" stroke-linecap="round" fill="none" opacity=".16"/><path d="${d}" stroke="var(--mar)" stroke-width="7" stroke-linecap="round" fill="none" opacity=".5" transform="translate(0,26)"/></svg>`;
}

export async function comporStories(c: ConteudoStory) {
  const s = lerSnapshot();
  const secoes: string[] = [];
  for (let i = 0; i < c.paginas.length; i++)
    secoes.push(`<section class="story" id="s${i + 1}"><div class="margem-esq"></div>${tracoBase(i + 3)}${await story(c.paginas[i], s, c, i)}</section>`);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${c.id}</title>
<!-- GERADO por ferramentas/render/stories.ts a partir de conteudo.json. -->
<style>${css(s)}${cssStory()} body{display:flex;flex-direction:column;gap:40px;align-items:flex-start;background:#ddd}</style></head>
<body>
${secoes.join("\n")}
${capa(c.destaque.capa, s)}
</body></html>`;
}

export async function renderizarStories(id: string) {
  const cfg = lerConfig();
  const pasta = pastaConteudo(id);
  const c = JSON.parse(readFileSync(pasta.conteudo, "utf8")) as ConteudoStory;
  for (const d of [pasta.fonte, pasta.export, pasta.preview]) mkdirSync(d, { recursive: true });
  const hashConteudo = createHash("sha256").update(readFileSync(pasta.conteudo)).digest("hex").slice(0, 16);

  const html = await comporStories(c);
  const arquivoHtml = join(pasta.fonte, "stories.html");
  writeFileSync(arquivoHtml, html);

  const nav = await chromium.launch({ executablePath: acharChromium() });
  const pg = await nav.newPage({ viewport: { width: STORY.largura, height: STORY.altura }, deviceScaleFactor: 1 });
  await pg.goto(pathToFileURL(arquivoHtml).href, { waitUntil: "load" });
  await pg.evaluate(() => (document as unknown as { fonts: FontFaceSet }).fonts.ready);

  // Medicao: nada essencial passa do limite de baixo nem vaza para os lados.
  const problemas = await pg.evaluate(
    ({ limite, largura, margem }) => {
      const saida: string[] = [];
      document.querySelectorAll<HTMLElement>("section.story").forEach((sec) => {
        const base = sec.getBoundingClientRect();
        sec.querySelectorAll<HTMLElement>("[data-medir], .nota-mao, .bloco-cel").forEach((el) => {
          const r = el.getBoundingClientRect();
          const fundo = r.bottom - base.top;
          if (fundo > limite + 1) saida.push(`${sec.id}: "${(el.innerText || el.className).slice(0, 40)}" termina em ${Math.round(fundo)} px (limite ${limite})`);
          if (r.right - base.left > largura - margem / 2 + 1) saida.push(`${sec.id}: "${(el.innerText || el.className).slice(0, 40)}" passa da margem direita (${Math.round(r.right - base.left)} px)`);
        });
      });
      return saida;
    },
    { limite: LIMITE, largura: STORY.largura, margem: M },
  );

  const paginas: { pagina: number; png: string; jpg: string; largura: number; altura: number; bytesJpg: number }[] = [];
  for (let i = 0; i < c.paginas.length; i++) {
    const nome = `s${String(i + 1).padStart(2, "0")}`;
    const png = join(pasta.export, `${nome}.png`);
    await pg.locator(`#s${i + 1}`).screenshot({ path: png, scale: "css" });
    const jpg = join(pasta.export, `${nome}.jpg`);
    await sharp(png).jpeg({ quality: cfg.formatos.jpegQualidade, chromaSubsampling: "4:4:4", mozjpeg: true }).toFile(jpg);
    paginas.push({ pagina: i + 1, png, jpg, largura: STORY.largura, altura: STORY.altura, bytesJpg: statSync(jpg).size });
  }
  const capaPng = join(pasta.export, "capa.png");
  await pg.locator("#capa").screenshot({ path: capaPng, scale: "css" });
  const capaJpg = join(pasta.export, "capa.jpg");
  await sharp(capaPng).jpeg({ quality: cfg.formatos.jpegQualidade, chromaSubsampling: "4:4:4", mozjpeg: true }).toFile(capaJpg);
  await nav.close();

  const s = lerSnapshot();
  writeFileSync(
    join(pasta.export, "ordem.json"),
    JSON.stringify(
      {
        id,
        formato: c.formato,
        destaque: c.destaque.titulo,
        geradoEm: new Date().toISOString(),
        hashConteudo,
        paginas,
        capa: { png: capaPng, jpg: capaJpg, largura: CAPA.largura, altura: CAPA.altura },
        referenciasMarca: {
          snapshotEm: s.geradoEm,
          stylesCss: s.fontesDocumentais.find((f) => f.arquivo.endsWith("styles.css"))?.hash ?? null,
          logoOficial: s.logos.oficialColorida.hash,
        },
        medicao: problemas,
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(pasta.legenda, (c.legenda ?? "").trimEnd() + "\n");
  cpSync(pasta.conteudo, join(pasta.export, "conteudo.renderizado.json"));
  await contato([capaPng, ...paginas.map((p) => p.png)], join(pasta.preview, "contato.png"));
  previewStories(id, c, paginas.map((p) => p.png), capaPng);
  return { paginas, capa: capaPng, html: arquivoHtml, problemas };
}

async function contato(pngs: string[], saida: string) {
  const alt = 640;
  const vao = 14;
  const larguras = await Promise.all(
    pngs.map(async (p) => {
      const m = await sharp(p).metadata();
      return Math.round(((m.width ?? 1) / (m.height ?? 1)) * alt);
    }),
  );
  const total = larguras.reduce((a, b) => a + b + vao, vao);
  let x = vao;
  const camadas = [];
  for (let i = 0; i < pngs.length; i++) {
    const h = i === 0 ? larguras[0] : alt; // capa quadrada
    camadas.push({ input: await sharp(pngs[i]).resize(larguras[i], h).png().toBuffer(), left: x, top: vao + (i === 0 ? Math.round((alt - h) / 2) : 0) });
    x += larguras[i] + vao;
  }
  await sharp({ create: { width: total, height: alt + vao * 2, channels: 3, background: "#e1dfda" } })
    .composite(camadas)
    .png()
    .toFile(saida);
}

function previewStories(id: string, c: ConteudoStory, pngs: string[], capaPng: string) {
  const u = (f: string) => pathToFileURL(f).href;
  const pasta = pastaConteudo(id);
  const html = `<!doctype html><meta charset="utf-8"><title>${id}</title>
<style>body{margin:0;background:#1c1b18;color:#f3f1ec;font:15px/1.5 system-ui,sans-serif;padding:32px}
h1{font-size:24px;margin:0 0 4px} .meta{color:#a6a29a}
.fila{display:flex;gap:16px;overflow-x:auto;padding:18px 0}
figure{margin:0;flex:0 0 auto} img.s{width:300px;border-radius:14px;display:block} figcaption{color:#a6a29a;font-size:13px;margin-top:6px}
.capa{width:140px;height:140px;border-radius:50%;display:block;border:3px solid #444}</style>
<h1>${esc(c.destaque.titulo)} — ${esc(c.gancho)}</h1>
<div class="meta">${id} · destaque com ${pngs.length} stories 1080x1920 + capa 1080x1080</div>
<div class="fila"><figure><img class="capa" src="${u(capaPng)}" alt="capa"><figcaption>capa (recorte circular do Instagram)</figcaption></figure>
${pngs.map((p, i) => `<figure><img class="s" src="${u(p)}" alt="story ${i + 1}"><figcaption>${i + 1}/${pngs.length}</figcaption></figure>`).join("")}</div>`;
  writeFileSync(join(pasta.preview, "index.html"), html);
}

// rabisco fica exportado para quem quiser reaproveitar o vocabulario nos stories futuros
export { rabisco };

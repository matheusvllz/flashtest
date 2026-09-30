/**
 * Compositor: conteudo.json -> um HTML panoramico de (1080 * paginas) x 1350.
 *
 * O HTML e a FONTE EDITAVEL do post: fica em conteudos/<id>/fonte/pagina.html e pode ser
 * aberto no navegador, ajustado e renderizado de novo. O recorte em paginas de 1080x1350
 * acontece depois, sobre a imagem panoramica (renderizar.ts), o que garante continuidade
 * sem sobreposicao nem deslocamento.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { P } from "../lib/paths.ts";
import { MARGEM, PAGINA, css, lerSnapshot, tracoContinuo, url } from "./base.ts";
import { pagina, type Pagina } from "./templates.ts";

export type Conteudo = {
  id: string;
  formato: "carrossel" | "post-estatico";
  pilar: string;
  tema: string;
  gancho: string;
  argumento: string;
  publico?: string;
  objetivo?: string;
  conceitoVisual?: string;
  cta?: string;
  /** Continuidade entre paginas. "traco-caneta" desenha um caminho unico sobre a tira inteira. */
  continuidade?: {
    tipo: "traco-caneta" | "pauta" | "nenhuma";
    semente?: number;
    opacidade?: number;
    faixa?: [number, number];
  };
  /** Ordem de publicacao = ordem deste array. */
  paginas: Pagina[];
  legenda: string;
  /** Fatos externos usados, com fonte. Vazio = o conteudo so afirma o que o produto demonstra. */
  fontesFato?: { afirmacao: string; fonte: string }[];
  /** Relacao com conteudo anterior sobre o mesmo tema. */
  revisita?: { de: string; diferenca: string };
};

const LARGURA_UTIL = PAGINA.largura - MARGEM * 2;

/** Resolve o nome curto de uma tela real (assets-src/marketing/shots) e calcula o recorte em px. */
async function resolverTelas(html: string, paginas: Pagina[]) {
  let saida = html;
  for (const p of paginas) {
    if (p.modelo !== "tela") continue;
    const arquivo = join(P.telas, `${p.tela}.png`);
    if (!existsSync(arquivo))
      throw new Error(
        `tela real nao encontrada: ${arquivo} (rode 'bun run marca:sync' e confira marca/snapshot.json -> telasReais)`,
      );
    const meta = await sharp(arquivo).metadata();
    const larguraInterna = LARGURA_UTIL - 20; // 10px de borda de cada lado
    const alturaExibida = larguraInterna * ((meta.height ?? 1) / (meta.width ?? 1));
    const r = p.recorte ?? { topo: 0, altura: 1 };
    const caixa = Math.round(alturaExibida * r.altura);
    const desloc = Math.round(alturaExibida * r.topo);
    saida = saida
      .replace(`__TELA:${p.tela}__`, url(arquivo))
      .replace(
        `data-tela="${p.tela}" data-topo="${r.topo}" data-altura="${r.altura}"`,
        `style="height:${caixa + 20}px" data-tela="${p.tela}"`,
      )
      .replace(
        /(<div class="aparelho" style="height:\d+px" data-tela="[^"]+">\s*<img src="[^"]+")/,
        `$1 style="margin-top:-${desloc}px"`,
      );
  }
  return saida;
}

export async function compor(c: Conteudo) {
  const s = lerSnapshot();
  const n = c.paginas.length;
  const cont = c.continuidade ?? { tipo: "traco-caneta", semente: 7 };
  const largura = PAGINA.largura * n;

  const fundoTira =
    cont.tipo === "traco-caneta"
      ? tracoContinuo(n, cont.semente ?? 7, cont.opacidade ?? 1, cont.faixa ?? [0.93, 0.965])
      : "";

  const corpo = c.paginas
    .map(
      (p, i) => `<section class="pagina" data-pagina="${i + 1}">
  <div class="margem-esq"></div>
  ${pagina(p, s, i, n)}
</section>`,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>${c.id}</title>
<!-- GERADO por ferramentas/render/compor.ts a partir de conteudo.json. Editavel: ajuste e rode 'bun run render <id>' de novo. -->
<style>${css(s)}
.tira{width:${largura}px}
.tira > .fundo-tira{position:absolute;inset:0;z-index:1}
</style></head>
<body>
<div class="tira" id="tira">
  ${fundoTira ? `<div class="fundo-tira">${fundoTira}</div>` : ""}
  ${corpo}
</div>
</body></html>`;

  return { html: await resolverTelas(html, c.paginas), largura, altura: PAGINA.altura, paginas: n };
}

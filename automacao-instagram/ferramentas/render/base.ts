/**
 * Base visual dos conteudos de feed. Os valores de cor e raio vem de marca/snapshot.json,
 * que e gerado a partir de src/styles.css — nao ha hex escrito a mao aqui.
 *
 * Regras do design system que este arquivo implementa (docs/DESIGN.md):
 * - papel, nao painel: fundo --neve; grafite nunca e fundo de area grande
 * - um azul: --mar so em acao, selecao, progresso e no traco da propria marca (o rabisco)
 * - recompensa (--alert) so como marca-texto: fundo com texto grafite, nunca texto amarelo
 * - elevacao por aresta (box-shadow solido deslocado), nunca sombra difusa
 * - raio unico por papel: marcador 6, botao 16, card 20, folha 28, pilula 999
 * - verde/vermelho nao aparecem fora de feedback de resposta
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { P } from "../lib/paths.ts";
import type { Snapshot } from "../marca/sincronizar.ts";

export const PAGINA = { largura: 1080, altura: 1350 } as const;
/** Respiro lateral. Nada essencial encosta na emenda entre paginas. */
export const MARGEM = 88;

export function lerSnapshot(): Snapshot {
  return JSON.parse(readFileSync(P.snapshot, "utf8")) as Snapshot;
}

export function url(arquivo: string) {
  return pathToFileURL(arquivo).href;
}

function fonte(nome: string, arquivo: string, peso: string) {
  return `@font-face{font-family:"${nome}";font-style:normal;font-weight:${peso};font-display:block;src:url("${url(join(P.fontes, arquivo))}") format("woff2");}`;
}

export function css(s: Snapshot) {
  const c = s.cores;
  return `
${fonte("Space Grotesk", "space-grotesk-latin-wght.woff2", "300 700")}
${fonte("Plus Jakarta Sans", "plus-jakarta-sans-latin-wght.woff2", "200 800")}
${fonte("Space Mono", "space-mono-latin-700.woff2", "700")}
${fonte("Caveat", "caveat-latin-600.woff2", "600")}

:root{
  --abismo:${c.abismo}; --mar:${c.mar}; --mar-fundo:${c["mar-fundo"]};
  --gelo:${c.gelo}; --neve:${c.neve}; --cards:${c.cards}; --pelo:${c.pelo};
  --nevoa:${c.nevoa}; --recompensa:${c.alert}; --on-mar:${c["on-mar"]};
  --texto:${c.foreground}; --coral-claro:${c["coral-claro"]};
  --r-marcador:6px; --r-botao:16px; --r-card:20px; --r-folha:28px;
}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:var(--neve);}
body{font-family:"Plus Jakarta Sans",sans-serif;color:var(--texto);-webkit-font-smoothing:antialiased;}

/* Superficie panoramica: as paginas em linha, recortadas depois em 1080x1350 exatos. */
.tira{position:relative;display:flex;height:${PAGINA.altura}px;overflow:hidden;background:var(--neve);
  /* pauta continua: atravessa a tira inteira, entao nunca desalinha na emenda */
  background-image:repeating-linear-gradient(to bottom, transparent 0 63px, color-mix(in srgb, var(--gelo) 82%, transparent) 63px 65px);}
.pagina{position:relative;z-index:2;background:transparent;width:${PAGINA.largura}px;height:${PAGINA.altura}px;flex:0 0 ${PAGINA.largura}px;overflow:hidden;}
.conteudo{position:relative;z-index:3;height:100%;padding:${MARGEM}px;display:flex;flex-direction:column;}

/* Fundo continuo: pauta de caderno + traco de caneta que atravessa a tira inteira. */
.fundo{position:absolute;inset:0;z-index:0;pointer-events:none;}
.margem-esq{position:absolute;top:0;bottom:0;left:${MARGEM - 24}px;width:3px;background:color-mix(in srgb, var(--coral-claro) 55%, transparent);}

/* Tipografia — escala propria de 1080 px (o app nao passa de 32 px) */
.rotulo{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:26px;letter-spacing:.14em;text-transform:uppercase;color:var(--nevoa);}
.manchete{font-family:"Space Grotesk",sans-serif;font-weight:700;letter-spacing:-.025em;line-height:.98;color:var(--abismo);}
.m-xxl{font-size:132px;} .m-xl{font-size:108px;} .m-l{font-size:88px;} .m-m{font-size:70px;} .m-s{font-size:56px;}
.corpo{font-size:38px;line-height:1.38;color:var(--texto);}
.corpo-s{font-size:34px;line-height:1.4;color:var(--nevoa);}
.dado{font-family:"Space Mono",monospace;font-weight:700;font-variant-numeric:tabular-nums;color:var(--mar);}
.mao{font-family:"Caveat",cursive;font-weight:600;color:var(--mar);}

.azul{color:var(--mar);}
.grafite{color:var(--abismo);}
/* recompensa = marca-texto: fundo amarelo com texto grafite, nunca texto amarelo */
.marcatexto{background:var(--recompensa);color:var(--abismo);padding:0 .12em;border-radius:var(--r-marcador);box-decoration-break:clone;-webkit-box-decoration-break:clone;}
.sublinha{background:linear-gradient(to top, color-mix(in srgb, var(--mar) 28%, transparent) 0 .34em, transparent .34em);}

.cartao{background:var(--cards);border:3px solid var(--gelo);border-radius:var(--r-card);box-shadow:0 5px 0 var(--gelo);padding:36px 40px;}
.cartao-azul{background:var(--mar);color:var(--on-mar);border:none;border-radius:var(--r-card);box-shadow:0 6px 0 var(--mar-fundo);padding:36px 40px;}
.pilula{display:inline-flex;align-items:center;gap:14px;border-radius:999px;border:3px solid var(--abismo);padding:14px 28px;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:28px;color:var(--abismo);background:var(--cards);}
.pilula-azul{border-color:transparent;background:var(--mar);color:var(--on-mar);box-shadow:0 5px 0 var(--mar-fundo);}
.botao{display:inline-flex;align-items:center;justify-content:center;height:96px;padding:0 44px;border-radius:var(--r-botao);background:var(--mar);color:var(--on-mar);box-shadow:0 7px 0 var(--mar-fundo);font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:38px;}

.foca{display:block;width:100%;height:100%;object-fit:contain;}
.icone-azul{background:var(--mar);border-radius:var(--r-card);display:grid;place-items:center;}

.empurra{flex:1 1 auto;}
.linha{display:flex;align-items:center;gap:20px;}
.num{font-family:"Space Mono",monospace;font-weight:700;color:var(--mar);}

/* Moldura de celular para tela real do app — grafite, aresta solida, sem sombra difusa */
.aparelho{border:10px solid var(--abismo);border-radius:44px;overflow:hidden;background:var(--cards);box-shadow:0 8px 0 color-mix(in srgb, var(--abismo) 45%, transparent);}
.aparelho img{display:block;width:100%;}
.selo-real{display:inline-flex;align-items:center;gap:10px;white-space:nowrap;flex:0 0 auto;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:24px;letter-spacing:.08em;text-transform:uppercase;color:var(--nevoa);}
`;
}

/**
 * Traco de caneta continuo sobre a tira inteira (1080*N x 1350). E o grafismo da marca:
 * o rabisco na margem. Determinista: a mesma semente da o mesmo caminho.
 */
export function tracoContinuo(
  paginas: number,
  semente: number,
  opacidade = 1,
  faixa: [number, number] = [0.93, 0.965],
) {
  const L = PAGINA.largura * paginas;
  const H = PAGINA.altura;
  let seed = semente * 9301 + 49297;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const pontos: [number, number][] = [];
  const passos = paginas * 3;
  const [de, ate] = faixa;
  for (let i = 0; i <= passos; i++) {
    const x = (L / passos) * i;
    // A onda fica DENTRO da faixa declarada: o traco atravessa o carrossel inteiro
    // sem nunca cruzar a area de texto das paginas.
    const t = (Math.sin(i * 0.9 + semente) + 1) / 2;
    const y = H * (de + (ate - de) * (0.15 + 0.7 * t + 0.15 * rnd()));
    pontos.push([x, y]);
  }
  let d = `M ${pontos[0][0]} ${pontos[0][1]}`;
  for (let i = 1; i < pontos.length; i++) {
    const [x0, y0] = pontos[i - 1];
    const [x1, y1] = pontos[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return `<svg class="fundo" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" fill="none" style="opacity:${opacidade}">
  <path d="${d}" stroke="var(--mar)" stroke-width="30" stroke-linecap="round" opacity=".18"/>
  <path d="${d}" stroke="var(--mar)" stroke-width="8" stroke-linecap="round" opacity=".55" transform="translate(0,34)"/>
</svg>`;
}

/** Rabisco de margem: um grafismo pequeno, sempre o mesmo vocabulario de formas. */
export function rabisco(tipo: "seta" | "circulo" | "raio" | "asterisco", cor = "var(--abismo)") {
  const formas: Record<string, string> = {
    seta: `<path d="M6 38 C40 10, 96 8, 134 30" stroke="${cor}" stroke-width="7" stroke-linecap="round"/><path d="M112 14 L136 31 L110 44" stroke="${cor}" stroke-width="7" stroke-linecap="round" fill="none"/>`,
    circulo: `<ellipse cx="70" cy="30" rx="62" ry="24" stroke="${cor}" stroke-width="7" fill="none"/><ellipse cx="70" cy="30" rx="56" ry="19" stroke="${cor}" stroke-width="4" fill="none" opacity=".55"/>`,
    raio: `<path d="M70 4 L44 32 H68 L56 58 L96 26 H72 Z" stroke="${cor}" stroke-width="6" fill="none" stroke-linejoin="round"/>`,
    asterisco: `<g stroke="${cor}" stroke-width="7" stroke-linecap="round"><path d="M70 6 V54"/><path d="M48 16 L92 46"/><path d="M92 16 L48 46"/></g>`,
  };
  return `<svg width="140" height="62" viewBox="0 0 140 62" fill="none">${formas[tipo]}</svg>`;
}

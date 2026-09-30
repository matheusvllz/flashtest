/**
 * Modelos de composicao. Poucos modelos, bem construidos, com variacao real de escala e ritmo —
 * em vez de um template unico de titulo + paragrafo + mascote no canto.
 *
 * Cada modelo devolve o HTML de UMA pagina de 1080x1350. O fundo continuo e desenhado
 * pela tira (compor.ts), nao por aqui: assim a continuidade atravessa as paginas de verdade.
 *
 * Regra de uma pagina: todo texto essencial cabe dentro dela. Nada de palavra partida na emenda.
 */
import { MARGEM, rabisco, url } from "./base.ts";
import type { Snapshot } from "../marca/sincronizar.ts";

export type Expressao =
  | "neutra"
  | "cobrando"
  | "orgulhosa"
  | "desapontada"
  | "empolgada"
  | "acolhedora"
  | "surpresa"
  | "entediada";

export type Pagina =
  | {
      modelo: "capa";
      rotulo?: string;
      manchete: string;
      apoio?: string;
      expressao?: Expressao;
      escala?: "xxl" | "xl" | "l";
      nota?: string;
      rabisco?: "seta" | "circulo" | "raio" | "asterisco";
      arraste?: boolean;
    }
  | {
      modelo: "contraste";
      rotulo?: string;
      titulo: string;
      ruim: { rotulo: string; texto: string };
      bom: { rotulo: string; texto: string };
    }
  | {
      modelo: "numero";
      numero: string;
      unidade?: string;
      titulo: string;
      corpo: string;
      nota?: string;
      assinatura?: boolean;
    }
  | { modelo: "lista"; rotulo?: string; titulo: string; itens: string[] }
  | { modelo: "fala"; expressao: Expressao; fala: string; apoio?: string }
  | {
      modelo: "citacao";
      texto: string;
      nota?: string;
      escala?: "xl" | "l" | "m";
      assinatura?: boolean;
    }
  | { modelo: "passos"; titulo: string; passos: { titulo: string; texto: string }[] }
  | {
      modelo: "tela";
      titulo: string;
      tela: string;
      legenda: string;
      recorte?: { topo: number; altura: number };
    }
  | { modelo: "fechamento"; manchete: string; apoio?: string; cta: string; usuario?: string };

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Marcacao inline permitida na copy, para nao exigir HTML do agente:
 *   *azul*  -> palavra no azul-caneta   ==marca==  -> marca-texto (recompensa)
 *   _mao_   -> anotacao manuscrita      /sub/      -> sublinhado de caneta
 */
export function rico(s: string) {
  return esc(s)
    .replace(/==([^=]+)==/g, '<span class="marcatexto">$1</span>')
    .replace(/\*([^*]+)\*/g, '<span class="azul">$1</span>')
    .replace(/_([^_]+)_/g, '<span class="mao">$1</span>')
    .replace(/\/([^/]+)\//g, '<span class="sublinha">$1</span>')
    .replace(/\n/g, "<br>");
}

function focaImg(s: Snapshot, expressao: Expressao | undefined, tamanho: number) {
  const alvo = expressao ? s.expressoes[expressao]?.arquivo : s.logos.oficialColorida.arquivo;
  const arquivo = alvo ?? s.logos.oficialColorida.arquivo;
  if (!arquivo) return "";
  return `<img class="foca" src="${url(arquivo)}" width="${tamanho}" height="${tamanho}" alt="">`;
}

/** Assinatura discreta: o icone oficial sobre o azul do design system (docs/44 I-4) + o nome. */
function assinatura(s: Snapshot) {
  return `<div class="linha" style="gap:18px;margin-top:8px">
    <div class="icone-azul" style="width:78px;height:78px;border-radius:18px">${focaImg(s, undefined, 58)}</div>
    <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:30px;color:var(--abismo)">Foca</div>
  </div>`;
}

export function pagina(p: Pagina, s: Snapshot, indice: number, total: number): string {
  // Contador no ALTO a direita: a faixa de baixo e do traco continuo do carrossel.
  const numero = `<div class="dado" style="position:absolute;right:${MARGEM}px;top:${MARGEM - 4}px;font-size:28px;opacity:.5;z-index:4">${indice + 1}/${total}</div>`;

  switch (p.modelo) {
    case "capa": {
      const escala = p.escala ?? "xl";
      return `<div class="conteudo">
  ${p.rotulo ? `<div class="rotulo">${esc(p.rotulo)}</div>` : ""}
  <div class="empurra"></div>
  <h1 class="manchete m-${escala}">${rico(p.manchete)}</h1>
  ${p.apoio ? `<p class="corpo" style="margin-top:34px;max-width:820px">${rico(p.apoio)}</p>` : ""}
  <div class="empurra"></div>
  <div class="linha" style="justify-content:space-between;align-items:flex-end">
    <div>${p.arraste === false ? "" : `<div class="pilula">Arraste <span class="dado" style="font-size:26px">&rsaquo;&rsaquo;</span></div>`}</div>
    <div style="width:300px;height:300px;margin:-40px -20px -28px 0">${focaImg(s, p.expressao ?? "neutra", 300)}</div>
  </div>
  ${
    p.nota
      ? `<div style="position:absolute;right:${MARGEM - 10}px;top:150px;width:360px;text-align:right;transform:rotate(-3deg)">
      <div class="mao" style="font-size:52px;line-height:1.05">${esc(p.nota)}</div>
      <div style="display:flex;justify-content:flex-end;margin-top:6px;transform:rotate(152deg)">${rabisco("seta", "var(--mar)")}</div>
    </div>`
      : ""
  }
  ${p.rabisco ? `<div style="position:absolute;left:${MARGEM - 34}px;top:560px;transform:rotate(-90deg);transform-origin:left top;opacity:.85">${rabisco(p.rabisco, "var(--mar)")}</div>` : ""}
</div>`;
    }

    case "contraste":
      return `<div class="conteudo">
  ${p.rotulo ? `<div class="rotulo">${esc(p.rotulo)}</div>` : ""}
  <h2 class="manchete m-m" style="margin-top:18px">${rico(p.titulo)}</h2>
  <div class="empurra"></div>
  <div class="cartao" style="margin-bottom:28px;border-style:dashed">
    <div class="rotulo" style="font-size:24px">${esc(p.ruim.rotulo)}</div>
    <p class="corpo" style="margin-top:14px;color:var(--nevoa)">${rico(p.ruim.texto)}</p>
  </div>
  <div class="cartao-azul">
    <div class="rotulo" style="font-size:24px;color:color-mix(in srgb, var(--on-mar) 78%, transparent)">${esc(p.bom.rotulo)}</div>
    <p class="corpo" style="margin-top:14px;color:var(--on-mar)">${rico(p.bom.texto)}</p>
  </div>
  <div class="empurra"></div>
  ${numero}
</div>`;

    case "numero":
      return `<div class="conteudo">
  <div class="empurra"></div>
  <div class="linha" style="align-items:baseline;gap:18px">
    <div class="num" style="font-size:300px;line-height:.78;letter-spacing:-.04em">${esc(p.numero)}</div>
    ${p.unidade ? `<div class="num" style="font-size:78px;letter-spacing:-.03em">${esc(p.unidade)}</div>` : ""}
  </div>
  <h2 class="manchete m-m" style="margin-top:34px;max-width:880px">${rico(p.titulo)}</h2>
  <p class="corpo" style="margin-top:26px;max-width:840px">${rico(p.corpo)}</p>
  ${p.nota ? `<div class="mao" style="font-size:46px;margin-top:34px;transform:rotate(-2deg)">${esc(p.nota)}</div>` : ""}
  <div class="empurra"></div>
  ${p.assinatura ? assinatura(s) : ""}
  ${p.assinatura ? "" : numero}
</div>`;

    case "lista":
      return `<div class="conteudo">
  ${p.rotulo ? `<div class="rotulo">${esc(p.rotulo)}</div>` : ""}
  <h2 class="manchete m-m" style="margin-top:18px;max-width:860px">${rico(p.titulo)}</h2>
  <div class="empurra"></div>
  <div style="display:flex;flex-direction:column;gap:26px">
    ${p.itens
      .map(
        (i, k) => `<div class="linha" style="align-items:flex-start;gap:26px">
      <div class="num" style="font-size:52px;line-height:1;min-width:64px">${String(k + 1).padStart(2, "0")}</div>
      <p class="corpo" style="flex:1">${rico(i)}</p>
    </div>`,
      )
      .join("\n    ")}
  </div>
  <div class="empurra"></div>
  ${numero}
</div>`;

    case "fala":
      return `<div class="conteudo">
  <div class="empurra"></div>
  <div class="cartao" style="position:relative;border-radius:var(--r-folha)">
    <p class="manchete m-s" style="line-height:1.14">${rico(p.fala)}</p>
    ${p.apoio ? `<p class="corpo-s" style="margin-top:24px">${rico(p.apoio)}</p>` : ""}
    <svg width="72" height="46" viewBox="0 0 72 46" style="position:absolute;left:78px;bottom:-44px"><path d="M2 0 H70 L28 44 Z" fill="var(--cards)" stroke="var(--gelo)" stroke-width="3"/></svg>
  </div>
  <div class="linha" style="margin-top:86px;gap:28px">
    <div style="width:312px;height:312px;flex:0 0 312px;margin-left:-14px">${focaImg(s, p.expressao, 312)}</div>
  </div>
  <div class="empurra"></div>
  ${numero}
</div>`;

    case "citacao":
      return `<div class="conteudo" style="justify-content:center">
  <h2 class="manchete m-${p.escala ?? "l"}" style="max-width:900px">${rico(p.texto)}</h2>
  ${p.nota ? `<p class="corpo-s" style="margin-top:40px;max-width:760px">${rico(p.nota)}</p>` : ""}
  ${p.assinatura ? `<div style="position:absolute;left:${MARGEM}px;bottom:${MARGEM}px">${assinatura(s)}</div>` : numero}
</div>`;

    case "passos":
      return `<div class="conteudo">
  <h2 class="manchete m-m" style="max-width:880px">${rico(p.titulo)}</h2>
  <div class="empurra"></div>
  <div style="display:flex;flex-direction:column;gap:22px">
    ${p.passos
      .map(
        (e, k) => `<div class="cartao" style="padding:28px 32px">
      <div class="linha" style="gap:20px">
        <div class="num" style="font-size:40px">${k + 1}</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:40px;color:var(--abismo)">${rico(e.titulo)}</div>
      </div>
      <p class="corpo-s" style="margin-top:12px;font-size:30px">${rico(e.texto)}</p>
    </div>`,
      )
      .join("\n    ")}
  </div>
  <div class="empurra"></div>
  ${numero}
</div>`;

    case "tela": {
      const r = p.recorte ?? { topo: 0, altura: 1 };
      return `<div class="conteudo">
  <h2 class="manchete m-s" style="max-width:860px">${rico(p.titulo)}</h2>
  <div class="empurra"></div>
  <div class="aparelho" data-tela="${esc(p.tela)}" data-topo="${r.topo}" data-altura="${r.altura}">
    <img src="__TELA:${esc(p.tela)}__" alt="">
  </div>
  <div class="linha" style="margin-top:30px;justify-content:space-between">
    <p class="corpo-s" style="flex:1 1 auto;min-width:0;font-size:30px;padding-right:24px">${rico(p.legenda)}</p>
    <div class="selo-real">tela real do app</div>
  </div>
  <div class="empurra"></div>
  ${numero}
</div>`;
    }

    case "fechamento":
      return `<div class="conteudo">
  <div class="empurra"></div>
  <h2 class="manchete m-l" style="max-width:880px">${rico(p.manchete)}</h2>
  ${p.apoio ? `<p class="corpo" style="margin-top:30px;max-width:820px">${rico(p.apoio)}</p>` : ""}
  <div style="margin-top:56px"><span class="botao">${esc(p.cta)}</span></div>
  <div class="empurra"></div>
  <div class="linha" style="gap:24px">
    <div class="icone-azul" style="width:132px;height:132px">${focaImg(s, undefined, 100)}</div>
    <div>
      <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:44px;color:var(--abismo)">Foca</div>
      ${p.usuario ? `<div class="corpo-s" style="font-size:30px">${esc(p.usuario)}</div>` : ""}
    </div>
  </div>
</div>`;
  }
}

/**
 * Cena: "O próximo passo já está escolhido" — 13 s, 1080x1920 (9:16).
 *
 * Identidade de movimento do Foca (docs/DESIGN.md → Movimento; tokens de styles.css):
 *   curva assinatura  ease-out  cubic-bezier(.2,.8,.2,1)   — 80 % das entradas
 *   recompensa        ease-bounce cubic-bezier(.34,1.56,.64,1) — só no que é conquista
 *   paleta de duração rápida 180 ms · padrão 320 ms · lenta 600 ms
 *   entrada padrão    sobe 40 px + fade, escalonado 60 ms
 *
 * Três camadas: primária (tipografia e a tela real), secundária (seta, anel de foco,
 * aresta do botão), ambiente (o traço de caneta que desenha durante os 13 s inteiros).
 *
 * Tudo é função de `t`: `window.seek(t)` posiciona a cena inteira. Sem animação CSS,
 * sem relógio, sem aleatório — o render é reproduzível e dá para pré-visualizar um trecho.
 */
import { join } from "node:path";
import { P } from "../../lib/paths.ts";
import { css, lerSnapshot, url } from "../../render/base.ts";
import type { Cena } from "../motion.ts";

const L = 1080;
const A = 1920;
/** Áreas seguras do Reels: a interface do Instagram cobre o topo e o rodapé. */
const SEGURO = { topo: 300, base: 420 };

const s = lerSnapshot();
const tela = join(P.telas, "atividade-motivo-light.png");
const logo = s.logos.oficialColorida.arquivo!;

function html() {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>proximo-passo</title>
<style>${css(s)}
html,body{width:${L}px;height:${A}px;overflow:hidden;background:var(--neve)}
#palco{position:relative;width:${L}px;height:${A}px;
  background-image:repeating-linear-gradient(to bottom, transparent 0 63px, color-mix(in srgb, var(--gelo) 82%, transparent) 63px 65px);}
.margem{position:absolute;top:0;bottom:0;left:64px;width:3px;background:color-mix(in srgb, var(--coral-claro) 55%, transparent)}
.camada{position:absolute;inset:0;will-change:transform,opacity}
.bloco{position:absolute;left:88px;right:88px}
.tit{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:104px;line-height:1.0;letter-spacing:-.03em;color:var(--abismo)}
.tit .pal{display:inline-block;will-change:transform,opacity}
.mao2{font-family:"Caveat",cursive;font-weight:600;font-size:76px;color:var(--mar);white-space:nowrap;overflow:hidden}
.telafone{position:absolute;left:150px;width:780px;border:10px solid var(--abismo);border-radius:48px;overflow:hidden;background:var(--cards);
  box-shadow:0 10px 0 color-mix(in srgb, var(--abismo) 45%, transparent)}
.telafone img{display:block;width:100%}
#anel{position:absolute;border:7px solid var(--mar);border-radius:28px;pointer-events:none}
.mono{font-family:"Space Mono",monospace;font-weight:700;color:var(--mar);font-variant-numeric:tabular-nums}
.btn{display:inline-flex;align-items:center;justify-content:center;height:112px;padding:0 52px;border-radius:16px;background:var(--mar);
  color:var(--on-mar);box-shadow:0 8px 0 var(--mar-fundo);font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:44px}
.icone{width:150px;height:150px;border-radius:32px;background:var(--mar);display:grid;place-items:center}
.icone img{width:112px;height:112px;object-fit:contain;display:block}
.rot{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:28px;letter-spacing:.14em;text-transform:uppercase;color:var(--nevoa)}
</style></head><body>
<div id="palco">
  <div class="margem"></div>

  <!-- AMBIENTE: o traço de caneta desenha durante os 13 s -->
  <svg id="traco" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}" fill="none" style="position:absolute;inset:0">
    <path id="p1" d="M -60 1380 C 220 1280, 360 1480, 620 1400 S 980 1290, 1160 1360" stroke="var(--mar)" stroke-width="30" opacity=".16" stroke-linecap="round"/>
    <path id="p2" d="M -60 1414 C 220 1314, 360 1514, 620 1434 S 980 1324, 1160 1394" stroke="var(--mar)" stroke-width="8" opacity=".55" stroke-linecap="round"/>
  </svg>

  <!-- CENA 1 -->
  <div class="camada" id="c1">
    <div class="bloco" style="top:${SEGURO.topo + 260}px">
      <div class="rot" id="c1rot">para quem estuda sozinho</div>
      <div class="tit" id="c1tit" style="margin-top:28px"></div>
    </div>
    <div class="bloco" id="c1mao" style="top:${SEGURO.topo + 690}px">
      <div class="mao2" id="c1maotxt">o Foca já escolheu</div>
      <svg id="c1seta" width="230" height="96" viewBox="0 0 230 96" fill="none" style="margin-top:6px">
        <path id="seta" d="M12 78 C60 28, 150 10, 214 24" stroke="var(--mar)" stroke-width="8" stroke-linecap="round"/>
        <path id="setap" d="M186 6 L218 26 L182 44" stroke="var(--mar)" stroke-width="8" stroke-linecap="round" fill="none"/>
      </svg>
    </div>
  </div>

  <!-- CENA 2: tela real do app -->
  <div class="camada" id="c2">
    <div class="bloco" style="top:${SEGURO.topo + 30}px"><div class="rot" id="c2rot">o motivo vem escrito</div></div>
    <div class="telafone" id="fone" style="top:${SEGURO.topo + 110}px"><img src="${url(tela)}" alt=""></div>
    <div id="anel"></div>
  </div>

  <!-- CENA 3: o fato -->
  <div class="camada" id="c3">
    <div class="bloco" style="top:${SEGURO.topo + 420}px">
      <div style="display:flex;align-items:baseline;gap:20px">
        <div class="mono" id="c3num" style="font-size:250px;line-height:.8;letter-spacing:-.04em">4</div>
        <div class="mono" id="c3uni" style="font-size:78px">a 8</div>
      </div>
      <div class="tit" id="c3tit" style="font-size:86px;margin-top:26px">questões por lição.<br>E aí acaba.</div>
    </div>
  </div>

  <!-- CENA 4: assinatura -->
  <div class="camada" id="c4">
    <div class="bloco" style="top:${SEGURO.topo + 430}px">
      <div class="tit" id="c4tit" style="font-size:96px">O próximo passo<br>já está escolhido.</div>
      <div id="c4btn" style="margin-top:56px"><span class="btn">Começar grátis</span></div>
      <div id="c4ass" style="margin-top:96px;display:flex;align-items:center;gap:26px">
        <div class="icone"><img src="${url(logo)}" alt=""></div>
        <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:52px;color:var(--abismo)">Foca</div>
      </div>
    </div>
  </div>
</div>

<script>
// ---- utilidades de tempo (nenhuma animação CSS: tudo vem de seek(t)) ----
var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
/** progresso 0..1 de um trecho */
var pr = function (t, ini, dur) { return clamp((t - ini) / dur, 0, 1); };
/** ease-out assinatura, cubic-bezier(.2,.8,.2,1) aproximada */
var out = function (x) { return 1 - Math.pow(1 - x, 3); };
/** ease-bounce (overshoot) — só para recompensa */
var bounce = function (x) { var c = 1.70158 + 1; return 1 + c * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); };
var $ = function (id) { return document.getElementById(id); };

/** entrada padrão: sobe 40 px + fade, com atraso por índice (escalonamento 60 ms) */
function entra(el, t, ini, i, desloc) {
  var p = out(pr(t, ini + (i || 0) * 0.06, 0.32));
  el.style.opacity = String(p);
  el.style.transform = 'translateY(' + ((1 - p) * (desloc === undefined ? 40 : desloc)) + 'px)';
  return p;
}
function sai(el, t, ini) {
  var p = pr(t, ini, 0.24);
  el.style.opacity = String(1 - p);
  el.style.transform = 'translateY(' + (-p * 32) + 'px)';
}

// Divide o título da cena 1 em palavras, para o escalonamento.
var LINHAS = [['Por', 'onde', 'eu'], ['começo', 'hoje?']];
$('c1tit').innerHTML = LINHAS.map(function (l) {
  return '<div>' + l.map(function (w) { return '<span class="pal">' + w + '</span>'; }).join(' ') + '</div>';
}).join('');
var PALAVRAS = Array.prototype.slice.call(document.querySelectorAll('#c1tit .pal'));

var comp1 = $('p1').getTotalLength(), comp2 = $('p2').getTotalLength();
var larguraMao = $('c1maotxt').getBoundingClientRect().width;
var compSeta = $('seta').getTotalLength(), compSetaP = $('setap').getTotalLength();

window.seek = function (t) {
  // AMBIENTE — o traço desenha do começo ao fim do filme
  var amb = out(pr(t, 0.1, 11.5));
  $('p1').style.strokeDasharray = comp1; $('p1').style.strokeDashoffset = String(comp1 * (1 - amb));
  $('p2').style.strokeDasharray = comp2; $('p2').style.strokeDashoffset = String(comp2 * (1 - amb * 0.96));

  // CENA 1 — 0,4 a 4,0 s
  var c1 = $('c1');
  c1.style.display = t < 4.3 ? 'block' : 'none';
  entra($('c1rot'), t, 0.4, 0);
  PALAVRAS.forEach(function (w, i) { entra(w, t, 0.7, i); });
  // a anotação à mão "escreve" (revelação da esquerda para a direita) + a seta se desenha
  var escreve = out(pr(t, 2.3, 0.7));
  $('c1maotxt').style.width = (larguraMao * escreve) + 'px';
  $('c1maotxt').style.opacity = String(pr(t, 2.3, 0.12));
  var ds = out(pr(t, 2.9, 0.45));
  $('seta').style.strokeDasharray = compSeta; $('seta').style.strokeDashoffset = String(compSeta * (1 - ds));
  var dp = out(pr(t, 3.2, 0.25));
  $('setap').style.strokeDasharray = compSetaP; $('setap').style.strokeDashoffset = String(compSetaP * (1 - dp));
  if (t > 3.9) sai(c1, t, 3.9);
  else { c1.style.opacity = '1'; c1.style.transform = 'none'; }

  // CENA 2 — 4,2 a 8,6 s: a tela real sobe (lenta, 600 ms) e o anel de foco marca o motivo
  var c2 = $('c2');
  c2.style.display = t >= 4.0 && t < 8.6 ? 'block' : 'none';
  var pf = out(pr(t, 4.2, 0.6));
  $('fone').style.opacity = String(pf);
  $('fone').style.transform = 'translateY(' + ((1 - pf) * 120) + 'px)';
  entra($('c2rot'), t, 4.6, 0);
  // anel: entra com overshoot (é o momento de "olha aqui"), some depois
  var pa = pr(t, 5.3, 0.42);
  var esc = pa > 0 ? 0.88 + 0.12 * bounce(pa) : 0;
  var anel = $('anel');
  var cx = 150 + 10 + 780 * 0.24, cy = ${SEGURO.topo + 110} + 10 + 780 * 0.30;
  anel.style.left = (cx - 24) + 'px'; anel.style.top = (cy - 20) + 'px';
  anel.style.width = '660px'; anel.style.height = '230px';
  anel.style.opacity = String(pa > 0 ? Math.min(1, pa * 3) * (1 - pr(t, 8.0, 0.4)) : 0);
  anel.style.transform = 'scale(' + esc + ')';
  anel.style.transformOrigin = 'center';
  if (t > 8.2) sai(c2, t, 8.2);
  else { c2.style.opacity = '1'; c2.style.transform = 'none'; }

  // CENA 3 — 8,7 a 10,9 s: o número aparece com recompensa (overshoot), o resto entra normal
  var c3 = $('c3');
  c3.style.display = t >= 8.45 && t < 11.2 ? 'block' : 'none';
  var pn = pr(t, 8.5, 0.42);
  $('c3num').style.opacity = String(Math.min(1, pn * 3));
  $('c3num').style.transform = 'scale(' + (pn > 0 ? 0.8 + 0.2 * bounce(pn) : 0.8) + ')';
  $('c3num').style.transformOrigin = 'left bottom';
  entra($('c3uni'), t, 8.8, 0, 20);
  entra($('c3tit'), t, 8.95, 0);
  if (t > 10.8) sai(c3, t, 10.8);
  else { c3.style.opacity = '1'; c3.style.transform = 'none'; }

  // CENA 4 — 11,0 s ao fim
  var c4 = $('c4');
  c4.style.display = t >= 11.0 ? 'block' : 'none';
  c4.style.opacity = '1'; c4.style.transform = 'none';
  entra($('c4tit'), t, 11.05, 0);
  entra($('c4btn'), t, 11.05, 1);
  entra($('c4ass'), t, 11.05, 2);
};
window.seek(0);
</script></body></html>`;
}

export const cena: Cena = {
  id: "20260929-motion-proximo-passo-escolhido",
  nome: "proximo-passo",
  largura: L,
  altura: A,
  fps: 30,
  duracao: 13,
  html,
  audio: [
    {
      arquivo: join(P.repo, "public", "sfx", "v2", "abertura-importante.wav"),
      em: 0.55,
      ganho: 0.7,
    },
    { arquivo: join(P.repo, "public", "sfx", "v2", "meta-diaria.wav"), em: 5.35, ganho: 0.6 },
    { arquivo: join(P.repo, "public", "sfx", "v2", "conclusao-licao.wav"), em: 11.05, ganho: 0.8 },
  ],
  licencaAudio:
    "Identidade sonora do próprio Foca: 3 dos 12 WAVs aprovados pelo usuário em 21/09/2026 (docs/24-integracao-identidade-sonora.md), servidos em public/sfx/v2/. Autoria e uso do projeto — nenhuma faixa de terceiros.",
};

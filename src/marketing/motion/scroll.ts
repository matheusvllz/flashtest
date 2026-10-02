// Movimento ligado ao scroll (docs/42 §6): GSAP + ScrollTrigger, carregado DEPOIS da primeira pintura (boot.ts, import
// dinâmico) e fora do caminho crítico. O hero nunca depende disto (entra por CSS).
//
// Modelo emprestado da skill remotion-markup (pasta "edição Videos"): cada cena é um trecho de uma timeline cujo
// "quadro" é o progresso do scroll. Tudo é posicionado em unidades de cena (a cena i ocupa [i, i+1]), com intervalos
// fechados como o interpolate() com clamp, e a troca de cena sobrepõe a saída de uma e a entrada da outra, como o
// TransitionSeries. Entradas desaceleram (power3.out), saídas aceleram (power2.in) e são mais curtas (motion-design).
//
// Momentos:
//  - M-Semana      a semana é escrita conforme o scroll (scrub curto, nada preso).
//  - HM-2 História a seção #como-funciona fica presa por position: sticky nativo (CSS) e o scroll avança e recua a
//                  timeline: a pilha de material vai pro canto, prova, nivelamento, próximo passo com motivo, revisão.
//  - HM-3 Errou    a sequência do "Explicar melhor" toca quando o celular entra e recomeça se o leitor voltar.
//  - M-Recomeço    o calendário é escrito pelo scroll; o congelamento cobre o dia parado.
//  - Reveals       blocos com [data-reveal] sobem 16 px e aparecem (ScrollTrigger.batch).
//
// Sem pin do GSAP, sem snap, sem normalizeScroll, sem listener de scroll próprio (só ScrollTrigger). Só transform,
// opacity, clip-path, stroke-dashoffset e uma variável CSS (--f, a posição da faixa). Tudo dentro de gsap.matchMedia():
// sai do ar sozinho (mm.revert) se o usuário passar a pedir movimento reduzido ou a tela mudar de faixa.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stopRevealFallback } from "./reveal-fallback";

let mm: gsap.MatchMedia | null = null;

const ENTRA = "power3.out";
const SAI = "power2.in";
const PAPEL = "back.out(1.4)";

const $ = <T extends Element = HTMLElement>(sel: string, raiz: ParentNode = document) => raiz.querySelector<T>(sel);

/**
 * "Piscar" da Foca numa timeline (docs/44 §6): a cabeça achata, a expressão troca no fundo do movimento e volta
 * com a mola. `troca` é um <FocaTroca> (duas artes empilhadas). Recua junto quando o scroll volta.
 */
function piscar(tl: gsap.core.Timeline, troca: HTMLElement | null, pos: number, dur = 0.12): void {
  if (!troca) return;
  const de = troca.querySelector(".lp-troca__de");
  const para = troca.querySelector(".lp-troca__para");
  const meio = pos + dur * 0.4;
  tl.fromTo(troca, { scaleX: 1, scaleY: 1 }, { scaleX: 1.03, scaleY: 0.9, duration: dur * 0.4, ease: "power2.in" }, pos)
    .set(de, { visibility: "hidden" }, meio)
    .set(para, { visibility: "visible" }, meio)
    .to(troca, { scaleX: 1, scaleY: 1, duration: dur * 0.6, ease: "back.out(2)" }, meio);
}
const $$ = <T extends Element = HTMLElement>(sel: string, raiz: ParentNode = document) => Array.from(raiz.querySelectorAll<T>(sel));

// Avisos para o diagnóstico de rolagem (spec 49 T-49.1.1): cada recálculo vira um evento da janela, sem custo fora dele.
const avisarRefresh = () => window.dispatchEvent(new Event("lp:st-refresh"));
const avisarRefreshInit = () => window.dispatchEvent(new Event("lp:st-refresh-init"));

export function initScroll(): void {
  if (mm) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.addEventListener("refresh", avisarRefresh);
  ScrollTrigger.addEventListener("refreshInit", avisarRefreshInit);
  // A barra de endereço do celular muda a altura da tela a cada gesto: não recalcular por isso.
  ScrollTrigger.config({ ignoreMobileResize: true });
  stopRevealFallback(); // daqui em diante o ScrollTrigger cuida das revelações

  // A história só vira cena presa se o leitor ainda não chegou nela: mudar a altura de uma seção que já está na tela
  // (ou acima dela) faria a página pular. Decidido uma vez, no carregamento.
  const secHistoria = document.getElementById("como-funciona");
  // Um link com âncora (#como-funciona, #duvidas...) também conta: a rolagem até ela pode ainda estar em andamento.
  const alvoHash = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  const hashDepois = !!alvoHash && !!secHistoria && !!(secHistoria.compareDocumentPosition(alvoHash) & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY) || alvoHash === secHistoria);
  const podeHistoria = !!secHistoria && !hashDepois && secHistoria.getBoundingClientRect().top > window.innerHeight * 0.6;

  mm = gsap.matchMedia();
  const MOV = "(prefers-reduced-motion: no-preference)";

  // Criadas na ordem da página, de cima para baixo (gsap-scrolltrigger). A história vem antes dos reveals porque muda
  // a altura da página: tudo que está abaixo dela precisa medir depois.
  mm.add(`${MOV} and (min-width: 1024px) and (min-height: 620px)`, () => (podeHistoria ? historia(secHistoria!, true) : undefined));
  mm.add(`${MOV} and (max-width: 1023px) and (min-height: 560px) and (orientation: portrait)`, () =>
    podeHistoria ? historia(secHistoria!, false) : undefined,
  );
  mm.add(MOV, () => {
    semana();
    errou();
    recomeco();
    reveals();
  });

  // Se o usuário passar a pedir menos movimento com a página aberta, tudo aparece e o layout empilhado assume.
  mm.add("(prefers-reduced-motion: reduce)", () => {
    const html = document.documentElement;
    html.classList.remove("lp-motion");
    $$("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    return () => html.classList.add("lp-motion");
  });

  // Fontes trocam a altura do texto: recalcula as posições depois delas (e nunca antes).
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/* ------------------------------------------------------------------ reveals */

function reveals(): void {
  // Quem já está na tela (ou acima dela, se a página abriu rolada) aparece sem esperar gatilho.
  const limite = window.innerHeight * 0.88;
  const pendentes = $$("[data-reveal]:not(.is-in)").filter((el) => {
    if (el.getBoundingClientRect().top < limite) {
      el.classList.add("is-in");
      return false;
    }
    return true;
  });
  if (!pendentes.length) return;
  ScrollTrigger.batch(pendentes, {
    start: "top 88%",
    once: true,
    interval: 0.1,
    batchMax: 3, // 1/3 da tela em movimento no máximo
    onEnter: (els) => {
      (els as HTMLElement[]).forEach((el, i) => {
        el.style.transitionDelay = `${i * 80}ms`;
        el.classList.add("is-in");
      });
    },
  });
}

/* ------------------------------------------------------------------ M-Semana */

function semana(): void {
  const lista = $(".lp-week");
  if (!lista) return;
  const dias = $$(".lp-day", lista);
  const tl = gsap.timeline({
    defaults: { ease: ENTRA, duration: 0.6 },
    scrollTrigger: { trigger: lista, start: "top 82%", end: "bottom 42%", scrub: 0.4 },
  });
  dias.forEach((dia, i) => {
    const t = i * 0.55;
    tl.fromTo(dia, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0 }, t);
    const traco = $$("path.lp-stroke", dia);
    if (traco.length) tl.fromTo(traco, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "power1.inOut", duration: 0.5 }, t + 0.25);
    const ico = $(".lp-week__ico", dia);
    if (ico) tl.fromTo(ico, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: PAPEL, duration: 0.4 }, t + 0.2);
    const nota = $(".lp-day__nota", dia);
    // Nota à mão: escrita da esquerda para a direita. Nota digitada: só aparece.
    if (nota?.classList.contains("lp-day__nota--mao")) tl.fromTo(nota, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", duration: 0.5 }, t + 0.3);
    else if (nota) tl.fromTo(nota, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t + 0.35);
  });
}

/* ------------------------------------------------------------------ HM-2 História */

function historia(sec: HTMLElement, desktop: boolean): () => void {
  const html = document.documentElement;
  html.classList.add("lp-story-on"); // CSS: seção alta + área presa (sticky nativo) + cenas sobrepostas

  const cenas = $$(".lp-scene", sec);
  const n = cenas.length;
  const caps = cenas.map((c) => $(".lp-scene__cap", c)!);
  const vis = cenas.map((c) => $(".lp-scene__vis", c)!);
  const pontos = $$(".lp-story__dot", sec);
  const notas = $$(".lp-pile__nota", sec).filter((el) => getComputedStyle(el).display !== "none");
  const pilha = $(".lp-pile__pilha", sec);
  const caneta = $$(".lp-story__pen path", sec);
  const notaMotivo = $(".lp-story__nota--motivo", sec);
  const notaFaixa = $(".lp-story__nota--faixa", sec);

  let atual = -1;
  const marcar = (i: number) => {
    if (i === atual) return;
    atual = i;
    pontos.forEach((p, k) => (p.dataset.state = k < i ? "done" : k === i ? "on" : "off"));
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (st) => marcar(Math.min(n - 1, Math.floor(st.progress * n + 0.1))),
    },
  });

  // Troca de cena na fronteira b: a legenda e a tela anteriores saem, as novas entram, sobrepostas.
  for (let b = 1; b < n; b++) {
    tl.to(caps[b - 1], { opacity: 0, y: -18, ease: SAI, duration: 0.14 }, b - 0.18);
    tl.fromTo(caps[b], { opacity: 0, y: 22 }, { opacity: 1, y: 0, ease: ENTRA, duration: 0.18 }, b - 0.05);
    if (b - 1 > 0) tl.to(vis[b - 1], { opacity: 0, xPercent: -5, ease: SAI, duration: 0.14 }, b - 0.16);
    tl.fromTo(vis[b], { opacity: 0, xPercent: 6 }, { opacity: 1, xPercent: 0, ease: ENTRA, duration: 0.2 }, b - 0.1);
  }

  // Cena 1 → 2: a pilha vai pro canto. Nada some da vida do João; só sai do meio.
  const alvo = (el: HTMLElement, i: number) => ({
    x: () => (pilha ? pilha.offsetLeft - el.offsetLeft + i * 5 : 0),
    y: () => (pilha ? pilha.offsetTop - el.offsetTop + i * (desktop ? 9 : 4) : 0),
  });
  notas.forEach((nota, i) => {
    const { x, y } = alvo(nota, i);
    tl.to(nota, { x, y, rotation: i % 2 ? 2.5 : -2, scale: desktop ? 0.72 : 0.6, ease: "power2.inOut", duration: 0.42 }, 0.5 + i * 0.03);
    if (!desktop) tl.to(nota, { opacity: 0, duration: 0.2, ease: SAI }, 0.8 + i * 0.03);
  });
  if (desktop && caneta.length) {
    // O traço azul sai da pilha e chega no celular: daqui em diante a ordem é a do Foca.
    tl.fromTo(caneta, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "power1.inOut", duration: 0.3 }, 0.85);
    // Na última cena a pilha e o traço já contaram o que tinham para contar.
    tl.to([...notas, ...caneta.map((p) => p.parentElement!)], { opacity: 0, ease: SAI, duration: 0.14 }, 3.85);
  }

  // Cena 2 (prova): ENEM é marcado.
  const sel = $(".app-opt__sel", vis[1]);
  if (sel) tl.fromTo(sel, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, ease: ENTRA, duration: 0.1 }, 1.32);

  // Cena 3 (nivelamento): o resultado se monta área por área, depois a primeira atividade.
  const areas = $$(".app-nv__area", vis[2]);
  tl.fromTo(areas, { opacity: 0, y: 14 }, { opacity: 1, y: 0, ease: ENTRA, duration: 0.14, stagger: 0.07 }, 2.12);
  const primeira = $(".app-nv__primeira", vis[2]);
  if (primeira) tl.fromTo(primeira, { opacity: 0, y: 10 }, { opacity: 1, y: 0, ease: ENTRA, duration: 0.14 }, 2.5);

  // Cena 4 (próximo passo): a Foca aparece, o motivo abre, o botão é tocado.
  const foca = $(".app-motivo__foca", vis[3]);
  const bolha = $(".app-motivo__txt", vis[3]);
  const titulo = $(".app-atv__title", vis[3]);
  const botao = $(".app-atv__btn", vis[3]);
  if (foca) tl.fromTo(foca, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, ease: "back.out(2)", duration: 0.12 }, 3.1);
  if (bolha) tl.fromTo(bolha, { opacity: 0, scale: 0.88, transformOrigin: "left center" }, { opacity: 1, scale: 1, ease: PAPEL, duration: 0.14 }, 3.18);
  if (titulo) tl.fromTo(titulo, { opacity: 0, y: 10 }, { opacity: 1, y: 0, ease: ENTRA, duration: 0.12 }, 3.26);
  if (botao) {
    tl.fromTo(botao, { opacity: 0, y: 10 }, { opacity: 1, y: 0, ease: ENTRA, duration: 0.12 }, 3.32);
    tl.to(botao, { y: 3, duration: 0.04, ease: SAI }, 3.68).to(botao, { y: 0, duration: 0.06, ease: ENTRA }, 3.72);
  }
  if (notaMotivo && desktop) {
    tl.fromTo(notaMotivo, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 3.3);
    tl.fromTo($$("path", notaMotivo), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "power1.inOut", duration: 0.2 }, 3.34);
    tl.to(notaMotivo, { opacity: 0, ease: SAI, duration: 0.1 }, 3.84);
  }

  // Cena 5 (revisão): o motivo muda, e a faixa da área anda de "Base em construção" para "No caminho".
  const bolhaRev = $(".app-motivo__txt", vis[4]);
  if (bolhaRev) tl.fromTo(bolhaRev, { opacity: 0, scale: 0.88, transformOrigin: "left center" }, { opacity: 1, scale: 1, ease: PAPEL, duration: 0.14 }, 4.12);
  const cartao = $(".lp-faixa-card", vis[4]);
  const faixa = cartao ? $(".app-faixa", cartao) : null;
  const de = cartao ? $(".lp-faixa-card__de", cartao) : null;
  const para = cartao ? $(".lp-faixa-card__para", cartao) : null;
  if (cartao) tl.fromTo(cartao, { opacity: 0, x: desktop ? -18 : 18 }, { opacity: 1, x: 0, ease: ENTRA, duration: 0.14 }, 4.24);
  if (faixa) tl.fromTo(faixa, { "--f": 0 }, { "--f": 1, ease: "power2.inOut", duration: 0.22 }, 4.46);
  if (de) tl.fromTo(de, { opacity: 1 }, { opacity: 0, duration: 0.08 }, 4.5);
  if (para) tl.fromTo(para, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 4.58);
  if (notaFaixa) tl.fromTo(notaFaixa, { opacity: 0, y: 6 }, { opacity: 1, y: 0, ease: ENTRA, duration: 0.12 }, 4.62);
  // A Foca do cartão fica orgulhosa quando a faixa chega (docs/44 §6).
  piscar(tl, cartao ? $("[data-troca]", cartao) : null, 4.7);

  tl.set({}, {}, n); // a timeline dura exatamente n cenas; a última fica parada até a seção soltar
  marcar(0);

  return () => {
    html.classList.remove("lp-story-on");
    pontos.forEach((p, k) => (p.dataset.state = k === 0 ? "on" : "off"));
  };
}

/* ------------------------------------------------------------------ HM-3 Errou */

function errou(): void {
  const cel = $(".lp-errou-phone");
  if (!cel) return;
  const folha = $(".app-sheet", cel);
  const explicar = $(".app-q__explicar", cel);
  const tutor = $(".app-tutor", cel);
  const ctx = $(".app-tutor__ctx", cel);
  const eu = $(".app-tutor__eu", cel);
  const digitando = $(".app-tutor__digitando", cel);
  const resposta = $(".app-tutor__foca-msg", cel);
  const sugestoes = $$(".app-chip", cel);
  const input = $(".app-tutor__input", cel);
  const nota = $(".lp-errou-nota");
  if (!folha || !tutor || !explicar) return;

  const tl = gsap.timeline({
    defaults: { ease: ENTRA },
    scrollTrigger: { trigger: cel, start: "top 62%", toggleActions: "play none none reset" },
  });
  tl.from(folha, { yPercent: 100, duration: 0.5 }, 0.15)
    // "Explicar melhor" afunda 3 px, como os botões de aresta do app.
    .to(explicar, { y: 3, duration: 0.09, ease: SAI }, 1.35)
    .to(explicar, { y: 0, duration: 0.14 }, 1.44)
    .from(tutor, { yPercent: 100, duration: 0.55 }, 1.55)
    .from([ctx, input], { opacity: 0, duration: 0.3 }, 1.95);
  if (eu) tl.from(eu, { opacity: 0, x: 22, duration: 0.35 }, 2.3);
  if (digitando) {
    tl.set(digitando, { display: "flex" }, 2.75);
    tl.from($$("span", digitando), { y: -3, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 3, stagger: 0.08 }, 2.8);
    tl.set(digitando, { display: "none" }, 3.65);
  }
  if (resposta) tl.from(resposta, { opacity: 0, y: 12, duration: 0.4 }, 3.65);
  if (sugestoes.length) tl.from(sugestoes, { opacity: 0, x: 16, duration: 0.3, stagger: 0.08 }, 4.05);
  if (nota) {
    tl.from($(".lp-note__txt", nota), { opacity: 0, duration: 0.3 }, 4.3);
    tl.fromTo($$("path", nota), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut" }, 4.35);
  }
}

/* ------------------------------------------------------------------ M-Recomeço */

function recomeco(): void {
  const cal = $(".lp-cal");
  if (!cal) return;
  const dias = $$(".lp-cal-day", cal);
  const tl = gsap.timeline({
    defaults: { ease: ENTRA, duration: 0.5 },
    scrollTrigger: { trigger: cal, start: "top 80%", end: "bottom 45%", scrub: 0.4 },
  });
  dias.forEach((dia, i) => {
    const t = i * 0.45;
    const traco = $$("path.lp-stroke", dia);
    if (traco.length) tl.fromTo(traco, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "power1.inOut" }, t);
    const cobre = $(".lp-cal-day__cobre", dia);
    const floco = $(".lp-cal-floco", dia);
    // O dia parado fica vazio por um instante; o congelamento cai e cobre.
    if (cobre) tl.fromTo(cobre, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.35);
    if (floco) tl.fromTo(floco, { opacity: 0, y: -12, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, ease: PAPEL, duration: 0.4 }, t + 0.3);
  });
  const legenda = $(".lp-cal-legenda", cal);
  const chip = $(".lp-cal-chip", cal);
  if (legenda) tl.fromTo(legenda, { opacity: 0, y: 8 }, { opacity: 1, y: 0 }, 1.6);
  if (chip) tl.fromTo(chip, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, ease: PAPEL }, dias.length * 0.45);
  // Sequência mantida: a Foca acolhe a volta (docs/15 §4).
  piscar(tl, $("[data-troca]", cal), dias.length * 0.45 + 0.2, 0.4);
}

/** Desliga tudo (usado nos testes e em hot reload). */
export function disposeScroll(): void {
  ScrollTrigger.removeEventListener("refresh", avisarRefresh);
  ScrollTrigger.removeEventListener("refreshInit", avisarRefreshInit);
  mm?.revert();
  mm = null;
}

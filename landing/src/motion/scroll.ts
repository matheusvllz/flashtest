// Movimento ligado ao scroll (docs/40 §13.3, §13.4): GSAP + ScrollTrigger, carregado DEPOIS da primeira pintura
// (boot.ts, import dinâmico) e fora do caminho crítico. O hero nunca depende disto.
//
// Escopo, cada item com motivo (skill motion-design: movimento motivado):
//  - M-12  Reveal de bloco: sobe 16 px + opacidade quando o bloco entra. Ritmo de leitura. (ScrollTrigger.batch)
//  - M-6/10/11  Os traços de lápis, o floco e o chip são desenhados por CSS quando o bloco ganha .is-in.
//  - M-7   A margem da seção "Como funciona" se preenche de azul conforme a leitura avança: progresso real,
//          citando a trilha do app. (scrub, só >= 768 px)
//
// Sem pin, sem snap, sem parallax, sem loop, sem listener de scroll (só ScrollTrigger, que usa IntersectionObserver
// e rAF internos). Só transform/opacity/stroke-dashoffset. Tudo dentro de gsap.matchMedia(): sai do ar sozinho
// (mm.revert) se o usuário passar a pedir movimento reduzido.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stopRevealFallback } from "./reveal-fallback";

let mm: gsap.MatchMedia | null = null;

export function initScroll(): void {
  if (mm) return;
  gsap.registerPlugin(ScrollTrigger);
  stopRevealFallback(); // daqui em diante o ScrollTrigger cuida das revelações

  mm = gsap.matchMedia();

  // Movimento normal.
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Quem já está na tela (ou acima dela, se a página abriu rolada) aparece sem esperar gatilho.
    const alvos = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    const limite = window.innerHeight * 0.88;
    const pendentes = alvos.filter((el) => {
      if (el.getBoundingClientRect().top < limite) {
        el.classList.add("is-in");
        return false;
      }
      return true;
    });

    if (pendentes.length) {
      ScrollTrigger.batch(pendentes, {
        start: "top 88%",
        once: true,
        interval: 0.1,
        batchMax: 3, // 1/3 da tela em movimento no máximo
        onEnter: (els) => {
          (els as HTMLElement[]).forEach((el, i) => {
            el.style.transitionDelay = `${i * 80}ms`; // stagger de 80 ms (docs/40 §13.2)
            el.classList.add("is-in");
          });
        },
      });
    }
  });

  // M-7: só onde a margem existe (>= 768 px).
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
    const fill = document.querySelector<HTMLElement>("[data-margin-fill]");
    const passos = Array.from(document.querySelectorAll<HTMLElement>(".lp-steps > li"));
    const nos = passos.map((li) => li.querySelector<HTMLElement>(".lp-node"));
    const margem = fill?.parentElement;
    if (!fill || !margem || passos.length < 2 || nos.some((n) => !n)) return;
    // A linha nasce no primeiro nó e chega ao último quando o último passo cruza o meio da tela: o azul acompanha
    // os nós (crítica R8: antes ele terminava acima do nó ativo). Frações medidas no DOM a cada refresh.
    const fracao = (no: HTMLElement) => {
      const r = margem.getBoundingClientRect();
      const n = no.getBoundingClientRect();
      return Math.min(1, Math.max(0, (n.top + n.height / 2 - r.top) / r.height));
    };
    // Linear de propósito: é uma barra de progresso, não um movimento espacial.
    gsap.fromTo(
      fill,
      { scaleY: () => fracao(nos[0]!) },
      {
        scaleY: () => fracao(nos[nos.length - 1]!),
        ease: "none",
        transformOrigin: "top",
        scrollTrigger: {
          trigger: passos[0],
          endTrigger: passos[passos.length - 1],
          start: "center 55%",
          end: "center 55%",
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  // Se o usuário passar a pedir menos movimento com a página aberta, tudo aparece e o layout empilhado assume.
  mm.add("(prefers-reduced-motion: reduce)", () => {
    const html = document.documentElement;
    html.classList.remove("lp-motion");
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    return () => html.classList.add("lp-motion");
  });

  // Fontes trocam a altura do texto: recalcula as posições depois delas (e nunca antes).
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** Desliga tudo (usado nos testes e em hot reload). */
export function disposeScroll(): void {
  mm?.revert();
  mm = null;
}

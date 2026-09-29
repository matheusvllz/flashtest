import { startRevealFallback, stopRevealFallback } from "./reveal-fallback";

/** Classes que a landing põe no <html>; saem todas quando o aluno deixa a rota (docs/44 §3). */
const CLASSES_DA_LANDING = ["lp-motion", "lp-story-on", "lp-fonts-late"];

/** Script inline do head da rota `/` (roda antes da primeira pintura, no HTML do servidor). Com movimento pedido,
 *  liga `html.lp-motion`; se o GSAP não assumir em 8 s, desliga (nada fica escondido para sempre). */
export const LP_MOTION_SCRIPT = `(function(){try{if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("lp-motion");}}catch(e){}setTimeout(function(){if(!window.__lpMotionReady){document.documentElement.classList.remove("lp-motion");}},8000);})();`;

declare global {
  interface Window {
    __lpMotionReady?: boolean;
  }
}

/**
 * Liga o movimento da landing DEPOIS da hidratação (docs/40 §13.4). O hero nunca depende disto (entra por CSS).
 * Chegando à `/` por navegação interna (sem o script do head), liga `lp-motion` aqui, antes da primeira pintura da
 * rota (quem chama é um useLayoutEffect). Devolve a limpeza: desliga ScrollTrigger, observadores e classes.
 */
export function bootMotion(): () => void {
  const html = document.documentElement;
  let vivo = true;
  let dispose: (() => void) | null = null;

  if (!html.classList.contains("lp-motion") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    html.classList.add("lp-motion");
  }
  // Space Mono e Caveat só depois do load: não competem com o hero pela banda.
  const ligarFontes = () => vivo && html.classList.add("lp-fonts-late");
  if (document.readyState === "complete") ligarFontes();
  else window.addEventListener("load", ligarFontes, { once: true });

  window.__lpMotionReady = true;
  if (html.classList.contains("lp-motion")) {
    startRevealFallback();
    const carregar = () => {
      if (!vivo) return;
      void import("./scroll")
        .then((m) => {
          if (!vivo) return;
          m.initScroll();
          dispose = m.disposeScroll;
        })
        .catch(() => {
          /* GSAP indisponível: o fallback por IntersectionObserver continua valendo */
        });
    };
    const quandoOciosa = (cb: () => void) => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout: 1500 });
      else setTimeout(cb, 200);
    };
    if (document.readyState === "complete") quandoOciosa(carregar);
    else window.addEventListener("load", () => quandoOciosa(carregar), { once: true });
  }

  return () => {
    vivo = false;
    window.removeEventListener("load", ligarFontes);
    stopRevealFallback();
    dispose?.();
    html.classList.remove(...CLASSES_DA_LANDING);
    window.__lpMotionReady = false;
  };
}

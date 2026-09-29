import { startRevealFallback } from "./reveal-fallback";

declare global {
  interface Window {
    __lpMotionReady?: boolean;
  }
}

/** Space Mono e Caveat (~68 kB) só depois do load: não competem com o hero pela banda (docs/40 §16). */
function fontesTardias(): void {
  const ligar = () => document.documentElement.classList.add("lp-fonts-late");
  if (document.readyState === "complete") ligar();
  else window.addEventListener("load", ligar, { once: true });
}

/**
 * Liga o movimento da página DEPOIS da hidratação e da primeira pintura (docs/40 §13.4). O hero nunca depende
 * disto (entra por CSS). Sem `html.lp-motion` (JS desligado ou movimento reduzido) nada é escondido e nada roda.
 */
export function bootMotion(): void {
  fontesTardias();
  window.__lpMotionReady = true; // desarma a rede de segurança do index.html
  if (!document.documentElement.classList.contains("lp-motion")) return;

  startRevealFallback();

  const carregar = () => {
    // F10: import("./scroll") assume os gatilhos; até lá vale o fallback.
    void import("./scroll").then((m) => m.initScroll()).catch(() => {
      /* GSAP indisponível: o fallback por IntersectionObserver já está ativo */
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

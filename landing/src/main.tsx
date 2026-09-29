import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot, hydrateRoot } from "react-dom/client";
import type { IslandName } from "./components/Island";
import { ILHAS_AGORA, ILHAS_DEPOIS } from "./islands";
import { bootChrome } from "./lib/chrome-dom";
import { bootTracking } from "./lib/track-dom";
import { bootMotion } from "./motion/boot";
import "./styles/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root não encontrado");
const container: HTMLElement = root;
const preRenderizado = container.hasChildNodes() && !container.innerHTML.trim().startsWith("<!--");

function hidratar(el: HTMLElement, Componente: React.ComponentType) {
  hydrateRoot(el, <StrictMode><Componente /></StrictMode>);
}

/**
 * Hidrata `el` fora do JS inicial: em ociosidade logo depois do `load` (o chunk tem poucos kB), e antes disso se a ilha
 * chegar perto da tela (1500 px de folga) ou receber toque, tecla ou foco. O React só reencena cliques que chegam
 * DEPOIS de `hydrateRoot`; por isso o caminho normal é hidratar cedo, não esperar o toque.
 */
function hidratarSobDemanda(el: HTMLElement, carregar: () => Promise<React.ComponentType>) {
  let feito = false;
  const gatilhos = ["pointerdown", "keydown", "focusin"];
  const agora = () => {
    if (feito) return;
    feito = true;
    io.disconnect();
    for (const ev of gatilhos) el.removeEventListener(ev, agora, true);
    void carregar().then((C) => hidratar(el, C));
  };
  const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && agora(), { rootMargin: "1500px 0px" });
  io.observe(el);
  for (const ev of gatilhos) el.addEventListener(ev, agora, { capture: true });

  const ocioso = () => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(agora, { timeout: 2500 });
    else setTimeout(agora, 300);
  };
  if (document.readyState === "complete") ocioso();
  else window.addEventListener("load", ocioso, { once: true });
}

async function boot() {
  if (preRenderizado) {
    // Produção: a página já é HTML. O React hidrata só as ilhas com estado (docs/40 §16).
    container.querySelectorAll<HTMLElement>("[data-island]").forEach((el) => {
      const nome = el.dataset.island as IslandName;
      const agora = ILHAS_AGORA[nome];
      const depois = ILHAS_DEPOIS[nome];
      if (agora) hidratar(el, agora);
      else if (depois) hidratarSobDemanda(el, depois);
    });
  } else if (import.meta.env.DEV) {
    // Dev: sem pré-render, monta a página inteira (o import some do build de produção).
    const { Landing } = await import("./Landing");
    flushSync(() => createRoot(container).render(<StrictMode><Landing /></StrictMode>));
  }
  bootChrome();
  bootTracking();
  bootMotion();
}

void boot();

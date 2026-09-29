import { track, type TrackName } from "./track";

// Eventos locais que NÃO dependem de React (docs/40 §19): as seções estáticas não são hidratadas, então o clique é
// delegado no documento por atributos `data-track` (+ `data-cta` / `data-track-target`), e as seções vistas vêm de um
// IntersectionObserver. Continua sem rede, sem cookie e sem identificador.
export function bootTracking(): void {
  track("landing_view");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          track("section_view", { section: (e.target as HTMLElement).dataset.section });
          io.unobserve(e.target);
        }
      },
      { threshold: 0.5 },
    );
    document.querySelectorAll("[data-section]").forEach((el) => io.observe(el));
  }

  document.addEventListener("click", (e) => {
    const alvo = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
    if (!alvo) return;
    track(alvo.dataset.track as TrackName, {
      ...(alvo.dataset.cta ? { cta: alvo.dataset.cta } : {}),
      ...(alvo.dataset.trackTarget ? { target: alvo.dataset.trackTarget } : {}),
    });
  });
}

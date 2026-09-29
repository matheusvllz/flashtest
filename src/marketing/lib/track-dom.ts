import { track, type TrackName } from "./track";

// Eventos locais da landing (docs/40 §19): cliques por atributo `data-track` (+ `data-cta` / `data-track-target`),
// delegados no documento, e seções vistas por IntersectionObserver. Sem rede, sem cookie e sem identificador.
// Devolve a limpeza: a landing é uma rota do app e sai de cena quando o aluno entra no produto (docs/44 §3).
export function bootTracking(): () => void {
  track("landing_view");

  let io: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          track("section_view", { section: (e.target as HTMLElement).dataset.section });
          io?.unobserve(e.target);
        }
      },
      { threshold: 0.5 },
    );
    document.querySelectorAll(".lp-root [data-section]").forEach((el) => io!.observe(el));
  }

  const aoClicar = (e: MouseEvent) => {
    const alvo = (e.target as Element | null)?.closest<HTMLElement>(".lp-root [data-track]");
    if (!alvo) return;
    track(alvo.dataset.track as TrackName, {
      ...(alvo.dataset.cta ? { cta: alvo.dataset.cta } : {}),
      ...(alvo.dataset.trackTarget ? { target: alvo.dataset.trackTarget } : {}),
    });
  };
  document.addEventListener("click", aoClicar);

  return () => {
    io?.disconnect();
    document.removeEventListener("click", aoClicar);
  };
}

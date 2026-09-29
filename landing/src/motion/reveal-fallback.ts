// Revelação sem GSAP (docs/40 §13.4): IntersectionObserver marca [data-reveal] com .is-in quando o bloco entra.
// É a base de M-6, M-10, M-11 e M-12: o CSS (motion.css/components.css) faz o resto. Vale enquanto o chunk do
// GSAP não chegou, se ele falhar, ou se estiver bloqueado. Sem o observador, tudo aparece pronto.

let io: IntersectionObserver | null = null;

export function startRevealFallback(): void {
  const alvos = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (!("IntersectionObserver" in window)) {
    alvos.forEach((el) => el.classList.add("is-in"));
    return;
  }
  io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).classList.add("is-in");
        io?.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
  );
  alvos.forEach((el) => io!.observe(el));
}

export function stopRevealFallback(): void {
  io?.disconnect();
  io = null;
}

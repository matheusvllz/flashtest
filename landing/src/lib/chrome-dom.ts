// Comportamento da "moldura" da página (navbar e barra fixa do mobile) SEM React (docs/40 §16): essas duas peças não
// têm estado que precise de hidratação, então o HTML pré-renderizado basta e o JS só liga os atributos.
// IntersectionObserver e focusin/focusout, nunca listener de scroll.
export function bootChrome(): void {
  if (!("IntersectionObserver" in window)) return;

  // Navbar: ganha fundo e borda depois de 8 px de rolagem (sentinela no topo).
  const sentinela = document.getElementById("lp-sentinela");
  const header = document.querySelector<HTMLElement>("header.lp-nav");
  if (sentinela && header) {
    new IntersectionObserver(([e]) => {
      header.dataset.scrolled = String(!e.isIntersecting);
    }).observe(sentinela);
  }

  // Barra fixa do mobile: aparece depois que o CTA do hero sai da tela por cima e some (a) no fechamento e no rodapé,
  // (b) durante a demo, onde o CTA dela é o certo e dois botões azuis competiriam com "Verificar" (crítica R8), e
  // (c) enquanto o foco do teclado está nas Dúvidas, para nunca cobrir o item focado (docs/40 §11).
  const barra = document.getElementById("lp-sticky");
  const hero = document.getElementById("cta-hero");
  if (!barra) return;
  let passouHero = false;
  let noFim = false;
  let focoNasDuvidas = false;
  const atualizar = () => {
    const visivel = passouHero && !noFim && !focoNasDuvidas;
    barra.dataset.visible = String(visivel);
    barra.setAttribute("aria-hidden", String(!visivel));
    barra.toggleAttribute("inert", !visivel);
  };

  if (hero) {
    new IntersectionObserver(([e]) => {
      passouHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      atualizar();
    }).observe(hero);
  }
  const fim = ["tenta-uma", "fechamento", "rodape"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
  const noFimSet = new Set<Element>();
  const ioFim = new IntersectionObserver((entradas) => {
    for (const e of entradas) (e.isIntersecting ? noFimSet.add(e.target) : noFimSet.delete(e.target));
    noFim = noFimSet.size > 0;
    atualizar();
  });
  fim.forEach((el) => ioFim.observe(el));

  document.addEventListener("focusin", (e) => {
    focoNasDuvidas = e.target instanceof Element && !!e.target.closest("#duvidas");
    atualizar();
  });
  document.addEventListener("focusout", () => {
    focoNasDuvidas = false;
    atualizar();
  });
}

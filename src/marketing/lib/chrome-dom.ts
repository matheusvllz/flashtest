// Comportamento da "moldura" da landing (navbar e barra fixa do celular): IntersectionObserver e focusin/focusout,
// nunca listener de scroll. Devolve a limpeza (a landing é uma rota do app, docs/44 §3).
export function bootChrome(): () => void {
  if (!("IntersectionObserver" in window)) return () => {};
  const observadores: IntersectionObserver[] = [];
  const limpar: (() => void)[] = [];

  // Navbar: ganha fundo e borda depois de 8 px de rolagem (sentinela no topo).
  const sentinela = document.getElementById("lp-sentinela");
  const header = document.querySelector<HTMLElement>("header.lp-nav");
  if (sentinela && header) {
    const io = new IntersectionObserver(([e]) => {
      header.dataset.scrolled = String(!e.isIntersecting);
    });
    io.observe(sentinela);
    observadores.push(io);
  }

  // Barra fixa do celular: aparece depois que o CTA do hero sai da tela por cima e some (a) no fechamento e no rodapé,
  // (b) durante a demo, onde o CTA dela é o certo, (c) enquanto o foco do teclado está nas Dúvidas e (d) durante a
  // história presa (a legenda fica embaixo, onde a barra a cobriria; só no modo história).
  const barra = document.getElementById("lp-sticky");
  const hero = document.getElementById("cta-hero");
  if (barra) {
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
      const io = new IntersectionObserver(([e]) => {
        passouHero = !e.isIntersecting && e.boundingClientRect.top < 0;
        atualizar();
      });
      io.observe(hero);
      observadores.push(io);
    }
    const fim = ["como-funciona", "tenta-uma", "fechamento", "rodape"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const noFimSet = new Set<Element>();
    const ioFim = new IntersectionObserver((entradas) => {
      for (const e of entradas) (e.isIntersecting ? noFimSet.add(e.target) : noFimSet.delete(e.target));
      const html = document.documentElement;
      noFim = [...noFimSet].some((el) => el.id !== "como-funciona" || html.classList.contains("lp-story-on"));
      atualizar();
    });
    fim.forEach((el) => ioFim.observe(el));
    observadores.push(ioFim);

    const aoFocar = (e: FocusEvent) => {
      focoNasDuvidas = e.target instanceof Element && !!e.target.closest("#duvidas");
      atualizar();
    };
    const aoDesfocar = () => {
      focoNasDuvidas = false;
      atualizar();
    };
    document.addEventListener("focusin", aoFocar);
    document.addEventListener("focusout", aoDesfocar);
    limpar.push(() => {
      document.removeEventListener("focusin", aoFocar);
      document.removeEventListener("focusout", aoDesfocar);
    });
  }

  return () => {
    observadores.forEach((io) => io.disconnect());
    limpar.forEach((f) => f());
  };
}

import { useEffect, useLayoutEffect } from "react";
import { LP } from "./content/copy";
import { bootChrome } from "./lib/chrome-dom";
import { bootTracking } from "./lib/track-dom";
import { bootMotion } from "./motion/boot";
import { Closing } from "./sections/Closing";
import { Comeback } from "./sections/Comeback";
import { Errou } from "./sections/Errou";
import { Faq } from "./sections/Faq";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { Navbar } from "./sections/Navbar";
import { StickyCta } from "./sections/StickyCta";
import { Story } from "./sections/Story";
import { TheScene } from "./sections/TheScene";
import { TryOne } from "./sections/TryOne";

// useLayoutEffect no servidor avisa no console; no cliente liga as classes de movimento antes da primeira pintura.
const useEfeitoAntesDaPintura = typeof window === "undefined" ? useEffect : useLayoutEffect;

// A landing do Foca (docs/42, integrada ao app no docs/44): a dúvida do João, a semana dele, a história do produto,
// uma questão de verdade, o erro explicado, o recomeço, as dúvidas e o convite. É a rota `/` do app: HTML completo
// no servidor, React no cliente, movimento em GSAP carregado depois do `load` (motion/scroll.ts).
export function Landing() {
  useEfeitoAntesDaPintura(() => bootMotion(), []);
  useEffect(() => {
    const limparMoldura = bootChrome();
    const limparEventos = bootTracking();
    return () => {
      limparMoldura();
      limparEventos();
    };
  }, []);

  return (
    <div className="lp-root relative">
      <a href="#conteudo" className="lp-skip">
        {LP.a11y.skip}
      </a>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <TheScene />
        <Story />
        <TryOne />
        <Errou />
        <Comeback />
        <Faq />
        <Closing />
        <StickyCta />
      </main>
      <Footer />
    </div>
  );
}

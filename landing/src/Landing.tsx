import { Island } from "./components/Island";
import { LP } from "./content/copy";
import { Closing } from "./sections/Closing";
import { Comeback } from "./sections/Comeback";
import { Faq } from "./sections/Faq";
import { FocaAndHonesty } from "./sections/FocaAndHonesty";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { HowItWorks } from "./sections/HowItWorks";
import { Navbar } from "./sections/Navbar";
import { StickyCta } from "./sections/StickyCta";
import { TheScene } from "./sections/TheScene";
import { TryOne } from "./sections/TryOne";
import { WhatYouHave } from "./sections/WhatYouHave";

// Composição da página. Ordem das seções: docs/40 §11. Cada seção responde a uma pergunta do João.
// As <Island> são os únicos trechos hidratados no cliente (src/islands.tsx); o resto é HTML estático.
export function Landing() {
  return (
    <div className="relative">
      <a href="#conteudo" className="lp-skip">
        {LP.a11y.skip}
      </a>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <TheScene />
        <Island name="como-funciona">
          <HowItWorks />
        </Island>
        <Island name="tenta-uma">
          <TryOne />
        </Island>
        <Comeback />
        <WhatYouHave />
        <FocaAndHonesty />
        <Island name="duvidas">
          <Faq />
        </Island>
        <Closing />
        <StickyCta />
      </main>
      <Footer />
    </div>
  );
}

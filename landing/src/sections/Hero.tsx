import type { CSSProperties } from "react";
import { CtaButton } from "../components/CtaButton";
import { FocaMark } from "../components/FocaMark";
import { MarginNote } from "../components/MarginNote";
import { PhoneFrame } from "../components/PhoneFrame";
import { ProductShot } from "../components/ProductShot";
import { HighlightStroke } from "../components/doodles";
import { LP } from "../content/copy";

const iv = (n: number) => ({ ["--i" as string]: n }) as CSSProperties;

// S-1 Hero. Pergunta do João: "O que é isso e por que eu ligaria?". Quatro elementos de texto (eyebrow, H1,
// subtítulo, CTA) mais a linha de risco do CTA. Entrada em CSS puro: funciona antes da hidratação.
export function Hero() {
  return (
    <section id="topo" data-section="hero" aria-labelledby="hero-titulo" className="relative">
      <div className="lp-container grid gap-10 pb-0 pt-8 md:pt-12 lg:min-h-[min(860px,calc(100dvh-var(--lp-nav-h)))] lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-12 lg:pt-8">
        <div className="lg:col-span-7">
          <p className="lp-label lp-enter" style={iv(0)}>
            {LP.hero.eyebrow}
          </p>
          <h1 id="hero-titulo" className="lp-display-xl mt-4 max-w-[16ch] text-foreground">
            <span className="lp-enter-h1 block" style={iv(1)}>
              {LP.hero.linha1}
            </span>{" "}
            <span className="lp-enter-h1 block" style={iv(2)}>
              {LP.hero.linha2Antes}
              <HighlightStroke>{LP.hero.tituloDestaque}</HighlightStroke>
            </span>
          </h1>
          <p className="lp-lead lp-enter mt-5 max-w-[34ch] text-foreground sm:max-w-[40ch]" style={iv(4)}>
            {LP.hero.subtitulo}
          </p>
          <div className="lp-enter mt-7 max-w-sm" style={iv(5)}>
            <CtaButton id="cta-hero" label={LP.hero.cta} evento="hero_cta_click" cta="hero" block className="sm:w-auto sm:min-w-56" />
            <p className="lp-small mt-3 text-nevoa">{LP.hero.risco}</p>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="lp-pauta card-soft relative mx-auto max-w-md rounded-3xl px-6 pb-0 pt-16 sm:px-10 lg:max-w-none">
            <PhoneFrame cut="bottom" className="lp-enter-phone relative mx-auto w-full max-w-[300px]">
              <ProductShot id="hero-atividade" alt={LP.hero.fotoAlt} priority sizes="(min-width: 1024px) 300px, 80vw" />
            </PhoneFrame>
            <MarginNote className="absolute left-5 top-3 sm:left-8">{LP.hero.anotacao}</MarginNote>
            <div className="absolute -left-2 bottom-0 sm:left-2">
              <FocaMark size={88} motion="pop" eager />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

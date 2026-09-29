import type { CSSProperties } from "react";
import { CtaButton } from "../components/CtaButton";
import { MarginNote } from "../components/MarginNote";
import { MockPhone } from "../components/MockPhone";
import { TelaAtividade } from "../components/app/screens";
import { HighlightStroke } from "../components/doodles";
import { HERO } from "../content/copy";

const iv = (n: number) => ({ ["--i" as string]: n }) as CSSProperties;

/** Onde cada bilhete pousa em volta do celular (% da mesa) e com que inclinação. Os dois primeiros aparecem no celular. */
const POUSO = [
  { x: "-3%", y: "44%", r: "-7deg" },
  { x: "74%", y: "6%", r: "5deg" },
  { x: "2%", y: "76%", r: "4deg" },
  { x: "76%", y: "60%", r: "-5deg" },
];

// S-1 Hero (docs/42 §4). Em 5 segundos: é um app de ENEM, fala da dúvida do João, promete o próximo passo escolhido,
// mostra a tela real e tem uma ação. HM-1: entrada em CSS puro (funciona antes de qualquer JS), os bilhetes do
// material pousam em volta e, na tela, a Foca aparece com o motivo.
export function Hero() {
  return (
    <section id="topo" data-section="hero" aria-labelledby="hero-titulo" className="relative">
      <div className="lp-container grid gap-10 pb-0 pt-8 md:pt-12 lg:min-h-[min(820px,calc(100dvh-var(--lp-nav-h)))] lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-10 lg:pt-6">
        <div className="lg:col-span-7">
          <p className="lp-label lp-enter" style={iv(0)}>
            {HERO.eyebrow}
          </p>
          <h1 id="hero-titulo" className="lp-display-xl mt-4 max-w-[13ch] text-foreground lg:max-w-[20ch]">
            <span className="lp-enter-h1 block" style={iv(1)}>
              {HERO.pergunta}
            </span>{" "}
            <span className="lp-enter-h1 block" style={iv(3)}>
              {HERO.respostaAntes}
              <HighlightStroke>{HERO.respostaDestaque}</HighlightStroke>
            </span>
          </h1>
          <p className="lp-lead lp-enter mt-6 max-w-[36ch] text-foreground sm:max-w-[42ch]" style={iv(4)}>
            {HERO.subtitulo}
          </p>
          <div className="lp-enter mt-8 max-w-sm" style={iv(5)}>
            <CtaButton id="cta-hero" label={HERO.cta} evento="hero_cta_click" cta="hero" block className="sm:w-auto sm:min-w-60" />
            <p className="lp-small mt-3 text-nevoa">{HERO.apoio}</p>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="lp-desk lp-pauta relative mx-auto max-w-lg overflow-hidden rounded-[var(--radius-3xl)] px-6 pt-14 sm:px-12 lg:max-w-none">
            {HERO.bilhetes.map((b, i) => (
              <span
                key={b}
                aria-hidden="true"
                className={["lp-bilhete lp-hero-bilhete", i >= 2 ? "max-sm:hidden" : ""].join(" ").trim()}
                style={{ ["--x" as string]: POUSO[i].x, ["--y" as string]: POUSO[i].y, ["--r" as string]: POUSO[i].r, ["--i" as string]: i } as CSSProperties}
              >
                {b}
              </span>
            ))}
            <MockPhone cut="bottom" className="lp-enter-phone lp-hero-phone relative mx-auto w-full max-w-[300px]">
              <div role="img" aria-label={HERO.telaAria} className="absolute inset-0">
                <TelaAtividade eager />
              </div>
            </MockPhone>
            <MarginNote className="lp-hero-nota absolute hidden sm:block">{HERO.anotacao}</MarginNote>
          </div>
        </div>
      </div>
    </section>
  );
}

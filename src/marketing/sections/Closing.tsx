import { CtaButton } from "../components/CtaButton";
import { FocaTroca } from "../components/FocaTroca";
import { HighlightStroke } from "../components/doodles";
import { FECHAMENTO } from "../content/copy";

// S-8 Fechamento: folha em branco, o mesmo marca-texto da abertura (rima visual) e a única piada da página.
// O marca-texto e a Foca entram quando a folha aparece (data-reveal), não no load: aqui embaixo ninguém veria.
export function Closing() {
  return (
    <section id="fechamento" data-section="fechamento" aria-labelledby="fechamento-titulo" className="lp-pauta py-[var(--lp-section-y)]">
      <div className="lp-container">
        <div data-reveal className="lp-fechamento card-soft mx-auto max-w-4xl rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
          <h2 id="fechamento-titulo" className="lp-display-xl mx-auto max-w-[15ch]">
            {FECHAMENTO.tituloAntes}
            <HighlightStroke gatilho="reveal">{FECHAMENTO.tituloDestaque}</HighlightStroke>
          </h2>
          <p className="lp-lead mt-5 text-foreground">{FECHAMENTO.corpo}</p>
          <div className="mx-auto mt-8 max-w-sm">
            <CtaButton id="cta-final" label={FECHAMENTO.cta} evento="final_cta_click" cta="final" block />
            <p className="lp-small mt-3 text-nevoa">{FECHAMENTO.apoio}</p>
          </div>

          <div className="mt-12 flex items-end justify-center gap-3">
            <span className="lp-fechamento__foca">
              {/* Chega neutra e, quando a folha aparece, abre o sorriso do convite (docs/44 §6). */}
              <FocaTroca de="neutra" para="acolhedora" size={112} gatilho="revelar" />
            </span>
            <div className="lp-fechamento__fala relative mb-6 max-w-[15rem] rounded-[var(--radius-card)] border-2 border-gelo bg-cards px-4 py-3 text-left">
              <span className="absolute -left-[9px] bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-gelo bg-cards" aria-hidden="true" />
              <p className="lp-body">{FECHAMENTO.falaFoca}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

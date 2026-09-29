import { CtaButton } from "../components/CtaButton";
import { FocaMark } from "../components/FocaMark";
import { HighlightStroke } from "../components/doodles";
import { LP } from "../content/copy";

// S-9 Fechamento: folha em branco, o mesmo marca-texto da abertura (rima visual) e a única piada da página.
export function Closing() {
  return (
    <section id="fechamento" data-section="fechamento" aria-labelledby="fechamento-titulo" className="lp-pauta py-[var(--lp-section-y)]">
      <div className="lp-container">
        <div data-reveal className="card-soft mx-auto max-w-4xl rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
          <h2 id="fechamento-titulo" className="lp-display-xl mx-auto max-w-[14ch]">
            {LP.fechamento.tituloAntes}
            <HighlightStroke delay="0.2s">{LP.fechamento.tituloDestaque}</HighlightStroke>
          </h2>
          <p className="lp-lead mt-5 text-foreground">{LP.fechamento.corpo}</p>
          <div className="mx-auto mt-8 max-w-sm">
            <CtaButton id="cta-final" label={LP.fechamento.cta} evento="final_cta_click" cta="final" block />
            <p className="lp-small mt-3 text-nevoa">{LP.fechamento.risco}</p>
          </div>

          <div className="mt-12 flex items-end justify-center gap-3">
            <FocaMark size={112} />
            <div className="relative mb-6 max-w-[15rem] rounded-[var(--radius-card)] border-2 border-gelo bg-cards px-4 py-3 text-left">
              <span className="absolute -left-[9px] bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-gelo bg-cards" aria-hidden="true" />
              <p className="lp-body">{LP.fechamento.falaFoca}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

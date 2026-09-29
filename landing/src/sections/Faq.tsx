import { ChevronDown } from "lucide-react";
import { FAQ } from "../content/copy";
import { track } from "../lib/track";

// S-8 Dúvidas: <details>/<summary> nativo (funciona sem JS e com teclado). Só as objeções reais do João (docs/40 §7).
export function Faq() {
  return (
    <section id="duvidas" data-section="duvidas" aria-labelledby="duvidas-titulo" className="py-[var(--lp-section-y)]">
      <div className="lp-container">
        <div className="mx-auto max-w-[45rem]">
          <h2 id="duvidas-titulo" className="lp-display-l">
            {FAQ.titulo}
          </h2>
          <div className="mt-[var(--lp-section-gap)]">
            {FAQ.itens.map((q) => (
              <details key={q.id} className="lp-faq border-b-2 border-gelo" onToggle={(e) => e.currentTarget.open && track("faq_open", { id: q.id })}>
                <summary className="flex min-h-14 items-center justify-between gap-4 py-4">
                  <h3 className="lp-title">{q.p}</h3>
                  <ChevronDown size={22} strokeWidth={2} className="lp-faq__chev shrink-0 text-abismo" aria-hidden="true" />
                </summary>
                <p className="lp-body max-w-[60ch] pb-5 text-foreground">{q.r}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

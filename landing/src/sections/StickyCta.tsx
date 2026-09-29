import { CtaButton } from "../components/CtaButton";
import { STICKY } from "../content/copy";

// CTA fixo no mobile (< 768 px). Markup estático: quem o mostra e esconde é lib/chrome-dom.ts (sem React, docs/40 §16).
// Começa escondido e inerte, então nada de foco nele antes de aparecer.
export function StickyCta() {
  return (
    <div id="lp-sticky" className="lp-sticky" data-visible="false" aria-hidden="true" inert>
      <CtaButton label={STICKY.cta} evento="sticky_cta_click" cta="sticky" block />
    </div>
  );
}

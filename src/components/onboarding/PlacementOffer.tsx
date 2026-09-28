import { COPY } from "@/lib/copy";

/**
 * Oferta de nivelamento (docs/30 §12.1/§12.5, Fase 13 do docs/31 F13.2) —
 * último passo do quiz quando `FEATURES.nivelamento` está ligada. Copy
 * candidata do `30` §12.2, já registrada no `docs/21`.
 */
export function PlacementOffer({ onFazer, onPular }: { onFazer: () => void; onPular: () => void }) {
  return (
    <div>
      <div className="ds-label">{COPY.onboarding.blocoVoce}</div>
      <h2 className="mt-2.5 font-display text-[28px] font-bold leading-tight text-abismo">
        {COPY.onboarding.ofertaTitulo}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-nevoa">{COPY.onboarding.ofertaCorpo}</p>
      <div className="mt-6 flex flex-col gap-2.5">
        <button onClick={onFazer} className="btn-primary w-full">
          {COPY.onboarding.ofertaCtaPrimario}
        </button>
        <button onClick={onPular} className="btn-outline w-full">
          {COPY.onboarding.ofertaCtaSecundario}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-nevoa">{COPY.onboarding.ofertaRodape}</p>
    </div>
  );
}

import { COPY } from "@/lib/copy";

/**
 * Tela de entrada do checkpoint (docs/30 §13.3/§13.6, Fase 14 do docs/31
 * F14.4) — sem Foca, sem escada, direto ao ponto. "Agora não" adia a
 * atividade (volta pra trilha sem responder nada; `completeJourneyActivity`
 * não é chamado, então nada é descontado — o checkpoint volta no próximo
 * plano, como já é o comportamento padrão de uma comprometida não iniciada).
 */
export function CheckpointIntro({
  onComecar,
  onAgoraNao,
}: {
  onComecar: () => void;
  onAgoraNao: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-neve px-6">
      <p className="ds-label">{COPY.checkpoint.tituloRota}</p>
      <h1 className="mt-2.5 font-display text-[28px] font-bold leading-tight text-abismo">
        {COPY.checkpoint.introTitulo}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-nevoa">{COPY.checkpoint.introCorpo}</p>
      <div className="mt-8 flex flex-col gap-2.5">
        <button onClick={onComecar} className="btn-primary w-full">
          {COPY.checkpoint.comecar}
        </button>
        <button
          onClick={onAgoraNao}
          className="text-center text-sm font-semibold text-nevoa underline"
        >
          {COPY.checkpoint.agoraNao}
        </button>
      </div>
    </div>
  );
}

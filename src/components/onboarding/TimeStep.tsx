import { setDailyMinutes, useAppState } from "@/lib/store";
import { COPY } from "@/lib/copy";

const OPCOES = [5, 10, 15, 20, 30] as const;

/** "Seu ritmo" — minutos por dia (docs/30 §12.2, Fase 13 do docs/31 F13.1). Padrão 10, já setado no store. */
export function TimeStep() {
  const s = useAppState();
  const minutos = s.prefs.dailyMinutes;

  return (
    <div>
      <div className="ds-label">{COPY.onboarding.blocoSeuRitmo}</div>
      <h2 className="mt-2.5 font-display text-[28px] font-bold leading-tight text-abismo">
        {COPY.onboarding.tempoTitulo}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-nevoa">{COPY.onboarding.tempoHint}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {OPCOES.map((n) => (
          <button
            key={n}
            onClick={() => setDailyMinutes(n)}
            className={`chip font-mono ${minutos === n ? "chip-on" : ""}`}
          >
            {n} min
          </button>
        ))}
      </div>
    </div>
  );
}

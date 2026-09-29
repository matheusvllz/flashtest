import { Check, Snowflake } from "lucide-react";
import { LP } from "../content/copy";

type Dia = { estado: "estudou" | "congelado" | "futuro" };

// Diagrama ilustrativo, NÃO dado de aluno: três dias de estudo, um dia coberto pelo congelamento, a volta.
const SEMANA: Dia[] = [{ estado: "estudou" }, { estado: "estudou" }, { estado: "estudou" }, { estado: "congelado" }, { estado: "estudou" }, { estado: "futuro" }, { estado: "futuro" }];

// S-5 Parou uns dias? Pergunta do João: "E quando eu largar?". Sem humor, sem cobrança, sem "dias perdidos".
export function Comeback() {
  return (
    <section data-section="recomeco" aria-labelledby="recomeco-titulo" className="py-[var(--lp-section-y)]">
      <div className="lp-container grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-5">
          <h2 id="recomeco-titulo" className="lp-display-l max-w-[18ch]">
            {LP.recomeco.titulo}
          </h2>
          <p className="lp-lead mt-5 max-w-[46ch] text-foreground">{LP.recomeco.corpo}</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" data-reveal>
          <div className="card-soft rounded-3xl p-5 sm:p-7" role="img" aria-label={LP.recomeco.calendarioAria}>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3" aria-hidden="true">
              {LP.recomeco.diasSemana.map((d, i) => (
                <div key={d} className="text-center">
                  <p className="lp-data text-[0.6875rem] uppercase text-nevoa sm:text-xs">{d}</p>
                  <div className="lp-cal-day mt-2" data-estado={SEMANA[i].estado}>
                    {SEMANA[i].estado === "estudou" && <Check size={20} strokeWidth={3} className="text-abismo" />}
                    {SEMANA[i].estado === "congelado" && <Snowflake size={22} strokeWidth={2} className="text-abismo lp-cal-pop" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3" aria-hidden="true">
              <span className="chip">
                <Snowflake size={14} strokeWidth={2.5} />
                {LP.recomeco.congelamento}
              </span>
              <span className="lp-data lp-cal-bump inline-flex items-center rounded-full px-3 py-1.5 text-sm" style={{ background: "var(--color-recompensa)", color: "var(--on-alert)" }}>
                {LP.recomeco.chip}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

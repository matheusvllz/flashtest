import { Snowflake } from "lucide-react";
import { FocaTroca } from "../components/FocaTroca";
import { PencilCheck } from "../components/doodles";
import { RECOMECO } from "../content/copy";

type Dia = { estado: "estudou" | "congelado" | "futuro" };

// Diagrama ilustrativo, NÃO dado de aluno: três dias de estudo, um dia coberto pelo congelamento, a volta.
const SEMANA: Dia[] = [{ estado: "estudou" }, { estado: "estudou" }, { estado: "estudou" }, { estado: "congelado" }, { estado: "estudou" }, { estado: "futuro" }, { estado: "futuro" }];

// S-6 Parou uns dias? Pergunta do João: "E quando eu largar?". Sem humor, sem cobrança, sem "dias perdidos" (14 §6).
// Com movimento, o scroll escreve a semana: três checks, o dia parado vazio, o congelamento cobre, a volta (scroll.ts).
export function Comeback() {
  return (
    <section data-section="recomeco" aria-labelledby="recomeco-titulo" className="py-[var(--lp-section-y)]">
      <div className="lp-container grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-5">
          <h2 id="recomeco-titulo" className="lp-display-l max-w-[16ch]">
            {RECOMECO.titulo}
          </h2>
          <p className="lp-lead mt-6 max-w-[40ch] text-foreground">{RECOMECO.corpo}</p>
          <p className="lp-body mt-4 max-w-[46ch] text-foreground">{RECOMECO.fatos}</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="lp-cal card-soft rounded-3xl p-5 sm:p-7" role="img" aria-label={RECOMECO.calendarioAria}>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3" aria-hidden="true">
              {RECOMECO.diasSemana.map((d, i) => (
                <div key={d} className="text-center">
                  <p className="lp-data text-[0.6875rem] uppercase text-nevoa sm:text-xs">{d}</p>
                  <div className="lp-cal-day mt-2" data-estado={SEMANA[i].estado} data-dia={i}>
                    {SEMANA[i].estado === "estudou" && <PencilCheck draw="none" className="h-6 w-7" />}
                    {SEMANA[i].estado === "congelado" && (
                      <>
                        <span className="lp-cal-day__cobre" />
                        <Snowflake size={22} strokeWidth={2} className="lp-cal-floco relative text-abismo" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3" aria-hidden="true">
              <span className="chip lp-cal-legenda">
                <Snowflake size={14} strokeWidth={2.5} />
                {RECOMECO.congelamento}
              </span>
              <span className="lp-data lp-cal-chip inline-flex items-center rounded-full px-3 py-1.5 text-sm" style={{ background: "var(--alert)", color: "var(--on-alert)" }}>
                {RECOMECO.chip}
              </span>
              {/* Voltou depois de parar: a Foca acolhe (docs/15 §4, a única cara permitida no retorno). */}
              <FocaTroca de="neutra" para="acolhedora" size={40} className="lp-cal-foca ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

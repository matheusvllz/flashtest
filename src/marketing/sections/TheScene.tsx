import { NotebookPen, Smartphone } from "lucide-react";
import { PencilCheck, PencilHalfCheck } from "../components/doodles";
import { SEMANA } from "../content/copy";

type Estado = "novo" | "feito" | "metade" | "vazio" | "feed";

function Glifo({ estado }: { estado: Estado }) {
  if (estado === "novo") return <NotebookPen size={28} strokeWidth={2} className="lp-week__ico text-abismo" aria-hidden="true" />;
  if (estado === "feito") return <PencilCheck draw="none" className="h-7 w-8" />;
  if (estado === "metade") return <PencilHalfCheck draw="none" className="h-7 w-8" />;
  if (estado === "feed") return <Smartphone size={26} strokeWidth={2} className="lp-week__ico text-nevoa" aria-hidden="true" />;
  return <span className="block h-7 w-8" aria-hidden="true" />;
}

// S-2 A semana (docs/42 §4). Pergunta do João: "Eles entendem como eu estudo?". Sem culpa, sem vermelho: uma semana
// em que os dias vão ficando vazios e a sexta termina no feed (14 §2). Com movimento, a semana é escrita conforme o
// scroll avança e desfeita quando ele volta (scroll.ts, M-Semana). Sem movimento, ela aparece pronta.
export function TheScene() {
  return (
    <section data-section="cena" aria-labelledby="cena-titulo" className="py-[var(--lp-section-y)]">
      <div className="lp-container">
        <h2 id="cena-titulo" className="lp-display-l max-w-[22ch] lg:max-w-[26ch]">
          {SEMANA.titulo}
        </h2>

        <ol aria-label={SEMANA.semanaAria} className="lp-week mt-[var(--lp-section-gap)]">
          {SEMANA.dias.map((d) => (
            <li key={d.dia} className="lp-day" data-estado={d.estado}>
              <span className="lp-data lp-day__dia">{d.dia}</span>
              <span className="lp-day__glifo">
                <Glifo estado={d.estado as Estado} />
              </span>
              <span className={d.estado === "vazio" ? "lp-hand lp-day__nota lp-day__nota--mao" : "lp-small lp-day__nota"}>{d.nota}</span>
            </li>
          ))}
        </ol>

        <div className="mt-[var(--lp-section-gap)] grid gap-5 lg:grid-cols-12">
          <p className="lp-lead text-foreground lg:col-span-6 lg:col-start-3">{SEMANA.corpo}</p>
          <p className="lp-title text-foreground lg:col-span-4" data-reveal>
            {SEMANA.ponte}
          </p>
        </div>
      </div>
    </section>
  );
}

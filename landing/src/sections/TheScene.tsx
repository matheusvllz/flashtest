import { NotebookPen } from "lucide-react";
import { PencilCheck, PencilHalfCheck } from "../components/doodles";
import { LP } from "../content/copy";

type Estado = "novo" | "feito" | "metade" | "vazio";

function Glifo({ estado, atraso }: { estado: Estado; atraso: string }) {
  if (estado === "novo") return <NotebookPen size={28} strokeWidth={2} className="text-abismo" aria-hidden="true" />;
  if (estado === "feito") return <PencilCheck className="h-7 w-8" delay={atraso} />;
  if (estado === "metade") return <PencilHalfCheck className="h-7 w-8" delay={atraso} />;
  return <span className="block h-7 w-8" aria-hidden="true" />;
}

// S-2 A cena. Pergunta do João: "Eles entendem como eu estudo?". Sem culpa, sem vermelho, sem ícone triste:
// só uma semana em que os dias vão ficando vazios. O silêncio de quarta e quinta é o ponto (não animam).
export function TheScene() {
  return (
    <section data-section="cena" aria-labelledby="cena-titulo" className="py-[var(--lp-section-y)]">
      <div className="lp-container">
        <h2 id="cena-titulo" className="lp-display-l max-w-[22ch] lg:max-w-[26ch]">
          {LP.cena.titulo}
        </h2>

        <ol
          aria-label={LP.cena.semanaAria}
          data-reveal
          className="mt-[var(--lp-section-gap)] grid gap-3 md:grid-cols-5 lg:ml-[calc(100%/12*2)]"
        >
          {LP.cena.dias.map((d, i) => (
            <li
              key={d.dia}
              className="lp-day flex flex-wrap items-center gap-x-4 gap-y-1 p-4 md:flex-col md:flex-nowrap md:items-start md:gap-3 md:p-5"
              data-estado={d.estado === "vazio" ? "vazio" : "cheio"}
            >
              <span className="lp-data min-w-10 text-sm uppercase text-nevoa md:min-w-0">{d.dia}</span>
              <span className="md:h-10 md:flex md:items-center">
                <Glifo estado={d.estado as Estado} atraso={`${0.15 + i * 0.12}s`} />
              </span>
              <span className="lp-small text-foreground">{d.nota}</span>
            </li>
          ))}
        </ol>

        <div className="mt-[var(--lp-section-gap)] max-w-2xl lg:ml-[calc(100%/12*2)]">
          <p className="lp-lead text-foreground">{LP.cena.corpo}</p>
          <p className="lp-title mt-5 text-foreground">{LP.cena.ponte}</p>
        </div>
      </div>
    </section>
  );
}

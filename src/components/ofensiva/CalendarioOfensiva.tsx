import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

function diasNoMes(mes: string): number {
  const [a, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(a, m, 0)).getUTCDate();
}

/** 0 = domingo. */
function diaDaSemana(dia: string): number {
  return new Date(`${dia}T12:00:00Z`).getUTCDay();
}

function mesAnterior(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 2, 1));
  return d.toISOString().slice(0, 7);
}

function mesSeguinte(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(a, m, 1));
  return d.toISOString().slice(0, 7);
}

/**
 * Calendário da ofensiva (spec 50 §5.2.3): dia estudado (preenchido), dia coberto por protetor (escudo), hoje
 * (contorno). Cor nunca é o único sinal: cada dia tem rótulo acessível e o protegido tem ícone.
 */
export function CalendarioOfensiva({
  mes,
  hoje,
  estudados,
  protegidos,
  podeVoltar,
  onMes,
}: {
  mes: string;
  hoje: string;
  estudados: readonly string[];
  protegidos: readonly string[];
  podeVoltar: boolean;
  onMes: (mes: string) => void;
}) {
  const t = COPY.ofensiva.calendario;
  const est = new Set(estudados);
  const prot = new Set(protegidos);
  const total = diasNoMes(mes);
  const vazios = diaDaSemana(`${mes}-01`);
  const podeAvancar = mes < hoje.slice(0, 7);
  const [ano, m] = mes.split("-").map(Number);
  const titulo = new Date(Date.UTC(ano, m - 1, 15)).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <section aria-label={t.titulo} data-testid="calendario-ofensiva">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="grid h-11 w-11 place-items-center text-nevoa disabled:opacity-30"
          onClick={() => onMes(mesAnterior(mes))}
          disabled={!podeVoltar}
          aria-label={t.anterior}
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-display text-sm font-bold capitalize text-abismo">{titulo}</p>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center text-nevoa disabled:opacity-30"
          onClick={() => onMes(mesSeguinte(mes))}
          disabled={!podeAvancar}
          aria-label={t.seguinte}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-nevoa" aria-hidden>
        {t.semana.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <ol className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: vazios }, (_, i) => (
          <li key={`v${i}`} aria-hidden />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const dia = `${mes}-${String(i + 1).padStart(2, "0")}`;
          const estudou = est.has(dia);
          const protegido = prot.has(dia);
          const ehHoje = dia === hoje;
          return (
            <li
              key={dia}
              aria-label={t.diaAria(i + 1, estudou ? "estudou" : protegido ? "protegido" : dia > hoje ? "futuro" : "sem")}
              data-estado={estudou ? "estudou" : protegido ? "protegido" : "sem"}
              className={cn(
                "relative grid aspect-square place-items-center rounded-full text-[12px] font-bold",
                estudou ? "bg-brasa text-on-alert" : "text-abismo",
                ehHoje && "ring-2 ring-mar ring-offset-1 ring-offset-cards",
                dia > hoje && "text-nevoa/50",
              )}
            >
              {protegido && !estudou ? <Shield size={14} strokeWidth={2.5} className="text-nevoa" aria-hidden /> : i + 1}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

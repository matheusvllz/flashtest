import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Flame, Trophy, ArrowUp, ArrowDown } from "lucide-react";
import { AppShell, Bolt } from "@/components/AppShell";
import { TURMA, LIGA, type Colega } from "@/data/ranking";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ranking")({ component: Ranking, ssr: false });

function Ranking() {
  const s = useAppState();
  const firstName = (s.prefs.name || "Você").split(" ")[0];

  // O aluno entra na turma com o XP REAL dele e é ordenado junto — a posição
  // não é decorativa: estudar de verdade sobe no ranking na frente da banca.
  const linhas = useMemo(() => {
    const eu: Colega & { eu: boolean } = {
      id: "eu",
      nome: firstName,
      xp: s.progress.xp,
      streak: s.progress.streak,
      iniciais: firstName.slice(0, 2).toUpperCase(),
      eu: true,
    };
    return [...TURMA.map((c) => ({ ...c, eu: false })), eu].sort((a, b) => b.xp - a.xp);
  }, [s.progress.xp, s.progress.streak, firstName]);

  const minhaPos = linhas.findIndex((l) => l.eu) + 1;
  const acima = linhas[minhaPos - 2];
  const faltam = acima ? acima.xp - s.progress.xp : 0;

  return (
    <AppShell>
      <div className="bg-navy px-5 pt-8 pb-6 text-white">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-yellow" />
          <p className="ds-label" style={{ color: "#FEB803" }}>
            {LIGA.nome} · esta semana
          </p>
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold">Você está em {minhaPos}º</h1>
        <p className="mt-1 text-sm text-navy-mist">
          {faltam > 0
            ? `Faltam ${faltam} XP para passar ${acima.nome.split(" ")[0]}.`
            : "Ninguém na sua frente. Segure a liderança até domingo."}
        </p>
        <p className="mt-3 text-[11px] font-semibold text-navy-mist">{LIGA.descricao}</p>
      </div>

      <ul className="bg-cloud px-5 py-4 space-y-2">
        {linhas.map((c, i) => {
          const pos = i + 1;
          const sobe = pos <= LIGA.sobeAte;
          const cai = pos >= LIGA.caiApartirDe;
          return (
            <li
              key={c.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
                c.eu ? "border-yellow bg-yellow/10" : "border-mist bg-white",
              )}
            >
              <span
                className={cn(
                  "w-6 shrink-0 text-center font-display text-sm font-bold tabular-nums",
                  sobe ? "text-success" : cai ? "text-error" : "text-navy-2",
                )}
              >
                {pos}
              </span>

              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-xs font-bold",
                  c.eu ? "bg-navy text-yellow" : "bg-mist text-navy",
                )}
              >
                {c.iniciais}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-navy">
                  {c.nome}
                  {c.eu && <span className="ml-1.5 text-[11px] text-gold-dark">você</span>}
                </p>
                <p className="flex items-center gap-1 text-[11px] font-semibold text-navy-2">
                  <Flame size={11} /> {c.streak} dias
                </p>
              </div>

              {sobe && (
                <ArrowUp size={14} className="shrink-0 text-success" aria-label="Sobe de liga" />
              )}
              {cai && (
                <ArrowDown size={14} className="shrink-0 text-error" aria-label="Cai de liga" />
              )}

              <span className="flex shrink-0 items-center gap-1 font-display text-sm font-bold text-navy tabular-nums">
                <Bolt size={13} />
                {c.xp}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="px-5 pb-4 text-center text-[11px] leading-relaxed text-navy-2">
        Turma de demonstração. O seu XP é real — ele sobe a cada aula de 60s e a cada lição de
        redação que você conclui.
      </p>
    </AppShell>
  );
}

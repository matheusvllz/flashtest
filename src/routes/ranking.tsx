import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
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
      <div className="bg-neve px-5 pt-8 pb-6">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-mar-fundo" />
          <p className="ds-label">{LIGA.nome} · esta semana</p>
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold text-abismo">
          Você está em <span className="font-mono">{minhaPos}º</span>
        </h1>
        <p className="mt-1 text-sm text-nevoa">
          {faltam > 0
            ? `Faltam ${faltam} XP para passar ${acima.nome.split(" ")[0]}.`
            : "Ninguém na sua frente. Segure a liderança até domingo."}
        </p>
        <p className="mt-3 text-[11px] font-semibold text-nevoa">{LIGA.descricao}</p>
      </div>

      <div className="bg-neve px-5 py-4">
        <ul className="card-soft divide-y divide-gelo overflow-hidden">
          {linhas.map((c, i) => {
            const pos = i + 1;
            const sobe = pos <= LIGA.sobeAte;
            const cai = pos >= LIGA.caiApartirDe;
            const corBorda = c.eu
              ? "var(--color-mar)"
              : sobe
                ? "var(--color-mar)"
                : cai
                  ? "var(--color-gelo)"
                  : "transparent";
            return (
              <li
                key={c.id}
                className={cn("flex items-center gap-3 border-l-4 px-3 py-3", c.eu && "bg-mar/8")}
                style={{ borderLeftColor: corBorda }}
              >
                <span className="w-6 shrink-0 text-center font-mono text-sm font-bold text-nevoa">
                  {pos}
                </span>

                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gelo font-display text-xs font-bold text-abismo">
                  {c.iniciais}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-abismo">
                    {c.nome}
                    {c.eu && <span className="ml-1.5 text-[11px] text-mar-fundo">você</span>}
                  </p>
                  <p className="text-[11px] font-semibold text-nevoa">
                    {c.streak} dias · {sobe ? "sobe de liga" : cai ? "cai de liga" : ""}
                  </p>
                </div>

                <span className="shrink-0 font-mono text-sm font-bold text-abismo tabular-nums">
                  {c.xp} XP
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="px-5 pb-4 text-center text-[11px] leading-relaxed text-nevoa">
        Turma de demonstração. O seu XP é real — ele sobe a cada aula de 60s e a cada lição de
        redação que você conclui.
      </p>
    </AppShell>
  );
}

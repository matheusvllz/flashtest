import { FocaSays } from "@/components/brand/FocaSays";
import { GoalRing } from "@/components/ds/GoalRing";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { atividadeHoje, diasSemAtividade, nivelDeXp, type AppState } from "@/lib/store";

/**
 * Cabeçalho da trilha/home (docs/25 §12.1, §18 T-17) — lógica de
 * `foca`/`nivel`/`streak`/`GoalRing` copiada do hero atual de `dashboard.tsx`
 * (mesmos gatilhos: acolhedora tem prioridade sobre tudo, meta fechada é o
 * segundo pico, senão bom-dia — docs/15 §3.2). A diferença pro dashboard é só
 * de layout: aqui não tem "Bom dia, {nome}" separado (a fala da Foca já
 * cumpre esse papel) e o `GoalRing` mora na mesma linha do streak/nível
 * (§12.1: "streak · GoalRing size={56} · barra de nível").
 */
export function TrailHeader({ s }: { s: AppState }) {
  const hoje = atividadeHoje(s);
  const goal = s.prefs.dailyLessons;
  const doneToday = hoje.completedBlockIds.length;
  const metaFechada = doneToday >= goal;
  const dias = diasSemAtividade(s);
  const nivel = nivelDeXp(s.progress.xp);

  const foca =
    dias >= 2
      ? { slot: "retorno" as const, expression: "acolhedora" as const }
      : metaFechada
        ? { slot: "meta" as const, expression: "orgulhosa" as const }
        : { slot: "bomdia" as const, expression: "neutra" as const };

  return (
    <div>
      <FocaSays slot={foca.slot} expression={foca.expression} compact />

      <div className="mt-4 flex items-center gap-4">
        <span className="shrink-0 font-mono text-sm font-bold text-abismo">
          {s.progress.streak} {s.progress.streak === 1 ? "dia" : "dias"}
        </span>
        <GoalRing value={doneToday} max={goal} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-nevoa">
            <span>Nível {nivel.nivel}</span>
            <span>
              {nivel.atual}/{nivel.proximo || nivel.atual}
            </span>
          </div>
          <ProgressBar
            value={nivel.atual}
            max={nivel.proximo || 1}
            tone="caneta"
            size="sm"
            label="Progresso de nível"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

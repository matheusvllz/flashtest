import type { FocaExpression } from "@/components/brand/FocaMark";
import { GoalRing } from "@/components/ds/GoalRing";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { COPY } from "@/lib/copy";
import { atividadeHoje, diasSemAtividade, nivelDeXp, type AppState } from "@/lib/store";
import type { VozSlot } from "@/lib/voz";

/**
 * Cabeçalho da trilha/home (docs/27 §6.2, §11.3 — RF-16). Vira uma barra de
 * métricas enxuta: a Foca sai daqui e passa a morar no callout do nó foco
 * (docs/28 T-10), única Foca visível no <main> em cada momento (docs/15 §4).
 * A saudação continua com a mesma regra de prioridade de antes: acolhedora
 * (retorno) > meta fechada > bom-dia — só que exportada para quem for montar
 * o callout usar.
 */
export function trailGreeting(s: AppState): { slot: VozSlot; expression: FocaExpression } {
  const hoje = atividadeHoje(s);
  const metaFechada = hoje.completedBlockIds.length >= s.prefs.dailyLessons;
  if (diasSemAtividade(s) >= 2) return { slot: "retorno", expression: "acolhedora" };
  if (metaFechada) return { slot: "meta", expression: "orgulhosa" };
  return { slot: "bomdia", expression: "neutra" };
}

export function TrailHeader({ s }: { s: AppState }) {
  const hoje = atividadeHoje(s);
  const goal = s.prefs.dailyLessons;
  const doneToday = hoje.completedBlockIds.length;
  const nivel = nivelDeXp(s.progress.xp);

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 font-mono text-sm font-bold text-abismo">
        <span className="mark-texto">{s.progress.streak}</span>{" "}
        {s.progress.streak === 1 ? "dia" : "dias"}
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <GoalRing value={doneToday} max={goal} size={40} />
        <span className="hidden font-mono text-xs font-bold text-nevoa min-[360px]:inline">
          {COPY.trilha.metaHoje(Math.min(doneToday, goal), goal)}
        </span>
      </span>
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
  );
}

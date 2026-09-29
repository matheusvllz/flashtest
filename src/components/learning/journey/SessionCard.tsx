import { Link } from "@tanstack/react-router";
import { SUBJECT_MAP } from "@/data/subjects";
import { FocaMark, type FocaExpression } from "@/components/brand/FocaMark";
import { activityReasonText, activityTitle } from "@/lib/adaptive/activity-lesson";
import { hrefForActivity, iniciaAoNavegar } from "@/lib/adaptive/journey";
import type { PlannedActivity } from "@/lib/adaptive/types";
import { COPY } from "@/lib/copy";
import type { JourneyHistoryEntry } from "@/lib/learning/types";
import { startJourneyActivity } from "@/lib/store";
import { fala, type VozSlot } from "@/lib/voz";

/**
 * Card "Sessão de hoje" (docs/30 §14.1 item 2, Fase 12 do docs/31 F12.3) —
 * substitui `RecommendationHint`/`ContinueCard` quando `jornadaAdaptativa`
 * está ligada. O único `btn-primary` da tela (docs/22 §22 "um CTA primário
 * por tela").
 */
export function SessionCard({
  committed,
  history,
  dailyMinutes,
  greeting,
}: {
  committed: PlannedActivity[];
  history: JourneyHistoryEntry[];
  dailyMinutes: number;
  greeting: { slot: VozSlot; expression: FocaExpression };
}) {
  const current = committed[0];

  // Jornada "infinita" esgotada (docs/30 §14.5) — sem candidato nenhum, nem
  // o fallback (`planWithFallback` some com `PlannedActivity[]` vazio só
  // quando não sobra NADA elegível/publicado).
  if (!current) {
    return (
      <div className="card-soft border-mar p-4">
        <div className="mb-3">
          <FocaMark expression="orgulhosa" size={40} decorative />
        </div>
        <p className="text-sm text-abismo">{COPY.jornada.semNada}</p>
        <Link to="/trilha" search={{ vista: "mapa" }} className="btn-outline mt-4 w-full">
          {COPY.jornada.verMapa}
        </Link>
      </div>
    );
  }

  // Minutos somados até `dailyMinutes` (docs/30 §14.1: "~12 min" é a fatia
  // do dia, não a fila comprometida inteira).
  let acumulado = 0;
  let minutos = 0;
  for (const a of committed) {
    if (acumulado >= dailyMinutes) break;
    acumulado += a.estimatedMinutes;
    minutos += a.estimatedMinutes;
  }

  const rotulo = history.length === 0 ? COPY.trilha.comecarAqui : COPY.jornada.continuar;
  const subjectName = SUBJECT_MAP[current.subjectId]?.name ?? "";

  return (
    <div className="card-soft border-mar p-4">
      <div className="mb-2 flex items-start gap-2">
        <FocaMark expression={greeting.expression} size={40} decorative />
        <p className="mt-1.5 text-sm text-abismo">{fala(greeting.slot)}</p>
      </div>
      <p className="ds-label">{rotulo}</p>
      <h2 className="mt-1 font-display text-lg font-bold leading-tight text-abismo">
        {activityTitle(current)}
      </h2>
      <p className="mt-1 text-xs font-semibold text-nevoa">
        {subjectName} · {COPY.jornada.minutos(minutos)}
      </p>
      <p className="mt-1 text-xs text-nevoa">{activityReasonText(current)}</p>
      {/* Próximo passo (docs/36 RU-12, T-06.2): o aluno vê o que vem depois sem abrir a fila. */}
      {committed[1] && (
        <p className="mt-1 text-xs text-nevoa" data-testid="session-card-depois">
          {COPY.jornada.depois(activityTitle(committed[1]))}
        </p>
      )}
      {/* Aula/legado (`/learn`, `/redacao`) terminam fora da jornada: marcar o início
          (`startJourneyActivity`, docs/32 F15.3 + docs/36 RF-2) antes de sair é o que deixa
          `syncJourneyWithCompletions` tirar `current` de `committed` quando a lição
          terminar. Atividade dinâmica (`/atividade`) só NAVEGA: a rota é a única dona
          da seleção de itens e do início da tentativa (T-02.1). */}
      <Link
        {...hrefForActivity(current)}
        onClick={() => {
          if (iniciaAoNavegar(current)) startJourneyActivity(current);
        }}
        className="btn-primary mt-4 w-full"
      >
        {rotulo}
      </Link>
    </div>
  );
}

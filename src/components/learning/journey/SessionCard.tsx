import { Link } from "@tanstack/react-router";
import { SUBJECT_MAP } from "@/data/subjects";
import { FocaMark, type FocaExpression } from "@/components/brand/FocaMark";
import { activityReasonText, activityTitle } from "@/lib/adaptive/activity-lesson";
import { navigationTargetFor } from "@/lib/adaptive/journey";
import type { PlannedActivity } from "@/lib/adaptive/types";
import { COPY } from "@/lib/copy";
import type { JourneyHistoryEntry } from "@/lib/learning/types";
import { setActiveActivity } from "@/lib/store";
import { fala, type VozSlot } from "@/lib/voz";

type ActivityHref =
  | { to: "/learn/$lessonId"; params: { lessonId: string } }
  | { to: "/redacao/$licaoId"; params: { licaoId: string } }
  | { to: "/atividade/$activityId"; params: { activityId: string } };

function hrefFor(activity: PlannedActivity): ActivityHref {
  const target = navigationTargetFor(activity);
  if (target.kind === "aula")
    return { to: "/learn/$lessonId", params: { lessonId: target.lessonId } };
  if (target.kind === "legado")
    return { to: "/redacao/$licaoId", params: { licaoId: target.lessonId } };
  return { to: "/atividade/$activityId", params: { activityId: target.activityId } };
}

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
      <div className="card-soft p-4" style={{ borderColor: "var(--color-mar)" }}>
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
    <div className="card-soft p-4" style={{ borderColor: "var(--color-mar)" }}>
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
      {/* Mesmo motivo do `onClick` em `JourneyPath` (docs/32 F15.3): marca
          `activeActivity` antes de sair pra `/learn`/`/redacao`, pra
          `syncJourneyWithCompletions` conseguir tirar `current` de
          `committed` quando a lição terminar e a jornada voltar aqui. */}
      <Link {...hrefFor(current)} onClick={() => setActiveActivity(current)} className="btn-primary mt-4 w-full">
        {rotulo}
      </Link>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { SKILL_MAP } from "@/content/taxonomy";
import { SUBJECT_MAP, SUBJECTS } from "@/data/subjects";
import { useJornadaEmDia } from "@/hooks/useJornadaEmDia";
import { usePlacementReconciliation } from "@/hooks/usePlacementReconciliation";
import { activityReasonText, activityTitle } from "@/lib/adaptive/activity-lesson";
import { hrefForActivity, iniciaAoNavegar } from "@/lib/adaptive/journey";
import { COPY } from "@/lib/copy";
import { FEATURES } from "@/lib/features";
import type { JourneyHistoryEntry } from "@/lib/learning/types";
import {
  atividadeHoje,
  hojeISO,
  setState,
  startJourneyActivity,
  syncJourneyWithCompletions,
  useAppState,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({ component: Plan, ssr: false });

const DIAS_SEMANA = ["S", "T", "Q", "Q", "S", "S", "D"];

/** Segunda a domingo da semana corrente, em ISO local (docs/18 §13.11). */
function semanaAtualISO(): string[] {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0=dom .. 6=sáb
  const offsetSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const dias: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + offsetSegunda + i);
    dias.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
  }
  return dias;
}

/** Título de uma atividade já concluída (o histórico não guarda a lição; usa o tipo e a habilidade). */
function tituloDoHistorico(h: JourneyHistoryEntry): string {
  const habilidade = SKILL_MAP[h.skillIds[0] ?? ""]?.name;
  const tipo = COPY.jornada.kinds[h.kind];
  return habilidade ? `${tipo} · ${habilidade}` : tipo;
}

/**
 * Plano (spec 48 T-48.4.2, D48-11; B-066): uma VISÃO do plano do motor adaptativo — a mesma fila da trilha
 * (`journey.committed` + `upcoming`), o que foi concluído hoje (`journey.history`) e a meta do dia (blocos, R-GAM-4).
 * Nada de lista própria, título fixo ou quantidade inventada. A primeira atividade abre pelo mesmo caminho do card
 * da trilha; as outras são a fila, na ordem do motor.
 */
function Plan() {
  const s = useAppState();
  const { aplicando } = usePlacementReconciliation();
  useJornadaEmDia(s, aplicando);

  // Lição terminada fora da jornada sai da fila antes de mostrar o plano (mesmo passo da trilha).
  const sincronizado = useRef(false);
  useEffect(() => {
    if (sincronizado.current) return;
    sincronizado.current = true;
    syncJourneyWithCompletions();
  }, []);

  const hoje = hojeISO();
  const { committed, upcoming, history, activeActivity } = s.learning.journey;
  const atual = activeActivity ?? committed[0];
  const fila = [...committed, ...upcoming].filter((a) => a.id !== atual?.id);
  const feitasHoje = history.filter((h) => (h.localDate ?? h.completedAt.slice(0, 10)) === hoje);
  const meta = s.prefs.dailyLessons;
  const blocosHoje = atividadeHoje(s).completedBlockIds.length;
  const semana = semanaAtualISO();
  const prioritarias = s.prefs.difficultSubjects;
  const assuntos =
    s.prefs.topicMode === "chose"
      ? Object.entries(s.prefs.selectedTopics ?? {}).flatMap(([m, ids]) =>
          ids
            .map((id) => SUBJECTS.find((x) => x.id === m)?.topics.find((t) => t.id === id)?.name)
            .filter(Boolean),
        )
      : [];

  return (
    <AppShell title={COPY.plano.titulo} layout="wide">
      <div className="desk-split px-5 pt-5 pb-8">
        <div className="desk-main space-y-4">
          <section className="card-soft border-mar p-5" aria-labelledby="plano-hoje">
            <p className="ds-label" id="plano-hoje">
              {COPY.plano.hoje}
            </p>
            <p className="mt-1 text-sm font-semibold text-nevoa" data-testid="plano-meta">
              {COPY.plano.metaHoje(Math.min(blocosHoje, meta), meta)}
            </p>
            {!FEATURES.jornadaAdaptativa || !atual ? (
              <>
                <p className="mt-2 text-sm text-abismo">{COPY.plano.vazio}</p>
                <Link to="/trilha" className="btn-primary mt-4 w-full">
                  {COPY.plano.irParaTrilha}
                </Link>
              </>
            ) : (
              <>
                <h2
                  className="mt-2 font-display text-xl font-bold leading-tight text-abismo"
                  data-testid="plano-atual"
                >
                  {activityTitle(atual)}
                </h2>
                <p className="mt-1 text-xs font-semibold text-nevoa">
                  {SUBJECT_MAP[atual.subjectId]?.name ?? ""} ·{" "}
                  {COPY.jornada.minutos(atual.estimatedMinutes)}
                </p>
                <p className="mt-1 text-xs text-nevoa">{activityReasonText(atual)}</p>
                <Link
                  {...hrefForActivity(atual)}
                  onClick={() => {
                    if (iniciaAoNavegar(atual)) startJourneyActivity(atual);
                  }}
                  className="btn-primary mt-4 w-full"
                >
                  {activeActivity ? COPY.jornada.continuar : COPY.jornada.comecar}
                </Link>
              </>
            )}
          </section>

          {fila.length > 0 && (
            <section className="card-soft p-4" aria-labelledby="plano-fila">
              <h3 id="plano-fila" className="font-display font-bold text-abismo">
                {COPY.plano.depois}
              </h3>
              <p className="mt-1 text-xs text-nevoa">{COPY.plano.depoisExplica}</p>
              <ol className="mt-3 divide-y divide-gelo" data-testid="plano-fila">
                {fila.map((a, i) => (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gelo font-mono text-xs font-bold text-abismo"
                      aria-hidden
                    >
                      {i + 2}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-abismo">{activityTitle(a)}</p>
                      <p className="text-xs text-nevoa">{SUBJECT_MAP[a.subjectId]?.name ?? ""}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="card-soft p-4" aria-labelledby="plano-feito">
            <h3 id="plano-feito" className="font-display font-bold text-abismo">
              {COPY.plano.feitoHoje}
            </h3>
            {feitasHoje.length === 0 ? (
              <p className="mt-2 text-sm text-nevoa">{COPY.plano.nadaHoje}</p>
            ) : (
              <ul className="mt-3 space-y-2" data-testid="plano-feitas">
                {feitasHoje.map((h) => (
                  <li
                    key={h.attemptKey ?? `${h.activityId}-${h.completedAt}`}
                    className="flex items-center gap-2 text-sm text-abismo"
                  >
                    <Check size={16} strokeWidth={3} className="shrink-0 text-mar" aria-hidden />
                    <span>{tituloDoHistorico(h)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="desk-aside mt-4 space-y-4 lg:mt-0">
          <section className="card-soft p-4" aria-labelledby="plano-ritmo">
            <h3 id="plano-ritmo" className="font-display font-bold text-abismo">
              {COPY.plano.ritmoTitulo}
            </h3>
            <p className="mt-1 text-sm text-nevoa">{COPY.plano.ritmoCorpo}</p>
            <div
              className="mt-3 grid grid-cols-3 gap-2"
              role="radiogroup"
              aria-label={COPY.plano.ritmoTitulo}
            >
              {[1, 3, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  role="radio"
                  aria-checked={meta === n}
                  onClick={() =>
                    setState((ss) => {
                      ss.prefs.dailyLessons = n;
                      return ss;
                    })
                  }
                  className={cn("chip min-h-11 justify-center text-base", meta === n && "chip-on")}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          <section className="card-soft p-4" aria-labelledby="plano-semana">
            <div className="flex items-center justify-between">
              <h3 id="plano-semana" className="font-display font-bold text-abismo">
                {COPY.plano.semanaTitulo}
              </h3>
              <span className="text-xs font-semibold text-nevoa">
                {COPY.plano.semanaMeta(s.prefs.daysPerWeek)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {semana.map((iso, i) => {
                const feito = s.progress.activityDays.includes(iso);
                const eHoje = iso === hoje;
                return (
                  <div key={iso} className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "grid h-10 w-full place-items-center rounded-lg border-2",
                        feito
                          ? "border-mar bg-mar"
                          : eHoje
                            ? "border-solid border-mar"
                            : "border-dashed border-gelo",
                      )}
                      aria-label={COPY.plano.diaAria(iso, feito)}
                    >
                      {feito && (
                        <Check size={14} strokeWidth={3} className="text-on-mar" aria-hidden />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-nevoa" aria-hidden>
                      {DIAS_SEMANA[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card-soft p-4" aria-labelledby="plano-prioridades">
            <h3 id="plano-prioridades" className="font-display font-bold text-abismo">
              {COPY.plano.prioridadesTitulo}
            </h3>
            {prioritarias.length === 0 && assuntos.length === 0 ? (
              <p className="mt-2 text-sm text-nevoa">{COPY.plano.semPrioridades}</p>
            ) : (
              <ul className="mt-3 space-y-1.5 text-sm text-abismo">
                {prioritarias.map((m) => (
                  <li key={m} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-mar" aria-hidden />
                    {m}
                  </li>
                ))}
                {assuntos.length > 0 && (
                  <li className="pt-1 text-xs text-nevoa">
                    {COPY.plano.assuntos(assuntos.join(", "))}
                  </li>
                )}
              </ul>
            )}
            <Link to="/topics" className="btn-outline mt-3 w-full">
              {COPY.plano.ajustarPrioridades}
            </Link>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

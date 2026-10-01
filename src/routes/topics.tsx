import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { COPY } from "@/lib/copy";
import { setState, useAppState, type Prefs } from "@/lib/store";
import { SUBJECTS } from "@/data/subjects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/topics")({ component: TopicsWidget, ssr: false });

const MODOS: Array<NonNullable<Prefs["topicMode"]>> = ["chose", "recommend", "skip"];

function TopicsWidget() {
  const s = useAppState();
  const chosen = s.prefs.difficultSubjects;
  const subs = SUBJECTS.filter((x) => chosen.includes(x.name));
  const mode = s.prefs.topicMode;

  return (
    <AppShell title={COPY.topicos.titulo} layout="wide">
      {/* Desktop (spec 48 T-48.7.1, B-074): preferências à esquerda, assuntos à direita; no celular, uma coluna. */}
      <div className="desk-split px-5 pt-4 pb-8">
        <div className="desk-aside space-y-4">
          <div className="card-soft p-4">
            <h2 className="font-display text-lg font-bold text-abismo">
              {COPY.topicos.prioritariasTitulo}
            </h2>
            <p className="mt-1 text-sm text-nevoa">{COPY.topicos.prioritariasCorpo}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUBJECTS.map((sub) => {
                const on = chosen.includes(sub.name);
                return (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() =>
                      setState((ss) => {
                        const cur = ss.prefs.difficultSubjects;
                        ss.prefs.difficultSubjects = cur.includes(sub.name)
                          ? cur.filter((x) => x !== sub.name)
                          : [...cur, sub.name];
                        return ss;
                      })
                    }
                    aria-pressed={on}
                    className={cn("chip", on && "chip-on")}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-soft p-4">
            <h2 className="font-display text-lg font-bold text-abismo">
              {COPY.topicos.modoTitulo}
            </h2>
            <p className="mt-1 text-sm text-nevoa">{COPY.topicos.modoCorpo}</p>
            <div
              className="mt-3 flex flex-col gap-2"
              role="radiogroup"
              aria-label={COPY.topicos.modoTitulo}
            >
              {MODOS.map((key) => (
                <button
                  type="button"
                  key={key}
                  role="radio"
                  aria-checked={mode === key}
                  onClick={() =>
                    setState((ss) => {
                      ss.prefs.topicMode = key;
                      return ss;
                    })
                  }
                  className={cn(
                    "rounded-lg border-2 px-4 py-3.5 text-left text-sm font-semibold text-abismo transition-all duration-100",
                    mode === key
                      ? "border-mar bg-mar/8 font-semibold"
                      : "border-gelo bg-cards shadow-[0_3px_0_var(--gelo)] active:translate-y-[3px] active:shadow-none",
                  )}
                >
                  {COPY.topicos.modos[key]}
                </button>
              ))}
            </div>
            {mode && (
              <div
                className="mt-3 space-y-1.5 rounded-lg bg-neve px-3 py-2.5 text-sm text-abismo"
                aria-live="polite"
              >
                <p>{COPY.topicos.efeito[mode]}</p>
                {s.learning.journey.activeActivity && (
                  <p className="text-nevoa">{COPY.topicos.andamento}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="desk-main mt-4 lg:mt-0">
          {mode === "chose" &&
            (subs.length === 0 ? (
              <p className="card-soft p-4 text-sm text-nevoa">{COPY.topicos.semPrioritarias}</p>
            ) : (
              <div className="desk-grid">
                {subs.map((sub) => {
                  const sel = s.prefs.selectedTopics[sub.id] || [];
                  return (
                    <div key={sub.id} className="card-soft p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-display font-bold text-abismo">{sub.name}</h3>
                          <p className="text-xs text-nevoa">
                            {COPY.topicos.escolhidos(sel.length)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setState((ss) => {
                              const cur = ss.prefs.selectedTopics[sub.id] || [];
                              ss.prefs.selectedTopics[sub.id] =
                                cur.length === sub.topics.length ? [] : sub.topics.map((t) => t.id);
                              return ss;
                            })
                          }
                          className="btn-ghost min-h-11 px-2 py-1 text-xs"
                        >
                          {sel.length === sub.topics.length
                            ? COPY.topicos.removerTodos
                            : COPY.topicos.selecionarTodos}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sub.topics.map((t) => {
                          const on = sel.includes(t.id);
                          return (
                            <button
                              type="button"
                              key={t.id}
                              onClick={() =>
                                setState((ss) => {
                                  const cur = ss.prefs.selectedTopics[sub.id] || [];
                                  ss.prefs.selectedTopics[sub.id] = cur.includes(t.id)
                                    ? cur.filter((x) => x !== t.id)
                                    : [...cur, t.id];
                                  return ss;
                                })
                              }
                              aria-pressed={on}
                              className={cn("chip", on && "chip-on")}
                            >
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      </div>
    </AppShell>
  );
}

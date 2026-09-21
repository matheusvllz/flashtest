import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/ds/EmptyState";
import { setState, useAppState, type Prefs } from "@/lib/store";
import { SUBJECTS } from "@/data/subjects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/topics")({ component: TopicsWidget, ssr: false });

const MODOS: Array<{ key: Prefs["topicMode"]; label: string }> = [
  { key: "chose", label: "Quero escolher os assuntos" },
  { key: "recommend", label: "Prefiro que a Foca recomende" },
  { key: "skip", label: "Pular por enquanto" },
];

function TopicsWidget() {
  const s = useAppState();
  const chosen = s.prefs.difficultSubjects;
  const subs = SUBJECTS.filter((x) => chosen.includes(x.name));
  const mode = s.prefs.topicMode;

  return (
    <AppShell title="Assuntos por matéria">
      <div className="px-5 pt-4 space-y-4 pb-8">
        <div className="card-soft p-4">
          <h2 className="font-display text-lg font-bold text-abismo">Matérias prioritárias</h2>
          <p className="mt-1 text-sm text-nevoa">
            Selecione as matérias em que você tem mais dificuldade — elas terão prioridade nos
            estudos.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUBJECTS.map((sub) => {
              const on = chosen.includes(sub.name);
              return (
                <button
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
                  className={cn("chip", on && "chip-on")}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-soft p-4">
          <h2 className="font-display text-lg font-bold text-abismo">Como você quer estudar?</h2>
          <p className="mt-1 text-sm text-nevoa">
            Escolha assuntos específicos ou deixe a Foca recomendar.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {MODOS.map(({ key, label }) => (
              <button
                key={key}
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
                    : "border-gelo bg-cards shadow-[0_3px_0_var(--color-gelo)] active:translate-y-[3px] active:shadow-none",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mode === "chose" &&
          (subs.length === 0 ? (
            <EmptyState
              text="Você ainda não selecionou matérias com dificuldade. Ajuste suas preferências para personalizar por assunto."
              cta={{ label: "Editar preferências", to: "/quiz" }}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {subs.map((sub) => {
                const sel = s.prefs.selectedTopics[sub.id] || [];
                return (
                  <div key={sub.id} className="card-soft p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-display font-bold text-abismo">{sub.name}</h3>
                      <button
                        onClick={() =>
                          setState((ss) => {
                            const cur = ss.prefs.selectedTopics[sub.id] || [];
                            ss.prefs.selectedTopics[sub.id] =
                              cur.length === sub.topics.length ? [] : sub.topics.map((t) => t.id);
                            return ss;
                          })
                        }
                        className="btn-ghost min-h-0 px-2 py-1 text-xs"
                      >
                        {sel.length === sub.topics.length ? "Remover todos" : "Selecionar todos"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sub.topics.map((t) => {
                        const on = sel.includes(t.id);
                        return (
                          <button
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
    </AppShell>
  );
}

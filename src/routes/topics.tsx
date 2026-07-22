import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { setState, useAppState } from "@/lib/store";
import { SUBJECTS } from "@/data/subjects";

export const Route = createFileRoute("/topics")({ component: TopicsWidget, ssr: false });

function TopicsWidget() {
  const s = useAppState();
  const nav = useNavigate();
  const chosen = s.prefs.difficultSubjects;
  const subs = SUBJECTS.filter((x) => chosen.includes(x.name));
  const mode = s.prefs.topicMode;

  return (
    <AppShell title="Assuntos por matéria">
      <div className="px-5 pt-4 space-y-4 pb-8">
        <div className="card-soft p-4">
          <h2 className="font-display text-lg font-bold text-navy">Matérias prioritárias</h2>
          <p className="mt-1 text-sm text-navy-2">
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
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "bg-navy text-white" : "bg-mist text-navy"}`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-soft p-4">
          <h2 className="font-display text-lg font-bold text-navy">Como você quer estudar?</h2>
          <p className="mt-1 text-sm text-navy-2">
            Escolha assuntos específicos ou deixe o FlashTest recomendar.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {[
              ["chose", "Quero escolher os assuntos"],
              ["recommend", "Prefiro que o FlashTest recomende"],
              ["skip", "Pular por enquanto"],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() =>
                  setState((ss) => {
                    ss.prefs.topicMode = k as any;
                    return ss;
                  })
                }
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${mode === k ? "border-navy bg-navy text-white" : "border-mist bg-white text-navy"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mode === "chose" &&
          (subs.length === 0 ? (
            <div className="card-soft p-4 text-sm text-navy-2">
              Você ainda não selecionou matérias com dificuldade. Ajuste suas preferências para
              personalizar por assunto.
              <button
                onClick={() => nav({ to: "/onboarding" })}
                className="btn-outline mt-3 w-full"
              >
                Editar preferências
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {subs.map((sub) => {
                const sel = s.prefs.selectedTopics[sub.id] || [];
                return (
                  <div key={sub.id} className="card-soft p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-display font-bold text-navy">{sub.name}</h3>
                      <button
                        onClick={() =>
                          setState((ss) => {
                            const cur = ss.prefs.selectedTopics[sub.id] || [];
                            ss.prefs.selectedTopics[sub.id] =
                              cur.length === sub.topics.length ? [] : sub.topics.map((t) => t.id);
                            return ss;
                          })
                        }
                        className="text-xs font-semibold text-navy-2"
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
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "bg-navy text-white" : "bg-mist text-navy"}`}
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

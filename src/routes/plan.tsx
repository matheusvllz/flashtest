import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, PlayCircle, Layers, HelpCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppState, setState } from "@/lib/store";
import { QUESTIONS } from "@/data/questions";
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

function Plan() {
  const s = useAppState();
  const lessons = s.prefs.dailyLessons;
  const gaps = s.quiz.gaps;
  const tasks = [
    ...gaps.slice(0, 2).map((g) => ({
      icon: HelpCircle,
      label: `Aula de 60s · ${g.subjectName}`,
      topic: g.topic,
    })),
    { icon: Layers, label: "5 flashcards", topic: "Revisão rápida" },
    { icon: PlayCircle, label: "1 videoaula", topic: q("v1") },
  ];

  const semana = semanaAtualISO();
  const hojeIso = semana.find((d) => {
    const hoje = new Date();
    return (
      d ===
      `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`
    );
  });

  return (
    <AppShell title="Meu Plano">
      <div className="px-5 pt-5 space-y-4">
        <div className="card-soft p-5" style={{ borderColor: "var(--color-mar)" }}>
          <p className="ds-label">Plano de hoje</p>
          <h2 className="mt-1.5 font-display text-2xl font-bold leading-tight text-abismo">
            {lessons} aulas de 60s, montadas pelas suas lacunas
          </h2>
          <p className="mt-2 text-sm text-nevoa">
            {s.prefs.targetInstitution && s.prefs.targetInstitution !== "Ainda não decidi"
              ? `Direcionado para ${s.prefs.targetInstitution}.`
              : "Baseado no seu diagnóstico de entrada."}
          </p>
          <Link to="/study" className="btn-primary mt-4 w-full">
            Começar plano de hoje
          </Link>
        </div>

        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-abismo">Atividades</h3>
          <ul className="mt-3 divide-y divide-gelo">
            {tasks.map((t, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gelo text-abismo">
                  <t.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-abismo">{t.label}</p>
                  <p className="text-xs text-nevoa">{t.topic}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-abismo">Ajustar ritmo</h3>
          <p className="mt-1 text-sm text-nevoa">Quantas aulas de 60s por dia?</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[1, 3, 5].map((n) => (
              <button
                key={n}
                onClick={() =>
                  setState((ss) => {
                    ss.prefs.dailyLessons = n;
                    return ss;
                  })
                }
                className={cn("chip min-h-11 justify-center text-base", lessons === n && "chip-on")}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="card-soft p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-abismo">Progresso semanal</h3>
            <span className="text-xs font-semibold text-nevoa">
              Meta: {s.prefs.daysPerWeek} dias
            </span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {semana.map((iso, i) => {
              const feito = s.progress.activityDays.includes(iso);
              const hoje = iso === hojeIso;
              return (
                <div key={iso} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "grid h-10 w-full place-items-center rounded-lg border-2",
                      feito ? "bg-mar" : hoje ? "border-solid" : "border-dashed border-gelo",
                    )}
                    style={hoje && !feito ? { borderColor: "var(--color-mar)" } : undefined}
                  >
                    {feito && <Check size={14} strokeWidth={3} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-bold text-nevoa">{DIAS_SEMANA[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-abismo">Matérias prioritárias</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-abismo">
            {(s.prefs.difficultSubjects.length
              ? s.prefs.difficultSubjects
              : ["Matemática", "Física", "Português"]
            ).map((m) => (
              <li key={m} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-mar" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function q(id: string) {
  return (
    QUESTIONS.find((x) => x.videoSuggestion.id === id)?.videoSuggestion.title ??
    "Videoaula recomendada"
  );
}

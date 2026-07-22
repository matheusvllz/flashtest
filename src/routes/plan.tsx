import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, setState } from "@/lib/store";
import { QUESTIONS } from "@/data/questions";
import { PlayCircle, Layers, HelpCircle, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/plan")({ component: Plan, ssr: false });

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

  return (
    <AppShell title="Meu Plano">
      <div className="px-5 pt-5 space-y-4">
        <div
          className="rounded-2xl p-5 text-navy"
          style={{ background: "linear-gradient(135deg,#FEB803,#FFD466)" }}
        >
          <p className="ds-label" style={{ color: "#02104E" }}>
            Plano de hoje
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold leading-tight">
            {lessons} aulas de 60s, montadas pelas suas lacunas
          </h2>
          <p className="mt-2 text-sm">
            {s.prefs.targetInstitution && s.prefs.targetInstitution !== "Ainda não decidi"
              ? `Direcionado para ${s.prefs.targetInstitution}.`
              : "Baseado no seu diagnóstico de entrada."}
          </p>
          <Link to="/study" className="btn-navy mt-4 w-full">
            Começar plano de hoje
          </Link>
        </div>

        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-navy">Atividades</h3>
          <ul className="mt-3 divide-y divide-mist">
            {tasks.map((t, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-mist text-navy">
                  <t.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy">{t.label}</p>
                  <p className="text-xs text-navy-2">{t.topic}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-navy">Ajustar ritmo</h3>
          <p className="mt-1 text-sm text-navy-2">Quantas aulas de 60s por dia?</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() =>
                  setState((ss) => {
                    ss.prefs.dailyLessons = n;
                    return ss;
                  })
                }
                className={`rounded-[10px] py-3 font-display text-sm font-bold transition ${
                  lessons === n ? "bg-navy text-white" : "bg-mist text-navy"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="card-soft p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-navy">Progresso semanal</h3>
            <span className="text-xs font-semibold text-navy-2">
              Meta: {s.prefs.daysPerWeek} dias
            </span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="h-10 w-full rounded-lg"
                  style={{ background: i < s.progress.streak ? "#FEB803" : "#ECECF3" }}
                />
                <span className="text-[10px] font-bold text-navy-2">{d}</span>
              </div>
            ))}
          </div>
        </div>

        <details className="card-soft p-4">
          <summary className="flex cursor-pointer items-center justify-between font-display font-bold text-navy">
            Matérias prioritárias <ChevronDown size={16} />
          </summary>
          <ul className="mt-3 space-y-1 text-sm text-navy">
            {(s.prefs.difficultSubjects.length
              ? s.prefs.difficultSubjects
              : ["Matemática", "Física", "Português"]
            ).map((m) => (
              <li key={m} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FEB803" }} />
                {m}
              </li>
            ))}
          </ul>
        </details>
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Bolt } from "@/components/AppShell";
import { useAppState } from "@/lib/store";
import { allLessonsInOrder, TOTAL_LICOES } from "@/content/trilhas";
import { Flame, Target, TrendingUp, Layers, Check, PenLine, Trophy } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard, ssr: false });

function Dashboard() {
  const s = useAppState();
  const p = s.prefs;
  const doneToday = s.progress.lessonsCompleted;
  const licoesFeitas = Object.keys(s.progress.lessons).length;
  // Próxima lição de redação na ordem de desbloqueio — o mesmo "continuar de
  // onde parou" da trilha, trazido para a home.
  const nextLesson = allLessonsInOrder().find(({ lesson }) => !s.progress.lessons[lesson.id]);
  const goal = p.dailyLessons;
  const pct = Math.min(100, Math.round((doneToday / Math.max(1, goal)) * 100));
  const acc = s.progress.answered
    ? Math.round((s.progress.correct / s.progress.answered) * 100)
    : 0;
  const firstName = (p.name || "estudante").split(" ")[0];

  // O assunto da próxima aula é a lacuna nº1 do diagnóstico — não uma escolha de tempo.
  const nextTopic = s.quiz.gaps[0]?.topic ?? "Funções do 2º grau";
  const nextSubject = s.quiz.gaps[0]?.subjectName ?? "Matemática";

  return (
    <AppShell>
      <div className="bg-navy px-5 pt-8 pb-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-navy-mist">Bom dia,</p>
            <h1 className="font-display text-2xl font-bold">{firstName}</h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2">
            <Bolt size={16} />
            <span className="font-display text-base font-bold">{s.progress.streak}</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: "#FEB803" }}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-navy-mist">
            {doneToday}/{goal} aulas de hoje · {pct}% da meta diária
          </p>
        </div>

        {/* CTA único: a próxima aula de 60s. Sem seletor de minutos (SDD 12, D1). */}
        <div className="relative mt-5 overflow-hidden rounded-2xl bg-royal p-5">
          <div className="absolute right-4 top-4 opacity-90">
            <Bolt size={22} />
          </div>
          <div className="ds-label" style={{ color: "#FEB803" }}>
            Aula de hoje · 60s
          </div>
          <h2 className="mt-2 font-display text-[22px] font-bold leading-tight">{nextTopic}</h2>
          <p className="mt-1 text-xs font-semibold text-navy-mist">{nextSubject} · 2 questões</p>
          <Link to="/study" className="btn-primary mt-4 w-full">
            Começar
          </Link>
        </div>
      </div>

      <div className="bg-cloud px-5 pt-5 pb-5 space-y-4">
        <div className="card-soft p-4">
          <p className="ds-label" style={{ color: "#8B91A8" }}>
            Missões de hoje
          </p>
          <ul className="mt-3 space-y-2.5">
            <Mission done={doneToday >= 1} label={`${goal} aulas de 60s`} />
            <Mission done={s.progress.savedFlashcards.length > 0} label="Revisar 1 flashcard" />
            <Mission done={licoesFeitas > 0} label="Treino de redação" />
          </ul>
        </div>

        {/* 2º pilar: o micro-treino de redação (SDD 12, D3). */}
        {nextLesson && (
          <Link
            to="/redacao"
            className="card-soft flex items-center gap-4 p-4"
            aria-label="Ir para o treino de redação"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-yellow">
              <PenLine size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="ds-label">Treino de redação</p>
              <p className="mt-1 truncate font-display text-sm font-bold text-navy">
                {nextLesson.lesson.titulo}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-navy-2">
                {licoesFeitas}/{TOTAL_LICOES} lições concluídas
              </p>
            </div>
            <span className="text-navy-2">→</span>
          </Link>
        )}

        <Link to="/ranking" className="card-soft flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Trophy size={20} className="text-gold-dark" />
            <div>
              <p className="ds-label" style={{ color: "#8B91A8" }}>
                Sua turma
              </p>
              <p className="mt-1 font-display font-bold text-navy">Ranking da semana</p>
            </div>
          </div>
          <span className="text-navy-2">→</span>
        </Link>

        <Link to="/flashcards" className="card-soft flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Layers size={20} className="text-navy" />
            <div>
              <p className="ds-label" style={{ color: "#8B91A8" }}>
                Revisão
              </p>
              <p className="mt-1 font-display font-bold text-navy">
                {s.progress.savedFlashcards.length} flashcards salvos
              </p>
            </div>
          </div>
          <span className="text-navy-2">→</span>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Flame size={20} />} label="Sequência" value={`${s.progress.streak}d`} />
          <Stat icon={<Target size={20} />} label="Acertos" value={`${acc}%`} />
          <Stat
            icon={<TrendingUp size={20} />}
            label="Aulas feitas"
            value={`${s.progress.lessonsCompleted}`}
          />
          <Stat
            icon={<Layers size={20} />}
            label="Flashcards"
            value={`${s.progress.savedFlashcards.length}`}
          />
        </div>

        <Link to="/topics" className="card-soft flex items-center justify-between p-4">
          <div>
            <p className="ds-label" style={{ color: "#8B91A8" }}>
              Assuntos por matéria
            </p>
            <p className="mt-1 font-display font-bold text-navy">Escolher assuntos específicos</p>
          </div>
          <span className="text-navy-2">→</span>
        </Link>

        <Link to="/plan" className="card-soft flex items-center justify-between p-4">
          <div>
            <p className="ds-label" style={{ color: "#8B91A8" }}>
              Meu plano
            </p>
            <p className="mt-1 font-display font-bold text-navy">
              {goal} aulas por dia, {p.daysPerWeek} dias
            </p>
          </div>
          <span className="text-navy-2">→</span>
        </Link>

        <Link
          to="/premium"
          className="flex items-center justify-between rounded-2xl p-4 text-navy"
          style={{ background: "linear-gradient(135deg,#FEB803,#FFD466)" }}
        >
          <div>
            <p className="ds-label" style={{ color: "#02104E" }}>
              Teste premium
            </p>
            <p className="mt-1 font-display font-bold">1 dia grátis com IA sem limite</p>
          </div>
          <span>→</span>
        </Link>
      </div>
    </AppShell>
  );
}

function Mission({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={`grid h-6 w-6 place-items-center rounded-md ${done ? "bg-yellow" : "border-2 border-[#D8D6E0]"}`}
      >
        {done && <Check size={14} strokeWidth={3} className="text-navy" />}
      </div>
      <span className={`text-sm font-semibold ${done ? "text-navy" : "text-navy-2"}`}>{label}</span>
    </li>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-soft flex items-center gap-3 p-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-mist text-navy">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-navy-2">{label}</p>
        <p className="font-display text-lg font-bold text-navy">{value}</p>
      </div>
    </div>
  );
}

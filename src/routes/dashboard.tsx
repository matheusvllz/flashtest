import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChevronRight, Layers, PenLine, Trophy, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FocaSays } from "@/components/brand/FocaSays";
import { GoalRing } from "@/components/ds/GoalRing";
import { ProgressBar } from "@/components/ds/ProgressBar";
import {
  atividadeHoje,
  diasSemAtividade,
  marcarMetaCelebrada,
  nivelDeXp,
  useAppState,
} from "@/lib/store";
import { allLessonsInOrder, TOTAL_LICOES } from "@/content/trilhas";
import { play as tocarSom } from "@/lib/sfx";
import { vibrar } from "@/lib/haptics";

export const Route = createFileRoute("/dashboard")({ component: Dashboard, ssr: false });

function Dashboard() {
  const s = useAppState();
  const p = s.prefs;
  // Honesto: reflete o dia de hoje, não o total da vida (docs/18 §1.2 — bug corrigido).
  const hoje = atividadeHoje(s);
  const goal = p.dailyLessons;
  const doneToday = hoje.lessons;
  const metaFechada = doneToday >= goal;
  const dias = diasSemAtividade(s);
  const nivel = nivelDeXp(s.progress.xp);
  const licoesFeitas = Object.keys(s.progress.lessons).length;
  const firstName = (p.name || "estudante").split(" ")[0];
  // Próxima lição de redação na ordem de desbloqueio — o mesmo "continuar de
  // onde parou" da trilha, trazido para a home.
  const nextLesson = allLessonsInOrder().find(({ lesson }) => !s.progress.lessons[lesson.id]);
  // O assunto da próxima aula é a lacuna nº1 do diagnóstico — não uma escolha de tempo.
  const nextTopic = s.quiz.gaps[0]?.topic ?? "Funções do 2º grau";
  const nextSubject = s.quiz.gaps[0]?.subjectName ?? "Matemática";

  // A Foca do dia: acolhedora tem prioridade sobre tudo (o retorno é o
  // momento mais frágil, docs/15 §3.2); meta fechada é o segundo pico; o
  // resto do tempo ela só dá bom-dia.
  const foca =
    dias >= 2
      ? { slot: "retorno" as const, expression: "acolhedora" as const }
      : metaFechada
        ? { slot: "meta" as const, expression: "orgulhosa" as const }
        : { slot: "bomdia" as const, expression: "neutra" as const };

  // Celebra a meta uma vez por dia — não a cada visita ao dashboard.
  useEffect(() => {
    if (metaFechada && !hoje.celebrouMeta) {
      tocarSom("streak");
      vibrar("fim");
      marcarMetaCelebrada();
    }
  }, [metaFechada, hoje.celebrouMeta]);

  return (
    <AppShell>
      <div className="surface-pauta bg-neve px-5 pt-8 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-nevoa">Bom dia,</p>
            <h1 className="font-display text-2xl font-bold text-abismo">{firstName}</h1>
          </div>
          <GoalRing value={doneToday} max={goal} />
        </div>

        <FocaSays slot={foca.slot} expression={foca.expression} compact className="mt-4" />

        <div className="mt-4 flex items-center gap-4">
          <span className="shrink-0 font-mono text-sm font-bold text-abismo">
            {s.progress.streak} {s.progress.streak === 1 ? "dia" : "dias"}
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

        {/* CTA único: a próxima aula de 60s. Sem seletor de minutos (SDD 12, D1). */}
        <div className="card-soft mt-5 p-5" style={{ borderColor: "var(--color-mar)" }}>
          <div className="ds-label">Aula de hoje · 60s</div>
          <h2 className="mt-2 font-display text-[22px] font-bold leading-tight text-abismo">
            {nextTopic}
          </h2>
          <p className="mt-1 text-xs font-semibold text-nevoa">{nextSubject} · 2 questões</p>
          <Link to="/study" className="btn-primary mt-4 w-full">
            Começar · 60s
          </Link>
        </div>
      </div>

      <div className="bg-neve px-5 pt-5 pb-5 space-y-4">
        <div className="card-soft p-4">
          <p className="ds-label">Missões de hoje</p>
          <ul className="mt-3 space-y-2.5">
            <Mission done={doneToday >= 1} label={`${goal} aula${goal > 1 ? "s" : ""} de 60s`} />
            <Mission done={hoje.flashcards > 0} label="Revisar 1 flashcard" />
            <Mission done={hoje.redacao > 0} label="Treino de redação" />
          </ul>
        </div>

        {/* 2º pilar: o micro-treino de redação (SDD 12, D3). */}
        {nextLesson && (
          <Link
            to="/redacao"
            className="card-press flex items-center gap-4 p-4"
            aria-label="Ir para o treino de redação"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gelo text-abismo">
              <PenLine size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="ds-label">Treino de redação</p>
              <p className="mt-1 truncate font-display text-sm font-bold text-abismo">
                {nextLesson.lesson.titulo}
              </p>
              <div className="mt-1.5">
                <ProgressBar
                  value={licoesFeitas}
                  max={TOTAL_LICOES}
                  tone="caneta"
                  size="sm"
                  label="Progresso da trilha de redação"
                />
              </div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-nevoa" />
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link to="/ranking" className="card-press flex flex-col items-start gap-2 p-3.5">
            <Trophy size={18} className="text-mar-fundo" />
            <span className="text-xs font-bold text-abismo">Ranking da semana</span>
          </Link>
          <Link to="/flashcards" className="card-press flex flex-col items-start gap-2 p-3.5">
            <Layers size={18} className="text-abismo" />
            <span className="text-xs font-bold text-abismo">
              {s.progress.savedFlashcards.length} flashcards
            </span>
          </Link>
        </div>

        <Link to="/plan" className="card-press flex items-center justify-between p-4">
          <div>
            <p className="ds-label">Meu plano</p>
            <p className="mt-1 font-display font-bold text-abismo">
              {goal} aulas por dia, {p.daysPerWeek} dias
            </p>
          </div>
          <ChevronRight size={18} className="text-nevoa" />
        </Link>

        <div
          className="card-soft p-4"
          style={{
            background: "color-mix(in srgb, var(--color-recompensa) 20%, var(--color-cards))",
            borderColor: "var(--color-recompensa)",
          }}
        >
          <p className="ds-label">Teste premium</p>
          <p className="mt-1 font-display font-bold text-abismo">1 dia grátis com IA sem limite</p>
          <Link to="/premium" className="btn-outline mt-3 inline-flex">
            Conhecer
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Mission({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${done ? "bg-mar" : "border-2 border-dashed border-gelo"}`}
      >
        {done && <Check size={14} strokeWidth={3} className="text-white" />}
      </div>
      <span className={`text-sm font-semibold ${done ? "text-abismo" : "text-nevoa"}`}>
        {label}
      </span>
    </li>
  );
}

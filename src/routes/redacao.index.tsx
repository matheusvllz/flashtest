import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Lock, Star, PenLine } from "lucide-react";
import { AppShell, Bolt } from "@/components/AppShell";
import { TRILHAS, TOTAL_LICOES, allLessonsInOrder } from "@/content/trilhas";
import { useAppState, isLessonUnlocked } from "@/lib/store";
import type { Trilha } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/redacao/")({ component: Redacao, ssr: false });

function Redacao() {
  const s = useAppState();
  const done = s.progress.lessons;
  const doneCount = Object.keys(done).length;

  // "Continuar de onde parou": a primeira lição ainda não concluída na ordem
  // de desbloqueio. É o CTA principal — ninguém deve precisar caçar onde parou.
  const next = useMemo(() => allLessonsInOrder().find(({ lesson }) => !done[lesson.id]), [done]);

  const [eixo, setEixo] = useState<"redacao" | "base">("redacao");
  const trilhas = TRILHAS.filter((t) => t.eixo === eixo);

  return (
    <AppShell>
      <div className="bg-navy px-5 pt-8 pb-6 text-white">
        <div className="flex items-center gap-2">
          <PenLine size={18} className="text-yellow" />
          <p className="ds-label" style={{ color: "#FEB803" }}>
            Micro-treino de redação
          </p>
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight">
          A nota 1000 sai de mil <br /> exercícios de 1 minuto
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-yellow transition-all"
              style={{ width: `${Math.round((doneCount / TOTAL_LICOES) * 100)}%` }}
            />
          </div>
          <span className="font-display text-xs font-bold text-navy-mist">
            {doneCount}/{TOTAL_LICOES}
          </span>
        </div>

        {next && (
          <Link
            to="/redacao/$licaoId"
            params={{ licaoId: next.lesson.id }}
            className="mt-5 block rounded-2xl bg-royal p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="ds-label" style={{ color: "#FEB803" }}>
                  {doneCount === 0 ? "Comece por aqui" : "Continuar de onde parou"}
                </p>
                <p className="mt-1.5 font-display text-base font-bold leading-tight">
                  {next.lesson.titulo}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-navy-mist">
                  {next.trilha.nome} · {next.lesson.exercicios.length} exercícios
                </p>
              </div>
              <Bolt size={22} />
            </div>
            <span className="btn-primary mt-3 w-full">Praticar</span>
          </Link>
        )}
      </div>

      {/* Eixos: a redação em si e a base de português que sustenta a nota. */}
      <div className="sticky top-0 z-10 flex gap-2 border-b border-mist bg-white px-5 py-3">
        <EixoTab active={eixo === "redacao"} onClick={() => setEixo("redacao")} label="Redação" />
        <EixoTab
          active={eixo === "base"}
          onClick={() => setEixo("base")}
          label="Base de português"
        />
      </div>

      <div className="space-y-5 bg-cloud px-5 py-5">
        {trilhas.map((trilha) => (
          <TrilhaCard key={trilha.id} trilha={trilha} state={s} />
        ))}
      </div>
    </AppShell>
  );
}

function EixoTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 font-display text-[13px] font-bold transition-colors",
        active ? "bg-navy text-white" : "bg-mist text-navy-2",
      )}
    >
      {label}
    </button>
  );
}

function TrilhaCard({ trilha, state }: { trilha: Trilha; state: ReturnType<typeof useAppState> }) {
  const done = state.progress.lessons;
  const concluidas = trilha.licoes.filter((l) => done[l.id]).length;
  const pct = Math.round((concluidas / trilha.licoes.length) * 100);

  return (
    <section className="card-soft overflow-hidden">
      <header className="border-b border-mist px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold leading-tight text-navy">
              {trilha.nome}
            </h2>
            <p className="mt-1 text-xs leading-snug text-navy-2">{trilha.descricao}</p>
          </div>
          <span className="chip shrink-0">
            {concluidas}/{trilha.licoes.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-mist">
          <div
            className="h-full rounded-full bg-yellow transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      <ul className="divide-y divide-mist">
        {trilha.licoes.map((licao, i) => {
          const prog = done[licao.id];
          const unlocked = isLessonUnlocked(trilha.licoes, licao.id, state);
          const content = (
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Nó da trilha: número, check dourado ou cadeado. */}
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-[13px] font-bold",
                  prog
                    ? "bg-yellow text-navy"
                    : unlocked
                      ? "border-2 border-navy text-navy"
                      : "bg-mist text-navy-2",
                )}
              >
                {prog ? <Check size={17} strokeWidth={3} /> : unlocked ? i + 1 : <Lock size={14} />}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-display text-[14px] font-bold leading-tight",
                    unlocked ? "text-navy" : "text-navy-2",
                  )}
                >
                  {licao.titulo}
                </p>
                {licao.descricao && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-navy-2">{licao.descricao}</p>
                )}
              </div>

              {prog ? (
                <div className="flex shrink-0 gap-0.5">
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      size={13}
                      className={n <= prog.stars ? "fill-yellow text-yellow" : "text-mist"}
                    />
                  ))}
                </div>
              ) : (
                unlocked && (
                  <span className="shrink-0 text-[11px] font-bold text-navy-2">
                    {licao.exercicios.length} ex.
                  </span>
                )
              )}
            </div>
          );

          return (
            <li key={licao.id}>
              {unlocked ? (
                <Link to="/redacao/$licaoId" params={{ licaoId: licao.id }} className="block">
                  {content}
                </Link>
              ) : (
                <div className="cursor-not-allowed opacity-60">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

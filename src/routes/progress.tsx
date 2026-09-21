import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Target, TrendingUp, PenLine, ArrowRight, Layers } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/ds/EmptyState";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { StatTile } from "@/components/ds/StatTile";
import { nivelDeXp, useAppState } from "@/lib/store";
import { SUBJECT_MAP } from "@/data/subjects";
import { QUESTIONS } from "@/data/questions";
import { TOTAL_LICOES } from "@/content/trilhas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({ component: Progress, ssr: false });

/** Faixa de domínio por rótulo — a cor só reforça na faixa "Dominado" (feedback de resultado legítimo). */
function faixaDe(pct: number): { label: string; dominado: boolean } {
  if (pct >= 80) return { label: "Dominado", dominado: true };
  if (pct >= 60) return { label: "Quase lá", dominado: false };
  if (pct >= 40) return { label: "Em construção", dominado: false };
  return { label: "Lacuna", dominado: false };
}

function Progress() {
  const s = useAppState();
  const p = s.progress;
  const acc = p.answered ? Math.round((p.correct / p.answered) * 100) : 0;
  const licoesFeitas = Object.keys(p.lessons).length;
  const alvo = s.prefs.targetInstitution;
  const nivel = nivelDeXp(p.xp);

  /**
   * O mapa de lacunas: toda matéria com questão no banco aparece, medida ou
   * não. Isso é deliberado — uma matéria **não medida** também é uma lacuna do
   * diagnóstico, e escondê-la daria a falsa impressão de cobertura completa.
   */
  const mapa = useMemo(() => {
    const materias = [...new Set(QUESTIONS.map((q) => q.subject))];
    return materias
      .map((id) => {
        const v = p.bySubject[id];
        const answered = v?.answered ?? 0;
        const pct = answered ? Math.round(((v?.correct ?? 0) / answered) * 100) : 0;
        return {
          id,
          nome: SUBJECT_MAP[id]?.name ?? id,
          answered,
          correct: v?.correct ?? 0,
          pct,
          medido: answered > 0,
        };
      })
      .sort((a, b) => {
        // Não medidas por último; entre as medidas, a pior lacuna primeiro.
        if (a.medido !== b.medido) return a.medido ? -1 : 1;
        return a.pct - b.pct;
      });
  }, [p.bySubject]);

  const medidas = mapa.filter((m) => m.medido);
  const piores = medidas.filter((m) => m.pct < 60).slice(0, 3);

  return (
    <AppShell>
      <div className="bg-neve px-5 pt-8 pb-6">
        <p className="ds-label">Seu mapa de lacunas</p>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-abismo">
          {medidas.length === 0
            ? "Vamos descobrir onde você está"
            : piores.length > 0
              ? `${piores.length} lacuna${piores.length > 1 ? "s" : ""} para fechar`
              : "Nenhuma lacuna crítica agora"}
        </h1>
        {alvo && alvo !== "Ainda não decidi" && (
          <p className="mt-1 text-sm text-nevoa">Rumo a {alvo}.</p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <StatTile icon={<Target size={16} />} label="Acertos" value={`${acc}%`} />
          <StatTile icon={<TrendingUp size={16} />} label="Aulas" value={`${p.lessonsCompleted}`} />
          <StatTile icon={<Layers size={16} />} label="Nível" value={`${nivel.nivel}`} />
        </div>
      </div>

      <div className="space-y-4 bg-neve px-5 py-5">
        {/* Prioridade: o que estudar primeiro, sem o aluno ter que interpretar gráfico. */}
        {piores.length > 0 && (
          <div className="card-soft p-4">
            <p className="ds-label">Ataque primeiro</p>
            <ul className="mt-3 space-y-3">
              {piores.map((m, i) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span className="shrink-0 font-mono text-lg font-bold text-mar-fundo">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold text-abismo">{m.nome}</p>
                    <p className="text-[11px] font-semibold text-nevoa">
                      {m.correct}/{m.answered} · {m.pct}% de acerto
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/study" className="btn-primary mt-4 w-full">
              Fazer uma aula de 60s <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* O mapa em si */}
        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-abismo">Domínio por matéria</h3>
          <p className="mt-0.5 text-[11px] text-nevoa">
            Tracejado = ainda não medimos você nessa matéria.
          </p>
          <ul className="mt-4 space-y-3">
            {mapa.map((m) => {
              const faixa = faixaDe(m.pct);
              return (
                <li key={m.id}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className={cn("font-semibold", m.medido ? "text-abismo" : "text-nevoa")}>
                      {m.nome}
                    </span>
                    <span className="shrink-0 text-[11px] font-bold text-nevoa">
                      {m.medido ? `${m.correct}/${m.answered} · ${faixa.label}` : "não medido"}
                    </span>
                  </div>
                  <div className="mt-1">
                    {m.medido ? (
                      <ProgressBar
                        value={m.pct}
                        tone={faixa.dominado ? "success" : "caneta"}
                        size="sm"
                        label={`Domínio em ${m.nome}`}
                      />
                    ) : (
                      <div className="h-2 w-full rounded-full border-2 border-dashed border-gelo" />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* O 2º pilar entra no mesmo painel: progresso é um só. */}
        <div className="card-soft p-4">
          <div className="flex items-center gap-2">
            <PenLine size={16} className="text-abismo" />
            <h3 className="font-display font-bold text-abismo">Redação</h3>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar
              value={licoesFeitas}
              max={TOTAL_LICOES}
              tone="caneta"
              label="Progresso da trilha de redação"
              className="flex-1"
            />
            <span className="shrink-0 font-mono text-xs font-bold text-nevoa">
              {licoesFeitas}/{TOTAL_LICOES}
            </span>
          </div>
          <Link to="/redacao" className="btn-outline mt-4 w-full">
            {licoesFeitas === 0 ? "Começar o treino de redação" : "Continuar o treino"}
          </Link>
        </div>

        {medidas.length === 0 && (
          <EmptyState
            text="Seu mapa se preenche sozinho conforme você responde."
            cta={{ label: "Fazer a primeira aula", to: "/study" }}
          />
        )}
      </div>
    </AppShell>
  );
}

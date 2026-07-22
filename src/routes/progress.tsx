import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Target, TrendingUp, PenLine, ArrowRight } from "lucide-react";
import { AppShell, Bolt } from "@/components/AppShell";
import { useAppState } from "@/lib/store";
import { SUBJECT_MAP } from "@/data/subjects";
import { QUESTIONS } from "@/data/questions";
import { TOTAL_LICOES } from "@/content/trilhas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({ component: Progress, ssr: false });

/** Faixas de domínio — a régua única do mapa de lacunas. */
const FAIXAS = [
  { min: 80, label: "Dominado", cor: "#0AA35A" },
  { min: 60, label: "Quase lá", cor: "#FEB803" },
  { min: 40, label: "Em construção", cor: "#B57F00" },
  { min: 0, label: "Lacuna", cor: "#C0392B" },
] as const;

function faixaDe(pct: number) {
  return FAIXAS.find((f) => pct >= f.min) ?? FAIXAS[FAIXAS.length - 1];
}

function Progress() {
  const s = useAppState();
  const p = s.progress;
  const acc = p.answered ? Math.round((p.correct / p.answered) * 100) : 0;
  const licoesFeitas = Object.keys(p.lessons).length;
  const alvo = s.prefs.targetInstitution;

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
      <div className="bg-navy px-5 pt-8 pb-6 text-white">
        <p className="ds-label" style={{ color: "#FEB803" }}>
          Seu mapa de lacunas
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight">
          {medidas.length === 0
            ? "Vamos descobrir onde você está"
            : piores.length > 0
              ? `${piores.length} lacuna${piores.length > 1 ? "s" : ""} para fechar`
              : "Nenhuma lacuna crítica agora"}
        </h1>
        {alvo && alvo !== "Ainda não decidi" && (
          <p className="mt-1 text-sm text-navy-mist">Rumo a {alvo}.</p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <HeroStat icon={<Target size={15} />} label="Acertos" value={`${acc}%`} />
          <HeroStat icon={<TrendingUp size={15} />} label="Aulas" value={`${p.lessonsCompleted}`} />
          <HeroStat icon={<Bolt size={15} />} label="XP" value={`${p.xp}`} />
        </div>
      </div>

      <div className="space-y-4 bg-cloud px-5 py-5">
        {/* Prioridade: o que estudar primeiro, sem o aluno ter que interpretar gráfico. */}
        {piores.length > 0 && (
          <div className="card-soft p-4">
            <p className="ds-label">Ataque primeiro</p>
            <ul className="mt-3 space-y-2">
              {piores.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span
                    className="h-8 w-1 shrink-0 rounded-full"
                    style={{ background: faixaDe(m.pct).cor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold text-navy">{m.nome}</p>
                    <p className="text-[11px] font-semibold text-navy-2">
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
          <h3 className="font-display font-bold text-navy">Domínio por matéria</h3>
          <p className="mt-0.5 text-[11px] text-navy-2">
            Cinza = ainda não medimos você nessa matéria.
          </p>
          <ul className="mt-4 space-y-3">
            {mapa.map((m) => {
              const faixa = faixaDe(m.pct);
              return (
                <li key={m.id}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className={cn("font-semibold", m.medido ? "text-navy" : "text-navy-2")}>
                      {m.nome}
                    </span>
                    <span className="shrink-0 text-[11px] font-bold text-navy-2">
                      {m.medido ? `${m.correct}/${m.answered} · ${faixa.label}` : "não medido"}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-mist">
                    {m.medido && (
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(m.pct, 4)}%`, background: faixa.cor }}
                      />
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
            <PenLine size={16} className="text-navy" />
            <h3 className="font-display font-bold text-navy">Redação</h3>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist">
              <div
                className="h-full rounded-full bg-yellow transition-all duration-700"
                style={{ width: `${Math.round((licoesFeitas / TOTAL_LICOES) * 100)}%` }}
              />
            </div>
            <span className="shrink-0 font-display text-xs font-bold text-navy-2">
              {licoesFeitas}/{TOTAL_LICOES}
            </span>
          </div>
          <Link to="/redacao" className="btn-outline mt-4 w-full">
            {licoesFeitas === 0 ? "Começar o treino de redação" : "Continuar o treino"}
          </Link>
        </div>

        {medidas.length === 0 && (
          <div className="card-soft p-5 text-center">
            <p className="text-sm leading-relaxed text-slate">
              Seu mapa se preenche sozinho conforme você responde. Faça a primeira aula de 60s e
              volte aqui.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-navy-mist">{icon}</div>
      <p className="mt-1 font-display text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-navy-mist">{label}</p>
    </div>
  );
}

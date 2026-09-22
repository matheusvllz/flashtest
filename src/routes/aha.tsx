import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { FocaSays } from "@/components/brand/FocaSays";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { StatTile } from "@/components/ds/StatTile";
import { XpChip } from "@/components/ds/XpChip";
import { useAppState } from "@/lib/store";
import { HOME_ROUTE } from "@/lib/features";

export const Route = createFileRoute("/aha")({ component: Aha, ssr: false });

/** Badge de severidade sem vermelho — erro é só feedback de resposta (docs/18 §13.4). */
const SEVERITY: Record<string, { label: string; badgeClass: string; fill: number }> = {
  alta: { label: "Lacuna alta", badgeClass: "bg-mar/12 text-mar-fundo", fill: 82 },
  média: { label: "Lacuna média", badgeClass: "bg-gelo text-abismo", fill: 55 },
  baixa: { label: "A confirmar", badgeClass: "bg-alert/15 text-abismo", fill: 30 },
};

/**
 * Aha moment — a tela que fecha o quiz (SDD 12, Development 1, entregável 4).
 * Mostra que o app já entendeu o aluno: 3 lacunas nomeadas, amarradas à faculdade-alvo,
 * mais XP e streak dia 1. As lacunas vêm da heurística em lib/gaps.ts nesta fase.
 */
function Aha() {
  const s = useAppState();
  const firstName = (s.prefs.name || "estudante").split(" ")[0];
  const chosen = s.prefs.targetInstitution;
  const hasTarget = !!chosen && chosen !== "Ainda não decidi";
  const target = hasTarget ? chosen : "a faculdade que você escolher";
  const gaps = s.quiz.gaps;
  const [revealed, setRevealed] = useState(0);

  // Revela as lacunas uma a uma — é o que dá o peso de "diagnóstico" à tela.
  useEffect(() => {
    if (revealed >= gaps.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 420 + revealed * 180);
    return () => clearTimeout(t);
  }, [revealed, gaps.length]);

  return (
    <PhoneFrame>
      <div className="relative min-h-screen overflow-hidden bg-neve px-6 pt-14 pb-32">
        <div className="pointer-events-none absolute -right-16 -top-16 opacity-[0.06]">
          <FocaMark variant="line-dark" size={280} decorative />
        </div>

        <div className="relative">
          <FocaSays slot="aha" expression="surpresa" size={64} />

          <div className="ds-label mt-6">Diagnóstico pronto</div>
          <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.1] tracking-tight text-abismo">
            Já entendi você, {firstName}.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-nevoa">
            Pra{" "}
            {s.prefs.targetCourse && s.prefs.targetCourse !== "Ainda não decidi" ? (
              <>
                <span className="font-semibold text-abismo">{s.prefs.targetCourse}</span> em{" "}
              </>
            ) : null}
            <span className="font-semibold text-abismo">{target}</span>, estas são as 3 lacunas que
            mais custam pontos hoje. É por elas que suas aulas de 60s começam.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            {gaps.map((g, i) => {
              const sev = SEVERITY[g.severity] ?? SEVERITY.baixa;
              const show = i < revealed;
              return (
                <div
                  key={g.topic}
                  className="card-soft p-4 transition-all duration-500"
                  style={{
                    opacity: show ? 1 : 0,
                    transform: show ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-2xl font-bold text-mar-fundo">{i + 1}</span>
                        <span className="font-display text-[17px] font-bold leading-tight text-abismo">
                          {g.topic}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-nevoa">{g.subjectName}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${sev.badgeClass}`}
                    >
                      {sev.label}
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar
                      value={show ? sev.fill : 0}
                      tone="caneta"
                      label={`Severidade de ${g.topic}`}
                    />
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-nevoa">{g.reason}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="card-soft p-4">
              <div className="flex items-center gap-1.5">
                <FocaMark size={16} decorative />
                <span className="text-[11px] font-bold uppercase tracking-wider text-nevoa">
                  XP inicial
                </span>
              </div>
              <div className="mt-2">
                <XpChip amount={s.progress.xp} />
              </div>
            </div>
            <StatTile
              icon={<Flame size={18} />}
              label="Sequência"
              value={`Dia ${s.progress.streak || 1}`}
            />
          </div>
        </div>

        <footer className="fixed bottom-0 left-1/2 w-full max-w-[440px] -translate-x-1/2 border-t-2 border-gelo bg-neve/95 px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur">
          <Link to={HOME_ROUTE} className="btn-primary w-full">
            Entrar no meu plano
          </Link>
        </footer>
      </div>
    </PhoneFrame>
  );
}

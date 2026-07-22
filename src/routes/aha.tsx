import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bolt, PhoneFrame } from "@/components/AppShell";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/aha")({ component: Aha, ssr: false });

const SEVERITY: Record<string, { label: string; color: string; fill: number }> = {
  alta: { label: "Lacuna alta", color: "#C0392B", fill: 82 },
  média: { label: "Lacuna média", color: "#FEB803", fill: 55 },
  baixa: { label: "A confirmar", color: "#8B91A8", fill: 30 },
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
      <div className="relative min-h-screen overflow-hidden bg-navy px-6 pt-14 pb-32 text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 opacity-[0.07]">
          <Bolt size={280} />
        </div>

        <div className="relative">
          <div className="ds-label" style={{ color: "#FEB803" }}>
            Diagnóstico pronto
          </div>
          <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.1] tracking-tight">
            Já entendi você, {firstName}.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-navy-mist">
            Pra{" "}
            {s.prefs.targetCourse && s.prefs.targetCourse !== "Ainda não decidi" ? (
              <>
                <span className="font-semibold text-white">{s.prefs.targetCourse}</span> em{" "}
              </>
            ) : null}
            <span className="font-semibold text-white">{target}</span>, estas são as 3 lacunas que
            mais custam pontos hoje. É por elas que suas aulas de 60s começam.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            {gaps.map((g, i) => {
              const sev = SEVERITY[g.severity] ?? SEVERITY.baixa;
              const show = i < revealed;
              return (
                <div
                  key={g.topic}
                  className="rounded-2xl bg-white/[0.07] p-4 transition-all duration-500"
                  style={{
                    opacity: show ? 1 : 0,
                    transform: show ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-2xl font-bold text-yellow">{i + 1}</span>
                        <span className="font-display text-[17px] font-bold leading-tight">
                          {g.topic}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-navy-mist">{g.subjectName}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                      style={{
                        background: `${sev.color}26`,
                        color: sev.color === "#8B91A8" ? "#AEB8E8" : sev.color,
                      }}
                    >
                      {sev.label}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: show ? `${sev.fill}%` : "0%", background: sev.color }}
                    />
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-navy-mist">{g.reason}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.07] p-4">
              <div className="flex items-center gap-1.5">
                <Bolt size={15} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-mist">
                  XP inicial
                </span>
              </div>
              <p className="mt-1.5 font-display text-2xl font-bold">{s.progress.xp}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.07] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy-mist">
                Sequência
              </span>
              <p className="mt-1.5 font-display text-2xl font-bold">
                Dia {s.progress.streak || 1} <span className="text-yellow">🔥</span>
              </p>
            </div>
          </div>
        </div>

        <footer className="fixed bottom-0 left-1/2 w-full max-w-[440px] -translate-x-1/2 bg-navy px-6 pt-3 pb-6">
          <Link to="/dashboard" className="btn-primary w-full">
            <Bolt size={18} color="#02104E" /> Entrar no meu plano
          </Link>
        </footer>
      </div>
    </PhoneFrame>
  );
}

import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { hojeISO, useAppState } from "@/lib/store";
import { HOME_ROUTE, FEATURES } from "@/lib/features";
import { activeSkills } from "@/content/taxonomy";
import { mastery } from "@/lib/adaptive/model";
import { confidence } from "@/lib/adaptive/confidence";
import { planWithFallback } from "@/lib/adaptive";
import { formatTrace, getTrace } from "@/lib/adaptive/trace";

export const Route = createFileRoute("/debug")({ component: DebugPage, ssr: false });

/**
 * Painel de depuração (docs/30 §27, Fase 8 do docs/31 F8.9) — só acessível
 * com `?debug=1` ou em dev (`import.meta.env.DEV`); fora disso, redireciona
 * pra home. Visual propositalmente simples: é ferramenta interna, não tela
 * de produto.
 *
 * Divergência registrada (docs/32): a aba "Áudio" não chama
 * `getAudioDiagnostics()` — essa função nunca foi implementada na Fase 1
 * (áudio/háptico), que ficou parcial nesta execução por depender de
 * dispositivo físico. A aba mostra isso honestamente em vez de inventar um
 * diagnóstico que não existe.
 */
function autorizado(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

type Aba = "plano" | "habilidades" | "tentativas" | "audio" | "flags";

function DebugPage() {
  if (!autorizado()) return <Navigate to={HOME_ROUTE} />;
  return (
    <AppShell>
      <DebugPanel />
    </AppShell>
  );
}

function DebugPanel() {
  const s = useAppState();
  const [aba, setAba] = useState<Aba>("plano");
  const hoje = hojeISO();

  const plano = useMemo(() => {
    const resultado = planWithFallback(s, hoje, hoje, { n: 8, gravarTrace: true });
    return { resultado, trace: getTrace() };
  }, [s, hoje]);

  const habilidades = useMemo(
    () =>
      activeSkills().map((sk) => {
        const entry = s.learning.skillModel[sk.id];
        const c = confidence(entry, s.learning.skillEvidence[sk.id], hoje);
        const schedule = s.learning.reviewSchedule[sk.id];
        return {
          id: sk.id,
          name: sk.name,
          mastery: mastery(entry),
          confidence: c.value,
          sigma: entry?.sigma?.toFixed(2) ?? "—",
          nEff: entry?.nEff?.toFixed(1) ?? "0",
          due: schedule?.dueDate ?? "—",
        };
      }),
    [s, hoje],
  );

  const tentativas = [...s.learning.recentAttempts].reverse().slice(0, 30);

  function exportarJSON() {
    const bundle = {
      geradoEm: new Date().toISOString(),
      plano: plano.resultado,
      trace: plano.trace,
      habilidades,
      tentativasRecentes: tentativas,
      flags: FEATURES,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `foca-debug-${hoje}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-bold text-abismo">Debug</h1>
        <button type="button" onClick={exportarJSON} className="btn-outline px-3 py-1.5 text-xs">
          Exportar JSON
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist">
        {(["plano", "habilidades", "tentativas", "audio", "flags"] as Aba[]).map((t) => (
          <button
            type="button"
            key={t}
            role="tab"
            aria-selected={aba === t}
            onClick={() => setAba(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${aba === t ? "bg-mar text-on-mar" : "border-2 border-gelo text-abismo"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {aba === "plano" && (
        <div className="space-y-2">
          <p className="text-xs text-nevoa">
            {plano.resultado.fallback ? "FALLBACK (motor não gerou nada elegível)" : `${plano.resultado.activities.length} atividades`}
          </p>
          {plano.trace.map((entry, i) => (
            <pre key={i} className="whitespace-pre-wrap rounded-lg border-2 border-gelo bg-neve p-2.5 text-[11px] text-abismo">
              {formatTrace(entry)}
            </pre>
          ))}
        </div>
      )}

      {aba === "habilidades" && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-nevoa">
                <th className="p-1">Habilidade</th>
                <th className="p-1">Mastery</th>
                <th className="p-1">Confidence</th>
                <th className="p-1">σ</th>
                <th className="p-1">nEff</th>
                <th className="p-1">Devida</th>
              </tr>
            </thead>
            <tbody>
              {habilidades.map((h) => (
                <tr key={h.id} className="border-t border-gelo">
                  <td className="p-1">{h.name}</td>
                  <td className="p-1">{h.mastery}</td>
                  <td className="p-1">{h.confidence}</td>
                  <td className="p-1">{h.sigma}</td>
                  <td className="p-1">{h.nEff}</td>
                  <td className="p-1">{h.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aba === "tentativas" && (
        <div className="space-y-1.5">
          {tentativas.map((a) => (
            <div key={a.id} className="rounded-lg border-2 border-gelo bg-neve p-2 text-[11px] text-abismo">
              {a.localDate} · {a.exerciseId} · {a.skillIds.join(", ") || "sem habilidade"} ·{" "}
              {a.response === "dont-know" ? "não sei" : a.correct ? "certo" : "errado"}
            </div>
          ))}
          {tentativas.length === 0 && <p className="text-xs text-nevoa">Nenhuma tentativa registrada ainda.</p>}
        </div>
      )}

      {aba === "audio" && (
        <p className="text-xs text-nevoa">
          Diagnóstico de áudio ainda não existe no código (`getAudioDiagnostics` é uma função planejada, Fase 1 do
          docs/31, que ficou parcial por depender de dispositivo físico — ver docs/32).
        </p>
      )}

      {aba === "flags" && (
        <pre className="whitespace-pre-wrap rounded-lg border-2 border-gelo bg-neve p-2.5 text-[11px] text-abismo">
          {JSON.stringify(FEATURES, null, 2)}
        </pre>
      )}
    </div>
  );
}

/**
 * "Seu ano no Foca" (spec 50 §5.7.3, T-50.8.2): contagens do próprio aluno; sem nota, sem previsão, sem posição.
 * Cartão para compartilhar reaproveita o do marco (sem dado pessoal).
 */
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { minhaRetrospectiva } from "@/lib/api/retrospectiva";
import { COPY } from "@/lib/copy";
import { FEATURES } from "@/lib/features";
import type { Retrospectiva } from "@/server/retrospectiva";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | ({ tipo: "pronto" } & Retrospectiva);

function dataLonga(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12)).toLocaleDateString("pt-BR", { day: "numeric", month: "long", timeZone: "UTC" });
}

export function TelaRetrospectiva() {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const t = COPY.retrospectiva;
  useEffect(() => {
    let vivo = true;
    minhaRetrospectiva()
      .then((r) => vivo && setEstado(r.ok ? { tipo: "pronto", ...r } : { tipo: "erro" }))
      .catch(() => vivo && setEstado({ tipo: "erro" }));
    return () => {
      vivo = false;
    };
  }, []);
  const p = estado.tipo === "pronto" ? estado : null;
  return (
    <AppShell title={p ? t.titulo(p.ano) : t.link}>
      <div className="space-y-4 px-5 pt-2 pb-10" data-testid="tela-retrospectiva">
        {estado.tipo === "carregando" && <p className="text-sm text-nevoa">{t.carregando}</p>}
        {estado.tipo === "erro" && <p className="card-soft p-4 text-sm">{t.erro}</p>}
        {p && !p.aberta && <p className="card-soft p-4 text-sm text-abismo">{t.fechada(dataLonga(p.inicio))}</p>}
        {p && p.aberta && (
          <>
            <div className="flex justify-center">
              <FocaMark forma={FEATURES.focaCorpo ? "corpo" : "cabeca"} size={140} decorative expression="orgulhosa" pose="parada" />
            </div>
            <ul className="grid grid-cols-2 gap-2" data-testid="numeros-retrospectiva">
              {[t.dias(p.dias), t.licoes(p.licoes), t.questoes(p.questoes), t.ofensiva(p.melhorOfensiva), t.redacoes(p.redacoes), t.simulados(p.simulados)].map(
                (linha) => (
                  <li key={linha} className="card-soft p-3 text-sm font-semibold text-abismo">
                    {linha}
                  </li>
                ),
              )}
            </ul>
            {p.areas.length > 0 && (
              <section className="card-soft space-y-1 p-4">
                <p className="ds-label">{t.areas}</p>
                <ol className="space-y-1 text-sm text-abismo">
                  {p.areas.map((a) => (
                    <li key={a.area}>
                      {t.nomesAreas[a.area]} · <span className="text-nevoa">{COPY.retrospectiva.questoes(a.questoes)}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <p className="text-sm text-nevoa">{t.fecho}</p>
          </>
        )}
      </div>
    </AppShell>
  );
}

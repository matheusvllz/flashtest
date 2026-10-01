import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { FocaSays } from "@/components/brand/FocaSays";
import { XpChip } from "@/components/ds/XpChip";
import { AreaCard, LegendaDasFaixas } from "@/components/learning/PlacementResult";
import { AREA_NAMES } from "@/content/taxonomy/areas";
import { faixaDaAreaPlacement, precisaoDaArea } from "@/lib/adaptive/display";
import { COPY } from "@/lib/copy";
import { irParaEstudo } from "@/lib/conta/entrada";
import { FEATURES, HOME_ROUTE } from "@/lib/features";
import { useAppState } from "@/lib/store";
import type { EnemArea } from "@/content/taxonomy";

export const Route = createFileRoute("/aha")({ component: Aha, ssr: false });

const NAO_DECIDIU = "Ainda não decidi";

/**
 * Ponto de partida (spec 48 T-48.4.3, D48-12; B-068). Substitui as "3 lacunas" com selo de severidade, que vinham de
 * heurística sobre o perfil e eram apresentadas como medição.
 *
 * - **Medido:** se o nivelamento foi aplicado, a faixa por área (o mesmo cartão do resultado do nivelamento, C-NIV-8).
 * - **Declarado:** o que o aluno disse no perfil (matérias com mais e menos facilidade), rotulado como declaração.
 * - **Sem nivelamento** (quem pulou): diz que nada foi medido e oferece medir agora; a trilha começa pelo perfil e se
 *   ajusta a cada resposta. Diagnóstico, plano e trilha usam a mesma fonte (o modelo do motor e as preferências).
 */
function Aha() {
  const s = useAppState();
  const navigate = useNavigate();
  const nome = (s.prefs.name || "").trim().split(" ")[0] ?? "";
  const placement = s.learning.placement;
  const medido = Boolean(placement?.appliedAt);
  const areas = medido
    ? (Object.keys(placement?.areas ?? {}) as EnemArea[]).map((area) => {
        const estado = placement?.areas[area];
        return {
          area,
          faixa: faixaDaAreaPlacement(estado?.theta ?? null),
          precisao: precisaoDaArea(estado?.se ?? null),
          respondidas: estado?.itemIds.length ?? 0,
        };
      })
    : [];
  const curso = s.prefs.targetCourse && s.prefs.targetCourse !== NAO_DECIDIU ? s.prefs.targetCourse : "";
  const faculdade = s.prefs.targetInstitution && s.prefs.targetInstitution !== NAO_DECIDIU ? s.prefs.targetInstitution : "";
  const alvo = COPY.diagnostico.alvo(curso, faculdade);
  const dificeis = s.prefs.difficultSubjects;
  const faceis = s.prefs.easySubjects ?? [];

  return (
    <PhoneFrame variant="reading">
      <div className="relative min-h-screen overflow-hidden bg-neve px-6 pt-14 pb-32">
        {/* Marca d'água por tema (docs/36 T-08.6, §G.8): contorno escuro no claro, contorno claro no escuro. */}
        <div className="pointer-events-none absolute -right-16 -top-16 opacity-[0.06]" data-aha-marca>
          <div className="dark:hidden" data-marca-tema="claro">
            <FocaMark variant="line-dark" size={280} decorative />
          </div>
          <div className="hidden dark:block" data-marca-tema="escuro">
            <FocaMark variant="line-light" size={280} decorative />
          </div>
        </div>

        <div className="relative">
          <FocaSays slot="aha" expression="neutra" size={64} />

          <div className="ds-label mt-6">{COPY.diagnostico.rotulo}</div>
          <h1 className="mt-3 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-abismo">
            {COPY.diagnostico.titulo(nome)}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-nevoa" data-testid="diagnostico-corpo">
            {medido ? COPY.diagnostico.comMedicao : COPY.diagnostico.semMedicao}
          </p>
          {alvo && <p className="mt-2 text-sm font-semibold text-abismo">{alvo}</p>}

          {medido && (
            <section className="mt-6" aria-labelledby="diag-medido">
              <h2 id="diag-medido" className="font-display text-base font-bold text-abismo">
                {COPY.diagnostico.medidoTitulo}
              </h2>
              <div className="mt-2">
                <LegendaDasFaixas />
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {areas.map((a) => (
                  <AreaCard key={a.area} nome={AREA_NAMES[a.area]} faixa={a.faixa} precisao={a.precisao} respondidas={a.respondidas} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-6 card-soft p-4" aria-labelledby="diag-declarado" data-testid="diagnostico-declarado">
            <h2 id="diag-declarado" className="font-display text-base font-bold text-abismo">
              {COPY.diagnostico.declaradoTitulo}
            </h2>
            {dificeis.length === 0 && faceis.length === 0 ? (
              <p className="mt-2 text-sm text-abismo">{COPY.diagnostico.nadaDeclarado}</p>
            ) : (
              <div className="mt-2 space-y-1 text-sm text-abismo">
                {dificeis.length > 0 && <p>{COPY.diagnostico.dificuldades(dificeis.join(", "))}</p>}
                {faceis.length > 0 && <p>{COPY.diagnostico.facilidades(faceis.join(", "))}</p>}
              </div>
            )}
            <p className="mt-2 text-xs text-nevoa">{COPY.diagnostico.declaradoNota}</p>
          </section>

          {!medido && FEATURES.nivelamento && (
            <section className="mt-4 card-soft p-4" aria-labelledby="diag-medir">
              <p id="diag-medir" className="text-sm text-abismo">
                {COPY.diagnostico.medirExplica}
              </p>
              <Link to="/nivelamento" className="btn-outline mt-3 w-full">
                {COPY.diagnostico.medirAgora}
              </Link>
            </section>
          )}

          {s.progress.xp > 0 && (
            <div className="mt-4 card-soft p-4">
              <div className="flex items-center gap-1.5">
                <FocaMark size={16} decorative />
                <span className="text-[11px] font-bold uppercase tracking-wider text-nevoa">{COPY.diagnostico.xpInicial}</span>
              </div>
              <div className="mt-2">
                <XpChip amount={s.progress.xp} />
              </div>
            </div>
          )}
        </div>

        <footer className="fixed bottom-0 left-1/2 col-max-w -translate-x-1/2 border-t-2 border-gelo bg-neve/95 px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur">
          <button type="button" onClick={() => void irParaEstudo(navigate, HOME_ROUTE)} className="btn-primary w-full">
            {COPY.diagnostico.entrar}
          </button>
        </footer>
      </div>
    </PhoneFrame>
  );
}

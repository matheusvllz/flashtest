import { createFileRoute, lazyRouteComponent, useNavigate } from "@tanstack/react-router";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EstadoSalvamento } from "@/components/conta/EstadoSalvamento";
import { ChapterCompleteSheet } from "@/components/learning/ChapterCompleteSheet";
import { LearningPath } from "@/components/learning/LearningPath";
import { FocusLine } from "@/components/learning/journey/FocusLine";
import { FocusSheet } from "@/components/learning/journey/FocusSheet";
import { JourneyPath } from "@/components/learning/journey/JourneyPath";
import { SessionCard } from "@/components/learning/journey/SessionCard";
import { RecommendationHint } from "@/components/learning/path/RecommendationHint";
import { SubjectChips } from "@/components/learning/SubjectChips";
import { TrailHeader, trailGreeting } from "@/components/learning/TrailHeader";
import { IDS_AULAS_GERADAS, MATERIAS_COM_AULA_GERADA, sectionOfChapter } from "@/content/curriculum-tree";
import { ensureSubjects, isSubjectLoaded } from "@/lib/content/repository";
import { TrailPathSkeleton } from "@/components/learning/path/TrailSkeleton";
import { phaseById } from "@/content/microlicoes";
import { useJornadaEmDia } from "@/hooks/useJornadaEmDia";
import { usePlacementReconciliation } from "@/hooks/usePlacementReconciliation";
import { dispatchClosingFeedback } from "@/lib/feedback/dispatch-feedback";
import { COPY } from "@/lib/copy";
import { FEATURES } from "@/lib/features";
import { pathFocus, resolveFocusTarget } from "@/lib/learning/path-layout";
import { studyFocusVazio, type StudyFocus } from "@/lib/learning/types";
import { buildTrail, isSectionCompleted, type TrailChapter, type TrailModel } from "@/lib/learning/trail";
import {
  atividadeHoje,
  clearExpiredFocusSession,
  clearFocusSession,
  commitPlan,
  getState,
  hojeISO,
  marcarMetaCelebrada,
  markChapterCelebrated,
  recordEvent,
  setActiveLearningSession,
  setStudyFocus,
  setTrailSubject,
  startFocusSession,
  syncJourneyWithCompletions,
  useAppState,
} from "@/lib/store";

export const Route = createFileRoute("/trilha")({
  component: TrilhaRoute,
  ssr: false,
  // Sob demanda (docs/44 §3): estes dois ficam fora do chunk da rota e importam o AppShell; estáticos, eles
  // arrastavam o store e o conteúdo do produto para o JS inicial de TODA página, inclusive a landing.
  pendingComponent: lazyRouteComponent(() => import("@/components/learning/path/TrailSkeleton"), "TrailSkeleton"),
  errorComponent: lazyRouteComponent(() => import("@/components/learning/path/TrailError"), "TrailError"),
  validateSearch: (
    raw: Record<string, unknown>,
  ): { concluida?: string; capitulo?: string; vista?: "mapa"; pulada?: "1" } => ({
    concluida: typeof raw.concluida === "string" ? raw.concluida : undefined,
    capitulo: typeof raw.capitulo === "string" ? raw.capitulo : undefined,
    vista: raw.vista === "mapa" ? "mapa" : undefined,
    // `?pulada=1` (docs/36 RF-3): a atividade que o aluno tentou abrir foi descartada por falta de questões.
    pulada: raw.pulada === "1" || raw.pulada === 1 ? "1" : undefined,
  }),
});

/** Acha, na árvore já construída, o capítulo cujo id bate — usado pro `?capitulo=` da folha de celebração. */
function findTrailChapter(model: TrailModel, chapterId: string): TrailChapter | undefined {
  for (const subject of model.subjects) {
    for (const section of subject.sections) {
      const chapter = section.chapters.find((c) => c.id === chapterId);
      if (chapter) return chapter;
    }
  }
  return undefined;
}

/** Acha a matéria dona do nó `lessonId` — usado pro `?concluida=` selecionar o chip certo. */
function findSubjectIdForNode(model: TrailModel, lessonId: string): string | undefined {
  for (const subject of model.subjects) {
    for (const section of subject.sections) {
      for (const chapter of section.chapters) {
        if (chapter.nodes.some((n) => n.id === lessonId)) return subject.id;
      }
    }
  }
  return undefined;
}

/** Card de oferta de nivelamento pra aluno antigo (`onboardingVersion === 1`): dispensar some por 30 dias (docs/30 §12, edge case, Fase 13 F13.7). */
function dispensadoNosUltimos30Dias(events: { type: string; localDate: string }[], hoje: string): boolean {
  const ultimo = [...events].reverse().find((e) => e.type === "placement-card-dismissed");
  if (!ultimo) return false;
  const dias = Math.round(
    (new Date(`${hoje}T00:00:00Z`).getTime() - new Date(`${ultimo.localDate}T00:00:00Z`).getTime()) / 86_400_000,
  );
  return dias < 30;
}

function TrilhaRoute() {
  const s = useAppState();
  const navigate = useNavigate();
  const search = Route.useSearch();
  // Ordem dos efeitos desta rota (docs/36 T-03.3): reconciliação do nivelamento -> sincronização
  // da jornada (e) -> `ensurePlan`. O hook vem ANTES de todos os efeitos abaixo de propósito, e
  // `ensurePlan` não roda enquanto `aplicando` (senão montaria plano com o modelo velho).
  const { aplicando } = usePlacementReconciliation();
  // Bump quando um pacote de matéria termina de carregar: as aulas geradas
  // passam a resolver em `phaseById` e o modelo precisa ser refeito.
  const [pacotesVersao, setPacotesVersao] = useState(0);
  const model = useMemo(
    () => buildTrail(s, hojeISO()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, pacotesVersao],
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  // A matéria selecionada VIVE no store (`prefs.trailSubjectId`) — trocar de
  // chip chama `setTrailSubject`, o que já refaz `model` e persiste sozinho
  // (docs/25 §18 T-18: "trocar chip persiste... após reload").
  const selectedSubjectId = model.defaultSubjectId;

  // (a) Meta diária — migrada do dashboard pra cá (docs/25 §12.1/§18 T-18),
  // mesmo guard persistido (`celebrouMeta`) pra não repetir a cada visita.
  const hoje = atividadeHoje(s);
  const metaFechada = hoje.completedBlockIds.length >= s.prefs.dailyLessons;
  useEffect(() => {
    if (metaFechada && !hoje.celebrouMeta) {
      dispatchClosingFeedback(["meta-diaria"]);
      marcarMetaCelebrada();
    }
  }, [metaFechada, hoje.celebrouMeta]);

  // (b) `?concluida=` seleciona a matéria dona da lição, uma vez — o próprio
  // guard `!== subjectId` evita repetir a cada render depois de já selecionar.
  useEffect(() => {
    if (!search.concluida) return;
    const subjectId = findSubjectIdForNode(model, search.concluida);
    if (subjectId && s.prefs.trailSubjectId !== subjectId) {
      setTrailSubject(subjectId);
    }
  }, [search.concluida, model, s.prefs.trailSubjectId]);

  // (c) `?capitulo=` abre a folha de celebração uma vez por capítulo.
  useEffect(() => {
    if (search.capitulo && !s.learning.celebratedChapterIds.includes(search.capitulo)) {
      setSheetOpen(true);
    }
  }, [search.capitulo, s.learning.celebratedChapterIds]);

  function closeChapterSheet() {
    setSheetOpen(false);
    if (search.capitulo) markChapterCelebrated(search.capitulo);
    navigate({ to: "/trilha", search: {}, replace: true });
  }

  // (d) Sessão ativa órfã (lição removida do catálogo) é limpa uma única vez —
  // nunca trava a trilha numa recomendação impossível de cumprir.
  const limpezaFeitaRef = useRef(false);
  useEffect(() => {
    if (limpezaFeitaRef.current) return;
    limpezaFeitaRef.current = true;
    const sessao = s.learning.activeSession;
    // Aula gerada (pacote ainda não carregado) não é órfã — só não está em memória (docs/30 §21.3).
    if (sessao && !phaseById(sessao.contentId) && !IDS_AULAS_GERADAS.has(sessao.contentId)) {
      setActiveLearningSession(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (e) Jornada: uma aula/legado que a jornada mandou pra `/learn`/`/redacao`
  // termina lá, nunca de volta aqui dentro — sem sincronizar ao voltar pra
  // home, `activeActivity` nunca sai do topo de `committed`, e a jornada
  // repete pra sempre a MESMA lição já concluída (`completedLessons`/
  // `progress.lessons` avançam, a fila da jornada não — achado de teste em
  // dispositivo físico, docs/32 F15.3). Roda uma vez por montagem, como (d).
  const syncJornadaFeitaRef = useRef(false);
  useEffect(() => {
    if (syncJornadaFeitaRef.current) return;
    syncJornadaFeitaRef.current = true;
    syncJourneyWithCompletions();
  }, []);

  const chapterDoSheet = search.capitulo ? findTrailChapter(model, search.capitulo) : undefined;
  const secaoDoSheet = search.capitulo ? sectionOfChapter(search.capitulo) : undefined;
  const sectionCompleted = secaoDoSheet ? isSectionCompleted(secaoDoSheet.section, s) : false;
  // Se o capítulo tem revisão sintética e ela já está disponível (capítulo
  // acabou de fechar), a folha oferece o atalho direto (docs/25 §12.4).
  const revisaoDoSheet = chapterDoSheet?.nodes.find((n) => n.kind === "revisao" && n.status !== "locked");

  // Trilha visual (docs/27 §6.2, §11.3; docs/28 T-15): foco da matéria
  // selecionada, o alvo que o callout mostra, e a dica secundária quando o
  // foco GLOBAL (`continueTarget`) está em outra matéria.
  const focus = useMemo(() => pathFocus(model, selectedSubjectId), [model, selectedSubjectId]);
  const subject = model.subjects.find((x) => x.id === selectedSubjectId);
  const focusTarget = useMemo(
    () => (subject ? resolveFocusTarget(model, subject, focus) : null),
    [model, subject, focus],
  );
  const greeting = trailGreeting(s);
  const target = model.continueTarget;
  const hintSubjectName = target ? model.subjects.find((x) => x.id === target.subjectId)?.name : undefined;
  const showHint = Boolean(
    target && hintSubjectName && target.subjectId !== selectedSubjectId && focus?.scope !== "global",
  );

  // Jornada única (docs/30 §14, Fase 12 F12.6) — atrás da flag, substitui
  // `SubjectChips`+`RecommendationHint`+`LearningPath` por `SessionCard`+
  // `FocusLine`+`JourneyPath`; `?vista=mapa` (ou o botão "Ver mapa das
  // matérias" no fim do caminho) mostra a trilha por matéria de sempre como
  // vista secundária, sem perder o replanejamento em segundo plano. Flag
  // desligada: nada abaixo deste bloco roda (`/trilha` idêntica a hoje).
  const [focusSheetOpen, setFocusSheetOpen] = useState(false);
  // Plano da jornada em dia (o mesmo hook do /plan, spec 48 T-48.4.2).
  useJornadaEmDia(s, aplicando);

  // Aviso de uma linha quando a atividade foi descartada (docs/36 RF-3/RU-1): some ao fechar ou em 6 s.
  const avisoPulada = search.pulada === "1";
  const fecharAvisoPulada = () => navigate({ to: "/trilha", search: {}, replace: true });
  useEffect(() => {
    if (!avisoPulada) return;
    const t = setTimeout(() => navigate({ to: "/trilha", search: {}, replace: true }), 6000);
    return () => clearTimeout(t);
  }, [avisoPulada, navigate]);

  function applyFocus(subjectIds: string[], scope: "permanent" | "session") {
    if (scope === "session") startFocusSession(subjectIds);
    else setStudyFocus({ mode: "materias", subjectIds, areas: [] } satisfies StudyFocus);
    setFocusSheetOpen(false);
  }

  function clearFocus() {
    clearFocusSession();
    setStudyFocus(studyFocusVazio());
    setFocusSheetOpen(false);
  }

  const mostrarJornada = FEATURES.jornadaAdaptativa && search.vista !== "mapa";

  // Mapa: a matéria selecionada com aula gerada carrega o pacote ao abrir
  // (docs/30 §21.3) — enquanto carrega, o caminho mostra o esqueleto (nó
  // "carregando", nunca some). Falhou (offline)? Mostra o mapa sem as aulas
  // geradas, uma tentativa por matéria por visita.
  const [materiasTentadas, setMateriasTentadas] = useState<Set<string>>(() => new Set());
  const carregandoMateria =
    !mostrarJornada &&
    MATERIAS_COM_AULA_GERADA.has(selectedSubjectId) &&
    !isSubjectLoaded(selectedSubjectId) &&
    !materiasTentadas.has(selectedSubjectId);
  useEffect(() => {
    if (!carregandoMateria) return;
    let vivo = true;
    void ensureSubjects([selectedSubjectId]).finally(() => {
      if (!vivo) return;
      setMateriasTentadas((atual) => new Set([...atual, selectedSubjectId]));
      setPacotesVersao((v) => v + 1);
    });
    return () => {
      vivo = false;
    };
  }, [carregandoMateria, selectedSubjectId]);
  const mostrarCardNivelamento =
    FEATURES.nivelamento &&
    s.prefs.onboardingVersion === 1 &&
    !s.learning.placement &&
    !dispensadoNosUltimos30Dias(s.learning.events, hojeISO());

  return (
    <AppShell layout="wide">
      {/* Desktop (docs/44 §5): o caminho no centro e o contexto do dia num painel à direita, preso ao rolar.
          Um DOM só: no celular o painel vem primeiro, como sempre (cabeçalho, convite ao nivelamento, sessão). */}
      {/* Tema da trilha comprado na loja (spec 50 §5.3.3): só o fundo muda. */}
      <div className="desk-split fundo-do-tema lg:px-8 lg:pt-8" data-tema={s.account?.cosmeticos?.tema ?? undefined}>
      <aside aria-label={COPY.trilha.painelContexto} className="desk-aside lg:space-y-4">
      <div className="bg-neve px-5 pb-3 pt-6 lg:card-soft lg:p-5">
        <TrailHeader s={s} />
        {/* Só aparece se a sincronização falhou ou se está sem conexão (spec 48 T-48.8.2): nada de aviso no caminho do estudo. */}
        <div className="mt-2 empty:hidden">
          <EstadoSalvamento discreto />
        </div>
      </div>

      {mostrarCardNivelamento && (
        <div className="mx-5 mb-3 card-soft p-4 lg:mx-0 lg:mb-0">
          <p className="text-sm font-bold text-abismo">{COPY.nivelamento.cardTrilhaTitulo}</p>
          <div className="mt-2.5 flex gap-2 lg:flex-col">
            <button type="button" onClick={() => navigate({ to: "/nivelamento" })} className="btn-primary flex-1">
              {COPY.nivelamento.fazerNivelamento}
            </button>
            <button
              type="button"
              onClick={() => recordEvent("placement-card-dismissed")}
              className="btn-ghost flex-1"
            >
              {COPY.nivelamento.cardTrilhaDispensar}
            </button>
          </div>
        </div>
      )}
      </aside>

      <div className="desk-main">
      {mostrarJornada ? (
        <div className="bg-neve px-5 pb-6 lg:px-0">
          {avisoPulada && (
            <div className="card-soft mb-3 flex items-start gap-2 p-3" role="status">
              <p className="flex-1 text-sm text-abismo">{COPY.jornada.puladaSemItens}</p>
              <button
                type="button"
                onClick={fecharAvisoPulada}
                aria-label={COPY.comum.fecharAviso}
                className="btn-ghost px-2 py-0.5 text-sm"
              >
                ×
              </button>
            </div>
          )}
          {aplicando ? (
            // Nivelamento sendo aplicado (docs/36 T-03.3, T-06.2, RU-11): nunca mostra o plano velho.
            <>
              <p role="status" className="text-sm font-semibold text-nevoa">
                {COPY.nivelamento.aplicando}
              </p>
              <TrailPathSkeleton />
            </>
          ) : (
            <>
              <SessionCard
                committed={s.learning.journey.committed}
                history={s.learning.journey.history}
                dailyMinutes={s.prefs.dailyMinutes}
                greeting={greeting}
              />
              <FocusLine
                studyFocus={s.prefs.studyFocus}
                focusSession={s.learning.focusSession}
                onOpenSheet={() => setFocusSheetOpen(true)}
              />
              <JourneyPath
                history={s.learning.journey.history}
                committed={s.learning.journey.committed}
                upcoming={s.learning.journey.upcoming}
              />
            </>
          )}
          <button
            type="button"
            onClick={() => navigate({ to: "/trilha", search: { vista: "mapa" } })}
            className="btn-outline mt-4 w-full"
          >
            {COPY.jornada.verMapa}
          </button>
          <FocusSheet
            open={focusSheetOpen}
            onClose={() => setFocusSheetOpen(false)}
            studyFocus={s.prefs.studyFocus}
            onApply={applyFocus}
            onClear={clearFocus}
          />
        </div>
      ) : (
        <>
          {FEATURES.jornadaAdaptativa && (
            <div className="bg-neve px-5 pb-2 pt-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/trilha", search: {} })}
                className="text-xs font-bold text-mar-fundo"
              >
                ← {COPY.jornada.voltarJornada}
              </button>
            </div>
          )}
          <SubjectChips subjects={model.subjects} selectedId={selectedSubjectId} onSelect={setTrailSubject} />

          <div className="bg-neve px-5 pb-6 lg:px-0" style={{ "--trail-sticky-top": "61px" } as CSSProperties}>
            {showHint && target && hintSubjectName ? (
              <RecommendationHint target={target} subjectName={hintSubjectName} />
            ) : null}
            {carregandoMateria ? (
              <TrailPathSkeleton />
            ) : (
              <LearningPath
                model={model}
                selectedSubjectId={selectedSubjectId}
                highlightId={search.concluida}
                focus={focus}
                focusTarget={focusTarget}
                greeting={greeting}
              />
            )}
          </div>
        </>
      )}
      </div>
      </div>

      {chapterDoSheet && (
        <ChapterCompleteSheet
          open={sheetOpen}
          chapter={chapterDoSheet}
          sectionCompleted={sectionCompleted}
          reviewTarget={revisaoDoSheet?.href}
          onClose={closeChapterSheet}
        />
      )}
    </AppShell>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ChapterCompleteSheet } from "@/components/learning/ChapterCompleteSheet";
import { ContinueCard } from "@/components/learning/ContinueCard";
import { LearningPath } from "@/components/learning/LearningPath";
import { SubjectChips } from "@/components/learning/SubjectChips";
import { TrailHeader } from "@/components/learning/TrailHeader";
import { sectionOfChapter } from "@/content/curriculum-tree";
import { phaseById } from "@/content/microlicoes";
import { dispatchClosingFeedback } from "@/lib/feedback/dispatch-feedback";
import { buildTrail, isSectionCompleted, type TrailChapter, type TrailModel } from "@/lib/learning/trail";
import {
  atividadeHoje,
  hojeISO,
  marcarMetaCelebrada,
  markChapterCelebrated,
  setActiveLearningSession,
  setTrailSubject,
  useAppState,
} from "@/lib/store";

export const Route = createFileRoute("/trilha")({
  component: TrilhaRoute,
  ssr: false,
  validateSearch: (raw: Record<string, unknown>): { concluida?: string; capitulo?: string } => ({
    concluida: typeof raw.concluida === "string" ? raw.concluida : undefined,
    capitulo: typeof raw.capitulo === "string" ? raw.capitulo : undefined,
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

function TrilhaRoute() {
  const s = useAppState();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const model = useMemo(() => buildTrail(s, hojeISO()), [s]);
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
    if (sessao && !phaseById(sessao.contentId)) {
      setActiveLearningSession(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chapterDoSheet = search.capitulo ? findTrailChapter(model, search.capitulo) : undefined;
  const secaoDoSheet = search.capitulo ? sectionOfChapter(search.capitulo) : undefined;
  const sectionCompleted = secaoDoSheet ? isSectionCompleted(secaoDoSheet.section, s) : false;
  // Se o capítulo tem revisão sintética e ela já está disponível (capítulo
  // acabou de fechar), a folha oferece o atalho direto (docs/25 §12.4).
  const revisaoDoSheet = chapterDoSheet?.nodes.find(
    (n) => n.kind === "revisao" && n.status !== "locked",
  );

  return (
    <AppShell>
      <div className="surface-pauta bg-neve px-5 pt-8 pb-5">
        <TrailHeader s={s} />
        <div className="mt-5">
          <ContinueCard target={model.continueTarget} />
        </div>
      </div>

      <SubjectChips subjects={model.subjects} selectedId={selectedSubjectId} onSelect={setTrailSubject} />

      <div className="bg-neve px-5 py-5">
        <LearningPath model={model} selectedSubjectId={selectedSubjectId} highlightId={search.concluida} />
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

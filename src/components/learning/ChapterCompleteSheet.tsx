import { Link } from "@tanstack/react-router";
import { FocaMark } from "@/components/brand/FocaMark";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { COPY } from "@/lib/copy";
import type { TrailChapter, TrailHref } from "@/lib/learning/trail";

/**
 * Folha de celebração de capítulo/seção (docs/25 §12.4, §18 T-18/T-23) —
 * mostrada uma vez por capítulo (`?capitulo=`, guard em `celebratedChapterIds`).
 * Sem som na montagem: o som de `capitulo-desbloqueado`/`recompensa-especial`
 * já tocou no evento de conclusão (`complete()`), não aqui.
 */
export function ChapterCompleteSheet({
  open,
  chapter,
  sectionCompleted,
  reviewTarget,
  onClose,
}: {
  open: boolean;
  chapter: TrailChapter;
  sectionCompleted: boolean;
  reviewTarget?: TrailHref;
  onClose: () => void;
}) {
  const titulo = sectionCompleted ? COPY.trilha.secaoConcluida : COPY.trilha.capituloConcluido;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={titulo}
      icon={<FocaMark expression="empolgada" size={56} decorative />}
    >
      <p className="mt-1.5 text-sm font-bold text-abismo">{chapter.title}</p>
      <p className="mt-1 text-sm text-nevoa">{COPY.trilha.fechouLicoes(chapter.totalCount)}</p>
      {reviewTarget && <p className="mt-1 text-sm text-nevoa">{COPY.trilha.revisaoAberta}</p>}
      <div className="mt-4">
        {reviewTarget ? (
          <Link {...reviewTarget} onClick={onClose} className="btn-primary w-full">
            {COPY.trilha.fazerRevisao}
          </Link>
        ) : (
          <button onClick={onClose} className="btn-primary w-full">
            {COPY.trilha.continuar}
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

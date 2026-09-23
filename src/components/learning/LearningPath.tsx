import { SubjectPath } from "./path/SubjectPath";
import { EmptyState } from "@/components/ds/EmptyState";
import type { FocaExpression } from "@/components/brand/FocaMark";
import type { PathFocus } from "@/lib/learning/path-layout";
import type { ContinueTarget, TrailModel } from "@/lib/learning/trail";
import type { VozSlot } from "@/lib/voz";

/**
 * Corpo da trilha pra UMA matéria (docs/25 §12.1; docs/27/28 T-14 troca o
 * "mapa" de acordeões pelo caminho visual em `SubjectPath`, mas preserva o
 * `EmptyState` de matéria vazia).
 *
 * Catálogo vazio (docs/25 §22, T-25 g): matéria sem seção com capítulos —
 * seja porque `selectedSubjectId` não bate com nenhuma matéria do modelo
 * (id órfão em `prefs.trailSubjectId`), seja porque a matéria existe mas
 * nenhuma seção dela tem capítulo — cai em `EmptyState` em vez de tela em
 * branco. Seções individualmente vazias (dentro de uma matéria que tem
 * outras seções com conteúdo) são só filtradas, pra não sobrar cabeçalho
 * de seção sem nada embaixo.
 */
export function LearningPath({
  model,
  selectedSubjectId,
  highlightId,
  focus,
  focusTarget,
  greeting,
}: {
  model: TrailModel;
  selectedSubjectId: string;
  highlightId?: string;
  focus: PathFocus | null;
  focusTarget: ContinueTarget | null;
  greeting: { slot: VozSlot; expression: FocaExpression };
}) {
  const subject = model.subjects.find((s) => s.id === selectedSubjectId);
  const sectionsComConteudo = subject?.sections.filter((section) => section.chapters.length > 0) ?? [];

  if (!subject || sectionsComConteudo.length === 0) {
    return <EmptyState text="Nada publicado nesta matéria ainda." />;
  }

  return (
    <SubjectPath
      key={subject.id}
      subject={{ ...subject, sections: sectionsComConteudo }}
      focus={focus}
      focusTarget={focusTarget}
      greeting={greeting}
      highlightId={highlightId}
    />
  );
}

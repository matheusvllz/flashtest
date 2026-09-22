import { ChapterCard } from "./ChapterCard";
import { SectionHeader } from "./SectionHeader";
import { EmptyState } from "@/components/ds/EmptyState";
import type { TrailModel } from "@/lib/learning/trail";

/**
 * Corpo da trilha pra UMA matéria (docs/25 §12.1, §18 T-18) — o "mapa" que
 * `/trilha` monta pra matéria selecionada nos chips. `defaultOpen` de cada
 * capítulo segue §18 T-18: aberto se contém o nó atual, se já está em
 * andamento, ou se contém o nó recém-destacado (`?concluida=`).
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
}: {
  model: TrailModel;
  selectedSubjectId: string;
  highlightId?: string;
}) {
  const subject = model.subjects.find((s) => s.id === selectedSubjectId);
  const sectionsComConteudo = subject?.sections.filter((section) => section.chapters.length > 0) ?? [];

  if (!subject || sectionsComConteudo.length === 0) {
    return <EmptyState text="Nada publicado nesta matéria ainda." />;
  }

  return (
    <div className="space-y-4">
      {sectionsComConteudo.map((section) => (
        <div key={section.id} className="space-y-3">
          <SectionHeader section={section} />
          {section.chapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              defaultOpen={
                chapter.containsCurrent ||
                chapter.status === "in-progress" ||
                chapter.nodes.some((n) => n.id === highlightId)
              }
              highlightId={highlightId}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

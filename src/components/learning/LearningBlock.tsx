import type { LessonBlock } from "@/lib/learning/types";
import { LearningDiagram } from "./LearningDiagram";

/**
 * Renderização discriminada dos blocos de ensino (docs/20 §8.3) — cada `type`
 * tem seu próprio layout controlado pelo design system. Conteúdo nunca
 * executa ação do store: os blocos são dado puro, só texto/estrutura.
 */
export function LearningBlockView({ block }: { block: LessonBlock }) {
  if (block.type === "diagram") return <LearningDiagram block={block} />;

  if (block.type === "concept") {
    return (
      <div className="card-soft space-y-1.5 p-4">
        <p className="ds-label">{block.title}</p>
        <p className="text-[15px] leading-relaxed text-abismo">{block.body}</p>
      </div>
    );
  }

  if (block.type === "worked-example") {
    return (
      <div className="card-soft space-y-2.5 p-4">
        <p className="ds-label">{block.title}</p>
        <p className="text-[15px] leading-relaxed text-abismo">{block.problem}</p>
        <ol className="list-decimal space-y-1 pl-4 text-sm text-abismo">
          {block.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <p className="rounded-lg border-2 border-gelo bg-neve px-3 py-2 text-sm font-bold text-abismo">
          {block.result}
        </p>
      </div>
    );
  }

  // comparison
  return (
    <div className="card-soft space-y-2 p-4">
      <p className="ds-label">{block.title}</p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-lg border-2 border-gelo bg-neve p-3">
          <p className="text-xs font-bold text-nevoa">{block.left.label}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-abismo">{block.left.body}</p>
        </div>
        <div className="rounded-lg border-2 border-gelo bg-neve p-3">
          <p className="text-xs font-bold text-nevoa">{block.right.label}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-abismo">{block.right.body}</p>
        </div>
      </div>
    </div>
  );
}

import type { ItemExplanationLayers } from "@/content/items/types";

/**
 * Nível 2 da explicação em camadas (docs/30 §17.1, Fase 7 F7.1/F7.2) —
 * conteúdo colapsável dentro de `FeedbackSheet` (o "Ver resolução"), pra
 * itens que têm `ItemMeta.explanationLayers` (autoral hoje; pipeline de
 * geração na Fase 9 popula em escala). Mesma estrutura visual que
 * `study.tsx` já usava pra `Question.stepByStep` — um card só, reaproveitado
 * pelos 3 players em vez de repetir o markup em cada um.
 */
/**
 * Quem monta `children` de `FeedbackSheet` precisa saber ANTES de renderizar
 * se há conteúdo — `FeedbackSheet` decide mostrar o "Ver resolução" pela
 * truthiness do próprio `children` (um elemento React é sempre truthy, ainda
 * que renderize `null` por dentro), então passar `<ExplanationLayers />`
 * incondicionalmente abriria um toggle vazio pra item sem nível 2.
 */
export function hasExplanationLayers(layers: ItemExplanationLayers | undefined): layers is ItemExplanationLayers {
  return !!layers && (!!layers.detalhada || !!layers.passos?.length);
}

export function ExplanationLayers({ layers }: { layers: ItemExplanationLayers }) {
  if (!layers.detalhada && !layers.passos?.length) return null;
  return (
    <div className="card-soft space-y-3 p-4">
      {layers.detalhada && <p className="text-sm leading-relaxed text-abismo">{layers.detalhada}</p>}
      {layers.passos && layers.passos.length > 0 && (
        <div>
          <p className="ds-label">Resolução passo a passo</p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-sm text-abismo">
            {layers.passos.map((passo, i) => (
              <li key={i}>{passo}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

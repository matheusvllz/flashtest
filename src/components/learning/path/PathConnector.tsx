import { memo } from "react";
import { connectorPathD } from "@/lib/learning/path-layout";
import { cn } from "@/lib/utils";

/** Traço entre dois nós (docs/27 §6.4): caneta sólida se o anterior foi concluído; lápis pontilhado se não. */
export const PathConnector = memo(function PathConnector({
  fromK,
  toK,
  traced,
  draw = false,
}: {
  fromK: number;
  toK: number;
  traced: boolean;
  /** true só no conector recém-liberado ao voltar de uma lição (RF-14). */
  draw?: boolean;
}) {
  return (
    <svg
      className={cn("path-connector", traced && "path-connector--traced", draw && "path-connector--draw")}
      viewBox="0 0 100 96"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={connectorPathD(fromK, toK)} pathLength={1} />
    </svg>
  );
});

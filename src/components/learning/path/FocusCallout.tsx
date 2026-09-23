import { FocaSays } from "@/components/brand/FocaSays";
import type { FocaExpression } from "@/components/brand/FocaMark";
import { ContinueCard } from "@/components/learning/ContinueCard";
import { COPY } from "@/lib/copy";
import type { PathFocus } from "@/lib/learning/path-layout";
import type { ContinueTarget } from "@/lib/learning/trail";
import type { VozSlot } from "@/lib/voz";

/** Foca + CTA logo abaixo do nó foco (docs/27 D-4, §6.5). Única Foca do <main>. */
export function FocusCallout({
  target,
  focus,
  pointerK,
  greeting,
}: {
  target: ContinueTarget;
  focus: PathFocus;
  pointerK: number;
  greeting: { slot: VozSlot; expression: FocaExpression };
}) {
  return (
    <div className="px-1 pb-4 pt-3 anim-float-in">
      <ContinueCard
        target={target}
        variant="callout"
        pointerK={pointerK}
        label={focus.scope === "subject" ? COPY.trilha.proximaNestaMateria : undefined}
        lead={<FocaSays slot={greeting.slot} expression={greeting.expression} compact motion="none" />}
      />
    </div>
  );
}

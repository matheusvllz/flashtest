import { ArrowDown, ArrowUp } from "lucide-react";
import { COPY } from "@/lib/copy";

/** Botão "voltar para a lição atual" (RF-10) — canto esquerdo; o direito é do FAB do tutor. */
export function JumpToFocusButton({ above, onJump }: { above: boolean; onJump: () => void }) {
  const Icon = above ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={onJump}
      aria-label={COPY.trilha.irParaAtual}
      className="anim-pop-in anchor-col-left fixed bottom-24 z-30 grid h-12 w-12 place-items-center rounded-full border-2 border-gelo bg-cards text-mar-fundo shadow-[0_3px_0_var(--gelo)] active:translate-y-[3px] active:shadow-none lg:bottom-8"
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}

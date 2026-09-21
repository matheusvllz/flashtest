import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Folha de baixo genérica (docs/18 §7.15). Substitui os modais centrados
 * sobre overlay escuro (ex.: confirmação de sair da lição) — fica na zona
 * do polegar e fecha com um toque fora, com botão ou com Escape.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Ex.: `<FocaMark expression="desapontada" size={56} decorative />` — a Foca em transição emocional (docs/18 §7.15). */
  icon?: ReactNode;
}) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;
    titleRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-abismo/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet anim-slide-up relative w-full max-w-[440px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3
            id={titleId}
            ref={titleRef}
            tabIndex={-1}
            className="font-display text-lg font-bold text-abismo outline-none"
          >
            {title}
          </h3>
        </div>
        <div className="mt-1.5">{children}</div>
      </div>
    </div>
  );
}

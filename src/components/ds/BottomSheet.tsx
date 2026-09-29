import { useId, useRef } from "react";
import type { ReactNode } from "react";
import { useDialogA11y } from "@/hooks/useDialogA11y";

/**
 * Folha de baixo genérica (docs/18 §7.15). Substitui os modais centrados
 * sobre overlay escuro (ex.: confirmação de sair da lição) — fica na zona
 * do polegar e fecha com um toque fora, com botão ou com Escape.
 *
 * Diálogo acessível (docs/36 T-08.5, RA-1): foco inicial no título, Tab preso
 * dentro da folha, Escape fecha, foco volta ao disparador, fundo `inert` e
 * scroll do fundo travado — tudo em `useDialogA11y`.
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
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogA11y({ open, onClose, dialogRef, rootRef, initialFocusRef: titleRef });

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-end justify-center pl-[var(--frame-rail,0px)]"
    >
      {/* Scrim: token `--scrim` (preto com alfa, 0,4 no claro / 0,55 no escuro), não
          `bg-abismo/40` — Abismo é token de TEXTO (inverte pra quase-branco no dark
          mode), então usá-lo aqui deixava o fundo esbranquiçado atrás da folha
          (achado de teste em dispositivo físico, docs/32 F15.3; docs/36 B4/T-08.4). */}
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onClose}
        className="scrim absolute inset-0"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet anim-slide-up col-max-w relative overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
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

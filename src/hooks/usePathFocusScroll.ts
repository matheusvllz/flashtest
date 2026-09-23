import { useCallback, useEffect, useRef, useState } from "react";
import { isComfortablyVisible, shouldAutoScroll } from "@/lib/learning/path-layout";

/** Altura do que fica fixo no topo (chips ≈ 61px + banner do capítulo ≈ 64px). */
export const PATH_TOP_INSET = 128;
/** Bottom nav (64px) + folga. */
export const PATH_BOTTOM_INSET = 88;

function rowEl(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-path-row="${CSS.escape(id)}"]`);
}
function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Rolagem única até o nó foco (RF-9) e visibilidade do foco para o botão
 * "voltar para a atual" (RF-10) — um único `IntersectionObserver` na tela
 * (docs/27 §7, docs/28 T-04).
 */
export function usePathFocusScroll({
  subjectId,
  focusId,
  highlightId,
  focusRendered,
}: {
  subjectId: string;
  focusId: string | null;
  highlightId?: string;
  /** false quando o capítulo do foco está recolhido (o <li> não existe no DOM). */
  focusRendered: boolean;
}): { focusOffscreen: boolean; focusAbove: boolean; scrollToFocus: () => void } {
  const doneKeyRef = useRef<string | null>(null);
  const [focusOffscreen, setFocusOffscreen] = useState(false);
  const [focusAbove, setFocusAbove] = useState(false);

  // (1) Rolagem de entrada — uma vez por (matéria, alvo).
  useEffect(() => {
    const target = highlightId ?? focusId;
    if (!target) return;
    const key = `${subjectId}|${target}`;
    if (
      !shouldAutoScroll({
        scrollY: window.scrollY,
        hasHighlight: Boolean(highlightId),
        doneKey: doneKeyRef.current,
        key,
      })
    ) {
      doneKeyRef.current = key; // posição restaurada pelo router vence; não tenta de novo
      return;
    }
    const raf = requestAnimationFrame(() => {
      doneKeyRef.current = key;
      const el = rowEl(target);
      if (!el) return;
      const ok = isComfortablyVisible(el.getBoundingClientRect(), {
        height: window.innerHeight,
        topInset: PATH_TOP_INSET,
        bottomInset: PATH_BOTTOM_INSET,
      });
      if (!ok) el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [subjectId, focusId, highlightId]);

  // (2) Visibilidade do foco — um observer, só no <li> do foco.
  useEffect(() => {
    if (!focusId || !focusRendered) {
      setFocusOffscreen(Boolean(focusId)); // foco existe mas capítulo recolhido → mostra o botão
      setFocusAbove(false);
      return;
    }
    const el = rowEl(focusId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setFocusOffscreen(!entry.isIntersecting);
        setFocusAbove(entry.boundingClientRect.top < 0);
      },
      { rootMargin: `-${PATH_TOP_INSET}px 0px -${PATH_BOTTOM_INSET}px 0px`, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [focusId, focusRendered]);

  const scrollToFocus = useCallback(() => {
    if (!focusId) return;
    rowEl(focusId)?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [focusId]);

  return { focusOffscreen, focusAbove, scrollToFocus };
}

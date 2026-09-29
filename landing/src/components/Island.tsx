import type { ReactNode } from "react";

// Ilha de hidratação (docs/40 §16, G-19): só o que tem estado no cliente ("Como funciona", demo e dúvidas) é hidratado pelo React;
// a navbar e a barra fixa são HTML com atributos ligados por lib/chrome-dom.ts. O resto da página é HTML pré-renderizado, sem JS: menos bytes e menos trabalho na
// hidratação. O wrapper é `display: contents`, então não muda o layout. Em dev (sem pré-render) tudo é uma árvore só.
export type IslandName = "como-funciona" | "tenta-uma" | "duvidas";

export function Island({ name, children }: { name: IslandName; children: ReactNode }) {
  return (
    <div data-island={name} className="contents">
      {children}
    </div>
  );
}

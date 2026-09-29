import { PencilArrow } from "./doodles";

// Anotação de margem: uma frase curta em fonte manuscrita + seta de lápis. Sempre REPETE algo que já está
// dito no texto ou na tela (nunca informação nova), por isso é aria-hidden (docs/40 §12.3).
// modo "load": entra com a abertura (hero, CSS). modo "none": parada; quem anima é a timeline da seção (scroll.ts).
export function MarginNote({ children, className, arrowClassName, modo = "load" }: { children: string; className?: string; arrowClassName?: string; modo?: "load" | "none" }) {
  return (
    <div className={["pointer-events-none select-none", className ?? ""].join(" ").trim()} aria-hidden="true">
      <p className={["lp-hand lp-note__txt", modo === "load" ? "lp-enter-fade" : ""].join(" ").trim()}>{children}</p>
      <PencilArrow draw={modo === "load" ? "load" : "none"} className={["mt-0.5 h-32 w-24", arrowClassName ?? ""].join(" ").trim()} />
    </div>
  );
}

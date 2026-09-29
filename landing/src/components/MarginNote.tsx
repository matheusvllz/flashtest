import { PencilArrow } from "./doodles";

// Anotação de margem: uma frase curta em fonte manuscrita + seta de lápis. Sempre REPETE algo que já está
// dito no texto ou no retrato (nunca informação nova), por isso é aria-hidden (docs/40 §12.3, no máximo ~3 na página).
export function MarginNote({ children, className, arrowClassName }: { children: string; className?: string; arrowClassName?: string }) {
  return (
    <div className={["pointer-events-none select-none", className ?? ""].join(" ").trim()} aria-hidden="true">
      <p className="lp-hand lp-enter-fade">{children}</p>
      <PencilArrow className={["mt-0.5 h-32 w-24", arrowClassName ?? ""].join(" ").trim()} />
    </div>
  );
}

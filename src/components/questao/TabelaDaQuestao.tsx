import { useCallback, useEffect, useId, useRef, useState } from "react";
import { COPY } from "@/lib/copy";
import type { ExerciseTable } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";

/**
 * Tabela do enunciado como tabela HTML de verdade (spec 50 §5.9.3, §8): `<caption>` (a legenda, ou uma
 * genérica só para leitor de tela), cabeçalho com `<th scope="col">`, rolagem horizontal num contêiner
 * focável (dá para rolar pelo teclado) com sombra do lado em que ainda há conteúdo, e cabeçalho fixo
 * quando a tabela rola na vertical. Texto das células exatamente como no original.
 */
export function TabelaDaQuestao({
  tabela,
  className,
}: {
  tabela: ExerciseTable;
  className?: string;
}) {
  const captionId = useId();
  const dicaId = useId();
  const caixaRef = useRef<HTMLDivElement>(null);
  const [sobra, setSobra] = useState({ esquerda: false, direita: false });

  const medir = useCallback(() => {
    const el = caixaRef.current;
    if (!el) return;
    const esquerda = el.scrollLeft > 1;
    const direita = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setSobra((atual) =>
      atual.esquerda === esquerda && atual.direita === direita ? atual : { esquerda, direita },
    );
  }, []);

  useEffect(() => {
    medir();
    const el = caixaRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [medir]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={caixaRef}
        role="region"
        aria-labelledby={captionId}
        aria-describedby={sobra.direita || sobra.esquerda ? dicaId : undefined}
        tabIndex={0}
        onScroll={medir}
        className="max-h-[70vh] overflow-auto rounded-xl border-2 border-gelo bg-cards"
      >
        <table className="w-full border-separate border-spacing-0 text-left text-sm leading-snug text-abismo">
          <caption
            id={captionId}
            className={cn(
              tabela.legenda
                ? "caption-top px-3 pt-2 pb-1 text-left text-[13px] font-semibold text-abismo"
                : "sr-only",
            )}
          >
            {tabela.legenda ?? COPY.questao.tabelaSemLegenda}
          </caption>
          <thead>
            <tr>
              {tabela.cabecalho.map((titulo, i) => (
                <th
                  key={i}
                  scope="col"
                  className="sticky top-0 z-[1] min-w-[6rem] border-b-2 border-gelo bg-neve px-3 py-2 align-bottom font-display font-bold whitespace-pre-line"
                >
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabela.linhas.map((linha, i) => (
              <tr key={i}>
                {linha.map((celula, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-3 py-2 align-top whitespace-pre-line",
                      i < tabela.linhas.length - 1 && "border-b border-gelo",
                    )}
                  >
                    {celula}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Sombras laterais: dizem que há mais tabela para o lado. Decorativas; a dica abaixo diz o mesmo em texto. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0.5 left-0.5 w-6 rounded-l-xl bg-linear-to-r from-[var(--scrim)] to-transparent opacity-0 motion-safe:transition-opacity",
          sobra.esquerda && "opacity-100",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0.5 right-0.5 w-6 rounded-r-xl bg-linear-to-l from-[var(--scrim)] to-transparent opacity-0 motion-safe:transition-opacity",
          sobra.direita && "opacity-100",
        )}
      />
      {(sobra.direita || sobra.esquerda) && (
        <p id={dicaId} className="mt-1 text-[11px] text-nevoa">
          {COPY.questao.tabelaRolar}
        </p>
      )}
    </div>
  );
}

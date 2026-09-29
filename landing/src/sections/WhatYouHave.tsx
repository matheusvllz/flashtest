import { BookOpen, Check, Smartphone, Video } from "lucide-react";
import { LP } from "../content/copy";

const ICONES = [Video, BookOpen, Smartphone];

// S-6 O que você já tem. Pergunta do João: "Por que não só YouTube, apostila ou o app oficial?".
// Nenhum concorrente citado por nome; nada que denigra o material dele. Uma folha dobrada ao meio (linha tracejada).
export function WhatYouHave() {
  const { colunaA, colunaB } = LP.jaTem;
  return (
    <section data-section="ja-tem" aria-labelledby="ja-tem-titulo" className="py-[var(--lp-section-y)]">
      <div className="lp-container">
        <h2 id="ja-tem-titulo" className="lp-display-l max-w-[20ch]">
          {LP.jaTem.titulo}
        </h2>

        <div data-reveal className="card-soft mt-[var(--lp-section-gap)] grid gap-0 rounded-3xl md:grid-cols-2">
          <div className="p-6 sm:p-9">
            <h3 className="lp-label !text-nevoa">{colunaA.rotulo}</h3>
            <ul className="mt-5 space-y-4">
              {colunaA.itens.map((t, i) => {
                const Icone = ICONES[i];
                return (
                  <li key={t} className="flex items-center gap-3">
                    <Icone size={22} strokeWidth={2} className="shrink-0 text-abismo" aria-hidden="true" />
                    <span className="lp-lead !font-normal text-foreground">{t}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t-2 border-dashed border-pelo-sombra p-6 sm:p-9 md:border-l-2 md:border-t-0">
            <h3 className="lp-label">{colunaB.rotulo}</h3>
            <ul className="mt-5 space-y-4">
              {colunaB.itens.map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="lp-node" data-state="done" aria-hidden="true">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="lp-lead !font-semibold text-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

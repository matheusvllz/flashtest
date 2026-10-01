import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { FocaMark } from "@/components/brand/FocaMark";
import { SKILL_MAP } from "@/content/taxonomy";
import type { LinhaDaChecagem, RotuloChecagem } from "@/lib/adaptive/checkpoint";
import { COPY } from "@/lib/copy";

/**
 * Resultado da checagem (30 §13.5; spec 48 T-48.5.1, RF-13; B-069). Uma linha por habilidade com "Subiu", "Firme" ou
 * "Vale revisar" — rótulo em texto e ícone de forma diferente (nunca só cor), sem número nem porcentagem — e uma frase
 * do que muda na trilha. Um CTA primário. Nenhuma cor de certo/errado: "Vale revisar" não é erro, é o motor ajustando.
 */
const ICONE: Record<RotuloChecagem, typeof ArrowUpRight> = { subiu: ArrowUpRight, firme: Minus, revisar: ArrowDownRight };

export function CheckpointResult({ linhas, xpGanho }: { linhas: LinhaDaChecagem[]; xpGanho: number }) {
  const mudancas = linhas.flatMap((l) => {
    const nome = SKILL_MAP[l.skillId]?.name ?? "";
    const frases: string[] = [];
    if (nome && l.revisaoAmanha) frases.push(COPY.checkpoint.revisaoAmanha(nome));
    if (nome && l.desafio) frases.push(COPY.checkpoint.desafioLiberado(nome));
    return frases;
  });

  return (
    <div className="flex min-h-screen flex-col bg-neve px-6 py-10" data-testid="checagem-resultado">
      <FocaMark expression="neutra" size={48} decorative />
      <h1 className="mt-4 font-display text-2xl font-bold text-abismo">{COPY.checkpoint.resultadoTitulo}</h1>
      {linhas.length === 0 ? (
        <p className="mt-2 text-sm text-nevoa">{COPY.checkpoint.semRespostas}</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-nevoa">{COPY.checkpoint.resultadoCorpo}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {linhas.map((l) => {
              const Icone = ICONE[l.rotulo];
              return (
                <li key={l.skillId} className="card-soft flex items-center gap-3 px-4 py-3" data-rotulo={l.rotulo}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-gelo text-abismo" aria-hidden>
                    <Icone size={16} strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-abismo">{SKILL_MAP[l.skillId]?.name ?? l.skillId}</span>
                  <span className="shrink-0 text-xs font-bold text-abismo">{COPY.checkpoint.rotulos[l.rotulo]}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-1 text-sm text-abismo" aria-live="polite">
            {mudancas.length ? mudancas.map((f) => <p key={f}>{f}</p>) : <p>{COPY.checkpoint.nadaMuda}</p>}
          </div>
        </>
      )}
      {xpGanho > 0 && <p className="mt-4 font-mono text-sm font-bold text-mar-fundo">{COPY.checkpoint.xp(xpGanho)}</p>}
      <Link to="/trilha" className="btn-primary mt-8 w-full">
        {COPY.checkpoint.continuar}
      </Link>
    </div>
  );
}

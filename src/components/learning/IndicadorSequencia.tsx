import { Check, Flame, Shield } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { COPY } from "@/lib/copy";
import { CONGELAMENTOS_MAXIMO } from "@/lib/recompensas";
import { estadoDaSequencia } from "@/lib/sequencia";
import type { AppState } from "@/lib/store";

function dataCurta(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

/**
 * Sequência com foguinho (spec 48 T-48.6.1, D48-14, RF-15). Mostra o que a regra R-GAM-3 já faz — dias seguidos,
 * se estudou hoje, proteções guardadas, dia coberto por proteção, recorde como meta depois de uma pausa — sem regra
 * nova, sem contagem regressiva, sem ameaça e sem animação constante (o ícone é estático; nada pisca).
 *
 * Fonte: o store. Com conta, os números são os do servidor (`aplicarAgregadoDoServidor`) quando a fila está vazia;
 * com fila pendente, mostra os do aparelho e diz que está atualizando. Sem conta (modo de demonstração), diz que é
 * deste aparelho.
 */
export function IndicadorSequencia({ s }: { s: AppState }) {
  const [aberto, setAberto] = useState(false);
  const e = estadoDaSequencia(s);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={COPY.sequencia.botaoAria(e.dias, e.estudouHoje, e.protecoes)}
        className="flex shrink-0 items-center gap-1 rounded-full py-1 pr-1.5 font-mono text-sm font-bold text-abismo min-h-11"
        data-testid="indicador-sequencia"
      >
        <Flame size={18} strokeWidth={2.5} className="text-brasa" fill={e.estudouHoje ? "currentColor" : "none"} aria-hidden />
        <span>
          <span className="mark-texto">{e.dias}</span> {e.dias === 1 ? "dia" : "dias"}
        </span>
        {e.protecoes > 0 && (
          <span className="flex items-center text-[11px] font-bold text-nevoa" aria-hidden>
            <Shield size={12} strokeWidth={2.5} />
            {e.protecoes}
          </span>
        )}
      </button>

      <BottomSheet open={aberto} onClose={() => setAberto(false)} title={COPY.sequencia.titulo}>
        <div className="space-y-3 text-sm text-abismo" data-testid="sequencia-detalhe">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <Flame size={22} strokeWidth={2.5} className="text-brasa" fill="currentColor" aria-hidden />
            {COPY.sequencia.dias(e.dias)}
          </p>
          <p className="flex items-center gap-2">
            {e.estudouHoje ? <Check size={16} strokeWidth={3} className="text-mar" aria-hidden /> : null}
            {e.estudouHoje ? COPY.sequencia.hojeFeito : COPY.sequencia.hojeAinda}
          </p>
          {e.voltando && <p>{COPY.sequencia.voltando(e.recorde)}</p>}
          <p className="flex items-center gap-2">
            <Shield size={16} strokeWidth={2.5} className="text-nevoa" aria-hidden />
            {COPY.sequencia.protecoes(e.protecoes, CONGELAMENTOS_MAXIMO)}
          </p>
          {e.protecaoRecente && <p>{COPY.sequencia.protecaoUsada(dataCurta(e.protecaoRecente))}</p>}
          <p className="text-nevoa">{COPY.sequencia.comoFunciona}</p>
          <p className="text-xs text-nevoa" data-testid="sequencia-fonte">
            {COPY.sequencia.fonte[e.conta]}
          </p>
        </div>
      </BottomSheet>
    </>
  );
}

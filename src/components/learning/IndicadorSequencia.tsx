import { Check, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { ChamaSequencia } from "@/components/learning/ChamaSequencia";
import { CompraDeProtetores } from "@/components/planos/CompraDeProtetores";
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
 * nova, sem contagem regressiva, sem ameaça e sem animação constante. Desde D48-18 o número fica dentro da chama
 * (laranja com estudo hoje, cinza sem), e a chama dá um único pulo quando acende durante a sessão.
 *
 * Fonte: o store. Com conta, os números são os do servidor (`aplicarAgregadoDoServidor`) quando a fila está vazia;
 * com fila pendente, mostra os do aparelho e diz que está atualizando. Sem conta (modo de demonstração), diz que é
 * deste aparelho.
 */
export function IndicadorSequencia({ s }: { s: AppState }) {
  const [aberto, setAberto] = useState(false);
  const [comprando, setComprando] = useState(false);
  const e = estadoDaSequencia(s);
  // Um pulo só, quando a chama acende com a tela aberta (concluiu o primeiro estudo do dia). Nada em loop.
  const acesaAntes = useRef(e.estudouHoje);
  const [acendeu, setAcendeu] = useState(false);
  useEffect(() => {
    if (e.estudouHoje && !acesaAntes.current) setAcendeu(true);
    acesaAntes.current = e.estudouHoje;
  }, [e.estudouHoje]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={COPY.sequencia.botaoAria(e.dias, e.estudouHoje, e.protecoes)}
        className="relative -my-1 flex shrink-0 items-center rounded-2xl p-0.5 min-h-11 active:scale-95 transition-transform"
        data-testid="indicador-sequencia"
      >
        <span className={acendeu ? "animate-[ft-bump_0.5s_ease-out_1]" : undefined} onAnimationEnd={() => setAcendeu(false)}>
          <ChamaSequencia dias={e.dias} acesa={e.estudouHoje} />
        </span>
        {e.protecoes > 0 && (
          <span
            className="absolute -right-2 top-0 flex items-center gap-px rounded-full border-2 border-cards bg-gelo px-1 py-px text-[11px] font-bold leading-none text-abismo"
            aria-hidden
            data-testid="sequencia-protecoes"
          >
            <Shield size={11} strokeWidth={2.75} />
            {e.protecoes}
          </span>
        )}
      </button>

      <BottomSheet open={aberto} onClose={() => setAberto(false)} title={COPY.sequencia.titulo}>
        <div className="space-y-3 text-sm text-abismo" data-testid="sequencia-detalhe">
          <p className="flex items-center gap-3 font-display text-lg font-bold">
            <ChamaSequencia dias={e.dias} acesa={e.estudouHoje} tamanho={64} />
            {COPY.sequencia.dias(e.dias)}
          </p>
          <p className="flex items-center gap-2">
            {e.estudouHoje ? <Check size={16} strokeWidth={3} className="text-mar" aria-hidden /> : null}
            {e.estudouHoje ? COPY.sequencia.hojeFeito : COPY.sequencia.hojeAinda}
          </p>
          {e.voltando && <p>{COPY.sequencia.voltando(e.recorde)}</p>}
          <p className="flex items-center gap-2">
            <Shield size={16} strokeWidth={2.5} className="text-nevoa" aria-hidden />
            {COPY.sequencia.protecoes(e.protecoes, e.protecoesMax)}
          </p>
          {e.protecaoRecente && <p>{COPY.sequencia.protecaoUsada(dataCurta(e.protecaoRecente))}</p>}
          <p className="text-nevoa">{COPY.sequencia.comoFunciona}</p>
          <p className="text-xs text-nevoa" data-testid="sequencia-fonte">
            {COPY.sequencia.fonte[e.conta]}
          </p>
          {/* Compra avulsa (spec 49 D49-05): só com conta, aqui e na tela de planos; nunca como aviso de sequência em risco. */}
          {e.conta !== "aparelho" &&
            (comprando ? (
              <CompraDeProtetores estoque={e.protecoes} maximo={e.protecoesMax} />
            ) : (
              <button type="button" onClick={() => setComprando(true)} className="btn-outline w-full" data-testid="comprar-protetores">
                {COPY.protetores.comprar}
              </button>
            ))}
        </div>
      </BottomSheet>
    </>
  );
}

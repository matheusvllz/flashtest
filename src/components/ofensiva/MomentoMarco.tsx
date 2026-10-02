/**
 * Marco de ofensiva no fim da lição (spec 50 §5.2.4, §5.3.5): baú de conteúdo CONHECIDO, mostrado antes de abrir, só
 * na primeira vez deste marco (o servidor credita as Pérolas, uma vez na vida do aluno); cartão para compartilhar.
 * Abrir é só uma animação curta (pulável); movimento reduzido mostra o conteúdo direto.
 */
import { Gift } from "lucide-react";
import { useState } from "react";
import { IconePerola } from "@/components/economia/IconePerola";
import { CartaoCompartilhar } from "@/components/ofensiva/CartaoCompartilhar";
import { COPY } from "@/lib/copy";
import { conteudoDoBau } from "@/lib/perolas";
import { marcarMarcoVisto } from "@/lib/store";

export function MomentoMarco({ dias }: { dias: number }) {
  const t = COPY.ofensiva.marco;
  const [primeira] = useState(() => marcarMarcoVisto(dias));
  const [aberto, setAberto] = useState(false);
  const bau = conteudoDoBau(dias);
  return (
    <div className="w-full space-y-3" data-testid="momento-marco" data-dias={dias}>
      {primeira && bau && (
        <section className="card-soft space-y-2 p-4 text-left" aria-label={t.bau}>
          <p className="flex items-center gap-2 font-bold text-abismo">
            <Gift size={18} className="text-recompensa" aria-hidden /> {t.bau}
          </p>
          <p className="text-xs text-nevoa">{t.conteudo}</p>
          <ul className="flex flex-wrap gap-2 text-sm font-semibold text-abismo">
            <li className="chip inline-flex items-center gap-1">
              <IconePerola size={14} decorative /> {t.perolas(bau.perolas)}
            </li>
            {bau.item && <li className="chip">{COPY.loja.itens[bau.item].nome}</li>}
          </ul>
          {aberto ? (
            <p className="anim-pop-in text-sm font-bold text-success-texto" role="status">
              {t.aberto}
            </p>
          ) : (
            <button type="button" className="btn-outline w-full" onClick={() => setAberto(true)} data-testid="abrir-bau">
              {t.abrir}
            </button>
          )}
        </section>
      )}
      <div className="flex justify-center">
        <CartaoCompartilhar dias={dias} />
      </div>
    </div>
  );
}

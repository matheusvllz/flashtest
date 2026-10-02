import { RotateCcw } from "lucide-react";
import { COPY } from "@/lib/copy";

/**
 * Oferta da revisão de erros no fim da lição (spec 50 §5.1.4): rever até 3 questões erradas antes do resultado, sem
 * custo de vida e sem mudar a nota. "Rever" é a ação principal; "Ver resultado" pula. Sem Foca aqui: ainda é a lição.
 */
export function OfertaDeRevisao({
  quantidade,
  onRever,
  onPular,
}: {
  quantidade: number;
  onRever: () => void;
  onPular: () => void;
}) {
  const t = COPY.licao.revisaoErros;
  return (
    <section className="card-soft space-y-4 p-5" data-testid="oferta-revisao" aria-labelledby="oferta-revisao-titulo">
      <div className="flex items-start gap-3">
        <RotateCcw size={22} className="mt-0.5 shrink-0 text-mar" aria-hidden />
        <div>
          <h2 id="oferta-revisao-titulo" className="font-display text-lg font-bold text-abismo">
            {t.titulo(quantidade)}
          </h2>
          <p className="mt-1 text-sm text-nevoa">{t.corpo}</p>
        </div>
      </div>
      <div className="space-y-2">
        <button type="button" className="btn-primary w-full" onClick={onRever} data-acao-principal>
          {t.rever}
        </button>
        <button type="button" className="btn-ghost w-full" onClick={onPular}>
          {t.verResultado}
        </button>
      </div>
    </section>
  );
}

/**
 * "Reportar problema nesta questão" (spec 50 §5.9.2): só em questão oficial, depois de respondida. Dois reportes
 * iguais de pessoas diferentes retiram a questão dos simulados até a revisão.
 */
import { useState } from "react";
import { reportarQuestao } from "@/lib/api/simulado";
import { COPY } from "@/lib/copy";

export function ReportarQuestao({ itemId }: { itemId: string }) {
  const t = COPY.simulado.reportar;
  const [aberto, setAberto] = useState(false);
  const [feito, setFeito] = useState(false);
  if (feito)
    return (
      <p className="text-xs text-nevoa" role="status">
        {t.obrigado}
      </p>
    );
  return (
    <div className="space-y-2">
      <button type="button" className="text-xs text-nevoa underline tap-area" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}>
        {t.botao}
      </button>
      {aberto && (
        <fieldset className="space-y-1.5">
          <legend className="text-xs font-bold text-abismo">{t.titulo}</legend>
          <div className="flex flex-wrap gap-1.5">
            {(["texto", "imagem", "gabarito", "outro"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className="chip tap-area"
                onClick={() => {
                  setFeito(true);
                  reportarQuestao({ data: { itemId, motivo: m } }).catch(() => {});
                }}
              >
                {t.motivos[m]}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}

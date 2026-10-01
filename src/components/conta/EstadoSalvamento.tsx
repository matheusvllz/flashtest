import { CloudOff, Check, RefreshCw, Smartphone } from "lucide-react";
import { useState } from "react";
import { COPY } from "@/lib/copy";
import { useEstadoDeSalvamento, type EstadoDeSalvamento } from "@/lib/store";
import { sincronizarAgora } from "@/lib/sync/motor";

const ICONE: Record<EstadoDeSalvamento, typeof Check> = {
  aparelho: Smartphone,
  aguardando: RefreshCw,
  "sem-conexao": CloudOff,
  sincronizado: Check,
  falhou: CloudOff,
};

/**
 * Onde está o estudo (spec 48 T-48.8.2, D48-15, RF-18): "salvo neste aparelho", "aguardando sincronização",
 * "sincronizado com a conta" ou "não deu para sincronizar" (com "Tentar agora"). A fonte é o motor de sincronização
 * e o store; "sincronizado" só aparece depois da confirmação do servidor.
 *
 * `discreto`: na trilha, só aparece quando pede atenção (falha ou sem conexão) — nada de aviso durante o estudo.
 */
export function EstadoSalvamento({ discreto = false }: { discreto?: boolean }) {
  const estado = useEstadoDeSalvamento();
  const [tentando, setTentando] = useState(false);
  if (discreto && estado !== "falhou" && estado !== "sem-conexao") return null;
  const Icone = ICONE[estado];

  async function tentar() {
    setTentando(true);
    try {
      await sincronizarAgora();
    } finally {
      setTentando(false);
    }
  }

  return (
    <div role="status" aria-live="polite" className="flex items-start gap-2 text-sm text-nevoa" data-testid="estado-salvamento" data-estado={estado}>
      <Icone size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p>{COPY.salvamento[estado]}</p>
        {estado === "falhou" && (
          <button type="button" onClick={() => void tentar()} disabled={tentando} className="btn-outline mt-2 min-h-11 px-4 text-sm">
            {tentando ? COPY.salvamento.tentando : COPY.salvamento.tentarAgora}
          </button>
        )}
      </div>
    </div>
  );
}

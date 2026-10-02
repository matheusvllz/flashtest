/**
 * Volta do checkout (spec 49 §6, T-49.3.4): consulta o servidor até o webhook confirmar (no máximo 60 s). Nunca
 * confia no parâmetro da URL para liberar nada; a URL só diz se o pagador cancelou ou se o tempo acabou.
 * No ambiente local (provedor falso), oferece botões para simular o pagamento.
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { estadoDaCompra, simularPagamentoLocal } from "@/lib/api/planos";
import { COPY } from "@/lib/copy";
import type { Plano } from "@/lib/planos";

const NOME: Record<Plano, string> = { gratis: "Free", basic: "Basic", pro: "Pro" };
const ESPERA_MAX_MS = 60_000;
const INTERVALO_MS = 2_000;

type Estado = "confirmando" | "pronto" | "recusado" | "cancelado" | "expirado" | "demorando";

export function RetornoDoPagamento({ compra, r, teste }: { compra: string; r?: string; teste: boolean }) {
  const [estado, setEstado] = useState<Estado>(r === "cancelado" ? "cancelado" : r === "expirado" ? "expirado" : "confirmando");
  const [plano, setPlano] = useState<Plano>("gratis");
  const inicio = useRef(Date.now());
  const [simulou, setSimulou] = useState(false);

  useEffect(() => {
    if (estado !== "confirmando" || (teste && !simulou)) return;
    let vivo = true;
    const tick = async () => {
      try {
        const x = await estadoDaCompra({ data: { compraId: compra } });
        if (!vivo) return;
        if (x.ok && x.estado === "paga" && x.plano !== "gratis") {
          setPlano(x.plano);
          setEstado("pronto");
          return;
        }
        if (x.ok && (x.estado === "expirada" || x.estado === "cancelada")) {
          setEstado(x.estado === "expirada" ? "expirado" : "cancelado");
          return;
        }
      } catch {
        /* rede: tenta de novo */
      }
      if (Date.now() - inicio.current > ESPERA_MAX_MS) setEstado("demorando");
      else setTimeout(() => vivo && void tick(), INTERVALO_MS);
    };
    void tick();
    return () => {
      vivo = false;
    };
  }, [compra, estado, teste, simulou]);

  async function simular(resultado: "aprovado" | "recusado") {
    await simularPagamentoLocal({ data: { compraId: compra, resultado } }).catch(() => undefined);
    if (resultado === "recusado") setEstado("recusado");
    else {
      inicio.current = Date.now();
      setSimulou(true);
    }
  }

  const t = COPY.planos.retorno;
  return (
    <AppShell title={COPY.planos.titulo}>
      <div className="px-5 pt-8 space-y-4" data-testid="retorno-pagamento">
        <p role="status" aria-live="polite" className="font-display text-xl font-bold text-abismo">
          {estado === "confirmando" && t.confirmando}
          {estado === "pronto" && t.pronto(NOME[plano])}
          {estado === "recusado" && t.recusado}
          {estado === "cancelado" && t.cancelado}
          {estado === "expirado" && t.expirado}
          {estado === "demorando" && t.demorando}
        </p>
        {teste && estado === "confirmando" && !simulou && (
          <div className="card-soft space-y-2 p-4" data-testid="simulacao">
            <p className="text-sm text-nevoa">{t.simulacao}</p>
            <button type="button" className="btn-primary w-full" onClick={() => void simular("aprovado")}>
              {t.simularAprovado}
            </button>
            <button type="button" className="btn-ghost w-full" onClick={() => void simular("recusado")}>
              {t.simularRecusado}
            </button>
          </div>
        )}
        {estado === "pronto" ? (
          <Link to="/trilha" className="btn-primary w-full">
            {t.irParaTrilha}
          </Link>
        ) : (
          estado !== "confirmando" && (
            <Link to="/planos" className="btn-outline w-full">
              {t.voltarAosPlanos}
            </Link>
          )
        )}
      </div>
    </AppShell>
  );
}

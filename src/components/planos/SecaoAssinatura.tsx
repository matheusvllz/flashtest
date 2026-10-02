/**
 * Assinatura no perfil (spec 49 §6, T-49.3.5; RF-4): plano vindo do servidor, renovação ou fim do período, cancelar
 * em até dois toques (pede confirmação uma vez) e reembolso integral nos 7 dias. Nada aqui apaga estudo.
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cancelarAssinatura, meuPlano, pedirReembolso } from "@/lib/api/planos";
import { COPY } from "@/lib/copy";
import type { Plano } from "@/lib/planos";
import type { MeuPlano } from "@/server/pagamentos/acoes";

const NOME: Record<Plano, string> = { gratis: "Free", basic: "Basic", pro: "Pro" };

function data(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export function SecaoAssinatura() {
  const [info, setInfo] = useState<MeuPlano | null>(null);
  const [confirmar, setConfirmar] = useState<"cancelar" | "reembolso" | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const t = COPY.planos.assinatura;

  const carregar = () =>
    meuPlano().then(
      (r) => r.ok && setInfo({ plano: r.plano, assinatura: r.assinatura }),
      () => undefined,
    );
  useEffect(() => {
    void carregar();
  }, []);

  async function executar(acao: "cancelar" | "reembolso") {
    setOcupado(true);
    try {
      if (acao === "cancelar") {
        const r = await cancelarAssinatura();
        setAviso(r.ok ? t.cancelado(r.validoAte ? data(r.validoAte) : "") : t.erro);
      } else {
        const r = await pedirReembolso();
        setAviso(r.ok ? t.reembolsoFeito : r.codigo === "REEMBOLSO_PELO_SUPORTE" ? t.reembolsoSuporte : r.codigo === "FORA_DO_PRAZO" ? t.foraDoPrazo : t.erro);
      }
    } catch {
      setAviso(t.erro);
    }
    setConfirmar(null);
    setOcupado(false);
    void carregar();
  }

  const a = info?.assinatura ?? null;
  return (
    <section className="card-soft p-4" aria-labelledby="assinatura-titulo" data-testid="secao-assinatura">
      <p id="assinatura-titulo" className="ds-label">
        {t.titulo}
      </p>
      <p className="mt-1 font-display text-lg font-bold text-abismo" data-testid="plano-atual">
        {info ? t.planoAtual(NOME[info.plano]) : "…"}
      </p>
      {a?.validoAte && (
        <p className="mt-1 text-sm text-nevoa">{a.estado === "atrasada" ? t.atrasada : a.renova ? t.renovaEm(data(a.validoAte)) : t.valeAte(data(a.validoAte))}</p>
      )}
      {aviso && (
        <p role="status" className="mt-2 text-sm text-abismo">
          {aviso}
        </p>
      )}

      {confirmar ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-abismo">{confirmar === "cancelar" ? t.cancelarConfirma : t.reembolsoConfirma}</p>
          <button type="button" disabled={ocupado} onClick={() => void executar(confirmar)} className="btn-outline w-full">
            {confirmar === "cancelar" ? t.cancelarSim : t.reembolsoSim}
          </button>
          <button type="button" disabled={ocupado} onClick={() => setConfirmar(null)} className="btn-ghost w-full">
            {t.cancelarNao}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <Link to="/planos" className="btn-outline inline-flex w-full justify-center">
            {t.verPlanos}
          </Link>
          {a?.renova && (
            <button type="button" onClick={() => setConfirmar("cancelar")} className="btn-ghost w-full text-sm">
              {t.cancelar}
            </button>
          )}
          {a?.reembolsavel && (
            <button type="button" onClick={() => setConfirmar("reembolso")} className="btn-ghost w-full text-sm">
              {t.reembolso}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

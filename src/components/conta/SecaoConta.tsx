/**
 * Seção "Conta" do perfil (docs/specs/46-producao T-05.5): e-mail da conta, sair e sair de todos os aparelhos
 * (revoga todas as sessões no servidor — modelo de ameaças T4). Sair apaga o estado deste aparelho (D-14); antes,
 * tenta mandar o que falta para a conta e, se algo não foi, pede confirmação.
 */
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { EstadoSalvamento } from "@/components/conta/EstadoSalvamento";
import { AvisoErro } from "@/components/conta/TelaDeAcesso";
import { authClient } from "@/lib/auth-client";
import { COPY } from "@/lib/copy";
import { esquecerUsuarioDaSessao } from "@/lib/conta/usuario-da-sessao";
import { esquecerSessao, sessao } from "@/lib/sessao";
import { sairDaDemonstracao } from "@/lib/conta/demonstracao";
import { definirFocaIADesligadaLocal, logout, sairDaEntradaLocal, useAppState } from "@/lib/store";
import { sincronizarAgora } from "@/lib/sync/motor";
import { definirFocaIA, preferenciaFocaIA } from "@/lib/api/conta";
import { cn } from "@/lib/utils";

export function SecaoConta() {
  const nav = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [demonstracao, setDemonstracao] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState<string>();
  const [pendente, setPendente] = useState<null | { deTodos: boolean }>(null);
  const [focaIA, setFocaIA] = useState<boolean | null>(null);

  useEffect(() => {
    sessao().then(
      (s) => {
        setEmail(s.email);
        setDemonstracao(s.modo === "demonstracao");
        if (s.modo !== "demonstracao" && s.email) {
          preferenciaFocaIA().then(
            (r) => {
              if (!r.ok) return;
              setFocaIA(r.ligada);
              definirFocaIADesligadaLocal(!r.ligada);
            },
            () => undefined,
          );
        }
      },
      () => undefined,
    );
  }, []);

  async function alternarFocaIA() {
    if (focaIA === null) return;
    const ligada = !focaIA;
    setErro(undefined);
    try {
      const r = await definirFocaIA({ data: { ligada } });
      if (!r.ok) throw new Error(r.codigo);
      setFocaIA(ligada);
      definirFocaIADesligadaLocal(!ligada);
    } catch {
      setErro(COPY.conta.erros.rede);
    }
  }

  async function sair(deTodos: boolean, confirmado = false) {
    // Modo de demonstração (D-15): não há conta nem fila; sair só encerra a entrada local e mantém o progresso.
    if (demonstracao) {
      sairDaDemonstracao();
      sairDaEntradaLocal();
      esquecerSessao();
      nav({ to: "/", replace: true });
      return;
    }
    setSaindo(true);
    setErro(undefined);
    if (!confirmado) {
      const restantes = await sincronizarAgora().catch(() => 1);
      if (restantes > 0) {
        setPendente({ deTodos });
        setSaindo(false);
        return;
      }
    }
    setPendente(null);
    try {
      if (deTodos) await authClient.revokeSessions();
      await authClient.signOut();
      logout();
      esquecerSessao();
      esquecerUsuarioDaSessao();
      nav({ to: "/", replace: true });
    } catch {
      setErro(COPY.conta.erros.rede);
      setSaindo(false);
    }
  }

  return (
    <section aria-labelledby="conta-titulo" className="card-soft flex flex-col gap-3 p-4">
      <h2 id="conta-titulo" className="ds-label">
        {COPY.conta.contaTitulo}
      </h2>
      {email && <p className="break-all text-sm text-abismo">{email}</p>}
      {demonstracao ? (
        <p role="status" className="text-sm text-nevoa">
          {COPY.conta.syncDemonstracao}
        </p>
      ) : (
        <EstadoSalvamento />
      )}
      {focaIA !== null && (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={alternarFocaIA}
            aria-pressed={focaIA}
            aria-describedby="foca-ia-explica"
            className={cn("chip min-h-11 justify-center", focaIA && "chip-on")}
          >
            {COPY.conta.focaIA(focaIA)}
          </button>
          <p id="foca-ia-explica" className="text-xs text-nevoa">
            {COPY.conta.focaIAExplica}
          </p>
        </div>
      )}
      <AvisoErro>{erro}</AvisoErro>
      {pendente ? (
        <div role="alertdialog" aria-labelledby="sair-pendente" className="flex flex-col gap-3">
          <p id="sair-pendente" className="text-sm text-abismo">
            {COPY.conta.sairPendente}
          </p>
          <button
            type="button"
            className="btn-outline w-full"
            onClick={() => sair(pendente.deTodos, true)}
            disabled={saindo}
          >
            {saindo ? COPY.conta.saindo : COPY.conta.sairMesmoAssim}
          </button>
          <button
            type="button"
            className="btn-ghost w-full text-sm"
            onClick={() => setPendente(null)}
            disabled={saindo}
          >
            {COPY.conta.ficar}
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="btn-outline w-full"
            onClick={() => sair(false)}
            disabled={saindo}
          >
            <LogOut size={16} aria-hidden /> {saindo ? COPY.conta.saindo : COPY.conta.sair}
          </button>
          {!demonstracao && (
            <button
              type="button"
              className="btn-ghost w-full text-sm"
              onClick={() => sair(true)}
              disabled={saindo}
            >
              {COPY.conta.sairDeTodos}
            </button>
          )}
        </>
      )}
    </section>
  );
}

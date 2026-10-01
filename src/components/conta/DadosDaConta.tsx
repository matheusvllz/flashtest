import { useNavigate } from "@tanstack/react-router";
import { Download, Trash2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { AvisoErro } from "@/components/conta/TelaDeAcesso";
import { exportarDados } from "@/lib/api/conta";
import { authClient } from "@/lib/auth-client";
import { COPY } from "@/lib/copy";
import { esquecerUsuarioDaSessao } from "@/lib/conta/usuario-da-sessao";
import { esquecerSessao, sessao } from "@/lib/sessao";
import { logout } from "@/lib/store";

/**
 * "Seus dados" na seção Conta (46 §E.6, T-09.1/T-09.2; spec 48 T-48.3.1/T-48.3.2): baixar tudo o que o servidor
 * guarda sobre o aluno (JSON) e excluir a conta. A exclusão pede a senha (quem entrou pelo Google confirma pela
 * sessão recente), apaga em cascata no servidor e limpa este aparelho.
 */
export function DadosDaConta() {
  const nav = useNavigate();
  const senhaId = useId();
  const [baixando, setBaixando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [senha, setSenha] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string>();
  // Só com conta real (no modo de demonstração não há dado no servidor para baixar ou excluir).
  const [comConta, setComConta] = useState(false);
  useEffect(() => {
    sessao().then(
      (s) => setComConta(s.modo !== "demonstracao" && Boolean(s.email)),
      () => setComConta(false),
    );
  }, []);

  async function baixar() {
    setBaixando(true);
    setErro(undefined);
    try {
      const r = await exportarDados();
      if (!r.ok) {
        setErro(r.codigo === "LIMITE_EXCEDIDO" ? COPY.conta.exportarLimite : COPY.conta.erros.generico);
        return;
      }
      const { ok: _ok, ...dados } = r;
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `foca-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErro(COPY.conta.erros.rede);
    } finally {
      setBaixando(false);
    }
  }

  async function excluir() {
    setExcluindo(true);
    setErro(undefined);
    try {
      const r = await authClient.deleteUser(senha ? { password: senha } : {});
      if (r.error) {
        setErro(r.error.status === 400 || r.error.status === 401 ? COPY.conta.excluirSenhaErrada : COPY.conta.erros.generico);
        setExcluindo(false);
        return;
      }
      logout();
      esquecerSessao();
      esquecerUsuarioDaSessao();
      nav({ to: "/", replace: true });
    } catch {
      setErro(COPY.conta.erros.rede);
      setExcluindo(false);
    }
  }

  if (!comConta) return null;

  return (
    <section aria-labelledby="dados-titulo" className="card-soft flex flex-col gap-3 p-4" data-testid="dados-da-conta">
      <h2 id="dados-titulo" className="ds-label">
        {COPY.conta.dadosTitulo}
      </h2>
      <button type="button" className="btn-outline w-full" onClick={() => void baixar()} disabled={baixando}>
        <Download size={16} aria-hidden /> {baixando ? COPY.conta.exportando : COPY.conta.exportar}
      </button>
      <AvisoErro>{erro}</AvisoErro>
      {!confirmando ? (
        <button type="button" className="btn-ghost w-full text-sm" onClick={() => setConfirmando(true)}>
          <Trash2 size={16} aria-hidden /> {COPY.conta.excluir}
        </button>
      ) : (
        <div role="alertdialog" aria-labelledby="excluir-titulo" aria-describedby="excluir-corpo" className="flex flex-col gap-3 rounded-lg border-2 border-gelo p-3">
          <p id="excluir-titulo" className="font-display text-base font-bold text-abismo">
            {COPY.conta.excluirTitulo}
          </p>
          <p id="excluir-corpo" className="text-sm text-abismo">
            {COPY.conta.excluirCorpo}
          </p>
          <label htmlFor={senhaId} className="text-sm font-semibold text-abismo">
            {COPY.conta.excluirSenhaRotulo}
          </label>
          <input
            id={senhaId}
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            aria-describedby={`${senhaId}-dica`}
            className="input-ds"
          />
          <p id={`${senhaId}-dica`} className="text-xs text-nevoa">
            {COPY.conta.excluirSenhaDica}
          </p>
          <button type="button" className="btn-outline w-full border-error text-error" onClick={() => void excluir()} disabled={excluindo}>
            {excluindo ? COPY.conta.excluindo : COPY.conta.excluirConfirmar}
          </button>
          <button type="button" className="btn-ghost w-full text-sm" onClick={() => setConfirmando(false)} disabled={excluindo}>
            {COPY.conta.cancelar}
          </button>
        </div>
      )}
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AvisoErro, AvisoInfo, TelaDeAcesso } from "@/components/conta/TelaDeAcesso";
import { mensagemDeErro } from "@/components/conta/erros";
import { authClient } from "@/lib/auth-client";
import { COPY } from "@/lib/copy";

/** Depois do cadastro: "confirme seu e-mail", com reenvio (limitado no servidor). docs/specs/46-producao T-05.4. */
export const Route = createFileRoute("/verificar-email")({
  validateSearch: (s: Record<string, unknown>): { email?: string } =>
    typeof s.email === "string" && s.email.length <= 254 ? { email: s.email } : {},
  component: VerificarEmail,
  ssr: false,
});

function VerificarEmail() {
  const { email } = Route.useSearch();
  const [estado, setEstado] = useState<"parado" | "enviando" | "enviado">("parado");
  const [erro, setErro] = useState<string>();

  async function reenviar() {
    if (!email) return;
    setEstado("enviando");
    setErro(undefined);
    try {
      const { error } = await authClient.sendVerificationEmail({ email, callbackURL: "/cadastro/completar" });
      if (error) {
        setErro(mensagemDeErro(error));
        setEstado("parado");
        return;
      }
      setEstado("enviado");
    } catch {
      setErro(COPY.conta.erros.rede);
      setEstado("parado");
    }
  }

  return (
    <TelaDeAcesso
      titulo={COPY.conta.verificarTitulo}
      subtitulo={email ? COPY.conta.verificarCorpo(email) : COPY.conta.verificarCorpoSemEmail}
      voltarPara="/login"
    >
      <p className="mt-6 text-sm text-nevoa">{COPY.conta.verificarDica}</p>
      <div className="mt-6 flex flex-col gap-4">
        {estado === "enviado" && <AvisoInfo>{COPY.conta.reenviado}</AvisoInfo>}
        <AvisoErro>{erro}</AvisoErro>
        {email && (
          <button type="button" className="btn-outline w-full" onClick={reenviar} disabled={estado === "enviando"}>
            {COPY.conta.reenviar}
          </button>
        )}
        <Link to="/login" className="btn-primary w-full">
          {COPY.conta.irParaLogin}
        </Link>
      </div>
    </TelaDeAcesso>
  );
}

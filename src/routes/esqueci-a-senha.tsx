import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AvisoErro, AvisoInfo, Campo, TelaDeAcesso } from "@/components/conta/TelaDeAcesso";
import { EMAIL_VALIDO } from "@/components/conta/erros";
import { authClient } from "@/lib/auth-client";
import { COPY } from "@/lib/copy";

/**
 * Pedido de redefinição de senha (docs/specs/46-producao T-05.4). A resposta é a mesma com ou sem conta
 * (anti-enumeração, modelo de ameaças T2); o servidor limita a frequência.
 */
export const Route = createFileRoute("/esqueci-a-senha")({ component: EsqueciSenha, ssr: false });

function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string>();
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    const E = COPY.conta.erros;
    if (!email.trim()) return setErro(E.emailVazio);
    if (!EMAIL_VALIDO.test(email.trim())) return setErro(E.emailInvalido);
    setErro(undefined);
    setEnviando(true);
    try {
      const { error } = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: "/redefinir-senha" });
      // Qualquer resposta que não seja limite de tentativas vira a mesma mensagem (não revela se há conta).
      if (error?.status === 429) setErro(E.muitasTentativas);
      else setEnviado(true);
    } catch {
      setErro(E.rede);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaDeAcesso titulo={COPY.conta.esqueciTitulo} subtitulo={COPY.conta.esqueciSubtitulo} voltarPara="/login">
      {enviado ? (
        <div className="mt-8">
          <AvisoInfo>{COPY.conta.esqueciEnviado}</AvisoInfo>
        </div>
      ) : (
        <form onSubmit={pedir} noValidate className="mt-8 flex flex-col gap-4">
          <Campo
            rotulo={COPY.conta.email}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={COPY.conta.emailExemplo}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AvisoErro>{erro}</AvisoErro>
          <button type="submit" className="btn-primary w-full" disabled={enviando}>
            {COPY.conta.esqueciBotao}
          </button>
        </form>
      )}
    </TelaDeAcesso>
  );
}

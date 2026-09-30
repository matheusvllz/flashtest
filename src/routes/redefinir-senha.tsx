import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AvisoErro, Campo, TelaDeAcesso } from "@/components/conta/TelaDeAcesso";
import { mensagemDeErro } from "@/components/conta/erros";
import { authClient } from "@/lib/auth-client";
import { COPY } from "@/lib/copy";

/**
 * Nova senha a partir do link do e-mail (docs/specs/46-producao T-05.4). Trocar a senha encerra todas as sessões
 * abertas (modelo de ameaças T4); depois, o aluno entra de novo.
 */
export const Route = createFileRoute("/redefinir-senha")({
  validateSearch: (s: Record<string, unknown>): { token?: string; error?: string } => ({
    ...(typeof s.token === "string" && s.token.length <= 200 ? { token: s.token } : {}),
    ...(typeof s.error === "string" ? { error: s.error } : {}),
  }),
  component: RedefinirSenha,
  ssr: false,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const { token, error: erroDoLink } = Route.useSearch();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  if (!token || erroDoLink) {
    return (
      <TelaDeAcesso titulo={COPY.conta.redefinirTitulo} subtitulo={COPY.conta.linkInvalido}>
        <Link to="/esqueci-a-senha" className="btn-primary mt-8 w-full">
          {COPY.conta.pedirOutroLink}
        </Link>
      </TelaDeAcesso>
    );
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) return setErro(COPY.conta.erros.senhaCurta);
    setErro(undefined);
    setEnviando(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword: senha, token });
      if (error) return setErro(mensagemDeErro(error));
      navigate({ to: "/login", search: { aviso: "senha-trocada" } });
    } catch {
      setErro(COPY.conta.erros.rede);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaDeAcesso titulo={COPY.conta.redefinirTitulo}>
      <form onSubmit={salvar} noValidate className="mt-8 flex flex-col gap-4">
        <Campo
          rotulo={COPY.conta.novaSenha}
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          dica={COPY.conta.senhaDica}
        />
        <AvisoErro>{erro}</AvisoErro>
        <button type="submit" className="btn-primary w-full" disabled={enviando}>
          {COPY.conta.redefinirBotao}
        </button>
      </form>
    </TelaDeAcesso>
  );
}

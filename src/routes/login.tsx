import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EntradaDemonstracao } from "@/components/conta/EntradaDemonstracao";
import { AvisoErro, AvisoInfo, BotaoGoogle, Campo, Separador, TelaDeAcesso } from "@/components/conta/TelaDeAcesso";
import { EMAIL_VALIDO, mensagemDeErro } from "@/components/conta/erros";
import { configAcesso } from "@/lib/api/conta";
import { authClient } from "@/lib/auth-client";
import { COPY } from "@/lib/copy";
import { esquecerSessao } from "@/lib/sessao";

/** Login real (docs/specs/46-producao T-05.4). Depois de entrar, o cadastro se completa em /cadastro/completar. */
export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { volta?: string; aviso?: "senha-trocada" } => ({
    ...(typeof s.volta === "string" ? { volta: s.volta } : {}),
    ...(s.aviso === "senha-trocada" ? { aviso: "senha-trocada" as const } : {}),
  }),
  component: Login,
  ssr: false,
});

function Login() {
  const navigate = useNavigate();
  const { volta, aviso } = Route.useSearch();
  const [acesso, setAcesso] = useState<{ emailHabilitado: boolean; googleHabilitado: boolean; contasAtivas?: boolean } | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<{ email?: string; senha?: string; geral?: string }>({});
  const [naoVerificado, setNaoVerificado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    configAcesso().then(setAcesso, () => setAcesso({ emailHabilitado: true, googleHabilitado: false }));
  }, []);

  const depois = `/cadastro/completar${volta ? `?volta=${encodeURIComponent(volta)}` : ""}`;

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    const E = COPY.conta.erros;
    const novos = {
      email: !email.trim() ? E.emailVazio : !EMAIL_VALIDO.test(email.trim()) ? E.emailInvalido : undefined,
      senha: !senha ? E.senhaVazia : undefined,
    };
    setErros(novos);
    setNaoVerificado(false);
    if (novos.email || novos.senha) return;
    setEnviando(true);
    try {
      const { error } = await authClient.signIn.email({ email: email.trim(), password: senha });
      if (error) {
        setNaoVerificado(error.code === "EMAIL_NOT_VERIFIED");
        setErros({ geral: mensagemDeErro(error) });
        return;
      }
      esquecerSessao();
      navigate({ href: depois });
    } catch {
      setErros({ geral: COPY.conta.erros.rede });
    } finally {
      setEnviando(false);
    }
  }

  // Contas desligadas no servidor (D-15): entrada local, sem formulário.
  if (acesso?.contasAtivas === false) return <EntradaDemonstracao volta={volta} />;

  return (
    <TelaDeAcesso titulo={COPY.conta.entrarTitulo} subtitulo={COPY.conta.entrarSubtitulo} voltarPara="/">
      {acesso?.emailHabilitado !== false ? (
        <form onSubmit={entrar} noValidate className="mt-8 flex flex-col gap-4">
          {aviso === "senha-trocada" && <AvisoInfo>{COPY.conta.redefinido}</AvisoInfo>}
          <Campo
            rotulo={COPY.conta.email}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={COPY.conta.emailExemplo}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            erro={erros.email}
          />
          <Campo
            rotulo={COPY.conta.senha}
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            erro={erros.senha}
          />
          <AvisoErro>{erros.geral}</AvisoErro>
          {naoVerificado && (
            <Link
              to="/verificar-email"
              search={{ email: email.trim() }}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-mar-fundo underline"
            >
              {COPY.conta.reenviar}
            </Link>
          )}
          <Link to="/esqueci-a-senha" className="tap-area self-end text-xs font-semibold text-mar-fundo underline">
            {COPY.conta.esqueciSenha}
          </Link>
          <button type="submit" className="btn-primary mt-2 w-full" disabled={enviando}>
            {enviando ? COPY.conta.entrando : COPY.conta.entrarBotao}
          </button>
        </form>
      ) : (
        <p className="mt-8 text-sm text-nevoa">{COPY.conta.emailDesligado}</p>
      )}

      {acesso?.googleHabilitado && (
        <>
          {acesso.emailHabilitado && <Separador />}
          <div className={acesso.emailHabilitado ? "" : "mt-6"}>
            <BotaoGoogle
              onClick={() => authClient.signIn.social({ provider: "google", callbackURL: depois, errorCallbackURL: "/login" })}
            />
          </div>
        </>
      )}

      <p className="mt-auto pt-8 text-center text-sm text-nevoa">
        {COPY.conta.semConta}{" "}
        <Link to="/cadastro" search={volta ? { volta } : {}} className="tap-area font-bold text-mar-fundo underline">
          {COPY.conta.criarConta}
        </Link>
      </p>
    </TelaDeAcesso>
  );
}

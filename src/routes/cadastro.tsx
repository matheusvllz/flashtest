import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EntradaDemonstracao } from "@/components/conta/EntradaDemonstracao";
import { AceiteLegal, AvisoErro, BotaoGoogle, Campo, Separador, TelaDeAcesso } from "@/components/conta/TelaDeAcesso";
import { EMAIL_VALIDO, mensagemDeErro } from "@/components/conta/erros";
import { configAcesso } from "@/lib/api/conta";
import { authClient } from "@/lib/auth-client";
import { COPY } from "@/lib/copy";
import { LEGAL, idadePeloAno } from "@/lib/legal";
import { getState } from "@/lib/store";

/**
 * Cadastro (docs/specs/46-producao T-05.4; decisão 0006). A idade é conferida aqui para dar a mensagem certa e,
 * de novo, no servidor (o servidor é que manda: sem a idade mínima, a conta não é criada).
 */
export const Route = createFileRoute("/cadastro")({
  validateSearch: (s: Record<string, unknown>): { volta?: string } => (typeof s.volta === "string" ? { volta: s.volta } : {}),
  component: Cadastro,
  ssr: false,
});

type Erros = { nome?: string; email?: string; senha?: string; ano?: string; aceite?: string; geral?: string };

function Cadastro() {
  const navigate = useNavigate();
  const { volta } = Route.useSearch();
  const [acesso, setAcesso] = useState<{ emailHabilitado: boolean; googleHabilitado: boolean; idadeMinima: number; contasAtivas?: boolean } | null>(null);
  const [nome, setNome] = useState(() => getState().prefs.name?.trim().split(/\s+/)[0] ?? "");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ano, setAno] = useState("");
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [abaixoDaIdade, setAbaixoDaIdade] = useState(false);

  useEffect(() => {
    configAcesso().then(setAcesso, () => setAcesso({ emailHabilitado: true, googleHabilitado: false, idadeMinima: 17 }));
  }, []);

  const idadeMinima = acesso?.idadeMinima ?? 17;
  const depois = `/cadastro/completar${volta ? `?volta=${encodeURIComponent(volta)}` : ""}`;

  function validar(): Erros {
    const E = COPY.conta.erros;
    const anoNum = Number(ano);
    return {
      nome: !nome.trim() ? E.nomeVazio : undefined,
      email: !email.trim() ? E.emailVazio : !EMAIL_VALIDO.test(email.trim()) ? E.emailInvalido : undefined,
      senha: senha.length < 8 ? E.senhaCurta : undefined,
      ano: !/^\d{4}$/.test(ano) || anoNum < 1900 || anoNum > new Date().getFullYear() ? E.anoInvalido : undefined,
      aceite: !aceite ? E.aceite : undefined,
    };
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    const v = validar();
    setErros(v);
    if (Object.values(v).some(Boolean)) return;
    if (idadePeloAno(Number(ano)) < idadeMinima) {
      setAbaixoDaIdade(true);
      return;
    }
    setEnviando(true);
    try {
      const { error } = await authClient.signUp.email({
        name: nome.trim().slice(0, 40),
        email: email.trim(),
        password: senha,
        birthYear: Number(ano),
        termsVersion: LEGAL.termos.versao,
        privacyVersion: LEGAL.privacidade.versao,
        callbackURL: depois,
      });
      if (error) {
        setErros({ geral: mensagemDeErro(error) });
        return;
      }
      navigate({ to: "/verificar-email", search: { email: email.trim() } });
    } catch {
      setErros({ geral: COPY.conta.erros.rede });
    } finally {
      setEnviando(false);
    }
  }

  // Contas desligadas no servidor (D-15): entrada local, sem formulário.
  if (acesso?.contasAtivas === false) return <EntradaDemonstracao volta={volta} />;

  if (abaixoDaIdade) {
    return (
      <TelaDeAcesso titulo={COPY.conta.idadeMinimaTitulo} subtitulo={COPY.conta.idadeMinimaCorpo(idadeMinima)}>
        <Link to="/" className="btn-primary mt-8 w-full">
          {COPY.conta.voltarAoInicio}
        </Link>
      </TelaDeAcesso>
    );
  }

  return (
    <TelaDeAcesso titulo={COPY.conta.criarTitulo} subtitulo={COPY.conta.criarSubtitulo} voltarPara="/">
      {acesso?.emailHabilitado !== false ? (
        <form onSubmit={criar} noValidate className="mt-8 flex flex-col gap-4">
          <Campo rotulo={COPY.conta.nome} autoComplete="given-name" value={nome} onChange={(e) => setNome(e.target.value)} erro={erros.nome} maxLength={40} />
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
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            erro={erros.senha}
            dica={COPY.conta.senhaDica}
          />
          <Campo
            rotulo={COPY.conta.anoNascimento}
            inputMode="numeric"
            autoComplete="bday-year"
            placeholder={COPY.conta.anoExemplo}
            maxLength={4}
            value={ano}
            onChange={(e) => setAno(e.target.value.replace(/\D/g, ""))}
            erro={erros.ano}
          />
          <AceiteLegal marcado={aceite} onMudar={setAceite} erro={erros.aceite} />
          <AvisoErro>{erros.geral}</AvisoErro>
          <button type="submit" className="btn-primary mt-2 w-full" disabled={enviando}>
            {enviando ? COPY.conta.criando : COPY.conta.criarBotao}
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
              onClick={() => authClient.signIn.social({ provider: "google", callbackURL: depois, errorCallbackURL: "/cadastro" })}
            />
          </div>
        </>
      )}

      <p className="mt-auto pt-8 text-center text-sm text-nevoa">
        {COPY.conta.jaTemConta}{" "}
        <Link to="/login" search={volta ? { volta } : {}} className="tap-area font-bold text-mar-fundo underline">
          {COPY.conta.entrarBotao}
        </Link>
      </p>
    </TelaDeAcesso>
  );
}

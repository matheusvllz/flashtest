import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AceiteLegal, AvisoErro, Campo, TelaDeAcesso } from "@/components/conta/TelaDeAcesso";
import { completarCadastro, configAcesso, salvarPerfil } from "@/lib/api/conta";
import type { EstadoDaSessao } from "@/lib/api/sessao";
import { authClient } from "@/lib/auth-client";
import { perfilDoAparelho } from "@/lib/conta/perfil-local";
import { COPY } from "@/lib/copy";
import { LEGAL, idadePeloAno } from "@/lib/legal";
import { destinoSeguro, esquecerSessao, sessao } from "@/lib/sessao";
import { marcarContaAtiva } from "@/lib/store";
import { HOME_ROUTE } from "@/lib/features";

/**
 * Passo depois de entrar (docs/specs/46-producao T-05.4/T-05.5; decisão 0006): quem entrou pelo Google ainda não
 * informou o ano de nascimento nem aceitou os termos; quem já tinha conta pode precisar aceitar uma versão nova.
 * Completo o cadastro, o perfil respondido no onboarding vai para a conta e o aluno segue para onde ia.
 */
export const Route = createFileRoute("/cadastro_/completar")({
  validateSearch: (s: Record<string, unknown>): { volta?: string } => (typeof s.volta === "string" ? { volta: s.volta } : {}),
  component: Completar,
  ssr: false,
});

function Completar() {
  const navigate = useNavigate();
  const { volta } = Route.useSearch();
  const destino = destinoSeguro(volta, HOME_ROUTE);
  const [s, setS] = useState<EstadoDaSessao | null>(null);
  const [idadeMinima, setIdadeMinima] = useState(17);
  const [ano, setAno] = useState("");
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState<{ ano?: string; aceite?: string; geral?: string }>({});
  const [enviando, setEnviando] = useState(false);
  const [recusado, setRecusado] = useState(false);

  async function seguir() {
    // O perfil do onboarding (se houver neste aparelho) vai para a conta; falha aqui não trava o estudo.
    await salvarPerfil({ data: perfilDoAparelho() }).catch(() => undefined);
    marcarContaAtiva();
    esquecerSessao();
    navigate({ href: destino, replace: true });
  }

  useEffect(() => {
    let vivo = true;
    configAcesso().then((c) => vivo && setIdadeMinima(c.idadeMinima), () => undefined);
    sessao(true).then(
      (atual) => {
        if (!vivo) return;
        if (!atual.autenticado) {
          navigate({ to: "/login", search: volta ? { volta } : {}, replace: true });
          return;
        }
        if (atual.cadastroCompleto) {
          void seguir();
          return;
        }
        setS(atual);
      },
      () => vivo && setErros({ geral: COPY.conta.erros.rede }),
    );
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda uma vez, ao abrir
  }, []);

  if (recusado) {
    return (
      <TelaDeAcesso titulo={COPY.conta.idadeMinimaTitulo} subtitulo={COPY.conta.idadeMinimaCorpo(idadeMinima)}>
        <Link to="/" className="btn-primary mt-8 w-full">
          {COPY.conta.voltarAoInicio}
        </Link>
      </TelaDeAcesso>
    );
  }

  if (!s) {
    return (
      <TelaDeAcesso titulo={COPY.conta.completarTitulo}>
        <div className="mt-8">
          <AvisoErro>{erros.geral}</AvisoErro>
        </div>
      </TelaDeAcesso>
    );
  }

  const soReaceite = s.reaceitePendente;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const E = COPY.conta.erros;
    const anoNum = Number(ano);
    const novos = {
      ano: soReaceite ? undefined : !/^\d{4}$/.test(ano) || anoNum < 1900 || anoNum > new Date().getFullYear() ? E.anoInvalido : undefined,
      aceite: !aceite ? E.aceite : undefined,
    };
    setErros(novos);
    if (novos.ano || novos.aceite) return;
    if (!soReaceite && idadePeloAno(anoNum) < idadeMinima) {
      // O servidor apaga a conta; aqui só mostramos a mensagem certa.
      await completarCadastro({
        data: { anoNascimento: anoNum, termosVersao: LEGAL.termos.versao, privacidadeVersao: LEGAL.privacidade.versao },
      }).catch(() => undefined);
      await authClient.signOut().catch(() => undefined);
      esquecerSessao();
      setRecusado(true);
      return;
    }
    setEnviando(true);
    try {
      const r = await completarCadastro({
        data: {
          // Na reaceitação o ano já existe no servidor e não é reenviado (o servidor nunca troca o ano registrado).
          ...(soReaceite ? {} : { anoNascimento: anoNum }),
          termosVersao: LEGAL.termos.versao,
          privacidadeVersao: LEGAL.privacidade.versao,
          perfil: perfilDoAparelho(),
        },
      });
      if (!r.ok) {
        if (r.codigo === "IDADE_MINIMA") {
          await authClient.signOut().catch(() => undefined);
          esquecerSessao();
          setRecusado(true);
          return;
        }
        setErros({ geral: COPY.conta.erros.generico });
        return;
      }
      await seguir();
    } catch {
      setErros({ geral: COPY.conta.erros.rede });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaDeAcesso
      titulo={soReaceite ? COPY.conta.reaceiteTitulo : COPY.conta.completarTitulo}
      subtitulo={soReaceite ? COPY.conta.reaceiteSubtitulo : COPY.conta.completarSubtitulo}
    >
      <form onSubmit={enviar} noValidate className="mt-8 flex flex-col gap-4">
        {!soReaceite && (
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
        )}
        <AceiteLegal marcado={aceite} onMudar={setAceite} erro={erros.aceite} />
        <AvisoErro>{erros.geral}</AvisoErro>
        <button type="submit" className="btn-primary mt-2 w-full" disabled={enviando}>
          {enviando ? COPY.conta.salvando : COPY.conta.completarBotao}
        </button>
      </form>
    </TelaDeAcesso>
  );
}

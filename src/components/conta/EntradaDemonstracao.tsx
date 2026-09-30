/**
 * Entrada local do modo de demonstração (decisão D-15, temporária): as contas estão desligadas no servidor, então
 * "entrar" não pede e-mail nem senha — nenhum formulário recolhe senha que não seria usada. O progresso fica só
 * neste aparelho, e a tela diz isso.
 */
import { useNavigate } from "@tanstack/react-router";
import { TelaDeAcesso } from "@/components/conta/TelaDeAcesso";
import { entrarEmDemonstracao } from "@/lib/conta/demonstracao";
import { COPY } from "@/lib/copy";
import { HOME_ROUTE } from "@/lib/features";
import { destinoSeguro, esquecerSessao } from "@/lib/sessao";
import { marcarContaAtiva } from "@/lib/store";

export function EntradaDemonstracao({ volta }: { volta?: string }) {
  const navigate = useNavigate();

  function entrar() {
    entrarEmDemonstracao();
    marcarContaAtiva();
    esquecerSessao();
    navigate({ href: destinoSeguro(volta, HOME_ROUTE), replace: true });
  }

  return (
    <TelaDeAcesso titulo={COPY.conta.entrarTitulo} subtitulo={COPY.conta.demoCorpo} voltarPara="/">
      <button type="button" className="btn-primary mt-8 w-full" onClick={entrar}>
        {COPY.conta.demoBotao}
      </button>
    </TelaDeAcesso>
  );
}

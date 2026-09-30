import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AvisoErro, TelaDeAcesso } from "@/components/conta/TelaDeAcesso";
import { importarEstadoLocal } from "@/lib/api/estudo";
import { usuarioDaSessao } from "@/lib/conta/usuario-da-sessao";
import { COPY } from "@/lib/copy";
import { HOME_ROUTE } from "@/lib/features";
import { destinoSeguro } from "@/lib/sessao";
import { adiarImportacao } from "@/lib/sync/vinculo";
import {
  concluirImportacao,
  hydrate,
  montarPedidoImportacao,
  precisaDecidirImportacao,
  vincularConta,
} from "@/lib/store";

/**
 * Progresso de antes da conta (docs/specs/46-producao §G, T-07.2): o aluno escolhe levar para a conta, começar do
 * zero ou decidir depois. Nada é vinculado em silêncio. A importação manda só FATOS; o servidor recorrige e
 * recalcula o XP (com teto no XP que o aparelho mostrava).
 */
export const Route = createFileRoute("/importar-progresso")({
  validateSearch: (s: Record<string, unknown>): { volta?: string } =>
    typeof s.volta === "string" ? { volta: s.volta } : {},
  component: ImportarProgresso,
  ssr: false,
});

function ImportarProgresso() {
  const navigate = useNavigate();
  const { volta } = Route.useSearch();
  const destino = destinoSeguro(volta, HOME_ROUTE);
  const [enviando, setEnviando] = useState(false);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);
  const [erro, setErro] = useState<string>();

  const estado = hydrate();
  const userId = usuarioDaSessao();
  const seguir = () => navigate({ href: destino, replace: true });

  // Nada a decidir (já vinculado, ou nada estudado antes da conta): segue.
  const nadaADecidir = !userId || !precisaDecidirImportacao();
  useEffect(() => {
    if (nadaADecidir) seguir();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- decide uma vez, na chegada
  }, []);
  if (nadaADecidir) return null;

  const respostas = estado.learning.recentAttempts.length;
  const licoes =
    Object.keys(estado.progress.lessons).length +
    Object.keys(estado.learning.completedLessons).length;

  async function levar() {
    if (!userId) return;
    setEnviando(true);
    setErro(undefined);
    try {
      const r = await importarEstadoLocal({ data: montarPedidoImportacao() });
      if (!r.ok) {
        setErro(
          r.codigo === "LIMITE_EXCEDIDO"
            ? COPY.conta.erros.muitasTentativas
            : COPY.conta.erros.generico,
        );
        setEnviando(false);
        return;
      }
      concluirImportacao(userId, r.agregado);
      seguir();
    } catch {
      setErro(COPY.conta.erros.rede);
      setEnviando(false);
    }
  }

  function comecarDoZero() {
    if (!userId) return;
    vincularConta(userId, { descartarProgressoAntigo: true });
    seguir();
  }

  function decidirDepois() {
    adiarImportacao();
    seguir();
  }

  return (
    <TelaDeAcesso titulo={COPY.conta.importarTitulo} subtitulo={COPY.conta.importarCorpo}>
      <p className="mt-6 rounded-[var(--radius)] bg-gelo px-4 py-3 font-mono text-sm font-bold text-abismo">
        {COPY.conta.importarResumo(respostas, licoes)}
      </p>
      <div className="mt-4">
        <AvisoErro>{erro}</AvisoErro>
      </div>
      {confirmandoDescarte ? (
        <div className="mt-6 flex flex-col gap-3" role="group" aria-labelledby="aviso-descarte">
          <p id="aviso-descarte" className="text-sm text-abismo">
            {COPY.conta.comecarDoZeroAviso}
          </p>
          <button type="button" className="btn-outline w-full" onClick={comecarDoZero}>
            {COPY.conta.comecarDoZeroConfirmar}
          </button>
          <button
            type="button"
            className="btn-ghost w-full"
            onClick={() => setConfirmandoDescarte(false)}
          >
            {COPY.conta.cancelar}
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" className="btn-primary w-full" onClick={levar} disabled={enviando}>
            {enviando ? COPY.conta.importando : COPY.conta.importarBotao}
          </button>
          <button
            type="button"
            className="btn-outline w-full"
            onClick={() => setConfirmandoDescarte(true)}
            disabled={enviando}
          >
            {COPY.conta.comecarDoZero}
          </button>
          <button
            type="button"
            className="btn-ghost w-full text-sm"
            onClick={decidirDepois}
            disabled={enviando}
          >
            {COPY.conta.decidirDepois}
          </button>
        </div>
      )}
    </TelaDeAcesso>
  );
}

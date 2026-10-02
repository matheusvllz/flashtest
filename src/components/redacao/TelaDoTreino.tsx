/**
 * Treino de redação por partes (spec 49 §5.9, T-49.9.8): Pro. Tema de treino da semana; tese, argumento, repertório
 * e proposta de intervenção, cada parte com um comentário. Sem chave da IA, o comentário é automático e diz isso.
 */
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CartaoBloqueio } from "@/components/redacao/Bloqueio";
import { textoDoBloqueio } from "@/lib/redacao-bloqueio";
import { enviarParte, meuTreino } from "@/lib/api/redacao";
import { COPY } from "@/lib/copy";
import { PARTE_MAX, PARTE_MIN, PARTES_DO_TREINO, type ParteDoTreino } from "@/lib/redacao-ia";
import { useAppState } from "@/lib/store";
import type { EstadoDoTreino, ParteFeita } from "@/server/redacao/redacao";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "sem-conta" } | ({ tipo: "pronto" } & EstadoDoTreino);

export function TelaDoTreino() {
  const temConta = !!useAppState().account?.userId;
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const t = COPY.redacaoIa;

  const carregar = useCallback(async () => {
    if (!temConta) return setEstado({ tipo: "sem-conta" });
    try {
      const r = await meuTreino();
      setEstado(r.ok ? { tipo: "pronto", ...r } : { tipo: "erro" });
    } catch {
      setEstado({ tipo: "erro" });
    }
  }, [temConta]);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <AppShell title={t.treinoTitulo}>
      <div className="space-y-4 px-5 pt-4 pb-8" data-testid="tela-treino">
        {estado.tipo === "carregando" && <p className="text-sm text-nevoa">…</p>}
        {estado.tipo === "erro" && <p className="card-soft p-4 text-sm">{t.erro}</p>}
        {estado.tipo === "sem-conta" && <p className="card-soft p-4 text-sm">{t.semConta}</p>}
        {estado.tipo === "pronto" && estado.bloqueio && <CartaoBloqueio bloqueio={estado.bloqueio} />}
        {estado.tipo === "pronto" && !estado.bloqueio && (
          <>
            <section className="card-soft border-mar p-5">
              <p className="ds-label">{t.temaDaSemana}</p>
              <h2 className="mt-1 font-display text-lg font-bold leading-snug text-abismo" data-testid="treino-tema">
                {estado.tema}
              </h2>
              <p className="mt-1 text-xs text-nevoa">{t.temaAviso}</p>
              <p className="mt-1 text-xs text-nevoa">{estado.automatico ? t.automatico : t.gastaMensagem}</p>
            </section>
            {PARTES_DO_TREINO.map((p) => (
              <Parte
                key={p}
                parte={p}
                feita={estado.partes.find((x) => x.parte === p) ?? null}
                onFeita={(f) => setEstado((e) => (e.tipo === "pronto" ? { ...e, partes: [...e.partes.filter((x) => x.parte !== f.parte), f] } : e))}
              />
            ))}
          </>
        )}
      </div>
    </AppShell>
  );
}

function Parte({ parte, feita, onFeita }: { parte: ParteDoTreino; feita: ParteFeita | null; onFeita: (f: ParteFeita) => void }) {
  const t = COPY.redacaoIa;
  const info = t.partes[parte];
  const [texto, setTexto] = useState(feita?.texto ?? "");
  const [editando, setEditando] = useState(!feita);
  const [aviso, setAviso] = useState<string | null>(null);
  const [indo, setIndo] = useState(false);
  const id = `treino-${parte}`;

  async function enviar() {
    setAviso(null);
    setIndo(true);
    try {
      const r = await enviarParte({ data: { parte, texto: texto.trim() } });
      if ("parte" in r && r.ok) {
        onFeita(r.parte);
        setEditando(false);
      } else if ("motivo" in r) {
        setAviso(r.motivo === "autocuidado" && r.texto ? r.texto : textoDoBloqueio(r.motivo === "limite" ? "limiteIa" : r.motivo === "autocuidado" ? "recusado" : r.motivo));
      } else setAviso(t.erro);
    } catch {
      setAviso(t.erro);
    }
    setIndo(false);
  }

  return (
    <section className="card-soft space-y-2 p-4 text-sm text-abismo" aria-labelledby={id} data-testid={`treino-parte-${parte}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 id={id} className="font-display font-bold">
          {info.titulo}
        </h3>
        {feita && !editando && <span className="chip">{t.feita}</span>}
      </div>
      <p className="text-xs text-nevoa">{info.pedido}</p>
      {editando ? (
        <>
          <textarea
            className="input-ds min-h-28 resize-y py-2.5 leading-relaxed"
            maxLength={PARTE_MAX}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-labelledby={id}
          />
          {aviso && (
            <p role="alert" className="text-error">
              {aviso}
            </p>
          )}
          <button type="button" className="btn-primary w-full" disabled={indo || texto.trim().length < PARTE_MIN} onClick={() => void enviar()}>
            {t.enviarParte}
          </button>
        </>
      ) : (
        feita && (
          <>
            <p className="whitespace-pre-line rounded-lg bg-gelo/50 p-3 leading-relaxed">{feita.texto}</p>
            <p className="whitespace-pre-line leading-relaxed" data-testid={`treino-comentario-${parte}`}>
              {feita.comentario}
            </p>
            {feita.automatico && <p className="text-xs text-nevoa">{t.automatico}</p>}
            <button type="button" className="tap-area text-xs font-bold text-nevoa underline" onClick={() => setEditando(true)}>
              {t.reescrever}
            </button>
          </>
        )
      )}
    </section>
  );
}

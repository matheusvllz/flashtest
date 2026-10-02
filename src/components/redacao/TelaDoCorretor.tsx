/**
 * Corretor de redação (spec 49 §5.9, T-49.9.7): Pro, 10 por mês. Texto digitado; a foto fica para depois (DV49-08).
 * Estimativa por competência com o rótulo fixo "não é a nota oficial"; nunca "sua nota no ENEM".
 */
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CartaoBloqueio } from "@/components/redacao/Bloqueio";
import { textoDoBloqueio } from "@/lib/redacao-bloqueio";
import { apagarRedacao, corrigirRedacao, meuCorretor, verCorrecao } from "@/lib/api/redacao";
import { COPY } from "@/lib/copy";
import { TEMA_MAX, TEXTO_MAX, TEXTO_MIN, type Correcao } from "@/lib/redacao-ia";
import { useAppState } from "@/lib/store";
import type { EstadoDoCorretor } from "@/server/redacao/redacao";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "sem-conta" } | ({ tipo: "pronto" } & EstadoDoCorretor);
type Vista = { tipo: "form" } | { tipo: "resultado"; tema: string; correcao: Correcao };

export function TelaDoCorretor() {
  const temConta = !!useAppState().account?.userId;
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [vista, setVista] = useState<Vista>({ tipo: "form" });
  const t = COPY.redacaoIa;

  const carregar = useCallback(async () => {
    if (!temConta) return setEstado({ tipo: "sem-conta" });
    try {
      const r = await meuCorretor();
      setEstado(r.ok ? { tipo: "pronto", ...r } : { tipo: "erro" });
    } catch {
      setEstado({ tipo: "erro" });
    }
  }, [temConta]);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function abrir(id: string) {
    const r = await verCorrecao({ data: { id } }).catch(() => null);
    if (r?.ok && r.correcao) setVista({ tipo: "resultado", tema: r.tema, correcao: r.correcao });
  }

  return (
    <AppShell title={t.corretorTitulo}>
      <div className="space-y-4 px-5 pt-4 pb-8" data-testid="tela-corretor">
        {estado.tipo === "carregando" && <p className="text-sm text-nevoa">…</p>}
        {estado.tipo === "erro" && <p className="card-soft p-4 text-sm">{t.erro}</p>}
        {estado.tipo === "sem-conta" && <p className="card-soft p-4 text-sm">{t.semConta}</p>}
        {estado.tipo === "pronto" && estado.bloqueio && <CartaoBloqueio bloqueio={estado.bloqueio} />}
        {estado.tipo === "pronto" && !estado.bloqueio && vista.tipo === "form" && (
          <Formulario
            restantes={estado.restantesMes}
            onCorrigido={(tema, correcao) => {
              setVista({ tipo: "resultado", tema, correcao });
              void carregar();
            }}
          />
        )}
        {vista.tipo === "resultado" && <Resultado tema={vista.tema} correcao={vista.correcao} onNova={() => setVista({ tipo: "form" })} />}
        {estado.tipo === "pronto" && estado.historico.length > 0 && vista.tipo === "form" && (
          <section className="card-soft p-4" aria-labelledby="corretor-historico">
            <h2 id="corretor-historico" className="font-display font-bold text-abismo">
              {t.historico}
            </h2>
            <ul className="mt-2 divide-y divide-gelo text-sm">
              {estado.historico.map((h) => (
                <li key={h.id} className="flex min-h-12 items-center gap-2 py-2">
                  <span className="min-w-0 flex-1 truncate text-abismo">{h.tema}</span>
                  {h.total !== null && <span className="font-mono text-xs text-nevoa">{h.total}</span>}
                  <button type="button" className="tap-area text-xs font-bold text-mar-fundo underline" onClick={() => void abrir(h.id)}>
                    {t.abrir}
                  </button>
                  <button
                    type="button"
                    className="tap-area text-xs text-nevoa underline"
                    onClick={() => void apagarRedacao({ data: { id: h.id } }).then(() => carregar())}
                    aria-label={`${t.apagar}: ${h.tema}`}
                  >
                    {t.apagar}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function Formulario({ restantes, onCorrigido }: { restantes: number; onCorrigido: (tema: string, c: Correcao) => void }) {
  const t = COPY.redacaoIa;
  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [indo, setIndo] = useState(false);
  const pode = tema.trim().length >= 5 && texto.trim().length >= TEXTO_MIN && texto.length <= TEXTO_MAX && restantes > 0 && !indo;

  async function enviar() {
    setAviso(null);
    setIndo(true);
    try {
      const r = await corrigirRedacao({ data: { tema: tema.trim(), texto: texto.trim() } });
      if ("correcao" in r && r.ok) onCorrigido(tema.trim(), r.correcao);
      else if ("motivo" in r) setAviso(r.motivo === "autocuidado" && r.texto ? r.texto : textoDoBloqueio(r.motivo === "autocuidado" ? "recusado" : r.motivo));
      else setAviso(t.erro);
    } catch {
      setAviso(t.erro);
    }
    setIndo(false);
  }

  return (
    <section className="card-soft space-y-3 p-5 text-sm text-abismo">
      <p className="text-xs font-semibold text-nevoa" data-testid="corretor-restantes">
        {restantes === 0 ? t.limiteMes : t.restantes(restantes)}
      </p>
      <label className="block">
        <span className="font-semibold">{t.tema}</span>
        <input className="input-ds mt-1.5" maxLength={TEMA_MAX} value={tema} onChange={(e) => setTema(e.target.value)} aria-describedby="corretor-tema-ajuda" />
        <span id="corretor-tema-ajuda" className="mt-1 block text-xs text-nevoa">
          {t.temaAjuda}
        </span>
      </label>
      <label className="block">
        <span className="font-semibold">{t.texto}</span>
        <textarea
          className="input-ds mt-1.5 min-h-64 resize-y py-3 leading-relaxed"
          maxLength={TEXTO_MAX}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-describedby="corretor-texto-ajuda"
        />
        <span id="corretor-texto-ajuda" className="mt-1 flex justify-between text-xs text-nevoa">
          <span>{t.textoAjuda(TEXTO_MIN, TEXTO_MAX)}</span>
          <span>{t.contador(texto.length)}</span>
        </span>
      </label>
      <p className="text-xs text-nevoa">{t.rotulo}</p>
      {aviso && (
        <p role="alert" className="text-error">
          {aviso}
        </p>
      )}
      <button type="button" className="btn-primary w-full" disabled={!pode} onClick={() => void enviar()}>
        {indo ? t.corrigindo : t.corrigir}
      </button>
    </section>
  );
}

function Resultado({ tema, correcao, onNova }: { tema: string; correcao: Correcao; onNova: () => void }) {
  const t = COPY.redacaoIa;
  return (
    <section className="space-y-3" aria-labelledby="corretor-resultado" data-testid="corretor-resultado">
      <div className="card-soft border-mar p-5">
        <p className="ds-label">{tema}</p>
        <h2 id="corretor-resultado" className="mt-1 font-display text-xl font-bold text-abismo">
          {t.total(correcao.total)}
        </h2>
        <p className="mt-1 text-xs font-semibold text-nevoa">{t.rotulo}</p>
      </div>
      <ol className="space-y-2">
        {correcao.competencias.map((c) => (
          <li key={c.c} className="card-soft p-4 text-sm text-abismo">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display font-bold">{t.competencia(c.c)}</p>
              <span className="chip">{t.nota(c.nota)}</span>
            </div>
            <p className="mt-1.5 leading-relaxed">{c.justificativa}</p>
            {c.trecho && (
              <p className="mt-2 border-l-2 border-gelo pl-3 text-xs text-nevoa">
                {t.trecho} “{c.trecho}”
              </p>
            )}
          </li>
        ))}
      </ol>
      {correcao.comentario && (
        <div className="card-soft p-4 text-sm text-abismo">
          <p className="font-display font-bold">{t.comentario}</p>
          <p className="mt-1 leading-relaxed">{correcao.comentario}</p>
        </div>
      )}
      <button type="button" className="btn-outline w-full" onClick={onNova}>
        {t.novaCorrecao}
      </button>
    </section>
  );
}

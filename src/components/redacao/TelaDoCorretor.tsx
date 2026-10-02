/**
 * Corretor de redação (spec 49 §5.9, T-49.9.7; spec 50 §5.10.3–5.10.5, T-50.11.5 e T-50.11.7): Pro, 10 por mês.
 * Texto digitado; a foto fica para depois (DV49-08). Rótulo fixo acima do resultado, "Estimativa da Foca IA, não é a
 * nota oficial", com "Como estimamos" e os limites; nunca "sua nota no ENEM". "Sem estimativa" diz o motivo e o que
 * mudar, e não conta no mês. Cada estimativa tem "Ajudou" / "Achei estranha" (só a escolha).
 */
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CartaoBloqueio } from "@/components/redacao/Bloqueio";
import { textoDoBloqueio } from "@/lib/redacao-bloqueio";
import { apagarRedacao, avaliarEstimativa, corrigirRedacao, meuCorretor, verCorrecao } from "@/lib/api/redacao";
import { COPY } from "@/lib/copy";
import { TEMA_MAX, TEXTO_MAX, TEXTO_MIN, type Correcao } from "@/lib/redacao-ia";
import { useAppState } from "@/lib/store";
import type { EstadoDoCorretor } from "@/server/redacao/redacao";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "sem-conta" } | ({ tipo: "pronto" } & EstadoDoCorretor);
type Avaliacao = "ajudou" | "estranha" | null;
type Vista = { tipo: "form" } | { tipo: "resultado"; id: string | null; tema: string; correcao: Correcao; avaliacao: Avaliacao };

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
    if (r?.ok && r.correcao) setVista({ tipo: "resultado", id, tema: r.tema, correcao: r.correcao, avaliacao: r.avaliacao });
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
            onCorrigido={(id, tema, correcao) => {
              setVista({ tipo: "resultado", id, tema, correcao, avaliacao: null });
              void carregar();
            }}
          />
        )}
        {vista.tipo === "resultado" && (
          <Resultado id={vista.id} tema={vista.tema} correcao={vista.correcao} avaliacao={vista.avaliacao} onNova={() => setVista({ tipo: "form" })} />
        )}
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

function Formulario({ restantes, onCorrigido }: { restantes: number; onCorrigido: (id: string | null, tema: string, c: Correcao) => void }) {
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
      if ("correcao" in r && r.ok) onCorrigido(r.id, tema.trim(), r.correcao);
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

/** Rótulo fixo e "Como estimamos" com os limites (§5.10.4), sempre acima do resultado. */
function RotuloDaEstimativa() {
  const c = COPY.escrita.corretor;
  return (
    <div className="space-y-1" data-testid="corretor-rotulo">
      <p className="text-xs font-bold text-abismo">{c.rotulo}</p>
      <details className="text-xs text-nevoa">
        <summary className="tap-area cursor-pointer font-bold text-mar-fundo underline">{c.comoEstimamos}</summary>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {c.limites.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function Resultado({ id, tema, correcao, avaliacao, onNova }: { id: string | null; tema: string; correcao: Correcao; avaliacao: Avaliacao; onNova: () => void }) {
  const t = COPY.redacaoIa;
  const c = COPY.escrita.corretor;
  if (correcao.situacao === "sem-estimativa") {
    return (
      <section className="space-y-3" aria-labelledby="corretor-resultado" data-testid="corretor-resultado" data-situacao="sem-estimativa">
        <div className="card-soft border-mar space-y-2 p-5 text-sm text-abismo">
          <RotuloDaEstimativa />
          <p className="ds-label">{tema}</p>
          <h2 id="corretor-resultado" className="font-display text-lg font-bold leading-snug">
            {c.semEstimativa(c.motivos[correcao.motivo ?? "nao-dissertativo"])}
          </h2>
          {correcao.comentario && <p className="leading-relaxed">{correcao.comentario}</p>}
          {correcao.oQueMudar && (
            <>
              <p className="font-display font-bold">{c.oQueMudar}</p>
              <p className="leading-relaxed">{correcao.oQueMudar}</p>
            </>
          )}
          <p className="text-xs text-nevoa">{c.naoContou}</p>
        </div>
        <button type="button" className="btn-outline w-full" onClick={onNova}>
          {t.novaCorrecao}
        </button>
      </section>
    );
  }
  return (
    <section className="space-y-3" aria-labelledby="corretor-resultado" data-testid="corretor-resultado" data-situacao="estimada">
      <div className="card-soft border-mar space-y-2 p-5">
        <RotuloDaEstimativa />
        <p className="ds-label">{tema}</p>
        <h2 id="corretor-resultado" className="font-display text-xl font-bold text-abismo">
          {t.total(correcao.total ?? 0)}
        </h2>
        {correcao.direitosHumanosViolados && <p className="text-sm text-abismo">{c.direitosHumanos}</p>}
      </div>
      <ol className="space-y-2">
        {correcao.competencias.map((comp) => (
          <li key={comp.c} className="card-soft p-4 text-sm text-abismo">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display font-bold">{t.competencia(comp.c)}</p>
              <span className="chip">{t.nota(comp.nota)}</span>
            </div>
            <p className="mt-1.5 leading-relaxed">{comp.justificativa}</p>
            {comp.trecho && (
              <p className="mt-2 border-l-2 border-gelo pl-3 text-xs text-nevoa">
                {t.trecho} “{comp.trecho}”
              </p>
            )}
            {comp.paraSubir && (
              <p className="mt-2 leading-relaxed">
                <span className="font-bold">{c.paraSubir}</span> {comp.paraSubir}
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
      {id && <AvaliarEstimativa id={id} inicial={avaliacao} />}
      <button type="button" className="btn-outline w-full" onClick={onNova}>
        {t.novaCorrecao}
      </button>
    </section>
  );
}

/** "Ajudou" / "Achei estranha" (§5.10.5): só a escolha, gravada no servidor; pode trocar. */
function AvaliarEstimativa({ id, inicial }: { id: string; inicial: Avaliacao }) {
  const c = COPY.escrita.corretor;
  const [escolha, setEscolha] = useState<Avaliacao>(inicial);
  async function escolher(a: "ajudou" | "estranha") {
    const antes = escolha;
    setEscolha(a);
    const r = await avaliarEstimativa({ data: { id, avaliacao: a } }).catch(() => null);
    if (!r?.ok || !r.gravada) setEscolha(antes);
  }
  return (
    <div className="card-soft space-y-2 p-4 text-sm text-abismo" data-testid="corretor-avaliar">
      <p className="font-display font-bold" id={`avaliar-${id}`}>
        {c.avaliarPergunta}
      </p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby={`avaliar-${id}`}>
        {(["ajudou", "estranha"] as const).map((a) => (
          <button key={a} type="button" className={escolha === a ? "btn-primary" : "btn-outline"} aria-pressed={escolha === a} onClick={() => void escolher(a)}>
            {a === "ajudou" ? c.ajudou : c.estranha}
          </button>
        ))}
      </div>
      {escolha && (
        <p className="text-xs text-nevoa" role="status">
          {c.avaliado}
        </p>
      )}
    </div>
  );
}

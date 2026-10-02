/**
 * Um simulado (spec 50 §5.9.4, T-50.10.5): uma questão por vez, mapa das questões, "rever depois", cronômetro
 * opcional com pausa que nunca encerra sozinho, confirmação ao terminar e resultado por área e habilidade.
 * Sem nota, TRI ou previsão. A correção é do servidor; o gabarito só aparece depois de terminar.
 */
import { Link, useParams } from "@tanstack/react-router";
import { Flag, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { resolveExercise } from "@/content/microlicoes";
import { SKILL_MAP } from "@/content/taxonomy";
import { ReportarQuestao } from "@/components/questao/ReportarQuestao";
import { concluirSimulado, responderSimulado, verSimulado } from "@/lib/api/simulado";
import { carregarPacotesPara } from "@/lib/content/preload";
import { COPY } from "@/lib/copy";
import { exerciseViewFor } from "@/lib/lessons/registry";
import type { Exercise } from "@/lib/lessons/types";
import { MS_POR_QUESTAO } from "@/lib/simulado";
import type { EstadoDoSimulado } from "@/server/simulado/simulado";

const LETRAS = "ABCDEFGHIJ";
type Carga = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "pronto"; sim: EstadoDoSimulado };

function exercicio(id: string): Exercise | null {
  try {
    return resolveExercise(id);
  } catch {
    return null;
  }
}

export function TelaDoSimulado() {
  const { id } = useParams({ from: "/simulado/$id" });
  const t = COPY.simulado;
  const [carga, setCarga] = useState<Carga>({ tipo: "carregando" });

  const carregar = useCallback(async () => {
    try {
      const r = await verSimulado({ data: { id } });
      if (!r.ok) return setCarga({ tipo: "erro" });
      await carregarPacotesPara([], r.itens).catch(() => {});
      setCarga({ tipo: "pronto", sim: r });
    } catch {
      setCarga({ tipo: "erro" });
    }
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <AppShell title={carga.tipo === "pronto" ? carga.sim.rotulo : t.titulo}>
      <div className="px-5 pt-2 pb-10" data-testid="tela-do-simulado">
        {carga.tipo === "carregando" && <p className="text-sm text-nevoa">{t.carregando}</p>}
        {carga.tipo === "erro" && <p className="card-soft p-4 text-sm">{t.erro}</p>}
        {carga.tipo === "pronto" &&
          (carga.sim.concluido ? <Resultado sim={carga.sim} /> : <Prova sim={carga.sim} aoTerminar={carregar} />)}
      </div>
    </AppShell>
  );
}

function Prova({ sim, aoTerminar }: { sim: EstadoDoSimulado; aoTerminar: () => Promise<void> }) {
  const t = COPY.simulado;
  const primeiraEmBranco = Math.max(0, sim.itens.findIndex((i) => sim.respostas[i] === undefined || sim.respostas[i] === null));
  const [idx, setIdx] = useState(primeiraEmBranco);
  const [respostas, setRespostas] = useState<Record<string, number | null>>(sim.respostas);
  const [marcadas, setMarcadas] = useState<Set<string>>(() => new Set(sim.marcadas));
  const [pausado, setPausado] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [semRede, setSemRede] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mapaAberto, setMapaAberto] = useState(false);
  const tempo = useRef(sim.tempoMs);
  const [, setTique] = useState(0);

  // Tempo ativo: conta com a tela visível e sem pausa; o cronômetro só é exibido se o aluno pediu.
  useEffect(() => {
    if (pausado) return;
    const h = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        tempo.current += 1000;
        if (sim.cronometro) setTique((n) => n + 1);
      }
    }, 1000);
    return () => window.clearInterval(h);
  }, [pausado, sim.cronometro]);

  const itemId = sim.itens[idx]!;
  const ex = useMemo(() => exercicio(itemId), [itemId]);
  const View = ex ? exerciseViewFor(ex.type) : null;
  const referencia = sim.itens.length * MS_POR_QUESTAO;
  const branco = sim.itens.filter((i) => respostas[i] === undefined || respostas[i] === null).length;

  function salvar(item: string, resposta: number | null, marcada?: boolean) {
    responderSimulado({ data: { id: sim.id, itemId: item, resposta, marcada, tempoMs: tempo.current } })
      .then((r) => setSemRede(!r.ok))
      .catch(() => setSemRede(true));
  }

  function responder(a: number | number[] | null) {
    const v = typeof a === "number" ? a : null;
    setRespostas((r) => ({ ...r, [itemId]: v }));
    salvar(itemId, v);
  }

  function alternarMarca() {
    const nova = !marcadas.has(itemId);
    setMarcadas((m) => {
      const n = new Set(m);
      if (nova) n.add(itemId);
      else n.delete(itemId);
      return n;
    });
    salvar(itemId, respostas[itemId] ?? null, nova);
  }

  async function terminar() {
    setEnviando(true);
    try {
      const r = await concluirSimulado({ data: { id: sim.id, tempoMs: tempo.current } });
      if (r.ok) await aoTerminar();
      else setSemRede(true);
    } catch {
      setSemRede(true);
    } finally {
      setEnviando(false);
      setConfirmar(false);
    }
  }

  const minutos = Math.floor(tempo.current / 60_000);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button type="button" className="ds-label tap-area" onClick={() => setMapaAberto((v) => !v)} aria-expanded={mapaAberto}>
          {t.questao(idx + 1, sim.itens.length)}
        </button>
        {sim.cronometro && (
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-nevoa" aria-live="off">
              {t.tempo(minutos)}
            </span>
            <button type="button" className="chip tap-area" onClick={() => setPausado((p) => !p)} aria-label={pausado ? t.retomar : t.pausar}>
              {pausado ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
            </button>
          </div>
        )}
      </div>

      {sim.cronometro && tempo.current >= referencia && (
        <p className="card-soft p-3 text-xs text-abismo" role="status">
          {t.tempoAcabou}
        </p>
      )}

      {mapaAberto && (
        <nav aria-label={t.mapa} className="card-soft p-3">
          <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-9" data-testid="mapa-simulado">
            {sim.itens.map((i, n) => {
              const resp = respostas[i] !== undefined && respostas[i] !== null;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => {
                      setIdx(n);
                      setMapaAberto(false);
                    }}
                    aria-current={n === idx ? "step" : undefined}
                    aria-label={`${t.questao(n + 1, sim.itens.length)}${marcadas.has(i) ? `, ${t.marcada}` : ""}`}
                    className={`relative h-10 w-full rounded-lg border text-xs font-bold ${n === idx ? "border-mar" : "border-gelo"} ${resp ? "bg-mar/15 text-abismo" : "text-nevoa"}`}
                  >
                    {n + 1}
                    {marcadas.has(i) && <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-alert" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {pausado ? (
        <p className="card-soft p-6 text-center text-sm text-abismo" role="status">
          {t.pausado}
        </p>
      ) : ex && View ? (
        <div className="space-y-3" key={itemId}>
          <View exercise={ex} answer={respostas[itemId] ?? null} onAnswer={responder} checked={false} shownBlocks={undefined} />
          {ex.fonte && <p className="text-[11px] text-nevoa">{ex.fonte}</p>}
        </div>
      ) : (
        <p className="card-soft p-4 text-sm">{t.erro}</p>
      )}

      {semRede && (
        <p className="text-xs text-nevoa" role="status">
          {t.semRede}
        </p>
      )}

      <button type="button" className={`chip tap-area ${marcadas.has(itemId) ? "border-alert text-abismo" : ""}`} onClick={alternarMarca} aria-pressed={marcadas.has(itemId)}>
        <Flag size={14} aria-hidden /> {marcadas.has(itemId) ? t.marcada : t.marcar}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-outline" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>
          {t.anterior}
        </button>
        {idx < sim.itens.length - 1 ? (
          <button type="button" className="btn-primary" onClick={() => setIdx((i) => i + 1)} data-acao-principal>
            {t.proxima}
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setConfirmar(true)} data-acao-principal>
            {t.terminar}
          </button>
        )}
      </div>
      {idx < sim.itens.length - 1 && (
        <button type="button" className="btn-ghost w-full" onClick={() => setConfirmar(true)}>
          {t.terminar}
        </button>
      )}

      {confirmar && (
        <div className="card-soft space-y-3 p-4" role="alertdialog" aria-labelledby="sim-fim-titulo" data-testid="confirmar-fim">
          <p id="sim-fim-titulo" className="font-display text-base font-bold text-abismo">
            {t.terminarTitulo}
          </p>
          <p className="text-sm text-nevoa">{t.terminarCorpo(branco)}</p>
          <button type="button" className="btn-primary w-full" onClick={terminar} disabled={enviando}>
            {t.terminarSim}
          </button>
          <button type="button" className="btn-outline w-full" onClick={() => setConfirmar(false)}>
            {t.terminarNao}
          </button>
        </div>
      )}
    </div>
  );
}

function Resultado({ sim }: { sim: EstadoDoSimulado }) {
  const t = COPY.simulado;
  const r = sim.resultado;
  const [aberta, setAberta] = useState<string | null>(null);
  if (!r) return <p className="card-soft p-4 text-sm">{t.erro}</p>;

  return (
    <div className="space-y-5" data-testid="resultado-simulado">
      <section className="card-soft space-y-1 p-4">
        <h2 className="font-display text-lg font-bold text-abismo">{t.resultado.titulo}</h2>
        <p className="text-base text-abismo">{t.resultado.acertos(r.acertos, r.total)}</p>
        <p className="text-xs text-nevoa">{t.resultado.semNota}</p>
      </section>

      {r.porArea.length > 1 && (
        <section className="space-y-2">
          <h3 className="ds-label">{t.resultado.porArea}</h3>
          <ul className="space-y-1.5">
            {r.porArea.map((a) => (
              <li key={a.area} className="flex justify-between text-sm">
                <span className="text-abismo">{t.areas[a.area]}</span>
                <span className="tabular-nums text-nevoa">{t.acertosDe(a.acertos, a.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.revisar.length > 0 && (
        <section className="card-soft space-y-2 p-4">
          <h3 className="font-display text-base font-bold text-abismo">{t.resultado.revisar}</h3>
          <p className="text-xs text-nevoa">{t.resultado.revisarTexto}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-abismo">
            {r.revisar.map((s) => (
              <li key={s}>{SKILL_MAP[s]?.name ?? s}</li>
            ))}
          </ul>
          <Link to="/praticar" className="btn-outline w-full">
            {t.resultado.praticar}
          </Link>
        </section>
      )}

      <section className="space-y-2">
        <h3 className="ds-label">{t.resultado.questoes}</h3>
        <ol className="space-y-2">
          {sim.itens.map((i, n) => {
            const resp = sim.respostas[i];
            const gab = sim.gabarito?.[i];
            const estado = resp === undefined || resp === null ? t.resultado.branco : resp === gab ? t.resultado.certa : t.resultado.errada;
            return (
              <li key={i} className="card-soft">
                <button type="button" className="flex w-full items-center justify-between gap-2 p-3 text-left text-sm" onClick={() => setAberta(aberta === i ? null : i)} aria-expanded={aberta === i}>
                  <span className="text-abismo">{t.questao(n + 1, sim.itens.length)}</span>
                  <span className={estado === t.resultado.certa ? "text-success-texto" : "text-nevoa"}>{estado}</span>
                </button>
                {aberta === i && <QuestaoCorrigida itemId={i} resposta={resp ?? null} gabarito={gab ?? null} />}
              </li>
            );
          })}
        </ol>
      </section>

      <Link to="/simulado" className="btn-primary w-full">
        {t.resultado.voltar}
      </Link>
    </div>
  );
}

function QuestaoCorrigida({ itemId, resposta, gabarito }: { itemId: string; resposta: number | null; gabarito: number | null }) {
  const t = COPY.simulado;
  const ex = useMemo(() => exercicio(itemId), [itemId]);
  if (!ex) return <p className="p-3 text-sm">{t.erro}</p>;
  const View = exerciseViewFor(ex.type);
  return (
    <div className="space-y-3 border-t border-gelo p-3">
      <View exercise={ex} answer={resposta} onAnswer={() => {}} checked shownBlocks={undefined} />
      <p className="text-xs text-abismo">
        {gabarito !== null && t.resultado.gabarito(LETRAS[gabarito] ?? "?")}
        {resposta !== null && ` · ${t.resultado.sua(LETRAS[resposta] ?? "?")}`}
      </p>
      {ex.fonte && <p className="text-[11px] text-nevoa">{ex.fonte}</p>}
      <ReportarQuestao itemId={itemId} />
    </div>
  );
}

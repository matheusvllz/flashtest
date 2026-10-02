/**
 * Tarefa de escrita da trilha de redação (spec 50 §5.10.1–5.10.2, T-50.11.1 e T-50.11.3). Para todos os planos:
 * o aluno escreve (rascunho salvo no aparelho a cada 5 s pelo store), envia, e recebe a checagem automática e o
 * texto-modelo comentado. No Pro, o trecho também ganha o comentário da Foca IA (decidido no servidor).
 * Escrever nunca custa vida; a recompensa (bloco, Pérolas, XP da primeira vez) é do servidor.
 */
import { Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { EmptyState } from "@/components/ds/EmptyState";
import { tarefaDeEscrita } from "@/content/tarefas-escrita";
import { apagarRedacao, enviarEscrita, minhasTarefasDeEscrita } from "@/lib/api/redacao";
import { COPY } from "@/lib/copy";
import type { Checagem } from "@/lib/escrita";
import type { WritingTask } from "@/lib/lessons/types";
import { textoDoBloqueio } from "@/lib/redacao-bloqueio";
import { apagarRascunhoDeEscrita, salvarRascunhoDeEscrita, useAppState } from "@/lib/store";
import { puxar } from "@/lib/sync/motor";
import { fala } from "@/lib/voz";
import type { EnvioDeEscrita, ResultadoDaEscrita } from "@/server/redacao/escrita";

/** Intervalo do rascunho (§5.10.1). */
const RASCUNHO_MS = 5_000;

export function TelaDaTarefa() {
  const { tarefaId } = useParams({ from: "/redacao/escreva/$tarefaId" });
  const tarefa = tarefaDeEscrita(tarefaId);
  if (!tarefa) {
    return (
      <AppShell title={COPY.escrita.titulo}>
        <div className="px-5 pt-6">
          <EmptyState text={COPY.escrita.naoEncontrada} cta={{ label: COPY.escrita.voltar, to: "/redacao" }} />
        </div>
      </AppShell>
    );
  }
  return <Tarefa key={tarefa.id} tarefa={tarefa} />;
}

type Vista =
  | { tipo: "escrevendo" }
  | { tipo: "enviado"; r: ResultadoDaEscrita; fala: string }
  | { tipo: "anterior"; envio: EnvioDeEscrita };

function Tarefa({ tarefa }: { tarefa: WritingTask }) {
  const t = COPY.escrita;
  const s = useAppState();
  const temConta = !!s.account?.userId;
  const ex = tarefa.exercicio;
  const [texto, setTexto] = useState(() => s.rascunhosDeEscrita?.[tarefa.id]?.texto ?? "");
  const [vista, setVista] = useState<Vista>({ tipo: "escrevendo" });
  const [enviadas, setEnviadas] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [indo, setIndo] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const textoRef = useRef(texto);
  textoRef.current = texto;

  // Rascunho no aparelho a cada 5 s, e ao sair da tela ou fechar a aba.
  useEffect(() => {
    const salvar = () => {
      salvarRascunhoDeEscrita(tarefa.id, textoRef.current);
      if (textoRef.current.trim()) setSalvo(true);
    };
    const id = window.setInterval(salvar, RASCUNHO_MS);
    window.addEventListener("pagehide", salvar);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pagehide", salvar);
      salvarRascunhoDeEscrita(tarefa.id, textoRef.current);
    };
  }, [tarefa.id]);

  const carregar = useCallback(async () => {
    if (!temConta) return;
    try {
      const r = await minhasTarefasDeEscrita();
      if (!r.ok) return;
      const minha = r.tarefas.find((x) => x.tarefaId === tarefa.id);
      setEnviadas(minha?.enviadas ?? 0);
      // Sem rascunho em andamento, mostra o último envio (checagem e modelo) em vez de uma folha em branco.
      if (minha?.ultima && !textoRef.current.trim()) setVista({ tipo: "anterior", envio: minha.ultima });
    } catch {
      /* sem rede: segue escrevendo; o rascunho continua no aparelho */
    }
  }, [temConta, tarefa.id]);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  const { min, max } = ex.limites;
  const tamanho = texto.trim().length;
  const pode = temConta && tamanho >= min && tamanho <= max && !indo;

  async function enviar() {
    setAviso(null);
    setIndo(true);
    try {
      const r = await enviarEscrita({ data: { tarefaId: tarefa.id, texto: texto.trim() } });
      if (r.ok) {
        apagarRascunhoDeEscrita(tarefa.id);
        setTexto("");
        setSalvo(false);
        setEnviadas((n) => n + 1);
        setVista({ tipo: "enviado", r, fala: fala("escrita") });
        void puxar().catch(() => undefined);
      } else {
        setAviso(r.codigo === "ESCRITA_DESLIGADA" ? t.desligado : t.semRede);
      }
    } catch {
      setAviso(t.semRede);
    }
    setIndo(false);
  }

  return (
    <AppShell title={t.titulo}>
      <div className="space-y-4 px-5 pt-4 pb-8" data-testid="tela-tarefa" data-tarefa={tarefa.id}>
        <section className="card-soft border-mar space-y-2 p-5 text-sm text-abismo">
          <p className="ds-label">{tarefa.titulo}</p>
          <h1 className="font-display text-lg font-bold leading-snug">{ex.enunciado}</h1>
          <p className="text-xs font-semibold text-nevoa">{t.tema}</p>
          <p className="font-display font-bold leading-snug" data-testid="tarefa-tema">
            {ex.tema}
          </p>
          <p className="text-xs text-nevoa">{COPY.redacaoIa.temaAviso}</p>
        </section>

        {ex.textoDeApoio && (
          <section className="card-soft p-4 text-sm text-abismo" aria-labelledby="tarefa-apoio">
            <h2 id="tarefa-apoio" className="ds-label">
              {ex.textoDeApoio.rotulo}
            </h2>
            <p className="mt-2 whitespace-pre-line rounded-lg bg-gelo/50 p-3 leading-relaxed" data-testid="tarefa-apoio">
              {ex.textoDeApoio.texto}
            </p>
          </section>
        )}

        <section className="card-soft p-4 text-sm text-abismo" aria-labelledby="tarefa-como">
          <h2 id="tarefa-como" className="font-display font-bold">
            {t.comoFazer}
          </h2>
          <p className="mt-1 leading-relaxed">{ex.instrucao}</p>
          <p className="mt-2 text-xs text-nevoa">{t.autoral}</p>
        </section>

        {vista.tipo === "escrevendo" && (
          <section className="card-soft space-y-2 p-4 text-sm text-abismo">
            {enviadas > 0 && <p className="text-xs font-semibold text-nevoa">{t.jaEnviada(enviadas)}</p>}
            <label className="block">
              <span className="font-semibold">{t.seuTexto}</span>
              <textarea
                className={`input-ds mt-1.5 resize-y py-3 leading-relaxed ${tarefa.modo === "completo" ? "min-h-80" : "min-h-40"}`}
                maxLength={max}
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setSalvo(false);
                }}
                aria-describedby="tarefa-contador"
                data-testid="tarefa-texto"
              />
            </label>
            <p id="tarefa-contador" className="flex flex-wrap justify-between gap-2 text-xs text-nevoa">
              <span>{tamanho < min ? t.minimo(min) : salvo ? t.rascunhoSalvo : ""}</span>
              <span>{t.contador(texto.length, max)}</span>
            </p>
            {!temConta && <p className="text-xs text-nevoa">{t.semConta}</p>}
            {aviso && (
              <p role="alert" className="text-error">
                {aviso}
              </p>
            )}
            <button type="button" className="btn-primary w-full" disabled={!pode} onClick={() => void enviar()}>
              {indo ? t.enviando : t.enviar}
            </button>
          </section>
        )}

        {vista.tipo === "enviado" && (
          <Resultado
            tarefa={tarefa}
            envio={vista.r.envio}
            topo={
              <div className="card-soft flex items-start gap-3 p-4 text-sm text-abismo" role="status" data-testid="tarefa-enviada">
                <FocaMark size={28} expression="orgulhosa" decorative />
                <div className="min-w-0 space-y-1">
                  <p className="font-display font-bold">{t.enviado}</p>
                  <p className="text-xs text-nevoa">{vista.fala}</p>
                  <p className="text-xs font-semibold">
                    {[vista.r.xp > 0 ? t.ganhouXp(vista.r.xp) : null, vista.r.novidades.perolasGanhas > 0 ? t.ganhouPerolas(vista.r.novidades.perolasGanhas) : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {!vista.r.bloco ? <p className="text-xs text-nevoa">{t.repetido}</p> : vista.r.xp === 0 && <p className="text-xs text-nevoa">{t.semXp}</p>}
                </div>
              </div>
            }
            avisoIa={
              vista.r.avisoIa
                ? vista.r.textoDoAviso ??
                  textoDoBloqueio(vista.r.avisoIa === "limite" ? "limiteIa" : vista.r.avisoIa === "autocuidado" ? "recusado" : vista.r.avisoIa)
                : null
            }
            mostrarConviteIa={tarefa.modo === "trecho" && s.account?.plano !== "pro"}
            onDeNovo={() => setVista({ tipo: "escrevendo" })}
          />
        )}

        {vista.tipo === "anterior" && (
          <Resultado
            tarefa={tarefa}
            envio={vista.envio}
            topo={<p className="text-xs font-semibold text-nevoa">{t.jaEnviada(enviadas)}</p>}
            avisoIa={null}
            mostrarConviteIa={false}
            onDeNovo={() => setVista({ tipo: "escrevendo" })}
          />
        )}

        <Link to="/redacao" className="btn-ghost w-full">
          {t.voltar}
        </Link>
      </div>
    </AppShell>
  );
}

function Resultado({
  tarefa,
  envio,
  topo,
  avisoIa,
  mostrarConviteIa,
  onDeNovo,
}: {
  tarefa: WritingTask;
  envio: EnvioDeEscrita;
  topo: ReactNode;
  avisoIa: string | null;
  mostrarConviteIa: boolean;
  onDeNovo: () => void;
}) {
  const t = COPY.escrita;
  return (
    <div className="space-y-4">
      {topo}
      <section className="card-soft p-4 text-sm text-abismo" aria-labelledby="tarefa-enviado-texto">
        <h2 id="tarefa-enviado-texto" className="font-display font-bold">
          {t.seuTexto}
        </h2>
        <p className="mt-2 whitespace-pre-line rounded-lg bg-gelo/50 p-3 leading-relaxed">{envio.texto}</p>
      </section>
      <ChecagemAutomatica checagem={envio.checagem} />
      {envio.comentarioIa && (
        <section className="card-soft p-4 text-sm text-abismo" aria-labelledby="tarefa-ia" data-testid="tarefa-comentario-ia">
          <h2 id="tarefa-ia" className="font-display font-bold">
            {t.comentarioIa}
          </h2>
          <p className="mt-1 whitespace-pre-line leading-relaxed">{envio.comentarioIa}</p>
          <p className="mt-1 text-xs text-nevoa">{t.comentarioIaGasta}</p>
        </section>
      )}
      {avisoIa && (
        <p className="card-soft p-4 text-sm text-abismo" data-testid="tarefa-aviso-ia">
          {avisoIa}
        </p>
      )}
      {mostrarConviteIa && (
        <p className="text-xs text-nevoa" data-testid="tarefa-convite-ia">
          {t.iaNoPro}{" "}
          <Link to="/planos" className="font-bold text-mar-fundo underline">
            {COPY.redacaoIa.verPlanos}
          </Link>
        </p>
      )}
      <section className="card-soft p-4 text-sm text-abismo" aria-labelledby="tarefa-modelo" data-testid="tarefa-modelo">
        <h2 id="tarefa-modelo" className="font-display font-bold">
          {t.modeloTitulo}
        </h2>
        <p className="mt-1 text-xs text-nevoa">{t.modeloAviso}</p>
        <div className="mt-2 space-y-2 rounded-lg bg-gelo/50 p-3 leading-relaxed">
          {tarefa.modelo.texto.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          {tarefa.modelo.comentarios.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>
      <button type="button" className="btn-outline w-full" onClick={onDeNovo}>
        {t.reescrever}
      </button>
      <ApagarTexto key={envio.id} id={envio.id} />
    </div>
  );
}

/** O aluno apaga o próprio texto (privacidade.md): o texto some do servidor; a contagem da tarefa fica. */
function ApagarTexto({ id }: { id: string }) {
  const t = COPY.redacaoIa;
  const [estado, setEstado] = useState<"pronto" | "apagando" | "apagado">("pronto");
  if (estado === "apagado")
    return (
      <p className="text-center text-xs text-nevoa" role="status">
        {t.apagado}
      </p>
    );
  return (
    <button
      type="button"
      className="tap-area w-full text-xs text-nevoa underline"
      disabled={estado === "apagando"}
      onClick={() => {
        setEstado("apagando");
        void apagarRedacao({ data: { id } })
          .then((r) => setEstado(r.ok && r.apagada ? "apagado" : "pronto"))
          .catch(() => setEstado("pronto"));
      }}
    >
      {COPY.escrita.apagarTexto}
    </button>
  );
}

export function ChecagemAutomatica({ checagem }: { checagem: Checagem }) {
  return (
    <section className="card-soft p-4 text-sm text-abismo" aria-labelledby="tarefa-checagem" data-testid="tarefa-checagem">
      <h2 id="tarefa-checagem" className="font-display font-bold">
        {COPY.escrita.checagemTitulo}
      </h2>
      <ul className="mt-2 space-y-2">
        {checagem.itens.map((i) => (
          <li key={i.id} className="flex items-start gap-2" data-item={i.id} data-estado={i.estado}>
            <span aria-hidden className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${i.estado === "ok" ? "bg-mar" : "bg-recompensa"}`} />
            <span className="leading-relaxed">{i.texto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

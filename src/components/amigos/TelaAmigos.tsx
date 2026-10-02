/**
 * Ofensiva com amigos, só 18+ (spec 50 §5.6, T-50.14.4): duplas, pedidos recebidos e enviados, convite por link
 * (Web Share ou copiar; o Foca não lê contatos) e contas bloqueadas. Cada um vê só o apelido do outro, os dias da
 * dupla, o recorde e se cada um já estudou hoje. Sem chat, sem "dar um toque" (§5.6.6), sem pressão.
 */
import { Check, Flame, Link as LinkIcon, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  bloquear,
  criarConvite,
  denunciar,
  desbloquear,
  encerrarDupla,
  minhasDuplas,
  responderPedido,
} from "@/lib/api/amigos";
import { MOTIVOS_DE_DENUNCIA, type MotivoDeDenuncia } from "@/lib/amigos";
import { COPY } from "@/lib/copy";
import type { DuplaVisivel, MinhasDuplas } from "@/server/social/amigos";
import { FormApelido } from "./FormApelido";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro" }
  | { tipo: "menor" }
  | ({ tipo: "pronto" } & MinhasDuplas);

export function TelaAmigos() {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [aviso, setAviso] = useState<string | null>(null);
  const t = COPY.amigos;

  const carregar = () =>
    minhasDuplas().then(
      (r) =>
        setEstado(
          r.ok
            ? { tipo: "pronto", ...r }
            : r.codigo === "MENOR_DE_IDADE"
              ? { tipo: "menor" }
              : { tipo: "erro" },
        ),
      () => setEstado({ tipo: "erro" }),
    );
  // A guarda de rota já exige sessão; quem decide idade e função ligada é o servidor.
  useEffect(() => {
    void carregar();
  }, []);

  const agir = async (f: () => Promise<{ ok: boolean; codigo?: string }>, sucesso?: string) => {
    setAviso(null);
    try {
      const r = await f();
      if (!r.ok) setAviso(r.codigo === "LIMITE_DE_DUPLAS" ? t.limiteDuplas : t.erro);
      else if (sucesso) setAviso(sucesso);
    } catch {
      setAviso(t.erro);
    }
    await carregar();
  };

  return (
    <AppShell title={t.titulo}>
      <div className="space-y-5 px-5 pt-2 pb-10" data-testid="tela-amigos">
        {estado.tipo === "carregando" && <p className="text-sm text-nevoa">…</p>}
        {estado.tipo === "erro" && <p className="card-soft p-4 text-sm">{t.erro}</p>}
        {estado.tipo === "menor" && (
          <p className="card-soft p-4 text-sm" data-testid="amigos-menor">
            {t.menor}
          </p>
        )}
        {estado.tipo === "pronto" && estado.estado === "desligado" && (
          <p className="card-soft p-4 text-sm">{t.desligado}</p>
        )}
        {estado.tipo === "pronto" && estado.estado === "suspenso" && (
          <p className="card-soft p-4 text-sm">{t.suspenso}</p>
        )}
        {estado.tipo === "pronto" && estado.estado === "sem-apelido" && (
          <FormApelido confirmar={estado.confirmarNascimento} onPronto={() => void carregar()} />
        )}
        {estado.tipo === "pronto" && estado.estado === "pronto" && (
          <>
            <p className="text-sm text-abismo">{t.explica}</p>
            {aviso && (
              <p role="status" className="text-sm text-abismo">
                {aviso}
              </p>
            )}
            <Convidar />

            {estado.encerradas.map((e) => (
              <p
                key={e.id}
                className="card-soft p-4 text-sm text-abismo"
                data-testid="dupla-encerrada"
              >
                {t.encerrada}
              </p>
            ))}

            {estado.recebidos.length > 0 && (
              <section aria-labelledby="amigos-recebidos" className="space-y-2">
                <h2 id="amigos-recebidos" className="font-display text-lg font-bold text-abismo">
                  {t.recebidos}
                </h2>
                <ul className="space-y-2" data-testid="pedidos-recebidos">
                  {estado.recebidos.map((p) => (
                    <li
                      key={p.id}
                      className="card-soft flex flex-wrap items-center gap-2 p-4 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate font-semibold text-abismo">
                        {p.apelido}
                      </span>
                      <button
                        type="button"
                        className="btn-primary px-4"
                        onClick={() =>
                          void agir(() => responderPedido({ data: { id: p.id, aceitar: true } }))
                        }
                      >
                        {t.aceitar}
                      </button>
                      <button
                        type="button"
                        className="btn-ghost px-4"
                        onClick={() =>
                          void agir(() => responderPedido({ data: { id: p.id, aceitar: false } }))
                        }
                      >
                        {t.recusar}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="amigos-duplas" className="space-y-2">
              <h2 id="amigos-duplas" className="font-display text-lg font-bold text-abismo">
                {t.duplas} · {estado.duplas.length}/{estado.maxDuplas}
              </h2>
              {estado.duplas.length === 0 ? (
                <p className="text-sm text-nevoa">{t.semDuplas}</p>
              ) : (
                <ul className="space-y-3" data-testid="lista-duplas">
                  {estado.duplas.map((d) => (
                    <Dupla key={d.id} d={d} agir={agir} />
                  ))}
                </ul>
              )}
            </section>

            {estado.enviados.length > 0 && (
              <section aria-labelledby="amigos-enviados" className="space-y-2">
                <h2 id="amigos-enviados" className="font-display text-base font-bold text-abismo">
                  {t.enviados}
                </h2>
                <ul className="space-y-2" data-testid="pedidos-enviados">
                  {estado.enviados.map((p) => (
                    <li key={p.id} className="card-soft flex items-center gap-2 p-4 text-sm">
                      <span className="min-w-0 flex-1 truncate font-semibold text-abismo">
                        {p.apelido}
                      </span>
                      <span className="text-xs text-nevoa">{t.aguardando}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {estado.bloqueados.length > 0 && (
              <section aria-labelledby="amigos-bloqueados" className="space-y-2">
                <h2 id="amigos-bloqueados" className="font-display text-base font-bold text-abismo">
                  {t.bloqueados}
                </h2>
                <ul className="space-y-2" data-testid="contas-bloqueadas">
                  {estado.bloqueados.map((b) => (
                    <li key={b.ref} className="card-soft flex items-center gap-2 p-4 text-sm">
                      <span className="min-w-0 flex-1 truncate text-abismo">
                        {b.apelido ?? t.contaBloqueada}
                      </span>
                      <button
                        type="button"
                        className="btn-ghost px-4"
                        onClick={() => void agir(() => desbloquear({ data: { ref: b.ref } }))}
                      >
                        {t.desbloquear}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function Convidar() {
  const t = COPY.amigos;
  const [link, setLink] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [indo, setIndo] = useState(false);
  const podeCompartilhar =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function gerar() {
    setMsg(null);
    setIndo(true);
    try {
      const r = await criarConvite();
      if (r.ok) {
        setLink(`${window.location.origin}/amigos/convite/${r.codigo}`);
        setMsg(t.linkPronto);
      } else
        setMsg(
          r.codigo === "LIMITE_DE_CONVITES" || r.codigo === "LIMITE_EXCEDIDO"
            ? t.limiteConvites
            : t.erro,
        );
    } catch {
      setMsg(t.erro);
    }
    setIndo(false);
  }

  async function copiar() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setMsg(t.linkCopiado);
    } catch {
      /* sem permissão de área de transferência: o link continua visível para copiar à mão */
    }
  }

  return (
    <section className="card-soft space-y-3 p-5 text-sm" aria-labelledby="amigos-convidar">
      <h2 id="amigos-convidar" className="font-display text-lg font-bold text-abismo">
        {t.convidar}
      </h2>
      <p className="text-nevoa">{t.convidarExplica}</p>
      {!link ? (
        <button
          type="button"
          className="btn-primary w-full"
          disabled={indo}
          onClick={() => void gerar()}
        >
          {t.convidar}
        </button>
      ) : (
        <>
          <label className="block text-xs font-semibold text-abismo" htmlFor="link-convite">
            {t.linkDoConvite}
          </label>
          <input
            id="link-convite"
            data-testid="link-convite"
            className="input-ds font-mono text-xs"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
          />
          <div className="flex gap-2">
            {podeCompartilhar && (
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() =>
                  void navigator
                    .share({ title: COPY.amigos.convite.titulo, text: t.textoDoConvite, url: link })
                    .catch(() => {})
                }
              >
                <Share2 size={16} aria-hidden /> {t.compartilhar}
              </button>
            )}
            <button type="button" className="btn-ghost flex-1" onClick={() => void copiar()}>
              <LinkIcon size={16} aria-hidden /> {t.copiar}
            </button>
          </div>
        </>
      )}
      {msg && (
        <p role="status" className="text-abismo">
          {msg}
        </p>
      )}
    </section>
  );
}

function Dupla({
  d,
  agir,
}: {
  d: DuplaVisivel;
  agir: (f: () => Promise<{ ok: boolean; codigo?: string }>, sucesso?: string) => Promise<void>;
}) {
  const t = COPY.amigos;
  const [confirmar, setConfirmar] = useState(false);
  const [denuncia, setDenuncia] = useState(false);
  const hoje = (feito: boolean) => (
    <span className="inline-flex items-center gap-1">
      {feito ? <Check size={14} className="text-mar" aria-hidden /> : null}
      {feito ? t.estudou : t.naoEstudou}
    </span>
  );
  return (
    <li className="card-soft space-y-3 p-4 text-sm" data-testid="dupla">
      <div className="flex items-center gap-3">
        <Flame size={22} className="text-recompensa" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-abismo">{d.apelido}</p>
          <p className="text-xs text-nevoa">{t.recorde(d.recorde)}</p>
        </div>
        <p className="font-display text-xl font-bold text-abismo" data-testid="dupla-dias">
          {t.dias(d.dias)}
        </p>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-abismo">
        <span>
          {t.hojeVoce}: {hoje(d.voceHoje)}
        </span>
        <span>
          {t.hojeOutro(d.apelido)}: {hoje(d.outroHoje)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {!confirmar ? (
          <button
            type="button"
            className="btn-ghost px-3 text-xs"
            onClick={() => setConfirmar(true)}
          >
            {t.encerrar}
          </button>
        ) : (
          <button
            type="button"
            className="btn-ghost px-3 text-xs"
            onClick={() => void agir(() => encerrarDupla({ data: { id: d.id } }))}
          >
            {t.confirmarEncerrar}
          </button>
        )}
        <button
          type="button"
          className="btn-ghost px-3 text-xs"
          onClick={() => void agir(() => bloquear({ data: { id: d.id } }))}
        >
          {t.bloquear}
        </button>
        <button
          type="button"
          className="btn-ghost px-3 text-xs"
          aria-expanded={denuncia}
          onClick={() => setDenuncia((v) => !v)}
        >
          {t.denunciar}
        </button>
      </div>
      {denuncia && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.denunciar}>
          {MOTIVOS_DE_DENUNCIA.map((m: MotivoDeDenuncia) => (
            <button
              key={m}
              type="button"
              className="btn-ghost px-3 text-xs"
              onClick={() =>
                void agir(() => denunciar({ data: { id: d.id, motivo: m } }), t.denunciado)
              }
            >
              {t.motivos[m]}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

/**
 * Lembrete do dia no Perfil (spec 50 §5.2.5, T-50.15.3). Desligado por padrão (§0.3 A: opt-in, sem pressão).
 *
 * - Some se o servidor não está pronto (sem `LEMBRETES_HABILITADO` ou sem as chaves) ou se não há conta.
 * - Android e computador com `PushManager`: "Ligar lembrete" pede a permissão no toque e assina.
 * - iPhone/iPad fora do app instalado: opção desabilitada, com o motivo e o passo a passo da Tela de Início.
 * - Sem suporte ou com notificação bloqueada: desabilitada, com o motivo.
 * - Pausado (7 lembretes sem estudo): "Pausamos o lembrete. Quer ligar de novo?".
 * - Desligar remove a assinatura do servidor e do aparelho.
 */
import { BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { chavePublicaDoLembrete, meuLembrete, removerLembrete, salvarLembrete } from "@/lib/api/lembretes";
import { COPY } from "@/lib/copy";
import {
  assinar,
  assinaturaAtual,
  cancelarAssinatura,
  pedirPermissao,
  permissaoDeNotificacao,
  suporteDoLembrete,
  type SuporteDoLembrete,
} from "@/lib/lembretes/aparelho";
import { JANELA_PADRAO, JANELAS_DO_LEMBRETE, type JanelaDoLembrete } from "@/lib/lembretes/regras";
import { cn } from "@/lib/utils";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "oculto" }
  | { tipo: "pronto"; suporte: SuporteDoLembrete; chave: string; ligado: boolean; pausado: boolean; bloqueado: boolean };

const t = COPY.lembrete;

export function SecaoLembrete() {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [janela, setJanela] = useState<JanelaDoLembrete>(JANELA_PADRAO);
  const [ocupado, setOcupado] = useState<null | "ligando" | "desligando">(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const chave = await chavePublicaDoLembrete().catch(() => null);
      if (!vivo) return;
      if (!chave || !chave.ok || !chave.chave) return setEstado({ tipo: "oculto" });
      const suporte = suporteDoLembrete();
      const local = suporte === "ok" ? await assinaturaAtual().catch(() => null) : null;
      const r = await meuLembrete({ data: { endpoint: local?.endpoint ?? null } }).catch(() => null);
      if (!vivo) return;
      if (!r || !r.ok) return setEstado({ tipo: "oculto" });
      if (r.janela) setJanela(r.janela);
      setEstado({
        tipo: "pronto",
        suporte,
        chave: chave.chave,
        ligado: r.ligado,
        pausado: r.pausado,
        bloqueado: permissaoDeNotificacao() === "denied",
      });
    })();
    return () => {
      vivo = false;
    };
  }, []);

  if (estado.tipo !== "pronto") return null;
  const { suporte, ligado, pausado, bloqueado } = estado;
  const podeLigar = suporte === "ok" && !bloqueado;
  const dataEstado = suporte === "iphone-fora-do-app" ? "iphone" : suporte === "sem-suporte" ? "sem-suporte" : bloqueado ? "bloqueado" : pausado ? "pausado" : ligado ? "ligado" : "desligado";

  async function ligar(j: JanelaDoLembrete) {
    if (estado.tipo !== "pronto") return;
    setErro(null);
    // A permissão é pedida primeiro, ainda dentro do toque (o Safari recusa o pedido fora do gesto).
    const permissao = await pedirPermissao();
    if (permissao !== "granted") {
      setEstado({ ...estado, bloqueado: permissao === "denied" });
      setErro(t.negado);
      return;
    }
    setOcupado("ligando");
    try {
      const a = await assinar(estado.chave);
      if (!a) throw new Error("sem assinatura");
      const r = await salvarLembrete({ data: { ...a, janela: j } });
      if (!r.ok) throw new Error(r.codigo);
      setJanela(r.janela ?? j);
      setEstado({ ...estado, ligado: r.ligado, pausado: r.pausado, bloqueado: false });
    } catch {
      setErro(t.erro);
    } finally {
      setOcupado(null);
    }
  }

  async function desligar() {
    if (estado.tipo !== "pronto") return;
    setErro(null);
    setOcupado("desligando");
    try {
      const local = await assinaturaAtual().catch(() => null);
      const r = await removerLembrete({ data: { endpoint: local?.endpoint ?? null } });
      if (!r.ok) throw new Error(r.codigo);
      await cancelarAssinatura();
      setEstado({ ...estado, ligado: false, pausado: false });
    } catch {
      setErro(t.erroDesligar);
    } finally {
      setOcupado(null);
    }
  }

  function escolher(j: JanelaDoLembrete) {
    if (j === janela) return;
    setJanela(j);
    // Ligado: a troca de horário vale na hora (mesma assinatura, janela nova).
    if (ligado && !pausado) void ligar(j);
  }

  return (
    <section className="card-soft space-y-3 p-4 text-sm text-abismo" aria-labelledby="lembrete-titulo" data-testid="secao-lembrete" data-estado={dataEstado}>
      <div className="flex items-start gap-3">
        {ligado && !pausado ? <BellRing className="mt-0.5 shrink-0 text-abismo" size={18} aria-hidden /> : <BellOff className="mt-0.5 shrink-0 text-nevoa" size={18} aria-hidden />}
        <div className="min-w-0">
          <h2 id="lembrete-titulo" className="ds-label">
            {t.titulo}
          </h2>
          <p className="mt-1 text-xs text-nevoa">{t.explica}</p>
        </div>
      </div>

      {suporte === "iphone-fora-do-app" && (
        <div className="space-y-2" data-testid="lembrete-iphone">
          <p className="font-semibold">{t.iphone}</p>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-nevoa">
            {t.iphonePassos.map((passo) => (
              <li key={passo}>{passo}</li>
            ))}
          </ol>
        </div>
      )}
      {suporte === "sem-suporte" && <p className="text-xs text-nevoa">{t.semSuporte}</p>}
      {suporte === "ok" && bloqueado && <p className="text-xs text-nevoa">{t.bloqueado}</p>}

      <fieldset disabled={!podeLigar || ocupado !== null} className="space-y-2">
        <legend className="text-xs font-bold text-nevoa">{t.horario}</legend>
        <div className="grid grid-cols-2 gap-2">
          {JANELAS_DO_LEMBRETE.map((j) => (
            <button
              type="button"
              key={j}
              onClick={() => escolher(j)}
              aria-pressed={janela === j}
              className={cn("chip min-h-11 justify-center disabled:opacity-50", janela === j && "chip-on")}
            >
              {t.janelas[j]} · {t.horas[j]}
            </button>
          ))}
        </div>
        <p className="text-xs text-nevoa">{t.aproximado}</p>
      </fieldset>

      {ligado && pausado && podeLigar && (
        <p className="font-semibold" role="status">
          {t.pausado}
        </p>
      )}
      {ligado && !pausado && (
        <p className="font-semibold" role="status" data-testid="lembrete-ligado">
          {t.ligado(t.horas[janela])}
        </p>
      )}
      {erro && (
        <p role="alert" className="text-error">
          {erro}
        </p>
      )}

      {ligado ? (
        <div className="space-y-2">
          {pausado && podeLigar && (
            <button type="button" className="btn-primary w-full" disabled={ocupado !== null} onClick={() => void ligar(janela)}>
              {ocupado === "ligando" ? t.ligando : t.religar}
            </button>
          )}
          <button type="button" className="btn-ghost w-full" disabled={ocupado !== null} onClick={() => void desligar()}>
            {ocupado === "desligando" ? t.desligando : t.desligar}
          </button>
        </div>
      ) : (
        <button type="button" className="btn-primary w-full" disabled={!podeLigar || ocupado !== null} onClick={() => void ligar(janela)}>
          {ocupado === "ligando" ? t.ligando : t.ligar}
        </button>
      )}
    </section>
  );
}

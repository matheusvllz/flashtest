/**
 * Vidas e anúncios do Free na interface (spec 49 §5.3, §5.4, §6; T-49.5.2, T-49.6.2–6.4).
 * Fonte: o store (copiado do agregado do servidor). Para quem paga, ou com vidas desligadas, nada aparece.
 * Tom: a Foca em `acolhedora`, sem culpa nem contagem (R-MASC-2; Decreto 12.880/2026 art. 10).
 */
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FocaMark } from "@/components/brand/FocaMark";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { decidirCookiesDeAnuncio, ganharVidaPorAnuncio } from "@/lib/api/recompensas";
import { definirConfigAnuncios, useConfigAnuncios } from "@/hooks/useConfigAnuncios";
import { exibirRecompensado, montarRetangulo, retanguloNestaConclusao, type ConfigAnunciosCliente } from "@/lib/anuncios";
import { COPY } from "@/lib/copy";
import { aplicarVidasDoServidor, useAppState, vidasAgora } from "@/lib/store";

// ------------------------------------------------------------------ indicador

export function IndicadorVidas() {
  const s = useAppState();
  const [aberto, setAberto] = useState(false);
  const vidas = vidasAgora(s);
  if (vidas === null) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={COPY.vidas.aria(vidas)}
        className="flex min-h-11 shrink-0 items-center gap-1 rounded-full px-1 font-display text-base font-bold text-abismo"
        data-testid="indicador-vidas"
      >
        <Heart size={22} strokeWidth={2.5} className={vidas > 0 ? "text-error" : "text-nevoa"} fill="currentColor" aria-hidden />
        <span aria-live="polite">{vidas}</span>
      </button>
      <BottomSheet open={aberto} onClose={() => setAberto(false)} title={COPY.vidas.titulo}>
        <div className="space-y-3 text-sm text-abismo">
          <p>{COPY.vidas.regra}</p>
          <p className="text-nevoa">{COPY.vidas.ilimitadas}</p>
          <Link to="/planos" className="btn-outline w-full">
            {COPY.vidas.verPlanos}
          </Link>
        </div>
      </BottomSheet>
    </>
  );
}

// ------------------------------------------------------------------ cookies de anúncio

export function FolhaCookiesAnuncio({ open, onDecidir }: { open: boolean; onDecidir: (aceito: boolean) => void }) {
  return (
    <BottomSheet open={open} onClose={() => onDecidir(false)} title={COPY.anuncios.cookiesTitulo}>
      <div className="space-y-3 text-sm text-abismo" data-testid="folha-cookies-anuncio">
        <p>{COPY.anuncios.cookiesCorpo}</p>
        <Link to="/privacidade" className="underline">
          {COPY.conta.privacidade}
        </Link>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button type="button" onClick={() => onDecidir(false)} className="btn-outline w-full">
            {COPY.anuncios.recusar}
          </button>
          <button type="button" onClick={() => onDecidir(true)} className="btn-outline w-full">
            {COPY.anuncios.aceitar}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

/** Garante uma decisão de cookies antes do primeiro anúncio. Devolve a config já com a decisão. */
function useDecisaoDeCookies() {
  const [pedindo, setPedindo] = useState<((c: ConfigAnunciosCliente) => void) | null>(null);
  const cfgRef = useRef<ConfigAnunciosCliente | null>(null);

  function garantir(cfg: ConfigAnunciosCliente): Promise<ConfigAnunciosCliente> {
    if (cfg.consentimento) return Promise.resolve(cfg);
    cfgRef.current = cfg;
    return new Promise((resolve) => setPedindo(() => resolve));
  }

  const folha = (
    <FolhaCookiesAnuncio
      open={pedindo !== null}
      onDecidir={(aceito) => {
        const resolver = pedindo;
        setPedindo(null);
        void decidirCookiesDeAnuncio({ data: { aceito } }).catch(() => undefined);
        const c = { ...cfgRef.current!, consentimento: aceito ? ("aceito" as const) : ("recusado" as const) };
        definirConfigAnuncios(c);
        resolver?.(c);
      }}
    />
  );
  return { garantir, folha };
}

// ------------------------------------------------------------------ sem vidas

export function FolhaSemVidas({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useAppState();
  const navigate = useNavigate();
  const cfg = useConfigAnuncios(open);
  const { garantir, folha } = useDecisaoDeCookies();
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const anuncioUsado = s.account?.vidas?.anuncioUsado ?? false;
  const podeAssistir = !!cfg?.ativo && !anuncioUsado;

  async function assistir() {
    if (!cfg) return;
    setOcupado(true);
    setAviso(null);
    const comDecisao = await garantir(cfg);
    const r = await exibirRecompensado(comDecisao);
    if (r === "ganhou") {
      const g = await ganharVidaPorAnuncio().catch(() => null);
      if (g?.ok) {
        aplicarVidasDoServidor(g.vidas);
        setAviso(COPY.vidas.ganhou);
        setOcupado(false);
        onClose();
        return;
      }
    }
    if (r === "indisponivel") setAviso(COPY.vidas.anuncioIndisponivel);
    setOcupado(false);
  }

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title={COPY.vidas.semVidasTitulo}
        icon={<FocaMark expression="acolhedora" size={56} decorative />}
      >
        <div className="space-y-3 text-sm text-abismo" data-testid="folha-sem-vidas">
          <p>{COPY.vidas.semVidasCorpo}</p>
          {aviso && (
            <p role="status" className="text-nevoa">
              {aviso}
            </p>
          )}
          <div className="space-y-2">
            {podeAssistir && (
              <button type="button" disabled={ocupado} onClick={() => void assistir()} className="btn-outline w-full">
                {COPY.vidas.assistir}
              </button>
            )}
            <Link to="/planos" className="btn-outline w-full">
              {COPY.vidas.verPlanos}
            </Link>
            <Link to="/flashcards" className="btn-outline w-full">
              {COPY.vidas.flashcards}
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                void navigate({ to: "/trilha" });
              }}
              className="btn-ghost w-full"
            >
              {COPY.vidas.voltarAmanha}
            </button>
          </div>
        </div>
      </BottomSheet>
      {folha}
    </>
  );
}

// ------------------------------------------------------------------ retângulo na conclusão da lição

/**
 * Retângulo 300×250 abaixo do resultado (reserva do intersticial, spec 49 §5.4): só Free com anúncios ligados,
 * nunca na 1ª lição do dia, no máximo 1 a cada 2 lições e 3 por dia. Espaço reservado: sem pulo de layout.
 */
export function AnuncioNaConclusao() {
  const s = useAppState();
  const free = (s.account?.plano ?? "gratis") === "gratis" && !!s.account?.userId;
  const cfg = useConfigAnuncios(free);
  const [mostrar] = useState(() => (free ? retanguloNestaConclusao() : false));
  const { garantir, folha } = useDecisaoDeCookies();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mostrar || !cfg?.ativo || !ref.current) return;
    let limpar: (() => void) | undefined;
    let vivo = true;
    void garantir(cfg).then(async (c) => {
      if (!vivo || !ref.current) return;
      limpar = await montarRetangulo(ref.current, c);
    });
    return () => {
      vivo = false;
      limpar?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrar, cfg]);

  if (!mostrar || !cfg?.ativo) return null;
  return (
    <div className="mt-6 flex w-full flex-col items-center gap-1" data-testid="anuncio-conclusao">
      <span className="text-[11px] font-bold uppercase tracking-wider text-nevoa">{COPY.anuncios.rotulo}</span>
      <div ref={ref} className="grid h-[250px] w-[300px] max-w-full place-items-center overflow-hidden rounded-xl bg-gelo text-xs text-nevoa" />
      {folha}
    </div>
  );
}

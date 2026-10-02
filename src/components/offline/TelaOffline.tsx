/**
 * Estudo sem internet (spec 49 §5.9 item 6, T-49.9.3): substitui o marcador antigo de /offline. Basic e Pro baixam a
 * semana (lições da fila e conteúdo dos próximos dias); as respostas feitas sem rede já entram na fila de
 * sincronização e sobem quando a internet volta. A Foca IA, o caderno e a conta precisam de internet.
 */
import { Link, useRouter } from "@tanstack/react-router";
import { Check, Download, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useMinhasFuncoes } from "@/hooks/useMinhasFuncoes";
import { hrefForActivity } from "@/lib/adaptive/journey";
import { carregarPacotesPara } from "@/lib/content/preload";
import { COPY } from "@/lib/copy";
import { arquivosCarregados, baixarParaOffline, registroDoOffline, removerOffline, suportaOffline } from "@/lib/offline/service-worker";
import { setState, useAppState } from "@/lib/store";
import { sincronizarAgora } from "@/lib/sync/motor";

type Download = { tipo: "parado" } | { tipo: "baixando" } | { tipo: "pronto"; guardados: number } | { tipo: "erro" };

export function TelaOffline() {
  const s = useAppState();
  const router = useRouter();
  const temConta = !!s.account?.userId;
  const funcoes = useMinhasFuncoes(temConta);
  const pode = funcoes.has("semInternet");
  const [online, setOnline] = useState(true);
  const [registrado, setRegistrado] = useState(false);
  const [download, setDownload] = useState<Download>({ tipo: "parado" });
  const [enviando, setEnviando] = useState(false);
  const pendentes = s.account?.outbox.length ?? 0;
  const t = COPY.offline;

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    void registroDoOffline().then((r) => setRegistrado(!!r));
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  async function baixar() {
    setDownload({ tipo: "baixando" });
    try {
      const { committed, upcoming } = s.learning.journey;
      const fila = [...committed, ...upcoming];
      await carregarPacotesPara(
        fila.flatMap((a) => a.skillIds),
        fila.flatMap((a) => a.itemIds ?? []),
      );
      // Carrega o código das telas de estudo para que o service worker as guarde.
      const preparos: Promise<unknown>[] = [router.preloadRoute({ to: "/trilha" }), router.preloadRoute({ to: "/plan" })];
      if (fila[0]) preparos.push(router.preloadRoute(hrefForActivity(fila[0]) as unknown as Parameters<typeof router.preloadRoute>[0]));
      await Promise.all(preparos.map((p) => p.catch(() => undefined)));
      const guardados = await baixarParaOffline(["/trilha", "/app", "/plan", "/offline", ...arquivosCarregados()]);
      setRegistrado(true);
      setState((ss) => {
        ss.offline.downloaded = true;
        return ss;
      });
      setDownload({ tipo: "pronto", guardados });
    } catch {
      setDownload({ tipo: "erro" });
    }
  }

  async function remover() {
    await removerOffline();
    setRegistrado(false);
    setState((ss) => {
      ss.offline.downloaded = false;
      return ss;
    });
    setDownload({ tipo: "parado" });
  }

  return (
    <AppShell title={t.titulo}>
      <div className="space-y-4 px-5 pt-4 pb-8" data-testid="tela-offline">
        <div className="card-soft flex items-center gap-3 p-4">
          {online ? <Wifi className="text-abismo" aria-hidden /> : <WifiOff className="text-nevoa" aria-hidden />}
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-abismo">{online ? t.online : t.semRede}</p>
            <p className="mt-0.5 text-xs text-nevoa">{online ? t.onlineExplica : t.semRedeExplica}</p>
          </div>
        </div>

        <section className="card-soft space-y-3 p-4 text-sm text-abismo" aria-labelledby="offline-baixar">
          <h2 id="offline-baixar" className="font-display font-bold">
            {t.baixarTitulo}
          </h2>
          {!temConta ? (
            <p className="text-nevoa">{t.semConta}</p>
          ) : !suportaOffline() ? (
            <p className="text-nevoa">{t.naoSuporta}</p>
          ) : !pode ? (
            <div data-testid="offline-fechado" className="space-y-3">
              <p className="text-nevoa">{t.fechado}</p>
              <Link to="/planos" className="btn-primary w-full">
                {t.verPlanos}
              </Link>
            </div>
          ) : (
            <>
              <p className="text-nevoa">{t.baixarExplica}</p>
              {registrado && download.tipo !== "baixando" && (
                <p className="flex items-center gap-2 font-semibold" data-testid="offline-pronto">
                  <Check size={16} aria-hidden /> {download.tipo === "pronto" ? t.pronto(download.guardados) : t.jaBaixado}
                </p>
              )}
              {download.tipo === "erro" && (
                <p role="alert" className="text-error">
                  {t.erro}
                </p>
              )}
              <button type="button" onClick={() => void baixar()} disabled={!online || download.tipo === "baixando"} className="btn-primary w-full">
                <Download size={16} aria-hidden /> {download.tipo === "baixando" ? t.baixando : registrado ? t.atualizar : t.baixar}
              </button>
              {registrado && (
                <button type="button" onClick={() => void remover()} className="btn-ghost w-full text-sm">
                  {t.remover}
                </button>
              )}
            </>
          )}
        </section>

        {temConta && (
          <section className="card-soft space-y-3 p-4 text-sm text-abismo" aria-labelledby="offline-sync">
            <h2 id="offline-sync" className="font-display font-bold">
              {t.syncTitulo}
            </h2>
            <p className="text-nevoa" data-testid="offline-pendentes">
              {t.pendentes(pendentes)}
            </p>
            {pendentes > 0 && (
              <button
                type="button"
                disabled={!online || enviando}
                onClick={() => {
                  setEnviando(true);
                  void sincronizarAgora().finally(() => setEnviando(false));
                }}
                className="btn-outline w-full"
              >
                {enviando ? t.enviando : t.enviarAgora}
              </button>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}

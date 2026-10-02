/**
 * Simulados (spec 50 §5.9.4, T-50.10.4): mini da semana para todos; provas do ENEM e simulado nível ENEM no Pro.
 * Rótulos honestos: só a prova inteira de um ano é "Prova do ENEM"; o resto é "nível ENEM".
 */
import { Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { iniciarSimulado, meusSimulados } from "@/lib/api/simulado";
import { COPY } from "@/lib/copy";
import { AREAS, type AreaEnem } from "@/lib/simulado";
import type { OpcoesDeSimulado } from "@/server/simulado/simulado";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | ({ tipo: "pronto" } & OpcoesDeSimulado);
type Pedido = { tipo: "mini" } | { tipo: "prova"; ano: number; area: AreaEnem } | { tipo: "nivel"; area: AreaEnem } | { tipo: "dia"; dia: 1 | 2 };

export function TelaSimulados() {
  const t = COPY.simulado;
  const nav = useNavigate();
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [cronometro, setCronometro] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let vivo = true;
    meusSimulados()
      .then((r) => vivo && setEstado(r.ok ? { tipo: "pronto", ...r } : { tipo: "erro" }))
      .catch(() => vivo && setEstado({ tipo: "erro" }));
    return () => {
      vivo = false;
    };
  }, []);

  async function comecar(pedido: Pedido) {
    if (ocupado) return;
    setOcupado(true);
    try {
      const r = await iniciarSimulado({ data: { pedido, cronometro } });
      if (r.ok) await nav({ to: "/simulado/$id", params: { id: r.id } });
    } finally {
      setOcupado(false);
    }
  }

  const p = estado.tipo === "pronto" ? estado : null;
  const anos = p ? [...new Set(p.completo.provas.map((x) => x.ano))] : [];

  return (
    <AppShell title={t.titulo}>
      <div className="space-y-5 px-5 pt-2 pb-10" data-testid="tela-simulados">
        {estado.tipo === "carregando" && <p className="text-sm text-nevoa">{t.carregando}</p>}
        {estado.tipo === "erro" && <p className="card-soft p-4 text-sm">{t.erro}</p>}
        {p && (
          <>
            <label className="flex min-h-11 items-center gap-2 text-sm text-abismo">
              <input type="checkbox" checked={cronometro} onChange={(e) => setCronometro(e.target.checked)} className="h-5 w-5" />
              <span>
                {t.cronometro}
                <span className="block text-xs text-nevoa">{t.cronometroAjuda}</span>
              </span>
            </label>

            <section className="card-soft space-y-2 p-4" data-testid="mini-simulado">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-abismo">
                <ClipboardList size={18} className="text-mar" aria-hidden /> {t.mini.titulo}
              </h2>
              <p className="text-xs text-nevoa">{t.mini.texto}</p>
              {!p.mini.disponivel ? (
                <p className="text-xs text-nevoa">{t.mini.indisponivel}</p>
              ) : p.mini.id && p.mini.concluido ? (
                <Link to="/simulado/$id" params={{ id: p.mini.id }} className="btn-outline w-full">
                  {t.mini.verResultado}
                </Link>
              ) : (
                <button type="button" className="btn-primary w-full" onClick={() => comecar({ tipo: "mini" })} disabled={ocupado}>
                  {p.mini.id ? t.mini.continuar : t.mini.comecar}
                </button>
              )}
            </section>

            {!p.completo.liberado ? (
              <section className="card-soft space-y-2 p-4" data-testid="simulado-convite">
                <p className="flex items-center gap-2 text-sm text-abismo">
                  <Lock size={16} className="text-nevoa" aria-hidden /> {t.noPro}
                </p>
                <Link to="/planos" className="btn-outline w-full">
                  {t.verPlanos}
                </Link>
              </section>
            ) : (
              <>
                <section className="space-y-2" data-testid="provas-enem">
                  <h2 className="font-display text-base font-bold text-abismo">{t.provas}</h2>
                  <p className="text-xs text-nevoa">{t.provasTexto}</p>
                  {anos.map((ano) => (
                    <div key={ano} className="card-soft p-3">
                      <p className="text-sm font-bold text-abismo">ENEM {ano}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {p.completo.provas
                          .filter((x) => x.ano === ano)
                          .map((x) => (
                            <button key={x.area} type="button" className="chip tap-area flex-col items-start py-2 text-left" disabled={ocupado} onClick={() => comecar({ tipo: "prova", ano, area: x.area })}>
                              <span className="font-bold">{t.areas[x.area]}</span>
                              <span className="text-[11px] text-nevoa">{t.questoesDisponiveis(x.questoes)}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </section>
                <section className="space-y-2" data-testid="nivel-enem">
                  <h2 className="font-display text-base font-bold text-abismo">{t.nivel}</h2>
                  <p className="text-xs text-nevoa">{t.nivelTexto}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {AREAS.map((a) => (
                      <button key={a} type="button" className="chip tap-area justify-center py-2" disabled={ocupado} onClick={() => comecar({ tipo: "nivel", area: a })}>
                        {t.areas[a]}
                      </button>
                    ))}
                    {([1, 2] as const).map((d) => (
                      <button key={d} type="button" className="chip tap-area justify-center py-2" disabled={ocupado} onClick={() => comecar({ tipo: "dia", dia: d })}>
                        {t.dia(d)}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {p.historico.length > 0 && (
              <section className="space-y-2">
                <h2 className="font-display text-base font-bold text-abismo">{t.historico}</h2>
                <ul className="space-y-2">
                  {p.historico.map((h) => (
                    <li key={h.id}>
                      <Link to="/simulado/$id" params={{ id: h.id }} className="card-soft flex items-center justify-between gap-2 p-3 text-sm">
                        <span className="min-w-0 truncate text-abismo">{h.rotulo}</span>
                        <span className="shrink-0 text-xs text-nevoa">{h.concluido && h.acertos !== null ? t.acertosDe(h.acertos, h.total) : t.emAndamento}</span>
                      </Link>
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

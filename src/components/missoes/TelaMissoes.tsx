/**
 * Aba Missões (spec 50 §5.4, §5.11.2): missões do dia, desafio do mês, conquistas e medalhas; liga e amigos só para
 * quem o servidor diz que é 18+ (e com a função ligada). Sem contagem regressiva, sem "corra".
 */
import { Link } from "@tanstack/react-router";
import { Award, Check, ChevronRight, Medal, Target, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { IconePerola } from "@/components/economia/IconePerola";
import { minhasDuplas } from "@/lib/api/amigos";
import { minhasMissoes } from "@/lib/api/missoes";
import { meuRanking } from "@/lib/api/ranking";
import { COPY } from "@/lib/copy";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { MinhasMissoes } from "@/server/gamificacao/missoes";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "sem-conta" } | ({ tipo: "pronto" } & MinhasMissoes);

function nomeDoMes(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, 15)).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function TelaMissoes() {
  const temConta = !!useAppState().account?.userId;
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [social, setSocial] = useState<{ liga: boolean; amigos: boolean }>({ liga: false, amigos: false });
  const t = COPY.missoes;

  useEffect(() => {
    let vivo = true;
    if (!temConta) {
      setEstado({ tipo: "sem-conta" });
      return;
    }
    minhasMissoes()
      .then((r) => vivo && setEstado(r.ok ? { tipo: "pronto", ...r } : { tipo: "erro" }))
      .catch(() => vivo && setEstado({ tipo: "erro" }));
    // Liga e amigos: só aparecem quando o servidor confirma que o aluno pode (18+) e a função está ligada.
    meuRanking()
      .then((r) => vivo && setSocial((s) => ({ ...s, liga: r.ok && r.estado !== "menor" && r.estado !== "desligado" && r.estado !== "suspenso" })))
      .catch(() => {});
    // Menor recebe MENOR_DE_IDADE (ok: false): o link não aparece.
    minhasDuplas()
      .then((r) => vivo && setSocial((s) => ({ ...s, amigos: r.ok && r.estado !== "desligado" && r.estado !== "suspenso" })))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [temConta]);

  const pronto = estado.tipo === "pronto" ? estado : null;
  const conquistadas = pronto?.conquistas.filter((c) => c.obtidaEm) ?? [];

  return (
    <AppShell title={t.titulo}>
      <div className="space-y-5 px-5 pt-2 pb-10" data-testid="tela-missoes">
        {estado.tipo === "carregando" && <p className="text-sm text-nevoa">{t.carregando}</p>}
        {estado.tipo === "erro" && <p className="card-soft p-4 text-sm">{t.erro}</p>}
        {estado.tipo === "sem-conta" && (
          <div className="card-soft space-y-3 p-5 text-sm">
            <p>{t.semConta}</p>
            <Link to="/login" className="btn-primary w-full">
              {COPY.caderno.entrar}
            </Link>
          </div>
        )}

        {pronto && !pronto.ligado && <p className="card-soft p-4 text-sm text-nevoa">{t.desligadas}</p>}

        {pronto && pronto.ligado && (
          <section aria-labelledby="missoes-hoje" className="space-y-2">
            <h2 id="missoes-hoje" className="flex items-center gap-2 font-display text-lg font-bold text-abismo">
              <Target size={18} className="text-mar" aria-hidden /> {t.hoje}
            </h2>
            <p className="text-xs text-nevoa">{t.explica}</p>
            <ul className="space-y-2" data-testid="lista-missoes">
              {pronto.missoes.map((m) => (
                <li key={m.id} className={cn("card-soft space-y-2 p-4", m.concluida && "border-success")} data-missao={m.id} data-concluida={m.concluida}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-abismo">{t.textos[m.id] ?? m.id}</p>
                    {m.concluida ? (
                      <span className="chip chip-on inline-flex shrink-0 items-center gap-1 text-[12px]">
                        <Check size={13} aria-hidden /> {t.feita}
                      </span>
                    ) : (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-nevoa">
                        <IconePerola size={14} decorative /> 10
                      </span>
                    )}
                  </div>
                  <ProgressBar value={m.progresso} max={m.alvo} tone={m.concluida ? "success" : "caneta"} size="sm" label={t.textos[m.id] ?? m.id} />
                  <p className="text-xs text-nevoa">{t.progresso(Math.min(m.progresso, m.alvo), m.alvo)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pronto && (
          <section aria-labelledby="desafio-mes" className="card-soft space-y-2 p-4" data-testid="desafio-mes">
            <h2 id="desafio-mes" className="flex items-center gap-2 font-display text-base font-bold text-abismo">
              <Trophy size={18} className="text-recompensa" aria-hidden /> {t.desafio.titulo} · <span className="capitalize">{nomeDoMes(pronto.desafio.mes)}</span>
            </h2>
            <p className="text-xs text-nevoa">{pronto.desafio.concluido ? t.desafio.feito : t.desafio.texto(pronto.desafio.alvo)}</p>
            <ProgressBar value={pronto.desafio.progresso} max={pronto.desafio.alvo} tone="recompensa" size="sm" label={t.desafio.titulo} />
            <p className="text-xs text-nevoa">{t.progresso(pronto.desafio.progresso, pronto.desafio.alvo)}</p>
          </section>
        )}

        {pronto && (
          <section aria-labelledby="conquistas" className="space-y-2">
            <h2 id="conquistas" className="flex items-center gap-2 font-display text-lg font-bold text-abismo">
              <Award size={18} className="text-mar" aria-hidden /> {t.conquistas} · {conquistadas.length}/{pronto.conquistas.length}
            </h2>
            <ul className="grid grid-cols-2 gap-2" data-testid="lista-conquistas">
              {pronto.conquistas.map((c) => {
                const info = COPY.conquistas[c.id];
                return (
                  <li
                    key={c.id}
                    className={cn("card-soft p-3 text-left", !c.obtidaEm && "opacity-70")}
                    data-obtida={!!c.obtidaEm}
                  >
                    <p className="text-[13px] font-bold text-abismo">{info?.nome ?? c.id}</p>
                    <p className="mt-0.5 text-[11px] text-nevoa">{c.obtidaEm ? t.obtida : info?.criterio}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-nevoa">
                      <IconePerola size={12} decorative /> {c.perolas}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {pronto && (
          <section aria-labelledby="medalhas" className="space-y-2">
            <h2 id="medalhas" className="flex items-center gap-2 font-display text-lg font-bold text-abismo">
              <Medal size={18} className="text-recompensa" aria-hidden /> {t.medalhas}
            </h2>
            {pronto.medalhas.length === 0 ? (
              <p className="text-xs text-nevoa">{t.semMedalha}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {pronto.medalhas.map((m) => (
                  <li key={m} className="chip capitalize">
                    {nomeDoMes(m)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {(social.liga || social.amigos) && (
          <section aria-label={t.social} className="space-y-2" data-testid="missoes-social">
            {social.liga && (
              <Link to="/ranking" className="card-soft flex items-center gap-3 p-4" data-testid="missoes-liga">
                <Trophy size={20} className="text-mar" aria-hidden />
                <span className="flex-1 font-semibold text-abismo">{COPY.liga.titulo}</span>
                <ChevronRight size={18} className="text-nevoa" aria-hidden />
              </Link>
            )}
            {social.amigos && (
              <Link to="/amigos" className="card-soft flex items-center gap-3 p-4" data-testid="missoes-amigos">
                <Users size={20} className="text-mar" aria-hidden />
                <span className="flex-1 font-semibold text-abismo">{COPY.amigos.titulo}</span>
                <ChevronRight size={18} className="text-nevoa" aria-hidden />
              </Link>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}

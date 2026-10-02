/**
 * Ranking semanal de maiores de 18 (spec 49 D49-06, §5.6, T-49.8.2). Opt-in com apelido; menor não vê nada além do
 * aviso. Sem mensagem, sem perfil clicável, sem "caiu", sem notificação. Substitui a turma fictícia (T-49.8.3).
 */
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { denunciar, entrarNoRanking, meuRanking, sairDoRanking } from "@/lib/api/ranking";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { MeuRanking } from "@/server/ranking/ranking";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | ({ tipo: "pronto" } & MeuRanking);

export function TelaDoRanking() {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const t = COPY.ranking;

  const carregar = () =>
    meuRanking().then(
      (r) => setEstado(r.ok ? { tipo: "pronto", ...r } : { tipo: "erro" }),
      () => setEstado({ tipo: "erro" }),
    );
  useEffect(() => {
    void carregar();
  }, []);

  return (
    <AppShell title={t.titulo}>
      <div className="px-5 pt-4 pb-8 space-y-4" data-testid="tela-ranking">
        {estado.tipo === "erro" && <p className="card-soft p-4 text-sm">{t.erro}</p>}
        {estado.tipo === "pronto" && estado.estado === "desligado" && <p className="card-soft p-4 text-sm">{t.desligado}</p>}
        {estado.tipo === "pronto" && estado.estado === "menor" && (
          <p className="card-soft p-4 text-sm" data-testid="ranking-menor">
            {t.menor}
          </p>
        )}
        {estado.tipo === "pronto" && estado.estado === "fora" && <Entrada confirmar={estado.confirmarNascimento} onEntrou={() => void carregar()} />}
        {estado.tipo === "pronto" && estado.estado === "participando" && <Grupo r={estado} onMudou={() => void carregar()} />}
      </div>
    </AppShell>
  );
}

function Entrada({ confirmar, onEntrou }: { confirmar: boolean; onEntrou: () => void }) {
  const t = COPY.ranking;
  const [apelido, setApelido] = useState("");
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [indo, setIndo] = useState(false);

  async function entrar() {
    setErro(null);
    setIndo(true);
    try {
      const r = await entrarNoRanking({
        data: { apelido, ...(confirmar ? { nascimento: { dia: Number(dia) || 0, mes: Number(mes) || 0 } } : {}) },
      });
      if ("problema" in r) setErro(t.problemas[r.problema as keyof typeof t.problemas] ?? t.erro);
      else if (!r.ok) setErro(r.codigo === "MENOR_DE_IDADE" ? t.menor : t.erro);
      else onEntrou();
    } catch {
      setErro(t.erro);
    }
    setIndo(false);
  }

  return (
    <section className="card-soft space-y-3 p-5 text-sm text-abismo" aria-labelledby="ranking-entrar">
      <h2 id="ranking-entrar" className="font-display text-lg font-bold">
        {t.entrarTitulo}
      </h2>
      <p>{t.explica}</p>
      <p className="text-nevoa">{t.comoPontua}</p>
      <label className="block font-semibold" htmlFor="ranking-apelido">
        {t.apelido}
      </label>
      <input id="ranking-apelido" className="input-ds" maxLength={20} value={apelido} onChange={(e) => setApelido(e.target.value)} aria-describedby="ranking-apelido-ajuda" />
      <p id="ranking-apelido-ajuda" className="text-xs text-nevoa">
        {t.apelidoAjuda}
      </p>
      {confirmar && (
        <fieldset className="space-y-2">
          <legend className="text-sm">{t.nascimento}</legend>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="text-xs font-semibold">{t.dia}</span>
              <input className="input-ds" inputMode="numeric" maxLength={2} value={dia} onChange={(e) => setDia(e.target.value.replace(/\D/g, ""))} />
            </label>
            <label className="flex-1">
              <span className="text-xs font-semibold">{t.mes}</span>
              <input className="input-ds" inputMode="numeric" maxLength={2} value={mes} onChange={(e) => setMes(e.target.value.replace(/\D/g, ""))} />
            </label>
          </div>
        </fieldset>
      )}
      {erro && (
        <p role="alert" className="text-error">
          {erro}
        </p>
      )}
      <button type="button" disabled={indo} onClick={() => void entrar()} className="btn-primary w-full">
        {t.entrar}
      </button>
    </section>
  );
}

function Grupo({ r, onMudou }: { r: Extract<MeuRanking, { estado: "participando" }>; onMudou: () => void }) {
  const t = COPY.ranking;
  const [aviso, setAviso] = useState<string | null>(null);
  const eu = r.grupo.find((l) => l.voce);
  return (
    <section className="space-y-3" aria-labelledby="ranking-grupo">
      <h2 id="ranking-grupo" className="sr-only">
        {t.titulo}
      </h2>
      {eu && <p className="font-display text-lg font-bold text-abismo">{t.suaPosicao(eu.posicao)}</p>}
      <p className="text-xs text-nevoa">{t.comoPontua}</p>
      {aviso && (
        <p role="status" className="text-sm text-abismo">
          {aviso}
        </p>
      )}
      <ol className="card-soft divide-y divide-gelo" data-testid="ranking-grupo">
        {r.grupo.map((l) => (
          <li key={`${l.posicao}-${l.apelido}`} className={cn("flex min-h-12 items-center gap-3 px-4 py-2 text-sm", l.voce && "bg-gelo/60 font-bold")}>
            <span className="w-8 font-mono text-nevoa">{t.posicao(l.posicao)}</span>
            <span className="min-w-0 flex-1 truncate text-abismo">
              {l.apelido}
              {l.voce && ` · ${t.voce}`}
            </span>
            <span className="font-mono text-xs text-nevoa">{t.pontos(l.pontos)}</span>
            {!l.voce && (
              <button
                type="button"
                className="tap-area text-xs text-nevoa underline"
                onClick={() =>
                  void denunciar({ data: { apelido: l.apelido } }).then((x) => {
                    if (x.ok) setAviso(t.denunciado);
                    onMudou();
                  })
                }
                aria-label={`${t.denunciar}: ${l.apelido}`}
              >
                {t.denunciar}
              </button>
            )}
          </li>
        ))}
      </ol>
      <button type="button" className="btn-ghost w-full text-sm" onClick={() => void sairDoRanking().then(onMudou)}>
        {t.sair}
      </button>
    </section>
  );
}

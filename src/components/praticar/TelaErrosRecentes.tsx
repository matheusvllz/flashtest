/**
 * Rever erros recentes (spec 50 §5.7.2): as questões erradas (ou "Não sei") de primeira nos últimos 7 dias, até 10,
 * numa sessão no player das lições em modo "revisaoLivre" — sem vida, sem combo, sem XP, sem mexer no domínio.
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MicroLessonPlayer } from "@/components/learning/MicroLessonPlayer";
import { licaoDeRevisao } from "@/lib/caderno";
import { carregarPacotesPara } from "@/lib/content/preload";
import { COPY } from "@/lib/copy";
import { errosRecentes } from "@/lib/praticar";
import { hojeISO, useAppState } from "@/lib/store";

export function TelaErrosRecentes() {
  const s = useAppState();
  const t = COPY.praticar.erros;
  const [hoje] = useState(() => hojeISO());
  const ids = useMemo(() => errosRecentes(s, hoje), [s, hoje]);
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    let vivo = true;
    carregarPacotesPara([], ids)
      .catch(() => {})
      .finally(() => vivo && setPronto(true));
    return () => {
      vivo = false;
    };
    // Os ids desta sessão são fixados na entrada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const licao = useMemo(() => {
    if (!pronto) return null;
    try {
      return licaoDeRevisao(ids, { id: `erros--${hoje}`, titulo: t.titulo, intro: t.intro, recap: t.recap });
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto]);

  if (licao) {
    return (
      <MicroLessonPlayer
        lesson={licao}
        mode="revisaoLivre"
        onComplete={() => ({ xpAwarded: 0, stars: null })}
        conclusao={() => (
          <div className="flex min-h-full flex-col justify-center gap-4 px-5 py-10 text-center" data-testid="erros-feito">
            <p className="font-display text-xl font-bold text-abismo">{t.recap}</p>
            <Link to="/praticar" className="btn-primary w-full">
              {t.voltar}
            </Link>
          </div>
        )}
      />
    );
  }
  return (
    <AppShell title={t.titulo}>
      <div className="space-y-3 px-5 pt-2" data-testid="erros-vazio">
        <p className="card-soft p-4 text-sm text-abismo">{pronto ? t.vazio : COPY.perolas.carregando}</p>
        <Link to="/praticar" className="btn-outline w-full">
          {t.voltar}
        </Link>
      </div>
    </AppShell>
  );
}

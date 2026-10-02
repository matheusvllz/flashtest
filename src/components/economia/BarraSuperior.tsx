import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { IconePerola } from "@/components/economia/IconePerola";
import { IndicadorSequencia } from "@/components/learning/IndicadorSequencia";
import { IndicadorVidas } from "@/components/vidas/Vidas";
import { meuHistoricoDePerolas } from "@/lib/api/economia";
import { COPY } from "@/lib/copy";
import type { MotivoDePerola } from "@/lib/perolas";
import { useAppState } from "@/lib/store";

/**
 * Barra superior fixa das abas (spec 50 §5.11.1): ofensiva, Pérolas e vidas (só Free com vidas ligadas). Cada um abre a
 * própria folha. Fora das abas-raiz (lição, questão, simulado, pagamento) ela não aparece.
 */
export function BarraSuperior() {
  const s = useAppState();
  return (
    <div className="flex items-center justify-between gap-2" data-testid="barra-superior">
      <IndicadorSequencia s={s} />
      <div className="flex items-center gap-1">
        <IndicadorPerolas />
        <IndicadorVidas />
      </div>
    </div>
  );
}

export function IndicadorPerolas() {
  const s = useAppState();
  const [aberto, setAberto] = useState(false);
  if (!s.account?.userId) return null;
  const saldo = s.account.perolas;
  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={saldo === undefined ? COPY.perolas.nome : COPY.perolas.saldoAria(saldo)}
        className="flex min-h-11 shrink-0 items-center gap-1 rounded-full px-1.5 font-display text-base font-bold text-abismo"
        data-testid="indicador-perolas"
      >
        <IconePerola size={22} decorative />
        <span aria-live="polite">{saldo ?? "—"}</span>
      </button>
      <FolhaPerolas open={aberto} onClose={() => setAberto(false)} saldo={saldo} />
    </>
  );
}

type Movimento = { quantidade: number; motivo: MotivoDePerola; dia: string };

function dataCurta(dia: string) {
  const [, m, d] = dia.split("-");
  return `${d}/${m}`;
}

/** Saldo, como ganhar e o histórico de 90 dias (spec 50 §5.3.4). */
export function FolhaPerolas({ open, onClose, saldo }: { open: boolean; onClose: () => void; saldo: number | undefined }) {
  const t = COPY.perolas;
  const [movs, setMovs] = useState<Movimento[] | null | "erro">(null);
  useEffect(() => {
    if (!open) return;
    let vivo = true;
    setMovs(null);
    meuHistoricoDePerolas()
      .then((r) => vivo && setMovs(r.ok ? r.movimentos : "erro"))
      .catch(() => vivo && setMovs("erro"));
    return () => {
      vivo = false;
    };
  }, [open]);
  return (
    <BottomSheet open={open} onClose={onClose} title={t.titulo} icon={<IconePerola size={48} decorative />}>
      <div className="space-y-3 text-sm text-abismo" data-testid="folha-perolas">
        <p className="font-display text-2xl font-bold">{saldo === undefined ? "—" : t.saldoAria(saldo)}</p>
        <p className="text-nevoa">{t.comoGanhar}</p>
        <Link to="/loja" className="btn-primary w-full" onClick={onClose}>
          {t.irLoja}
        </Link>
        <p className="ds-label pt-1">{t.historico}</p>
        {movs === null && <p className="text-nevoa">{t.carregando}</p>}
        {movs === "erro" && <p className="text-nevoa">{t.erro}</p>}
        {Array.isArray(movs) && movs.length === 0 && <p className="text-nevoa">{t.historicoVazio}</p>}
        {Array.isArray(movs) && movs.length > 0 && (
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {movs.map((m, i) => (
              <li key={i} className="flex items-center justify-between gap-2 border-b border-gelo py-1.5 last:border-0">
                <span>
                  {t.motivos[m.motivo] ?? m.motivo} <span className="text-xs text-nevoa">· {dataCurta(m.dia)}</span>
                </span>
                <span className={m.quantidade > 0 ? "font-bold text-success-texto" : "font-bold text-abismo"}>
                  {m.quantidade > 0 ? `+${m.quantidade}` : m.quantidade}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BottomSheet>
  );
}

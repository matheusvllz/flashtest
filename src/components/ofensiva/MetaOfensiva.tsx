import { Target } from "lucide-react";
import { ProgressBar } from "@/components/ds/ProgressBar";
import { COPY } from "@/lib/copy";
import { METAS_DE_OFENSIVA, PEROLAS_DA_META, type MetaDeOfensiva } from "@/lib/perolas";

/**
 * Meta de ofensiva escolhida pelo aluno (spec 50 §5.2.2): opt-in, recompensa fixa mostrada antes, sem aposta, sem
 * contagem regressiva, sem texto de perda. Trocar ou desistir a qualquer momento.
 */
export function MetaOfensiva({
  meta,
  ocupado,
  onEscolher,
  onDesistir,
}: {
  meta: { alvo: number; feitos: number } | null;
  ocupado: boolean;
  onEscolher: (alvo: MetaDeOfensiva) => void;
  onDesistir: () => void;
}) {
  const t = COPY.ofensiva.meta;
  if (meta) {
    return (
      <section className="space-y-2" data-testid="meta-ofensiva" aria-label={t.titulo}>
        <p className="flex items-center gap-2 font-bold">
          <Target size={16} className="text-mar" aria-hidden /> {t.ativa(meta.alvo)}
        </p>
        <ProgressBar value={meta.feitos} max={meta.alvo} tone="recompensa" size="sm" label={t.titulo} />
        <p className="text-xs text-nevoa">{t.progresso(meta.feitos, meta.alvo, PEROLAS_DA_META[meta.alvo as MetaDeOfensiva] ?? 0)}</p>
        <button type="button" className="btn-ghost w-full text-[13px]" onClick={onDesistir} disabled={ocupado}>
          {t.trocar}
        </button>
      </section>
    );
  }
  return (
    <section className="space-y-2" data-testid="meta-ofensiva" aria-label={t.titulo}>
      <p className="flex items-center gap-2 font-bold">
        <Target size={16} className="text-mar" aria-hidden /> {t.escolha}
      </p>
      <p className="text-xs text-nevoa">{t.explica}</p>
      <div className="grid grid-cols-2 gap-2">
        {METAS_DE_OFENSIVA.map((alvo) => (
          <button
            key={alvo}
            type="button"
            className="chip tap-area flex-col items-start gap-0.5 py-2 text-left"
            onClick={() => onEscolher(alvo)}
            disabled={ocupado}
            data-testid={`meta-${alvo}`}
          >
            <span className="font-bold">{t.opcao(alvo)}</span>
            <span className="text-[11px] text-nevoa">{t.recompensa(PEROLAS_DA_META[alvo])}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

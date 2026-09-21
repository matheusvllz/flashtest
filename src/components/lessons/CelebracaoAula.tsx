import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, Star, Target, Timer } from "lucide-react";
import { FocaMark, type FocaExpression } from "@/components/brand/FocaMark";
import { StatTile } from "@/components/ds/StatTile";
import { XpChip } from "@/components/ds/XpChip";
import { fala } from "@/lib/voz";
import { playRecompensa, type Evento } from "@/lib/sfx";
import { vibrar } from "@/lib/haptics";

export type CelebracaoAcao = { label: string; to?: string; onClick?: () => void };

function formatClock(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Tela de fechamento única para os dois pilares — aula de 60s e lição de
 * redação (docs/18-plano-reestilizacao-rabisco.md §9, §13.6/§13.8). Substitui
 * `LessonDone` (study.tsx) e o bloco de resultado do `LessonPlayer`.
 *
 * O CTA primário é sempre a SAÍDA (docs/16-gamificacao-e-dopamina.md §2: "a
 * saída tem que ser limpa") — nunca "mais uma", que reintroduziria a rolagem
 * infinita que o produto existe para recusar.
 */
export function CelebracaoAula({
  acertos,
  total,
  segundos,
  xpGanho,
  estrelas,
  streakAtual,
  streakMudou,
  metaFechada,
  nivelSubiu,
  nivelAtual,
  notas,
  primario,
  secundario,
}: {
  acertos: number;
  total: number;
  /** Tempo gasto, em segundos — só a aula de 60s tem cronômetro. */
  segundos?: number;
  xpGanho: number;
  /** Presente só na lição de redação — quando vem, substitui os tiles de acertos/tempo. */
  estrelas?: 1 | 2 | 3;
  streakAtual: number;
  streakMudou: boolean;
  metaFechada?: boolean;
  nivelSubiu?: boolean;
  nivelAtual?: number;
  /** "Anota pra melhorar" — o que o aluno errou (só a lição de redação usa). */
  notas?: string[];
  primario: CelebracaoAcao;
  secundario?: CelebracaoAcao;
}) {
  const pct = total > 0 ? Math.round((acertos / total) * 100) : 0;
  const marco = streakAtual > 0 && [7, 30, 100].includes(streakAtual);
  const bom = pct >= 70;
  const expression: FocaExpression =
    pct === 100 || marco ? "empolgada" : bom ? "orgulhosa" : "neutra";
  const titulo = fala(bom ? "fimbom" : "fimruim");

  // Um só som por resposta/fechamento, o mais alto da hierarquia (16 §3, regra 5).
  useEffect(() => {
    const eventos: Evento[] = ["fim"];
    if (nivelSubiu || marco) eventos.push("marco");
    else if (streakMudou || metaFechada) eventos.push("streak");
    playRecompensa(eventos);
    vibrar(nivelSubiu || marco ? "marco" : "fim");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Acao({ label, to, onClick, className }: CelebracaoAcao & { className: string }) {
    if (to) {
      return (
        <Link to={to} className={className}>
          {label}
        </Link>
      );
    }
    return (
      <button onClick={onClick} className={className}>
        {label}
      </button>
    );
  }

  return (
    <div className="surface-pauta flex min-h-screen flex-col items-center gap-5 bg-neve px-6 py-10 text-center">
      <FocaMark size={120} decorative expression={expression} motion="float" />

      {estrelas !== undefined && (
        <div className="flex gap-2" aria-label={`${estrelas} de 3 estrelas`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              size={40}
              className={
                n <= estrelas ? "anim-pop-in fill-recompensa text-recompensa" : "text-gelo"
              }
              style={n <= estrelas ? { animationDelay: `${n * 130}ms` } : undefined}
            />
          ))}
        </div>
      )}

      <div>
        <h2 className="font-display text-2xl font-bold text-abismo">{titulo}</h2>
        <p className="mt-1 text-sm text-nevoa">
          Você acertou {acertos} de {total}
          {segundos !== undefined ? ` em ${formatClock(segundos)}` : ""}.
        </p>
      </div>

      {estrelas === undefined && (
        <div className="grid w-full grid-cols-3 gap-2.5">
          <StatTile
            icon={<Target size={18} />}
            label="Acertos"
            value={`${pct}%`}
            className="anim-pop-in"
          />
          <StatTile
            icon={<Timer size={18} />}
            label="Tempo"
            value={segundos !== undefined ? formatClock(segundos) : "—"}
            className="anim-pop-in"
            style={{ animationDelay: "130ms" }}
          />
          <div className="card-soft flex flex-col items-center justify-center gap-1.5 p-3">
            <XpChip amount={xpGanho} />
          </div>
        </div>
      )}

      {estrelas !== undefined && xpGanho > 0 && <XpChip amount={xpGanho} />}

      {(streakMudou || nivelSubiu) && (
        <div className="flex items-center gap-4">
          {streakMudou && (
            <span className="anim-bump flex items-center gap-1.5 font-mono text-sm font-bold text-abismo">
              <Flame size={16} className="text-mar-fundo" /> {streakAtual} dias seguidos
            </span>
          )}
          {nivelSubiu && (
            <span className="mark-texto font-display text-sm font-bold">Nível {nivelAtual}</span>
          )}
        </div>
      )}

      {notas && notas.length > 0 && (
        <div className="w-full rounded-lg border-2 border-gelo bg-cards p-4 text-left">
          <p className="ds-label">Anota pra melhorar</p>
          <ul className="mt-2 space-y-2">
            {notas.slice(0, 3).map((nota) => (
              <li key={nota} className="text-[13px] leading-snug text-abismo">
                {nota}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2 w-full space-y-2">
        <Acao {...primario} className="btn-primary w-full" />
        {secundario && <Acao {...secundario} className="btn-ghost w-full" />}
      </div>
    </div>
  );
}

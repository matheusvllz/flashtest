/** Estado que o indicador de sequência mostra (spec 48 T-48.6.1, D48-14) — puro, testável sem React. */
import { CONGELAMENTOS_MAXIMO, diasEntre } from "@/lib/recompensas";
import { atividadeHoje, hojeISO, type AppState } from "@/lib/store";

export function estadoDaSequencia(s: AppState, hoje = hojeISO()) {
  const estudouHoje = s.progress.activityDays.includes(hoje) || atividadeHoje(s).completedBlockIds.length > 0;
  const protecaoRecente = s.progress.diaProtegido && diasEntre(s.progress.diaProtegido, hoje) <= 7 ? s.progress.diaProtegido : null;
  const voltando = s.progress.streak <= 1 && s.progress.bestStreak > 1;
  const conta = s.account?.userId ? (s.account.outbox.length > 0 ? "atualizando" : s.progress.sequenciaConfirmadaEm ? "confirmada" : "atualizando") : "aparelho";
  return {
    dias: s.progress.streak,
    recorde: s.progress.bestStreak,
    // Teto do plano (spec 49 D49-05): Free 2, Basic 4, Pro 7; o estoque acima dele (de um plano anterior) aparece.
    protecoesMax: s.account?.protetoresMax ?? CONGELAMENTOS_MAXIMO,
    protecoes: Math.max(0, s.progress.streakFreezes),
    estudouHoje,
    protecaoRecente,
    voltando,
    conta: conta as "confirmada" | "atualizando" | "aparelho",
  };
}

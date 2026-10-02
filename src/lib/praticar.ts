/** Praticar (spec 50 §5.7.2) — regras puras do hub. */
import type { AppState } from "@/lib/store";

const DIAS_ERROS = 7;
const MAXIMO_ERROS = 10;

/** Ids das questões erradas (ou "Não sei") de primeira nos últimos 7 dias, as mais recentes primeiro, sem repetir. */
export function errosRecentes(s: Pick<AppState, "learning">, hoje: string): string[] {
  const limite = new Date(`${hoje}T12:00:00Z`);
  limite.setUTCDate(limite.getUTCDate() - DIAS_ERROS);
  const desde = limite.toISOString().slice(0, 10);
  const vistos = new Set<string>();
  const ids: string[] = [];
  for (const a of [...s.learning.recentAttempts].reverse()) {
    if (a.localDate < desde || a.correct || !a.firstSubmission) continue;
    if (vistos.has(a.exerciseId)) continue;
    vistos.add(a.exerciseId);
    ids.push(a.exerciseId);
    if (ids.length >= MAXIMO_ERROS) break;
  }
  return ids;
}

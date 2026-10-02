/**
 * Conquistas (spec 50 §5.4.3) — catálogo e critérios, puros. Permanentes, decididas no servidor, nunca por tempo de
 * uso. As que ainda não vieram aparecem com o critério escrito (sem mistério). Pérolas por conquista: 20–100.
 */

export interface Estatisticas {
  licoes: number;
  melhorOfensiva: number;
  perfeitas: number;
  maiorCombo: number;
  simulados: number;
  simulados90: number;
  escritas: number;
  estimativas: number;
  /** Áreas (LC, CH, CN, MT) praticadas na semana atual. */
  areasNaSemana: number;
  cadernoResolvidos: number;
  nivel: number;
}

export interface Conquista {
  id: string;
  perolas: number;
  /** Atingida? */
  ok: (e: Estatisticas) => boolean;
}

const c = (id: string, perolas: number, ok: (e: Estatisticas) => boolean): Conquista => ({ id, perolas, ok });

export const CONQUISTAS: readonly Conquista[] = [
  c("primeira-licao", 20, (e) => e.licoes >= 1),
  c("licoes-10", 30, (e) => e.licoes >= 10),
  c("licoes-50", 50, (e) => e.licoes >= 50),
  c("licoes-200", 100, (e) => e.licoes >= 200),
  c("ofensiva-7", 30, (e) => e.melhorOfensiva >= 7),
  c("ofensiva-30", 50, (e) => e.melhorOfensiva >= 30),
  c("ofensiva-100", 100, (e) => e.melhorOfensiva >= 100),
  c("ofensiva-365", 100, (e) => e.melhorOfensiva >= 365),
  c("perfeitas-5", 30, (e) => e.perfeitas >= 5),
  c("perfeitas-25", 60, (e) => e.perfeitas >= 25),
  c("combo-10", 40, (e) => e.maiorCombo >= 10),
  c("primeiro-simulado", 40, (e) => e.simulados >= 1),
  c("simulado-90", 60, (e) => e.simulados90 >= 1),
  c("escritas-10", 50, (e) => e.escritas >= 10),
  c("primeira-estimativa", 30, (e) => e.estimativas >= 1),
  c("quatro-areas", 40, (e) => e.areasNaSemana >= 4),
  c("caderno-20", 40, (e) => e.cadernoResolvidos >= 20),
  c("nivel-5", 40, (e) => e.nivel >= 5),
  c("nivel-10", 80, (e) => e.nivel >= 10),
];

export function conquistaDe(id: string): Conquista | null {
  return CONQUISTAS.find((x) => x.id === id) ?? null;
}

/** Conquistas atingidas que o aluno ainda não tem. */
export function novasConquistas(e: Estatisticas, jaTem: ReadonlySet<string>): Conquista[] {
  return CONQUISTAS.filter((x) => !jaTem.has(x.id) && x.ok(e));
}

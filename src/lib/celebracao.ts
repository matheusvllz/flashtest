/**
 * Celebração de uma conclusão (spec 50 §5.12.3): com vários acontecimentos juntos, UM momento principal dentro da
 * própria tela de fim (nunca uma fila de telas), os outros como selos, e só o som do principal (C-SOM-2).
 * Puro: quem chama diz o que aconteceu; esta função só ordena.
 */
import type { SoundEvent } from "@/lib/audio/identity";

export type Momento =
  | "especial"
  | "marco"
  | "nivel"
  | "conquista"
  | "meta-ofensiva"
  | "perfeita"
  | "capitulo"
  | "meta-dia"
  | "missoes"
  | "ofensiva-acesa"
  | "licao";

/** Ordem de prioridade (a primeira vence). Grupos de mesmo som ficam juntos. */
export const ORDEM_DOS_MOMENTOS: readonly Momento[] = [
  "especial",
  "marco",
  "nivel",
  "conquista",
  "meta-ofensiva",
  "perfeita",
  "capitulo",
  "meta-dia",
  "missoes",
  "ofensiva-acesa",
  "licao",
];

/** Só os 12 sons aprovados (C-SOM-5); nenhum arquivo novo. */
export const SOM_DO_MOMENTO: Record<Momento, SoundEvent> = {
  especial: "recompensa-especial",
  marco: "marco-streak",
  nivel: "level-up",
  conquista: "conquista",
  "meta-ofensiva": "conquista",
  perfeita: "conquista",
  capitulo: "capitulo-desbloqueado",
  "meta-dia": "meta-diaria",
  missoes: "meta-diaria",
  "ofensiva-acesa": "streak-diario",
  licao: "conclusao-licao",
};

export interface Celebracao {
  principal: Momento;
  /** Os demais acontecimentos, na ordem de prioridade, sem repetir o principal. */
  selos: Momento[];
  som: SoundEvent;
}

export function escolherCelebracao(acontecimentos: readonly Momento[]): Celebracao {
  const presentes = new Set<Momento>([...acontecimentos, "licao"]);
  const ordenados = ORDEM_DOS_MOMENTOS.filter((m) => presentes.has(m));
  const principal = ordenados[0] ?? "licao";
  return {
    principal,
    selos: ordenados.slice(1).filter((m) => m !== "licao"),
    som: SOM_DO_MOMENTO[principal],
  };
}

/** Marco de ofensiva grande (≥ 100 dias) é o momento "especial". */
export function momentoDoMarco(dias: number): Momento {
  return dias >= 100 ? "especial" : "marco";
}

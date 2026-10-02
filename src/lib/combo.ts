/**
 * Combo de acertos (spec 50 §5.1.1, D50-10) — regra pura, usada igual pelo aparelho (para mostrar na hora) e pelo
 * servidor (que decide as recompensas do combo).
 *
 * - Conta só resposta CERTA de primeira tentativa, pontuada e sem a Foca IA aberta antes de responder.
 * - Erro e "Não sei" zeram, em silêncio (nenhum texto de perda).
 * - Continua entre lições e atividades do mesmo dia local, se a próxima resposta pontuada vier em até 30 min.
 * - Marcos 3, 5 e 10; depois de 10, cada múltiplo de 10 repete o marco 10.
 * - Revisão de erros, checagem, nivelamento, simulado e flashcards não contam nem zeram (`conta: false`).
 */

export const COMBO_JANELA_MS = 30 * 60_000;
export const VIDAS_DE_COMBO_POR_DIA = 2;
export type MarcoDoCombo = 3 | 5 | 10;

export interface EstadoCombo {
  /** Dia local (`AAAA-MM-DD`) a que o combo pertence. */
  dia: string;
  atual: number;
  /** Maior combo do dia. */
  maximo: number;
  /** Instante (ms) da última resposta que contou, ou `null`. */
  ultimaEm: number | null;
}

export type ResultadoDaResposta = "certa" | "errada" | "nao-sei";

export interface RespostaParaCombo {
  resultado: ResultadoDaResposta;
  dia: string;
  /** Instante da resposta (ms). */
  em: number;
  /** `false` para o que não conta nem zera (revisão de erros, checagem, nivelamento, simulado, flashcard). */
  conta: boolean;
  /** Foca IA aberta antes de responder: a resposta certa não soma (não é independente), mas também não zera. */
  assistida?: boolean;
}

export function comboVazio(dia: string): EstadoCombo {
  return { dia, atual: 0, maximo: 0, ultimaEm: null };
}

/** Estado válido para o momento `em` do dia `dia`: outro dia ou intervalo maior que a janela recomeça. */
export function comboVigente(estado: EstadoCombo | null | undefined, dia: string, em: number): EstadoCombo {
  if (!estado || estado.dia !== dia) return comboVazio(dia);
  if (estado.ultimaEm !== null && em - estado.ultimaEm > COMBO_JANELA_MS) return { ...estado, atual: 0 };
  return estado;
}

export function marcoDoCombo(n: number): MarcoDoCombo | null {
  if (n === 3 || n === 5) return n;
  if (n >= 10 && n % 10 === 0) return 10;
  return null;
}

/** O combo devolve uma vida em cada múltiplo de 5 (5, 10, 15…), até o teto diário do servidor. */
export function comboDevolveVida(n: number): boolean {
  return n > 0 && n % 5 === 0;
}

export interface ResultadoDoCombo {
  estado: EstadoCombo;
  /** Marco atingido NESTA resposta, ou `null`. */
  marco: MarcoDoCombo | null;
  /** Esta resposta chegou a um múltiplo de 5 (candidata a vida de volta). */
  vida: boolean;
}

export function aplicarAoCombo(estado: EstadoCombo | null | undefined, r: RespostaParaCombo): ResultadoDoCombo {
  if (!r.conta) {
    const base = estado && estado.dia === r.dia ? estado : comboVazio(r.dia);
    return { estado: base, marco: null, vida: false };
  }
  const base = comboVigente(estado, r.dia, r.em);
  if (r.resultado === "certa" && r.assistida) {
    // Ajuda antes de responder: a sequência fica parada (não é punição, só não conta como acerto independente).
    return { estado: { ...base, ultimaEm: r.em }, marco: null, vida: false };
  }
  if (r.resultado !== "certa") {
    return { estado: { ...base, atual: 0, ultimaEm: r.em }, marco: null, vida: false };
  }
  const atual = base.atual + 1;
  return {
    estado: { dia: r.dia, atual, maximo: Math.max(base.maximo, atual), ultimaEm: r.em },
    marco: marcoDoCombo(atual),
    vida: comboDevolveVida(atual),
  };
}

/** Bônus de XP na conclusão pelo maior combo da tentativa (§5.1.3): fixo, sem multiplicador. */
export const XP_BONUS_COMBO_5 = 5;
export const XP_BONUS_COMBO_10 = 10;
export const XP_BONUS_COMBO_TETO_DIA = 20;

export function xpBonusDoCombo(maiorDaTentativa: number): number {
  if (maiorDaTentativa >= 10) return XP_BONUS_COMBO_10;
  if (maiorDaTentativa >= 5) return XP_BONUS_COMBO_5;
  return 0;
}

/**
 * Vidas do Free (spec 49 D49-03, §5.3) — regra pura, a mesma no app e no servidor.
 * - 5 por dia, renovadas à meia-noite do fuso do aluno; +1 por anúncio recompensado, uma vez por dia.
 * - Custa 1 vida: resposta ERRADA em questão de lição, prática da trilha e /study. "Não sei" não custa.
 * - Não custam: nivelamento, checagem, redação, flashcards (fontes fora de `FONTES_QUE_CUSTAM_VIDA`).
 */
import { VIDAS_POR_ANUNCIO_DIA, VIDAS_POR_DIA } from "./planos";

export const FONTES_QUE_CUSTAM_VIDA: ReadonlySet<string> = new Set(["questao-geral", "atividade", "licao"]);

export function custaVida(fonte: string, correta: boolean, naoSei: boolean): boolean {
  return !correta && !naoSei && FONTES_QUE_CUSTAM_VIDA.has(fonte);
}

export function saldoDeVidas(perdidas: number, ganhasAnuncio: number): number {
  return Math.max(0, VIDAS_POR_DIA + Math.min(ganhasAnuncio, VIDAS_POR_ANUNCIO_DIA) - perdidas);
}

/** Vidas como o servidor as informa ao app. `null` no agregado = sem vidas para este aluno (plano pago ou desligado). */
export interface VidasDoDia {
  dia: string;
  restantes: number;
  anuncioUsado: boolean;
}

/** Saldo que o app mostra hoje: dia novo renova (sem esperar o servidor). */
export function vidasDeHoje(v: VidasDoDia | null | undefined, hoje: string): number | null {
  if (!v) return null;
  return v.dia === hoje ? v.restantes : VIDAS_POR_DIA;
}

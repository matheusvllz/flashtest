/**
 * Ranking semanal só para maiores de 18 (spec 49 D49-06, §5.6) — regras puras, testáveis sem banco.
 *
 * - Maioridade pelo ano de nascimento do cadastro (travado: só o servidor/suporte muda). Quem faz 18 no ano corrente
 *   confirma dia e mês na entrada; nada disso é guardado além de `maior_desde`.
 * - Pontos: dias com estudo × 100 + blocos concluídos × 10, no máximo 5 blocos por dia. Nunca tempo de uso
 *   (Decreto 12.880/2026 art. 9º) e nunca XP bruto.
 * - Apelido: 3 a 20 caracteres, sem e-mail, telefone, link nem termo ofensivo da lista.
 */

export const MAX_POR_GRUPO = 30;
export const BLOCOS_CONTADOS_POR_DIA = 5;

/** Idade pelo ano e, se for o ano limítrofe, pela data informada. `null` = precisa de dia e mês. */
export function elegibilidade(
  anoNascimento: number | null,
  agora: Date,
  nascimento?: { dia: number; mes: number },
): "maior" | "menor" | "confirmar" {
  if (!anoNascimento) return "menor";
  // Data de hoje em São Paulo (o aniversário vira à meia-noite local, não à meia-noite UTC).
  const [ano, mesHoje, diaHoje] = diaEmSaoPaulo(agora);
  const idadeMinima = ano - anoNascimento - 1;
  const idadeMaxima = ano - anoNascimento;
  if (idadeMinima >= 18) return "maior";
  if (idadeMaxima < 18) return "menor";
  // Faz 18 neste ano: decide pelo dia e mês informados.
  if (!nascimento) return "confirmar";
  const { dia, mes } = nascimento;
  if (!Number.isInteger(dia) || !Number.isInteger(mes) || mes < 1 || mes > 12 || dia < 1 || dia > 31) return "confirmar";
  const aniversario = Date.UTC(ano, mes - 1, dia);
  const hoje = Date.UTC(ano, mesHoje - 1, diaHoje);
  return hoje >= aniversario ? "maior" : "menor";
}

/** [ano, mês (1–12), dia] de `agora` no fuso de São Paulo. */
export function diaEmSaoPaulo(agora: Date): [number, number, number] {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
  const [a, m, d] = s.split("-").map(Number);
  return [a, m, d];
}

export function pontosDaSemana(dias: readonly { blocos: number }[]): number {
  return dias.reduce((acc, d) => acc + (d.blocos > 0 ? 100 + Math.min(d.blocos, BLOCOS_CONTADOS_POR_DIA) * 10 : 0), 0);
}

/** Segunda-feira (AAAA-MM-DD) da semana do dia informado. */
export function semanaDe(dia: string): string {
  const d = new Date(`${dia}T12:00:00Z`);
  const desde = (d.getUTCDay() + 6) % 7; // segunda = 0
  return new Date(d.getTime() - desde * 86_400_000).toISOString().slice(0, 10);
}

export function diasDaSemana(segunda: string): string[] {
  const base = new Date(`${segunda}T12:00:00Z`).getTime();
  return Array.from({ length: 7 }, (_, i) => new Date(base + i * 86_400_000).toISOString().slice(0, 10));
}

/** Termos longos: recusados mesmo dentro de outra palavra ("xcaralhox"). */
const PROIBIDOS = [
  "porra", "caralho", "buceta", "merda", "foder", "cuzao", "cuzão", "piroca", "xoxota", "vagabunda", "arrombado",
  "arrombada", "otario", "otário", "babaca", "idiota", "imbecil", "retardado", "macaco", "nazista", "hitler", "estupro",
  "estuprador", "pedofilo", "pedófilo", "pornografia",
];
/** Termos curtos: só como palavra inteira (com números colados), senão "computador" e "pintor" seriam recusados. */
const PROIBIDOS_PALAVRA = ["puta", "puto", "fode", "viado", "bicha", "pinto", "rola", "corno", "sexo", "porn", "porno"];
/** Rótulos que o próprio ranking usa: ninguém pode se chamar assim. */
export const APELIDOS_RESERVADOS = ["apelido em revisao", "voce"];

export function semAcento(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export type ProblemaDoApelido = "tamanho" | "caracteres" | "contato" | "ofensivo";

export function validarApelido(bruto: string): { ok: true; apelido: string } | { ok: false; problema: ProblemaDoApelido } {
  const apelido = bruto.trim().replace(/\s+/g, " ");
  if (apelido.length < 3 || apelido.length > 20) return { ok: false, problema: "tamanho" };
  if (!/^[\p{L}\p{N}_. -]+$/u.test(apelido)) return { ok: false, problema: "caracteres" };
  const plano = semAcento(apelido).replace(/[\s_.-]/g, "");
  if (/\d{6,}/.test(plano) || /(www|http|\.com|arroba|gmail|hotmail|insta|whats|zap)/.test(plano)) return { ok: false, problema: "contato" };
  if (PROIBIDOS.some((p) => plano.includes(semAcento(p)))) return { ok: false, problema: "ofensivo" };
  const palavras = semAcento(apelido).split(/[\s_.-]+/).map((w) => w.replace(/\d+/g, ""));
  if (palavras.some((w) => PROIBIDOS_PALAVRA.includes(w))) return { ok: false, problema: "ofensivo" };
  return { ok: true, apelido };
}

/**
 * Ofensiva com amigos (spec 50 §5.6; só 18+) — regras puras.
 *
 * Um dia conta para a dupla quando os DOIS concluíram ao menos um bloco no próprio dia local; dia coberto por protetor
 * de um lado conta para aquele lado. Falhou um dia: volta a 0 em silêncio; o recorde fica. Sem Pérolas por dupla.
 */

export const MAX_DUPLAS_ATIVAS = 5;
export const MAX_CONVITES_ABERTOS = 10;
export const MAX_CONVITES_POR_DIA = 10;
export const VALIDADE_DO_CONVITE_MS = 72 * 3_600_000;
/** 128 bits em base64url = 22 caracteres. */
export const CODIGO_DO_CONVITE = /^[A-Za-z0-9_-]{22}$/;

export const MOTIVOS_DE_DENUNCIA = ["apelido", "menor", "outro"] as const;
export type MotivoDeDenuncia = (typeof MOTIVOS_DE_DENUNCIA)[number];

function somaDias(dia: string, n: number): string {
  return new Date(Date.parse(`${dia}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Dias que contam para um lado: os estudados, os cobertos por protetor e, se a ofensiva dele ainda está viva, os dias
 * parados desde o último estudo até ontem (o protetor só é "gasto" quando ele voltar a estudar).
 */
export function diasCobertos(
  estudados: Iterable<string>,
  protegidos: Iterable<string>,
  pendentes: Iterable<string> = [],
): Set<string> {
  return new Set([...estudados, ...protegidos, ...pendentes]);
}

export interface OfensivaDaDupla {
  dias: number;
  recorde: number;
}

/**
 * Sequência da dupla de `desde` (dia em que a dupla começou) até `hoje`. Hoje ainda em aberto: se os dois já
 * estudaram, entra na conta; se não, a sequência até ontem continua de pé.
 */
export function ofensivaDaDupla(
  a: ReadonlySet<string>,
  b: ReadonlySet<string>,
  desde: string,
  hoje: string,
): OfensivaDaDupla {
  let atual = 0;
  let recorde = 0;
  if (desde > hoje) return { dias: 0, recorde: 0 };
  for (let d = desde; d <= hoje; d = somaDias(d, 1)) {
    const juntos = a.has(d) && b.has(d);
    if (juntos) {
      atual++;
      recorde = Math.max(recorde, atual);
    } else if (d !== hoje) atual = 0;
  }
  return { dias: atual, recorde };
}

/** Dias parados entre o último estudo e ontem, quando a ofensiva ainda está viva (protetores cobrem). */
export function diasPendentesDeProtetor(
  ultimoDia: string | null,
  hoje: string,
  protetores: number,
): string[] {
  if (!ultimoDia) return [];
  const parados: string[] = [];
  for (let d = somaDias(ultimoDia, 1); d < hoje; d = somaDias(d, 1)) parados.push(d);
  return parados.length <= protetores ? parados : [];
}

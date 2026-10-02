/**
 * Ofensiva — leituras puras para a meta, os marcos e o calendário (spec 50 §5.2). A regra da sequência continua uma
 * só (`avancarSequencia`, R-GAM-3); aqui só se reconstrói o histórico para saber quais dias foram cobertos por
 * protetor e em que dia a sequência atual começou.
 */
import {
  avancarSequencia,
  CONGELAMENTOS_MAXIMO,
  SEQUENCIA_INICIAL,
  type CreditoDeProtetor,
  type EstadoSequencia,
} from "@/lib/recompensas";

function somaDias(dia: string, n: number): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function diasEntreDatas(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

export interface HistoricoDaOfensiva {
  estado: EstadoSequencia;
  /** Dia em que a sequência atual começou (o primeiro dia estudado dela), ou `null` sem estudo. */
  inicio: string | null;
  /** Dias parados cobertos por protetor, em ordem. */
  protegidos: string[];
}

export function historicoDaOfensiva(
  dias: Iterable<string>,
  opcoes: { creditos?: readonly CreditoDeProtetor[]; estoqueMax?: number } = {},
): HistoricoDaOfensiva {
  const estoqueMax = opcoes.estoqueMax ?? CONGELAMENTOS_MAXIMO;
  const creditos = [...(opcoes.creditos ?? [])].sort((a, b) => (a.dia < b.dia ? -1 : a.dia > b.dia ? 1 : 0));
  let i = 0;
  let e: EstadoSequencia = SEQUENCIA_INICIAL;
  let inicio: string | null = null;
  const protegidos: string[] = [];
  const aplicar = (c: CreditoDeProtetor) => {
    e = {
      ...e,
      congelamentos:
        c.quantidade < 0
          ? Math.max(0, e.congelamentos + c.quantidade)
          : Math.max(e.congelamentos, Math.min(estoqueMax, e.congelamentos + c.quantidade)),
    };
  };
  for (const dia of [...new Set(dias)].sort()) {
    while (i < creditos.length && creditos[i].dia <= dia) aplicar(creditos[i++]);
    const antes = e;
    e = avancarSequencia(e, dia, estoqueMax);
    if (e === antes) continue;
    if (e.sequencia === 1) inicio = dia;
    else if (antes.ultimoDia && e.sequencia === antes.sequencia + 1) {
      const intervalo = diasEntreDatas(antes.ultimoDia, dia);
      for (let k = 1; k < intervalo; k++) protegidos.push(somaDias(antes.ultimoDia, k));
    }
  }
  for (; i < creditos.length; i++) aplicar(creditos[i]);
  return { estado: e, inicio, protegidos };
}

/** A sequência ainda pode continuar hoje (estudou hoje, ontem, ou os protetores cobrem os dias parados até ontem)? */
export function ofensivaViva(estado: EstadoSequencia, hoje: string): boolean {
  if (!estado.ultimoDia) return false;
  const parados = diasEntreDatas(estado.ultimoDia, hoje) - 1;
  return parados <= 0 || parados <= estado.congelamentos;
}

/* ------------------------------------------------------------- meta (§5.2.2) --- */

export interface MetaDaOfensiva {
  alvo: number;
  /** Sequência que já existia quando a meta foi escolhida (sem contar hoje). */
  sequenciaInicial: number;
  /** Início da sequência a que a meta está ligada; `null` = a meta começou sem sequência viva. */
  inicioSequencia: string | null;
  /** Dia local em que a meta foi escolhida. */
  inicio: string;
}

export type SituacaoDaMeta =
  | { tipo: "andando"; feitos: number; alvo: number; inicioSequencia: string | null }
  | { tipo: "cumprida"; alvo: number; inicioSequencia: string }
  | { tipo: "quebrou" };

/** Ponto de partida de uma meta escolhida agora (o dia de hoje conta se já houve estudo hoje). */
export function partidaDaMeta(h: HistoricoDaOfensiva, hoje: string, alvo: number): MetaDaOfensiva {
  if (!ofensivaViva(h.estado, hoje) || !h.inicio) return { alvo, sequenciaInicial: 0, inicioSequencia: null, inicio: hoje };
  const estudouHoje = h.estado.ultimoDia === hoje;
  return {
    alvo,
    sequenciaInicial: Math.max(0, h.estado.sequencia - (estudouHoje ? 1 : 0)),
    inicioSequencia: h.inicio,
    inicio: hoje,
  };
}

export function situacaoDaMeta(meta: MetaDaOfensiva, h: HistoricoDaOfensiva, hoje: string): SituacaoDaMeta {
  let ligada = meta.inicioSequencia;
  if (!ligada) {
    // A meta começou sem sequência: liga-se à primeira sequência que começar a partir do dia da meta.
    if (h.inicio && h.inicio >= meta.inicio) ligada = h.inicio;
    else return { tipo: "andando", feitos: 0, alvo: meta.alvo, inicioSequencia: null };
  }
  if (h.inicio !== ligada || !ofensivaViva(h.estado, hoje)) return { tipo: "quebrou" };
  const feitos = Math.max(0, h.estado.sequencia - meta.sequenciaInicial);
  if (feitos >= meta.alvo) return { tipo: "cumprida", alvo: meta.alvo, inicioSequencia: ligada };
  return { tipo: "andando", feitos, alvo: meta.alvo, inicioSequencia: ligada };
}

/** Dias do mês (`AAAA-MM`) para o calendário: estudados e protegidos. */
export function diasDoMes(mes: string, estudados: Iterable<string>, protegidos: Iterable<string>) {
  const est = new Set([...estudados].filter((d) => d.startsWith(mes)));
  const prot = new Set([...protegidos].filter((d) => d.startsWith(mes)));
  return { estudados: [...est].sort(), protegidos: [...prot].sort() };
}

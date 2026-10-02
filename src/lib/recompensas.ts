/**
 * Regras de recompensa — fonte única para o app (`store.ts`) e o servidor (`src/server/estudo/`).
 * docs/specs/46-producao T-06.2; contratos em docs/arquitetura/contratos.md (C-XP-*).
 *
 * Nada aqui toca estado, relógio ou rede: são funções puras, testadas nos dois lados.
 */

/** XP de lição por faixa de estrelas (25 §6.2; 20 §12). */
export const XP_POR_ESTRELAS: Record<1 | 2 | 3, number> = { 1: 10, 2: 20, 3: 30 };
/** Teto vitalício por questão do banco geral: errada 5, certa até 15 (20 §12, Fase 11). */
export const XP_TETO_QUESTAO_GERAL = 15;
export const XP_QUESTAO_ERRADA = 5;
/** Bônus único de entrada (dia 1 real, não conquista falsa). */
export const XP_BONUS_ENTRADA = 50;
/** Congelamentos: começa com 1, ganha 1 a cada 7 dias com atividade, no máximo 2 (41 V-4). */
export const CONGELAMENTOS_INICIAIS = 1;
export const CONGELAMENTOS_MAXIMO = 2;
export const DIAS_POR_CONGELAMENTO = 7;

export function estrelasPorPct(pct: number): 1 | 2 | 3 {
  if (pct >= 90) return 3;
  if (pct >= 70) return 2;
  return 1;
}

export function pctDe(acertos: number, total: number): number {
  return total > 0 ? Math.round((acertos / total) * 100) : 0;
}

export type TipoAtividade = "pratica" | "revisao" | "desafio" | "checkpoint" | "aula" | "legado" | "reforco" | string;

/** XP-alvo de uma atividade da trilha (30 §14.4): revisão 5, checagem 20, o resto pela faixa. */
export function xpAlvoDaAtividade(tipo: TipoAtividade, acertos: number, total: number): number {
  if (tipo === "revisao") return 5;
  if (tipo === "checkpoint") return 20;
  return XP_POR_ESTRELAS[estrelasPorPct(pctDe(acertos, total))];
}

/** XP-alvo de uma resposta do banco geral (o teto por questão é aplicado pelo livro de XP). */
export function xpAlvoDaQuestaoGeral(correta: boolean): number {
  return correta ? XP_TETO_QUESTAO_GERAL : XP_QUESTAO_ERRADA;
}

/**
 * Livro de XP com teto por chave: paga só a diferença até o alvo. Repetir o mesmo evento, ou um
 * evento pior depois de um melhor, não paga nada.
 */
export function xpAPagar(jaPago: number, alvo: number): number {
  return Math.max(0, alvo - jaPago);
}

// ------------------------------------------------------------------ sequência (streak)

export interface EstadoSequencia {
  sequencia: number;
  melhorSequencia: number;
  congelamentos: number;
  diasDesdeUltimoCongelamento: number;
  /** Último dia com atividade, `AAAA-MM-DD`, ou `null` se nunca houve. */
  ultimoDia: string | null;
  /** Último dia parado que uma proteção cobriu (spec 48 D48-14). Ausente se nenhuma foi usada. */
  diaProtegido?: string;
}

/** Dia anterior a `dia` (`AAAA-MM-DD`, calendário). */
export function diaAnterior(dia: string): string {
  const d = new Date(Date.UTC(+dia.slice(0, 4), +dia.slice(5, 7) - 1, +dia.slice(8, 10)) - 86_400_000);
  return d.toISOString().slice(0, 10);
}

export const SEQUENCIA_INICIAL: EstadoSequencia = {
  sequencia: 0,
  melhorSequencia: 0,
  congelamentos: CONGELAMENTOS_INICIAIS,
  diasDesdeUltimoCongelamento: 0,
  ultimoDia: null,
};

/** Dias corridos entre duas datas `AAAA-MM-DD` (calendário, sem fuso). */
export function diasEntre(de: string, ate: string): number {
  const a = Date.UTC(+de.slice(0, 4), +de.slice(5, 7) - 1, +de.slice(8, 10));
  const b = Date.UTC(+ate.slice(0, 4), +ate.slice(5, 7) - 1, +ate.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/**
 * Registra atividade no dia `dia` (`AAAA-MM-DD`). Mesma regra de `registrarAtividade` do store:
 * primeiro o prêmio de congelamento pelo dia novo; depois a sequência — ontem soma 1; dias perdidos com
 * congelamentos suficientes (um por dia parado, R-GAM-3; spec 49 D49-05) gastam os congelamentos e somam 1; sem
 * congelamentos suficientes, recomeça em 1. O mesmo dia repetido não muda nada. Dias fora de ordem são ignorados.
 * `estoqueMax`: teto do plano (Free 2, Basic 4, Pro 7); o ganho a cada 7 dias não passa dele.
 */
export function avancarSequencia(e: EstadoSequencia, dia: string, estoqueMax: number = CONGELAMENTOS_MAXIMO): EstadoSequencia {
  if (e.ultimoDia !== null && diasEntre(e.ultimoDia, dia) <= 0) return e;
  let { congelamentos, diasDesdeUltimoCongelamento, sequencia } = e;
  diasDesdeUltimoCongelamento += 1;
  if (diasDesdeUltimoCongelamento >= DIAS_POR_CONGELAMENTO) {
    congelamentos = Math.max(congelamentos, Math.min(estoqueMax, congelamentos + 1));
    diasDesdeUltimoCongelamento = 0;
  }
  const intervalo = e.ultimoDia === null ? null : diasEntre(e.ultimoDia, dia);
  let diaProtegido = e.diaProtegido;
  if (intervalo === null) sequencia = 1;
  else if (intervalo === 1) sequencia += 1;
  else if (intervalo >= 2 && congelamentos >= intervalo - 1) {
    congelamentos -= intervalo - 1;
    sequencia += 1;
    diaProtegido = diaAnterior(dia);
  } else sequencia = 1;
  return {
    sequencia,
    melhorSequencia: Math.max(e.melhorSequencia, sequencia),
    congelamentos,
    diasDesdeUltimoCongelamento,
    ultimoDia: dia,
    ...(diaProtegido ? { diaProtegido } : {}),
  };
}

/** Crédito de protetor (compra, bônus do plano ou estorno), aplicado no dia em que entrou. */
export interface CreditoDeProtetor {
  dia: string;
  quantidade: number;
}

export interface OpcoesDaSequencia {
  creditos?: readonly CreditoDeProtetor[];
  /** Teto do plano vigente (spec 49 D49-05). Ganhos e bônus não passam dele; o estoque acima dele (de um plano
   *  anterior) fica guardado até ser usado. */
  estoqueMax?: number;
}

function aplicarCredito(congelamentos: number, quantidade: number, estoqueMax: number): number {
  if (quantidade < 0) return Math.max(0, congelamentos + quantidade);
  return Math.max(congelamentos, Math.min(estoqueMax, congelamentos + quantidade));
}

/**
 * Recalcula a sequência a partir de todos os dias com atividade (servidor, importação). Créditos entram antes do
 * dia de atividade em que já valiam; os posteriores ao último dia entram no fim (estoque de hoje).
 */
export function sequenciaDosDias(
  dias: Iterable<string>,
  inicial: EstadoSequencia = SEQUENCIA_INICIAL,
  opcoes: OpcoesDaSequencia = {},
): EstadoSequencia {
  const estoqueMax = opcoes.estoqueMax ?? CONGELAMENTOS_MAXIMO;
  const creditos = [...(opcoes.creditos ?? [])].sort((a, b) => (a.dia < b.dia ? -1 : a.dia > b.dia ? 1 : 0));
  let i = 0;
  let e = inicial;
  for (const dia of [...new Set(dias)].sort()) {
    while (i < creditos.length && creditos[i].dia <= dia) {
      e = { ...e, congelamentos: aplicarCredito(e.congelamentos, creditos[i].quantidade, estoqueMax) };
      i++;
    }
    e = avancarSequencia(e, dia, estoqueMax);
  }
  for (; i < creditos.length; i++) e = { ...e, congelamentos: aplicarCredito(e.congelamentos, creditos[i].quantidade, estoqueMax) };
  return e;
}

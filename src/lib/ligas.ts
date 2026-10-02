/**
 * Ligas semanais só para maiores de 18 (spec 50 §5.5, D50-11) — regras puras, testáveis sem banco. Estende o ranking
 * da 49 (`src/lib/ranking.ts`): mesmos pontos, mesma maioridade, mesmo apelido.
 *
 * - 5 divisões, de baixo para cima: Areia, Coral, Recife, Mar Aberto, Abismo. Quem entra começa em Areia.
 * - Grupos de até 20 por divisão, equilibrados (21 pessoas = 11 + 10, nunca 20 + 1).
 * - Pontos: dias com estudo × 100 + blocos × 10, até 5 blocos por dia. Nunca XP, nunca tempo de uso. Na liga, o bloco
 *   só pontua com 4 respostas pontuadas no dia (antifraude, §5.5).
 * - Empate = mesma posição. Sobem os 4 primeiros com 300 pontos ou mais (todos os empatados no corte sobem; Abismo não
 *   sobe). Descem os 3 últimos com menos de 200 pontos (quem estudou 2 dias ou mais nunca desce; Areia não desce).
 * - Semana com 0 pontos: pausa, volta à mesma divisão quando estudar. Nenhuma Pérola por liga.
 */
import { BLOCOS_CONTADOS_POR_DIA } from "@/lib/ranking";

export const DIVISOES = ["Areia", "Coral", "Recife", "Mar Aberto", "Abismo"] as const;
export type Divisao = 1 | 2 | 3 | 4 | 5;
export const DIVISAO_INICIAL: Divisao = 1;
export const DIVISAO_MAXIMA: Divisao = 5;

export const MAX_POR_GRUPO_LIGA = 20;
/** Divisão com menos que isso de ativos fica num grupo só. */
export const MINIMO_DO_GRUPO = 5;
export const VAGAS_DE_SUBIDA = 4;
export const PONTOS_PARA_SUBIR = 300;
export const VAGAS_DE_DESCIDA = 3;
/** Abaixo disso (menos de 2 dias de estudo) pode descer. */
export const PONTOS_PARA_FICAR = 200;
/** Respostas pontuadas no dia para cada bloco valer pontos na liga. */
export const RESPOSTAS_POR_BLOCO = 4;

export type Movimento = "sobe" | "fica" | "desce";

export function nomeDaDivisao(d: number): string {
  return DIVISOES[Math.min(Math.max(Math.trunc(d), 1), 5) - 1];
}

export function divisaoValida(d: number): Divisao {
  return Math.min(Math.max(Math.trunc(d) || 1, 1), 5) as Divisao;
}

/** Blocos do dia que valem na liga: só os que têm 4 respostas pontuadas por trás. */
export function blocosValidos(blocos: number, respostasPontuadas: number): number {
  return Math.max(0, Math.min(blocos, Math.floor(respostasPontuadas / RESPOSTAS_POR_BLOCO)));
}

/** Pontos da liga numa semana. O dia vale 100 se teve estudo; os blocos, só os válidos (até 5 por dia). */
export function pontosDaLiga(
  dias: readonly { blocos: number; respostasPontuadas: number }[],
): number {
  return dias.reduce(
    (acc, d) =>
      acc +
      (d.blocos > 0
        ? 100 +
          Math.min(blocosValidos(d.blocos, d.respostasPontuadas), BLOCOS_CONTADOS_POR_DIA) * 10
        : 0),
    0,
  );
}

/** Posição com empate: mesma pontuação, mesma posição (1, 1, 3…). */
export function posicoesComEmpate<T extends { pontos: number }>(
  linhas: readonly T[],
): (T & { posicao: number })[] {
  const ordenadas = [...linhas].sort((a, b) => b.pontos - a.pontos);
  return ordenadas.map((l) => ({
    ...l,
    posicao: 1 + ordenadas.filter((o) => o.pontos > l.pontos).length,
  }));
}

/**
 * Grupos de uma divisão, na ordem de entrada: até 20 cada, equilibrados. Menos de 5 = um grupo só (que também é o
 * caso de qualquer divisão com até 20).
 */
export function formarGrupos<T>(entrantes: readonly T[], max = MAX_POR_GRUPO_LIGA): T[][] {
  if (entrantes.length === 0) return [];
  if (entrantes.length < MINIMO_DO_GRUPO) return [[...entrantes]];
  const k = Math.ceil(entrantes.length / max);
  const base = Math.floor(entrantes.length / k);
  const sobra = entrantes.length % k;
  const grupos: T[][] = [];
  let i = 0;
  for (let g = 0; g < k; g++) {
    const tamanho = base + (g < sobra ? 1 : 0);
    grupos.push(entrantes.slice(i, i + tamanho));
    i += tamanho;
  }
  return grupos;
}

/** Quem entra no meio da semana vai para o grupo com menos gente que ainda tem vaga; sem vaga, abre outro. */
export function grupoParaEntrar(
  tamanhos: ReadonlyMap<number, number>,
  max = MAX_POR_GRUPO_LIGA,
): number {
  let escolhido: number | null = null;
  let menor = Infinity;
  let maiorId = -1;
  for (const [g, n] of [...tamanhos].sort((a, b) => a[0] - b[0])) {
    maiorId = Math.max(maiorId, g);
    if (n < max && n < menor) {
      menor = n;
      escolhido = g;
    }
  }
  return escolhido ?? maiorId + 1;
}

export interface ResultadoNaLiga<T> {
  item: T;
  posicao: number | null;
  pontos: number;
  movimento: Movimento;
  /** Divisão da próxima semana. */
  novaDivisao: Divisao;
  /** 0 pontos na semana: sai dos grupos até voltar a estudar. */
  pausa: boolean;
}

/**
 * Fechamento de um grupo. Quem fez 0 pontos entra em pausa (fica na divisão, sem posição). Entre os ativos:
 * - sobe quem está entre os 4 primeiros (posição ≤ 4, então os empatados no corte sobem juntos) com ≥ 300 pontos;
 * - desce quem está entre os 3 últimos com < 200 pontos. No empate do corte de baixo ninguém desce por causa do
 *   empate (só está "entre os 3 últimos" quem tem no máximo 3 pessoas com pontos iguais ou menores, contando a si);
 * - sozinho no grupo ("liga em formação"): sobe com ≥ 300 pontos, nunca desce.
 */
export function fecharGrupo<T>(
  divisao: number,
  membros: readonly { item: T; pontos: number }[],
): ResultadoNaLiga<T>[] {
  const d = divisaoValida(divisao);
  const ativos = membros.filter((m) => m.pontos > 0);
  const comPosicao = posicoesComEmpate(ativos);
  const resultado: ResultadoNaLiga<T>[] = [];
  for (const m of comPosicao) {
    const subir =
      d < DIVISAO_MAXIMA && m.posicao <= VAGAS_DE_SUBIDA && m.pontos >= PONTOS_PARA_SUBIR;
    const iguaisOuMenos = ativos.filter((o) => o.pontos <= m.pontos).length;
    const descer =
      !subir &&
      ativos.length > 1 &&
      d > DIVISAO_INICIAL &&
      m.pontos < PONTOS_PARA_FICAR &&
      iguaisOuMenos <= VAGAS_DE_DESCIDA;
    const movimento: Movimento = subir ? "sobe" : descer ? "desce" : "fica";
    const novaDivisao = divisaoValida(subir ? d + 1 : descer ? d - 1 : d);
    resultado.push({
      item: m.item,
      posicao: m.posicao,
      pontos: m.pontos,
      movimento,
      novaDivisao,
      pausa: false,
    });
  }
  for (const m of membros) {
    if (m.pontos > 0) continue;
    resultado.push({
      item: m.item,
      posicao: null,
      pontos: 0,
      movimento: "fica",
      novaDivisao: d,
      pausa: true,
    });
  }
  return resultado;
}

/** Segunda-feira anterior (AAAA-MM-DD). */
export function semanaAnterior(segunda: string): string {
  return new Date(Date.parse(`${segunda}T12:00:00Z`) - 7 * 86_400_000).toISOString().slice(0, 10);
}

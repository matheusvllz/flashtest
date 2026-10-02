/**
 * Simulado (spec 50 §5.9.4) — composição pura, usada pelo servidor. Três tipos:
 * - "prova": uma prova oficial do ENEM por área, na ordem original (anuladas e não importadas ficam fora, e o rótulo
 *   diz quantas questões há);
 * - "nivel": simulado nível ENEM (área 45 ou dia 90) com questões oficiais de anos diferentes, inéditas para o aluno,
 *   espalhadas pelas habilidades — nunca apresentado como prova oficial;
 * - "mini": 15 oficiais por semana (4 LC, 4 CH, 4 CN, 3 MT), o mesmo para todos na semana.
 */

export type AreaEnem = "LC" | "CH" | "CN" | "MT";
export const AREAS: readonly AreaEnem[] = ["LC", "CH", "CN", "MT"];

export interface ItemDeSimulado {
  id: string;
  ano: number;
  dia: 1 | 2;
  numero: number;
  area: AreaEnem;
  skillIds: string[];
}

/** Uma prova oficial por área só é oferecida com pelo menos este número de questões disponíveis. */
export const MINIMO_PARA_PROVA = 30;
export const QUESTOES_POR_AREA = 45;
/** O mini-simulado só abre com pelo menos este número de questões oficiais disponíveis. */
export const MINIMO_PARA_MINI = 120;
export const MINI_POR_AREA: Record<AreaEnem, number> = { LC: 4, CH: 4, CN: 4, MT: 3 };
/** Tempo de referência (opcional): 3 min por questão. */
export const MS_POR_QUESTAO = 3 * 60_000;

export interface ProvaDisponivel {
  ano: number;
  area: AreaEnem;
  questoes: number;
}

/** Provas oficiais (ano × área) com questões suficientes, da mais recente para a mais antiga. */
export function provasDisponiveis(itens: readonly ItemDeSimulado[]): ProvaDisponivel[] {
  const cont = new Map<string, ProvaDisponivel>();
  for (const i of itens) {
    const k = `${i.ano}:${i.area}`;
    const p = cont.get(k) ?? { ano: i.ano, area: i.area, questoes: 0 };
    p.questoes += 1;
    cont.set(k, p);
  }
  return [...cont.values()].filter((p) => p.questoes >= MINIMO_PARA_PROVA).sort((a, b) => b.ano - a.ano || AREAS.indexOf(a.area) - AREAS.indexOf(b.area));
}

/** Conteúdo suficiente para ligar o simulado completo: ao menos 3 provas por área. */
export function simuladoTemConteudo(itens: readonly ItemDeSimulado[]): boolean {
  const provas = provasDisponiveis(itens);
  return AREAS.every((a) => provas.filter((p) => p.area === a).length >= 3);
}

export function composicaoDaProva(itens: readonly ItemDeSimulado[], ano: number, area: AreaEnem): string[] {
  return itens
    .filter((i) => i.ano === ano && i.area === area)
    .sort((a, b) => a.numero - b.numero)
    .map((i) => i.id);
}

function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Embaralhamento determinístico (mesma semente → mesma ordem). */
export function embaralhar<T>(lista: readonly T[], semente: string): T[] {
  return [...lista]
    .map((x, i) => ({ x, k: hash(`${semente}:${i}`) }))
    .sort((a, b) => a.k - b.k)
    .map((p) => p.x);
}

/**
 * Nível ENEM por área: `total` questões oficiais, preferindo as que o aluno ainda não viu, espalhadas pelas
 * habilidades (rodízio por habilidade) e por anos diferentes.
 */
export function composicaoNivel(
  itens: readonly ItemDeSimulado[],
  area: AreaEnem,
  vistos: ReadonlySet<string>,
  semente: string,
  total = QUESTOES_POR_AREA,
): string[] {
  const daArea = embaralhar(
    itens.filter((i) => i.area === area),
    semente,
  );
  const ineditos = daArea.filter((i) => !vistos.has(i.id));
  const reserva = daArea.filter((i) => vistos.has(i.id));
  const porHabilidade = new Map<string, ItemDeSimulado[]>();
  for (const i of ineditos) {
    const k = i.skillIds[0] ?? "geral";
    porHabilidade.set(k, [...(porHabilidade.get(k) ?? []), i]);
  }
  const escolhidos: string[] = [];
  const filas = [...porHabilidade.values()];
  while (escolhidos.length < total && filas.some((f) => f.length)) {
    for (const f of filas) {
      const item = f.shift();
      if (item) escolhidos.push(item.id);
      if (escolhidos.length >= total) break;
    }
  }
  for (const i of reserva) {
    if (escolhidos.length >= total) break;
    escolhidos.push(i.id);
  }
  return escolhidos;
}

/** Mini-simulado da semana: mesmo conjunto para todos na semana (semente = semana). */
export function composicaoMini(itens: readonly ItemDeSimulado[], semana: string): string[] {
  const ids: string[] = [];
  for (const a of AREAS) {
    ids.push(...embaralhar(itens.filter((i) => i.area === a), `mini:${semana}:${a}`).slice(0, MINI_POR_AREA[a]).map((i) => i.id));
  }
  return ids;
}

/** Segunda-feira da semana de `dia` (AAAA-MM-DD). */
export function semanaDe(dia: string): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export interface ResultadoDoSimulado {
  total: number;
  respondidas: number;
  acertos: number;
  porArea: { area: AreaEnem; acertos: number; total: number }[];
  porHabilidade: { skillId: string; acertos: number; total: number }[];
  /** Até 3 habilidades com mais erros (para "O que revisar"). */
  revisar: string[];
  tempoMs: number;
}

export function montarResultado(
  itens: readonly { id: string; area: AreaEnem; skillId: string | null; correta: boolean; respondida: boolean }[],
  tempoMs: number,
): ResultadoDoSimulado {
  const porArea = new Map<AreaEnem, { acertos: number; total: number }>();
  const porHab = new Map<string, { acertos: number; total: number }>();
  for (const i of itens) {
    const a = porArea.get(i.area) ?? { acertos: 0, total: 0 };
    a.total += 1;
    if (i.correta) a.acertos += 1;
    porArea.set(i.area, a);
    if (i.skillId) {
      const h = porHab.get(i.skillId) ?? { acertos: 0, total: 0 };
      h.total += 1;
      if (i.correta) h.acertos += 1;
      porHab.set(i.skillId, h);
    }
  }
  const porHabilidade = [...porHab.entries()].map(([skillId, v]) => ({ skillId, ...v }));
  const revisar = [...porHabilidade]
    .filter((h) => h.acertos < h.total)
    .sort((a, b) => b.total - b.acertos - (a.total - a.acertos))
    .slice(0, 3)
    .map((h) => h.skillId);
  return {
    total: itens.length,
    respondidas: itens.filter((i) => i.respondida).length,
    acertos: itens.filter((i) => i.correta).length,
    porArea: AREAS.filter((a) => porArea.has(a)).map((a) => ({ area: a, ...porArea.get(a)! })),
    porHabilidade,
    revisar,
    tempoMs,
  };
}

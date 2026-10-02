/**
 * Plano semanal do cronograma até o ENEM (spec 49 §5.9 item 3, T-49.9.2) — puro.
 *
 * - Meta da semana = dias de estudo × blocos por dia (um bloco ≈ 8 minutos: lição de 4–8 questões).
 * - Divisão entre as áreas pelo peso da prova (as quatro áreas objetivas valem o mesmo) ajustado pela lacuna: área
 *   com domínio menor recebe mais; área ainda sem medida conta como lacuna média. Redação: 1 bloco por semana.
 * - Reorganiza sozinho: o que falta na semana é redistribuído pelos dias que sobram.
 * - Data da prova: a que o aluno informou; padrão, o primeiro domingo de novembro (data estimada até o INEP publicar).
 */

export type AreaObjetiva = "LC" | "MT" | "CN" | "CH";
export const AREAS_OBJETIVAS: readonly AreaObjetiva[] = ["LC", "MT", "CN", "CH"];
export const MINUTOS_POR_BLOCO = 8;

export function blocosPorDia(minutosDia: number): number {
  return Math.max(1, Math.round(minutosDia / MINUTOS_POR_BLOCO));
}

/** Primeiro domingo de novembro do ano da prova (ano corrente se ainda não passou; senão o seguinte). */
export function dataProvaPadrao(hoje: string): string {
  const ano = Number(hoje.slice(0, 4));
  const domingo = (a: number) => {
    const d = new Date(Date.UTC(a, 10, 1));
    while (d.getUTCDay() !== 0) d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  };
  const deste = domingo(ano);
  return deste > hoje ? deste : domingo(ano + 1);
}

export function diasAte(hoje: string, dia: string): number {
  return Math.round((Date.parse(`${dia}T12:00:00Z`) - Date.parse(`${hoje}T12:00:00Z`)) / 86_400_000);
}

export interface PlanoDaSemana {
  diasAteProva: number;
  semanasAteProva: number;
  metaSemana: number;
  feitosSemana: number;
  faltamSemana: number;
  porArea: { area: AreaObjetiva | "RED"; blocos: number }[];
}

/** `dominioPorArea`: média do domínio (0–100) das habilidades medidas da área, ou `null` sem medida. */
export function planoDaSemana(
  cfg: { diasSemana: number; minutosDia: number; dataProva: string },
  dominioPorArea: Partial<Record<AreaObjetiva, number | null>>,
  feitosSemana: number,
  hoje: string,
): PlanoDaSemana {
  const diasAteProva = Math.max(0, diasAte(hoje, cfg.dataProva));
  const metaSemana = cfg.diasSemana * blocosPorDia(cfg.minutosDia);
  const faltamSemana = Math.max(0, metaSemana - feitosSemana);
  const redacao = faltamSemana > 0 ? 1 : 0;
  const objetivos = Math.max(0, faltamSemana - redacao);
  const pesos = AREAS_OBJETIVAS.map((a) => {
    const d = dominioPorArea[a];
    return { area: a, peso: 1 + (1 - (d ?? 50) / 100) };
  });
  const soma = pesos.reduce((acc, p) => acc + p.peso, 0);
  const brutos = pesos.map((p) => ({ area: p.area, ideal: (objetivos * p.peso) / soma }));
  const partes = brutos.map((b) => ({ area: b.area, blocos: Math.floor(b.ideal), resto: b.ideal - Math.floor(b.ideal) }));
  let sobra = objetivos - partes.reduce((acc, p) => acc + p.blocos, 0);
  for (const p of [...partes].sort((x, y) => y.resto - x.resto)) {
    if (sobra <= 0) break;
    p.blocos += 1;
    sobra -= 1;
  }
  return {
    diasAteProva,
    semanasAteProva: Math.ceil(diasAteProva / 7),
    metaSemana,
    feitosSemana,
    faltamSemana,
    porArea: [...partes.map((p) => ({ area: p.area, blocos: p.blocos })), { area: "RED" as const, blocos: redacao }].filter((p) => p.blocos > 0),
  };
}

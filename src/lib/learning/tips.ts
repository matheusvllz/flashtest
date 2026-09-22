import type { ExamTarget, ExamTip, TipHistoryEntry } from "./types";

/**
 * Elegibilidade, frequência e seleção de dicas (docs/20 §10, Fase 8). Funções
 * puras — persistência (registrar exposição) fica pro chamador, como em
 * `review.ts`. Ordem de aplicação sempre: `filterEligibleTips` (filtros
 * duros) -> `applyFrequencyRules` (limite diário/cooldown) -> `selectTip`
 * (ranqueamento). Rodar fora dessa ordem pode deixar frequência competir
 * com validade/perfil, que a regra 6 exige aplicar ANTES de ranquear.
 */

const COOLDOWN_DIAS = 14;

function diasEntre(deISO: string, ateISO: string): number {
  const de = new Date(`${deISO}T00:00:00`).getTime();
  const ate = new Date(`${ateISO}T00:00:00`).getTime();
  return Math.round((ate - de) / 86_400_000);
}

/**
 * Filtros duros: perfil explicitamente escolhido, etapa/ciclo (quando o tip
 * os exige) e validade editorial (docs/20 §10, regras 4/5/6). Sem perfil
 * conhecido, nada é elegível — nunca dedutível da universidade-alvo sozinha.
 */
export function filterEligibleTips(
  tips: ExamTip[],
  params: { examTargets: ExamTarget[]; hojeISO: string },
): ExamTip[] {
  if (params.examTargets.length === 0) return [];
  return tips.filter((tip) => {
    const alvo = params.examTargets.find((t) => t.examId === tip.examProfileId);
    if (!alvo) return false;
    if (tip.stage && alvo.stage !== tip.stage) return false;
    if (tip.cycle && alvo.cycle !== tip.cycle) return false;
    if (tip.validUntil && tip.validUntil < params.hojeISO) return false;
    return true;
  });
}

/**
 * Regras de frequência (docs/20 §10, regras 2/8): no máximo uma dica
 * espontânea por dia local; nenhum ID repete em 14 dias. Pedido explícito do
 * usuário (`requested: true`) ignora só o limite DIÁRIO — o cooldown de 14
 * dias por ID e os filtros duros (já aplicados antes) continuam valendo.
 */
export function applyFrequencyRules(
  tips: ExamTip[],
  params: { tipHistory: TipHistoryEntry[]; hojeISO: string; requested: boolean },
): ExamTip[] {
  const espontaneaHoje = params.tipHistory.some(
    (h) => !h.requested && h.localDate === params.hojeISO,
  );
  if (espontaneaHoje && !params.requested) return [];

  return tips.filter((tip) => {
    const exposicoes = params.tipHistory
      .filter((h) => h.tipId === tip.id)
      .sort((a, b) => (a.localDate < b.localDate ? 1 : -1));
    const ultima = exposicoes[0];
    if (!ultima) return true;
    return diasEntre(ultima.localDate, params.hojeISO) >= COOLDOWN_DIAS;
  });
}

/**
 * Ordem determinística (docs/20 §10, regra 7): relação com a habilidade da
 * lição primeiro, depois prioridade editorial, ID como desempate final —
 * mesmo estado/entrada sempre produz o mesmo resultado.
 */
export function selectTip(
  eligibleTips: ExamTip[],
  params: { skillIds: string[] },
): ExamTip | null {
  if (eligibleTips.length === 0) return null;
  const ordenadas = [...eligibleTips].sort((a, b) => {
    const relevanteA = a.skillIds.some((s) => params.skillIds.includes(s)) ? 0 : 1;
    const relevanteB = b.skillIds.some((s) => params.skillIds.includes(s)) ? 0 : 1;
    if (relevanteA !== relevanteB) return relevanteA - relevanteB;
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return ordenadas[0];
}

/**
 * Composição das três etapas — o caminho único que o recap e o "pedir dica"
 * explícito devem usar, pra nunca aplicar as regras fora de ordem.
 */
export function pickTip(params: {
  tips: ExamTip[];
  examTargets: ExamTarget[];
  tipHistory: TipHistoryEntry[];
  skillIds: string[];
  hojeISO: string;
  requested: boolean;
}): ExamTip | null {
  const elegiveis = filterEligibleTips(params.tips, {
    examTargets: params.examTargets,
    hojeISO: params.hojeISO,
  });
  const comFrequencia = applyFrequencyRules(elegiveis, {
    tipHistory: params.tipHistory,
    hojeISO: params.hojeISO,
    requested: params.requested,
  });
  return selectTip(comFrequencia, { skillIds: params.skillIds });
}

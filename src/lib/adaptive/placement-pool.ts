/**
 * Ponte entre o motor puro do nivelamento (`placement.ts`) e o catálogo real
 * de conteúdo (docs/30 §12.3, Fase 13 do docs/31) — importa `@/content/*`,
 * de propósito SEPARADO de `placement.ts` pra `store.ts` nunca precisar
 * importar este arquivo (regra de fronteira de bundle, docs/30 §21.3,
 * `tests/unit/store-bundle-boundary.test.ts`). Só a rota `/nivelamento`, o
 * hook de reconciliação (`usePlacementReconciliation`) e a tela de resultado
 * chamam isto.
 *
 * Estado real (docs/32, Fase 15.1, 27/09/2026): o pool diagnóstico existe — a
 * Onda 1 promoveu ~40–45 itens revisados por área (LC/MT/CN/CH) e o
 * nivelamento está ligado. `poolDiagnosticoDaArea` só devolve item de pacote
 * com o pacote em memória (`itemDisponivel`, docs/30 §21.3), então quem monta
 * o pool antes precisa ter chamado `carregarTodosOsPacotes()`. Uma área cujo
 * pool elegível fica abaixo de `PLACEMENT_MIN_ITENS_ELEGIVEIS_AREA` não é
 * medida (`30` §12.3, caso de borda) — hoje só acontece se o pacote não
 * carregou (offline) ou se o foco do aluno deixa a área de fora.
 */
import { itemDisponivel, itemIndex, itemMetaOf } from "@/content/items";
import { activeSkills, SKILL_MAP } from "@/content/taxonomy";
import { areaOfSubject } from "@/content/taxonomy/areas";
import type { EnemArea } from "@/content/taxonomy/types";
import type { PlacementResponse, PlacementState, SkillModelEntry } from "@/lib/learning/types";
import { estimateEAP, type PlacementPoolItem } from "./placement";
import { PLACEMENT_MIN_ITENS_ELEGIVEIS_AREA, PLACEMENT_SIGMA_MIN_PRIOR } from "./constants";
import type { ItemIrtLike } from "./model";

/** Pool elegível de verdade de uma área (docs/30 §12.3) — ver o comentário no topo do arquivo. */
export function poolDiagnosticoDaArea(area: EnemArea): PlacementPoolItem[] {
  return itemIndex()
    .filter((e) => itemDisponivel(e.id)) // item de pacote só entra com o pacote em memória (docs/30 §21.3)
    .filter((e) => e.roles.includes("diagnostico"))
    .filter((e) => e.status === "revisada-humano" || e.status === "oficial-conferida")
    .filter((e) => e.subjectId && e.skill && areaOfSubject(e.subjectId) === area)
    .map((e) => ({
      id: e.id,
      skillId: e.skill as string,
      subjectId: e.subjectId as string,
      area,
      irt: { a: e.a, b: e.b, c: e.c },
      // Constante de propósito: a incidência ENEM que existe hoje é por HABILIDADE
      // (`SkillDef.incidence`), não por item, e só desempata o PRIMEIRO item de cada
      // área (`primeiroItem`, docs/30 §12.3). Trocar por `SKILL_MAP[..].incidence`
      // mudaria a abertura de todo nivelamento sem dado que justifique a diferença.
      incidence: 2 as const,
    }));
}

/** Uma área "não é medida" quando o pool elegível fica abaixo do mínimo (docs/30 §12.3, caso de borda). */
export function areaTemPoolSuficiente(pool: PlacementPoolItem[]): boolean {
  return pool.length >= PLACEMENT_MIN_ITENS_ELEGIVEIS_AREA;
}

/**
 * Preenche prior pras habilidades ATIVAS de uma área medida que não foram
 * respondidas diretamente (docs/30 §12.3): θ = θ̂ da matéria (se ≥ 2 itens
 * dela foram respondidos) ou θ̂ da área, σ = max(0,9; SE + 0,3), nEff 0,
 * source "prior-nivelamento". Habilidades medidas DIRETAMENTE já chegam
 * aqui com `source: "evidencia"` (o chamador aplica `updateSkill` em tempo
 * real a cada resposta — docs/32 Fase 13) e nunca são sobrescritas; um
 * prior de execução anterior (refazer nivelamento) pode ser substituído.
 */
export function applyPlacement(
  state: PlacementState,
  skillModel: Record<string, SkillModelEntry>,
  itemsById: Map<string, PlacementPoolItem>,
  today: string,
): Record<string, SkillModelEntry> {
  const novo: Record<string, SkillModelEntry> = { ...skillModel };

  for (const [area, areaState] of Object.entries(state.areas)) {
    if (areaState.theta === null || areaState.se === null) continue;

    const respostasPorMateria = new Map<string, PlacementResponse[]>();
    for (const resposta of areaState.responses) {
      const subjectId = itemsById.get(resposta.itemId)?.subjectId;
      if (!subjectId) continue;
      const lista = respostasPorMateria.get(subjectId) ?? [];
      lista.push(resposta);
      respostasPorMateria.set(subjectId, lista);
    }

    for (const skill of activeSkills()) {
      if (skill.area !== area) continue;
      const entradaAtual = novo[skill.id];
      if (entradaAtual?.source === "evidencia") continue; // evidência real (medida agora ou antes) nunca é sobrescrita.

      const respostasMateria = respostasPorMateria.get(skill.subjectId) ?? [];
      const usaPriorDaMateria = respostasMateria.length >= 2;
      const { theta, se } = usaPriorDaMateria
        ? estimateEAP(
            respostasMateria
              .map((r) => {
                const it = itemsById.get(r.itemId);
                return it ? { irt: it.irt, correct: r.correct, dontKnow: r.dontKnow } : null;
              })
              .filter(
                (r): r is { irt: ItemIrtLike; correct: boolean; dontKnow: boolean } => r !== null,
              ),
          )
        : { theta: areaState.theta, se: areaState.se };

      novo[skill.id] = {
        skillId: skill.id,
        theta,
        sigma: Math.max(PLACEMENT_SIGMA_MIN_PRIOR, se + 0.3),
        nEff: 0,
        difficultiesSeen: [],
        recent: [],
        independentShare: 0,
        lastEvidenceDate: null,
        lapses: 0,
        dontKnowRecent: 0,
        helpHeavyRecent: 0,
        source: "prior-nivelamento",
        algoVersion: entradaAtual?.algoVersion ?? 1,
        updatedAt: today,
      };
    }
  }

  return novo;
}

/**
 * Reconstitui o mapa `itemId → PlacementPoolItem` a partir do que o
 * `PlacementState` guardou (docs/36 T-03.2, RF-12, bug C3). O motor recalcula
 * θ̂/SE da área inteira a cada resposta e DESCARTA em silêncio a resposta cujo
 * item não está no mapa — a rota recriava o mapa vazio a cada montagem, então
 * retomar depois de recarregar dava outra estimativa que a execução contínua.
 *
 * Ordem de resolução por item respondido: (1) pool diagnóstico atual da área;
 * (2) senão, a meta atual do catálogo (`itemMetaOf` + `SKILL_MAP`) — um item que
 * deixou de ser diagnóstico ou foi retirado continua com `irt`/matéria/habilidade
 * da meta; (3) senão vai para `ausentes` (o chamador decide; nunca lança).
 */
export function placementItemsById(placement: PlacementState): {
  byId: Map<string, PlacementPoolItem>;
  ausentes: string[];
} {
  const byId = new Map<string, PlacementPoolItem>();
  const ausentes: string[] = [];
  for (const [chave, areaState] of Object.entries(placement.areas)) {
    const area = chave as EnemArea;
    const doPool = new Map(poolDiagnosticoDaArea(area).map((i) => [i.id, i]));
    for (const id of areaState.itemIds) {
      if (byId.has(id)) continue;
      const noPool = doPool.get(id);
      if (noPool) {
        byId.set(id, noPool);
        continue;
      }
      const daMeta = itemDaMeta(id, area);
      if (daMeta) byId.set(id, daMeta);
      else ausentes.push(id);
    }
  }
  return { byId, ausentes };
}

function itemDaMeta(id: string, area: EnemArea): PlacementPoolItem | null {
  try {
    const meta = itemMetaOf(id);
    const skillId = meta.skillIds[0];
    const def = skillId ? SKILL_MAP[skillId] : undefined;
    if (!skillId || !def) return null;
    return {
      id,
      skillId,
      subjectId: def.subjectId,
      area,
      irt: { a: meta.irt.a, b: meta.irt.b, c: meta.irt.c },
      incidence: 2 as const, // mesmo motivo do pool (ver `poolDiagnosticoDaArea`)
    };
  } catch {
    // Id que nem a meta consegue resolver (ex.: item removido do acervo).
    return null;
  }
}

/**
 * Resultado da aplicação do nivelamento (docs/36 T-03.3, RF-10/RF-11) — o
 * `skillModel` com priors das habilidades não medidas + os ids que não deu
 * pra resolver. Pura sobre o catálogo carregado; NUNCA importada pelo store
 * (o store só recebe o resultado, em `applyPlacementOutcome`).
 */
export function computePlacementOutcome(
  p: PlacementState,
  skillModel: Record<string, SkillModelEntry>,
  today: string,
): { skillModel: Record<string, SkillModelEntry>; ausentes: string[] } {
  const { byId, ausentes } = placementItemsById(p);
  return { skillModel: applyPlacement(p, skillModel, byId, today), ausentes };
}

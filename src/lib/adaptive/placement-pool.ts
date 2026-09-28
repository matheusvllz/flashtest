/**
 * Ponte entre o motor puro do nivelamento (`placement.ts`) e o catálogo real
 * de conteúdo (docs/30 §12.3, Fase 13 do docs/31) — importa `@/content/*`,
 * de propósito SEPARADO de `placement.ts` pra `store.ts` nunca precisar
 * importar este arquivo (regra de fronteira de bundle, docs/30 §21.3,
 * `tests/unit/store-bundle-boundary.test.ts`). Só a rota `/nivelamento` e a
 * tela de resultado chamam isto.
 *
 * Estado real hoje (docs/32, Fase 13): **zero** itens do catálogo têm papel
 * `"diagnostico"` — isso é produzido pela Fase 11 (conteúdo em escala via
 * IA), que ainda não rodou (sem chave/orçamento de LLM neste ambiente). Até
 * lá, `poolDiagnosticoDaArea` devolve vazio pra toda área e o nivelamento cai
 * no caso de borda já previsto no `30` §12.3 ("pool abaixo de 4 itens
 * elegíveis → área não é medida") — o motor está pronto e testado (com pools
 * sintéticos, como a simulação G do `30` §26.3 já pede), só não tem dado
 * real pra usar ainda. Mesmo padrão das Fases 8/9.
 */
import { itemDisponivel, itemIndex } from "@/content/items";
import { activeSkills } from "@/content/taxonomy";
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
      incidence: 2 as const, // TODO(Fase 11): trocar por `SKILL_MAP[e.skill].incidence` quando o pool real existir.
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

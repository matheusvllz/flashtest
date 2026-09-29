import { describe, expect, test } from "bun:test";
import { advancePlacement, startPlacement, type PlacementScope } from "@/lib/adaptive/placement";
import { computePlacementOutcome, placementItemsById } from "@/lib/adaptive/placement-pool";
import { planNext } from "@/lib/adaptive/planner";
import { lessonIdsForSkill } from "@/lib/adaptive/candidates";
import type { PlannedActivity } from "@/lib/adaptive/types";
import { itemIndex } from "@/content/items";
import { areaOfSubject } from "@/content/taxonomy/areas";
import { learningStateVazio, type PlacementState } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

/**
 * Efeito causal observável do nivelamento (docs/36 T-03.5, RP-1, G-6): dois
 * alunos com o MESMO foco, data e semente, que só diferem no resultado do
 * nivelamento (A forte em MT/fraco em LC; B o inverso), recebem filas
 * diferentes — e a diferença vai no sentido pedagógico (a área mais fraca
 * primeiro). Usa o catálogo REAL (itens diagnósticos promovidos, `irt` por
 * dificuldade — T-04.2) e o planner real.
 *
 * Detecta: (i) nivelamento sem efeito na ordem (prior com `nEff 0` fixo em
 * 0,8 → A e B idênticos — o bug B3/agravante 3 do `36` §D); (ii) prior
 * pulando aula (aula opcional exige EVIDÊNCIA, `30` §10.5).
 */

const HOJE = "2026-09-28";
const SEED = "seed-efeito-nivelamento";

function idsDiagnosticos(area: "MT" | "LC", n: number): string[] {
  return itemIndex()
    .filter((e) => e.roles.includes("diagnostico"))
    .filter((e) => e.status === "revisada-humano" || e.status === "oficial-conferida")
    .filter((e) => e.subjectId && areaOfSubject(e.subjectId) === area)
    .slice(0, n)
    .map((e) => e.id);
}

/** Nivelamento concluído com 5 respostas em MT e 5 em LC: `certasMT`/`certasLC` = acertou todas ou errou todas. */
function placementConcluido(certasMT: boolean, certasLC: boolean): PlacementState {
  const scope: PlacementScope = { areas: ["MT", "LC"], priorityAreas: new Set() };
  const mt = idsDiagnosticos("MT", 5);
  const lc = idsDiagnosticos("LC", 5);
  expect(mt).toHaveLength(5);
  expect(lc).toHaveLength(5);
  let st = startPlacement("seed-efeito", "2026-09-28T10:00:00.000Z");
  const { byId, ausentes } = placementItemsById({
    ...st,
    areas: {
      MT: { itemIds: mt, responses: [], theta: null, se: null, done: false },
      LC: { itemIds: lc, responses: [], theta: null, se: null, done: false },
    },
  });
  expect(ausentes).toEqual([]);
  for (const id of mt) st = advancePlacement(st, scope, byId.get(id)!, certasMT, false, byId);
  for (const id of lc) st = advancePlacement(st, scope, byId.get(id)!, certasLC, false, byId);
  return { ...st, status: "concluido", finishedAt: "2026-09-28T10:08:00.000Z" };
}

function estado(placement: PlacementState | null): Pick<AppState, "prefs" | "learning" | "progress"> {
  const learning = learningStateVazio();
  if (placement) {
    const o = computePlacementOutcome(placement, learning.skillModel, HOJE);
    learning.skillModel = o.skillModel;
    learning.placement = placement;
  }
  return {
    prefs: {
      difficultSubjects: [],
      easySubjects: [],
      dailyMinutes: 10,
      studyFocus: { mode: "todas", subjectIds: [], areas: [] },
      examTargets: [],
    } as unknown as AppState["prefs"],
    learning,
    progress: { bySubject: {}, lessons: {}, today: { date: HOJE, completedBlockIds: [] } } as unknown as AppState["progress"],
  };
}

const fila = (s: ReturnType<typeof estado>, n = 8): PlannedActivity[] => planNext(s, HOJE, SEED, { n });
const area = (a: PlannedActivity) => (a.subjectId ? areaOfSubject(a.subjectId) : null);
const ehNova = (a: PlannedActivity) => a.kind === "aula" || a.kind === "pratica" || a.kind === "legado";
/** Posição da 1ª atividade "nova" da área na fila (Infinity se não aparece). */
function primeiraDaArea(f: PlannedActivity[], alvo: "MT" | "LC"): number {
  const i = f.findIndex((a) => ehNova(a) && area(a) === alvo);
  return i < 0 ? Number.POSITIVE_INFINITY : i;
}

describe("efeito do nivelamento na fila (T-03.5, RP-1, G-6)", () => {
  const A = placementConcluido(true, false); // forte em MT, fraco em LC
  const B = placementConcluido(false, true); // o inverso
  const filaA = fila(estado(A));
  const filaB = fila(estado(B));
  const base = fila(estado(null));

  test("pré-condição: os perfis medem o que dizem (θ̂ de MT > LC em A, LC > MT em B)", () => {
    expect(A.areas.MT!.theta!).toBeGreaterThan(A.areas.LC!.theta!);
    expect(B.areas.LC!.theta!).toBeGreaterThan(B.areas.MT!.theta!);
  });

  test("(1) as filas diferem — nas 3 primeiras atividades e em relação a quem nunca fez o nivelamento", () => {
    const chave = (f: PlannedActivity[], n: number) => f.slice(0, n).map((a) => `${a.kind}:${a.skillIds[0]}`);
    expect(chave(filaA, 3)).not.toEqual(chave(filaB, 3));
    expect(chave(filaA, 8)).not.toEqual(chave(filaB, 8));
    expect(chave(filaA, 8)).not.toEqual(chave(base, 8));
    expect(chave(filaB, 8)).not.toEqual(chave(base, 8));
  });

  test("(2) em A (LC fraco) a 1ª atividade nova de LC vem antes da de MT; em B (MT fraco) é o contrário", () => {
    expect(primeiraDaArea(filaA, "LC")).toBeLessThan(primeiraDaArea(filaA, "MT"));
    expect(primeiraDaArea(filaB, "MT")).toBeLessThan(primeiraDaArea(filaB, "LC"));
    // e o efeito é observável em relação à fila "sem nivelamento": a área fraca sobe, a forte não sobe
    expect(primeiraDaArea(filaA, "LC")).toBeLessThanOrEqual(primeiraDaArea(base, "LC"));
    expect(primeiraDaArea(filaB, "MT")).toBeLessThanOrEqual(primeiraDaArea(base, "MT"));
    expect(primeiraDaArea(filaA, "MT")).toBeGreaterThanOrEqual(primeiraDaArea(base, "MT"));
    expect(primeiraDaArea(filaB, "LC")).toBeGreaterThanOrEqual(primeiraDaArea(base, "LC"));
  });

  test("(3) prior não troca aula por prática: a 1ª ocorrência de cada habilidade tem o mesmo kind que sem nivelamento", () => {
    // baseline maior, pra cobrir todas as habilidades que A/B possam trazer
    const grande = fila(estado(null), 40);
    const kindBase = new Map<string, string>();
    for (const a of grande) if (ehNova(a) && !kindBase.has(a.skillIds[0])) kindBase.set(a.skillIds[0], a.kind);
    for (const f of [filaA, filaB]) {
      const vistas = new Set<string>();
      for (const a of f) {
        if (!ehNova(a) || vistas.has(a.skillIds[0])) continue;
        vistas.add(a.skillIds[0]);
        const esperado = kindBase.get(a.skillIds[0]);
        if (esperado) expect(`${a.skillIds[0]}:${a.kind}`).toBe(`${a.skillIds[0]}:${esperado}`);
        // habilidade com aula e sem evidência nunca vira prática só por prior
        if (lessonIdsForSkill(a.skillIds[0]).length > 0) expect(a.kind).not.toBe("pratica");
      }
    }
  });

  test("os priors não viraram evidência: nEff 0 em todas as entradas de nivelamento", () => {
    for (const p of [A, B]) {
      const o = computePlacementOutcome(p, learningStateVazio().skillModel, HOJE);
      const priors = Object.values(o.skillModel).filter((e) => e.source === "prior-nivelamento");
      expect(priors.length).toBeGreaterThan(0);
      expect(priors.every((e) => e.nEff === 0)).toBe(true);
    }
  });
});

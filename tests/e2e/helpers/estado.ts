import type { Page } from "@playwright/test";
import { PLANNER_VERSION } from "../../../src/lib/adaptive/constants";

/**
 * Helpers de estado para os E2E do plano `docs/36` (T-01.2, RF-2/RF-6/RF-10).
 *
 * Regra de ouro: NUNCA `addInitScript` incondicional com `setItem` do estado.
 * O Playwright reexecuta o init script em CADA navegação completa
 * (`page.goto`, `page.reload`), então um semeador incondicional apaga o que o
 * app gravou desde a última vez — um teste de "recarregar no meio da
 * atividade" passaria a testar o seed, não o app. `seedOnce` só grava se a
 * chave ainda não existe (mesmo padrão de `placement.spec.ts`/`focus.spec.ts`).
 */

export const STORAGE_KEY = "foca.state.v3";

/** Usuário onboarded mínimo (cópia do objeto que `journey.spec.ts`/`placement.spec.ts` usavam inline). */
export const USUARIO_ONBOARDED = {
  authed: true,
  onboarded: true,
  prefs: { name: "Ana", sound: true, haptics: true, theme: "auto", dailyLessons: 3 },
  progress: { xp: 100, streak: 2, lessonsCompleted: 1, completedQuestions: [] },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

/**
 * `planVersion` que o código trata como "plano em dia" — `PLANNER_VERSION` desde a T-02.7
 * (docs/37 D-1: até a Fase 2 o comparador era `ALGO_VERSION`; agora `ensurePlan`/`commitPlan`
 * usam a versão do PLANEJADOR, separada da do modelo).
 */
export const PLAN_VERSION_ATUAL: number = PLANNER_VERSION;

export type EstadoSeed = Record<string, unknown>;
export type ActivityKindSeed = "aula" | "pratica" | "revisao" | "desafio" | "checkpoint" | "legado" | "reforco";

/** Semeia `foca.state.v3` SÓ se ainda não existir (sobrevive a `goto`/`reload`). */
export async function seedOnce(page: Page, estado: EstadoSeed = USUARIO_ONBOARDED): Promise<void> {
  await page.addInitScript(
    ({ chave, raw }) => {
      try {
        if (!localStorage.getItem(chave)) localStorage.setItem(chave, JSON.stringify(raw));
      } catch {
        /* storage bloqueado — o teste que depende disso falha por outro motivo, mais claro */
      }
    },
    { chave: STORAGE_KEY, raw: estado },
  );
}

/** Liga/desliga flags de produto pelo override local (`readFlagOverrides`, lido só em dev/`?debug=1`). Idempotente: as flags não são estado do aluno. */
export async function definirFlags(page: Page, flags: Record<string, boolean>): Promise<void> {
  await page.addInitScript((f) => {
    try {
      localStorage.setItem("foca.flags", JSON.stringify(f));
    } catch {
      /* idem */
    }
  }, flags);
}

/** Lê o estado gravado (ou `null` se nada foi gravado). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- estado local dinâmico de fixture E2E
export async function lerEstado(page: Page): Promise<any> {
  return page.evaluate((chave) => {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);
}

/* ------------------------------------------------------------------ jornada */

/**
 * Defaults por família de atividade — habilidades/aulas REAIS do catálogo:
 * - prática/revisão/desafio/reforço-sem-aula: `mat:porcentagem-conceito`
 *   (2 itens reais no banco geral, `q10`/`q21` — mesma escolha de `journey.spec.ts`);
 * - aula embarcada: aula `porcentagem-valor` da mesma habilidade;
 * - legado: 1ª lição da trilha de crase (`crase-01-a-regra-de-ouro`, `por:crase-regra-basica`).
 *
 * Provisório para revisão/desafio/reforço/checkpoint: a Fase 2 (T-02.x)
 * confirma pelo `itemIndex()` que a habilidade tem itens elegíveis para o
 * papel (desafio pede dificuldade ≥ 4) e registra a escolha final no `37`.
 */
const DEFAULTS_POR_KIND: Record<ActivityKindSeed, { skillIds: string[]; subjectId: string; lessonId?: string; minutes: number; reason: string }> = {
  aula: { skillIds: ["mat:porcentagem-conceito"], subjectId: "mat", lessonId: "porcentagem-valor", minutes: 3, reason: "nova-habilidade" },
  pratica: { skillIds: ["mat:porcentagem-conceito"], subjectId: "mat", minutes: 2, reason: "consolidar" },
  revisao: { skillIds: ["mat:porcentagem-conceito"], subjectId: "mat", minutes: 2, reason: "revisao-devida" },
  desafio: { skillIds: ["mat:porcentagem-conceito"], subjectId: "mat", minutes: 2, reason: "desafio" },
  checkpoint: { skillIds: ["mat:porcentagem-conceito"], subjectId: "mat", minutes: 4, reason: "checkpoint" },
  legado: { skillIds: ["por:crase-regra-basica"], subjectId: "red", lessonId: "crase-01-a-regra-de-ouro", minutes: 3, reason: "nova-habilidade" },
  reforco: { skillIds: ["mat:porcentagem-conceito"], subjectId: "mat", minutes: 3, reason: "reforco-erros" },
};

export interface AtividadeSeed {
  id: string;
  kind: ActivityKindSeed;
  skillIds: string[];
  subjectId: string;
  lessonId?: string;
  estimatedMinutes: number;
  reasons: string[];
  score: number;
  scoreBreakdown: Record<string, number>;
  targetP?: number;
  itemIds?: string[];
  startedAt?: string;
}

/**
 * Uma atividade planejada com a forma que o motor de verdade gravaria.
 * Ids determinísticos: o 1º de cada `kind` é `atv-test-<kind>`, os seguintes
 * `atv-test-<kind>-2`, `-3`… (`atv-test-pratica` é o id que `journey.spec.ts` usa).
 */
export function atividadeSeed(kind: ActivityKindSeed, id: string, over: Partial<AtividadeSeed> = {}): AtividadeSeed {
  const d = DEFAULTS_POR_KIND[kind];
  const a: AtividadeSeed = {
    id,
    kind,
    skillIds: d.skillIds,
    subjectId: d.subjectId,
    estimatedMinutes: d.minutes,
    reasons: [d.reason],
    score: 1,
    scoreBreakdown: {},
    ...(d.lessonId ? { lessonId: d.lessonId } : {}),
    ...(kind === "pratica" || kind === "revisao" || kind === "desafio" || kind === "reforco" ? { targetP: 0.7 } : {}),
  };
  return { ...a, ...over };
}

/**
 * Usuário onboarded com `committed` exatamente com as atividades pedidas (3
 * bastam para `ensurePlan` não substituir o seed — `committed.length ===
 * COMMITTED_SIZE` e `planVersion` em dia).
 * `over` (por posição) troca campos de uma atividade: `comAtividades(["aula"], { 0: { lessonId: "…" } })`.
 */
export function comAtividades(
  kinds: ActivityKindSeed[],
  over: Record<number, Partial<AtividadeSeed>> = {},
  base: EstadoSeed = USUARIO_ONBOARDED,
): EstadoSeed {
  const vistos: Partial<Record<ActivityKindSeed, number>> = {};
  const committed = kinds.map((kind, i) => {
    const n = (vistos[kind] = (vistos[kind] ?? 0) + 1);
    const id = n === 1 ? `atv-test-${kind}` : `atv-test-${kind}-${n}`;
    return atividadeSeed(kind, id, over[i]);
  });
  const learning = (base.learning as Record<string, unknown> | undefined) ?? {};
  return {
    ...base,
    learning: {
      ...learning,
      journey: {
        committed,
        upcoming: [],
        history: [],
        activeActivity: null,
        sinceCheckpoint: 0,
        lastCheckpointDate: null,
        planVersion: PLAN_VERSION_ATUAL,
      },
    },
  };
}

/* ---------------------------------------------------------------- conclusões */

/** Conclusão de lição LEGADA de redação: grava em `progress.lessons` (não em `learning.completedLessons`). */
export function comLicaoLegadaConcluida(lessonId: string, base: EstadoSeed = USUARIO_ONBOARDED, completedAt = "2026-09-20T12:00:00.000Z"): EstadoSeed {
  const progress = (base.progress as Record<string, unknown> | undefined) ?? {};
  const lessons = (progress.lessons as Record<string, unknown> | undefined) ?? {};
  return {
    ...base,
    progress: { ...progress, lessons: { ...lessons, [lessonId]: { lessonId, stars: 3, bestPct: 100, completedAt } } },
  };
}

/** Conclusão de aula (autoral OU gerada): grava em `learning.completedLessons`. */
export function comAulaConcluida(lessonId: string, completedAt: string, base: EstadoSeed = USUARIO_ONBOARDED): EstadoSeed {
  const learning = (base.learning as Record<string, unknown> | undefined) ?? {};
  const completed = (learning.completedLessons as Record<string, unknown> | undefined) ?? {};
  return {
    ...base,
    learning: {
      ...learning,
      completedLessons: { ...completed, [lessonId]: { version: 1, completedAt, stars: 3, bestPct: 100 } },
    },
  };
}

/* --------------------------------------------------------------- nivelamento */

/**
 * Placement `concluido` SEM `appliedAt` — o estado em que ficou toda conta que
 * terminou o nivelamento desde 28/09 (bug C1: fecha o status mas nunca aplica
 * os priors). Itens diagnósticos REAIS de matemática (área MT, pacote `mat`),
 * 2 certos e 2 errados, com θ̂/SE plausíveis. `appliedAt` propositalmente ausente.
 */
export function comPlacementConcluidoNaoAplicado(base: EstadoSeed = USUARIO_ONBOARDED): EstadoSeed {
  const itemIds = [
    "gen:mat:area-perimetro-figuras-planas:9ce919a9",
    "gen:mat:equacao-primeiro-grau:8e5bd15c",
    "gen:mat:area-perimetro-figuras-planas:889b7454",
    "gen:mat:area-perimetro-figuras-planas:733f794d",
  ];
  const certo = [true, false, true, false];
  const learning = (base.learning as Record<string, unknown> | undefined) ?? {};
  return {
    ...base,
    learning: {
      ...learning,
      placement: {
        status: "concluido",
        startedAt: "2026-09-28T10:00:00.000Z",
        finishedAt: "2026-09-28T10:08:00.000Z",
        seed: "plc-seed-e2e",
        areas: {
          MT: {
            itemIds,
            responses: itemIds.map((itemId, i) => ({ itemId, correct: certo[i], dontKnow: false })),
            theta: -0.3,
            se: 0.8,
            done: true,
          },
        },
      },
    },
  };
}

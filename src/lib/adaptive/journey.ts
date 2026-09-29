/**
 * Orquestração da jornada (docs/30 §14, Fase 12 do docs/31 F12.1) — funções
 * PURAS sobre `AppState` + `PlannedActivity`. Content-aware de propósito
 * (chama `planWithFallback`, que importa taxonomia/itens) — por isso NUNCA
 * é importado por `store.ts` (mesma regra da Fase 5/7/8, guardada por
 * `store-bundle-boundary.test.ts`). Quem chama isto (uma tela/hook que já
 * paga o custo do import de conteúdo) pega o resultado e grava no store via
 * as ações "burras" (`commitPlan`, `setActiveActivity`, ...) — que só
 * armazenam dados prontos, nunca decidem nada sozinhas.
 */
import { planWithFallback } from "./index";
import { materiasPermitidas } from "./planner";
import { PLANNER_VERSION } from "./constants";
import type { PlannedActivity } from "./types";
import { IDS_AULAS_GERADAS } from "@/content/curriculum-tree";
import { phaseById } from "@/content/microlicoes";
import { SKILL_MAP } from "@/content/taxonomy";
import { FEATURES } from "@/lib/features";
import type { AppState } from "@/lib/store";

export interface EnsurePlanResult {
  committed: PlannedActivity[];
  upcoming: PlannedActivity[];
  fallback: boolean;
}

const COMMITTED_SIZE = 3;
const UPCOMING_SIZE = 5;

/**
 * Uma atividade INICIADA: tem `startedAt` ou é a `activeActivity` (a cópia em
 * `committed` não carrega `startedAt` — quem o grava é `startJourneyActivity`
 * em `activeActivity`). Iniciada nunca é invalidada por foco/conclusão pelo
 * replano (docs/36 RF-8): a sincronização/conclusão é quem a tira.
 */
function estaIniciada(a: PlannedActivity, s: Pick<AppState, "learning">): boolean {
  return Boolean(a.startedAt) || s.learning.journey.activeActivity?.id === a.id;
}

/**
 * Identidade de uma atividade na fila (docs/36 A2): MESMO tipo + MESMA aula
 * alvo (quando há `lessonId`) ou MESMA habilidade alvo. O `id` não serve: ele
 * depende da posição no plano (`atv-<data>-<hash da posição>`), então a mesma
 * aula/prática volta com outro `id` em outra posição. `checkpoint` é uma só na fila (não tem habilidade nem aula).
 */
export function identidadeDaAtividade(a: PlannedActivity): string {
  if (a.kind === "checkpoint") return "checkpoint";
  if (a.lessonId) return `${a.kind}:L:${a.lessonId}`;
  const skill = a.skillIds[0];
  return skill ? `${a.kind}:S:${skill}` : `${a.kind}:I:${a.id}`;
}

/**
 * A fila que o aluno vê repete alguma atividade da parte de REPOSIÇÃO (`upcoming`)?
 * Só olha o que o motor gera: repetição dentro de `upcoming` ou de `upcoming`
 * contra `committed`. As comprometidas nunca são reescritas entre si (RF-8:
 * ficam na mesma ordem, com o que o aluno já viu).
 */
export function temAtividadeRepetida(committed: PlannedActivity[], upcoming: PlannedActivity[]): boolean {
  const vistas = new Set(committed.map(identidadeDaAtividade));
  for (const a of upcoming) {
    const chave = identidadeDaAtividade(a);
    if (vistas.has(chave)) return true;
    vistas.add(chave);
  }
  return false;
}

/**
 * Tira de `candidatas` as que repetem uma identidade já presente em `jaNaFila`
 * (as comprometidas mantidas, inclusive a INICIADA, que nunca sai — RF-8) ou
 * repetida dentro da própria lista. Preserva a ORDEM (vence a primeira).
 */
export function semAtividadesRepetidas(
  candidatas: PlannedActivity[],
  jaNaFila: PlannedActivity[] = [],
): PlannedActivity[] {
  const vistas = new Set(jaNaFila.map(identidadeDaAtividade));
  const saida: PlannedActivity[] = [];
  for (const a of candidatas) {
    const chave = identidadeDaAtividade(a);
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    saida.push(a);
  }
  return saida;
}

/**
 * `isStillValid` (docs/36 RF-8, T-02.7) — a comprometida ainda faz sentido?
 * Falso se: (1) a matéria da habilidade saiu do foco efetivo (`prefs.studyFocus`/
 * `focusSession`); (2) a aula não resolve em lugar nenhum (`phaseById` nem
 * `IDS_AULAS_GERADAS`); (3) lição legada já concluída em `progress.lessons`;
 * (4) `aula` NÃO iniciada cuja aula já consta em `completedLessons` (feita pelo
 * mapa). `reforco` aponta de propósito pra aula já concluída — nunca é
 * invalidado por isso. Atividade INICIADA é sempre válida aqui: "a iniciada nunca
 * sai do topo por replano" (RF-8) — quem a tira é a conclusão/sincronização
 * (interpretação registrada no docs/37, T-02.7).
 */
export function isStillValid(
  a: PlannedActivity,
  s: Pick<AppState, "prefs" | "learning" | "progress">,
  today: string,
): boolean {
  if (estaIniciada(a, s)) return true;

  const skillId = a.skillIds[0];
  if (skillId) {
    const materia = SKILL_MAP[skillId]?.subjectId ?? a.subjectId;
    if (materia && !materiasPermitidas(s, today).has(materia)) return false;
  }

  if (a.lessonId && (a.kind === "aula" || a.kind === "reforco")) {
    if (!phaseById(a.lessonId) && !IDS_AULAS_GERADAS.has(a.lessonId)) return false;
  }
  if (a.kind === "legado" && a.lessonId && s.progress.lessons?.[a.lessonId]) return false;
  if (a.kind === "aula" && a.lessonId && s.learning.completedLessons[a.lessonId]) return false;
  return true;
}

/**
 * `ensurePlan` (§14 do docs/30; contrato de reposição docs/36 RF-8). Repor
 * preenche SÓ as vagas: as comprometidas ainda válidas ficam na MESMA ordem e a
 * iniciada nunca sai do topo. Substituem tudo (exceto a iniciada): aplicação do
 * nivelamento (via `invalidateJourneyPlan`), mudança de foco (`forceReplan`),
 * `PLANNER_VERSION` nova, e comprometida inválida (essa só sai ela mesma).
 * Devolve `null` quando NADA precisa mudar — o chamador não regrava o estado à
 * toa (evita replanejar a cada render).
 */
export function ensurePlan(
  s: Pick<AppState, "prefs" | "learning" | "progress">,
  today: string,
  seed: string,
  opts: {
    /** Mudança de foco descarta comprometidas fora do novo escopo (docs/30 §15) mesmo com `committed` cheio e `planVersion` em dia — quem chama (a tela, ao detectar que a assinatura de foco persistida difere da atual) passa `true`. */
    forceReplan?: boolean;
  } = {},
): EnsurePlanResult | null {
  const { committed, planVersion, activeActivity: ativa } = s.learning.journey;
  const versaoVelha = planVersion !== PLANNER_VERSION;
  const invalida = committed.some((a) => !isStillValid(a, s, today));
  // A fila que o aluno vê é `committed` + `upcoming`: repetição em qualquer das duas (estado gravado
  // por versão anterior, achado A2) também pede replano.
  const repetida = temAtividadeRepetida(committed, s.learning.journey.upcoming);
  const precisaReplanejar =
    opts.forceReplan || committed.length < COMMITTED_SIZE || versaoVelha || invalida || repetida;
  if (!precisaReplanejar) return null;

  // Pede o dobro do que cabe na fila: o planner não simula a conclusão dentro do plano, então a mesma
  // atividade pode voltar em posições não adjacentes (D-28); depois de tirar as repetições, o corte
  // em 3 + 5 ainda sai cheio. Sem repetição, os 8 primeiros são idênticos aos de um plano de 8.
  const plano = planWithFallback(s, today, seed, {
    n: (COMMITTED_SIZE + UPCOMING_SIZE) * 2,
    checkpointsHabilitado: FEATURES.checkpointsTrilha,
  });

  const substituiTudo = Boolean(opts.forceReplan) || versaoVelha;
  const base: PlannedActivity[] = substituiTudo
    ? ativa && isStillValid(ativa, s, today)
      ? [ativa]
      : []
    : committed.filter((a) => isStillValid(a, s, today));
  const novas = plano.activities.filter(
    (p) => !base.some((b) => b.skillIds[0] === p.skillIds[0] && b.kind === p.kind),
  );
  const fila = [...base, ...semAtividadesRepetidas(novas, base)];
  const novoCommitted = fila.slice(0, COMMITTED_SIZE);
  const novoUpcoming = fila.slice(COMMITTED_SIZE, COMMITTED_SIZE + UPCOMING_SIZE);

  /**
   * Guarda contra loop de commit (achado real, F12.5): um foco muito
   * estreito (ex.: uma matéria só, poucas habilidades elegíveis) pode fazer
   * o motor nunca conseguir preencher os 3 slots de `committed` — sem essa
   * checagem de CONTEÚDO, `committed.length < COMMITTED_SIZE` continuaria
   * `true` pra sempre, e cada replano geraria um array NOVO (referência
   * diferente) mesmo com o MESMO conteúdo, fazendo quem chama (efeito
   * reativo em `trilha.tsx`) reagir de novo indefinidamente. Só pula o
   * commit quando o conteúdo é idêntico E `planVersion` já está em dia (uma
   * versão desatualizada sempre commita ao menos uma vez).
   */
  const semMudanca =
    !versaoVelha &&
    novoCommitted.length === committed.length &&
    novoCommitted.every((a, i) => a.id === committed[i]?.id) &&
    novoUpcoming.length === s.learning.journey.upcoming.length &&
    novoUpcoming.every((a, i) => a.id === s.learning.journey.upcoming[i]?.id);
  if (semMudanca) return null;

  return { committed: novoCommitted, upcoming: novoUpcoming, fallback: plano.fallback };
}

export type NavigationTarget =
  | { kind: "aula"; lessonId: string }
  | { kind: "legado"; lessonId: string }
  | { kind: "atividade"; activityId: string };

/** Pra onde navegar ao iniciar UMA atividade (§14.4 pseudocódigo "navegar:"). */
export function navigationTargetFor(activity: PlannedActivity): NavigationTarget {
  if ((activity.kind === "aula" || activity.kind === "reforco") && activity.lessonId) {
    return { kind: "aula", lessonId: activity.lessonId };
  }
  if (activity.kind === "legado" && activity.lessonId) {
    return { kind: "legado", lessonId: activity.lessonId };
  }
  return { kind: "atividade", activityId: activity.id };
}

/** Destino de navegação de uma atividade (rota + params) — o formato que `<Link>` aceita. */
export type ActivityHref =
  | { to: "/learn/$lessonId"; params: { lessonId: string } }
  | { to: "/redacao/$licaoId"; params: { licaoId: string } }
  | { to: "/atividade/$activityId"; params: { activityId: string } };

/**
 * Rota de uma atividade planejada (docs/36 T-06.1) — UM só lugar para o card
 * "Sessão de hoje", o nó atual do caminho e o "Começar" do resultado do
 * nivelamento (RF-1). Quem navega por aula/legado (`/learn`, `/redacao`)
 * também chama `startJourneyActivity` antes de sair (`iniciaAoNavegar`).
 */
export function hrefForActivity(activity: PlannedActivity): ActivityHref {
  const target = navigationTargetFor(activity);
  if (target.kind === "aula") return { to: "/learn/$lessonId", params: { lessonId: target.lessonId } };
  if (target.kind === "legado") return { to: "/redacao/$licaoId", params: { licaoId: target.lessonId } };
  return { to: "/atividade/$activityId", params: { activityId: target.activityId } };
}

/**
 * Aula/legado terminam fora da jornada e só avisam de volta via
 * `syncJourneyWithCompletions`: marcar o início (`startJourneyActivity`) antes
 * de sair é o que deixa a sincronização tirar a atividade da fila. Dinâmica
 * (`/atividade`) só navega: a rota é a dona da seleção de itens e do início
 * da tentativa (docs/36 T-02.1).
 */
export function iniciaAoNavegar(activity: PlannedActivity): boolean {
  return navigationTargetFor(activity).kind !== "atividade";
}

/**
 * Uma atividade está PRONTA para retomar (docs/36 RF-2, T-02.1): dinâmica só com
 * ≥ 2 `itemIds` já escolhidos (a rota `/atividade/$activityId` é a única
 * proprietária dessa seleção); aula/legado/reforço com aula própria só precisam
 * de `lessonId`.
 */
export function isReadyToResume(a: PlannedActivity): boolean {
  return needsItemSelection(a) ? (a.itemIds?.length ?? 0) >= 2 : Boolean(a.lessonId);
}

/** Uma atividade precisa de itens escolhidos na hora (prática/revisão/desafio/checkpoint/reforço sem aula própria). */
export function needsItemSelection(activity: PlannedActivity): boolean {
  if (activity.kind === "reforco") return !activity.lessonId;
  return activity.kind === "pratica" || activity.kind === "revisao" || activity.kind === "desafio" || activity.kind === "checkpoint";
}

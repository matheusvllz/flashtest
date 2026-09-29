/**
 * Planejador — sequência + proporção + restrições (docs/30 §11.5, Fase 8 do
 * docs/31 F8.5). Pura: recebe `AppState` por parâmetro, nunca lê relógio,
 * semente injetada (`planNext(..., seed)`) — mesma entrada = mesmo plano.
 *
 * Simplificação registrada (docs/32): a regra "toda aula de X é seguida por
 * prática de X em até 2 posições" (§11.4) é implementada como um BÔNUS forte
 * de score pro candidato de prática de X na posição seguinte (empurra o
 * argmax pra escolher isso na prática), não como uma restrição rígida que
 * força a escolha — mais simples de raciocinar e testar, sem abrir mão do
 * efeito prático (a prática de X quase sempre vence a próxima posição).
 */
import { activeSkills, SKILL_MAP, SUBJECT_AREA, type EnemArea } from "@/content/taxonomy";
import { SUBJECT_MAP } from "@/data/subjects";
import type { AppState } from "@/lib/store";
import type { PlannedActivity, ActivityKind, ReasonCode } from "./types";
import { aulaConcluidaDaHabilidade, candidateForSkill, legacyCandidateForSkill, lessonIdsForSkill, type Candidate } from "./candidates";
import { classifySkill, prerequisiteSatisfied, type SkillClassification } from "./classify";
import { scoreCandidate, type MateriaPeso } from "./scoring";
import { deveInserirCheckpoint } from "./checkpoint";
import { recordTrace } from "./trace";
import { mastery } from "./model";
import { confidence } from "./confidence";
import { ALGO_VERSION } from "./constants";
import {
  BONUS_DEFICIT,
  DESAFIO_MAX_JANELA,
  ITEM_SEGUNDOS_PADRAO,
  JANELA_EQUILIBRIO,
  JANELA_MIX,
  MAX_MESMA_MATERIA_SEGUIDAS,
  MIX_ALVO,
  PLANO_N,
  REVISAO_ATRASO_DIAS,
  REVISAO_MAX_ATRASO,
  REVISAO_MIN_JANELA,
  REVISAO_MIN_JANELA_ATRASO,
  REVISAO_TETO_JANELA,
} from "./constants";

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function diasEntreISO(a: string, b: string): number {
  const msA = new Date(`${a}T00:00:00Z`).getTime();
  const msB = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((msB - msA) / 86_400_000);
}

/** §11.5, `bucket(kind)`. */
function bucket(kind: ActivityKind): "atual" | "revisao" | "desafio" | null {
  if (kind === "aula" || kind === "pratica" || kind === "reforco" || kind === "legado") return "atual";
  if (kind === "revisao") return "revisao";
  if (kind === "desafio") return "desafio";
  return null; // checkpoint fica fora do mix
}

interface SlotEntry {
  skillId: string;
  subjectId: string;
  kind: ActivityKind;
}

/** Matérias permitidas pelo foco (§11.5 algoritmo). */
export function materiasPermitidas(s: Pick<AppState, "prefs" | "learning">, today: string): Set<string> {
  const fs = s.learning.focusSession;
  if (fs && fs.expiresOn >= today) return new Set(fs.subjectIds);
  const focus = s.prefs.studyFocus;
  if (focus.mode === "todas") return new Set(activeSkills().map((sk) => sk.subjectId));
  if (focus.mode === "materias") return new Set(focus.subjectIds);
  // "areas": todas as matérias cujas áreas batem
  const materias = new Set<string>();
  for (const sk of activeSkills()) {
    const area = SUBJECT_AREA[sk.subjectId];
    if (area && focus.areas.includes(area)) materias.add(sk.subjectId);
  }
  return materias;
}

function pesoMateriaDe(subjectId: string, s: Pick<AppState, "prefs">): MateriaPeso {
  const nome = SUBJECT_MAP[subjectId]?.name ?? subjectId;
  if (s.prefs.difficultSubjects.includes(nome)) return "prioritaria";
  if (s.prefs.easySubjects.includes(nome)) return "vaiBem";
  return "normal";
}

/**
 * Estimativa de minutos pra exibição do plano (§11.9). Aula usa um valor
 * padrão curto — o custo real (`estimatedTeachingSeconds`/`Practice` da
 * lição) só importa pra Fase 12 (tela da jornada); aqui o motor só ordena
 * candidatos, não soma orçamento de tempo do dia.
 */
function estimatedMinutesFor(cand: Candidate): number {
  if (cand.lessonId) return 2;
  return Math.round((cand.itemCount * ITEM_SEGUNDOS_PADRAO) / 60) || 1;
}

function reasonsFor(kind: ActivityKind, classification: ClassifyLike, diasAtraso: number, equilibrioForte: boolean): ReasonCode[] {
  const reasons: ReasonCode[] = [];
  if (kind === "aula" && classification.state === "NOVA") reasons.push("nova-habilidade");
  else if (kind === "pratica" && classification.state === "NOVA") reasons.push("confirmar-fundamento");
  else if (kind === "pratica" && classification.state === "EM_APRENDIZADO") reasons.push("consolidar");
  else if (kind === "revisao") reasons.push(diasAtraso > 3 ? "revisao-atrasada" : "revisao-devida");
  else if (kind === "desafio") reasons.push("desafio");
  else if (kind === "reforco") {
    if (classification.reasons.includes("erros-distintos")) reasons.push("reforco-erros");
    else if (classification.reasons.includes("nao-sei-recente")) reasons.push("reforco-nao-sei");
    else reasons.push("reforco-ajuda");
  } else if (kind === "legado") reasons.push(classification.state === "NOVA" ? "nova-habilidade" : "consolidar");
  else if (kind === "checkpoint") reasons.push("checkpoint");
  if (equilibrioForte && !reasons.includes("equilibrio-area")) reasons.push("equilibrio-area");
  return reasons.length ? reasons : ["consolidar"];
}

interface ClassifyLike {
  state: SkillClassification;
  reasons: string[];
}

export interface PlanNextOptions {
  n?: number;
  checkpointsHabilitado?: boolean;
  /** `/debug` liga isto pra ver o "por quê" de cada escolha (docs/30 §27) — desligado por padrão pra `planNext` continuar um cálculo sem efeito colateral em testes/produção normal. */
  gravarTrace?: boolean;
}

/**
 * `planNext` (§11.5). Lança em situações verdadeiramente inesperadas (bug de
 * conteúdo) — `planWithFallback` (fallback.ts) é quem envolve isto em
 * try/catch pro aluno nunca ficar sem plano.
 */
export function planNext(
  s: Pick<AppState, "prefs" | "learning" | "progress">,
  today: string,
  seed: string,
  opts: PlanNextOptions = {},
): PlannedActivity[] {
  const n = opts.n ?? PLANO_N;
  const checkpointsHabilitado = opts.checkpointsHabilitado ?? false;
  const permitidas = materiasPermitidas(s, today);
  const skills = activeSkills().filter((sk) => permitidas.has(sk.subjectId));

  const janelaHistorico: SlotEntry[] = s.learning.journey.history.slice(-JANELA_MIX * 2).map((h) => ({
    skillId: h.skillIds[0] ?? "",
    subjectId: h.subjectId,
    kind: h.kind,
  }));

  const seqBase = s.learning.journey.seq ?? s.learning.journey.history.length;
  const plano: PlannedActivity[] = [];
  const planoSlots: SlotEntry[] = [];
  /** Desafios vindos do sinal do checkpoint neste plano — máx. 1 (docs/36 T-04.4). */
  let desafiosPorSinalNoPlano = 0;
  let guard = 0;

  while (plano.length < n && guard < n * 20) {
    guard++;
    const janelaMaisPlano = [...janelaHistorico, ...planoSlots];
    const checkpointJanela = s.learning.journey.history.slice(-JANELA_MIX).map((h) => ({
      skillIds: h.skillIds,
      completedAt: h.completedAt,
    }));
    if (deveInserirCheckpoint(s.learning, checkpointJanela, today, checkpointsHabilitado)) {
      const id = `atv-${today}-${fnv1a(`${seed}:checkpoint:${plano.length}:${seqBase}`)}`;
      const atividade: PlannedActivity = {
        id,
        kind: "checkpoint",
        skillIds: [],
        subjectId: "",
        itemIds: undefined,
        estimatedMinutes: 5,
        reasons: ["checkpoint"],
        score: 1,
        scoreBreakdown: {},
      };
      plano.push(atividade);
      planoSlots.push({ skillId: "", subjectId: "", kind: "checkpoint" });
      continue;
    }

    // Candidatos elegíveis desta rodada.
    type Scored = { cand: Candidate; classification: ClassifyLike; score: number; breakdown: ReturnType<typeof scoreCandidate>["breakdown"]; diasAtraso: number };
    const candidatos: Scored[] = [];

    const anterior = planoSlots[planoSlots.length - 1] ?? janelaMaisPlano[janelaMaisPlano.length - 1] ?? null;
    const penultima = planoSlots[planoSlots.length - 2] ?? janelaMaisPlano[janelaMaisPlano.length - 2] ?? null;
    const materiaAnterior = anterior?.subjectId || null;
    const materiaPenultima = penultima?.subjectId || null;

    const areasRecentes: EnemArea[] = janelaMaisPlano
      .slice(-JANELA_EQUILIBRIO)
      .map((e) => SUBJECT_AREA[e.subjectId])
      .filter((a): a is EnemArea => Boolean(a));
    const areasAtivasNoFoco = new Set([...permitidas].map((sub) => SUBJECT_AREA[sub]).filter(Boolean));
    const fatiaAlvoArea = areasAtivasNoFoco.size > 0 ? 1 / areasAtivasNoFoco.size : 0;

    for (const sk of skills) {
      const prereqsSatisfeitos = sk.prerequisites.every((pid) => {
        const p = SKILL_MAP[pid];
        if (!p) return true;
        return prerequisiteSatisfied(p, s.learning, lessonIdsForSkill(pid), today);
      });
      // Aula (autoral OU gerada) concluída conta (docs/36 RF-5, C4b).
      const aulaConcluida = aulaConcluidaDaHabilidade(sk.id, s.learning.completedLessons);
      const classification = classifySkill(sk, s.learning, today, {
        temConteudo: true,
        aulaConcluida,
        prereqsSatisfeitos,
      });
      if (classification.state === "IGNORAR" || classification.state === "BLOQUEADA") continue;

      const principal = candidateForSkill(sk, classification.state, s.learning, today, {
        sinalDeDesafioPermitido: desafiosPorSinalNoPlano < 1,
      });
      const legado = legacyCandidateForSkill(sk.id, classification.state, s.progress.lessons ?? {});
      for (const cand of [principal, legado]) {
        if (!cand) continue;
        // Restrição dura: nunca a mesma habilidade duas vezes seguidas, EXCETO aula→prática da mesma.
        if (anterior && anterior.skillId === sk.id) {
          const excecao = anterior.kind === "aula" && cand.kind === "pratica";
          if (!excecao) continue;
        }
        // Restrição dura: no máximo N atividades seguidas da mesma matéria —
        // sem sentido (e mata o plano por inteiro) quando o foco só permite
        // UMA matéria: não há "outra" pra variar (docs/30 §15, foco).
        if (permitidas.size > 1) {
          const ultimasMesmaMateria = [anterior, penultima].filter((e) => e && e.subjectId === sk.subjectId).length;
          if (ultimasMesmaMateria >= MAX_MESMA_MATERIA_SEGUIDAS) continue;
        }
        // Restrição dura: desafio no máximo DESAFIO_MAX_JANELA a cada 10.
        if (cand.kind === "desafio") {
          const desafiosNaJanela = janelaMaisPlano.slice(-JANELA_MIX).filter((e) => e.kind === "desafio").length;
          if (desafiosNaJanela >= DESAFIO_MAX_JANELA) continue;
        }

        const evidence = s.learning.skillEvidence[sk.id];
        const schedule = s.learning.reviewSchedule[sk.id];
        const diasAtraso = classification.state === "DEVIDA" && schedule ? Math.max(0, diasEntreISO(schedule.dueDate, today)) : 0;

        const { score, breakdown } = scoreCandidate({
          skill: sk,
          allSkillsOfSubject: skills.filter((s2) => s2.subjectId === sk.subjectId),
          state: classification.state,
          entry: s.learning.skillModel[sk.id],
          evidence,
          today,
          diasAtraso,
          pesoMateria: pesoMateriaDe(sk.subjectId, s),
          areasRecentes,
          fatiaAlvoArea,
          materiaAnterior,
          materiaPenultima,
        });

        let scoreFinal = score;
        // Bônus de déficit de proporção (§11.5).
        const b = bucket(cand.kind);
        if (b) {
          const janela10 = janelaMaisPlano.slice(-JANELA_MIX);
          const total = janela10.length || 1;
          const fatiaAtual = janela10.filter((e) => bucket(e.kind) === b).length / total;
          const revisaoAtrasada = classification.state === "DEVIDA" && diasAtraso > 3;
          const alvo = b === "revisao" && revisaoAtrasada ? REVISAO_MAX_ATRASO : MIX_ALVO[b];
          scoreFinal += BONUS_DEFICIT * Math.max(0, alvo - fatiaAtual);
        }
        // Bônus forte pra prática seguir a aula da MESMA habilidade (ver nota de simplificação no topo).
        if (anterior && anterior.kind === "aula" && anterior.skillId === sk.id && cand.kind === "pratica") {
          scoreFinal += 0.5;
        }

        candidatos.push({ cand, classification, score: scoreFinal, breakdown, diasAtraso });
      }
    }

    if (candidatos.length === 0) break; // nada elegível — quem chama decide (planWithFallback ou "infinita" vazia, Fase 12).

    const porScore = (x: Scored, y: Scored) => {
      if (y.score !== x.score) return y.score - x.score;
      if (x.cand.skillId !== y.cand.skillId) return x.cand.skillId < y.cand.skillId ? -1 : 1;
      return fnv1a(`${seed}:${x.cand.skillId}`) - fnv1a(`${seed}:${y.cand.skillId}`);
    };
    candidatos.sort(porScore);

    // Cota mínima de revisão (docs/36 T-04.3, G4/RP-3). O score sozinho deixa a
    // revisão perder para NOVA quando o atraso é pequeno (necessidade 0,8 × 0,3
    // contra `(1−M)` × 0,3 + urgência baixa) — com backlog, o aluno passava
    // janelas inteiras sem revisar. Regra: com revisão devida disponível e
    // menos que o mínimo na janela, esta posição recebe a melhor revisão,
    // desde que a anterior não tenha sido revisão (intercala; nunca 2 forçadas
    // seguidas). Teto simétrico (`REVISAO_TETO_JANELA`, 35 %): com várias revisões
    // muito atrasadas o score sozinho chega a 4 por janela. Sem revisão devida, o
    // plano segue 100 % "atual" (iniciante).
    let escolhido = candidatos[0];
    const revisoesDevidas = candidatos.filter((c) => c.cand.kind === "revisao");
    if (revisoesDevidas.length > 0) {
      // A janela de 10 que TERMINA nesta posição = as 9 anteriores + esta: se as 9 já
      // têm o mínimo, a janela fecha OK mesmo sem revisão aqui; se não têm, esta posição
      // precisa ser revisão (é o que garante "toda janela de 10 tem ≥ mínimo").
      const janela = janelaMaisPlano.slice(-(JANELA_MIX - 1));
      const revisoesNaJanela = janela.filter((e) => e.kind === "revisao").length;
      const atrasada = revisoesDevidas.some((c) => c.diasAtraso > REVISAO_ATRASO_DIAS);
      const minimo = atrasada ? REVISAO_MIN_JANELA_ATRASO : REVISAO_MIN_JANELA;
      const ultima = janelaMaisPlano[janelaMaisPlano.length - 1] ?? null;
      if (revisoesNaJanela >= REVISAO_TETO_JANELA) {
        // Teto (RP-3, 35 %): sem estourar a janela — mas nunca esvazia o plano.
        const semRevisao = candidatos.find((c) => c.cand.kind !== "revisao");
        if (semRevisao && escolhido.cand.kind === "revisao") escolhido = semRevisao;
      } else if (revisoesNaJanela < minimo && ultima?.kind !== "revisao") {
        escolhido = revisoesDevidas[0]; // já ordenado por score
      }
    }
    const equilibrioForte = escolhido.breakdown.equilibrio > 0.15;
    // `seqBase` (docs/36 RF-7): contador monotônico da jornada — o id nunca colide
    // com uma atividade já concluída/descartada do mesmo dia, e continua estável
    // entre renders (só muda em conclusão/descarte).
    const id = `atv-${today}-${fnv1a(`${seed}:${escolhido.cand.skillId}:${plano.length}:${seqBase}`)}`;

    const atividade: PlannedActivity = {
      id,
      kind: escolhido.cand.kind,
      skillIds: [escolhido.cand.skillId],
      subjectId: escolhido.cand.subjectId,
      lessonId: escolhido.cand.lessonId,
      targetP: escolhido.cand.targetP,
      estimatedMinutes: estimatedMinutesFor(escolhido.cand),
      reasons: reasonsFor(escolhido.cand.kind, escolhido.classification, escolhido.diasAtraso, equilibrioForte),
      score: escolhido.score,
      scoreBreakdown: escolhido.breakdown as unknown as Record<string, number>,
    };
    plano.push(atividade);
    if (escolhido.cand.porSinalDeDesafio) desafiosPorSinalNoPlano++;
    planoSlots.push({ skillId: escolhido.cand.skillId, subjectId: escolhido.cand.subjectId, kind: escolhido.cand.kind });

    if (opts.gravarTrace) {
      const entry = s.learning.skillModel[escolhido.cand.skillId];
      recordTrace({
        activity: atividade,
        skillName: SKILL_MAP[escolhido.cand.skillId]?.name ?? escolhido.cand.skillId,
        mastery: entry ? mastery(entry) : null,
        confidence: entry ? confidence(entry, s.learning.skillEvidence[escolhido.cand.skillId], today).value : null,
        breakdown: escolhido.breakdown,
        targetP: escolhido.cand.targetP,
      });
    }
  }

  return plano;
}

export function planNextAsJourneyPlan(
  s: Pick<AppState, "prefs" | "learning" | "progress">,
  today: string,
  seed: string,
  opts: PlanNextOptions = {},
) {
  return {
    generatedAt: new Date().toISOString(),
    algoVersion: ALGO_VERSION,
    activities: planNext(s, today, seed, opts),
    fallback: false,
  };
}

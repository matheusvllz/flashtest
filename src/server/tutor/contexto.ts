/**
 * Contexto da Foca IA montado no servidor (spec 48 T-48.2.3; 46 §E.7.2, T-08.2; corrige B-101/IA-2).
 *
 * Texto livre do cliente no prompt: só as mensagens da conversa e, saneados (`dadoDoPerfil`), etapa, curso e
 * instituição do perfil. O resto:
 * - **questão em foco:** resolvida pelo `itemId` no índice de conteúdo; a correção é recalculada pelo gabarito;
 *   a ordem exibida (ordenar/parear) só é aceita se for uma permutação dos blocos reais;
 * - **perfil:** do `profile` no banco (sem o primeiro nome — 46 D-18);
 * - **desempenho:** contado no banco (`attempt`) e sequência pelo agregado oficial;
 * - **contexto pedagógico:** calculado com `buildPedagogicalContext` sobre o documento de planejamento sincronizado
 *   (números do motor; enunciados vêm do conteúdo, nunca do documento).
 * Sem conta (modo de demonstração), só a questão em foco.
 */
import { and, count, eq, gte, sql } from "drizzle-orm";
import { itemMetaOf } from "@/content/items";
import { SKILL_MAP } from "@/content/taxonomy";
import { QUESTIONS } from "@/data/questions";
import { SUBJECT_MAP } from "@/data/subjects";
import { checkAnswer } from "@/lib/lessons/define";
import { focusFromExercise } from "@/lib/lessons/tutor-focus";
import type { Exercise } from "@/lib/lessons/types";
import type { LearningState } from "@/lib/learning/types";
import { buildPedagogicalContext } from "@/lib/tutor-context";
import type { PedidoTutor } from "@/lib/tutor-contrato";
import type { TutorContext, TutorFocus } from "@/lib/tutor-prompt";
import type { Banco } from "../db/client";
import { attempt, learningDoc, profile } from "../db/schema";
import { exercicioDoItem } from "../estudo/conteudo";
import { agregadoDoAluno } from "../estudo/sincronizar";

/**
 * Texto do perfil que vai para o prompt (revisão L2): só letras, números e pontuação simples, uma linha, com teto.
 * Assim um campo do onboarding não vira instrução ("ignore as regras…" perde a força sem quebra de linha nem aspas).
 */
export function dadoDoPerfil(v: string | null | undefined, max: number): string {
  return (v ?? "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{N} .,()/'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const MESMOS = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join("\u0000") === [...b].sort().join("\u0000");

/** A ordem exibida só vale se for uma permutação dos blocos reais do exercício. */
function exibidosValidos(ex: Exercise, exibidos: string[] | undefined): string[] | undefined {
  if (!exibidos) return undefined;
  if (ex.type === "ordenar") return MESMOS(exibidos, ex.blocos) ? exibidos : undefined;
  if (ex.type === "parear") return MESMOS(exibidos, ex.pares.map((p) => p.b)) ? exibidos : undefined;
  return undefined;
}

function rotuloDoItem(itemId: string): { subjectName: string; topic: string; hint: string | null } {
  const q = QUESTIONS.find((x) => x.id === itemId);
  if (q) return { subjectName: q.subjectName, topic: q.topic, hint: q.hint };
  try {
    const skill = SKILL_MAP[itemMetaOf(itemId).skillIds[0] ?? ""];
    if (skill) {
      const materia = SUBJECT_MAP[skill.subjectId];
      const topico = materia?.topics.find((t: { id: string }) => t.id === skill.topicId)?.name ?? skill.name;
      return { subjectName: materia?.name ?? skill.subjectId, topic: topico, hint: null };
    }
  } catch {
    /* item sem metadados: rótulo genérico */
  }
  return { subjectName: itemId.includes(":") ? "Redação" : "ENEM", topic: "questão", hint: null };
}

/** Questão em foco a partir do pedido, ou `null` se o item não existe. */
export async function focoDoPedido(f: PedidoTutor["foco"]): Promise<TutorFocus | null> {
  if (!f) return null;
  const ex = await exercicioDoItem(f.itemId);
  if (!ex) return null;
  const exibidos = exibidosValidos(ex, f.exibidos);
  const resposta = f.respondeu ? f.resposta : null;
  const correta = resposta === null ? false : checkAnswer(ex, resposta, exibidos);
  const base = focusFromExercise(ex, resposta, "", "", "", 0, exibidos, correta);
  const r = rotuloDoItem(f.itemId);
  return { ...base, questionId: f.itemId, subjectName: r.subjectName, topic: r.topic, hint: r.hint ?? base.hint, answered: f.respondeu };
}

/** Frases de desempenho contadas no banco (a IA só as repete — regra de honestidade do prompt). */
async function desempenho(db: Banco, userId: string, agora: Date): Promise<string[]> {
  const desde = new Date(agora.getTime() - 30 * 86_400_000);
  const recentes = and(eq(attempt.userId, userId), gte(attempt.answeredAt, desde));
  const [total] = await db
    .select({ n: count(), certas: sql<number>`count(*) filter (where ${attempt.correct})` })
    .from(attempt)
    .where(recentes);
  const frases: string[] = [];
  const n = Number(total?.n ?? 0);
  if (n > 0) frases.push(`${Number(total?.certas ?? 0)} de ${n} questões corretas nos últimos 30 dias`);
  const materia = sql<string>`split_part(${attempt.skillIds}[1], ':', 1)`;
  const porMateria = await db
    .select({ m: materia, n: count(), certas: sql<number>`count(*) filter (where ${attempt.correct})` })
    .from(attempt)
    .where(recentes)
    .groupBy(materia)
    .orderBy(sql`count(*) desc`)
    .limit(4);
  for (const linha of porMateria) {
    const nome = SUBJECT_MAP[linha.m]?.name; // só matérias conhecidas: nada de texto do banco cru no prompt
    if (nome) frases.push(`${Number(linha.certas)}/${Number(linha.n)} em ${nome}`);
  }
  const ag = await agregadoDoAluno(db, userId);
  if (ag.sequencia > 0) frases.push(`sequência de ${ag.sequencia} dia(s)`);
  return frases;
}

function aprendizagemDoDocumento(doc: unknown): Pick<LearningState, "skillModel" | "skillEvidence" | "reviewSchedule" | "recentAttempts"> | null {
  const l = (doc as { learning?: Record<string, unknown> } | null)?.learning;
  if (!l || typeof l !== "object") return null;
  const objeto = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, never>) : {});
  const tentativas = Array.isArray(l.recentAttempts) ? (l.recentAttempts as Array<Record<string, unknown>>) : [];
  return {
    skillModel: objeto(l.skillModel),
    skillEvidence: objeto(l.skillEvidence),
    reviewSchedule: objeto(l.reviewSchedule),
    // Sem a ordem exibida guardada no documento: ela é texto do aparelho e iria para o prompt.
    recentAttempts: tentativas
      .slice(-200)
      .filter((a) => typeof a?.exerciseId === "string" && Array.isArray(a?.skillIds))
      .map((a) => ({ ...a, presentedOrder: undefined })) as unknown as LearningState["recentAttempts"],
  };
}

/** Contexto completo do prompt. `db`/`userId` nulos = sem conta (modo de demonstração). */
export async function montarContexto(db: Banco | null, userId: string | null, pedido: PedidoTutor, agora: Date, hoje: string): Promise<TutorContext> {
  const focus = await focoDoPedido(pedido.foco);
  const ctx: TutorContext = { firstName: "", targetInstitution: "", targetCourse: "", level: "", gaps: [], performance: [], focus, pedagogy: null, modo: pedido.modo };
  if (!db || !userId) return ctx;

  const [p] = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1);
  if (p) {
    ctx.level = dadoDoPerfil(p.level, 40);
    ctx.targetCourse = dadoDoPerfil(p.targetCourse, 80);
    ctx.targetInstitution = dadoDoPerfil(p.targetInstitution, 120);
  }
  ctx.performance = await desempenho(db, userId, agora);

  if (focus && pedido.foco) {
    const [d] = await db.select({ doc: learningDoc.doc }).from(learningDoc).where(eq(learningDoc.userId, userId)).limit(1);
    const aprendizagem = aprendizagemDoDocumento(d?.doc ?? null);
    if (aprendizagem) {
      try {
        const exames = Array.isArray(p?.examTargets) ? (p.examTargets as Array<{ examId?: unknown }>).filter((e) => typeof e?.examId === "string") : [];
        ctx.pedagogy = buildPedagogicalContext(aprendizagem, exames as { examId: string }[], pedido.foco.itemId, pedido.modo, hoje);
      } catch {
        ctx.pedagogy = null; // documento num formato inesperado: segue sem o contexto pedagógico
      }
    }
  }
  return ctx;
}

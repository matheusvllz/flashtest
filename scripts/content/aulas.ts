#!/usr/bin/env bun
/**
 * Aulas geradas (docs/31 F11.3, docs/30 §21.3) — orquestrador próprio que o
 * `run-stage.ts` deixou de fora ("montar MicroLessonV2 é um orquestrador
 * próprio"). As QUESTÕES da aula são itens já publicados, verificados às cegas
 * e revisados item a item daquela habilidade (escolhidos aqui,
 * deterministicamente); o LLM só escreve o ENSINO (intro, blocos, dica, recap)
 * alinhado a elas. Assim nenhuma questão de aula nasce sem verificação.
 *
 * Uso:
 *   bun scripts/content/aulas.ts preparar --dir=content-pipeline/lotes/aulas
 *   bun scripts/content/aulas.ts montar   --dir=content-pipeline/lotes/aulas   (lê _ensino-*.json, valida, escreve _aulas.json)
 *   bun scripts/content/aulas.ts publicar --dir=content-pipeline/lotes/aulas   (grava `lessons` nos arquivos do banco)
 */
import type { Exercise } from "@/lib/lessons/types";
import type { LessonBlock, LessonStep, MicroLessonV2, QuestionStepRole, StepDifficulty } from "@/lib/learning/types";
import type { ItemMeta } from "@/content/items/types";

export interface ItemPublicado {
  id: string;
  exercise: Exercise;
  meta: ItemMeta;
}

export interface QuestaoEscolhida {
  exerciseId: string;
  difficulty: StepDifficulty;
  role: QuestionStepRole;
}

/**
 * Dificuldade do passo é RELATIVA à aula (docs/25: progressão dentro da lição,
 * começa em 1, termina ≥ 2): distância até o item mais fácil escolhido. Se os
 * itens da habilidade estão todos no mesmo nível, a progressão é posicional
 * (primeira metade 1, segunda 2) — a ordem continua não decrescente.
 */
export function dificuldadeNaAula(d: number, minimo: number, idx: number, total: number): StepDifficulty {
  if (idx === 0) return 1;
  const relativa = Math.min(3, d - minimo + 1) as StepDifficulty;
  const posicional: StepDifficulty = idx >= Math.ceil(total / 2) ? 2 : 1;
  return Math.max(relativa, posicional) as StepDifficulty;
}
const sanitizar = (skillId: string) => skillId.replace(":", "-");
export const idDaAula = (skillId: string) => `aula-${sanitizar(skillId)}`;
export const idDoCapitulo = (skillId: string) => `gen-${sanitizar(skillId)}`;

/**
 * Escolhe as questões e os 2 itens de revisão de uma aula (validateLessonSteps:
 * 4-8 questões, dificuldade não decrescente começando em 1 com "checkpoint",
 * terminando ≥ 2; 2 de revisão distintos). Evita item diagnóstico (é do
 * nivelamento). `null` quando a habilidade ainda não tem itens suficientes.
 */
export function escolherQuestoes(itens: ItemPublicado[]): { questoes: QuestaoEscolhida[]; revisao: string[] } | null {
  const usaveis = itens
    .filter((i) => !i.meta.roles.includes("diagnostico") && i.exercise.type === "multipla-escolha")
    .sort((a, b) => a.meta.difficulty - b.meta.difficulty || a.id.localeCompare(b.id));
  if (usaveis.length < 6) return null;

  const alvoQuestoes = Math.min(5, usaveis.length - 2);
  // o mais fácil abre (checkpoint); o resto se espalha do mais fácil pro mais
  // difícil, reservando 2 pra revisão
  const questoes: ItemPublicado[] = [usaveis[0]];
  const resto = usaveis.slice(1);
  const passo = resto.length / (alvoQuestoes - 1);
  for (let k = 0; k < alvoQuestoes - 1; k++) questoes.push(resto[Math.min(resto.length - 1, Math.floor(k * passo + passo / 2))]);
  const unicos = [...new Map(questoes.map((q) => [q.id, q])).values()].sort(
    (a, b) => a.meta.difficulty - b.meta.difficulty || a.id.localeCompare(b.id),
  );
  const revisao = usaveis.filter((i) => !unicos.some((q) => q.id === i.id)).slice(0, 2).map((i) => i.id);
  if (unicos.length < 4 || revisao.length < 2) return null;

  return {
    questoes: unicos.map((q, idx) => ({
      exerciseId: q.id,
      difficulty: dificuldadeNaAula(q.meta.difficulty, unicos[0].meta.difficulty, idx, unicos.length),
      role: idx === 0 ? "checkpoint" : q.meta.difficulty >= 4 ? "desafio" : "pratica",
    })),
    revisao,
  };
}

export interface EnsinoGerado {
  skillId: string;
  title: string;
  objective: string;
  intro: { title: string; body: string };
  teach: LessonBlock[];
  tip?: { title?: string; body: string };
  recap: string;
}

/**
 * Monta a MicroLessonV2: intro → teach → 2 questões → teach → 2 questões →
 * (dica) → (teach) → resto das questões → recap — nunca mais de 3 questões
 * seguidas, ensino antes da primeira questão.
 */
export function montarAula(
  ensino: EnsinoGerado,
  escolha: { questoes: QuestaoEscolhida[]; revisao: string[] },
  base: { subjectId: string; topicId: string },
  agora: string,
): MicroLessonV2 {
  const q = escolha.questoes.map<LessonStep>((x) => ({ kind: "question", exerciseId: x.exerciseId, role: x.role, difficulty: x.difficulty }));
  const t = ensino.teach.map<LessonStep>((block) => ({ kind: "teach", block }));
  const steps: LessonStep[] = [{ kind: "intro", title: ensino.intro.title, body: ensino.intro.body }];
  steps.push(t[0], ...q.slice(0, 2));
  if (t[1]) steps.push(t[1]);
  steps.push(...q.slice(2, 4));
  if (ensino.tip) steps.push({ kind: "tip", title: ensino.tip.title, body: ensino.tip.body });
  if (t[2]) steps.push(t[2]);
  steps.push(...q.slice(4));
  steps.push({ kind: "recap", body: ensino.recap });
  return {
    id: idDaAula(ensino.skillId),
    version: 1,
    format: 2,
    subjectId: base.subjectId,
    topicId: base.topicId,
    chapterId: idDoCapitulo(ensino.skillId),
    title: ensino.title,
    objective: ensino.objective,
    skillIds: [ensino.skillId],
    prerequisiteLessonIds: [],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 90,
    estimatedPracticeSeconds: escolha.questoes.length * 45,
    reviewExerciseIds: escolha.revisao,
    recap: ensino.recap,
    sources: ["pipeline de conteúdo Foca (docs/31 F11.3): ensino gerado e revisado; questões = itens publicados e revisados"],
    reviewedAt: agora,
    steps,
  };
}

/** Checagens de texto que `validateLessonSteps` não faz (mesmas regras de `validate.ts` pros itens). */
export function problemasDeTexto(ensino: EnsinoGerado, perguntas: string[]): string[] {
  const textos = [
    ensino.title,
    ensino.objective,
    ensino.intro.title,
    ensino.intro.body,
    ensino.tip?.title ?? "",
    ensino.tip?.body ?? "",
    ensino.recap,
    ...ensino.teach.flatMap((b) => Object.values(b).flatMap((v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v : typeof v === "object" && v ? Object.values(v) : []))),
  ].map(String);
  const tudo = textos.join("\n");
  const out: string[] = [];
  if (/[—–]/.test(tudo)) out.push("travessão");
  if (/\\\(|\\\[|(?<!R)\$[^$]+(?<!R)\$|\\frac|\\sqrt/.test(tudo)) out.push("LaTeX");
  if (/\b(espera[,.!]|recalculando|hmm+|na verdade,? errei|corrigindo:)/i.test(tudo)) out.push("rascunho");
  if (ensino.teach.length < 2 || ensino.teach.length > 3) out.push(`${ensino.teach.length} blocos teach (precisa 2-3)`);
  if (ensino.teach.some((b) => b.type === "diagram")) out.push("bloco diagram");
  if (ensino.title.length > 40) out.push("título da aula > 40 caracteres");
  const normal = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  for (const b of ensino.teach)
    if (b.type === "worked-example" && perguntas.some((p) => normal(p).includes(normal(b.problem)) || normal(b.problem).includes(normal(p))))
      out.push("exemplo resolvido copia uma questão da aula");
  return out;
}

async function main() {
  const [modo] = process.argv.slice(2);
  const dir = process.argv.find((a) => a.startsWith("--dir="))?.split("=")[1] ?? "content-pipeline/lotes/aulas";
  const fs = await import("node:fs");
  const { join } = await import("node:path");
  const { activeSkills, SKILL_MAP } = await import("@/content/taxonomy");
  const { SUBJECT_MAP } = await import("@/data/subjects");
  const { lessonForSkill } = await import("@/lib/adaptive/candidates");
  fs.mkdirSync(dir, { recursive: true });

  const arquivos: string[] = [];
  const varrer = (d: string) => {
    for (const n of fs.readdirSync(d)) {
      const f = join(d, n);
      if (fs.statSync(f).isDirectory()) varrer(f);
      else if (n.endsWith(".json")) arquivos.push(f);
    }
  };
  varrer("src/content/banco");
  const pacotes = arquivos.map((f) => ({ f, pkg: JSON.parse(fs.readFileSync(f, "utf-8")) as { subjectId: string; items?: ItemPublicado[]; lessons?: MicroLessonV2[] } }));
  const itensPorSkill = new Map<string, ItemPublicado[]>();
  const itemPorId = new Map<string, ItemPublicado>();
  for (const { pkg } of pacotes)
    for (const it of pkg.items ?? []) {
      itemPorId.set(it.id, it);
      for (const s of it.meta.skillIds) itensPorSkill.set(s, [...(itensPorSkill.get(s) ?? []), it]);
    }
  const jaTemAula = new Set(pacotes.flatMap(({ pkg }) => (pkg.lessons ?? []).flatMap((l) => l.skillIds)));

  if (modo === "preparar") {
    const alvo = activeSkills().filter((s) => !lessonForSkill(s.id) && !jaTemAula.has(s.id));
    const prontos: unknown[] = [];
    const semItens: string[] = [];
    for (const skill of alvo) {
      const escolha = escolherQuestoes(itensPorSkill.get(skill.id) ?? []);
      if (!escolha) { semItens.push(skill.id); continue; }
      prontos.push({
        skillId: skill.id,
        skillName: skill.name,
        subjectName: SUBJECT_MAP[skill.subjectId]?.name ?? skill.subjectId,
        escolha,
        questoes: escolha.questoes.map((q) => {
          const ex = itemPorId.get(q.exerciseId)!.exercise as Exercise & { pergunta?: string; opcoes?: string[]; correta?: number; explicacao: string };
          return { dificuldadeNaAula: q.difficulty, pergunta: ex.pergunta, opcoes: ex.opcoes, correta: ex.correta, explicacao: ex.explicacao };
        }),
      });
    }
    const partes = Math.ceil(prontos.length / 10);
    for (let i = 0; i < partes; i++) fs.writeFileSync(join(dir, `_preparo-${i + 1}.json`), JSON.stringify(prontos.slice(i * 10, i * 10 + 10), null, 2));
    console.log(`[aulas] ${prontos.length} habilidade(s) prontas em ${partes} parte(s); sem itens suficientes: ${semItens.length} ${semItens.join(", ")}`);
  } else if (modo === "montar") {
    const { validateLessonSteps } = await import("@/lib/learning/validate");
    const preparos = fs.readdirSync(dir).filter((f) => f.startsWith("_preparo-")).flatMap((f) => JSON.parse(fs.readFileSync(join(dir, f), "utf-8")) as Array<{ skillId: string; escolha: { questoes: QuestaoEscolhida[]; revisao: string[] } }>);
    const ensinos = fs.readdirSync(dir).filter((f) => f.startsWith("_ensino-")).flatMap((f) => JSON.parse(fs.readFileSync(join(dir, f), "utf-8")) as EnsinoGerado[]);
    const ensinoPorSkill = new Map(ensinos.map((e) => [e.skillId, e]));
    // Revisão completa das aulas (Sonnet, item a item): `corrige` troca a aula pela versão
    // corrigida, `reprova` tira. Sem arquivo de revisão, monta tudo (útil pra validar o rascunho).
    const revisoes = fs.readdirSync(dir).filter((f) => f.startsWith("_revisao-aulas-")).flatMap(
      (f) => JSON.parse(fs.readFileSync(join(dir, f), "utf-8")) as Array<{ skillId: string; verdict: string; fixed?: EnsinoGerado }>,
    );
    const reprovadas = new Set<string>();
    for (const r of revisoes) {
      if (r.verdict === "reprova") reprovadas.add(r.skillId);
      else if (r.verdict === "corrige" && r.fixed) ensinoPorSkill.set(r.skillId, { ...r.fixed, skillId: r.skillId });
    }
    if (revisoes.length) console.log(`[aulas] revisões aplicadas: ${revisoes.length} (reprovadas: ${[...reprovadas].join(", ") || "nenhuma"})`);
    for (const s of reprovadas) ensinoPorSkill.delete(s);
    const agora = new Date().toISOString();
    const aulas: MicroLessonV2[] = [];
    const invalidas: Array<{ skillId: string; issues: string[] }> = [];
    for (const p of preparos) {
      const ensino = ensinoPorSkill.get(p.skillId);
      if (!ensino) { invalidas.push({ skillId: p.skillId, issues: ["sem ensino gerado"] }); continue; }
      const skill = SKILL_MAP[p.skillId];
      const aula = montarAula(ensino, p.escolha, { subjectId: skill.subjectId, topicId: skill.topicId }, agora);
      const perguntas = p.escolha.questoes.map((q) => (itemPorId.get(q.exerciseId)?.exercise as { pergunta?: string })?.pergunta ?? "");
      const issues = [
        ...validateLessonSteps([aula]).map((i) => `[${i.code}] ${i.message}`),
        ...problemasDeTexto(ensino, perguntas).map((m) => `[texto] ${m}`),
      ];
      if (issues.length) invalidas.push({ skillId: p.skillId, issues });
      else aulas.push(aula);
    }
    fs.writeFileSync(join(dir, "_aulas.json"), JSON.stringify(aulas, null, 2));
    fs.writeFileSync(join(dir, "_aulas-invalidas.json"), JSON.stringify(invalidas, null, 2));
    console.log(`[aulas] montadas e válidas: ${aulas.length}; inválidas: ${invalidas.length}`);
    for (const i of invalidas) console.log(`  - ${i.skillId}: ${i.issues.join(" | ")}`);
  } else if (modo === "publicar") {
    const aulas = JSON.parse(fs.readFileSync(join(dir, "_aulas.json"), "utf-8")) as MicroLessonV2[];
    let publicadas = 0;
    for (const aula of aulas) {
      const skillId = aula.skillIds[0];
      const alvo = pacotes.find(({ f, pkg }) => pkg.subjectId === aula.subjectId && f.replace(/\\/g, "/").endsWith(`/${sanitizar(skillId)}.json`));
      if (!alvo) { console.log(`  ! sem arquivo de banco pra ${skillId}`); continue; }
      const outras = (alvo.pkg.lessons ?? []).filter((l) => l.id !== aula.id);
      alvo.pkg.lessons = [...outras, aula];
      fs.writeFileSync(alvo.f, `${JSON.stringify(alvo.pkg, null, 2)}\n`);
      publicadas++;
    }
    console.log(`[aulas] publicadas: ${publicadas}`);
  } else {
    console.error("uso: bun scripts/content/aulas.ts preparar|montar|publicar [--dir=...]");
    process.exit(1);
  }
}

if (import.meta.main) {
  await main();
}

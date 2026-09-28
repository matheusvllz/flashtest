#!/usr/bin/env bun
/**
 * Classifica o banco geral (docs/30 §18.2/§8.4, Fase 3 T-3.4) — gera
 * `src/content/items/meta/banco-geral.ts` a partir de `src/data/questions.ts`.
 *
 * Heurística, não leitura item a item (59 questões, mas o casamento é por
 * palavra-chave entre `topic`/`subtopic` (texto livre) e o `name`/`id` das
 * habilidades ativas daquela matéria na taxonomia). Sem habilidade candidata
 * com sobreposição de palavra, cai na primeira habilidade ativa `core` da
 * matéria (nunca fica sem `skillId`, mas o rótulo `reviewer` avisa que é
 * heurística, não leitura manual — divergência registrada em docs/32).
 *
 * Dificuldade: mapeamento fixo do rótulo já autoral (docs/30 §8.4) —
 * Fácil→2, Médio→3, Difícil→4. Não é reclassificação, é conversão de escala.
 */
import { writeFileSync } from "node:fs";
import { QUESTIONS, type Question } from "@/data/questions";
import { SKILLS } from "@/content/taxonomy";
import type { SkillDef } from "@/content/taxonomy/types";
import { guessingProbability } from "@/content/items/irt";

const DIFF_MAP: Record<Question["difficulty"], 1 | 2 | 3 | 4 | 5> = { Fácil: 2, Médio: 3, Difícil: 4 };
const B_MAP: Record<1 | 2 | 3 | 4 | 5, number> = { 1: -1.6, 2: -0.8, 3: 0, 4: 0.8, 5: 1.6 };

function normaliza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function palavras(s: string): Set<string> {
  return new Set(normaliza(s).split(/\s+/).filter((w) => w.length > 3));
}

function melhorHabilidade(q: Question): { skill: SkillDef; heuristico: boolean } {
  const candidatas = SKILLS.filter((s) => s.subjectId === q.subject && s.status === "ativo");
  const alvo = palavras(`${q.topic} ${q.subtopic ?? ""}`);
  let melhor: SkillDef | null = null;
  let melhorScore = 0;
  for (const skill of candidatas) {
    const nome = palavras(skill.name);
    let score = 0;
    for (const w of alvo) if (nome.has(w)) score++;
    if (score > melhorScore) {
      melhorScore = score;
      melhor = skill;
    }
  }
  if (melhor && melhorScore > 0) return { skill: melhor, heuristico: false };
  const fallback = candidatas.find((s) => s.core) ?? candidatas[0];
  return { skill: fallback, heuristico: true };
}

const entradas: string[] = [];
let semCandidata = 0;
let heuristicos = 0;

for (const q of QUESTIONS) {
  const candidatas = SKILLS.filter((s) => s.subjectId === q.subject && s.status === "ativo");
  if (candidatas.length === 0) {
    semCandidata++;
    continue;
  }
  const { skill, heuristico } = melhorHabilidade(q);
  if (heuristico) heuristicos++;
  const difficulty = DIFF_MAP[q.difficulty];
  const c = 1 / q.alternatives.length;
  const reviewer = heuristico ? "fallback-sem-palavra-chave" : "heuristica-topico";
  entradas.push(`  "${q.id}": {
    id: "${q.id}",
    version: 1,
    skillIds: ["${skill.id}"],
    difficulty: ${difficulty},
    irt: { a: 1.0, b: ${B_MAP[difficulty]}, c: ${c.toFixed(2)}, source: "estimado" },
    roles: ["pratica", "revisao"],
    estimatedSeconds: ${q.estimatedSeconds},
    dontKnowAllowed: true,
    source: { kind: "autoral" },
    validation: { status: "revisada-humano", reviewer: "${reviewer}" },
    examProfiles: ["enem"],
  },`);
}

const out = `/**
 * Metadado do banco geral — GERADO por \`scripts/content/classify-legacy.ts\`
 * (docs/30 §8.4/§18.2, Fase 3 T-3.4). Não editar à mão: rodar o script de
 * novo depois de mudar \`src/data/questions.ts\` ou a taxonomia.
 *
 * Heurístico (casamento de palavra-chave tópico↔habilidade, não leitura
 * manual item a item) — \`validation.reviewer: "heuristica-topico"\` marca
 * isso em cada entrada. ${heuristicos} de ${QUESTIONS.length} caíram no
 * fallback (nenhuma palavra em comum; usou a habilidade \`core\` da matéria).
 * Revisão humana real fica para quando o pipeline da Fase 9/11 tocar essas
 * questões, ou para uma passada dedicada — registrado em docs/32.
 */
import type { ItemMeta } from "../types";

export const ITEM_META_BANCO_GERAL: Record<string, ItemMeta> = {
${entradas.join("\n")}
};
`;

writeFileSync("src/content/items/meta/banco-geral.ts", out, "utf-8");
console.log(
  `[classify-legacy] ${QUESTIONS.length} questões classificadas, ${heuristicos} por fallback (sem palavra em comum), ${semCandidata} sem matéria com habilidade ativa`,
);

#!/usr/bin/env bun
/**
 * Gera docs/33-taxonomia-habilidades.md a partir de src/content/taxonomy/
 * (docs/30 §8, Fase 2 T-2.7). Nunca editar o docs/33 à mão — rodar este
 * script de novo depois de mudar a taxonomia. Roda sem diff quando nada
 * mudou (idempotente).
 */
import { writeFileSync } from "node:fs";
import { AREA_NAMES, SKILLS, activeSkills } from "@/content/taxonomy";
import { SUBJECT_MAP } from "@/data/subjects";
import type { EnemArea, SkillDef } from "@/content/taxonomy/types";

const OUT_PATH = "docs/33-taxonomia-habilidades.md";
const AREAS: EnemArea[] = ["LC", "MT", "CN", "CH", "RED"];

function statusEmoji(s: SkillDef): string {
  return s.status === "ativo" ? "✅" : "⏳";
}

function tableForArea(area: EnemArea): string {
  const skills = SKILLS.filter((s) => s.area === area).sort((a, b) => {
    if (a.subjectId !== b.subjectId) return a.subjectId.localeCompare(b.subjectId);
    return a.id.localeCompare(b.id);
  });
  if (skills.length === 0) return "_Nenhuma habilidade cadastrada nesta área ainda._\n";
  const rows = skills.map((s) => {
    const materia = SUBJECT_MAP[s.subjectId]?.name ?? s.subjectId;
    const pre = s.prerequisites.length > 0 ? s.prerequisites.map((p) => `\`${p}\``).join(", ") : "—";
    const enem = s.enemSkills?.length ? s.enemSkills.join(", ") : "_não preenchido_";
    return `| ${statusEmoji(s)} \`${s.id}\` | ${materia} | ${s.name} | ${s.core ? "sim" : "não"} | ${s.incidence} | ${s.level} | ${pre} | ${enem} |`;
  });
  return [
    "| Status | Habilidade | Matéria | Nome | Core | Incidência | Nível | Pré-requisitos | Matriz ENEM |",
    "|---|---|---|---|---|---|---|---|---|",
    ...rows.map((r, i) => r.replace(`| ${statusEmoji(skills[i])} \`${skills[i].id}\` |`, `| ${statusEmoji(skills[i])} | \`${skills[i].id}\` |`)),
  ].join("\n");
}

const total = SKILLS.length;
const ativas = activeSkills().length;

const porArea = AREAS.map(
  (area) => `## ${AREA_NAMES[area]} (${area})\n\n${tableForArea(area)}\n`,
).join("\n");

const doc = `# 33 — Taxonomia de habilidades (gerado)

**Não editar à mão.** Gerado por \`scripts/content/taxonomy-doc.ts\` a partir de \`src/content/taxonomy/\` (docs/30 §8, docs/31 Fase 2). Rodar \`bun scripts/content/taxonomy-doc.ts\` depois de mudar a taxonomia.

**Total:** ${total} habilidades declaradas, **${ativas} ativas** (as demais são \`planejado\`, sem conteúdo ainda — o motor adaptativo as ignora).

✅ = ativo · ⏳ = planejado

**Proveniência dos itens (docs/36 §G.5):** no catálogo de itens, \`status: revisada-humano\` significa **aprovada no portão de revisão** (é o que o pool filtra), não necessariamente lida por uma pessoa; **quem revisou** está em \`meta.validation.reviewKind\` (\`humano\`, \`ia-delegada\`, \`gabarito-oficial\`, \`autoria-legada\`; ausente = desconhecido).

**Pendência conhecida (registrada em docs/32):** a coluna "Matriz ENEM" (\`enemSkills\`, referência aos códigos H1–H30 da Matriz de Referência do Inep por área) não foi preenchida nesta rodada — preencher os códigos exatos sem a fonte primária em mãos seria inventar dado, o que os documentos normativos (docs/20 §13, docs/30) proíbem. Preencher na Fase 10 (F10.3), consultando a Matriz de Referência do Inep diretamente.

${porArea}
`;

writeFileSync(OUT_PATH, doc, "utf-8");
console.log(`[taxonomy-doc] escrito ${OUT_PATH} (${ativas}/${total} ativas)`);

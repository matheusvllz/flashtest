#!/usr/bin/env bun
/**
 * Publicação e relatório (docs/30 §19.2 estágio 8 / §19.6, Fase 9 do
 * docs/31 F9.9) — só candidatos aprovados viram arquivo em
 * `src/content/banco/<materia>/<skillId>.json`; idempotente (merge por id,
 * publicar 2× não duplica nem duplica id entre arquivos da mesma matéria —
 * `build-packs.ts`, Fase 3, já lança nesse caso).
 */
import { createHash } from "node:crypto";
import type { Exercise } from "@/lib/lessons/types";
import type { ItemMeta } from "@/content/items/types";
import type { Candidate } from "./pipeline-types";

export function isPublishable(candidate: Candidate, loteAprovadoPorAmostra: boolean): boolean {
  if (candidate.stages.validation?.ok !== true) return false;
  if (candidate.stages.humanReview?.verdict === "aprova") return true;
  if (candidate.stages.humanReview?.verdict === "reprova") return false;
  return loteAprovadoPorAmostra && candidate.stages.verification?.escalated !== true;
}

function normalizarEnunciado(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
}

function enunciadoDe(ex: Exercise): string {
  switch (ex.type) {
    case "multipla-escolha":
      return ex.pergunta;
    case "interpretacao":
      return ex.pergunta;
    case "complete-lacuna":
    case "encontre-o-erro":
      return ex.frase;
    case "ordenar":
      return ex.blocos.join(" ");
    case "verdadeiro-falso":
      return ex.afirmacao;
    case "parear":
      return ex.pares.map((p) => p.a).join(" ");
  }
}

/** `"gen:<skillId>:<hash8 do enunciado normalizado>"` (docs/30 §19.2, estável — mesmo enunciado sempre gera o mesmo id, então republicar não duplica). */
export function generatedItemId(skillId: string, exercise: Exercise): string {
  const hash = createHash("sha256")
    .update(normalizarEnunciado(enunciadoDe(exercise)))
    .digest("hex")
    .slice(0, 8);
  return `gen:${skillId}:${hash}`;
}

export interface PublishedItem {
  id: string;
  exercise: Exercise;
  meta: ItemMeta;
}

export interface PublishFileEntry {
  /** Caminho relativo a `src/content/banco/`, ex. "mat/mat-porcentagem-conceito.json". */
  path: string;
  subjectId: string;
  items: PublishedItem[];
}

/**
 * `buildPublishPlan` (pura, testável): dado os candidatos aprovados e o
 * conteúdo ATUAL de cada arquivo-alvo (se existir), devolve o novo conteúdo
 * de cada arquivo — merge por id (um candidato republicado sobrescreve a
 * entrada existente do MESMO id, nunca duplica).
 */
export function buildPublishPlan(
  candidates: Candidate[],
  loteAprovadoPorAmostra: boolean,
  existingItemsByPath: (path: string) => PublishedItem[],
): PublishFileEntry[] {
  const porArquivo = new Map<
    string,
    { subjectId: string; itemsById: Map<string, PublishedItem> }
  >();

  for (const candidate of candidates) {
    if (candidate.kind !== "item" || !candidate.exercise) continue;
    if (!isPublishable(candidate, loteAprovadoPorAmostra)) continue;

    const subjectId = candidate.skillId.split(":")[0];
    const path = `${subjectId}/${candidate.skillId.replace(":", "-")}.json`;
    const id = generatedItemId(candidate.skillId, candidate.exercise);

    if (!porArquivo.has(path)) {
      const existentes = existingItemsByPath(path);
      const itemsById = new Map(existentes.map((item) => [item.id, item]));
      porArquivo.set(path, { subjectId, itemsById });
    }

    const status: ItemMeta["validation"]["status"] =
      candidate.stages.humanReview?.verdict === "aprova" ? "revisada-humano" : "verificada-ia";
    const meta: ItemMeta = {
      id,
      version: 1,
      skillIds: [candidate.skillId],
      difficulty: candidate.difficulty,
      irt: candidate.meta.irt ?? { a: 1, b: 0, c: 0.2, source: "estimado" },
      roles: candidate.meta.roles ?? [candidate.role],
      estimatedSeconds: candidate.meta.estimatedSeconds ?? 60,
      dontKnowAllowed: candidate.meta.dontKnowAllowed ?? true,
      explanationLayers: candidate.meta.explanationLayers,
      source: { kind: "ia-validada", generatedBy: candidate.stages.generated?.model },
      validation: {
        status,
        reviewedAt: new Date().toISOString(),
        reviewer: candidate.stages.humanReview?.reviewer,
      },
      examProfiles: candidate.meta.examProfiles ?? ["enem"],
    };

    porArquivo.get(path)!.itemsById.set(id, { id, exercise: candidate.exercise, meta });
  }

  return [...porArquivo.entries()].map(([path, { subjectId, itemsById }]) => ({
    path,
    subjectId,
    items: [...itemsById.values()],
  }));
}

/** Amostra pra revisão humana (docs/30 §19.2 estágio 7, README): 10% do lote (mín. 10) + 100% do que foi escalado. */
export function amostrarParaRevisao<
  T extends { candidateId: string; stages: { verification?: { escalated?: boolean } } },
>(candidatos: T[]): T[] {
  const escalados = candidatos.filter((c) => c.stages.verification?.escalated === true);
  const naoEscalados = candidatos.filter((c) => c.stages.verification?.escalated !== true);
  const tamanhoAmostra = Math.max(10, Math.ceil(candidatos.length * 0.1));
  const faltam = Math.max(0, tamanhoAmostra - escalados.length);
  return [...escalados, ...naoEscalados.slice(0, faltam)];
}

export function formatarAmostraMarkdown(loteId: string, amostra: Candidate[]): string {
  const linhas = [
    `# Amostra de revisão humana — lote ${loteId}`,
    "",
    `${amostra.length} candidato(s). Aprovar/reprovar em \`08-amostra-verdicts.json\` (formato: \`{"<candidateId>": "aprova"|"reprova"}\`).`,
    "",
  ];
  for (const c of amostra) {
    if (!c.exercise || c.exercise.type !== "multipla-escolha") continue;
    linhas.push(`## ${c.candidateId} — ${c.skillId} (dificuldade ${c.difficulty})`);
    if (c.stages.verification?.escalated)
      linhas.push("**ESCALADO** — gerador e solucionador discordaram, um juiz decidiu.");
    linhas.push(
      "",
      `**Pergunta:** ${c.exercise.pergunta}`,
      "",
      ...c.exercise.opcoes.map(
        (o, i) =>
          `${i === c.exercise!.correta && c.exercise!.type === "multipla-escolha" ? "✅" : "◻"} ${o}`,
      ),
      "",
      `**Explicação:** ${c.exercise.explicacao}`,
      "",
      "---",
      "",
    );
  }
  return linhas.join("\n");
}

interface RelatorioLote {
  loteId: string;
  totalCandidatos: number;
  rejeitadosNaCritica: number;
  taxaConflito: number;
  humanizacoesAceitas: number;
  humanizacoesRejeitadas: number;
  validos: number;
  invalidos: number;
  publicados: number;
}

export function formatarRelatorio(r: RelatorioLote): string {
  return [
    `# Relatório do lote ${r.loteId}`,
    "",
    `- Total de candidatos: ${r.totalCandidatos}`,
    `- Rejeitados na crítica (estágio 2): ${r.rejeitadosNaCritica}`,
    `- Taxa de conflito gerador×solucionador (estágio 4): ${(r.taxaConflito * 100).toFixed(1)}%${r.taxaConflito > 0.15 ? " ⚠️ acima de 15%" : ""}`,
    `- Humanizações aceitas / rejeitadas pela guarda: ${r.humanizacoesAceitas} / ${r.humanizacoesRejeitadas}`,
    `- Válidos na validação determinística (estágio 6): ${r.validos}`,
    `- Inválidos: ${r.invalidos}`,
    `- Publicados: ${r.publicados}`,
    "",
  ].join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const loteArg = args.find((a) => a.startsWith("--lote="));
  const amostraAprovada = args.includes("--amostra-aprovada");
  if (!loteArg) {
    console.error("Uso: bun scripts/content/publish.ts --lote=<id> [--amostra-aprovada]");
    process.exit(1);
  }
  const loteId = loteArg.split("=")[1];

  const { existsSync, readFileSync, writeFileSync, mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  const { readJSONL, lotePath, writeJSON, writeText } = await import("./lote-io");
  const { validateExercise } = await import("./validate");
  const { SKILL_MAP } = await import("@/content/taxonomy");
  const { itemsOfSkill } = await import("@/content/items");
  const { resolveExercise } = await import("@/content/microlicoes");

  const arquivoOrigem = existsSync(lotePath(loteId, "06-humanizado.jsonl"))
    ? "06-humanizado.jsonl"
    : existsSync(lotePath(loteId, "04-solucao.jsonl"))
      ? "04-solucao.jsonl"
      : null;
  if (!arquivoOrigem) {
    console.error(
      `Nenhum estágio processado ainda pra "${loteId}" (esperava 06-humanizado.jsonl ou, na falta, 04-solucao.jsonl).`,
    );
    process.exit(1);
  }

  const todosCriticados = readJSONL<Candidate>(lotePath(loteId, "03-critica.jsonl"));
  const rejeitadosNaCritica = todosCriticados.filter(
    (c) => c.stages.critique?.verdict === "rejeita",
  ).length;
  const resolvidos = readJSONL<Candidate>(lotePath(loteId, "04-solucao.jsonl"));
  const escalados = resolvidos.filter((c) => c.stages.verification?.escalated === true).length;
  const taxaConflito = resolvidos.length > 0 ? escalados / resolvidos.length : 0;

  const candidatos = readJSONL<Candidate>(lotePath(loteId, arquivoOrigem));
  const humanizacoesAceitas = candidatos.filter(
    (c) => c.stages.humanized?.accepted === true,
  ).length;
  const humanizacoesRejeitadas = candidatos.filter(
    (c) => c.stages.humanized?.accepted === false,
  ).length;

  const skillExists = (id: string) => !!SKILL_MAP[id];
  const skillActive = (id: string) => SKILL_MAP[id]?.status === "ativo";
  /** Enunciados já publicados da mesma habilidade — checagem de duplicata semântica (docs/30 §19.5) contra o catálogo REAL, não só o resto do lote. */
  const existingStatementsBySkill = (skillId: string): string[] =>
    itemsOfSkill(skillId)
      .map((entry) => {
        try {
          return enunciadoDe(resolveExercise(entry.id));
        } catch {
          return null;
        }
      })
      .filter((s): s is string => s !== null);

  const validados: Candidate[] = candidatos.map((c) => {
    if (!c.exercise) return c;
    const resultado = validateExercise(c.exercise, c.skillId, {
      skillExists,
      skillActive,
      existingStatementsBySkill,
    });
    return {
      ...c,
      stages: {
        ...c.stages,
        validation: { ok: resultado.ok, issues: resultado.issues.map((i) => i.message) },
      },
    };
  });

  writeJSON(lotePath(loteId, "07-validacao.json"), {
    loteId,
    total: validados.length,
    validos: validados.filter((c) => c.stages.validation?.ok).length,
    invalidos: validados
      .filter((c) => c.stages.validation && !c.stages.validation.ok)
      .map((c) => ({ candidateId: c.candidateId, issues: c.stages.validation!.issues })),
  });

  const verdictsPath = lotePath(loteId, "08-amostra-verdicts.json");
  const verdicts = existsSync(verdictsPath)
    ? (JSON.parse(readFileSync(verdictsPath, "utf-8")) as Record<string, "aprova" | "reprova">)
    : {};
  const comVerdictos = validados.map((c) =>
    verdicts[c.candidateId]
      ? {
          ...c,
          stages: {
            ...c.stages,
            humanReview: { reviewer: "amostra", verdict: verdicts[c.candidateId] },
          },
        }
      : c,
  );

  const amostra = amostrarParaRevisao(comVerdictos);
  writeText(lotePath(loteId, "08-amostra.md"), formatarAmostraMarkdown(loteId, amostra));

  const reprovadosNaAmostra = comVerdictos.filter(
    (c) => c.stages.humanReview?.verdict === "reprova",
  ).length;
  const taxaReprovacaoAmostra = amostra.length > 0 ? reprovadosNaAmostra / amostra.length : 0;

  if (taxaConflito > 0.15) {
    console.error(
      `[publish] BLOQUEIO: taxa de conflito ${(taxaConflito * 100).toFixed(1)}% acima de 15% — não publica (docs/30 §19, "Bloqueio automático"). Revisar o prompt do estágio 1/2.`,
    );
  }
  if (taxaReprovacaoAmostra > 0.05) {
    console.error(
      `[publish] BLOQUEIO: reprovação da amostra humana ${(taxaReprovacaoAmostra * 100).toFixed(1)}% acima de 5% — não publica.`,
    );
  }
  const bloqueado = taxaConflito > 0.15 || taxaReprovacaoAmostra > 0.05;

  let publicados = 0;
  if (amostraAprovada && !bloqueado) {
    const plano = buildPublishPlan(comVerdictos, true, (path) => {
      const full = `src/content/banco/${path}`;
      if (!existsSync(full)) return [];
      return (JSON.parse(readFileSync(full, "utf-8")) as { items?: PublishedItem[] }).items ?? [];
    });
    for (const arquivo of plano) {
      const full = `src/content/banco/${arquivo.path}`;
      if (!existsSync(dirname(full))) mkdirSync(dirname(full), { recursive: true });
      writeFileSync(
        full,
        `${JSON.stringify({ subjectId: arquivo.subjectId, items: arquivo.items }, null, 2)}\n`,
        "utf-8",
      );
      publicados += arquivo.items.length;
      console.log(`[publish] ${full}: ${arquivo.items.length} item(ns)`);
    }
  } else if (!amostraAprovada) {
    console.log(
      `[publish] amostra escrita em ${lotePath(loteId, "08-amostra.md")} — revise e rode de novo com --amostra-aprovada (ou preencha 08-amostra-verdicts.json por candidato).`,
    );
  }

  const relatorio = formatarRelatorio({
    loteId,
    totalCandidatos: candidatos.length,
    rejeitadosNaCritica,
    taxaConflito,
    humanizacoesAceitas,
    humanizacoesRejeitadas,
    validos: validados.filter((c) => c.stages.validation?.ok).length,
    invalidos: validados.filter((c) => c.stages.validation && !c.stages.validation.ok).length,
    publicados,
  });
  writeText(`content-pipeline/relatorios/${loteId}.md`, relatorio);
  console.log(relatorio);
}

if (import.meta.main) {
  await main();
}

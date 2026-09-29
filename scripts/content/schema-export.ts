#!/usr/bin/env bun
/**
 * Schemas exportados (docs/30 §19.3, Fase 9 do docs/31 F9.2) —
 * `content-pipeline/schemas/*.json`, pra prompts do pipeline referenciarem
 * um contrato estável sem reimportar TypeScript.
 *
 * Divergência registrada (docs/32, Fase 3): não existe schema zod pra
 * `ItemMeta`/`Exercise` neste repo (a Fase 3 não criou um — os tipos TS
 * puros bastaram pros testes daquela fase). Em vez de "gerar JSON Schema a
 * partir do zod" (o que o `31` pedia), este script exporta uma descrição
 * JSON Schema-like ESCRITA À MÃO, espelhando os tipos de
 * `src/content/items/types.ts`/`src/lib/lessons/types.ts` — determinística
 * e idempotente (rodar 2x sem mudar os tipos dá o MESMO arquivo), que é o
 * critério real de aceite (F9.2: "roda sem diff quando nada muda").
 */
import { mkdirSync, writeFileSync } from "node:fs";

const OUT_DIR = "content-pipeline/schemas";

const ITEM_META_SCHEMA = {
  $id: "item-meta.json",
  title: "ItemMeta",
  type: "object",
  required: ["id", "version", "skillIds", "difficulty", "irt", "roles", "estimatedSeconds", "dontKnowAllowed", "source", "validation", "examProfiles"],
  properties: {
    id: { type: "string" },
    version: { type: "integer", minimum: 1 },
    skillIds: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 },
    difficulty: { type: "integer", enum: [1, 2, 3, 4, 5] },
    irt: {
      type: "object",
      required: ["a", "b", "c", "source"],
      properties: {
        a: { type: "number" },
        b: { type: "number" },
        c: { type: "number", minimum: 0, maximum: 1 },
        source: { type: "string", enum: ["estimado", "inep", "calibrado-foca"] },
      },
    },
    roles: { type: "array", items: { type: "string", enum: ["pratica", "revisao", "desafio", "diagnostico"] } },
    estimatedSeconds: { type: "integer", minimum: 1 },
    dontKnowAllowed: { type: "boolean" },
    source: {
      type: "object",
      required: ["kind"],
      properties: { kind: { type: "string", enum: ["autoral", "ia-validada", "oficial", "adaptada-de-oficial"] } },
    },
    validation: {
      type: "object",
      required: ["status"],
      properties: {
        status: { type: "string", enum: ["gerada", "verificada-ia", "revisada-humano", "oficial-conferida"] },
        reviewKind: { type: "string", enum: ["humano", "ia-delegada", "gabarito-oficial", "autoria-legada"] },
        reviewNote: { type: "string" },
      },
    },
    examProfiles: { type: "array", items: { type: "string" } },
  },
} as const;

const EXERCISE_MULTIPLA_ESCOLHA_SCHEMA = {
  $id: "exercise-multipla-escolha.json",
  title: "MultipleChoiceExercise",
  type: "object",
  required: ["type", "pergunta", "opcoes", "correta", "explicacao"],
  properties: {
    type: { const: "multipla-escolha" },
    pergunta: { type: "string", minLength: 1 },
    opcoes: { type: "array", items: { type: "string" }, minItems: 2 },
    correta: { type: "integer", minimum: 0 },
    explicacao: { type: "string", minLength: 1 },
  },
} as const;

const CANDIDATE_SCHEMA = {
  $id: "candidate.json",
  title: "Candidate",
  type: "object",
  required: ["candidateId", "skillId", "difficulty", "role", "kind", "meta", "stages"],
  properties: {
    candidateId: { type: "string" },
    skillId: { type: "string" },
    difficulty: { type: "integer", enum: [1, 2, 3, 4, 5] },
    role: { type: "string", enum: ["pratica", "revisao", "desafio", "diagnostico"] },
    kind: { type: "string", enum: ["item", "aula"] },
    exercise: { $ref: "exercise-multipla-escolha.json" },
    meta: { $ref: "item-meta.json" },
    stages: { type: "object" },
  },
} as const;

const SCHEMAS: Record<string, unknown> = {
  "item-meta.json": ITEM_META_SCHEMA,
  "exercise-multipla-escolha.json": EXERCISE_MULTIPLA_ESCOLHA_SCHEMA,
  "candidate.json": CANDIDATE_SCHEMA,
};

export function schemaFiles(): Record<string, string> {
  return Object.fromEntries(Object.entries(SCHEMAS).map(([name, schema]) => [name, `${JSON.stringify(schema, null, 2)}\n`]));
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, content] of Object.entries(schemaFiles())) {
    writeFileSync(`${OUT_DIR}/${name}`, content);
  }
  console.log(`[schema-export] ${Object.keys(SCHEMAS).length} schema(s) escritos em ${OUT_DIR}/`);
}

if (import.meta.main) {
  main();
}

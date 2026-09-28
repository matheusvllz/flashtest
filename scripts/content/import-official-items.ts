#!/usr/bin/env bun
/**
 * Importa questões oficiais do ENEM já TRANSCRITAS (docs/30 §12.4/§18.4,
 * Fase 10 do docs/31 F10.5) — este script não lê PDF nem extrai texto de
 * prova sozinho: recebe um JSON já preparado por um humano (transcrição de
 * `download.inep.gov.br/enem/provas_e_gabaritos/...`, só itens 100% texto,
 * sem imagem/charge/gráfico de terceiro — a ESCOLHA de quais itens entram e
 * a transcrição em si são trabalho editorial, não mecânico, como o `31`
 * §14 já registra). O que este script FAZ mecanicamente: valida a forma,
 * rejeita item com imagem, confere o gabarito por uma segunda fonte
 * independente (um solucionador que resolve sem ver o gabarito oficial —
 * mesmo mecanismo do verificador da Fase 9, `verify.ts`) e publica só o que
 * bate, com a atribuição (ano + "ENEM") sempre presente.
 *
 * Formato de entrada esperado, `--input=<caminho>` (JSON, um array):
 * ```json
 * [{
 *   "ano": 2019, "ref": "caderno azul · questão 91", "area": "MT",
 *   "skillId": "mat:porcentagem-valor", "difficulty": 3,
 *   "exercise": { "type": "multipla-escolha", "pergunta": "...", "opcoes": ["...","...","...","...","..."], "correta": 0, "explicacao": "..." }
 * }]
 * ```
 * `exercise.imagem` presente => item rejeitado (regra dura do `31`, sem exceção).
 */
import { createHash } from "node:crypto";
import type { MultipleChoiceExercise } from "@/lib/lessons/types";
import type { ItemMeta } from "@/content/items/types";
import { respostasIguais } from "./verify-utils";
import { callStage } from "./run-stage";

export interface ItemOficialEntrada {
  ano: number;
  ref: string;
  area: "LC" | "MT" | "CN" | "CH";
  skillId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  exercise: MultipleChoiceExercise;
}

export interface ConferenciaResult {
  conferido: boolean;
  respostaIndependente?: number | number[];
  divergencia?: string;
}

/** Só a FORMA — item com imagem, sem os 4 campos certos, ou fora de LC/MT/CN/CH nunca chega a ser importado (docs/31 §14, regra dura). */
export function validarFormaOficial(entrada: ItemOficialEntrada): string[] {
  const problemas: string[] = [];
  if (entrada.exercise.imagem)
    problemas.push("item tem imagem/gráfico — nunca importado (regra do docs/31 §14, F10.5)");
  if (!["LC", "MT", "CN", "CH"].includes(entrada.area))
    problemas.push(`área "${entrada.area}" fora de LC/MT/CN/CH`);
  if (!entrada.ref?.trim())
    problemas.push("sem `ref` (referência da questão — obrigatória pra atribuição)");
  if (entrada.exercise.type !== "multipla-escolha")
    problemas.push("só multipla-escolha suportado nesta passada");
  return problemas;
}

/** `oficial:<ano>:<hash8 de ref+enunciado>` — estável, igual ao esquema de `publish.ts#generatedItemId` mas com prefixo próprio (nunca colide com item gerado por IA). */
export function officialItemId(entrada: ItemOficialEntrada): string {
  const hash = createHash("sha256")
    .update(`${entrada.ref}:${entrada.exercise.pergunta}`)
    .digest("hex")
    .slice(0, 8);
  return `oficial:${entrada.ano}:${hash}`;
}

/**
 * Confere o gabarito oficial por uma segunda fonte independente — o
 * solucionador NUNCA vê `entrada.exercise.correta` (mesma regra do estágio
 * 3/4 da Fase 9). Diverge => `conferido: false`, vai pra revisão humana
 * antes de publicar (docs/31 §14, F10.5) — este script nunca publica
 * sozinho um item cujo gabarito não bateu.
 */
export async function conferirGabaritoOficial(
  entrada: ItemOficialEntrada,
  baseUrl: string,
  apiKey: string,
  modelo: string,
  promptResolver: string,
): Promise<ConferenciaResult> {
  const userContent = JSON.stringify({
    pergunta: entrada.exercise.pergunta,
    opcoes: entrada.exercise.opcoes,
  });
  const r = await callStage<{ answerIndex: number | number[]; confidence: number }>(
    baseUrl,
    apiKey,
    modelo,
    promptResolver,
    userContent,
    (raw) => {
      const obj = JSON.parse(raw) as { answerIndex: number | number[]; confidence: number };
      if (typeof obj.answerIndex !== "number" && !Array.isArray(obj.answerIndex))
        throw new Error("answerIndex ausente");
      return obj;
    },
  );
  if (!r.ok || !r.data) return { conferido: false, divergencia: `solucionador falhou: ${r.error}` };
  const bate = respostasIguais(entrada.exercise.correta, r.data.answerIndex);
  return bate
    ? { conferido: true, respostaIndependente: r.data.answerIndex }
    : {
        conferido: false,
        respostaIndependente: r.data.answerIndex,
        divergencia: `gabarito informado (${entrada.exercise.correta}) diverge do solucionador independente (${r.data.answerIndex})`,
      };
}

/** Atribuição visível, sempre "ENEM <ano>" (docs/34, requisito não-negociável) — nunca deixado a critério de quem transcreveu, pra nunca faltar. */
export function exercicioComAtribuicao(exercise: MultipleChoiceExercise, ano: number): MultipleChoiceExercise {
  return { ...exercise, fonte: `ENEM ${ano}` };
}

export function buildItemMetaOficial(entrada: ItemOficialEntrada): ItemMeta {
  return {
    id: officialItemId(entrada),
    version: 1,
    skillIds: [entrada.skillId],
    difficulty: entrada.difficulty,
    irt: {
      a: 1,
      b: 0,
      c: entrada.exercise.opcoes.length > 0 ? 1 / entrada.exercise.opcoes.length : 0.2,
      source: "estimado",
    },
    roles: ["pratica", "revisao", "diagnostico"],
    estimatedSeconds: 90,
    dontKnowAllowed: true,
    source: { kind: "oficial", exam: "ENEM", year: entrada.ano, ref: entrada.ref },
    validation: {
      status: "oficial-conferida",
      reviewedAt: new Date().toISOString(),
      reviewer: "solucionador-independente",
    },
    examProfiles: ["enem"],
  };
}

async function main() {
  const { existsSync, mkdirSync, readFileSync, writeFileSync } = await import("node:fs");
  const { dirname } = await import("node:path");

  const args = process.argv.slice(2);
  const get = (flag: string) =>
    args
      .find((a) => a.startsWith(`--${flag}=`))
      ?.split("=")
      .slice(1)
      .join("=");
  const inputPath = get("input");
  if (!inputPath) {
    console.error("Uso: bun scripts/content/import-official-items.ts --input=<caminho.json>");
    console.error(
      "O JSON precisa ser preparado à mão (transcrição da prova+gabarito oficiais) — este script confere e publica, não extrai de PDF.",
    );
    process.exit(1);
  }
  if (!existsSync(inputPath)) {
    console.error(`Arquivo não encontrado: ${inputPath}`);
    process.exit(1);
  }

  const baseUrl = process.env.CONTENT_LLM_BASE_URL;
  const apiKey = process.env.CONTENT_LLM_API_KEY;
  const modelo = process.env.CONTENT_LLM_MODEL_RESOLVER;
  if (!baseUrl || !apiKey || !modelo) {
    console.error(
      "CONTENT_LLM_BASE_URL / CONTENT_LLM_API_KEY / CONTENT_LLM_MODEL_RESOLVER não configurados — ver .env.example.",
    );
    process.exit(1);
  }

  const promptResolver = readFileSync("content-pipeline/prompts/resolver.md", "utf-8");
  const entradas = JSON.parse(readFileSync(inputPath, "utf-8")) as ItemOficialEntrada[];

  const porAno = new Map<
    number,
    {
      subjectId: string;
      items: Array<{ id: string; exercise: MultipleChoiceExercise; meta: ItemMeta }>;
    }[]
  >();
  let rejeitadosForma = 0;
  let rejeitadosGabarito = 0;
  let publicados = 0;

  for (const entrada of entradas) {
    const problemas = validarFormaOficial(entrada);
    if (problemas.length > 0) {
      console.warn(
        `[import-official-items] REJEITADO (forma) "${entrada.ref}": ${problemas.join("; ")}`,
      );
      rejeitadosForma++;
      continue;
    }
    const conferencia = await conferirGabaritoOficial(
      entrada,
      baseUrl,
      apiKey,
      modelo,
      promptResolver,
    );
    if (!conferencia.conferido) {
      console.warn(
        `[import-official-items] REJEITADO (gabarito não confere, precisa de revisão humana) "${entrada.ref}": ${conferencia.divergencia}`,
      );
      rejeitadosGabarito++;
      continue;
    }
    const subjectId = entrada.skillId.split(":")[0];
    const item = {
      id: officialItemId(entrada),
      exercise: exercicioComAtribuicao(entrada.exercise, entrada.ano),
      meta: buildItemMetaOficial(entrada),
    };
    const listaDoAno = porAno.get(entrada.ano) ?? [];
    let grupo = listaDoAno.find((g) => g.subjectId === subjectId);
    if (!grupo) {
      grupo = { subjectId, items: [] };
      listaDoAno.push(grupo);
    }
    grupo.items.push(item);
    porAno.set(entrada.ano, listaDoAno);
    publicados++;
  }

  for (const [ano, grupos] of porAno) {
    for (const grupo of grupos) {
      const destino = `src/content/banco/oficial/${ano}-${grupo.subjectId}.json`;
      if (!existsSync(dirname(destino))) mkdirSync(dirname(destino), { recursive: true });
      const existente = existsSync(destino)
        ? (JSON.parse(readFileSync(destino, "utf-8")) as { items?: typeof grupo.items })
        : { items: [] };
      const porId = new Map((existente.items ?? []).map((i) => [i.id, i]));
      for (const item of grupo.items) porId.set(item.id, item);
      writeFileSync(
        destino,
        `${JSON.stringify({ subjectId: grupo.subjectId, items: [...porId.values()] }, null, 2)}\n`,
        "utf-8",
      );
      console.log(`[import-official-items] ${destino}: ${grupo.items.length} item(ns) confirmados`);
    }
  }

  console.log(
    `[import-official-items] total: ${entradas.length} | publicados: ${publicados} | rejeitados (forma): ${rejeitadosForma} | rejeitados (gabarito divergente): ${rejeitadosGabarito}`,
  );
  if (rejeitadosGabarito > 0) {
    console.log(
      `[import-official-items] os ${rejeitadosGabarito} item(ns) com gabarito divergente NÃO foram publicados — revisão humana necessária antes (docs/31 §14, F10.5).`,
    );
  }
}

if (import.meta.main) {
  await main();
}

#!/usr/bin/env bun
/**
 * Executor de estágio — Modo B (docs/30 §19.3, Fase 9/11 do docs/31
 * F9.5/F11). Chama um endpoint compatível com a API de chat da OpenAI
 * (OmniRoute local, Anthropic via camada compatível, ou OpenAI direto) pra
 * rodar UM estágio do pipeline sobre um lote de candidatos em JSONL.
 * Retomada idempotente por `candidateId` — interromper e rodar de novo não
 * reprocessa o que já tem linha completa no arquivo de saída.
 *
 * Modo A (subagentes do Claude Code) não passa por este arquivo — é um
 * orquestrador que lê/escreve os MESMOS JSONL diretamente; ver o README.
 *
 * Fluxo Modo B (README): `gerar` → `criticar` → `resolver` (que já roda a
 * verificação determinística — estágio 4 — e escala pro juiz — estágio 4b —
 * candidato a candidato, sem precisar de outro comando) → `humanizar`.
 * `publish.ts` fecha com validação + amostra + publicação.
 */
import { existsSync, readFileSync } from "node:fs";
import type { Exercise } from "@/lib/lessons/types";
import type { BatchPlan, Candidate, CritiqueVerdict } from "./pipeline-types";
import { verify, resolveEscalation, balancearPosicaoGabarito } from "./verify";
import { humanizeGuard } from "./humanize-guard";
import { appendJSONL, lotePath, readJSONL, readLines } from "./lote-io";

const MAX_RETRIES = 1;

export interface StageCallResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  usage?: { promptTokens: number; completionTokens: number };
}

/**
 * Chama o endpoint compatível com a API de chat. Nunca loga a chave nem o
 * corpo inteiro de uma resposta de erro (docs/30 §19, "Segurança").
 * `jsonMode` (padrão `true`) força `response_format: json_object` — o único
 * estágio que devolve texto puro, não JSON, é "humanizar" (`humanizar.md`:
 * "só o texto reescrito, sem JSON ao redor"), que chama com `jsonMode: false`.
 */
export async function callStage<T>(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userContent: string,
  parseResponse: (raw: string) => T,
  jsonMode: boolean = true,
): Promise<StageCallResult<T>> {
  let ultimoErro = "";
  for (let tentativa = 0; tentativa <= MAX_RETRIES; tentativa++) {
    try {
      const dicaRetentativa = jsonMode
        ? "\n\n(Retentativa: a resposta anterior não era JSON válido — devolva SÓ o JSON, sem texto ao redor.)"
        : "\n\n(Retentativa: siga o formato de saída pedido exatamente.)";
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: tentativa === 0 ? userContent : `${userContent}${dicaRetentativa}`,
            },
          ],
          ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!response.ok) {
        ultimoErro = `HTTP ${response.status}`;
        continue;
      }

      const json = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens: number; completion_tokens: number };
      };
      const raw = json.choices?.[0]?.message?.content;
      if (!raw) {
        ultimoErro = "resposta sem conteúdo";
        continue;
      }

      const data = parseResponse(raw);
      return {
        ok: true,
        data,
        usage: json.usage
          ? {
              promptTokens: json.usage.prompt_tokens,
              completionTokens: json.usage.completion_tokens,
            }
          : undefined,
      };
    } catch (error) {
      ultimoErro = error instanceof Error ? error.message : "erro desconhecido";
    }
  }
  return { ok: false, error: ultimoErro };
}

/** Ids já presentes num JSONL de saída — pra retomada idempotente. */
export function idsJaProcessados(linhasExistentes: string[]): Set<string> {
  const ids = new Set<string>();
  for (const linha of linhasExistentes) {
    if (!linha.trim()) continue;
    try {
      const obj = JSON.parse(linha) as { candidateId?: string };
      if (obj.candidateId) ids.add(obj.candidateId);
    } catch {
      // linha corrompida (interrupção no meio da escrita) — ignora, será reprocessada.
    }
  }
  return ids;
}

/** Filtra candidatos pendentes (ainda não processados neste estágio) — a idempotência da retomada. */
export function candidatosPendentes<T extends { candidateId: string }>(
  candidatos: T[],
  jaProcessados: Set<string>,
): T[] {
  return candidatos.filter((c) => !jaProcessados.has(c.candidateId));
}

// ---------------------------------------------------------------------------
// Estágio 0→1: expandir o plano em candidatos individuais (docs/30 §19.2).
// ---------------------------------------------------------------------------

/** Um candidato-stub por unidade de `quantity` de cada entrada do plano — id estável `"<loteId>-<n>"` (docs/30 §19.2). */
export function expandPlanToCandidates(plano: BatchPlan): Candidate[] {
  const candidatos: Candidate[] = [];
  let n = 0;
  for (const entry of plano.entries) {
    for (let i = 0; i < entry.quantity; i++) {
      n++;
      candidatos.push({
        candidateId: `${plano.loteId}-${n}`,
        skillId: entry.skillId,
        difficulty: entry.difficulty,
        role: entry.role,
        kind: entry.kind,
        meta: {},
        stages: {},
      });
    }
  }
  return candidatos;
}

// ---------------------------------------------------------------------------
// Estágio 1 — Gerar (só `kind: "item"` — `gerar-aula.md` existe, mas montar
// `MicroLessonV2` a partir do JSON de resposta é um orquestrador PRÓPRIO,
// mais complexo (steps intro/teach/question/recap validados por
// `validateLessonSteps`), fora do escopo desta passada; ver docs/32.
// ---------------------------------------------------------------------------

export function buildGerarUserContent(
  c: Pick<Candidate, "skillId" | "difficulty" | "role">,
  skillName: string,
  subjectName: string,
): string {
  return JSON.stringify({
    skillId: c.skillId,
    skillName,
    subjectName,
    difficulty: c.difficulty,
    role: c.role,
  });
}

/** Checagem de FORMA mínima — a validação completa é o estágio 6 (`validate.ts`), determinístico, sobre o item já criticado/corrigido. */
export function parseGerarResponse(raw: string): Exercise {
  const obj = JSON.parse(raw) as Record<string, unknown>;
  if (obj.type !== "multipla-escolha")
    throw new Error(`[gerar] tipo inesperado ou ausente: ${String(obj.type)}`);
  if (
    typeof obj.pergunta !== "string" ||
    !Array.isArray(obj.opcoes) ||
    typeof obj.correta !== "number" ||
    typeof obj.explicacao !== "string"
  ) {
    throw new Error("[gerar] campos obrigatórios ausentes (pergunta/opcoes/correta/explicacao)");
  }
  return obj as unknown as Exercise;
}

// ---------------------------------------------------------------------------
// Estágio 2 — Criticar.
// ---------------------------------------------------------------------------

export function buildCriticarUserContent(skillId: string, exercise: Exercise): string {
  return JSON.stringify({ skillId, exercise });
}

export interface CriticarResponse {
  verdict: CritiqueVerdict;
  issues: string[];
  fixed?: Exercise;
}

export function parseCriticarResponse(raw: string): CriticarResponse {
  const obj = JSON.parse(raw) as Record<string, unknown>;
  if (obj.verdict !== "aprova" && obj.verdict !== "corrige" && obj.verdict !== "rejeita") {
    throw new Error(`[criticar] verdict inválido: ${String(obj.verdict)}`);
  }
  return {
    verdict: obj.verdict,
    issues: Array.isArray(obj.issues) ? (obj.issues as string[]) : [],
    fixed: obj.fixed as Exercise | undefined,
  };
}

/** O exercício "vigente" depois da crítica: o corrigido, se houve correção; senão o original. */
export function exerciseAposCritica(original: Exercise, critique: CriticarResponse): Exercise {
  return critique.verdict === "corrige" && critique.fixed ? critique.fixed : original;
}

// ---------------------------------------------------------------------------
// Estágio 3+4(+4b) — Resolver (sem gabarito) + verificar (determinístico) +
// escalar (só em desacordo) — um comando só, como o README documenta.
// ---------------------------------------------------------------------------

export function buildResolverUserContent(exercise: Exercise): string {
  if (exercise.type !== "multipla-escolha")
    throw new Error("[resolver] só multipla-escolha suportado nesta passada");
  return JSON.stringify({ pergunta: exercise.pergunta, opcoes: exercise.opcoes });
}

export interface ResolverResponse {
  answerIndex: number | number[];
  confidence: number;
  reasoning: string;
}

export function parseResolverResponse(raw: string): ResolverResponse {
  const obj = JSON.parse(raw) as Record<string, unknown>;
  if (
    (typeof obj.answerIndex !== "number" && !Array.isArray(obj.answerIndex)) ||
    typeof obj.confidence !== "number"
  ) {
    throw new Error("[resolver] answerIndex/confidence ausentes ou com tipo errado");
  }
  return {
    answerIndex: obj.answerIndex as number | number[],
    confidence: obj.confidence,
    reasoning: typeof obj.reasoning === "string" ? obj.reasoning : "",
  };
}

export function buildEscalarUserContent(
  exercise: Exercise & { type: "multipla-escolha" },
  gabaritoGerador: number,
  respostaSolucionador: number | number[],
  raciocinioSolucionador: string,
  confiancaSolucionador: number,
): string {
  return JSON.stringify({
    pergunta: exercise.pergunta,
    opcoes: exercise.opcoes,
    gabaritoGerador,
    respostaSolucionador,
    raciocinioSolucionador,
    confiancaSolucionador,
  });
}

export interface EscalarResponse {
  veredito: "gerador" | "solucionador" | "ambiguo";
  note?: string;
}

export function parseEscalarResponse(raw: string): EscalarResponse {
  const obj = JSON.parse(raw) as Record<string, unknown>;
  if (obj.veredito !== "gerador" && obj.veredito !== "solucionador" && obj.veredito !== "ambiguo") {
    throw new Error(`[escalar] veredito inválido: ${String(obj.veredito)}`);
  }
  return { veredito: obj.veredito, note: typeof obj.note === "string" ? obj.note : undefined };
}

// ---------------------------------------------------------------------------
// Estágio 5 — Humanizar (texto puro, `jsonMode: false`) + guarda determinística.
// ---------------------------------------------------------------------------

export function buildHumanizarUserContent(explicacaoOriginal: string): string {
  return explicacaoOriginal;
}

export interface HumanizeResult {
  explicacaoFinal: string;
  accepted: boolean;
  rejectedBecause?: string[];
}

export function aplicarHumanizacao(original: string, reescrita: string): HumanizeResult {
  const guarda = humanizeGuard(original, reescrita);
  if (!guarda.accepted)
    return { explicacaoFinal: original, accepted: false, rejectedBecause: guarda.rejectedBecause };
  return { explicacaoFinal: reescrita, accepted: true };
}

// ---------------------------------------------------------------------------
// Orquestração (I/O real) — só roda como CLI, nunca ao importar o módulo.
// ---------------------------------------------------------------------------

function loadPrompt(nome: string): string {
  return readFileSync(`content-pipeline/prompts/${nome}.md`, "utf-8");
}

interface ModelosPorEstagio {
  gerar: string;
  criticar: string;
  resolver: string;
  escalar: string;
  humanizar: string;
}

function modelosDoEnv(): ModelosPorEstagio {
  return {
    gerar: process.env.CONTENT_LLM_MODEL_GERAR ?? "",
    criticar: process.env.CONTENT_LLM_MODEL_CRITICAR ?? "",
    resolver: process.env.CONTENT_LLM_MODEL_RESOLVER ?? "",
    escalar: process.env.CONTENT_LLM_MODEL_ESCALAR ?? "",
    humanizar: process.env.CONTENT_LLM_MODEL_HUMANIZAR ?? "",
  };
}

/** Roda `tarefas` em lotes de `concurrency`, sequencial entre lotes (evita estourar rate limit). */
async function emLotes<T>(
  itens: T[],
  concurrency: number,
  tarefa: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < itens.length; i += concurrency) {
    await Promise.all(itens.slice(i, i + concurrency).map(tarefa));
  }
}

export async function rodarGerar(
  loteId: string,
  baseUrl: string,
  apiKey: string,
  modelo: string,
  concurrency: number,
  orcamento: OrcamentoTokens,
): Promise<void> {
  const { activeSkills, SKILL_MAP } = await import("@/content/taxonomy");
  const { SUBJECT_MAP } = await import("@/data/subjects");
  void activeSkills;

  const plano = readJSONFileOrThrow<BatchPlan>(lotePath(loteId, "01-plano.json"));
  const candidatos = expandPlanToCandidates(plano).filter((c) => c.kind === "item");
  const outPath = lotePath(loteId, "02-gerado.jsonl");
  const jaProcessados = idsJaProcessados(readLines(outPath));
  const pendentes = candidatosPendentes(candidatos, jaProcessados);
  console.log(
    `[gerar] ${pendentes.length} pendente(s) de ${candidatos.length} (${jaProcessados.size} já feito(s))`,
  );

  const sistema = loadPrompt("gerar-item");
  await emLotes(pendentes, concurrency, async (c) => {
    if (orcamento.esgotado()) return;
    const skill = SKILL_MAP[c.skillId];
    const subjectName = SUBJECT_MAP[c.skillId.split(":")[0]]?.name ?? c.skillId.split(":")[0];
    const userContent = buildGerarUserContent(c, skill?.name ?? c.skillId, subjectName);
    const r = await callStage(baseUrl, apiKey, modelo, sistema, userContent, parseGerarResponse);
    orcamento.registrar(r.usage);
    if (!r.ok || !r.data) {
      console.error(`[gerar] falhou ${c.candidateId}: ${r.error}`);
      return;
    }
    const atualizado: Candidate = {
      ...c,
      exercise: r.data,
      stages: { ...c.stages, generated: { model: modelo, at: new Date().toISOString() } },
    };
    appendJSONL(outPath, atualizado);
  });
}

export async function rodarCriticar(
  loteId: string,
  baseUrl: string,
  apiKey: string,
  modelo: string,
  concurrency: number,
  orcamento: OrcamentoTokens,
): Promise<void> {
  const candidatos = readJSONL<Candidate>(lotePath(loteId, "02-gerado.jsonl"));
  const outPath = lotePath(loteId, "03-critica.jsonl");
  const jaProcessados = idsJaProcessados(readLines(outPath));
  const pendentes = candidatosPendentes(candidatos, jaProcessados);
  console.log(`[criticar] ${pendentes.length} pendente(s) de ${candidatos.length}`);

  const sistema = loadPrompt("criticar");
  await emLotes(pendentes, concurrency, async (c) => {
    if (orcamento.esgotado() || !c.exercise) return;
    const userContent = buildCriticarUserContent(c.skillId, c.exercise);
    const r = await callStage(baseUrl, apiKey, modelo, sistema, userContent, parseCriticarResponse);
    orcamento.registrar(r.usage);
    if (!r.ok || !r.data) {
      console.error(`[criticar] falhou ${c.candidateId}: ${r.error}`);
      return;
    }
    const exerciseFinal = exerciseAposCritica(c.exercise!, r.data);
    const atualizado: Candidate = {
      ...c,
      exercise: exerciseFinal,
      stages: {
        ...c.stages,
        critique: {
          model: modelo,
          verdict: r.data.verdict,
          issues: r.data.issues,
          fixed: r.data.fixed,
        },
      },
    };
    appendJSONL(outPath, atualizado);
  });
}

export async function rodarResolver(
  loteId: string,
  baseUrl: string,
  apiKey: string,
  modelos: Pick<ModelosPorEstagio, "resolver" | "escalar">,
  concurrency: number,
  orcamento: OrcamentoTokens,
): Promise<void> {
  const candidatos = readJSONL<Candidate>(lotePath(loteId, "03-critica.jsonl")).filter(
    (c) => c.stages.critique?.verdict !== "rejeita",
  );
  const outPath = lotePath(loteId, "04-solucao.jsonl");
  const jaProcessados = idsJaProcessados(readLines(outPath));
  const pendentes = candidatosPendentes(candidatos, jaProcessados);
  console.log(
    `[resolver] ${pendentes.length} pendente(s) de ${candidatos.length} (rejeitados na crítica já ficaram de fora)`,
  );

  const sistemaResolver = loadPrompt("resolver");
  const sistemaEscalar = loadPrompt("escalar");
  let conflitos = 0;

  await emLotes(pendentes, concurrency, async (c) => {
    if (orcamento.esgotado() || !c.exercise || c.exercise.type !== "multipla-escolha") return;
    const exercise = c.exercise;
    const userContent = buildResolverUserContent(exercise);
    const rSolucao = await callStage(
      baseUrl,
      apiKey,
      modelos.resolver,
      sistemaResolver,
      userContent,
      parseResolverResponse,
    );
    orcamento.registrar(rSolucao.usage);
    if (!rSolucao.ok || !rSolucao.data) {
      console.error(`[resolver] falhou ${c.candidateId}: ${rSolucao.error}`);
      return;
    }

    const outcome = verify(exercise.correta, rSolucao.data.answerIndex, rSolucao.data.confidence);
    let candidatoFinal: Candidate = {
      ...c,
      stages: {
        ...c.stages,
        solution: {
          model: modelos.resolver,
          answerIndex: rSolucao.data.answerIndex,
          confidence: rSolucao.data.confidence,
          reasoning: rSolucao.data.reasoning,
        },
      },
    };

    if (outcome.agree) {
      candidatoFinal = {
        ...candidatoFinal,
        stages: { ...candidatoFinal.stages, verification: outcome },
      };
    } else {
      conflitos++;
      const userEscalar = buildEscalarUserContent(
        exercise,
        exercise.correta,
        rSolucao.data.answerIndex,
        rSolucao.data.reasoning,
        rSolucao.data.confidence,
      );
      const rEscalar = await callStage(
        baseUrl,
        apiKey,
        modelos.escalar,
        sistemaEscalar,
        userEscalar,
        parseEscalarResponse,
      );
      orcamento.registrar(rEscalar.usage);
      if (!rEscalar.ok || !rEscalar.data) {
        console.error(`[resolver/escalar] falhou ${c.candidateId}: ${rEscalar.error}`);
        return;
      }
      const veredito = resolveEscalation(
        rEscalar.data.veredito,
        exercise.correta,
        rSolucao.data.answerIndex,
        modelos.escalar,
        rEscalar.data.note,
      );
      candidatoFinal = {
        ...candidatoFinal,
        stages: {
          ...candidatoFinal.stages,
          verification:
            "rejected" in veredito
              ? { agree: false, escalated: true }
              : {
                  agree: false,
                  escalated: true,
                  finalAnswer: veredito.finalAnswer,
                  judge: veredito.judge,
                  note: veredito.note,
                },
        },
      };
    }
    const verificacao = candidatoFinal.stages.verification;
    if (verificacao && "finalAnswer" in verificacao && typeof verificacao.finalAnswer === "number") {
      // O juiz pode ter dado razão ao solucionador: o gabarito publicado é o finalAnswer, não o do gerador.
      const corrigido = { ...exercise, correta: verificacao.finalAnswer };
      candidatoFinal = {
        ...candidatoFinal,
        exercise: balancearPosicaoGabarito(corrigido, c.candidateId),
      };
    }
    appendJSONL(outPath, candidatoFinal);
  });

  const taxaConflito = pendentes.length > 0 ? conflitos / pendentes.length : 0;
  if (taxaConflito > 0.15) {
    console.warn(
      `[resolver] BLOQUEIO: taxa de conflito ${(taxaConflito * 100).toFixed(1)}% acima de 15% — revisar o prompt do estágio 1/2 antes de publicar (docs/30 §19, README "Bloqueio automático").`,
    );
  }
}

export async function rodarHumanizar(
  loteId: string,
  baseUrl: string,
  apiKey: string,
  modelo: string,
  concurrency: number,
  orcamento: OrcamentoTokens,
): Promise<void> {
  const candidatos = readJSONL<Candidate>(lotePath(loteId, "04-solucao.jsonl")).filter(
    (c) =>
      c.stages.verification?.agree === true ||
      (c.stages.verification?.escalated === true && "finalAnswer" in c.stages.verification),
  );
  const outPath = lotePath(loteId, "06-humanizado.jsonl");
  const jaProcessados = idsJaProcessados(readLines(outPath));
  const pendentes = candidatosPendentes(candidatos, jaProcessados);
  console.log(`[humanizar] ${pendentes.length} pendente(s) de ${candidatos.length}`);

  const sistema = loadPrompt("humanizar");
  await emLotes(pendentes, concurrency, async (c) => {
    if (orcamento.esgotado() || !c.exercise) return;
    const original = c.exercise.explicacao;
    const r = await callStage(
      baseUrl,
      apiKey,
      modelo,
      sistema,
      buildHumanizarUserContent(original),
      (raw) => raw.trim(),
      false,
    );
    orcamento.registrar(r.usage);
    if (!r.ok || r.data === undefined) {
      console.error(`[humanizar] falhou ${c.candidateId}: ${r.error}`);
      appendJSONL(outPath, c); // sem humanização, segue com o texto original — nunca bloqueia o lote por causa disto.
      return;
    }
    const resultado = aplicarHumanizacao(original, r.data);
    const atualizado: Candidate = {
      ...c,
      exercise: { ...c.exercise, explicacao: resultado.explicacaoFinal },
      stages: {
        ...c.stages,
        humanized: {
          model: modelo,
          accepted: resultado.accepted,
          rejectedBecause: resultado.rejectedBecause,
        },
      },
    };
    appendJSONL(outPath, atualizado);
  });
}

export class OrcamentoTokens {
  private usados = 0;
  constructor(private readonly limite: number | undefined) {}
  registrar(usage?: { promptTokens: number; completionTokens: number }): void {
    if (usage) this.usados += usage.promptTokens + usage.completionTokens;
  }
  esgotado(): boolean {
    if (this.limite === undefined) return false;
    const esgotou = this.usados >= this.limite;
    if (esgotou)
      console.warn(
        `[orçamento] limite de ${this.limite} tokens atingido (${this.usados} usados) — restante do lote pulado.`,
      );
    return esgotou;
  }
  total(): number {
    return this.usados;
  }
}

function readJSONFileOrThrow<T>(path: string): T {
  if (!existsSync(path))
    throw new Error(`arquivo não encontrado: ${path} (rode plan-batch.ts primeiro)`);
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag: string) =>
    args
      .find((a) => a.startsWith(`--${flag}=`))
      ?.split("=")
      .slice(1)
      .join("=");
  const loteId = get("lote");
  const estagio = get("estagio");
  const concurrency = Number(get("concurrency") ?? "4");
  const budgetTokens = get("budget-tokens") ? Number(get("budget-tokens")) : undefined;

  if (!loteId || !estagio) {
    console.error(
      "Uso: bun scripts/content/run-stage.ts --lote=<id> --estagio=gerar|criticar|resolver|humanizar [--concurrency=4] [--budget-tokens=N]",
    );
    process.exit(1);
  }

  const baseUrl = process.env.CONTENT_LLM_BASE_URL;
  const apiKey = process.env.CONTENT_LLM_API_KEY;
  if (!baseUrl || !apiKey) {
    console.error(
      "CONTENT_LLM_BASE_URL / CONTENT_LLM_API_KEY não configurados — ver .env.example. Nada foi chamado.",
    );
    process.exit(1);
  }

  const modelos = modelosDoEnv();
  const orcamento = new OrcamentoTokens(budgetTokens);

  if (estagio === "gerar")
    await rodarGerar(loteId, baseUrl, apiKey, modelos.gerar, concurrency, orcamento);
  else if (estagio === "criticar")
    await rodarCriticar(loteId, baseUrl, apiKey, modelos.criticar, concurrency, orcamento);
  else if (estagio === "resolver")
    await rodarResolver(loteId, baseUrl, apiKey, modelos, concurrency, orcamento);
  else if (estagio === "humanizar")
    await rodarHumanizar(loteId, baseUrl, apiKey, modelos.humanizar, concurrency, orcamento);
  else {
    console.error(`Estágio desconhecido: "${estagio}". Use gerar|criticar|resolver|humanizar.`);
    process.exit(1);
  }

  console.log(
    `[run-stage] lote=${loteId} estágio=${estagio} — tokens usados nesta chamada: ${orcamento.total()}`,
  );
}

if (import.meta.main) {
  await main();
}

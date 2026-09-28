/**
 * I/O de arquivo de um lote (docs/30 §19.2/§19.3, Fase 9/11 do docs/31) —
 * cada estágio lê o JSONL do estágio anterior e escreve o seu, sempre em
 * `content-pipeline/lotes/<loteId>/` (gitignored — dado bruto, não
 * versionado). Funções pequenas, sem lógica de negócio, pra `run-stage.ts`/
 * `publish.ts` não duplicar leitura/escrita/append.
 */
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function loteDir(loteId: string): string {
  return `content-pipeline/lotes/${loteId}`;
}

export function lotePath(loteId: string, arquivo: string): string {
  return `${loteDir(loteId)}/${arquivo}`;
}

function garantirDiretorio(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/** Linhas cruas de um `.jsonl` — `[]` se o arquivo ainda não existe. Sem parse (quem chama decide o que fazer com linha corrompida — ver `idsJaProcessados`). */
export function readLines(path: string): string[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf-8").split("\n");
}

/** Lê um `.jsonl` já parseado — devolve `[]` se o arquivo ainda não existe (1ª rodada do estágio). Ignora linhas vazias/corrompidas. */
export function readJSONL<T>(path: string): T[] {
  const out: T[] = [];
  for (const linha of readLines(path)) {
    if (!linha.trim()) continue;
    try {
      out.push(JSON.parse(linha) as T);
    } catch {
      // linha corrompida (interrupção no meio da escrita anterior) — ignora, será reprocessada.
    }
  }
  return out;
}

/** Acrescenta UMA linha — nunca reescreve o arquivo inteiro, pra uma interrupção no meio nunca perder o que já foi processado. */
export function appendJSONL(path: string, obj: unknown): void {
  garantirDiretorio(path);
  appendFileSync(path, `${JSON.stringify(obj)}\n`, "utf-8");
}

export function readJSON<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export function writeJSON(path: string, obj: unknown): void {
  garantirDiretorio(path);
  writeFileSync(path, `${JSON.stringify(obj, null, 2)}\n`, "utf-8");
}

export function writeText(path: string, texto: string): void {
  garantirDiretorio(path);
  writeFileSync(path, texto, "utf-8");
}

/**
 * Funções de servidor da sincronização de estudo (docs/specs/46-producao T-06.3).
 * O `userId` vem só da sessão; a entrada é validada pelo contrato de `src/lib/sync/contrato.ts`.
 * Os módulos de `src/server/**` só são usados dentro dos `handler` (fronteira que o
 * `importProtection` reconhece: nada disso vai para o bundle do navegador).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { JsonObjeto } from "@/lib/json";
import { pedidoEnvio, type Agregado, type RespostaEnvio } from "@/lib/sync/contrato";
import { banco } from "@/server/db/client";
import { estadoDoAluno, salvarDocumentoDoAluno } from "@/server/estudo/documento";
import { importarEstado } from "@/server/estudo/importar";
import { aplicarEventos } from "@/server/estudo/sincronizar";
import { pedidoImportacao, type ResumoImportacao } from "@/lib/sync/importacao";
import { checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";

/** Teto do documento de planejamento (bytes de JSON). */
export const LIMITE_DOCUMENTO = 512 * 1024;

export const enviarEventos = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoEnvio.parse(d))
  .handler(async ({ data }): Promise<RespostaEnvio | { ok: false; codigo: string }> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `sync:${s.userId}`, 60, 30);
      return await aplicarEventos(db, s.userId, data.eventos);
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export interface EstadoRemoto {
  ok: true;
  agregado: Agregado;
  documento: { rev: number; schemaVersion: number; doc: JsonObjeto } | null;
}

export const obterEstado = createServerFn({ method: "GET" }).handler(async (): Promise<EstadoRemoto | { ok: false; codigo: string }> => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    return { ok: true, ...(await estadoDoAluno(db, s.userId)) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

const pedidoDocumento = z.object({
  /** Revisão que o cliente viu por último (concorrência otimista). */
  rev: z.number().int().min(0),
  schemaVersion: z.number().int().min(1).max(100),
  doc: z.record(z.string(), z.unknown()).transform((d) => d as JsonObjeto),
});

export const salvarDocumento = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const p = pedidoDocumento.parse(d);
    if (JSON.stringify(p.doc).length > LIMITE_DOCUMENTO) throw new Error("documento grande demais");
    return p;
  })
  .handler(async ({ data }): Promise<{ ok: true; rev: number } | { ok: false; codigo: string; rev?: number }> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `doc:${s.userId}`, 60, 30);
      return await salvarDocumentoDoAluno(db, s.userId, data);
    } catch (e) {
      return respostaDeErro(e);
    }
  });

/**
 * Importa o progresso que ficou no aparelho de antes da conta (docs/specs/46-producao T-07.1). Uma vez por
 * aparelho e conta (`importId`); o servidor recalcula tudo e limita o XP ao que o aparelho mostrava.
 */
export const importarEstadoLocal = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoImportacao.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; resumo: ResumoImportacao; agregado: Agregado } | { ok: false; codigo: string }> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `importar:${s.userId}`, 3600, 5);
      const r = await importarEstado(db, s.userId, data);
      return { ok: true, ...r };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

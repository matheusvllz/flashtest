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
import { learningDoc } from "@/server/db/schema";
import { agregadoDoAluno, aplicarEventos } from "@/server/estudo/sincronizar";
import { checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import { eq, sql } from "drizzle-orm";

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
    const [doc] = await db.select().from(learningDoc).where(eq(learningDoc.userId, s.userId)).limit(1);
    return {
      ok: true,
      agregado: await agregadoDoAluno(db, s.userId),
      documento: doc ? { rev: doc.rev, schemaVersion: doc.schemaVersion, doc: doc.doc } : null,
    };
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
      // Grava só se a revisão bate (ou se ainda não existe documento e o cliente mandou 0).
      const r = await db
        .insert(learningDoc)
        .values({ userId: s.userId, rev: 1, schemaVersion: data.schemaVersion, doc: data.doc })
        .onConflictDoUpdate({
          target: learningDoc.userId,
          set: { rev: sql`${learningDoc.rev} + 1`, schemaVersion: data.schemaVersion, doc: data.doc, updatedAt: sql`now()` },
          setWhere: sql`${learningDoc.rev} = ${data.rev}`,
        })
        .returning({ rev: learningDoc.rev });
      if (r.length) return { ok: true, rev: r[0].rev };
      const [atual] = await db.select({ rev: learningDoc.rev }).from(learningDoc).where(eq(learningDoc.userId, s.userId));
      return { ok: false, codigo: "CONFLITO", rev: atual?.rev };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

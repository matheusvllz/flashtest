/**
 * Documento de planejamento do aluno (`learning_doc`, 46 §E.4; lógica extraída das funções de servidor na spec 48
 * T-48.1.1 para ser testada com duas contas). Concorrência otimista por `rev`; nunca é autoridade de recompensa.
 */
import { eq, sql } from "drizzle-orm";
import type { JsonObjeto } from "@/lib/json";
import type { Agregado } from "@/lib/sync/contrato";
import type { Banco } from "../db/client";
import { learningDoc } from "../db/schema";
import { agregadoDoAluno } from "./sincronizar";

export interface EstadoDoAluno {
  agregado: Agregado;
  documento: { rev: number; schemaVersion: number; doc: JsonObjeto } | null;
}

export async function estadoDoAluno(db: Banco, userId: string): Promise<EstadoDoAluno> {
  const [doc] = await db.select().from(learningDoc).where(eq(learningDoc.userId, userId)).limit(1);
  return {
    agregado: await agregadoDoAluno(db, userId),
    documento: doc ? { rev: doc.rev, schemaVersion: doc.schemaVersion, doc: doc.doc } : null,
  };
}

/** Grava só se a revisão bate (ou se ainda não existe documento). Conflito devolve a revisão atual **do próprio aluno**. */
export async function salvarDocumentoDoAluno(
  db: Banco,
  userId: string,
  p: { rev: number; schemaVersion: number; doc: JsonObjeto },
): Promise<{ ok: true; rev: number } | { ok: false; codigo: "CONFLITO"; rev?: number }> {
  const r = await db
    .insert(learningDoc)
    .values({ userId, rev: 1, schemaVersion: p.schemaVersion, doc: p.doc })
    .onConflictDoUpdate({
      target: learningDoc.userId,
      set: { rev: sql`${learningDoc.rev} + 1`, schemaVersion: p.schemaVersion, doc: p.doc, updatedAt: sql`now()` },
      setWhere: sql`${learningDoc.rev} = ${p.rev}`,
    })
    .returning({ rev: learningDoc.rev });
  if (r.length) return { ok: true, rev: r[0].rev };
  const [atual] = await db.select({ rev: learningDoc.rev }).from(learningDoc).where(eq(learningDoc.userId, userId));
  return { ok: false, codigo: "CONFLITO", rev: atual?.rev };
}

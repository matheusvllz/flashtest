/**
 * Exclusão de conta (46 §E.6, T-09.2; spec 48 T-48.3.2). Os dados do aluno saem em cascata (`on delete cascade` em
 * toda tabela com `user_id`); aqui fica só o que vem depois: o registro de auditoria **sem** o id em claro (hash) e
 * sem conteúdo. O e-mail de confirmação é enviado pelo hook do Better Auth (`src/server/auth/index.ts`).
 */
import { createHash, randomUUID } from "node:crypto";
import type { Banco } from "../db/client";
import { auditEvent } from "../db/schema";

/** Hash do id para a auditoria: dá para provar que "uma conta foi excluída", não quem era. */
export function hashDoUsuario(userId: string): string {
  return `sha256:${createHash("sha256").update(userId).digest("hex").slice(0, 32)}`;
}

export async function registrarExclusao(db: Banco, userId: string): Promise<void> {
  await db.insert(auditEvent).values({ id: randomUUID(), userId: hashDoUsuario(userId), type: "conta_excluida" });
}

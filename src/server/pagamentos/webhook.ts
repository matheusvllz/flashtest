/**
 * Idempotência do webhook (spec 49 T-49.3.3): registra o evento antes de agir; repetido e já processado não faz nada.
 * Um evento registrado mas que falhou (sem `processado_em`) é processado de novo na próxima entrega.
 */
import { timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { Banco } from "../db/client";
import { eventoPagamento } from "../db/schema";
import { processarEvento, type ResultadoDoEvento } from "./processar";
import type { EventoDePagamento, Provedor } from "./tipos";

export async function registrarEProcessar(
  db: Banco,
  p: Provedor,
  ev: EventoDePagamento,
  agora: Date,
): Promise<ResultadoDoEvento | "repetido"> {
  await db.insert(eventoPagamento).values({ provedor: p.nome, idEvento: ev.id, tipo: ev.tipo }).onConflictDoNothing();
  const [registrado] = await db
    .select({ processadoEm: eventoPagamento.processadoEm })
    .from(eventoPagamento)
    .where(and(eq(eventoPagamento.provedor, p.nome), eq(eventoPagamento.idEvento, ev.id)))
    .limit(1);
  if (registrado?.processadoEm) return "repetido";
  const resultado = await processarEvento(db, p, ev, agora);
  await db
    .update(eventoPagamento)
    .set({ processadoEm: agora, resultado })
    .where(and(eq(eventoPagamento.provedor, p.nome), eq(eventoPagamento.idEvento, ev.id)));
  return resultado;
}

/** Token do cabeçalho `asaas-access-token` em tempo constante. Sem token configurado, nada passa. */
export function tokenValido(recebido: string | null, esperado: string | undefined): boolean {
  if (!esperado) return false;
  const a = Buffer.from(recebido ?? "");
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

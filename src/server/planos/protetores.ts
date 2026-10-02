/**
 * Protetores de sequência por plano e compra avulsa (spec 49 D49-05, T-49.7.1, T-49.7.2).
 *
 * - Bônus do plano: Basic +2 e Pro +5 por mês de assinatura, DERIVADOS das assinaturas (sem tarefa agendada e sem
 *   linha gravada): um crédito no início e outro a cada aniversário mensal, enquanto a assinatura valia. Reembolsada
 *   ou pendente não dá bônus.
 * - Compras: `protetor_credito` (chave `compra:<id>`); estorno grava `estorno:<id>` negativo.
 * - Teto: o do plano vigente (`protetoresEstoqueMax`).
 */
import { eq } from "drizzle-orm";
import { BENEFICIOS, type Plano } from "@/lib/planos";
import type { CreditoDeProtetor } from "@/lib/recompensas";
import type { Banco } from "../db/client";
import { assinatura, protetorCredito } from "../db/schema";

const SEM_BONUS = new Set(["pendente", "reembolsada"]);

function mais(data: Date, meses: number): Date {
  const d = new Date(data.getTime());
  d.setUTCMonth(d.getUTCMonth() + meses);
  return d;
}

/** Créditos de bônus mensal de uma lista de assinaturas (puro). */
export function bonusDasAssinaturas(
  lista: readonly { plano: string; estado: string; inicio: Date | null; validoAte: Date | null }[],
  agora: Date,
): CreditoDeProtetor[] {
  const creditos: CreditoDeProtetor[] = [];
  for (const a of lista) {
    if (SEM_BONUS.has(a.estado) || !a.inicio || (a.plano !== "basic" && a.plano !== "pro")) continue;
    const bonus = BENEFICIOS[a.plano as Plano].protetoresBonusMes;
    const fim = a.validoAte && a.validoAte.getTime() < agora.getTime() ? a.validoAte : agora;
    for (let k = 0; k < 240; k++) {
      const quando = mais(a.inicio, k);
      if (quando.getTime() > fim.getTime()) break;
      creditos.push({ dia: quando.toISOString().slice(0, 10), quantidade: bonus });
    }
  }
  return creditos;
}

export async function creditosDeProtetor(db: Banco, userId: string, agora: Date): Promise<CreditoDeProtetor[]> {
  const compras = await db
    .select({ dia: protetorCredito.localDate, quantidade: protetorCredito.quantidade })
    .from(protetorCredito)
    .where(eq(protetorCredito.userId, userId));
  const assinaturas = await db
    .select({ plano: assinatura.plano, estado: assinatura.estado, inicio: assinatura.inicio, validoAte: assinatura.validoAte })
    .from(assinatura)
    .where(eq(assinatura.userId, userId));
  return [...compras, ...bonusDasAssinaturas(assinaturas, agora)];
}

export async function creditarCompraDeProtetores(db: Banco, userId: string, compraId: string, quantidade: number, dia: string): Promise<void> {
  await db.insert(protetorCredito).values({ userId, chave: `compra:${compraId}`, quantidade, motivo: "compra", localDate: dia }).onConflictDoNothing();
}

export async function estornarCompraDeProtetores(db: Banco, userId: string, compraId: string, quantidade: number, dia: string): Promise<void> {
  await db.insert(protetorCredito).values({ userId, chave: `estorno:${compraId}`, quantidade: -quantidade, motivo: "estorno", localDate: dia }).onConflictDoNothing();
}

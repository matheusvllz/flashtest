/**
 * Caderno de erros (spec 49 §5.9 item 2, T-49.9.1). Para quem tem Basic ou Pro, toda resposta errada (ou "Não sei")
 * de lição, prática, checagem e /study entra no caderno e volta em revisão espaçada (1, 3, 7 e 14 dias). Duas revisões
 * certas seguidas resolvem a questão. Se o plano cair, o que já está guardado fica só para leitura (§18).
 */
import { and, asc, eq, lte } from "drizzle-orm";
import type { Banco } from "../db/client";
import { cadernoItem } from "../db/schema";

export const INTERVALOS_DIAS = [1, 3, 7, 14] as const;
export const ACERTOS_PARA_RESOLVER = 2;
const FONTES_DO_CADERNO = new Set(["questao-geral", "atividade", "licao", "checagem"]);

type Executor = Pick<Banco, "select" | "insert" | "update">;

export function maisDias(dia: string, n: number): string {
  return new Date(Date.parse(`${dia}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

export async function registrarNoCaderno(tx: Executor, userId: string, itemId: string, fonte: string, correta: boolean, dia: string): Promise<void> {
  if (!FONTES_DO_CADERNO.has(fonte)) return;
  const [atual] = await tx
    .select()
    .from(cadernoItem)
    .where(and(eq(cadernoItem.userId, userId), eq(cadernoItem.itemId, itemId)))
    .limit(1);
  if (!correta) {
    await tx
      .insert(cadernoItem)
      .values({ userId, itemId, proximaRevisao: maisDias(dia, INTERVALOS_DIAS[0]) })
      .onConflictDoUpdate({
        target: [cadernoItem.userId, cadernoItem.itemId],
        set: { estado: "ativo", etapa: 0, acertosSeguidos: 0, proximaRevisao: maisDias(dia, INTERVALOS_DIAS[0]), atualizadoEm: new Date() },
      });
    return;
  }
  if (!atual || atual.estado !== "ativo" || atual.proximaRevisao > dia) return; // fora do caderno ou ainda não é dia
  const acertos = atual.acertosSeguidos + 1;
  if (acertos >= ACERTOS_PARA_RESOLVER) {
    await tx
      .update(cadernoItem)
      .set({ estado: "resolvido", acertosSeguidos: acertos, atualizadoEm: new Date() })
      .where(and(eq(cadernoItem.userId, userId), eq(cadernoItem.itemId, itemId)));
    return;
  }
  const etapa = Math.min(atual.etapa + 1, INTERVALOS_DIAS.length - 1);
  await tx
    .update(cadernoItem)
    .set({ etapa, acertosSeguidos: acertos, proximaRevisao: maisDias(dia, INTERVALOS_DIAS[etapa]), atualizadoEm: new Date() })
    .where(and(eq(cadernoItem.userId, userId), eq(cadernoItem.itemId, itemId)));
}

export interface ItemDoCaderno {
  itemId: string;
  proximaRevisao: string;
  etapa: number;
  paraHoje: boolean;
}

export async function itensDoCaderno(db: Banco, userId: string, hoje: string): Promise<ItemDoCaderno[]> {
  const linhas = await db
    .select({ itemId: cadernoItem.itemId, proxima: cadernoItem.proximaRevisao, etapa: cadernoItem.etapa })
    .from(cadernoItem)
    .where(and(eq(cadernoItem.userId, userId), eq(cadernoItem.estado, "ativo")))
    .orderBy(asc(cadernoItem.proximaRevisao));
  return linhas.map((l) => ({ itemId: l.itemId, proximaRevisao: l.proxima, etapa: l.etapa, paraHoje: l.proxima <= hoje }));
}

export async function quantosParaHoje(db: Banco, userId: string, hoje: string): Promise<number> {
  const r = await db
    .select({ i: cadernoItem.itemId })
    .from(cadernoItem)
    .where(and(eq(cadernoItem.userId, userId), eq(cadernoItem.estado, "ativo"), lte(cadernoItem.proximaRevisao, hoje)));
  return r.length;
}

/**
 * Plano do aluno, decidido SÓ no servidor (spec 49 D49-08, RF-1; regra dura 5): o maior plano entre as assinaturas
 * que valem agora. Nunca vem do cliente; `profile.plano` é só uma cópia para leitura rápida e relatórios.
 *
 * Vale: assinatura `ativa`, `atrasada` (pagamento atrasado ainda dentro do período pago) ou `cancelada` (cancelar
 * mantém o plano até o fim do período pago), sempre com `valido_ate` no futuro. `pendente`, `reembolsada` e
 * `expirada` não valem.
 */
import { eq } from "drizzle-orm";
import { planoMaior, type Plano } from "@/lib/planos";
import type { Banco } from "../db/client";
import { assinatura, profile } from "../db/schema";

const ESTADOS_QUE_VALEM = new Set(["ativa", "atrasada", "cancelada"]);

export interface AssinaturaResumo {
  plano: string;
  estado: string;
  validoAte: Date | null;
}

/** Puro (testável): o plano a partir das assinaturas do aluno. */
export function planoDasAssinaturas(lista: readonly AssinaturaResumo[], agora: Date): Plano {
  let plano: Plano = "gratis";
  for (const a of lista) {
    if (!ESTADOS_QUE_VALEM.has(a.estado)) continue;
    if (!a.validoAte || a.validoAte.getTime() <= agora.getTime()) continue;
    if (a.plano === "basic" || a.plano === "pro") plano = planoMaior(plano, a.plano);
  }
  return plano;
}

export async function planoDoAluno(db: Banco, userId: string, agora: Date = new Date()): Promise<Plano> {
  const lista = await db
    .select({ plano: assinatura.plano, estado: assinatura.estado, validoAte: assinatura.validoAte })
    .from(assinatura)
    .where(eq(assinatura.userId, userId));
  return planoDasAssinaturas(lista, agora);
}

/** Atualiza a cópia em `profile.plano` (chamado depois de cada evento de pagamento). Devolve o plano vigente. */
export async function sincronizarPlanoNoPerfil(db: Banco, userId: string, agora: Date = new Date()): Promise<Plano> {
  const plano = await planoDoAluno(db, userId, agora);
  await db.insert(profile).values({ userId, plano }).onConflictDoUpdate({ target: profile.userId, set: { plano } });
  return plano;
}

/**
 * Rotinas de retenção (46 §E.6, T-09.3; spec 48 T-48.3.3; docs/seguranca/privacidade.md). Roda uma vez por dia pelo
 * Vercel Cron (`/api/cron/retencao`, protegido por `CRON_SECRET`). Só apaga o que a política manda apagar:
 * - contas nunca verificadas com mais de 7 dias (os dados delas saem em cascata);
 * - `audit_event` com mais de 6 meses;
 * - `ai_usage` e `ai_budget` com mais de 90 dias;
 * - `verification` vencida e `rate_limit` parado há mais de 1 dia.
 * Nada aqui toca conta verificada, tentativa, conclusão, XP ou documento de estudo.
 */
import { and, eq, lt } from "drizzle-orm";
import type { Banco } from "../db/client";
import { aiBudget, aiUsage, auditEvent, rateLimit, user, verification } from "../db/schema";

const DIA = 86_400_000;

function dia(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export interface ResultadoRetencao {
  contasNaoVerificadas: number;
  auditoria: number;
  usoDaIA: number;
  tetoDaIA: number;
  verificacoes: number;
  limites: number;
}

export async function aplicarRetencao(db: Banco, agora = new Date()): Promise<ResultadoRetencao> {
  const n = (r: unknown) => (Array.isArray(r) ? r.length : 0);
  const contas = await db
    .delete(user)
    .where(and(eq(user.emailVerified, false), lt(user.createdAt, new Date(agora.getTime() - 7 * DIA))))
    .returning({ id: user.id });
  const auditoria = await db
    .delete(auditEvent)
    .where(lt(auditEvent.createdAt, new Date(agora.getTime() - 183 * DIA)))
    .returning({ id: auditEvent.id });
  const limiteIA = dia(new Date(agora.getTime() - 90 * DIA));
  const uso = await db.delete(aiUsage).where(lt(aiUsage.day, limiteIA)).returning({ d: aiUsage.day });
  const teto = await db.delete(aiBudget).where(lt(aiBudget.day, limiteIA)).returning({ d: aiBudget.day });
  const verif = await db.delete(verification).where(lt(verification.expiresAt, agora)).returning({ id: verification.id });
  const limites = await db
    .delete(rateLimit)
    .where(lt(rateLimit.lastRequest, agora.getTime() - DIA))
    .returning({ id: rateLimit.id });
  return { contasNaoVerificadas: n(contas), auditoria: n(auditoria), usoDaIA: n(uso), tetoDaIA: n(teto), verificacoes: n(verif), limites: n(limites) };
}

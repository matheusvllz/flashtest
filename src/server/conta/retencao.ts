/**
 * Rotinas de retenção (46 §E.6, T-09.3; spec 48 T-48.3.3; docs/seguranca/privacidade.md). Roda uma vez por dia pelo
 * Vercel Cron (`/api/cron/retencao`, protegido por `CRON_SECRET`). Só apaga o que a política manda apagar:
 * - contas nunca verificadas com mais de 7 dias (os dados delas saem em cascata);
 * - `audit_event` com mais de 6 meses;
 * - `ai_usage` e `ai_budget` com mais de 90 dias;
 * - `verification` vencida e `rate_limit` parado há mais de 1 dia;
 * - ranking (spec 49 §9): quem saiu há mais de 30 dias e os grupos de semanas com mais de 30 dias; `ai_budget_pagos`
 *   com mais de 90 dias.
 * - spec 50 §9: resultados da liga saem com o participante; dupla encerrada há mais de 30 dias; convite com mais de 7;
 *   denúncia resolvida há mais de 90. Bloqueio fica enquanto as duas contas existirem.
 * - lembrete por push (spec 50 §5.2.5, §9): assinatura sem poder entregar há 30 dias — pausada há mais de 30 dias,
 *   ou com falha pendente e sem nenhuma entrega nos últimos 30 dias. (Quem estuda todo dia não recebe lembrete e
 *   continua com a assinatura: "sem entrega" aqui é não conseguir entregar, não não precisar.)
 * Nada aqui toca conta verificada, tentativa, conclusão, XP ou documento de estudo.
 */
import { and, eq, gt, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import type { Banco } from "../db/client";
import {
  aiBudget,
  aiBudgetPagos,
  aiUsage,
  amizade,
  auditEvent,
  comboDia,
  conviteAmizade,
  denuncia,
  ligaResultado,
  missaoDia,
  pushAssinatura,
  rankingGrupo,
  rankingParticipante,
  rateLimit,
  user,
  verification,
} from "../db/schema";

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
  ranking: number;
  /** Spec 50 §9: combo do dia (30 dias) e missões (90 dias). */
  gamificacao: number;
  /** Spec 50 §9: resultados da liga de quem saiu, duplas encerradas (30 dias), convites (7) e denúncias resolvidas (90). */
  social: number;
  /** Spec 50 §5.2.5: assinaturas de push sem poder entregar há 30 dias. */
  lembretes: number;
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
  const tetoPagos = await db.delete(aiBudgetPagos).where(lt(aiBudgetPagos.day, limiteIA)).returning({ d: aiBudgetPagos.day });
  const trintaDias = new Date(agora.getTime() - 30 * DIA);
  // Spec 50 §9: a linha do participante é também o apelido dos amigos e guarda a suspensão por denúncia. Quem saiu da
  // liga há mais de 30 dias sai junto com os resultados da liga — salvo se ainda tem dupla ou pedido aberto, ou está
  // suspenso aguardando revisão.
  const podeSair = and(
    isNotNull(rankingParticipante.saiuEm),
    lt(rankingParticipante.saiuEm, trintaDias),
    isNull(rankingParticipante.socialSuspensoEm),
    sql`not exists (select 1 from ${amizade} where ${amizade.estado} in ('pedido', 'ativa') and (${amizade.userA} = ${rankingParticipante.userId} or ${amizade.userB} = ${rankingParticipante.userId}))`,
  );
  const resultadosLiga = await db
    .delete(ligaResultado)
    .where(sql`${ligaResultado.userId} in (select ${rankingParticipante.userId} from ${rankingParticipante} where ${podeSair})`)
    .returning({ u: ligaResultado.userId });
  const saiu = await db.delete(rankingParticipante).where(podeSair).returning({ id: rankingParticipante.userId });
  // Amigos (spec 50 §5.6.5): dupla encerrada sai em 30 dias; convite em 7; denúncia 90 dias depois de resolvida.
  const duplas = await db
    .delete(amizade)
    .where(and(eq(amizade.estado, "encerrada"), lt(amizade.encerradaEm, trintaDias)))
    .returning({ id: amizade.id });
  const convites = await db
    .delete(conviteAmizade)
    .where(lt(conviteAmizade.criadoEm, new Date(agora.getTime() - 7 * DIA)))
    .returning({ h: conviteAmizade.codigoHash });
  const denuncias = await db
    .delete(denuncia)
    .where(and(isNotNull(denuncia.resolvidaEm), lt(denuncia.resolvidaEm, new Date(agora.getTime() - 90 * DIA))))
    .returning({ id: denuncia.id });
  await db.delete(rankingGrupo).where(lt(rankingGrupo.semana, dia(trintaDias)));
  const combos = await db.delete(comboDia).where(lt(comboDia.localDate, dia(trintaDias))).returning({ d: comboDia.localDate });
  const missoes = await db.delete(missaoDia).where(lt(missaoDia.localDate, limiteIA)).returning({ d: missaoDia.localDate });
  const lembretes = await db
    .delete(pushAssinatura)
    .where(
      or(
        lt(pushAssinatura.pausadaEm, trintaDias),
        and(
          gt(pushAssinatura.falhas, 0),
          lt(pushAssinatura.criadaEm, trintaDias),
          or(sql`${pushAssinatura.ultimoEnvioDia} is null`, lt(pushAssinatura.ultimoEnvioDia, dia(trintaDias))),
        ),
      ),
    )
    .returning({ id: pushAssinatura.id });
  const verif = await db.delete(verification).where(lt(verification.expiresAt, agora)).returning({ id: verification.id });
  const limites = await db
    .delete(rateLimit)
    .where(lt(rateLimit.lastRequest, agora.getTime() - DIA))
    .returning({ id: rateLimit.id });
  return {
    contasNaoVerificadas: n(contas),
    auditoria: n(auditoria),
    usoDaIA: n(uso),
    tetoDaIA: n(teto) + n(tetoPagos),
    verificacoes: n(verif),
    limites: n(limites),
    ranking: n(saiu),
    gamificacao: n(combos) + n(missoes),
    social: n(resultadosLiga) + n(duplas) + n(convites) + n(denuncias),
    lembretes: n(lembretes),
  };
}

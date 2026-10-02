/**
 * Cotas da Foca IA por plano e teto global de custo (spec 48 T-48.2.4; spec 49 D49-10, T-49.2.4).
 *
 * - O plano vem de `planoDoAluno` (assinaturas válidas), nunca do cliente; os limites vêm do catálogo
 *   (`BENEFICIOS` em `src/lib/planos.ts`).
 * - Free: até `AI_COTA_GRATIS_MENSAGENS` por dia (padrão 3, o mesmo do catálogo; a variável é só um ajuste de
 *   emergência); uma foto conta como uma dessas mensagens.
 * - Basic e Pro: mensagens e fotos por dia do catálogo, mais o uso justo do mês (escrito nos termos).
 * - Teto global diário separado: o Free gasta de `ai_budget` (`AI_TETO_DIARIO_USD`); quem paga, de
 *   `ai_budget_pagos` (`AI_TETO_DIARIO_PAGOS_USD`). O Free esgotar o teto dele não derruba o tutor de quem pagou.
 *   Passou do teto, o tutor fica indisponível até o dia seguinte e o estudo segue normalmente.
 *
 * A reserva acontece **antes** da chamada à IA, numa transação com a linha do perfil travada (`for update`): duas
 * chamadas simultâneas do mesmo aluno não passam do limite. Falha técnica da IA devolve a reserva (o fallback local
 * não consome cota, mas também não serve para contorná-la). O teto global é conferido antes de reservar; com várias
 * chamadas ao mesmo tempo ele pode ser ultrapassado em, no máximo, o custo dessas chamadas (algumas frações de
 * centavo cada) — aceitável para um disjuntor.
 *
 * O "dia" é o dia em São Paulo (o mesmo fuso padrão do perfil).
 */
import { and, eq, like, sql } from "drizzle-orm";
import { BENEFICIOS, type Plano } from "@/lib/planos";
import type { Env } from "../env";
import type { Banco } from "../db/client";
import { aiBudget, aiBudgetPagos, aiUsage, profile } from "../db/schema";
import { ErroApp } from "../http";
import { planoDoAluno } from "../planos/plano";

export function diaDaCota(agora: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
}

type Limites = Pick<Env, "AI_COTA_GRATIS_MENSAGENS" | "AI_TETO_DIARIO_USD" | "AI_TETO_DIARIO_PAGOS_USD">;

interface LimitesDoPlano {
  pago: boolean;
  mensagensDia: number;
  /** `null` no Free: a foto conta como mensagem, sem cota própria. */
  fotosDia: number | null;
  usoJustoMes: number | null;
}

function limitesDoPlano(plano: Plano, limites: Limites): LimitesDoPlano {
  if (plano === "gratis") return { pago: false, mensagensDia: limites.AI_COTA_GRATIS_MENSAGENS, fotosDia: null, usoJustoMes: null };
  const b = BENEFICIOS[plano];
  return { pago: true, mensagensDia: b.iaMensagensDia, fotosDia: b.iaFotosDia, usoJustoMes: b.iaUsoJustoMes };
}

async function tetoEstourado(db: Banco, dia: string, pago: boolean, limites: Limites): Promise<boolean> {
  const tabela = pago ? aiBudgetPagos : aiBudget;
  const teto = pago ? limites.AI_TETO_DIARIO_PAGOS_USD : limites.AI_TETO_DIARIO_USD;
  const [gasto] = await db.select({ c: tabela.costMicros }).from(tabela).where(eq(tabela.day, dia));
  return (gasto?.c ?? 0) >= teto * 1_000_000;
}

/** Mensagens do mês até agora (uso justo). `dia` é AAAA-MM-DD, então o mês é o prefixo AAAA-MM. */
async function mensagensDoMes(db: Pick<Banco, "select">, userId: string, dia: string): Promise<number> {
  const [r] = await db
    .select({ total: sql<number>`coalesce(sum(${aiUsage.messages}), 0)::int` })
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), like(aiUsage.day, `${dia.slice(0, 7)}-%`)));
  return r?.total ?? 0;
}

/** Custo em micro-dólares pelo `usage` devolvido pela API e pela tabela de preço configurada (US$ por milhão de tokens). */
export function custoMicros(usage: { entrada: number; saida: number }, preco: { entrada: number; saida: number }): number {
  return Math.ceil(usage.entrada * preco.entrada + usage.saida * preco.saida); // tokens × US$/Mtok = micro-dólares
}

/**
 * Reserva uma mensagem (e uma foto, se houver). Lança `ErroApp(429, "COTA_ESGOTADA")` ou
 * `ErroApp(503, "TETO_GLOBAL")`. Devolve quantas mensagens restam hoje depois desta.
 */
export async function reservarMensagem(
  db: Banco,
  userId: string,
  comFoto: boolean,
  agora: Date,
  limites: Limites,
): Promise<{ restantes: number; pago: boolean }> {
  const dia = diaDaCota(agora);
  const lim = limitesDoPlano(await planoDoAluno(db, userId, agora), limites);
  if (await tetoEstourado(db, dia, lim.pago, limites)) throw new ErroApp(503, "TETO_GLOBAL");

  return db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    // A trava na linha do perfil serializa as reservas do mesmo aluno (duas abas não passam do limite).
    await tx.select({ userId: profile.userId }).from(profile).where(eq(profile.userId, userId)).for("update");
    await tx.insert(aiUsage).values({ userId, day: dia }).onConflictDoNothing();
    const [u] = await tx
      .select({ m: aiUsage.messages, f: aiUsage.images })
      .from(aiUsage)
      .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dia)));
    const msgs = u?.m ?? 0;
    const fotos = u?.f ?? 0;
    const teto = lim.mensagensDia;
    if (msgs >= teto) throw new ErroApp(429, "COTA_ESGOTADA");
    if (comFoto && lim.fotosDia !== null && fotos >= lim.fotosDia) throw new ErroApp(429, "COTA_ESGOTADA");
    if (lim.usoJustoMes !== null && (await mensagensDoMes(tx, userId, dia)) >= lim.usoJustoMes) {
      throw new ErroApp(429, "COTA_ESGOTADA");
    }
    await tx
      .update(aiUsage)
      .set({ messages: sql`${aiUsage.messages} + 1`, images: sql`${aiUsage.images} + ${comFoto ? 1 : 0}` })
      .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dia)));
    return { restantes: Math.max(0, teto - msgs - 1), pago: lim.pago };
  });
}

/** Leitura sem trava: ainda há cota? (Para não moderar nem chamar nada para quem já esgotou.) */
export async function cotaDisponivel(db: Banco, userId: string, comFoto: boolean, agora: Date, limites: Limites): Promise<boolean> {
  const dia = diaDaCota(agora);
  const lim = limitesDoPlano(await planoDoAluno(db, userId, agora), limites);
  const [u] = await db.select({ m: aiUsage.messages, f: aiUsage.images }).from(aiUsage).where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dia)));
  if ((u?.m ?? 0) >= lim.mensagensDia) return false;
  if (comFoto && lim.fotosDia !== null && (u?.f ?? 0) >= lim.fotosDia) return false;
  if (lim.usoJustoMes !== null && (await mensagensDoMes(db, userId, dia)) >= lim.usoJustoMes) return false;
  return true;
}

/** Devolve a reserva quando a IA falhou por motivo técnico. */
export async function devolverMensagem(db: Banco, userId: string, comFoto: boolean, agora: Date): Promise<void> {
  const dia = diaDaCota(agora);
  await db
    .update(aiUsage)
    .set({
      messages: sql`greatest(${aiUsage.messages} - 1, 0)`,
      images: sql`greatest(${aiUsage.images} - ${comFoto ? 1 : 0}, 0)`,
    })
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dia)));
}

/** Soma tokens e custo no uso do aluno e no teto global do dia (só números; nunca conteúdo — D-13). */
export async function registrarCusto(
  db: Banco,
  userId: string,
  agora: Date,
  usage: { entrada: number; saida: number },
  micros: number,
  pago = false,
): Promise<void> {
  const dia = diaDaCota(agora);
  await db
    .update(aiUsage)
    .set({
      inputTokens: sql`${aiUsage.inputTokens} + ${usage.entrada}`,
      outputTokens: sql`${aiUsage.outputTokens} + ${usage.saida}`,
      costMicros: sql`${aiUsage.costMicros} + ${micros}`,
    })
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dia)));
  await registrarCustoGlobal(db, agora, micros, pago);
}

/** Só o teto global (custo estimado de uma chamada que falhou sem devolver o uso), no grupo do aluno (D49-10). */
export async function registrarCustoGlobal(db: Banco, agora: Date, micros: number, pago = false): Promise<void> {
  if (micros <= 0) return;
  const tabela = pago ? aiBudgetPagos : aiBudget;
  await db
    .insert(tabela)
    .values({ day: diaDaCota(agora), costMicros: micros })
    .onConflictDoUpdate({ target: tabela.day, set: { costMicros: sql`${tabela.costMicros} + ${micros}` } });
}

/**
 * Cotas da Foca IA por plano e teto global de custo (spec 48 T-48.2.4; 46 §E.7.3, T-08.3, D-12).
 *
 * - Grátis: até `AI_COTA_GRATIS_MENSAGENS` por dia; uma foto conta como uma dessas mensagens.
 * - Pro: até `AI_COTA_PRO_MENSAGENS` mensagens e `AI_COTA_PRO_FOTOS` fotos por dia. (Ninguém é Pro ainda: o plano
 *   só muda no servidor, e cobrança está fora do escopo.)
 * - Teto global diário (`AI_TETO_DIARIO_USD`): passou dele, o tutor fica indisponível até o dia seguinte e o estudo
 *   segue normalmente.
 *
 * A reserva acontece **antes** da chamada à IA, numa transação com a linha do perfil travada (`for update`): duas
 * chamadas simultâneas do mesmo aluno não passam do limite. Falha técnica da IA devolve a reserva (o fallback local
 * não consome cota, mas também não serve para contorná-la). O teto global é conferido antes de reservar; com várias
 * chamadas ao mesmo tempo ele pode ser ultrapassado em, no máximo, o custo dessas chamadas (algumas frações de
 * centavo cada) — aceitável para um disjuntor.
 *
 * O "dia" é o dia em São Paulo (o mesmo fuso padrão do perfil).
 */
import { and, eq, sql } from "drizzle-orm";
import type { Env } from "../env";
import type { Banco } from "../db/client";
import { aiBudget, aiUsage, profile } from "../db/schema";
import { ErroApp } from "../http";

export function diaDaCota(agora: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
}

type Limites = Pick<Env, "AI_COTA_GRATIS_MENSAGENS" | "AI_COTA_PRO_MENSAGENS" | "AI_COTA_PRO_FOTOS" | "AI_TETO_DIARIO_USD">;

/** Custo em micro-dólares pelo `usage` devolvido pela API e pela tabela de preço configurada (US$ por milhão de tokens). */
export function custoMicros(usage: { entrada: number; saida: number }, preco: { entrada: number; saida: number }): number {
  return Math.ceil(usage.entrada * preco.entrada + usage.saida * preco.saida); // tokens × US$/Mtok = micro-dólares
}

/**
 * Reserva uma mensagem (e uma foto, se houver). Lança `ErroApp(429, "COTA_ESGOTADA")` ou
 * `ErroApp(503, "TETO_GLOBAL")`. Devolve quantas mensagens restam hoje depois desta.
 */
export async function reservarMensagem(db: Banco, userId: string, comFoto: boolean, agora: Date, limites: Limites): Promise<{ restantes: number }> {
  const dia = diaDaCota(agora);
  const [gasto] = await db.select({ c: aiBudget.costMicros }).from(aiBudget).where(eq(aiBudget.day, dia));
  if ((gasto?.c ?? 0) >= limites.AI_TETO_DIARIO_USD * 1_000_000) throw new ErroApp(503, "TETO_GLOBAL");

  return db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    const [p] = await tx.select({ plano: profile.plano }).from(profile).where(eq(profile.userId, userId)).for("update");
    const pro = p?.plano === "pro";
    await tx.insert(aiUsage).values({ userId, day: dia }).onConflictDoNothing();
    const [u] = await tx
      .select({ m: aiUsage.messages, f: aiUsage.images })
      .from(aiUsage)
      .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dia)));
    const msgs = u?.m ?? 0;
    const fotos = u?.f ?? 0;
    const teto = pro ? limites.AI_COTA_PRO_MENSAGENS : limites.AI_COTA_GRATIS_MENSAGENS;
    if (msgs >= teto) throw new ErroApp(429, "COTA_ESGOTADA");
    if (comFoto && pro && fotos >= limites.AI_COTA_PRO_FOTOS) throw new ErroApp(429, "COTA_ESGOTADA");
    await tx
      .update(aiUsage)
      .set({ messages: sql`${aiUsage.messages} + 1`, images: sql`${aiUsage.images} + ${comFoto ? 1 : 0}` })
      .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dia)));
    return { restantes: Math.max(0, teto - msgs - 1) };
  });
}

/** Leitura sem trava: ainda há cota? (Para não moderar nem chamar nada para quem já esgotou.) */
export async function cotaDisponivel(db: Banco, userId: string, comFoto: boolean, agora: Date, limites: Limites): Promise<boolean> {
  const dia = diaDaCota(agora);
  const [p] = await db.select({ plano: profile.plano }).from(profile).where(eq(profile.userId, userId)).limit(1);
  const [u] = await db.select({ m: aiUsage.messages, f: aiUsage.images }).from(aiUsage).where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dia)));
  const pro = p?.plano === "pro";
  if ((u?.m ?? 0) >= (pro ? limites.AI_COTA_PRO_MENSAGENS : limites.AI_COTA_GRATIS_MENSAGENS)) return false;
  if (comFoto && pro && (u?.f ?? 0) >= limites.AI_COTA_PRO_FOTOS) return false;
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
export async function registrarCusto(db: Banco, userId: string, agora: Date, usage: { entrada: number; saida: number }, micros: number): Promise<void> {
  const dia = diaDaCota(agora);
  await db
    .update(aiUsage)
    .set({
      inputTokens: sql`${aiUsage.inputTokens} + ${usage.entrada}`,
      outputTokens: sql`${aiUsage.outputTokens} + ${usage.saida}`,
      costMicros: sql`${aiUsage.costMicros} + ${micros}`,
    })
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dia)));
  await registrarCustoGlobal(db, agora, micros);
}

/** Só o teto global (custo estimado de uma chamada que falhou sem devolver o uso). */
export async function registrarCustoGlobal(db: Banco, agora: Date, micros: number): Promise<void> {
  if (micros <= 0) return;
  await db
    .insert(aiBudget)
    .values({ day: diaDaCota(agora), costMicros: micros })
    .onConflictDoUpdate({ target: aiBudget.day, set: { costMicros: sql`${aiBudget.costMicros} + ${micros}` } });
}

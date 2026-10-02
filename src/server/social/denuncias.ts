/**
 * Denúncia, suspensão e correção de idade nas funções sociais (spec 50 §5.6.5, T-50.14.3; segurança L2).
 *
 * - Denunciar (apelido inadequado · parece menor de 18 · outro): oculta o apelido na hora (como na 49) e põe na fila
 *   de revisão do suporte (`denuncia`, motivo fixo, sem texto livre). "Parece menor" também suspende as funções
 *   sociais do denunciado até a revisão — medida proporcional (§0.3 A): ele some das ligas e das duplas dos outros e
 *   não convida nem pede, mas pode sair e bloquear. Para a denúncia não virar arma (um pedido de dupla a partir de um
 *   convite público bastaria), a suspensão só vem de quem tem dupla **ativa** com o denunciado ou de 2 pessoas
 *   diferentes; antes disso, só o apelido fica oculto.
 * - `aoCorrigirIdadeParaMenor`: ponto único que o suporte chama ao corrigir o ano de nascimento para menos de 18.
 *   Encerra duplas e pedidos, invalida convites e tira da liga na hora; o resto sai pela retenção em 30 dias.
 */
import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { MotivoDeDenuncia } from "@/lib/amigos";
import type { Banco } from "../db/client";
import { amizade, conviteAmizade, denuncia, rankingParticipante } from "../db/schema";
import { ErroApp } from "../http";
import { tirarDaLiga } from "../ranking/ligas";
import { exigirAdulto } from "./amigos";

/** Denúncia a partir de uma dupla ou de um pedido do próprio aluno. Nunca recebe id de aluno do navegador. */
export async function denunciar(
  db: Banco,
  userId: string,
  pedido: { id: string; motivo: MotivoDeDenuncia },
  agora: Date,
): Promise<{ ok: true }> {
  await exigirAdulto(db, userId, agora);
  const [a] = await db
    .select()
    .from(amizade)
    .where(and(eq(amizade.id, pedido.id), or(eq(amizade.userA, userId), eq(amizade.userB, userId))))
    .limit(1);
  if (!a) throw new ErroApp(404, "DUPLA_INEXISTENTE");
  const alvo = a.userA === userId ? a.userB : a.userA;
  await db
    .insert(denuncia)
    .values({
      id: randomUUID(),
      autorId: userId,
      alvoId: alvo,
      contexto: "amigos",
      motivo: pedido.motivo,
      criadaEm: agora,
    });
  let suspender = false;
  if (pedido.motivo === "menor") {
    if (a.estado === "ativa") suspender = true;
    else {
      const [n] = await db
        .select({ n: sql<number>`count(distinct ${denuncia.autorId})` })
        .from(denuncia)
        .where(and(eq(denuncia.alvoId, alvo), eq(denuncia.motivo, "menor"), isNull(denuncia.resolvidaEm)));
      suspender = Number(n?.n ?? 0) >= 2;
    }
  }
  await db
    .update(rankingParticipante)
    .set({
      ocultoPorDenuncia: true,
      ...(suspender
        ? {
            socialSuspensoEm: sql`coalesce(${rankingParticipante.socialSuspensoEm}, ${agora.toISOString()}::timestamptz)`,
          }
        : {}),
    })
    .where(eq(rankingParticipante.userId, alvo));
  return { ok: true };
}

/**
 * Correção de idade para menos de 18 (só pelo suporte). Na hora: todas as duplas e pedidos acabam (o outro lado vê só
 * "Essa ofensiva em dupla foi encerrada."), os convites abertos deixam de valer e o aluno sai da liga (o apelido
 * some do grupo). Limpeza: duplas encerradas, participação e resultados da liga saem em 30 dias; convites em 7.
 */
export async function aoCorrigirIdadeParaMenor(
  db: Banco,
  userId: string,
  agora: Date = new Date(),
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(amizade)
      .set({ estado: "encerrada", encerradaEm: agora })
      .where(
        and(
          or(eq(amizade.userA, userId), eq(amizade.userB, userId)),
          inArray(amizade.estado, ["pedido", "ativa"]),
        ),
      );
    await tx
      .update(conviteAmizade)
      .set({ expiraEm: agora })
      .where(
        and(
          eq(conviteAmizade.userId, userId),
          sql`${conviteAmizade.expiraEm} > ${agora.toISOString()}::timestamptz`,
        ),
      );
    await tirarDaLiga(tx, userId, agora);
  });
}

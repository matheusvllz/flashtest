/**
 * Loja das Pérolas (spec 50 §5.3.3, RF-7, RF-8). Uma compra é uma transação com o perfil travado:
 * confere o pedido (idempotente pelo `pedidoId`), a situação do aluno (saldo, plano, estoque de protetores, vidas,
 * itens que já tem), cobra as Pérolas e aplica o efeito — tudo ou nada. Nunca vende aprendizagem nem ofensiva.
 */
import { and, eq } from "drizzle-orm";
import { BENEFICIOS, VIDAS_POR_DIA } from "@/lib/planos";
import { chavePerola, itemDaLoja, podeComprar, type ItemDaLoja, type MotivoRecusaDaLoja } from "@/lib/perolas";
import { historicoDaOfensiva } from "@/lib/ofensiva";
import type { Banco } from "../db/client";
import { cosmeticoEquipado, inventario, perolaMovimento, profile, protetorCredito, studyDay, vidasDia } from "../db/schema";
import { dataNoFuso } from "../estudo/sincronizar";
import { planoDoAluno } from "../planos/plano";
import { creditosDeProtetor } from "../planos/protetores";
import { vidasDoDia, vidasLigadasPara } from "../vidas/vidas";
import { creditar, saldoDePerolas } from "./perolas";

export type ResultadoDaCompra =
  | { ok: true; item: ItemDaLoja["id"]; saldo: number; repetido: boolean }
  | { ok: false; motivo: MotivoRecusaDaLoja; saldo: number };

export async function comprarNaLoja(db: Banco, userId: string, itemId: string, pedidoId: string, agora: Date = new Date()): Promise<ResultadoDaCompra> {
  const item = itemDaLoja(itemId);
  const plano = await planoDoAluno(db, userId, agora);
  const vidasLigadas = plano === "gratis" && (await vidasLigadasPara(db, userId));

  return db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    const [perfil] = await tx.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).for("update");
    const hoje = dataNoFuso(agora, perfil?.tz ?? "America/Sao_Paulo");
    const chave = chavePerola.compra(pedidoId);

    // Mesmo pedido de novo (toque duplo, reenvio): devolve o resultado, sem cobrar outra vez.
    const [jaFeito] = await tx
      .select({ ref: perolaMovimento.ref })
      .from(perolaMovimento)
      .where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.chave, chave)))
      .limit(1);
    if (jaFeito) return { ok: true as const, item: (jaFeito.ref ?? itemId) as ItemDaLoja["id"], saldo: await saldoDePerolas(tx, userId), repetido: true };

    const saldo = await saldoDePerolas(tx, userId);
    // Estoque de protetores lido depois da trava: compras simultâneas não passam do teto com um estoque velho.
    const creditos = await creditosDeProtetor(tx, userId, agora);
    const dias = (await tx.select({ d: studyDay.localDate }).from(studyDay).where(eq(studyDay.userId, userId))).map((r) => r.d);
    const protetoresMax = BENEFICIOS[plano].protetoresEstoqueMax;
    const ofensiva = historicoDaOfensiva(dias, { creditos, estoqueMax: protetoresMax });
    const vidas = vidasLigadas ? await vidasDoDia(tx, userId, hoje) : null;
    const [vdia] = await tx
      .select({ recargas: vidasDia.recargas })
      .from(vidasDia)
      .where(and(eq(vidasDia.userId, userId), eq(vidasDia.localDate, hoje)))
      .limit(1);
    const possui = new Set((await tx.select({ id: inventario.itemId }).from(inventario).where(eq(inventario.userId, userId))).map((r) => r.id));

    const motivo = podeComprar(item, {
      saldo,
      plano,
      protetores: ofensiva.estado.congelamentos,
      protetoresMax,
      vidasLigadas,
      vidasRestantes: vidas?.restantes ?? VIDAS_POR_DIA,
      vidasMax: VIDAS_POR_DIA,
      recargasHoje: vdia?.recargas ?? 0,
      possui,
    });
    if (motivo || !item) return { ok: false as const, motivo: motivo ?? "ITEM_DESCONHECIDO", saldo };

    await creditar(tx, userId, chave, -item.preco, "compra", hoje, item.id);
    switch (item.tipo) {
      case "protetor":
        await tx
          .insert(protetorCredito)
          .values({ userId, chave: `perolas:${pedidoId}`, quantidade: 1, motivo: "perolas", localDate: hoje })
          .onConflictDoNothing();
        break;
      case "recarga": {
        const falta = Math.max(0, VIDAS_POR_DIA - (vidas?.restantes ?? VIDAS_POR_DIA));
        await tx.insert(vidasDia).values({ userId, localDate: hoje }).onConflictDoNothing();
        await tx
          .update(vidasDia)
          .set({ ganhasRecarga: falta, recargas: 1, atualizadoEm: agora })
          .where(and(eq(vidasDia.userId, userId), eq(vidasDia.localDate, hoje)));
        break;
      }
      case "roupa":
      case "tema":
        await tx.insert(inventario).values({ userId, itemId: item.id }).onConflictDoNothing();
        break;
    }
    return { ok: true as const, item: item.id, saldo: saldo - item.preco, repetido: false };
  });
}

/** Equipa (ou tira, com `null`) uma roupa ou um tema que o aluno tem. */
export async function equiparCosmetico(
  db: Banco,
  userId: string,
  tipo: "roupa" | "tema",
  itemId: string | null,
): Promise<{ ok: boolean }> {
  if (itemId !== null) {
    const item = itemDaLoja(itemId);
    if (!item || item.tipo !== tipo) return { ok: false };
    const [tem] = await db
      .select({ id: inventario.itemId })
      .from(inventario)
      .where(and(eq(inventario.userId, userId), eq(inventario.itemId, itemId)))
      .limit(1);
    if (!tem) return { ok: false };
  }
  const valores = tipo === "roupa" ? { roupa: itemId } : { tema: itemId };
  await db
    .insert(cosmeticoEquipado)
    .values({ userId, ...valores })
    .onConflictDoUpdate({ target: cosmeticoEquipado.userId, set: { ...valores, atualizadoEm: new Date() } });
  return { ok: true };
}

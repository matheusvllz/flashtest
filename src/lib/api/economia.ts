/**
 * Pérolas, loja e ofensiva (spec 50 §5.2–§5.3). Tudo pelo `userId` da sessão; o cliente nunca informa saldo, preço,
 * estoque nem recompensa (regra dura 5). Desligar as Pérolas (`FUNCOES_DESLIGADAS=perolas`) para de conceder e de
 * vender, mas o saldo e o histórico continuam visíveis.
 */
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { banco } from "@/server/db/client";
import { cosmeticoEquipado, inventario } from "@/server/db/schema";
import { historicoDePerolas, saldoDePerolas, type MovimentoVisivel } from "@/server/economia/perolas";
import { comprarNaLoja as comprar, equiparCosmetico as equipar, type ResultadoDaCompra } from "@/server/economia/loja";
import {
  calendarioOfensiva as calendario,
  definirMetaOfensiva as definir,
  encerrarMetaOfensiva as encerrar,
  minhaOfensiva,
  type MinhaOfensiva,
} from "@/server/gamificacao/ofensiva";
import { checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import { recursoLigado } from "@/server/planos/funcoes";

type Erro = { ok: false; codigo: string };

export interface MinhaEconomia {
  ligado: boolean;
  saldo: number;
  itens: string[];
  roupa: string | null;
  tema: string | null;
  ofensiva: MinhaOfensiva;
}

export const minhaEconomia = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true } & MinhaEconomia) | Erro> => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    const agora = new Date();
    const [eq1] = await db.select().from(cosmeticoEquipado).where(eq(cosmeticoEquipado.userId, s.userId)).limit(1);
    const itens = (await db.select({ id: inventario.itemId }).from(inventario).where(eq(inventario.userId, s.userId))).map((r) => r.id);
    return {
      ok: true,
      ligado: recursoLigado("perolas"),
      saldo: await saldoDePerolas(db, s.userId),
      itens,
      roupa: eq1?.roupa ?? null,
      tema: eq1?.tema ?? null,
      ofensiva: await minhaOfensiva(db, s.userId, agora),
    };
  } catch (e) {
    return respostaDeErro(e);
  }
});

export const meuHistoricoDePerolas = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: true; movimentos: MovimentoVisivel[] } | Erro> => {
    try {
      const s = await exigirSessao();
      const db = await banco();
      return { ok: true, movimentos: await historicoDePerolas(db, s.userId, new Date()) };
    } catch (e) {
      return respostaDeErro(e);
    }
  },
);

const pedidoCompra = z.object({ itemId: z.string().min(1).max(40), pedidoId: z.string().uuid() });

export const comprarNaLoja = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoCompra.parse(d))
  .handler(async ({ data }): Promise<ResultadoDaCompra | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `loja:${s.userId}`, 3600, 30);
      if (!recursoLigado("perolas")) return { ok: false, codigo: "PEROLAS_DESLIGADAS" };
      return await comprar(db, s.userId, data.itemId, data.pedidoId);
    } catch (e) {
      return respostaDeErro(e);
    }
  });

const pedidoEquipar = z.object({ tipo: z.enum(["roupa", "tema"]), itemId: z.string().min(1).max(40).nullable() });

export const equiparCosmetico = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoEquipar.parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `equipar:${s.userId}`, 3600, 120);
      return await equipar(db, s.userId, data.tipo, data.itemId);
    } catch (e) {
      return respostaDeErro(e);
    }
  });

const pedidoMeta = z.object({ alvo: z.number().int() });

export const definirMetaOfensiva = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoMeta.parse(d))
  .handler(async ({ data }) => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `meta-ofensiva:${s.userId}`, 3600, 30);
      return await definir(db, s.userId, data.alvo);
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const encerrarMetaOfensiva = createServerFn({ method: "POST" }).handler(async (): Promise<{ ok: true } | Erro> => {
  try {
    checarOrigem();
    const s = await exigirSessao();
    const db = await banco();
    await encerrar(db, s.userId);
    return { ok: true };
  } catch (e) {
    return respostaDeErro(e);
  }
});

const pedidoMes = z.object({ mes: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) });

export const calendarioDaOfensiva = createServerFn({ method: "GET" })
  .validator((d: unknown) => pedidoMes.parse(d))
  .handler(async ({ data }): Promise<({ ok: true } & Awaited<ReturnType<typeof calendario>>) | Erro> => {
    try {
      const s = await exigirSessao();
      const db = await banco();
      return { ok: true, ...(await calendario(db, s.userId, data.mes)) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

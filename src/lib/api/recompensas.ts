/**
 * Funções de servidor de vidas e anúncios (spec 49 T-49.5, T-49.6). `userId` só da sessão; o cliente não informa
 * plano, saldo nem se o anúncio "valeu" além do pedido de vida (limitado a um por dia no servidor).
 */
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { VidasDoDia } from "@/lib/vidas";
import { configDeAnuncios, registrarConsentimentoDeCookies, type ConfigDeAnuncios } from "@/server/anuncios/anuncios";
import { banco } from "@/server/db/client";
import { profile } from "@/server/db/schema";
import { dataNoFuso } from "@/server/estudo/sincronizar";
import { checarOrigem, ErroApp, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import { alunoTemVidas, ganharVidaPorAnuncio as ganhar } from "@/server/vidas/vidas";

type Erro = { ok: false; codigo: string };

export const configAnuncios = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true } & ConfigDeAnuncios) | Erro> => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    return { ok: true, ...(await configDeAnuncios(db, s.userId, new Date())) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

export const decidirCookiesDeAnuncio = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ aceito: z.boolean() }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `cookies-anuncio:${s.userId}`, 600, 20);
      await registrarConsentimentoDeCookies(db, s.userId, data.aceito, new Date());
      return { ok: true };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const ganharVidaPorAnuncio = createServerFn({ method: "POST" }).handler(async (): Promise<{ ok: true; vidas: VidasDoDia } | Erro> => {
  try {
    checarOrigem();
    const s = await exigirSessao();
    const db = await banco();
    await limitar(db, `vida-anuncio:${s.userId}`, 3600, 10);
    const agora = new Date();
    if (!(await alunoTemVidas(db, s.userId, agora))) throw new ErroApp(409, "SEM_VIDAS_NO_PLANO");
    if (!(await configDeAnuncios(db, s.userId, agora)).ativo) throw new ErroApp(409, "ANUNCIOS_DESLIGADOS");
    const [p] = await db.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, s.userId)).limit(1);
    const r = await ganhar(db, s.userId, dataNoFuso(agora, p?.tz ?? "America/Sao_Paulo"));
    if (!r.ok) throw new ErroApp(409, "ANUNCIO_JA_USADO_HOJE");
    return { ok: true, vidas: r.vidas };
  } catch (e) {
    return respostaDeErro(e);
  }
});

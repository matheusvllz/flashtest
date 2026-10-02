/**
 * Funções de servidor do ranking (spec 49 T-49.8.1). `userId` só da sessão; o cliente manda só o apelido, a data
 * do aniversário no ano limítrofe (não guardada) e o apelido denunciado.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { banco } from "@/server/db/client";
import { checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import { ligasLigadas } from "@/server/ranking/ligas";
import { denunciarApelido, entrarNoRanking as entrar, meuRanking as meu, sairDoRanking as sair, type MeuRanking } from "@/server/ranking/ranking";

type Erro = { ok: false; codigo: string };

/** `modo`: "liga" com as divisões da spec 50 §5.5 (`LIGAS_HABILITADO`); "ranking" = o ranking semanal da 49. */
export const meuRanking = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true; modo: "liga" | "ranking" } & MeuRanking) | Erro> => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    await limitar(db, `ranking-ver:${s.userId}`, 60, 60);
    return { ok: true, modo: ligasLigadas() ? "liga" : "ranking", ...(await meu(db, s.userId, new Date())) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

const pedidoEntrada = z.object({
  apelido: z.string().max(40),
  nascimento: z.object({ dia: z.number().int().min(1).max(31), mes: z.number().int().min(1).max(12) }).optional(),
});

export const entrarNoRanking = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoEntrada.parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; problema: string } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `ranking-entrar:${s.userId}`, 600, 20);
      return await entrar(db, s.userId, data, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const sairDoRanking = createServerFn({ method: "POST" }).handler(async (): Promise<{ ok: true } | Erro> => {
  try {
    checarOrigem();
    const s = await exigirSessao();
    const db = await banco();
    await sair(db, s.userId, new Date());
    return { ok: true };
  } catch (e) {
    return respostaDeErro(e);
  }
});

export const denunciar = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ apelido: z.string().min(1).max(40) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `ranking-denuncia:${s.userId}`, 3600, 5);
      await denunciarApelido(db, s.userId, data.apelido, new Date());
      return { ok: true };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

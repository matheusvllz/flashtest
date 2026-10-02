/**
 * Simulado (spec 50 §5.9.4) e reporte de questão (§5.9.2). Tudo pelo `userId` da sessão; a correção e o gabarito
 * são do servidor e o gabarito só sai depois de terminar.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { banco } from "@/server/db/client";
import { checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import {
  concluirSimulado as concluir,
  estadoDoSimulado,
  iniciarSimulado as iniciar,
  opcoesDeSimulado,
  reportarQuestao as reportar,
  responderSimulado as responder,
  type EstadoDoSimulado,
  type OpcoesDeSimulado,
} from "@/server/simulado/simulado";
import type { ResultadoDoSimulado } from "@/lib/simulado";

type Erro = { ok: false; codigo: string };
const area = z.enum(["LC", "CH", "CN", "MT"]);
const idSimulado = z.string().min(5).max(120).regex(/^[A-Za-z0-9:_-]+$/);

export const meusSimulados = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true } & OpcoesDeSimulado) | Erro> => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    return { ok: true, ...(await opcoesDeSimulado(db, s.userId, new Date())) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

const pedidoInicio = z.object({
  pedido: z.discriminatedUnion("tipo", [
    z.object({ tipo: z.literal("mini") }),
    z.object({ tipo: z.literal("prova"), ano: z.number().int().min(2009).max(2100), area }),
    z.object({ tipo: z.literal("nivel"), area }),
    z.object({ tipo: z.literal("dia"), dia: z.union([z.literal(1), z.literal(2)]) }),
  ]),
  cronometro: z.boolean(),
});

export const iniciarSimulado = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoInicio.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; id: string } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `simulado-iniciar:${s.userId}`, 3600, 20);
      return { ok: true, ...(await iniciar(db, s.userId, data.pedido, data.cronometro, new Date())) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const verSimulado = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ id: idSimulado }).parse(d))
  .handler(async ({ data }): Promise<({ ok: true } & EstadoDoSimulado) | Erro> => {
    try {
      const s = await exigirSessao();
      const db = await banco();
      return { ok: true, ...(await estadoDoSimulado(db, s.userId, data.id)) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

const pedidoResposta = z.object({
  id: idSimulado,
  itemId: z.string().min(1).max(200),
  resposta: z.number().int().min(0).max(10).nullable(),
  marcada: z.boolean().optional(),
  tempoMs: z.number().int().min(0).max(12 * 3_600_000),
});

export const responderSimulado = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoResposta.parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `simulado-resp:${s.userId}`, 3600, 600);
      return await responder(db, s.userId, data.id, data.itemId, data.resposta, data.marcada, data.tempoMs, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const concluirSimulado = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ id: idSimulado, tempoMs: z.number().int().min(0).max(12 * 3_600_000) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true; resultado: ResultadoDoSimulado } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `simulado-fim:${s.userId}`, 3600, 30);
      return { ok: true, resultado: await concluir(db, s.userId, data.id, data.tempoMs, new Date()) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const reportarQuestao = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ itemId: z.string().min(1).max(200), motivo: z.enum(["texto", "imagem", "gabarito", "outro"]) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true; retirada: boolean } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `reporte:${s.userId}`, 86_400, 20);
      return await reportar(db, s.userId, data.itemId, data.motivo);
    } catch (e) {
      return respostaDeErro(e);
    }
  });

/**
 * "Pular para cá" (spec 50 §5.7.1, RF-17). Tudo pelo `userId` da sessão: a posição do aluno, a composição do teste, a
 * correção e as recompensas são do servidor. O aparelho só manda o capítulo e, no fim, as respostas.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { banco } from "@/server/db/client";
import { checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import {
  concluirPulo as concluir,
  iniciarPulo as iniciar,
  previaDoPulo as previa,
  type PreviaDoPulo,
  type ResultadoDoPulo,
  type TesteDoPulo,
} from "@/server/trilha/pulo";

type Erro = { ok: false; codigo: string };
const capituloId = z.string().min(1).max(120).regex(/^[A-Za-z0-9:_-]+$/);
const idPulo = z.string().min(10).max(80).regex(/^pulo-[A-Za-z0-9-]+$/);

export const previaDoPulo = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ capituloId }).parse(d))
  .handler(async ({ data }): Promise<({ ok: true } & PreviaDoPulo) | Erro> => {
    try {
      const s = await exigirSessao();
      const db = await banco();
      return { ok: true, ...(await previa(db, s.userId, data.capituloId, new Date())) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const iniciarPulo = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ capituloId }).parse(d))
  .handler(async ({ data }): Promise<({ ok: true } & TesteDoPulo) | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `pulo-iniciar:${s.userId}`, 3600, 20);
      return { ok: true, ...(await iniciar(db, s.userId, data.capituloId, new Date())) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

const resposta = z.object({
  itemId: z.string().min(1).max(200),
  resposta: z.union([z.number().int().min(0).max(50), z.array(z.number().int().min(0).max(50)).max(20), z.null()]),
  exibidos: z.array(z.string().max(500)).max(20).optional(),
});

export const concluirPulo = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ id: idPulo, respostas: z.array(resposta).min(1).max(20) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true; resultado: ResultadoDoPulo } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `pulo-fim:${s.userId}`, 3600, 30);
      return { ok: true, resultado: await concluir(db, s.userId, data.id, data.respostas, new Date()) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

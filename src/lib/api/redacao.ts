/**
 * Corretor e treino de redação (spec 49 §5.9, T-49.9.7 e T-49.9.8) e tarefas de escrita (spec 50 §5.10). Plano,
 * limites, recompensas e IA decididos no servidor, sempre pelo `userId` da sessão.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PARTE_MAX, PARTE_MIN, PARTES_DO_TREINO, TEMA_MAX, TEXTO_MAX, TEXTO_MIN } from "@/lib/redacao-ia";
import { banco } from "@/server/db/client";
import { checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import {
  apagarRedacao as apagar,
  avaliarEstimativa as avaliar,
  comentarParte,
  corrigirRedacao as corrigir,
  estadoDoCorretor,
  estadoDoTreino,
  verCorrecao as ver,
  type EstadoDoCorretor,
  type EstadoDoTreino,
  type ResultadoCorrecao,
  type ResultadoParte,
} from "@/server/redacao/redacao";
import {
  enviarEscrita as enviar,
  minhasTarefasDeEscrita as minhasTarefas,
  type MinhasTarefasDeEscrita,
  type ResultadoDaEscrita,
} from "@/server/redacao/escrita";

type Erro = { ok: false; codigo: string };

export const meuCorretor = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true } & EstadoDoCorretor) | Erro> => {
  try {
    const s = await exigirSessao();
    return { ok: true, ...(await estadoDoCorretor(await banco(), s.userId, new Date())) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

const pedidoCorrecao = z.object({
  tema: z.string().trim().min(5).max(TEMA_MAX),
  texto: z.string().trim().min(TEXTO_MIN).max(TEXTO_MAX),
});

export const corrigirRedacao = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoCorrecao.parse(d))
  .handler(async ({ data }): Promise<ResultadoCorrecao | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `redacao-correcao:${s.userId}`, 600, 5);
      return await corrigir(db, s.userId, data, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

const pedidoId = z.object({ id: z.string().uuid() });

export const verCorrecao = createServerFn({ method: "GET" })
  .validator((d: unknown) => pedidoId.parse(d))
  .handler(async ({ data }) => {
    try {
      const s = await exigirSessao();
      const r = await ver(await banco(), s.userId, data.id);
      return r ? ({ ok: true as const, ...r }) : ({ ok: false as const, codigo: "NAO_ENCONTRADA" });
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const apagarRedacao = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoId.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; apagada: boolean } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      return { ok: true, apagada: await apagar(await banco(), s.userId, data.id) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const meuTreino = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true } & EstadoDoTreino) | Erro> => {
  try {
    const s = await exigirSessao();
    return { ok: true, ...(await estadoDoTreino(await banco(), s.userId, new Date())) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

const pedidoParte = z.object({
  parte: z.enum(PARTES_DO_TREINO as unknown as [string, ...string[]]),
  texto: z.string().trim().min(PARTE_MIN).max(PARTE_MAX),
});

export const enviarParte = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoParte.parse(d))
  .handler(async ({ data }): Promise<ResultadoParte | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `redacao-treino:${s.userId}`, 600, 20);
      return await comentarParte(db, s.userId, { parte: data.parte as (typeof PARTES_DO_TREINO)[number], texto: data.texto }, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

/* ------------------------------------------------- tarefas de escrita (spec 50 §5.10) --- */

export const minhasTarefasDeEscrita = createServerFn({ method: "GET" }).handler(async (): Promise<({ ok: true } & MinhasTarefasDeEscrita) | Erro> => {
  try {
    const s = await exigirSessao();
    return { ok: true, ...(await minhasTarefas(await banco(), s.userId)) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

// Trecho 20–1.500 e texto completo 400–5.000 (§5.10.1); o limite exato de cada tarefa é conferido no servidor.
const pedidoEscrita = z.object({
  tarefaId: z.string().regex(/^[a-z0-9-]{3,64}$/),
  texto: z.string().trim().min(PARTE_MIN).max(TEXTO_MAX),
});

export const enviarEscrita = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoEscrita.parse(d))
  .handler(async ({ data }): Promise<ResultadoDaEscrita | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      // Envio de escrita: 30 por hora (spec 50 §10).
      await limitar(db, `escrita-envio:${s.userId}`, 3600, 30);
      return await enviar(db, s.userId, data, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

const pedidoAvaliacao = z.object({ id: z.string().uuid(), avaliacao: z.enum(["ajudou", "estranha"]) });

/** "Ajudou" / "Achei estranha" numa estimativa (spec 50 §5.10.5): só a escolha, sem texto. */
export const avaliarEstimativa = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoAvaliacao.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; gravada: boolean } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `redacao-avaliacao:${s.userId}`, 3600, 60);
      return { ok: true, gravada: await avaliar(db, s.userId, data.id, data.avaliacao, new Date()) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

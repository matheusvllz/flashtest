/**
 * Funções de servidor da ofensiva com amigos (spec 50 §5.6, T-50.14.2). `userId` só da sessão; o navegador manda só
 * o código do convite (22 caracteres base64url), o id de uma dupla própria, a `ref` opaca de um bloqueio próprio, o
 * apelido e o motivo fixo da denúncia. Limites por hora/dia além das regras do servidor (§10).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CODIGO_DO_CONVITE, MOTIVOS_DE_DENUNCIA } from "@/lib/amigos";
import { banco } from "@/server/db/client";
import { checarOrigem, ErroApp, exigirSessao, respostaDeErro } from "@/server/http";
import { limitar } from "@/server/limite";
import { gravarApelido } from "@/server/ranking/ranking";
import {
  abrirConvite as abrir,
  amigosLigado,
  bloquear as bloq,
  criarConvite as criar,
  desbloquear as desbloq,
  encerrarDupla as encerrar,
  minhasDuplas as minhas,
  pedirDupla as pedir,
  responderPedido as responder,
  type AberturaDoConvite,
  type MinhasDuplas,
} from "@/server/social/amigos";
import { denunciar as denunciarNoServidor } from "@/server/social/denuncias";

type Erro = { ok: false; codigo: string };
const HORA = 3600;
const DIA = 86_400;

const codigo = z.string().regex(CODIGO_DO_CONVITE);
const idDupla = z.object({ id: z.string().uuid() });

export const minhasDuplas = createServerFn({ method: "GET" }).handler(
  async (): Promise<({ ok: true } & MinhasDuplas) | Erro> => {
    try {
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `amigos-ver:${s.userId}`, 60, 60);
      return { ok: true, ...(await minhas(db, s.userId, new Date())) };
    } catch (e) {
      return respostaDeErro(e);
    }
  },
);

const pedidoApelido = z.object({
  apelido: z.string().max(40),
  nascimento: z
    .object({ dia: z.number().int().min(1).max(31), mes: z.number().int().min(1).max(12) })
    .optional(),
});

/** Apelido social para os amigos, sem entrar na liga (mesma validação da 49). */
export const definirApelidoSocial = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoApelido.parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; problema: string } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      if (!amigosLigado()) throw new ErroApp(409, "AMIGOS_DESLIGADO");
      await limitar(db, `amigos-apelido:${s.userId}`, 600, 20);
      return await gravarApelido(db, s.userId, data, new Date(), false);
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const criarConvite = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true; codigo: string; expiraEm: string } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `amigos-convite:${s.userId}`, DIA, 10);
      return { ok: true, ...(await criar(db, s.userId, new Date())) };
    } catch (e) {
      return respostaDeErro(e);
    }
  },
);

export const abrirConvite = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ codigo: z.string().max(64) }).parse(d))
  .handler(async ({ data }): Promise<({ ok: true } & AberturaDoConvite) | Erro> => {
    try {
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `amigos-abrir:${s.userId}`, HORA, 60);
      // Código malformado vira a mesma resposta genérica do inválido (depois das checagens de idade).
      return { ok: true, ...(await abrir(db, s.userId, data.codigo, new Date())) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const pedirDupla = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ codigo }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `amigos-pedir:${s.userId}`, DIA, 20);
      return await pedir(db, s.userId, data.codigo, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const responderPedido = createServerFn({ method: "POST" })
  .validator((d: unknown) => idDupla.extend({ aceitar: z.boolean() }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `amigos-responder:${s.userId}`, HORA, 60);
      return await responder(db, s.userId, data.id, data.aceitar, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const encerrarDupla = createServerFn({ method: "POST" })
  .validator((d: unknown) => idDupla.parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `amigos-encerrar:${s.userId}`, HORA, 30);
      return await encerrar(db, s.userId, data.id, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const bloquear = createServerFn({ method: "POST" })
  .validator((d: unknown) => idDupla.parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `amigos-bloquear:${s.userId}`, HORA, 30);
      return await bloq(db, s.userId, data.id, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const desbloquear = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ ref: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `amigos-desbloquear:${s.userId}`, HORA, 30);
      return await desbloq(db, s.userId, data.ref, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

export const denunciar = createServerFn({ method: "POST" })
  .validator((d: unknown) => idDupla.extend({ motivo: z.enum(MOTIVOS_DE_DENUNCIA) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `amigos-denuncia:${s.userId}`, DIA, 10);
      return await denunciarNoServidor(db, s.userId, data, new Date());
    } catch (e) {
      return respostaDeErro(e);
    }
  });

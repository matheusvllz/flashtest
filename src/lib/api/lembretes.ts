/**
 * Lembrete diário por push (spec 50 §5.2.5). Tudo pelo `userId` da sessão; a chave pública VAPID vem daqui (nunca de
 * `VITE_*`). O endereço de push do aparelho vai sempre no corpo de um POST (nunca na URL, que pode parar em log).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { endpointDePushValido, JANELAS_DO_LEMBRETE } from "@/lib/lembretes/regras";
import { banco } from "@/server/db/client";
import { checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import {
  chavePublica,
  estadoDoLembrete,
  lembretesLigados,
  removerAssinatura,
  salvarAssinatura,
  type EstadoDoLembrete,
} from "@/server/lembretes/push";
import { limitar } from "@/server/limite";

type Erro = { ok: false; codigo: string };

const endpoint = z.string().min(20).max(1024).refine(endpointDePushValido);
/** Chaves do navegador em base64url (p256dh: 65 bytes; auth: 16 bytes). */
const base64url = (min: number, max: number) =>
  z
    .string()
    .min(min)
    .max(max)
    .regex(/^[A-Za-z0-9_-]+={0,2}$/);

export const chavePublicaDoLembrete = createServerFn({ method: "GET" }).handler(async (): Promise<{ ok: true; chave: string | null } | Erro> => {
  try {
    await exigirSessao();
    return { ok: true, chave: chavePublica() };
  } catch (e) {
    return respostaDeErro(e);
  }
});

const pedidoEstado = z.object({ endpoint: endpoint.nullable() });

/** POST só para o endereço do aparelho ir no corpo; não muda nada. */
export const meuLembrete = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoEstado.parse(d))
  .handler(async ({ data }): Promise<({ ok: true } & EstadoDoLembrete) | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `lembrete-ler:${s.userId}`, 3600, 120);
      return { ok: true, ...(await estadoDoLembrete(db, s.userId, data.endpoint)) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

const pedidoSalvar = z.object({
  endpoint,
  p256dh: base64url(80, 100),
  auth: base64url(16, 32),
  janela: z.enum(JANELAS_DO_LEMBRETE),
});

export const salvarLembrete = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoSalvar.parse(d))
  .handler(async ({ data }): Promise<({ ok: true } & EstadoDoLembrete) | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `lembrete:${s.userId}`, 3600, 30);
      if (!lembretesLigados()) return { ok: false, codigo: "LEMBRETES_DESLIGADOS" };
      return { ok: true, ...(await salvarAssinatura(db, s.userId, data)) };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

const pedidoRemover = z.object({ endpoint: endpoint.nullable() });

export const removerLembrete = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoRemover.parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Erro> => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `lembrete:${s.userId}`, 3600, 30);
      await removerAssinatura(db, s.userId, data.endpoint);
      return { ok: true };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

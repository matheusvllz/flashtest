/**
 * Funções de servidor da conta (docs/specs/46-producao §E.3, §E.6; T-05.4, T-05.5, T-09.1).
 * O `userId` vem só da sessão. Dados pessoais: só os de docs/seguranca/privacidade.md.
 */
import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Json, JsonObjeto } from "@/lib/json";
import { LEGAL, idadePeloAno } from "@/lib/legal";
import { banco } from "@/server/db/client";
import { legalAcceptance, user } from "@/server/db/schema";
import { env } from "@/server/env";
import { ErroApp, checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { exportarDadosDoAluno, focaIALigada, gravarFocaIA } from "@/server/conta/dados";
import { gravarPerfil } from "@/server/conta/perfil";
import { limitar } from "@/server/limite";
import { eq } from "drizzle-orm";

/** Perfil respondido no onboarding (fica no aparelho até a conta existir). Só os campos de privacidade.md. */
export const esquemaPerfil = z.object({
  primeiroNome: z.string().trim().max(40).optional(),
  etapa: z.string().max(40).optional(),
  uf: z.string().regex(/^[A-Z]{2}$/).optional(),
  cursoAlvo: z.string().max(80).optional(),
  instituicaoAlvo: z.string().max(120).optional(),
  provas: z.array(z.unknown()).max(10).optional(),
  preferencias: z.record(z.string(), z.unknown()).optional(),
});
export type PerfilDoOnboarding = z.infer<typeof esquemaPerfil>;

const pedidoCompletar = z.object({
  /** Obrigatório só se a conta ainda não tem ano (login pelo Google). O ano já registrado nunca é trocado. */
  anoNascimento: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  termosVersao: z.string().max(40),
  privacidadeVersao: z.string().max(40),
  perfil: esquemaPerfil.optional(),
});

/** O que a tela de acesso pode oferecer (e-mail desligado em produção até haver domínio — D-10). */
export const configAcesso = createServerFn({ method: "GET" }).handler(async () => {
  const e = env();
  return {
    emailHabilitado: e.AUTH_EMAIL_HABILITADO,
    googleHabilitado: Boolean(e.GOOGLE_CLIENT_ID && e.GOOGLE_CLIENT_SECRET),
    idadeMinima: e.MIN_ACCOUNT_AGE,
    /** `false` = modo de demonstração (D-15): entrada local, sem conta. */
    contasAtivas: e.contasAtivas,
  };
});

export const salvarPerfil = createServerFn({ method: "POST" })
  .validator((d: unknown) => esquemaPerfil.parse(d))
  .handler(async ({ data }) => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `perfil:${s.userId}`, 60, 20);
      await gravarPerfil(db, s.userId, data);
      return { ok: true as const };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

/**
 * Completa o cadastro: idade mínima (ADR 0006), aceite dos documentos vigentes e perfil. Abaixo da
 * idade mínima a conta é apagada na hora (não guardamos dado de quem não pode ter conta).
 */
export const completarCadastro = createServerFn({ method: "POST" })
  .validator((d: unknown) => pedidoCompletar.parse(d))
  .handler(async ({ data }) => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `completar:${s.userId}`, 60, 10);
      if (data.termosVersao !== LEGAL.termos.versao || data.privacidadeVersao !== LEGAL.privacidade.versao) {
        throw new ErroApp(400, "VERSAO_DESATUALIZADA");
      }
      const [atual] = await db.select({ ano: user.birthYear }).from(user).where(eq(user.id, s.userId));
      const ano = atual?.ano ?? data.anoNascimento;
      if (ano == null) throw new ErroApp(400, "ANO_OBRIGATORIO");
      if (idadePeloAno(ano) < env().MIN_ACCOUNT_AGE) {
        await db.delete(user).where(eq(user.id, s.userId));
        return { ok: false as const, codigo: "IDADE_MINIMA" };
      }
      await db.transaction(async (tx) => {
        await tx
          .update(user)
          .set({ birthYear: ano, termsVersion: data.termosVersao, privacyVersion: data.privacidadeVersao })
          .where(eq(user.id, s.userId));
        for (const [documento, versao] of [
          ["termos", data.termosVersao],
          ["privacidade", data.privacidadeVersao],
        ] as const) {
          await tx.insert(legalAcceptance).values({ id: randomUUID(), userId: s.userId, document: documento, version: versao }).onConflictDoNothing();
        }
      });
      await gravarPerfil(db, s.userId, data.perfil ?? {});
      return { ok: true as const };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

/**
 * Exportação dos dados do aluno (LGPD art. 18; docs/seguranca/privacidade.md §5). Não inclui
 * hash de senha, tokens, sessões nem dados de outros alunos.
 */
export const exportarDados = createServerFn({ method: "POST" }).handler(async () => {
  try {
    checarOrigem();
    const s = await exigirSessao();
    const db = await banco();
    await limitar(db, `exportar:${s.userId}`, 3600, 1);
    return { ok: true as const, ...(await exportarDadosDoAluno(db, s.userId)) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

/**
 * Foca IA ligada ou desligada pelo aluno (spec 48 T-48.2.6; ECA Digital art. 17 §4 VIII; 46 §E.7.5). Fica no
 * `profile` (o servidor recusa o tutor quando desligado); o aparelho guarda um espelho só para esconder o botão.
 */
export const preferenciaFocaIA = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const s = await exigirSessao();
    const db = await banco();
    return { ok: true as const, ligada: await focaIALigada(db, s.userId) };
  } catch (e) {
    return respostaDeErro(e);
  }
});

export const definirFocaIA = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ ligada: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    try {
      checarOrigem();
      const s = await exigirSessao();
      const db = await banco();
      await limitar(db, `foca-ia:${s.userId}`, 60, 20);
      await gravarFocaIA(db, s.userId, data.ligada);
      return { ok: true as const, ligada: data.ligada };
    } catch (e) {
      return respostaDeErro(e);
    }
  });

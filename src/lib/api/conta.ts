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
import {
  aiUsage,
  attempt,
  completion,
  consent,
  legalAcceptance,
  learningDoc,
  profile,
  studyDay,
  user,
  xpLedger,
} from "@/server/db/schema";
import { env } from "@/server/env";
import { ErroApp, checarOrigem, exigirSessao, respostaDeErro } from "@/server/http";
import { gravarPerfil } from "@/server/conta/perfil";
import { limitar } from "@/server/limite";
import { and, eq } from "drizzle-orm";

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
    const doAluno = <T extends { userId: unknown }>(t: T) => eq(t.userId as never, s.userId);
    const [u] = await db
      .select({ nome: user.name, email: user.email, emailVerificado: user.emailVerified, criadoEm: user.createdAt, anoNascimento: user.birthYear })
      .from(user)
      .where(eq(user.id, s.userId));
    return {
      ok: true as const,
      geradoEm: new Date().toISOString(),
      conta: u,
      perfil: (await db.select().from(profile).where(doAluno(profile)))[0] ?? null,
      aceites: await db.select({ documento: legalAcceptance.document, versao: legalAcceptance.version, em: legalAcceptance.acceptedAt }).from(legalAcceptance).where(doAluno(legalAcceptance)),
      consentimentos: await db.select({ finalidade: consent.purpose, por: consent.grantedBy, em: consent.grantedAt, revogadoEm: consent.revokedAt }).from(consent).where(doAluno(consent)),
      respostas: await db.select({ item: attempt.itemId, correta: attempt.correct, fonte: attempt.source, em: attempt.answeredAt }).from(attempt).where(doAluno(attempt)),
      conclusoes: await db.select({ chave: completion.key, tipo: completion.kind, pct: completion.scorePct, em: completion.completedAt }).from(completion).where(doAluno(completion)),
      xp: await db.select({ chave: xpLedger.key, xp: xpLedger.xp, dia: xpLedger.localDate }).from(xpLedger).where(doAluno(xpLedger)),
      diasDeEstudo: await db.select({ dia: studyDay.localDate }).from(studyDay).where(doAluno(studyDay)),
      planejamento: (await db.select({ doc: learningDoc.doc }).from(learningDoc).where(doAluno(learningDoc)))[0]?.doc ?? null,
      usoDaFocaIA: await db.select({ dia: aiUsage.day, mensagens: aiUsage.messages, fotos: aiUsage.images }).from(aiUsage).where(and(doAluno(aiUsage))),
    };
  } catch (e) {
    return respostaDeErro(e);
  }
});

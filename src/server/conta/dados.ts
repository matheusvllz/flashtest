/**
 * Dados da conta que as funções de servidor leem e gravam (lógica extraída na spec 48 T-48.1.1 para ser testada
 * com duas contas): exportação (LGPD art. 18; privacidade.md §5) e a preferência da Foca IA (48 T-48.2.6).
 * Toda consulta filtra pelo `userId` da sessão, passado por quem chama.
 */
import { and, eq } from "drizzle-orm";
import type { Banco } from "../db/client";
import { aiUsage, attempt, completion, consent, learningDoc, legalAcceptance, profile, studyDay, user, xpLedger } from "../db/schema";

/** Exportação dos dados do aluno. Não inclui hash de senha, tokens, sessões nem dados de outros alunos. */
export async function exportarDadosDoAluno(db: Banco, userId: string, agora = new Date()) {
  const doAluno = <T extends { userId: unknown }>(t: T) => eq(t.userId as never, userId);
  const [u] = await db
    .select({ nome: user.name, email: user.email, emailVerificado: user.emailVerified, criadoEm: user.createdAt, anoNascimento: user.birthYear })
    .from(user)
    .where(eq(user.id, userId));
  return {
    geradoEm: agora.toISOString(),
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
}

export async function focaIALigada(db: Banco, userId: string): Promise<boolean> {
  const [p] = await db.select({ desligado: profile.tutorDesligado }).from(profile).where(eq(profile.userId, userId)).limit(1);
  return !p?.desligado;
}

export async function gravarFocaIA(db: Banco, userId: string, ligada: boolean): Promise<void> {
  await db.insert(profile).values({ userId }).onConflictDoNothing();
  await db.update(profile).set({ tutorDesligado: !ligada, updatedAt: new Date() }).where(eq(profile.userId, userId));
}

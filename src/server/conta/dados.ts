/**
 * Dados da conta que as funções de servidor leem e gravam (lógica extraída na spec 48 T-48.1.1 para ser testada
 * com duas contas): exportação (LGPD art. 18; privacidade.md §5) e a preferência da Foca IA (48 T-48.2.6).
 * Toda consulta filtra pelo `userId` da sessão, passado por quem chama.
 */
import { and, eq, or } from "drizzle-orm";
import type { Banco } from "../db/client";
import {
  aiUsage,
  amizade,
  assinatura,
  attempt,
  bloqueio,
  denuncia,
  ligaResultado,
  cadernoItem,
  cobranca,
  completion,
  compra,
  conquista,
  consent,
  cosmeticoEquipado,
  cronograma,
  questaoReporte,
  simulado,
  desafioMes,
  inventario,
  marcoOfensiva,
  metaOfensiva,
  missaoDia,
  perolaMovimento,
  learningDoc,
  legalAcceptance,
  profile,
  protetorCredito,
  puloTentativa,
  pushAssinatura,
  rankingParticipante,
  redacao,
  studyDay,
  user,
  vidasDia,
  xpLedger,
} from "../db/schema";

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
    // Spec 49: planos, compras, vidas, protetores, ranking e funções pagas (sem ids internos do provedor de pagamento).
    assinaturas: await db
      .select({ plano: assinatura.plano, produto: assinatura.produto, estado: assinatura.estado, inicio: assinatura.inicio, validoAte: assinatura.validoAte, canceladaEm: assinatura.canceladaEm })
      .from(assinatura)
      .where(doAluno(assinatura)),
    compras: await db.select({ produto: compra.produto, estado: compra.estado, criadaEm: compra.criadaEm, pagaEm: compra.pagaEm }).from(compra).where(doAluno(compra)),
    cobrancas: await db
      .select({ valorCentavos: cobranca.valorCentavos, metodo: cobranca.metodo, estado: cobranca.estado, pagaEm: cobranca.pagaEm, reembolsadaEm: cobranca.reembolsadaEm })
      .from(cobranca)
      .where(doAluno(cobranca)),
    vidas: await db.select({ dia: vidasDia.localDate, perdidas: vidasDia.perdidas, ganhasAnuncio: vidasDia.ganhasAnuncio }).from(vidasDia).where(doAluno(vidasDia)),
    protetores: await db.select({ quantidade: protetorCredito.quantidade, motivo: protetorCredito.motivo, dia: protetorCredito.localDate }).from(protetorCredito).where(doAluno(protetorCredito)),
    // Spec 50 §5.9: simulados (itens, respostas, resultado) e reportes de questão feitos pelo aluno.
    simulados: await db
      .select({ tipo: simulado.tipo, rotulo: simulado.rotulo, itens: simulado.itens, respostas: simulado.respostas, resultado: simulado.resultado, iniciadoEm: simulado.iniciadoEm, concluidoEm: simulado.concluidoEm })
      .from(simulado)
      .where(doAluno(simulado)),
    testesDePulo: await db
      .select({ capitulo: puloTentativa.capituloId, dia: puloTentativa.localDate, resultado: puloTentativa.resultado, acertos: puloTentativa.acertos, itens: puloTentativa.itens, licoes: puloTentativa.licoes })
      .from(puloTentativa)
      .where(doAluno(puloTentativa)),
    reportesDeQuestao: await db.select({ item: questaoReporte.itemId, motivo: questaoReporte.motivo, em: questaoReporte.criadoEm }).from(questaoReporte).where(doAluno(questaoReporte)),
    ranking: await db
      .select({ apelido: rankingParticipante.apelido, entrouEm: rankingParticipante.entrouEm, saiuEm: rankingParticipante.saiuEm })
      .from(rankingParticipante)
      .where(doAluno(rankingParticipante)),
    cadernoDeErros: await db
      .select({ item: cadernoItem.itemId, proximaRevisao: cadernoItem.proximaRevisao, estado: cadernoItem.estado })
      .from(cadernoItem)
      .where(doAluno(cadernoItem)),
    cronograma: (await db.select({ diasSemana: cronograma.diasSemana, minutosDia: cronograma.minutosDia, dataProva: cronograma.dataProva }).from(cronograma).where(doAluno(cronograma)))[0] ?? null,
    redacoes: await db.select({ tipo: redacao.tipo, tema: redacao.tema, texto: redacao.texto, resultado: redacao.resultado, em: redacao.criadaEm }).from(redacao).where(doAluno(redacao)),
    // Spec 50 §9: economia e gamificação.
    perolas: await db
      .select({ quantidade: perolaMovimento.quantidade, motivo: perolaMovimento.motivo, ref: perolaMovimento.ref, dia: perolaMovimento.localDate })
      .from(perolaMovimento)
      .where(doAluno(perolaMovimento)),
    inventario: await db.select({ item: inventario.itemId, em: inventario.obtidoEm }).from(inventario).where(doAluno(inventario)),
    cosmeticos: (await db.select({ roupa: cosmeticoEquipado.roupa, tema: cosmeticoEquipado.tema }).from(cosmeticoEquipado).where(doAluno(cosmeticoEquipado)))[0] ?? null,
    metasDeOfensiva: await db
      .select({ alvo: metaOfensiva.alvo, inicio: metaOfensiva.inicio, concluidaEm: metaOfensiva.concluidaEm, encerradaEm: metaOfensiva.encerradaEm })
      .from(metaOfensiva)
      .where(doAluno(metaOfensiva)),
    marcosDeOfensiva: await db.select({ dias: marcoOfensiva.dias, em: marcoOfensiva.alcancadoEm }).from(marcoOfensiva).where(doAluno(marcoOfensiva)),
    missoes: await db
      .select({ dia: missaoDia.localDate, missao: missaoDia.missaoId, progresso: missaoDia.progresso, alvo: missaoDia.alvo, concluidaEm: missaoDia.concluidaEm })
      .from(missaoDia)
      .where(doAluno(missaoDia)),
    desafios: await db.select({ mes: desafioMes.mes, progresso: desafioMes.progresso, concluidoEm: desafioMes.concluidoEm }).from(desafioMes).where(doAluno(desafioMes)),
    conquistas: await db.select({ id: conquista.conquistaId, em: conquista.obtidaEm }).from(conquista).where(doAluno(conquista)),
    // Spec 50 §9: liga e amigos (18+). Só o que é do próprio aluno: nenhum id, e-mail ou apelido de outra conta; a
    // denúncia sai sem o alvo.
    resultadosDaLiga: await db
      .select({ semana: ligaResultado.semana, divisao: ligaResultado.divisao, posicao: ligaResultado.posicao, pontos: ligaResultado.pontos, movimento: ligaResultado.movimento })
      .from(ligaResultado)
      .where(doAluno(ligaResultado)),
    divisaoDaLiga: (await db.select({ divisao: rankingParticipante.divisao, pausado: rankingParticipante.pausado }).from(rankingParticipante).where(doAluno(rankingParticipante)))[0] ?? null,
    duplas: (
      await db
        .select({ estado: amizade.estado, pedidaPor: amizade.pedidaPor, criadaEm: amizade.criadaEm, aceitaEm: amizade.aceitaEm, encerradaEm: amizade.encerradaEm })
        .from(amizade)
        .where(or(eq(amizade.userA, userId), eq(amizade.userB, userId)))
    ).map(({ pedidaPor, ...d }) => ({ ...d, pedidaPorVoce: pedidaPor === userId })),
    bloqueios: await db.select({ em: bloqueio.criadoEm }).from(bloqueio).where(doAluno(bloqueio)),
    denunciasFeitas: await db
      .select({ contexto: denuncia.contexto, motivo: denuncia.motivo, em: denuncia.criadaEm, resolvidaEm: denuncia.resolvidaEm })
      .from(denuncia)
      .where(eq(denuncia.autorId, userId)),
    // Spec 50 §5.2.5, §9: só se está ligado, a janela e a pausa; o endereço de push e as chaves (identificadores
    // técnicos do aparelho) não saem na exportação.
    lembrete: await lembreteExportado(db, userId),
  };
}

async function lembreteExportado(db: Banco, userId: string) {
  const linhas = await db
    .select({ janela: pushAssinatura.janela, pausadaEm: pushAssinatura.pausadaEm, ultimoEnvioDia: pushAssinatura.ultimoEnvioDia })
    .from(pushAssinatura)
    .where(eq(pushAssinatura.userId, userId));
  return {
    ligado: linhas.length > 0,
    janela: linhas[0]?.janela ?? null,
    aparelhos: linhas.length,
    pausado: linhas.some((l) => l.pausadaEm !== null),
    ultimoLembrete: linhas.map((l) => l.ultimoEnvioDia).filter((d): d is string => !!d).sort().at(-1) ?? null,
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

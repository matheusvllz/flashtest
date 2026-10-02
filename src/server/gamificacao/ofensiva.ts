/**
 * Ofensiva no servidor (spec 50 §5.2): meta escolhida pelo aluno, marcos com baú de conteúdo conhecido e calendário.
 * A sequência continua calculada por uma regra só (`src/lib/recompensas.ts`); aqui só se decidem as recompensas
 * ligadas a ela, sempre dentro da transação travada de `aplicarEventos` ou de uma ação do aluno.
 */
import { and, desc, eq, isNull } from "drizzle-orm";
import { BENEFICIOS } from "@/lib/planos";
import {
  chavePerola,
  conteudoDoBau,
  ehMarcoDeOfensiva,
  ehMetaDeOfensiva,
  itemDaLoja,
  PEROLAS_DA_META,
  type MetaDeOfensiva,
} from "@/lib/perolas";
import { diasDoMes, historicoDaOfensiva, partidaDaMeta, situacaoDaMeta, type HistoricoDaOfensiva } from "@/lib/ofensiva";
import type { Banco } from "../db/client";
import { inventario, marcoOfensiva, metaOfensiva, profile, studyDay } from "../db/schema";
import { dataNoFuso, type Tx } from "../estudo/sincronizar";
import { planoDoAluno } from "../planos/plano";
import { creditosDeProtetor } from "../planos/protetores";
import { creditar } from "../economia/perolas";

type Leitor = Banco | Tx;

export async function historicoDoAluno(db: Leitor, userId: string, agora: Date): Promise<HistoricoDaOfensiva> {
  const dias = (await db.select({ d: studyDay.localDate }).from(studyDay).where(eq(studyDay.userId, userId))).map((r) => r.d);
  const plano = await planoDoAluno(db as Banco, userId, agora);
  return historicoDaOfensiva(dias, {
    creditos: await creditosDeProtetor(db as Banco, userId, agora),
    estoqueMax: BENEFICIOS[plano].protetoresEstoqueMax,
  });
}

async function metaAtiva(db: Leitor, userId: string) {
  const [m] = await db
    .select()
    .from(metaOfensiva)
    .where(and(eq(metaOfensiva.userId, userId), isNull(metaOfensiva.concluidaEm), isNull(metaOfensiva.encerradaEm)))
    .orderBy(desc(metaOfensiva.criadaEm))
    .limit(1);
  return m ?? null;
}

export interface AcontecimentosDaOfensiva {
  metaCumprida: { alvo: number; perolas: number } | null;
  marco: { dias: number; perolas: number; item: string | null } | null;
  /** Maior sequência da história (para as conquistas de ofensiva). */
  melhor: number;
}

/**
 * Depois de aplicar os eventos de um envio: confere a meta ativa e o marco do dia (primeira vez = baú).
 * Idempotente pelas chaves do livro (`meta-ofensiva:<id>`, `marco:<dias>`).
 */
export async function avaliarOfensiva(tx: Tx, userId: string, hoje: string, agora: Date): Promise<AcontecimentosDaOfensiva> {
  const h = await historicoDoAluno(tx, userId, agora);
  const resultado: AcontecimentosDaOfensiva = { metaCumprida: null, marco: null, melhor: h.estado.melhorSequencia };

  const m = await metaAtiva(tx, userId);
  if (m) {
    const s = situacaoDaMeta(
      { alvo: m.alvo, sequenciaInicial: m.sequenciaInicial, inicioSequencia: m.inicioSequencia, inicio: m.inicio },
      h,
      hoje,
    );
    if (s.tipo === "cumprida") {
      const perolas = PEROLAS_DA_META[m.alvo as MetaDeOfensiva] ?? 0;
      await tx.update(metaOfensiva).set({ concluidaEm: agora, inicioSequencia: s.inicioSequencia }).where(eq(metaOfensiva.id, m.id));
      if (await creditar(tx, userId, chavePerola.metaOfensiva(m.id), perolas, "meta-ofensiva", hoje, String(m.alvo))) {
        resultado.metaCumprida = { alvo: m.alvo, perolas };
      }
    } else if (s.tipo === "quebrou") {
      // Sem texto de perda: a meta acaba em silêncio e o aluno pode escolher outra (§5.2.2).
      await tx.update(metaOfensiva).set({ encerradaEm: agora }).where(eq(metaOfensiva.id, m.id));
    } else if (s.inicioSequencia && !m.inicioSequencia) {
      await tx.update(metaOfensiva).set({ inicioSequencia: s.inicioSequencia }).where(eq(metaOfensiva.id, m.id));
    }
  }

  const dias = h.estado.sequencia;
  if (h.estado.ultimoDia === hoje && ehMarcoDeOfensiva(dias)) {
    const novo = await tx.insert(marcoOfensiva).values({ userId, dias }).onConflictDoNothing().returning({ d: marcoOfensiva.dias });
    if (novo.length) {
      const bau = conteudoDoBau(dias)!;
      let perolas = bau.perolas;
      let item: string | null = null;
      if (bau.item) {
        const [tem] = await tx
          .select({ id: inventario.itemId })
          .from(inventario)
          .where(and(eq(inventario.userId, userId), eq(inventario.itemId, bau.item)))
          .limit(1);
        if (tem) perolas += itemDaLoja(bau.item)?.preco ?? 0; // já possuído: vira o preço em Pérolas (§5.3.5)
        else {
          await tx.insert(inventario).values({ userId, itemId: bau.item }).onConflictDoNothing();
          item = bau.item;
        }
      }
      await creditar(tx, userId, chavePerola.marco(dias), perolas, "marco", hoje, String(dias));
      resultado.marco = { dias, perolas, item };
    }
  }
  return resultado;
}

/* ------------------------------------------------------------ ações do aluno --- */

export type ResultadoDaMeta = { ok: true; alvo: number } | { ok: false; motivo: "ALVO_INVALIDO" };

export async function definirMetaOfensiva(db: Banco, userId: string, alvo: number, agora: Date = new Date()): Promise<ResultadoDaMeta> {
  if (!ehMetaDeOfensiva(alvo)) return { ok: false, motivo: "ALVO_INVALIDO" };
  const h = await historicoDoAluno(db, userId, agora);
  await db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    const [perfil] = await tx.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).for("update");
    const hoje = dataNoFuso(agora, perfil?.tz ?? "America/Sao_Paulo");
    await tx
      .update(metaOfensiva)
      .set({ encerradaEm: agora })
      .where(and(eq(metaOfensiva.userId, userId), isNull(metaOfensiva.concluidaEm), isNull(metaOfensiva.encerradaEm)));
    const p = partidaDaMeta(h, hoje, alvo);
    await tx.insert(metaOfensiva).values({
      userId,
      alvo,
      sequenciaInicial: p.sequenciaInicial,
      inicioSequencia: p.inicioSequencia,
      inicio: p.inicio,
    });
  });
  return { ok: true, alvo };
}

export async function encerrarMetaOfensiva(db: Banco, userId: string, agora: Date = new Date()): Promise<void> {
  await db
    .update(metaOfensiva)
    .set({ encerradaEm: agora })
    .where(and(eq(metaOfensiva.userId, userId), isNull(metaOfensiva.concluidaEm), isNull(metaOfensiva.encerradaEm)));
}

export interface MinhaOfensiva {
  sequencia: number;
  melhor: number;
  protetores: number;
  protetoresMax: number;
  meta: { alvo: number; feitos: number } | null;
  /** Última meta cumprida que o aluno ainda não viu (para oferecer a próxima). */
  ultimaCumprida: number | null;
}

export async function minhaOfensiva(db: Banco, userId: string, agora: Date = new Date()): Promise<MinhaOfensiva> {
  const [perfil] = await db.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).limit(1);
  const hoje = dataNoFuso(agora, perfil?.tz ?? "America/Sao_Paulo");
  const h = await historicoDoAluno(db, userId, agora);
  const plano = await planoDoAluno(db, userId, agora);
  const m = await metaAtiva(db, userId);
  let meta: MinhaOfensiva["meta"] = null;
  if (m) {
    const s = situacaoDaMeta({ alvo: m.alvo, sequenciaInicial: m.sequenciaInicial, inicioSequencia: m.inicioSequencia, inicio: m.inicio }, h, hoje);
    meta = { alvo: m.alvo, feitos: s.tipo === "andando" ? s.feitos : s.tipo === "cumprida" ? m.alvo : 0 };
  }
  const [ultima] = await db
    .select({ alvo: metaOfensiva.alvo })
    .from(metaOfensiva)
    .where(eq(metaOfensiva.userId, userId))
    .orderBy(desc(metaOfensiva.criadaEm))
    .limit(1);
  return {
    sequencia: h.estado.sequencia,
    melhor: h.estado.melhorSequencia,
    protetores: h.estado.congelamentos,
    protetoresMax: BENEFICIOS[plano].protetoresEstoqueMax,
    meta,
    ultimaCumprida: !m && ultima ? ultima.alvo : null,
  };
}

/** Calendário de um mês (`AAAA-MM`): dias estudados e dias cobertos por protetor (§5.2.3). */
export async function calendarioOfensiva(db: Banco, userId: string, mes: string, agora: Date = new Date()) {
  const h = await historicoDoAluno(db, userId, agora);
  const dias = (await db.select({ d: studyDay.localDate }).from(studyDay).where(eq(studyDay.userId, userId))).map((r) => r.d);
  return { mes, ...diasDoMes(mes, dias, h.protegidos) };
}

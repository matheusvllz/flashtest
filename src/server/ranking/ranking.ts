/**
 * Ranking semanal de maiores de 18 no servidor (spec 49 D49-06, T-49.8.1; segurança L3).
 * Menor nunca entra, nunca vê o ranking e nunca aparece numa consulta: o filtro de idade roda em toda leitura, pelo
 * ano de nascimento atual do cadastro (se o suporte corrigir o ano para menos de 18, o aluno some na hora).
 */
import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  APELIDOS_RESERVADOS,
  MAX_POR_GRUPO,
  diaEmSaoPaulo,
  diasDaSemana,
  elegibilidade,
  pontosDaSemana,
  semAcento,
  semanaDe,
  validarApelido,
  type ProblemaDoApelido,
} from "@/lib/ranking";
import type { Banco } from "../db/client";
import { profile, rankingGrupo, rankingParticipante, studyDay, user } from "../db/schema";
import { env } from "../env";
import { dataNoFuso } from "../estudo/sincronizar";
import { ErroApp } from "../http";
import { ehLocal } from "../pagamentos/provedor";

/** Ligado? Implantado: `RANKING_HABILITADO`. Local: sempre (E2E). */
export function rankingLigado(): boolean {
  const e = env();
  return e.RANKING_HABILITADO === true || ehLocal(e);
}

async function anoDe(db: Banco, userId: string): Promise<number | null> {
  const [u] = await db.select({ ano: user.birthYear }).from(user).where(eq(user.id, userId)).limit(1);
  return u?.ano ?? null;
}

function hojeSP(agora: Date): string {
  return dataNoFuso(agora, "America/Sao_Paulo");
}

export interface LinhaDoRanking {
  posicao: number;
  apelido: string;
  pontos: number;
  voce: boolean;
}

export type MeuRanking =
  | { estado: "desligado" }
  | { estado: "menor" }
  | { estado: "fora"; confirmarNascimento: boolean }
  | { estado: "participando"; apelido: string; semana: string; grupo: LinhaDoRanking[] };

export async function meuRanking(db: Banco, userId: string, agora: Date): Promise<MeuRanking> {
  if (!rankingLigado()) return { estado: "desligado" };
  const ano = await anoDe(db, userId);
  const [p] = await db.select().from(rankingParticipante).where(eq(rankingParticipante.userId, userId)).limit(1);
  const e = elegibilidade(ano, agora);
  // Participante que confirmou o aniversário neste ano continua maior; menor pelo ano atual sai.
  const confirmouEsteAno = !!p && p.maiorDesde.getUTCFullYear() === agora.getUTCFullYear() && p.maiorDesde <= agora;
  if (e === "menor" || (e === "confirmar" && !confirmouEsteAno)) return e === "menor" ? { estado: "menor" } : { estado: "fora", confirmarNascimento: true };
  if (!p || p.saiuEm) return { estado: "fora", confirmarNascimento: e === "confirmar" };

  const semana = semanaDe(hojeSP(agora));
  const grupo = await garantirGrupo(db, userId, semana);
  const membros = await db
    .select({
      userId: rankingGrupo.userId,
      apelido: rankingParticipante.apelido,
      oculto: rankingParticipante.ocultoPorDenuncia,
      maiorDesde: rankingParticipante.maiorDesde,
      ano: user.birthYear,
    })
    .from(rankingGrupo)
    .innerJoin(rankingParticipante, eq(rankingParticipante.userId, rankingGrupo.userId))
    .innerJoin(user, eq(user.id, rankingGrupo.userId))
    .where(and(eq(rankingGrupo.semana, semana), eq(rankingGrupo.grupo, grupo), isNull(rankingParticipante.saiuEm)));
  // Filtro de idade em toda leitura: no ano limítrofe só fica quem confirmou o aniversário NESTE ano (maior_desde é a
  // data do aniversário confirmado). Ano mudado pelo suporte para o limítrofe tira o participante até confirmar de novo.
  const adultos = membros.filter((m) => {
    const e = elegibilidade(m.ano, agora);
    return e === "maior" || (e === "confirmar" && m.maiorDesde.getUTCFullYear() === agora.getUTCFullYear() && m.maiorDesde <= agora);
  });
  const dias = diasDaSemana(semana);
  const linhas = await Promise.all(
    adultos.map(async (m) => {
      const r = await db
        .select({ blocos: studyDay.blocks })
        .from(studyDay)
        .where(and(eq(studyDay.userId, m.userId), inArray(studyDay.localDate, dias)));
      return { userId: m.userId, apelido: m.oculto ? "Apelido em revisão" : m.apelido, pontos: pontosDaSemana(r) };
    }),
  );
  linhas.sort((a, b) => b.pontos - a.pontos || a.apelido.localeCompare(b.apelido));
  return {
    estado: "participando",
    apelido: p.apelido,
    semana,
    grupo: linhas.map((l, i) => ({ posicao: i + 1, apelido: l.apelido, pontos: l.pontos, voce: l.userId === userId })),
  };
}

/** Grupo da semana: até 30 por grupo, na ordem em que entram na semana. */
async function garantirGrupo(db: Banco, userId: string, semana: string): Promise<number> {
  const [ja] = await db.select({ g: rankingGrupo.grupo }).from(rankingGrupo).where(and(eq(rankingGrupo.semana, semana), eq(rankingGrupo.userId, userId))).limit(1);
  if (ja) return ja.g;
  const [n] = await db.select({ n: count() }).from(rankingGrupo).where(eq(rankingGrupo.semana, semana));
  const grupo = Math.floor((n?.n ?? 0) / MAX_POR_GRUPO);
  await db.insert(rankingGrupo).values({ semana, userId, grupo }).onConflictDoNothing();
  const [r] = await db.select({ g: rankingGrupo.grupo }).from(rankingGrupo).where(and(eq(rankingGrupo.semana, semana), eq(rankingGrupo.userId, userId))).limit(1);
  return r?.g ?? grupo;
}

export async function entrarNoRanking(
  db: Banco,
  userId: string,
  pedido: { apelido: string; nascimento?: { dia: number; mes: number } },
  agora: Date,
): Promise<{ ok: true } | { ok: false; problema: ProblemaDoApelido | "repetido" }> {
  if (!rankingLigado()) throw new ErroApp(409, "RANKING_DESLIGADO");
  const ano = await anoDe(db, userId);
  const e = elegibilidade(ano, agora, pedido.nascimento);
  if (e !== "maior") throw new ErroApp(403, e === "confirmar" ? "CONFIRMAR_NASCIMENTO" : "MENOR_DE_IDADE");
  const v = validarApelido(pedido.apelido);
  if (!v.ok) return { ok: false, problema: v.problema };
  if (APELIDOS_RESERVADOS.includes(semAcento(v.apelido))) return { ok: false, problema: "repetido" };
  // maior_desde: no ano limítrofe, o aniversário confirmado (meia-noite de São Paulo); senão, a entrada.
  const maiorDesde =
    pedido.nascimento && elegibilidade(ano, agora) === "confirmar"
      ? new Date(Date.UTC(diaEmSaoPaulo(agora)[0], pedido.nascimento.mes - 1, pedido.nascimento.dia, 3))
      : agora;
  const [igual] = await db
    .select({ u: rankingParticipante.userId })
    .from(rankingParticipante)
    .where(sql`lower(${rankingParticipante.apelido}) = lower(${v.apelido})`)
    .limit(1);
  if (igual && igual.u !== userId) return { ok: false, problema: "repetido" };
  await db
    .insert(rankingParticipante)
    .values({ userId, apelido: v.apelido, maiorDesde })
    // A denúncia não some ao sair e entrar de novo: o apelido continua oculto até a revisão do suporte.
    .onConflictDoUpdate({ target: rankingParticipante.userId, set: { apelido: v.apelido, saiuEm: null, maiorDesde } });
  await db.insert(profile).values({ userId }).onConflictDoNothing();
  return { ok: true };
}

export async function sairDoRanking(db: Banco, userId: string, agora: Date): Promise<void> {
  await db.update(rankingParticipante).set({ saiuEm: agora }).where(eq(rankingParticipante.userId, userId));
  await db.delete(rankingGrupo).where(eq(rankingGrupo.userId, userId));
}

/** Denúncia de apelido do mesmo grupo: oculta até revisão (o texto some na hora). */
export async function denunciarApelido(db: Banco, userId: string, apelido: string, agora: Date): Promise<void> {
  const r = await meuRanking(db, userId, agora);
  if (r.estado !== "participando") throw new ErroApp(403, "FORA_DO_RANKING");
  if (!r.grupo.some((l) => l.apelido === apelido && !l.voce)) throw new ErroApp(404, "APELIDO_INEXISTENTE");
  await db.update(rankingParticipante).set({ ocultoPorDenuncia: true }).where(sql`lower(${rankingParticipante.apelido}) = lower(${apelido})`);
}

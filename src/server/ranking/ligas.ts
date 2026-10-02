/**
 * Ligas semanais de maiores de 18 no servidor (spec 50 §5.5, D50-11, T-50.13.3; segurança L2). As regras são puras,
 * em `src/lib/ligas.ts`; aqui ficam os grupos da semana, os pontos com antifraude e o fechamento semanal.
 *
 * - Filtro de idade e de suspensão em toda leitura (como a 49): menor nunca aparece, nem num grupo já formado.
 * - Grupos: o cron de segunda forma os grupos da semana com quem não está em pausa; quem chega no meio da semana (ou
 *   volta da pausa estudando) entra no grupo da divisão com menos gente e vaga.
 * - Fechamento: idempotente pela chave `liga:<semana>` em `liga_fechamento`, numa transação só; grava
 *   `liga_resultado` e a divisão da semana seguinte. Nenhuma Pérola.
 * - Antifraude possível com os dados que o servidor tem: o dia só existe se o servidor marcou `study_day` (conclusão
 *   validada); o bloco só pontua com 4 respostas pontuadas de primeira tentativa, ao vivo (não importadas), no mesmo
 *   dia; o teto de 5 blocos por dia e o de 60 atividades pagas por dia continuam. A regra da mediana de 3 s por
 *   resposta NÃO entrou: o servidor não mede o tempo entre respostas (o envio é em lote e a duração vem do aparelho).
 */
import { and, count, eq, gt, inArray, isNull, max, sql } from "drizzle-orm";
import {
  DIVISAO_MAXIMA,
  VAGAS_DE_SUBIDA,
  divisaoValida,
  fecharGrupo,
  formarGrupos,
  grupoParaEntrar,
  pontosDaLiga,
  posicoesComEmpate,
  semanaAnterior,
  type Movimento,
} from "@/lib/ligas";
import { adultoPeloCadastro, diasDaSemana, semanaDe } from "@/lib/ranking";
import type { Banco } from "../db/client";
import {
  attempt,
  ligaFechamento,
  ligaResultado,
  rankingGrupo,
  rankingParticipante,
  studyDay,
  user,
} from "../db/schema";
import { env } from "../env";
import { dataNoFuso, type Tx } from "../estudo/sincronizar";
import { ehLocal } from "../pagamentos/provedor";
import type { LinhaDoRanking, MeuRanking } from "./ranking";

type Leitor = Banco | Tx;
type Participante = typeof rankingParticipante.$inferSelect;

/**
 * Ligado? Precisa do ranking (`RANKING_HABILITADO`) e de `LIGAS_HABILITADO`. No ambiente local (dev e testes), ligado
 * por padrão — `LIGAS_HABILITADO=false` volta ao ranking da 49 (os testes da 49 fazem isso).
 */
export function ligasLigadas(): boolean {
  const e = env();
  const local = ehLocal(e);
  if (e.RANKING_HABILITADO !== true && !local) return false;
  return e.LIGAS_HABILITADO === true || (local && e.LIGAS_HABILITADO !== false);
}

export interface InfoDaLiga {
  divisao: number;
  /** Maior divisão já alcançada (selo). */
  maiorDivisao: number;
  /** Sozinho no grupo: "Sua liga está se formando", sem posição. */
  formando: boolean;
  /** Quantas posições do topo são a zona de subida (0 no Abismo). Nada marca a zona de descida. */
  vagasDeSubida: number;
  /** Resultado da semana passada, se jogou. */
  resultado: { semana: string; movimento: Movimento; divisao: number; novaDivisao: number } | null;
}

function hojeSP(agora: Date): string {
  return dataNoFuso(agora, "America/Sao_Paulo");
}

/** Pontos da liga de cada aluno numa semana (dias marcados pelo servidor + blocos com 4 respostas pontuadas). */
export async function pontosNaLiga(
  db: Leitor,
  userIds: readonly string[],
  semana: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>(userIds.map((u) => [u, 0]));
  if (!userIds.length) return out;
  const dias = diasDaSemana(semana);
  const estudo = await db
    .select({ u: studyDay.userId, dia: studyDay.localDate, blocos: studyDay.blocks })
    .from(studyDay)
    .where(and(inArray(studyDay.userId, [...userIds]), inArray(studyDay.localDate, dias)));
  const respostas = await db
    .select({ u: attempt.userId, dia: attempt.localDate, n: count() })
    .from(attempt)
    .where(
      and(
        inArray(attempt.userId, [...userIds]),
        inArray(attempt.localDate, dias),
        eq(attempt.pontuada, true),
        eq(attempt.tentativa, "primeira"),
        eq(attempt.origin, "live"),
      ),
    )
    .groupBy(attempt.userId, attempt.localDate);
  const nResp = new Map(respostas.map((r) => [`${r.u}|${r.dia}`, Number(r.n)]));
  const porAluno = new Map<string, { blocos: number; respostasPontuadas: number }[]>();
  for (const d of estudo) {
    const l = porAluno.get(d.u) ?? [];
    l.push({ blocos: d.blocos, respostasPontuadas: nResp.get(`${d.u}|${d.dia}`) ?? 0 });
    porAluno.set(d.u, l);
  }
  for (const [u, l] of porAluno) out.set(u, pontosDaLiga(l));
  return out;
}

async function estudouNaSemana(db: Leitor, userId: string, semana: string): Promise<boolean> {
  const [r] = await db
    .select({ n: count() })
    .from(studyDay)
    .where(
      and(
        eq(studyDay.userId, userId),
        inArray(studyDay.localDate, diasDaSemana(semana)),
        gt(studyDay.blocks, 0),
      ),
    );
  return Number(r?.n ?? 0) > 0;
}

/** Entra no grupo da divisão com menos gente e vaga (ou abre outro). Devolve o grupo em que o aluno está. */
async function entrarNoGrupo(
  db: Leitor,
  userId: string,
  semana: string,
  divisao: number,
): Promise<{ grupo: number; divisao: number }> {
  const [ja] = await db
    .select({ grupo: rankingGrupo.grupo, divisao: rankingGrupo.divisao })
    .from(rankingGrupo)
    .where(and(eq(rankingGrupo.semana, semana), eq(rankingGrupo.userId, userId)))
    .limit(1);
  if (ja) return ja;
  const tamanhos = await db
    .select({ grupo: rankingGrupo.grupo, n: count() })
    .from(rankingGrupo)
    .where(and(eq(rankingGrupo.semana, semana), eq(rankingGrupo.divisao, divisao)))
    .groupBy(rankingGrupo.grupo);
  const grupo = grupoParaEntrar(new Map(tamanhos.map((t) => [t.grupo, Number(t.n)])));
  await db.insert(rankingGrupo).values({ semana, userId, grupo, divisao }).onConflictDoNothing();
  const [r] = await db
    .select({ grupo: rankingGrupo.grupo, divisao: rankingGrupo.divisao })
    .from(rankingGrupo)
    .where(and(eq(rankingGrupo.semana, semana), eq(rankingGrupo.userId, userId)))
    .limit(1);
  return r ?? { grupo, divisao };
}

async function infoDaLiga(
  db: Leitor,
  userId: string,
  divisao: number,
  semana: string,
  formando: boolean,
): Promise<InfoDaLiga> {
  const [maior] = await db
    .select({ d: max(ligaResultado.divisao) })
    .from(ligaResultado)
    .where(eq(ligaResultado.userId, userId));
  const anterior = semanaAnterior(semana);
  const [r] = await db
    .select()
    .from(ligaResultado)
    .where(and(eq(ligaResultado.userId, userId), eq(ligaResultado.semana, anterior)))
    .limit(1);
  // Semana em pausa (0 pontos) não vira resultado na tela: sem texto de perda.
  const resultado =
    r && r.posicao !== null
      ? {
          semana: r.semana,
          movimento: r.movimento as Movimento,
          divisao: r.divisao,
          novaDivisao: divisaoValida(
            r.movimento === "sobe"
              ? r.divisao + 1
              : r.movimento === "desce"
                ? r.divisao - 1
                : r.divisao,
          ),
        }
      : null;
  return {
    divisao,
    maiorDivisao: Math.max(divisao, maior?.d ?? 1),
    formando,
    vagasDeSubida: divisao < DIVISAO_MAXIMA ? VAGAS_DE_SUBIDA : 0,
    resultado,
  };
}

/** Leitura da liga do aluno (já conferidos: ligada, adulto, participante, não suspenso). */
export async function grupoDaLiga(
  db: Banco,
  userId: string,
  p: Participante,
  agora: Date,
): Promise<MeuRanking> {
  const semana = semanaDe(hojeSP(agora));
  const divisao = divisaoValida(p.divisao);
  const [ja] = await db
    .select({ grupo: rankingGrupo.grupo, divisao: rankingGrupo.divisao })
    .from(rankingGrupo)
    .where(and(eq(rankingGrupo.semana, semana), eq(rankingGrupo.userId, userId)))
    .limit(1);
  if (!ja && p.pausado) {
    // Pausa: volta à mesma divisão quando estudar.
    if (!(await estudouNaSemana(db, userId, semana))) {
      return {
        estado: "pausado",
        apelido: p.apelido,
        liga: await infoDaLiga(db, userId, divisao, semana, false),
      };
    }
    await db
      .update(rankingParticipante)
      .set({ pausado: false })
      .where(eq(rankingParticipante.userId, userId));
  }
  const g = ja ?? (await entrarNoGrupo(db, userId, semana, divisao));
  const membros = await db
    .select({
      userId: rankingGrupo.userId,
      apelido: rankingParticipante.apelido,
      oculto: rankingParticipante.ocultoPorDenuncia,
      maiorDesde: rankingParticipante.maiorDesde,
      suspenso: rankingParticipante.socialSuspensoEm,
      ano: user.birthYear,
    })
    .from(rankingGrupo)
    .innerJoin(rankingParticipante, eq(rankingParticipante.userId, rankingGrupo.userId))
    .innerJoin(user, eq(user.id, rankingGrupo.userId))
    .where(
      and(
        eq(rankingGrupo.semana, semana),
        eq(rankingGrupo.divisao, g.divisao),
        eq(rankingGrupo.grupo, g.grupo),
        isNull(rankingParticipante.saiuEm),
      ),
    );
  // Filtro de idade e de suspensão em toda leitura.
  const visiveis = membros.filter(
    (m) => !m.suspenso && adultoPeloCadastro(m.ano, m.maiorDesde, agora),
  );
  const pontos = await pontosNaLiga(
    db,
    visiveis.map((m) => m.userId),
    semana,
  );
  const linhas = posicoesComEmpate(
    visiveis.map((m) => ({
      userId: m.userId,
      apelido: m.oculto ? "Apelido em revisão" : m.apelido,
      pontos: pontos.get(m.userId) ?? 0,
    })),
  ).sort((a, b) => a.posicao - b.posicao || a.apelido.localeCompare(b.apelido));
  const grupo: LinhaDoRanking[] = linhas.map((l) => ({
    posicao: l.posicao,
    apelido: l.apelido,
    pontos: l.pontos,
    voce: l.userId === userId,
  }));
  return {
    estado: "participando",
    apelido: p.apelido,
    semana,
    grupo,
    liga: await infoDaLiga(db, userId, g.divisao, semana, grupo.length <= 1),
  };
}

/* ------------------------------------------------------------------ fechamento semanal --- */

export interface ResultadoDoFechamento {
  semana: string;
  /** `false` = a semana já estava fechada (nada mudou). */
  fechada: boolean;
  participantes: number;
}

/** Fecha uma semana: grava os resultados e a divisão da semana seguinte. Idempotente (`liga:<semana>`). */
export async function fecharSemana(
  db: Banco,
  semana: string,
  agora: Date,
): Promise<ResultadoDoFechamento> {
  return db.transaction(async (tx) => {
    const nova = await tx
      .insert(ligaFechamento)
      .values({ chave: `liga:${semana}`, fechadaEm: agora })
      .onConflictDoNothing()
      .returning({ c: ligaFechamento.chave });
    if (!nova.length) return { semana, fechada: false, participantes: 0 };
    const linhas = await tx
      .select({
        userId: rankingGrupo.userId,
        grupo: rankingGrupo.grupo,
        divisao: rankingGrupo.divisao,
        maiorDesde: rankingParticipante.maiorDesde,
        saiuEm: rankingParticipante.saiuEm,
        suspenso: rankingParticipante.socialSuspensoEm,
        ano: user.birthYear,
      })
      .from(rankingGrupo)
      .innerJoin(rankingParticipante, eq(rankingParticipante.userId, rankingGrupo.userId))
      .innerJoin(user, eq(user.id, rankingGrupo.userId))
      .where(eq(rankingGrupo.semana, semana));
    const validos = linhas.filter(
      (l) => !l.saiuEm && !l.suspenso && adultoPeloCadastro(l.ano, l.maiorDesde, agora),
    );
    const pontos = await pontosNaLiga(
      tx,
      validos.map((l) => l.userId),
      semana,
    );
    const grupos = new Map<
      string,
      { divisao: number; membros: { item: string; pontos: number }[] }
    >();
    for (const l of validos) {
      const k = `${l.divisao}:${l.grupo}`;
      const g = grupos.get(k) ?? { divisao: l.divisao, membros: [] };
      g.membros.push({ item: l.userId, pontos: pontos.get(l.userId) ?? 0 });
      grupos.set(k, g);
    }
    let n = 0;
    for (const g of grupos.values()) {
      for (const r of fecharGrupo(g.divisao, g.membros)) {
        await tx
          .insert(ligaResultado)
          .values({
            semana,
            userId: r.item,
            divisao: divisaoValida(g.divisao),
            posicao: r.posicao,
            pontos: r.pontos,
            movimento: r.movimento,
            criadoEm: agora,
          })
          .onConflictDoNothing();
        await tx
          .update(rankingParticipante)
          .set({ divisao: r.novaDivisao, pausado: r.pausa })
          .where(eq(rankingParticipante.userId, r.item));
        n++;
      }
    }
    await tx
      .update(ligaFechamento)
      .set({ participantes: n })
      .where(eq(ligaFechamento.chave, `liga:${semana}`));
    return { semana, fechada: true, participantes: n };
  });
}

/**
 * Grupos da semana com quem está na liga e não está em pausa (fora menores e suspensos). Divisão sem grupos ainda:
 * grupos equilibrados de até 20; com grupos (gente que entrou antes do cron): cada um no menor grupo com vaga.
 */
export async function formarGruposDaSemana(
  db: Banco,
  semana: string,
  agora: Date,
): Promise<number> {
  const ja = new Set(
    (
      await db
        .select({ u: rankingGrupo.userId })
        .from(rankingGrupo)
        .where(eq(rankingGrupo.semana, semana))
    ).map((r) => r.u),
  );
  const candidatos = await db
    .select({
      userId: rankingParticipante.userId,
      divisao: rankingParticipante.divisao,
      maiorDesde: rankingParticipante.maiorDesde,
      suspenso: rankingParticipante.socialSuspensoEm,
      ano: user.birthYear,
    })
    .from(rankingParticipante)
    .innerJoin(user, eq(user.id, rankingParticipante.userId))
    .where(and(isNull(rankingParticipante.saiuEm), eq(rankingParticipante.pausado, false)))
    .orderBy(rankingParticipante.entrouEm, rankingParticipante.userId);
  const porDivisao = new Map<number, string[]>();
  for (const c of candidatos) {
    if (ja.has(c.userId) || c.suspenso || !adultoPeloCadastro(c.ano, c.maiorDesde, agora)) continue;
    const d = divisaoValida(c.divisao);
    porDivisao.set(d, [...(porDivisao.get(d) ?? []), c.userId]);
  }
  let n = 0;
  for (const [divisao, ids] of porDivisao) {
    const [existe] = await db
      .select({ n: count() })
      .from(rankingGrupo)
      .where(and(eq(rankingGrupo.semana, semana), eq(rankingGrupo.divisao, divisao)));
    if (Number(existe?.n ?? 0) === 0) {
      const grupos = formarGrupos(ids);
      const valores = grupos.flatMap((g, i) =>
        g.map((userId) => ({ semana, userId, grupo: i, divisao })),
      );
      if (valores.length) await db.insert(rankingGrupo).values(valores).onConflictDoNothing();
      n += valores.length;
    } else {
      for (const userId of ids) {
        await entrarNoGrupo(db, userId, semana, divisao);
        n++;
      }
    }
  }
  return n;
}

/** Rotina diária (`/api/cron/ligas`): fecha a semana anterior se ainda não fechou e forma os grupos desta. */
export async function rodarLigas(
  db: Banco,
  agora: Date,
): Promise<
  | { ligas: "desligadas" }
  | { ligas: "ok"; fechamento: ResultadoDoFechamento; novosNosGrupos: number }
> {
  if (!ligasLigadas()) return { ligas: "desligadas" };
  const semana = semanaDe(hojeSP(agora));
  const fechamento = await fecharSemana(db, semanaAnterior(semana), agora);
  const novosNosGrupos = await formarGruposDaSemana(db, semana, agora);
  return { ligas: "ok", fechamento, novosNosGrupos };
}

/** Sai da liga na hora (correção de idade para menor, §5.5): o apelido some do grupo; os dados saem em 30 dias. */
export async function tirarDaLiga(db: Leitor, userId: string, agora: Date): Promise<void> {
  await db
    .update(rankingParticipante)
    .set({
      saiuEm: sql`coalesce(${rankingParticipante.saiuEm}, ${agora.toISOString()}::timestamptz)`,
    })
    .where(eq(rankingParticipante.userId, userId));
  await db.delete(rankingGrupo).where(eq(rankingGrupo.userId, userId));
}

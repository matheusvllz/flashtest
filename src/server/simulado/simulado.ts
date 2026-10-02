/**
 * Simulado no servidor (spec 50 §5.9.4, T-50.10.2–10.5). Pelo `userId` da sessão; a correção é sempre do servidor
 * (gabarito oficial). Mini-simulado da semana para todos (`miniSimulado`), simulado completo e prova oficial no Pro
 * (`simulado`). Sem vida, sem combo, sem Foca durante a prova; cronômetro opcional e que nunca encerra sozinho.
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, inArray, like, sql } from "drizzle-orm";
import { checkAnswer } from "@/lib/lessons/define";
import { chavePerola, PEROLAS_POR_BLOCO, BLOCOS_PAGOS_POR_DIA, PEROLAS_SIMULADO } from "@/lib/perolas";
import {
  composicaoDaProva,
  composicaoMini,
  composicaoNivel,
  MINIMO_PARA_MINI,
  montarResultado,
  provasDisponiveis,
  semanaDe,
  type AreaEnem,
  type ProvaDisponivel,
  type ResultadoDoSimulado,
} from "@/lib/simulado";
import type { NovidadesDoServidor } from "@/lib/sync/contrato";
import type { JsonObjeto } from "@/lib/json";
import type { Banco } from "../db/client";
import { attempt, auditEvent, profile, questaoReporte, questaoRetirada, simulado, xpLedger } from "../db/schema";
import { exercicioDoItem, itensOficiais } from "../estudo/conteudo";
import { registrarNoCaderno } from "../estudo/caderno";
import { dataNoFuso, marcarDia, pagarXp } from "../estudo/sincronizar";
import { creditar, movimentosNoDia } from "../economia/perolas";
import { progredirMissoes, avaliarConquistas } from "../gamificacao/missoes";
import { historicoDoAluno } from "../gamificacao/ofensiva";
import { alunoTemFuncao, recursoLigado } from "../planos/funcoes";
import { ErroApp } from "../http";

export const NOMES_DAS_AREAS: Record<AreaEnem, string> = {
  LC: "Linguagens",
  CH: "Ciências Humanas",
  CN: "Ciências da Natureza",
  MT: "Matemática",
};
const DIAS_PARA_ABANDONO = 30;
const XP_SIMULADO = 30;
const XP_MINI = 10;

export type PedidoDeSimulado =
  | { tipo: "mini" }
  | { tipo: "prova"; ano: number; area: AreaEnem }
  | { tipo: "nivel"; area: AreaEnem }
  | { tipo: "dia"; dia: 1 | 2 };

async function hojeDoAluno(db: Banco, userId: string, agora: Date): Promise<string> {
  const [p] = await db.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).limit(1);
  return dataNoFuso(agora, p?.tz ?? "America/Sao_Paulo");
}

async function retiradas(db: Banco): Promise<Set<string>> {
  return new Set((await db.select({ id: questaoRetirada.itemId }).from(questaoRetirada)).map((r) => r.id));
}

async function itensDisponiveis(db: Banco) {
  const fora = await retiradas(db);
  return itensOficiais().filter((i) => !fora.has(i.id));
}

export interface OpcoesDeSimulado {
  mini: { disponivel: boolean; id: string | null; concluido: boolean };
  completo: { liberado: boolean; provas: ProvaDisponivel[] };
  historico: { id: string; rotulo: string; concluido: boolean; acertos: number | null; total: number; em: string }[];
}

export async function opcoesDeSimulado(db: Banco, userId: string, agora: Date): Promise<OpcoesDeSimulado> {
  const hoje = await hojeDoAluno(db, userId, agora);
  const itens = await itensDisponiveis(db);
  const idMini = `mini:${userId}:${semanaDe(hoje)}`;
  const [mini] = await db.select({ concluido: simulado.concluidoEm }).from(simulado).where(and(eq(simulado.id, idMini), eq(simulado.userId, userId))).limit(1);
  const limite = new Date(agora.getTime() - DIAS_PARA_ABANDONO * 86_400_000);
  const linhas = await db
    .select()
    .from(simulado)
    .where(and(eq(simulado.userId, userId), gte(simulado.iniciadoEm, limite)))
    .orderBy(desc(simulado.iniciadoEm))
    .limit(30);
  return {
    mini: { disponivel: recursoLigado("miniSimulado") && itens.length >= MINIMO_PARA_MINI, id: mini ? idMini : null, concluido: !!mini?.concluido },
    completo: { liberado: await alunoTemFuncao(db, userId, "simulado", agora), provas: provasDisponiveis(itens) },
    historico: linhas.map((l) => ({
      id: l.id,
      rotulo: l.rotulo ?? "Simulado",
      concluido: !!l.concluidoEm,
      acertos: l.resultado ? Number((l.resultado as { acertos?: number }).acertos ?? 0) : null,
      total: (l.itens as string[]).length,
      em: l.iniciadoEm.toISOString(),
    })),
  };
}

export async function iniciarSimulado(db: Banco, userId: string, pedido: PedidoDeSimulado, cronometro: boolean, agora: Date): Promise<{ id: string }> {
  const hoje = await hojeDoAluno(db, userId, agora);
  const itens = await itensDisponiveis(db);
  if (pedido.tipo === "mini") {
    if (!recursoLigado("miniSimulado") || itens.length < MINIMO_PARA_MINI) throw new ErroApp(409, "MINI_INDISPONIVEL");
    const id = `mini:${userId}:${semanaDe(hoje)}`;
    await db
      .insert(simulado)
      .values({
        id,
        userId,
        tipo: "mini",
        itens: composicaoMini(itens, semanaDe(hoje)),
        rotulo: "Mini-simulado da semana · nível ENEM",
        cronometro,
        ultimaAtividadeEm: agora,
      })
      .onConflictDoNothing();
    return { id };
  }
  if (!(await alunoTemFuncao(db, userId, "simulado", agora))) throw new ErroApp(403, "FUNCAO_FECHADA");
  let ids: string[] = [];
  let rotulo = "";
  let area: AreaEnem | null = null;
  let ano: number | null = null;
  if (pedido.tipo === "prova") {
    ids = composicaoDaProva(itens, pedido.ano, pedido.area);
    const total = 45;
    rotulo = `Prova do ENEM ${pedido.ano} · ${NOMES_DAS_AREAS[pedido.area]}${ids.length < total ? ` (${ids.length} de ${total} questões disponíveis)` : ""}`;
    area = pedido.area;
    ano = pedido.ano;
  } else {
    const vistos = new Set(
      (await db.select({ id: attempt.itemId }).from(attempt).where(and(eq(attempt.userId, userId), inArray(attempt.itemId, itens.map((i) => i.id))))).map(
        (r) => r.id,
      ),
    );
    const semente = `${userId}:${agora.getTime()}`;
    if (pedido.tipo === "nivel") {
      ids = composicaoNivel(itens, pedido.area, vistos, semente);
      area = pedido.area;
      rotulo = `Simulado nível ENEM · ${NOMES_DAS_AREAS[pedido.area]} · questões do ENEM de vários anos`;
    } else {
      const areas: AreaEnem[] = pedido.dia === 1 ? ["LC", "CH"] : ["CN", "MT"];
      ids = areas.flatMap((a) => composicaoNivel(itens, a, vistos, semente));
      rotulo = `Simulado nível ENEM · ${pedido.dia}º dia · questões do ENEM de vários anos`;
    }
  }
  if (ids.length === 0) throw new ErroApp(409, "SEM_QUESTOES");
  const id = `sim-${crypto.randomUUID()}`;
  await db.insert(simulado).values({
    id,
    userId,
    tipo: pedido.tipo === "dia" ? "dia" : pedido.tipo,
    area,
    ano,
    itens: ids,
    rotulo,
    cronometro,
    ultimaAtividadeEm: agora,
  });
  return { id };
}

async function doAluno(db: Banco, userId: string, id: string) {
  const [s] = await db.select().from(simulado).where(and(eq(simulado.id, id), eq(simulado.userId, userId))).limit(1);
  if (!s) throw new ErroApp(404, "NAO_ENCONTRADO");
  return s;
}

export interface EstadoDoSimulado {
  id: string;
  rotulo: string;
  tipo: string;
  itens: string[];
  respostas: Record<string, number | null>;
  marcadas: string[];
  cronometro: boolean;
  tempoMs: number;
  concluido: boolean;
  resultado: ResultadoDoSimulado | null;
  gabarito: Record<string, number> | null;
}

export async function estadoDoSimulado(db: Banco, userId: string, id: string): Promise<EstadoDoSimulado> {
  const s = await doAluno(db, userId, id);
  const itens = s.itens as string[];
  const concluido = !!s.concluidoEm;
  let gabarito: Record<string, number> | null = null;
  // O gabarito só sai depois de terminar.
  if (concluido) {
    gabarito = {};
    for (const it of itens) {
      const ex = await exercicioDoItem(it);
      if (ex && "correta" in ex && typeof ex.correta === "number") gabarito[it] = ex.correta;
    }
  }
  return {
    id: s.id,
    rotulo: s.rotulo ?? "Simulado",
    tipo: s.tipo,
    itens,
    respostas: (s.respostas ?? {}) as Record<string, number | null>,
    marcadas: (s.marcadas ?? []) as string[],
    cronometro: s.cronometro,
    tempoMs: s.tempoMs,
    concluido,
    resultado: (s.resultado as unknown as ResultadoDoSimulado | null) ?? null,
    gabarito,
  };
}

/** Salva a resposta na hora (retomada em qualquer aparelho). Resposta `null` = deixou em branco. */
export async function responderSimulado(
  db: Banco,
  userId: string,
  id: string,
  itemId: string,
  resposta: number | null,
  marcada: boolean | undefined,
  tempoMs: number,
  agora: Date,
): Promise<{ ok: true }> {
  await db.transaction(async (tx) => {
    // Trava a linha: dois envios ao mesmo tempo (dois aparelhos, toques rápidos) não perdem resposta.
    const [s] = await tx.select().from(simulado).where(and(eq(simulado.id, id), eq(simulado.userId, userId))).for("update");
    if (!s) throw new ErroApp(404, "NAO_ENCONTRADO");
    if (s.concluidoEm) throw new ErroApp(409, "JA_CONCLUIDO");
    if (!(s.itens as string[]).includes(itemId)) throw new ErroApp(400, "ITEM_FORA");
    const respostas = { ...((s.respostas ?? {}) as Record<string, number | null>), [itemId]: resposta };
    let marcadas = (s.marcadas ?? []) as string[];
    if (marcada !== undefined) marcadas = marcada ? [...new Set([...marcadas, itemId])] : marcadas.filter((m) => m !== itemId);
    await tx
      .update(simulado)
      .set({ respostas: respostas as unknown as JsonObjeto, marcadas, tempoMs: Math.max(s.tempoMs, Math.min(tempoMs, 12 * 3_600_000)), ultimaAtividadeEm: agora })
      .where(and(eq(simulado.id, id), eq(simulado.userId, userId)));
  });
  return { ok: true };
}

/** Recompensa (XP, dia de estudo, Pérolas, missões) só com respostas de verdade: um simulado vazio não paga nada. */
export const MINIMO_RESPOSTAS_PARA_RECOMPENSA = 5;
/** Teto diário de simulados que pagam XP (os demais contam como estudo, sem XP). */
export const SIMULADOS_COM_XP_POR_DIA = 3;

export async function concluirSimulado(db: Banco, userId: string, id: string, tempoMs: number, agora: Date): Promise<ResultadoDoSimulado> {
  const antes = await doAluno(db, userId, id);
  if (antes.concluidoEm && antes.resultado) return antes.resultado as unknown as ResultadoDoSimulado;
  const hoje = await hojeDoAluno(db, userId, agora);
  const oficiais = new Map(itensOficiais().map((i) => [i.id, i]));
  const comCaderno = await alunoTemFuncao(db, userId, "cadernoDeErros", agora);
  const novidades: NovidadesDoServidor = { perolasGanhas: 0, vidasDoCombo: 0, metaCumprida: null, marco: null, perfeitas: 0, conquistas: [], missoesConcluidas: [], desafioDoMes: false };
  return db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    await tx.select({ u: profile.userId }).from(profile).where(eq(profile.userId, userId)).for("update");
    // As respostas são lidas depois da trava: nenhuma resposta enviada antes de terminar fica de fora.
    const [s] = await tx.select().from(simulado).where(and(eq(simulado.id, id), eq(simulado.userId, userId))).for("update");
    if (!s) throw new ErroApp(404, "NAO_ENCONTRADO");
    if (s.concluidoEm && s.resultado) return s.resultado as unknown as ResultadoDoSimulado;
    const respostas = (s.respostas ?? {}) as Record<string, number | null>;
    const linhas: { id: string; area: AreaEnem; skillId: string | null; correta: boolean; respondida: boolean }[] = [];
    for (const it of s.itens as string[]) {
      const ex = await exercicioDoItem(it);
      const r = respostas[it];
      const respondida = typeof r === "number";
      const correta = !!ex && respondida && checkAnswer(ex, r as number);
      const o = oficiais.get(it);
      linhas.push({ id: it, area: o?.area ?? "LC", skillId: o?.skillIds[0] ?? null, correta, respondida });
    }
    const resultado = montarResultado(linhas, Math.max(s.tempoMs, Math.min(tempoMs, 12 * 3_600_000)));
    await tx
      .update(simulado)
      .set({ concluidoEm: agora, resultado: resultado as unknown as JsonObjeto, tempoMs: resultado.tempoMs })
      .where(and(eq(simulado.id, id), eq(simulado.userId, userId)));
    // As respostas entram como tentativas (evidência independente, fonte "simulado"); erros vão ao caderno de quem tem.
    for (const [i, l] of linhas.entries()) {
      if (!l.respondida) continue;
      await tx
        .insert(attempt)
        .values({
          userId,
          id: `sim-${id.slice(-24)}-${i}`.slice(0, 64),
          itemId: l.id,
          answer: JSON.stringify(respostas[l.id]),
          correct: l.correta,
          source: "simulado",
          answeredAt: agora,
          localDate: hoje,
        })
        .onConflictDoNothing();
      if (comCaderno) await registrarNoCaderno(tx, userId, l.id, "simulado", l.correta, hoje);
    }
    // Simulado vazio (ou quase) só registra o resultado: não paga XP, dia, Pérolas nem missão.
    if (resultado.respondidas < Math.min(MINIMO_RESPOSTAS_PARA_RECOMPENSA, linhas.length)) return resultado;
    const mini = s.tipo === "mini";
    const [comXp] = await tx
      .select({ n: sql<number>`count(*)` })
      .from(xpLedger)
      .where(and(eq(xpLedger.userId, userId), eq(xpLedger.localDate, hoje), like(xpLedger.key, "simulado:%")));
    if (Number(comXp?.n ?? 0) < SIMULADOS_COM_XP_POR_DIA) await pagarXp(tx, userId, `simulado:${id}`, mini ? XP_MINI : XP_SIMULADO, "simulado", hoje);
    await marcarDia(tx, userId, hoje);
    if (recursoLigado("perolas")) {
      if (mini) {
        if ((await movimentosNoDia(tx, userId, "bloco", hoje)) < BLOCOS_PAGOS_POR_DIA) {
          await creditar(tx, userId, chavePerola.bloco(`simulado:${id}`), PEROLAS_POR_BLOCO, "bloco", hoje);
        }
      } else if ((await movimentosNoDia(tx, userId, "simulado", hoje)) < 1) {
        await creditar(tx, userId, chavePerola.simulado(id), PEROLAS_SIMULADO, "simulado", hoje, id);
      }
    }
    await progredirMissoes(tx, userId, hoje, mini ? [{ tipo: "mini" }, { tipo: "bloco", flashcards: false }] : [{ tipo: "bloco", flashcards: false }], agora, novidades);
    await avaliarConquistas(tx, userId, hoje, (await historicoDoAluno(tx, userId, agora)).estado.melhorSequencia, novidades);
    return resultado;
  });
}

/**
 * Reporte de problema numa questão (spec 50 §5.9.2): duas pessoas com o mesmo motivo retiram o item dos simulados.
 * Só vale para questão oficial que o próprio aluno já respondeu (numa tentativa ou num simulado dele): ninguém
 * retira em massa questões que nunca viu. A retirada vai para `audit_event` para o suporte conferir e reverter.
 */
export async function reportarQuestao(db: Banco, userId: string, itemId: string, motivo: "texto" | "imagem" | "gabarito" | "outro"): Promise<{ ok: true; retirada: boolean }> {
  if (!itensOficiais().some((i) => i.id === itemId)) throw new ErroApp(400, "ITEM_FORA");
  const [tentou] = await db
    .select({ u: attempt.userId })
    .from(attempt)
    .where(and(eq(attempt.userId, userId), eq(attempt.itemId, itemId)))
    .limit(1);
  const [viu] = tentou
    ? [tentou]
    : await db
        .select({ u: simulado.userId })
        .from(simulado)
        .where(and(eq(simulado.userId, userId), sql`${simulado.respostas} ? ${itemId}`))
        .limit(1);
  if (!viu) throw new ErroApp(403, "QUESTAO_NAO_RESPONDIDA");
  await db.insert(questaoReporte).values({ userId, itemId, motivo }).onConflictDoNothing();
  const [n] = await db
    .select({ n: sql<number>`count(*)` })
    .from(questaoReporte)
    .where(and(eq(questaoReporte.itemId, itemId), eq(questaoReporte.motivo, motivo)));
  const retirada = Number(n?.n ?? 0) >= 2;
  if (retirada) {
    const nova = await db.insert(questaoRetirada).values({ itemId, motivo }).onConflictDoNothing().returning({ id: questaoRetirada.itemId });
    if (nova.length) await db.insert(auditEvent).values({ id: randomUUID(), userId: null, type: `questao_retirada:${motivo}` }).catch(() => {});
  }
  return { ok: true, retirada };
}

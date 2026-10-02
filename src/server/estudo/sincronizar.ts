/**
 * Aplica os eventos de estudo de um aluno (docs/specs/46-producao §E.4, T-06.2/T-06.3).
 *
 * Tudo numa transação, com o perfil do aluno travado (`FOR UPDATE`) para serializar os envios do
 * mesmo aluno (dois aparelhos ao mesmo tempo não pagam XP duas vezes). Para cada evento:
 *   - repetido (mesmo id) → aceito sem efeito (idempotência);
 *   - resposta → correção recalculada pelo gabarito (`checkAnswer`), nunca pelo cliente;
 *   - conclusão → XP pelas regras de `src/lib/recompensas.ts`, com teto por chave no livro de XP;
 *   - todo evento de conclusão marca o dia como estudado (base da sequência).
 * Datas: `dataLocal` precisa estar entre 7 dias atrás e amanhã no fuso do aluno (estudo offline
 * sincronizado depois ainda conta; datas inventadas longe de hoje, não).
 */
import { and, count, eq, isNotNull, max, ne, sql, sum } from "drizzle-orm";
import { checkAnswer } from "@/lib/lessons/define";
import {
  XP_BONUS_ENTRADA,
  XP_POR_ESTRELAS,
  estrelasPorPct,
  pctDe,
  SEQUENCIA_INICIAL,
  sequenciaDosDias,
  xpAlvoDaAtividade,
  xpAlvoDaQuestaoGeral,
} from "@/lib/recompensas";
import type { Agregado, EventoEstudo, MotivoRejeicao, NovidadesDoServidor, RespostaEnvio } from "@/lib/sync/contrato";
import { XP_BONUS_COMBO_TETO_DIA, xpBonusDoCombo } from "@/lib/combo";
import {
  BLOCOS_PAGOS_POR_DIA,
  PEROLAS_LICAO_PERFEITA,
  PEROLAS_POR_BLOCO,
  PEROLAS_POR_NIVEL,
  PERFEITAS_PAGAS_POR_DIA,
  chavePerola,
} from "@/lib/perolas";
import { nivelDeXp } from "@/lib/niveis";
import { aplicarComboNoServidor, concederVidaDoCombo, FONTES_DO_COMBO } from "../economia/combo";
import { creditar, movimentosNoDia, saldoDePerolas } from "../economia/perolas";
import { avaliarOfensiva, historicoDoAluno } from "../gamificacao/ofensiva";
import { avaliarConquistas, progredirMissoes, type FatoDeMissao } from "../gamificacao/missoes";
import { areaDoItem } from "./conteudo";
import { cadernoItem } from "../db/schema";
import { recursoLigado } from "../planos/funcoes";
import { comboDia, cosmeticoEquipado } from "../db/schema";
import type { Banco } from "../db/client";
import { attempt, completion, profile, studyDay, xpLedger } from "../db/schema";
import { exercicioDoItem, licaoExiste } from "./conteudo";
import { BENEFICIOS } from "@/lib/planos";
import { custaVida } from "@/lib/vidas";
import { planoDoAluno } from "../planos/plano";
import { creditosDeProtetor } from "../planos/protetores";
import { alunoTemFuncao } from "../planos/funcoes";
import { registrarNoCaderno } from "./caderno";
import { alunoTemVidas, perderVida, vidasDoDia, vidasLigadasPara } from "../vidas/vidas";

/** Teto diário de atividades da trilha que pagam XP (a chave de atividade é por tentativa, sem teto natural). */
export const ATIVIDADES_PAGAS_POR_DIA = 60;
const JANELA_DIAS_ATRAS = 7;

/** Data `AAAA-MM-DD` de `quando` no fuso `tz`. */
export function dataNoFuso(quando: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(quando);
}

/** Dia de hoje ou de ontem: só eles pagam recompensa nova de bloco sem tentativa (Pérolas, missões, meta e marcos). */
function diaRecente(dataLocal: string, hoje: string): boolean {
  const diff = Math.round((Date.parse(`${hoje}T00:00:00Z`) - Date.parse(`${dataLocal}T00:00:00Z`)) / 86_400_000);
  return diff >= -1 && diff <= 1;
}

/** A aula de 60 s responde 2 questões do banco geral: sem elas no dia, o bloco não paga recompensa da 50. */
const RESPOSTAS_POR_AULA = 2;

function diaValido(dataLocal: string, hoje: string): boolean {
  const d = Date.parse(`${dataLocal}T00:00:00Z`);
  const h = Date.parse(`${hoje}T00:00:00Z`);
  const diff = Math.round((h - d) / 86_400_000);
  return diff >= -1 && diff <= JANELA_DIAS_ATRAS;
}

export type Tx = Parameters<Parameters<Banco["transaction"]>[0]>[0];

export async function pagarXp(tx: Tx, userId: string, chave: string, alvo: number, motivo: string, dataLocal: string) {
  await tx
    .insert(xpLedger)
    .values({ userId, key: chave, xp: alvo, reason: motivo, localDate: dataLocal })
    .onConflictDoUpdate({
      target: [xpLedger.userId, xpLedger.key],
      set: { xp: sql`greatest(${xpLedger.xp}, excluded.xp)`, updatedAt: sql`now()` },
    });
}

export async function marcarDia(tx: Tx, userId: string, dataLocal: string) {
  await tx
    .insert(studyDay)
    .values({ userId, localDate: dataLocal, blocks: 1 })
    .onConflictDoUpdate({ target: [studyDay.userId, studyDay.localDate], set: { blocks: sql`${studyDay.blocks} + 1` } });
}

/** Pérolas por bloco concluído (spec 50 §5.3.2): 5 por bloco, até 5 blocos pagos por dia. */
async function pagarPerolasDoBloco(tx: Tx, userId: string, conclusao: string, dataLocal: string, nov: NovidadesDoServidor) {
  if ((await movimentosNoDia(tx, userId, "bloco", dataLocal)) >= BLOCOS_PAGOS_POR_DIA) return;
  if (await creditar(tx, userId, chavePerola.bloco(conclusao), PEROLAS_POR_BLOCO, "bloco", dataLocal)) nov.perolasGanhas += PEROLAS_POR_BLOCO;
}

/**
 * Fim de uma tentativa com chave (lição ou atividade): bônus fixo de XP pelo maior combo (até 20 XP/dia) e lição
 * perfeita (≥ 4 pontuadas certas de primeira, sem ajuda; até 3 por dia). Spec 50 §5.1.3, §5.1.6.
 */
async function fecharTentativa(
  tx: Tx,
  userId: string,
  attemptKey: string,
  dataLocal: string,
  opts: { pagaBonus: boolean; podeSerPerfeita: boolean; comPerolas: boolean },
  nov: NovidadesDoServidor,
) {
  const onde = and(eq(attempt.userId, userId), eq(attempt.activityAttemptKey, attemptKey));
  if (opts.pagaBonus) {
    const [m] = await tx.select({ m: max(attempt.combo) }).from(attempt).where(and(onde, isNotNull(attempt.combo)));
    const bonus = xpBonusDoCombo(Number(m?.m ?? 0));
    if (bonus > 0) {
      const [usado] = await tx
        .select({ s: sum(xpLedger.xp) })
        .from(xpLedger)
        .where(and(eq(xpLedger.userId, userId), eq(xpLedger.localDate, dataLocal), sql`${xpLedger.key} like 'combo:%'`));
      const cabe = Math.min(bonus, XP_BONUS_COMBO_TETO_DIA - Number(usado?.s ?? 0));
      if (cabe > 0) await pagarXp(tx, userId, `combo:${attemptKey}`, cabe, "combo", dataLocal);
    }
  }
  if (!opts.podeSerPerfeita || !opts.comPerolas) return;
  const [p] = await tx
    .select({
      total: count(),
      certas: sum(sql<number>`case when ${attempt.correct} and not ${attempt.assistida} then 1 else 0 end`),
    })
    .from(attempt)
    .where(and(onde, eq(attempt.pontuada, true), eq(attempt.tentativa, "primeira")));
  const total = Number(p?.total ?? 0);
  if (total < 4 || Number(p?.certas ?? 0) !== total) return;
  if ((await movimentosNoDia(tx, userId, "perfeita", dataLocal)) >= PERFEITAS_PAGAS_POR_DIA) return;
  if (await creditar(tx, userId, chavePerola.perfeita(attemptKey), PEROLAS_LICAO_PERFEITA, "perfeita", dataLocal)) {
    nov.perolasGanhas += PEROLAS_LICAO_PERFEITA;
    nov.perfeitas += 1;
  }
}

async function jaConcluido(tx: Tx, userId: string, chave: string): Promise<boolean> {
  const r = await tx.select({ k: completion.key }).from(completion).where(and(eq(completion.userId, userId), eq(completion.key, chave))).limit(1);
  return r.length > 0;
}

/** Aplica um lote de eventos já validados pelo contrato. */
export async function aplicarEventos(
  db: Banco,
  userId: string,
  eventos: EventoEstudo[],
  agora: Date = new Date(),
): Promise<RespostaEnvio> {
  const aplicados: string[] = [];
  const rejeitados: Array<{ id: string; motivo: MotivoRejeicao }> = [];
  // Vidas do Free (spec 49 D49-03): decidido uma vez por lote, fora da transação.
  const comVidas = await alunoTemVidas(db, userId, agora);
  // Caderno de erros (spec 49 §5.9 item 2): só grava para quem tem a função (Basic e Pro), como diz privacidade.md.
  const comCaderno = await alunoTemFuncao(db, userId, "cadernoDeErros", agora);
  // Pérolas (spec 50 §5.3): ligadas para todos por padrão; `FUNCOES_DESLIGADAS=perolas` para de conceder.
  const comPerolas = recursoLigado("perolas");
  const novidades: NovidadesDoServidor = {
    perolasGanhas: 0,
    vidasDoCombo: 0,
    metaCumprida: null,
    marco: null,
    perfeitas: 0,
    conquistas: [],
    missoesConcluidas: [],
    desafioDoMes: false,
  };
  let estudouNoEnvio = false;
  // Fatos que fazem as missões andarem (spec 50 §5.4.1), por dia local do evento.
  const fatos = new Map<string, FatoDeMissao[]>();
  const fato = (dia: string, f: FatoDeMissao) => {
    const lista = fatos.get(dia) ?? [];
    lista.push(f);
    fatos.set(dia, lista);
  };

  await db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    const [perfil] = await tx.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).for("update");
    const hoje = dataNoFuso(agora, perfil?.tz ?? "America/Sao_Paulo");
    const xpAntes = await xpDoAluno(tx, userId);

    for (const ev of eventos) {
      if (!diaValido(ev.dataLocal, hoje) || Date.parse(ev.ocorreuEm) > agora.getTime() + 5 * 60_000) {
        rejeitados.push({ id: ev.id, motivo: "DATA_FORA_DA_JANELA" });
        continue;
      }
      switch (ev.tipo) {
        case "resposta": {
          const existente = await tx
            .select({ id: attempt.id })
            .from(attempt)
            .where(and(eq(attempt.userId, userId), eq(attempt.id, ev.id)))
            .limit(1);
          if (existente.length) {
            aplicados.push(ev.id);
            break;
          }
          const exercicio = await exercicioDoItem(ev.itemId);
          if (!exercicio) {
            rejeitados.push({ id: ev.id, motivo: "ITEM_DESCONHECIDO" });
            break;
          }
          const correta = ev.resposta === null ? false : checkAnswer(exercicio, ev.resposta, ev.exibidos);
          // Revisão de erros do fim da lição (spec 50 §5.1.4): fica gravada, mas sem atividade, sem vida e sem caderno.
          const revisao = ev.tentativa === "revisao";
          await tx.insert(attempt).values({
            userId,
            id: ev.id,
            itemId: ev.itemId,
            answer: JSON.stringify(ev.resposta),
            correct: correta,
            source: ev.fonte,
            durationMs: ev.duracaoMs,
            answeredAt: new Date(ev.ocorreuEm),
            localDate: ev.dataLocal,
            activityAttemptKey: revisao ? null : ev.attemptKey,
            tentativa: revisao ? "revisao" : "primeira",
            assistida: ev.assistida === true,
            pontuada: ev.pontuada !== false,
          });
          // Combo (spec 50 §5.1.1): decidido aqui, na ordem das respostas; revisão e fontes fora da lista não contam.
          if (!revisao && FONTES_DO_COMBO.has(ev.fonte)) {
            const conta = ev.pontuada !== false;
            const combo = await aplicarComboNoServidor(tx, userId, {
              dataLocal: ev.dataLocal,
              ocorreuEm: new Date(ev.ocorreuEm),
              resultado: ev.resposta === null ? "nao-sei" : correta ? "certa" : "errada",
              conta,
              assistida: ev.assistida === true,
            });
            if (conta) {
              await tx.update(attempt).set({ combo: combo.estado.atual }).where(and(eq(attempt.userId, userId), eq(attempt.id, ev.id)));
            }
            if (combo.vida && comVidas && (await concederVidaDoCombo(tx, userId, ev.dataLocal))) novidades.vidasDoCombo += 1;
            if (conta) fato(ev.dataLocal, { tipo: "combo", atual: combo.estado.atual });
          }
          if (!revisao && ev.pontuada !== false && ev.fonte !== "nivelamento") {
            const area = await areaDoItem(ev.itemId);
            if (area) fato(ev.dataLocal, { tipo: "resposta-area", area });
          }
          if (!revisao && comCaderno) {
            const [noCaderno] = await tx
              .select({ e: cadernoItem.estado })
              .from(cadernoItem)
              .where(and(eq(cadernoItem.userId, userId), eq(cadernoItem.itemId, ev.itemId)))
              .limit(1);
            if (noCaderno?.e === "ativo") fato(ev.dataLocal, { tipo: "caderno" });
          }
          if (ev.fonte === "questao-geral" && !revisao) {
            await pagarXp(tx, userId, `questao-geral:${ev.itemId}`, xpAlvoDaQuestaoGeral(correta), "questao-geral", ev.dataLocal);
          }
          // A resposta nunca é recusada por falta de vida (o estudo feito sem conexão não é apagado): só o saldo baixa.
          if (comVidas && !revisao && custaVida(ev.fonte, correta, ev.resposta === null)) await perderVida(tx, userId, ev.dataLocal);
          // Caderno de erros (spec 49 T-49.9.1): registrado para todos; ver é Basic e Pro.
          if (comCaderno && !revisao) await registrarNoCaderno(tx, userId, ev.itemId, ev.fonte, correta, ev.dataLocal);
          aplicados.push(ev.id);
          break;
        }
        case "licao-concluida": {
          if (!(await licaoExiste(ev.licaoId, ev.tipoLicao))) {
            rejeitados.push({ id: ev.id, motivo: "LICAO_DESCONHECIDA" });
            break;
          }
          // A pontuação da lição vem do cliente; o teto por lição limita o ganho ao máximo legítimo
          // (risco aceito, docs/seguranca/modelo-de-ameacas.md T7).
          const acertos = Math.min(ev.acertos, ev.total);
          const pct = pctDe(acertos, ev.total);
          const chave = `licao:${ev.tipoLicao}:${ev.licaoId}`;
          // Replay de lição já feita não paga bônus de combo (spec 50 §5.1.3).
          const [anterior] = await tx
            .select({ k: completion.key })
            .from(completion)
            .where(and(eq(completion.userId, userId), sql`${completion.key} like ${`${chave}#%`}`, ne(completion.key, `${chave}#${ev.id}`)))
            .limit(1);
          const r = await tx
            .insert(completion)
            .values({ userId, key: `${chave}#${ev.id}`, kind: `licao-${ev.tipoLicao}`, scorePct: pct, completedAt: new Date(ev.ocorreuEm) })
            .onConflictDoNothing()
            .returning({ k: completion.key });
          if (r.length) {
            await pagarXp(tx, userId, chave, XP_POR_ESTRELAS[estrelasPorPct(pct)], `licao-${ev.tipoLicao}`, ev.dataLocal);
            await marcarDia(tx, userId, ev.dataLocal);
            estudouNoEnvio = true;
            fato(ev.dataLocal, { tipo: "bloco", flashcards: false });
            if (comPerolas) await pagarPerolasDoBloco(tx, userId, `${chave}#${ev.id}`, ev.dataLocal, novidades);
            if (ev.attemptKey) {
              const antes = novidades.perfeitas;
              await fecharTentativa(tx, userId, ev.attemptKey, ev.dataLocal, { pagaBonus: !anterior, podeSerPerfeita: true, comPerolas }, novidades);
              if (novidades.perfeitas > antes) fato(ev.dataLocal, { tipo: "perfeita" });
            }
          }
          aplicados.push(ev.id);
          break;
        }
        case "atividade-concluida": {
          const chave = `atividade:${ev.attemptKey}`;
          if (await jaConcluido(tx, userId, chave)) {
            aplicados.push(ev.id);
            break;
          }
          const [placar] = await tx
            .select({ total: count(), acertos: sum(sql<number>`case when ${attempt.correct} then 1 else 0 end`) })
            .from(attempt)
            .where(and(eq(attempt.userId, userId), eq(attempt.activityAttemptKey, ev.attemptKey)));
          const total = Number(placar?.total ?? 0);
          const acertos = Number(placar?.acertos ?? 0);
          if (total === 0) {
            rejeitados.push({ id: ev.id, motivo: "ATIVIDADE_SEM_RESPOSTAS" });
            break;
          }
          const [pagasHoje] = await tx
            .select({ n: count() })
            .from(xpLedger)
            .where(and(eq(xpLedger.userId, userId), eq(xpLedger.localDate, ev.dataLocal), sql`${xpLedger.key} like 'atividade:%'`));
          await tx.insert(completion).values({
            userId,
            key: chave,
            kind: ev.kind,
            scorePct: pctDe(acertos, total),
            completedAt: new Date(ev.ocorreuEm),
          });
          const pagaHoje = Number(pagasHoje?.n ?? 0) < ATIVIDADES_PAGAS_POR_DIA;
          if (pagaHoje) {
            await pagarXp(tx, userId, chave, xpAlvoDaAtividade(ev.kind, acertos, total), `atividade-${ev.kind}`, ev.dataLocal);
          }
          await marcarDia(tx, userId, ev.dataLocal);
          estudouNoEnvio = true;
          fato(ev.dataLocal, { tipo: "bloco", flashcards: false });
          if (ev.kind === "revisao") fato(ev.dataLocal, { tipo: "revisao-trilha" });
          if (comPerolas) await pagarPerolasDoBloco(tx, userId, chave, ev.dataLocal, novidades);
          // A checagem não é lição: sem bônus de combo e sem "perfeita" (spec 50 §5.1.1).
          const ehChecagem = ev.kind === "checkpoint" || ev.kind === "checagem";
          const perfeitasAntes = novidades.perfeitas;
          await fecharTentativa(tx, userId, ev.attemptKey, ev.dataLocal, { pagaBonus: pagaHoje && !ehChecagem, podeSerPerfeita: !ehChecagem, comPerolas }, novidades);
          if (novidades.perfeitas > perfeitasAntes) fato(ev.dataLocal, { tipo: "perfeita" });
          aplicados.push(ev.id);
          break;
        }
        case "bloco-concluido": {
          const r = await tx
            .insert(completion)
            .values({ userId, key: `bloco:${ev.id}`, kind: ev.bloco, completedAt: new Date(ev.ocorreuEm) })
            .onConflictDoNothing()
            .returning({ k: completion.key });
          if (r.length) {
            // O dia conta para a sequência como antes da 50 (sincronização atrasada de até 7 dias).
            await marcarDia(tx, userId, ev.dataLocal);
            // Recompensas novas (Pérolas, missões, meta e marcos) pedem evidência (achado da revisão L2): bloco de hoje
            // ou de ontem e, na aula de 60 s, as respostas dela no servidor. Flashcards não deixam tentativa; ficam
            // limitados pelo teto diário de blocos pagos (DV50-20).
            let comEvidencia = diaRecente(ev.dataLocal, hoje);
            if (comEvidencia && ev.bloco === "aula-60s") {
              const [n] = await tx
                .select({ n: count() })
                .from(attempt)
                .where(and(eq(attempt.userId, userId), eq(attempt.localDate, ev.dataLocal), eq(attempt.source, "questao-geral")));
              comEvidencia = Number(n?.n ?? 0) >= RESPOSTAS_POR_AULA;
            }
            if (comEvidencia) {
              estudouNoEnvio = true;
              fato(ev.dataLocal, { tipo: "bloco", flashcards: ev.bloco === "flashcards" });
              if (comPerolas) await pagarPerolasDoBloco(tx, userId, `bloco:${ev.id}`, ev.dataLocal, novidades);
            }
          }
          aplicados.push(ev.id);
          break;
        }
        case "entrada": {
          await pagarXp(tx, userId, "onboarding:bonus", XP_BONUS_ENTRADA, "entrada", ev.dataLocal);
          aplicados.push(ev.id);
          break;
        }
      }
    }

    let melhorDaOfensiva: number | null = null;
    // Missões do dia (spec 50 §5.4.1): os fatos deste envio, no dia de cada evento.
    for (const [dia, lista] of fatos) await progredirMissoes(tx, userId, dia, lista, agora, novidades);

    if (comPerolas) {
      // Pérolas por nível (spec 50 §5.1.8): +20 por nível alcançado, uma vez cada (idempotente pela chave).
      const nivel = nivelDeXp(await xpDoAluno(tx, userId)).nivel;
      if (nivel > nivelDeXp(xpAntes).nivel || nivel > 1) {
        for (let n = 2; n <= nivel; n++) {
          if (await creditar(tx, userId, chavePerola.nivel(n), PEROLAS_POR_NIVEL, "nivel", hoje, String(n))) novidades.perolasGanhas += PEROLAS_POR_NIVEL;
        }
      }
      // Meta de ofensiva e marcos (spec 50 §5.2.2, §5.2.4): só quando o envio teve estudo.
      if (estudouNoEnvio) {
        const ofensiva = await avaliarOfensiva(tx, userId, hoje, agora);
        melhorDaOfensiva = ofensiva.melhor;
        if (ofensiva.metaCumprida) {
          novidades.metaCumprida = ofensiva.metaCumprida;
          novidades.perolasGanhas += ofensiva.metaCumprida.perolas;
        }
        if (ofensiva.marco) {
          novidades.marco = ofensiva.marco;
          novidades.perolasGanhas += ofensiva.marco.perolas;
        }
      }
    }
    // Conquistas (spec 50 §5.4.3): só quando o envio teve estudo.
    if (estudouNoEnvio) {
      const melhor = melhorDaOfensiva ?? (await historicoDoAluno(tx, userId, agora)).estado.melhorSequencia;
      await avaliarConquistas(tx, userId, hoje, melhor, novidades);
    }
  });

  return { ok: true, aplicados, rejeitados, agregado: { ...(await agregadoDoAluno(db, userId, agora)), novidades } };
}

async function xpDoAluno(db: Pick<Banco, "select">, userId: string): Promise<number> {
  const [x] = await db.select({ xp: sum(xpLedger.xp) }).from(xpLedger).where(eq(xpLedger.userId, userId));
  return Number(x?.xp ?? 0);
}

/** XP, sequência e dias — a verdade do servidor sobre recompensas. */
export async function agregadoDoAluno(db: Banco, userId: string, agora: Date = new Date()): Promise<Agregado> {
  const [x] = await db.select({ xp: sum(xpLedger.xp) }).from(xpLedger).where(eq(xpLedger.userId, userId));
  const dias = await db.select({ d: studyDay.localDate }).from(studyDay).where(eq(studyDay.userId, userId));
  const plano = await planoDoAluno(db, userId, agora);
  const protetoresMax = BENEFICIOS[plano].protetoresEstoqueMax;
  const s = sequenciaDosDias(
    dias.map((r) => r.d),
    SEQUENCIA_INICIAL,
    { creditos: await creditosDeProtetor(db, userId, agora), estoqueMax: protetoresMax },
  );
  const [perfil] = await db.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).limit(1);
  const hoje = dataNoFuso(agora, perfil?.tz ?? "America/Sao_Paulo");
  const vidas = plano === "gratis" && (await vidasLigadasPara(db, userId)) ? await vidasDoDia(db, userId, hoje) : null;
  const [combo] = await db
    .select({ atual: comboDia.atual, maximo: comboDia.maximo })
    .from(comboDia)
    .where(and(eq(comboDia.userId, userId), eq(comboDia.localDate, hoje)))
    .limit(1);
  return {
    xp: Number(x?.xp ?? 0),
    sequencia: s.sequencia,
    melhorSequencia: s.melhorSequencia,
    congelamentos: s.congelamentos,
    ultimoDia: s.ultimoDia,
    diasComAtividade: dias.length,
    diaProtegido: s.diaProtegido ?? null,
    plano,
    protetoresMax,
    vidas,
    perolas: await saldoDePerolas(db, userId),
    combo: combo ? { dia: hoje, atual: combo.atual, maximo: combo.maximo } : null,
    cosmeticos: await (async () => {
      const [c] = await db.select({ roupa: cosmeticoEquipado.roupa, tema: cosmeticoEquipado.tema }).from(cosmeticoEquipado).where(eq(cosmeticoEquipado.userId, userId)).limit(1);
      return { roupa: c?.roupa ?? null, tema: c?.tema ?? null };
    })(),
  };
}

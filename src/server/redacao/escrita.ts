/**
 * Tarefas de escrita da trilha de redação no servidor (spec 50 §5.10.1–5.10.2, T-50.11.1 e T-50.11.4). Para todos os
 * planos, pelo `userId` da sessão.
 *
 * - Enviar uma tarefa com o tamanho mínimo = 1 bloco: Pérolas pelo teto de blocos do dia, dia de estudo (ofensiva),
 *   missões ("fazer" e "escrita-1"), conquistas ("10 tarefas de escrita"). XP 10 só na primeira vez de cada tarefa
 *   (chave `escrita:<tarefaId>` no livro de XP), 0 nas seguintes. Escrever nunca custa vida.
 * - Checagem automática (sem IA) sempre, decidida aqui e guardada com o texto.
 * - Comentário da Foca IA só no trecho e só no Pro, pelo mesmo caminho do treino por partes (1 mensagem da cota,
 *   moderação, consentimento aos 17, teto global). Free e Basic NUNCA chamam a IA nem a moderação: o texto deles não sai
 *   do servidor do Foca (teste em `tests/unit/servidor/escrita.test.ts`).
 * - Reenviar o mesmo texto da última vez guarda, mas não paga bloco de novo (anti-repetição).
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { COPY } from "@/lib/copy";
import { checagemAutomatica, LIMITES_DA_ESCRITA, XP_DA_TAREFA, type Checagem } from "@/lib/escrita";
import { BLOCOS_PAGOS_POR_DIA, PEROLAS_POR_BLOCO, chavePerola } from "@/lib/perolas";
import { sistemaDaTarefa } from "@/lib/redacao-ia";
import type { JsonObjeto } from "@/lib/json";
import type { NovidadesDoServidor } from "@/lib/sync/contrato";
import { tarefaDeEscrita, TAREFAS_DE_ESCRITA } from "@/content/tarefas-escrita";
import type { Banco } from "../db/client";
import { completion, profile, redacao, xpLedger } from "../db/schema";
import { creditar, movimentosNoDia } from "../economia/perolas";
import { dataNoFuso, marcarDia, pagarXp } from "../estudo/sincronizar";
import { avaliarConquistas, progredirMissoes } from "../gamificacao/missoes";
import { avaliarOfensiva, historicoDoAluno } from "../gamificacao/ofensiva";
import { ErroApp, log } from "../http";
import { alunoTemFuncao, recursoLigado } from "../planos/funcoes";
import { sinalLocalDeAutolesao } from "../tutor/moderacao";
import { moderar } from "../tutor/moderacao";
import { comentarioDaIA, portasDaIA, temChave, type Bloqueio } from "./redacao";

/** Por que não houve comentário da Foca IA num trecho de quem tem o Pro (a tarefa foi enviada mesmo assim). */
export type AvisoDaIA = Bloqueio | "limite" | "recusado" | "autocuidado";

export interface EnvioDeEscrita {
  id: string;
  tarefaId: string;
  texto: string;
  criadaEm: string;
  checagem: Checagem;
  comentarioIa: string | null;
}

export interface ResultadoDaEscrita {
  ok: true;
  envio: EnvioDeEscrita;
  /** XP desta vez: 10 na primeira de cada tarefa, 0 nas seguintes. */
  xp: number;
  /** O envio contou como bloco (não conta quando o texto é igual ao último envio desta tarefa). */
  bloco: boolean;
  /** Só para o Pro, quando o comentário da IA não saiu (motivo para a tela). */
  avisoIa: AvisoDaIA | null;
  /** Texto pronto do aviso de autocuidado, quando é o caso. */
  textoDoAviso: string | null;
  novidades: NovidadesDoServidor;
}

function novidadesVazias(): NovidadesDoServidor {
  return { perolasGanhas: 0, vidasDoCombo: 0, metaCumprida: null, marco: null, perfeitas: 0, conquistas: [], missoesConcluidas: [], desafioDoMes: false };
}

function lerEnvio(l: { id: string; tarefaId: string | null; texto: string; criadaEm: Date; resultado: unknown }): EnvioDeEscrita | null {
  const r = l.resultado as { checagem?: Checagem; comentarioIa?: string | null } | null;
  if (!l.tarefaId || !r?.checagem) return null;
  return { id: l.id, tarefaId: l.tarefaId, texto: l.texto, criadaEm: l.criadaEm.toISOString(), checagem: r.checagem, comentarioIa: r.comentarioIa ?? null };
}

function mesmoTexto(a: string, b: string): boolean {
  return a.replace(/\s+/g, " ").trim() === b.replace(/\s+/g, " ").trim();
}

export async function enviarEscrita(db: Banco, userId: string, entrada: { tarefaId: string; texto: string }, agora: Date): Promise<ResultadoDaEscrita> {
  if (!recursoLigado("escrita")) throw new ErroApp(409, "ESCRITA_DESLIGADA");
  const tarefa = tarefaDeEscrita(entrada.tarefaId);
  if (!tarefa) throw new ErroApp(404, "TAREFA_DESCONHECIDA");
  const texto = entrada.texto.trim();
  const { min, max } = tarefa.exercicio.limites;
  const geral = LIMITES_DA_ESCRITA[tarefa.modo];
  if (texto.length < Math.max(min, geral.min) || texto.length > Math.min(max, geral.max)) throw new ErroApp(400, "TAMANHO");

  const checagem = checagemAutomatica(texto, tarefa.modo, { checaProposta: tarefa.checaProposta });

  // Comentário da Foca IA: só trecho e só Pro (mesma função do treino por partes). Free e Basic nem moderam.
  let comentarioIa: string | null = null;
  let avisoIa: AvisoDaIA | null = null;
  let textoDoAviso: string | null = null;
  if (tarefa.modo === "trecho" && (await alunoTemFuncao(db, userId, "treinoRedacao", agora))) {
    const porta = await portasDaIA(db, userId, agora);
    if (porta) avisoIa = porta;
    else if (!temChave()) avisoIa = "indisponivel";
    else {
      const mod = await moderar({ texto });
      if (mod.autolesao) {
        avisoIa = "autocuidado";
        textoDoAviso = COPY.tutor.autocuidado;
      } else if (mod.sinalizado) avisoIa = "recusado";
      else {
        const r = await comentarioDaIA(db, userId, sistemaDaTarefa(tarefa.exercicio), texto, agora);
        if (!r.ok) avisoIa = r.motivo;
        else if (r.texto) comentarioIa = r.texto;
        else avisoIa = "indisponivel";
      }
    }
  }

  // Autocuidado para todos os planos (revisão L2): o sinal local não usa rede, então o texto de Free e Basic não sai do Foca.
  if (avisoIa !== "autocuidado" && sinalLocalDeAutolesao(texto)) {
    avisoIa = "autocuidado";
    textoDoAviso = COPY.tutor.autocuidado;
  }

  const id = randomUUID();
  const novidades = novidadesVazias();
  let xp = 0;
  let bloco = false;
  await db.transaction(async (tx) => {
    await tx.insert(profile).values({ userId }).onConflictDoNothing();
    const [perfil] = await tx.select({ tz: profile.timezone }).from(profile).where(eq(profile.userId, userId)).for("update");
    const tz = perfil?.tz ?? "America/Sao_Paulo";
    const hoje = dataNoFuso(agora, tz);
    // A tarefa só paga com o nó aberto: a lição que vem antes dela concluída no servidor.
    const [aberta] = await tx
      .select({ k: completion.key })
      .from(completion)
      .where(and(eq(completion.userId, userId), like(completion.key, `licao:redacao:${tarefa.depoisDe}#%`)))
      .limit(1);
    // No máximo 1 bloco por tarefa por dia (alternar dois textos não vira bloco a cada envio).
    const [jaHoje] = await tx
      .select({ id: redacao.id })
      .from(redacao)
      .where(
        and(
          eq(redacao.userId, userId),
          eq(redacao.tipo, "tarefa"),
          eq(redacao.tarefaId, tarefa.id),
          sql`to_char(${redacao.criadaEm} at time zone ${tz}, 'YYYY-MM-DD') = ${hoje}`,
        ),
      )
      .limit(1);
    const [ultimo] = await tx
      .select({ texto: redacao.texto })
      .from(redacao)
      .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "tarefa"), eq(redacao.tarefaId, tarefa.id)))
      .orderBy(desc(redacao.criadaEm))
      .limit(1);
    await tx.insert(redacao).values({
      id,
      userId,
      tipo: "tarefa",
      tarefaId: tarefa.id,
      tema: tarefa.exercicio.tema,
      texto,
      resultado: { checagem, comentarioIa } as unknown as JsonObjeto,
      criadaEm: agora,
    });
    if (!aberta || jaHoje || (ultimo && mesmoTexto(ultimo.texto, texto))) return;
    bloco = true;
    // XP só na primeira vez de cada tarefa: a chave é por tarefa e o livro nunca paga a mesma chave duas vezes.
    const chaveXp = `escrita:${tarefa.id}`;
    const [jaPago] = await tx
      .select({ k: xpLedger.key })
      .from(xpLedger)
      .where(and(eq(xpLedger.userId, userId), eq(xpLedger.key, chaveXp)))
      .limit(1);
    if (!jaPago) {
      await pagarXp(tx, userId, chaveXp, XP_DA_TAREFA, "escrita", hoje);
      xp = XP_DA_TAREFA;
    }
    await marcarDia(tx, userId, hoje);
    const comPerolas = recursoLigado("perolas");
    if (comPerolas && (await movimentosNoDia(tx, userId, "bloco", hoje)) < BLOCOS_PAGOS_POR_DIA) {
      if (await creditar(tx, userId, chavePerola.bloco(`escrita:${id}`), PEROLAS_POR_BLOCO, "bloco", hoje, "escrita")) {
        novidades.perolasGanhas += PEROLAS_POR_BLOCO;
      }
    }
    await progredirMissoes(tx, userId, hoje, [{ tipo: "bloco", flashcards: false }, { tipo: "escrita" }], agora, novidades);
    let melhor: number | null = null;
    if (comPerolas) {
      const ofensiva = await avaliarOfensiva(tx, userId, hoje, agora);
      melhor = ofensiva.melhor;
      if (ofensiva.metaCumprida) {
        novidades.metaCumprida = ofensiva.metaCumprida;
        novidades.perolasGanhas += ofensiva.metaCumprida.perolas;
      }
      if (ofensiva.marco) {
        novidades.marco = ofensiva.marco;
        novidades.perolasGanhas += ofensiva.marco.perolas;
      }
    }
    await avaliarConquistas(tx, userId, hoje, melhor ?? (await historicoDoAluno(tx, userId, agora)).estado.melhorSequencia, novidades);
  });
  log("info", "escrita.enviada", { tarefa: tarefa.id, modo: tarefa.modo, bloco, ia: comentarioIa !== null });
  return {
    ok: true,
    envio: { id, tarefaId: tarefa.id, texto, criadaEm: agora.toISOString(), checagem, comentarioIa },
    xp,
    bloco,
    avisoIa,
    textoDoAviso,
    novidades,
  };
}

export interface MinhasTarefasDeEscrita {
  ligado: boolean;
  tarefas: { tarefaId: string; enviadas: number; ultima: EnvioDeEscrita | null }[];
}

/** Envios do próprio aluno por tarefa: quantas vezes enviou e o último texto (que ainda não foi apagado). */
export async function minhasTarefasDeEscrita(db: Banco, userId: string): Promise<MinhasTarefasDeEscrita> {
  const linhas = await db
    .select({ id: redacao.id, tarefaId: redacao.tarefaId, texto: redacao.texto, criadaEm: redacao.criadaEm, resultado: redacao.resultado })
    .from(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "tarefa")))
    .orderBy(desc(redacao.criadaEm))
    .limit(500);
  const porTarefa = new Map<string, { enviadas: number; ultima: EnvioDeEscrita | null }>();
  for (const l of linhas) {
    if (!l.tarefaId) continue;
    const atual = porTarefa.get(l.tarefaId) ?? { enviadas: 0, ultima: null };
    atual.enviadas += 1;
    if (!atual.ultima && l.texto) atual.ultima = lerEnvio(l);
    porTarefa.set(l.tarefaId, atual);
  }
  return {
    ligado: recursoLigado("escrita"),
    tarefas: TAREFAS_DE_ESCRITA.filter((t) => porTarefa.has(t.id)).map((t) => ({ tarefaId: t.id, ...porTarefa.get(t.id)! })),
  };
}

/**
 * Corretor e treino de redação no servidor (spec 49 §5.9, T-49.9.7 e T-49.9.8; spec 50 §5.10.3–5.10.5). Só Pro,
 * decidido aqui (D49-01).
 *
 * - Corretor (rubrica v2): 10 estimativas por mês (catálogo), reservadas numa transação com o perfil travado; sem
 *   chave da IA, fica indisponível (nunca nota inventada). Desligado fora do ambiente local até a liberação (D50-04,
 *   `CORRETOR_HABILITADO`). Texto com até 7 linhas sai "sem estimativa" antes da IA; "sem estimativa" não conta na
 *   cota, com teto técnico de 15 chamadas por mês; falha de formato ou de tempo tem 1 nova tentativa automática.
 * - Treino por partes: cada parte comentada gasta 1 mensagem da cota da Foca IA; sem chave, comentário automático
 *   (checagem simples), que não gasta cota.
 * - As mesmas portas do tutor: idade/consentimento, Foca IA desligada pelo aluno, moderação, teto global de custo.
 * - O texto fica guardado para o aluno rever e pode ser apagado por ele (privacidade.md, linha "Redação").
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { COPY } from "@/lib/copy";
import { idadePeloAno } from "@/lib/legal";
import { BENEFICIOS } from "@/lib/planos";
import {
  SISTEMA_CORRETOR,
  VERSAO_RUBRICA,
  comentarioLocal,
  lerCorrecao,
  mensagemDoCorretor,
  normalizarCorrecao,
  segundaDaSemana,
  semEstimativaLocal,
  sistemaDoTreino,
  temaDaSemana,
  textoDelimitado,
  type Correcao,
  type ParteDoTreino,
} from "@/lib/redacao-ia";
import type { JsonObjeto } from "@/lib/json";
import type { Banco } from "../db/client";
import { profile, redacao, user } from "../db/schema";
import { env } from "../env";
import { ErroApp, log } from "../http";
import { alunoTemFuncao, funcaoLigada } from "../planos/funcoes";
import { planoDoAluno } from "../planos/plano";
import { custoMicros, devolverMensagem, diaDaCota, registrarCusto, registrarCustoGlobal, reservarMensagem, tetoEstourado } from "../tutor/cota";
import { chamarIA } from "../tutor/ia";
import { moderar } from "../tutor/moderacao";
import { temConsentimento } from "../tutor/responder";

export type Bloqueio = "fechado" | "desligado-servidor" | "consentimento" | "ia-desligada" | "indisponivel";

/** Teto técnico de chamadas do corretor por mês, contando as "sem estimativa" (§5.10.4). */
export const CHAMADAS_DO_CORRETOR_POR_MES = 15;
/** Tentativas por pedido: a primeira e 1 nova automática em falha de formato ou de tempo (§5.10.4). */
const TENTATIVAS_DO_CORRETOR = 2;

/** Início do mês corrente em São Paulo (UTC−3 fixo desde 2019). */
export function inicioDoMes(agora: Date): Date {
  const [a, m] = diaDaCota(agora).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, 1, 3, 0, 0));
}

/** Idade/consentimento e Foca IA desligada pelo aluno: as portas do tutor, valem também para a escrita (Pro). */
export async function portasDaIA(db: Banco, userId: string, agora: Date): Promise<Bloqueio | null> {
  const e = env();
  const [u] = await db.select({ ano: user.birthYear }).from(user).where(eq(user.id, userId)).limit(1);
  const idade = u?.ano ? idadePeloAno(u.ano, agora) : 0;
  if (idade < e.TUTOR_IDADE_SEM_CONSENTIMENTO && !(await temConsentimento(db, userId))) return "consentimento";
  const [p] = await db.select({ desligado: profile.tutorDesligado }).from(profile).where(eq(profile.userId, userId)).limit(1);
  if (p?.desligado) return "ia-desligada";
  return null;
}

export function temChave(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}

/* ------------------------------------------------------------------------- corretor --- */

export interface ResumoCorrecao {
  id: string;
  tema: string;
  criadaEm: string;
  total: number | null;
  semEstimativa: boolean;
}

export interface EstadoDoCorretor {
  bloqueio: Bloqueio | null;
  restantesMes: number;
  historico: ResumoCorrecao[];
}

/** "Sem estimativa" e falha da IA não contam na cota; a reserva em andamento (resultado ainda nulo) conta. Todas contam
 * no teto técnico de chamadas do mês (uma falha forçada não vira chamada ilimitada; revisão L2). */
const contaNaCota = sql`coalesce(${redacao.resultado}->>'situacao', 'estimada') not in ('sem-estimativa', 'falha')`;

async function usadasNoMes(db: Pick<Banco, "select">, userId: string, agora: Date): Promise<{ estimativas: number; chamadas: number }> {
  const [r] = await db
    .select({
      estimativas: sql<number>`count(*) filter (where ${contaNaCota})::int`,
      chamadas: sql<number>`count(*)::int`,
    })
    .from(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "correcao"), gte(redacao.criadaEm, inicioDoMes(agora))));
  return { estimativas: r?.estimativas ?? 0, chamadas: r?.chamadas ?? 0 };
}

function restantes(limite: number, u: { estimativas: number; chamadas: number }): number {
  return Math.max(0, Math.min(limite - u.estimativas, CHAMADAS_DO_CORRETOR_POR_MES - u.chamadas));
}

export async function estadoDoCorretor(db: Banco, userId: string, agora: Date): Promise<EstadoDoCorretor> {
  const linhas = await db
    .select({ id: redacao.id, tema: redacao.tema, criadaEm: redacao.criadaEm, resultado: redacao.resultado })
    .from(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "correcao"), ne(redacao.texto, "")))
    .orderBy(desc(redacao.criadaEm))
    .limit(20);
  const historico = linhas.map((l) => {
    const c = normalizarCorrecao(l.resultado);
    return { id: l.id, tema: l.tema, criadaEm: l.criadaEm.toISOString(), total: c?.total ?? null, semEstimativa: c?.situacao === "sem-estimativa" };
  });
  const plano = await planoDoAluno(db, userId, agora);
  const limite = BENEFICIOS[plano].correcoesRedacaoMes;
  let bloqueio: Bloqueio | null = null;
  if (!(await alunoTemFuncao(db, userId, "corretorRedacao", agora))) {
    bloqueio = funcaoLigada("corretorRedacao") ? "fechado" : "desligado-servidor";
  } else {
    bloqueio = (await portasDaIA(db, userId, agora)) ?? (temChave() ? null : "indisponivel");
  }
  return { bloqueio, restantesMes: restantes(limite, await usadasNoMes(db, userId, agora)), historico };
}

export type ResultadoCorrecao =
  | { ok: true; id: string | null; correcao: Correcao }
  | { ok: false; motivo: Bloqueio | "limite" | "recusado" | "autocuidado" | "falha"; texto?: string };

export async function corrigirRedacao(db: Banco, userId: string, entrada: { tema: string; texto: string }, agora: Date): Promise<ResultadoCorrecao> {
  if (!(await alunoTemFuncao(db, userId, "corretorRedacao", agora))) {
    return { ok: false, motivo: funcaoLigada("corretorRedacao") ? "fechado" : "desligado-servidor" };
  }
  const porta = await portasDaIA(db, userId, agora);
  if (porta) return { ok: false, motivo: porta };
  // Checagem local antes da IA (§5.10.4): até 7 linhas = sem estimativa, sem chamada, sem custo, sem cota.
  const local = semEstimativaLocal(entrada.texto);
  if (local) return { ok: true, id: null, correcao: local };
  if (!temChave()) return { ok: false, motivo: "indisponivel" };
  if (await tetoEstourado(db, diaDaCota(agora), true, env())) return { ok: false, motivo: "indisponivel" };

  const mod = await moderar({ texto: entrada.texto });
  if (mod.autolesao) return { ok: false, motivo: "autocuidado", texto: COPY.tutor.autocuidado };
  if (mod.sinalizado) return { ok: false, motivo: "recusado" };

  // Reserva: a linha nasce sem resultado, dentro da trava do perfil (duas abas não passam do limite do mês).
  const id = randomUUID();
  const limite = BENEFICIOS[await planoDoAluno(db, userId, agora)].correcoesRedacaoMes;
  try {
    await db.transaction(async (tx) => {
      await tx.insert(profile).values({ userId }).onConflictDoNothing();
      await tx.select({ userId: profile.userId }).from(profile).where(eq(profile.userId, userId)).for("update");
      if (restantes(limite, await usadasNoMes(tx, userId, agora)) <= 0) throw new ErroApp(429, "LIMITE_CORRECOES");
      await tx.insert(redacao).values({ id, userId, tipo: "correcao", tema: entrada.tema, texto: entrada.texto, versaoRubrica: VERSAO_RUBRICA, criadaEm: agora });
    });
  } catch (e) {
    if (e instanceof ErroApp && e.codigo === "LIMITE_CORRECOES") return { ok: false, motivo: "limite" };
    throw e;
  }

  const preco = { entrada: env().AI_PRECO_ENTRADA_USD_MTOK, saida: env().AI_PRECO_SAIDA_USD_MTOK };
  let correcao: Correcao | null = null;
  let falha = "desconhecido";
  for (let tentativa = 0; tentativa < TENTATIVAS_DO_CORRETOR && !correcao; tentativa++) {
    const ia = await chamarIA({
      sistema: SISTEMA_CORRETOR,
      mensagens: [{ role: "user", content: mensagemDoCorretor(entrada.tema, entrada.texto) }],
      foto: null,
      maxTokens: 1800,
      timeoutMs: 45_000,
    }).catch(() => null);
    if (ia?.usage) await registrarCustoGlobal(db, agora, custoMicros(ia.usage, preco), true);
    correcao = ia?.texto ? lerCorrecao(ia.texto, entrada.texto) : null;
    if (!correcao) falha = ia?.motivo ?? (ia?.texto ? "formato" : "desconhecido");
  }
  if (!correcao) {
    // Falhou de novo: a vaga de estimativa volta para o mês do aluno ("Sua vaga do mês continua"), mas a chamada conta no
    // teto técnico. O texto não fica guardado.
    await db
      .update(redacao)
      .set({ texto: "", resultado: { situacao: "falha" } as unknown as JsonObjeto })
      .where(and(eq(redacao.id, id), eq(redacao.userId, userId)));
    log("aviso", "redacao.falha_ia", { motivo: falha });
    return { ok: false, motivo: "falha" };
  }
  await db
    .update(redacao)
    .set({ resultado: correcao as unknown as JsonObjeto })
    // Se o aluno apagou o texto enquanto a IA respondia, a correção não é gravada.
    .where(and(eq(redacao.id, id), eq(redacao.userId, userId), ne(redacao.texto, "")));
  log("info", "redacao.correcao", { situacao: correcao.situacao, total: correcao.total });
  return { ok: true, id, correcao };
}

export async function verCorrecao(
  db: Banco,
  userId: string,
  id: string,
): Promise<{ tema: string; texto: string; correcao: Correcao | null; criadaEm: string; avaliacao: "ajudou" | "estranha" | null } | null> {
  const [l] = await db
    .select()
    .from(redacao)
    .where(and(eq(redacao.id, id), eq(redacao.userId, userId), eq(redacao.tipo, "correcao"), ne(redacao.texto, "")))
    .limit(1);
  if (!l) return null;
  return {
    tema: l.tema,
    texto: l.texto,
    correcao: normalizarCorrecao(l.resultado),
    criadaEm: l.criadaEm.toISOString(),
    avaliacao: l.avaliacao === "ajudou" || l.avaliacao === "estranha" ? l.avaliacao : null,
  };
}

/**
 * "Ajudou" / "Achei estranha" (§5.10.5, T-50.11.7): só a escolha, sem texto, numa estimativa do próprio aluno. Pode
 * trocar de ideia (vale a última). `false` = não é uma estimativa deste aluno.
 */
export async function avaliarEstimativa(db: Banco, userId: string, id: string, avaliacao: "ajudou" | "estranha", agora: Date): Promise<boolean> {
  const r = await db
    .update(redacao)
    .set({ avaliacao, avaliadaEm: agora })
    .where(
      and(
        eq(redacao.id, id),
        eq(redacao.userId, userId),
        eq(redacao.tipo, "correcao"),
        ne(redacao.texto, ""),
        sql`${redacao.resultado} is not null`,
        sql`coalesce(${redacao.resultado}->>'situacao', 'estimada') = 'estimada'`,
      ),
    )
    .returning({ id: redacao.id });
  return r.length > 0;
}

/**
 * Apaga um texto do próprio aluno. Correção e tarefa de escrita: tema, texto e resultado somem, mas a linha fica
 * (vazia) para continuar contando — senão apagar e corrigir de novo furaria o limite do mês, e as conquistas e o XP da
 * primeira vez de cada tarefa não dependem do texto. Uma "sem estimativa" apagada continua fora da cota. Parte do
 * treino: a linha sai.
 */
export async function apagarRedacao(db: Banco, userId: string, id: string): Promise<boolean> {
  const doAluno = and(eq(redacao.id, id), eq(redacao.userId, userId));
  const vazia = await db
    .update(redacao)
    .set({
      tema: sql`case when ${redacao.tipo} = 'tarefa' then ${redacao.tema} else '' end`,
      texto: "",
      resultado: sql`case when ${redacao.resultado}->>'situacao' = 'sem-estimativa' then '{"situacao":"sem-estimativa"}'::jsonb else null end`,
    })
    .where(and(doAluno, inArray(redacao.tipo, ["correcao", "tarefa"]), ne(redacao.texto, "")))
    .returning({ id: redacao.id });
  if (vazia.length) return true;
  const r = await db.delete(redacao).where(and(doAluno, eq(redacao.tipo, "treino"))).returning({ id: redacao.id });
  return r.length > 0;
}

/* ---------------------------------------------------------------- treino por partes --- */

export interface ParteFeita {
  id: string;
  parte: ParteDoTreino;
  texto: string;
  comentario: string;
  automatico: boolean;
}

export interface EstadoDoTreino {
  bloqueio: Bloqueio | null;
  tema: string;
  semana: string;
  automatico: boolean;
  partes: ParteFeita[];
}

function lerParte(l: { id: string; texto: string; resultado: unknown }): ParteFeita | null {
  const r = l.resultado as { parte?: ParteDoTreino; comentario?: string; automatico?: boolean } | null;
  if (!r?.parte || !r.comentario) return null;
  return { id: l.id, parte: r.parte, texto: l.texto, comentario: r.comentario, automatico: !!r.automatico };
}

export async function estadoDoTreino(db: Banco, userId: string, agora: Date): Promise<EstadoDoTreino> {
  const hoje = diaDaCota(agora);
  const semana = segundaDaSemana(hoje);
  const tema = temaDaSemana(hoje);
  let bloqueio: Bloqueio | null = null;
  if (!(await alunoTemFuncao(db, userId, "treinoRedacao", agora))) {
    bloqueio = funcaoLigada("treinoRedacao") ? "fechado" : "desligado-servidor";
  } else {
    bloqueio = await portasDaIA(db, userId, agora);
  }
  const desde = new Date(Date.parse(`${semana}T03:00:00Z`));
  const linhas = await db
    .select({ id: redacao.id, texto: redacao.texto, resultado: redacao.resultado })
    .from(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "treino"), eq(redacao.tema, tema), gte(redacao.criadaEm, desde)))
    .orderBy(desc(redacao.criadaEm));
  // A última versão de cada parte vale.
  const porParte = new Map<ParteDoTreino, ParteFeita>();
  for (const l of linhas) {
    const p = lerParte(l);
    if (p && !porParte.has(p.parte)) porParte.set(p.parte, p);
  }
  return { bloqueio, tema, semana, automatico: !temChave(), partes: [...porParte.values()] };
}

export type ResultadoParte =
  | { ok: true; parte: ParteFeita }
  | { ok: false; motivo: Bloqueio | "limite" | "recusado" | "autocuidado"; texto?: string };

/**
 * Comentário da Foca IA num texto curto (treino por partes e trecho de tarefa de escrita): 1 mensagem da cota do dia;
 * falha técnica devolve a mensagem. `null` = não houve comentário da IA (o chamador usa o automático).
 */
export async function comentarioDaIA(
  db: Banco,
  userId: string,
  sistema: string,
  texto: string,
  agora: Date,
): Promise<{ ok: true; texto: string | null } | { ok: false; motivo: "limite" | "indisponivel" }> {
  let pago = true;
  try {
    ({ pago } = await reservarMensagem(db, userId, false, agora, env()));
  } catch (e) {
    if (e instanceof ErroApp && e.codigo === "COTA_ESGOTADA") return { ok: false, motivo: "limite" };
    if (e instanceof ErroApp && e.codigo === "TETO_GLOBAL") return { ok: false, motivo: "indisponivel" };
    throw e;
  }
  const ia = await chamarIA({ sistema, mensagens: [{ role: "user", content: textoDelimitado(texto) }], foto: null }).catch(() => null);
  const preco = { entrada: env().AI_PRECO_ENTRADA_USD_MTOK, saida: env().AI_PRECO_SAIDA_USD_MTOK };
  if (ia?.texto) {
    const usage = ia.usage ?? { entrada: 0, saida: 0 };
    await registrarCusto(db, userId, agora, usage, custoMicros(usage, preco), pago);
    return { ok: true, texto: ia.texto };
  }
  // Falha técnica: devolve a mensagem.
  if (ia?.usage) await registrarCustoGlobal(db, agora, custoMicros(ia.usage, preco), pago);
  await devolverMensagem(db, userId, false, agora);
  return { ok: true, texto: null };
}

export async function comentarParte(db: Banco, userId: string, entrada: { parte: ParteDoTreino; texto: string }, agora: Date): Promise<ResultadoParte> {
  if (!(await alunoTemFuncao(db, userId, "treinoRedacao", agora))) {
    return { ok: false, motivo: funcaoLigada("treinoRedacao") ? "fechado" : "desligado-servidor" };
  }
  const porta = await portasDaIA(db, userId, agora);
  if (porta) return { ok: false, motivo: porta };
  const tema = temaDaSemana(diaDaCota(agora));

  const mod = await moderar({ texto: entrada.texto });
  if (mod.autolesao) return { ok: false, motivo: "autocuidado", texto: COPY.tutor.autocuidado };
  if (mod.sinalizado) return { ok: false, motivo: "recusado" };

  let comentario = comentarioLocal(entrada.parte, entrada.texto);
  let automatico = true;
  if (temChave()) {
    const r = await comentarioDaIA(db, userId, sistemaDoTreino(entrada.parte, tema), entrada.texto, agora);
    if (!r.ok) return { ok: false, motivo: r.motivo };
    if (r.texto) {
      comentario = r.texto;
      automatico = false;
    }
  }
  const id = randomUUID();
  // Reescrever substitui: só a última versão de cada parte do tema fica guardada (menos texto pessoal retido).
  await db
    .delete(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "treino"), eq(redacao.tema, tema), sql`${redacao.resultado}->>'parte' = ${entrada.parte}`));
  await db.insert(redacao).values({
    id,
    userId,
    tipo: "treino",
    tema,
    texto: entrada.texto,
    resultado: { parte: entrada.parte, comentario, automatico },
    criadaEm: agora,
  });
  return { ok: true, parte: { id, parte: entrada.parte, texto: entrada.texto, comentario, automatico } };
}
